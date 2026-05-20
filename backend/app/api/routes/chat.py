"""
api/routes/chat.py - Chat with RAG support.
"""

import uuid
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.postgres import get_db
from app.db.models import User, Message, Conversation
from app.core.auth import get_current_user
from app.core.rate_limiter import rate_limit
from app.llm.client import openai_client, calculate_cost
from app.llm.memory import get_conversation_history, get_or_create_conversation
from app.llm.rag import build_rag_context
from app.schemas.chat import ChatRequest, ConversationResponse
from app.config import get_settings
from app.observability.logging import get_logger

router = APIRouter(prefix='/api/v1/chat', tags=['Chat'])
settings = get_settings()
logger = get_logger(__name__)


@router.post('/stream')
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
):
    conversation = await get_or_create_conversation(
        db=db,
        conversation_id=request.conversation_id,
        user_id=current_user.id,
        first_message=request.message,
    )

    history = await get_conversation_history(db, conversation.id)

    # RAG: Find relevant document chunks
    rag_context = build_rag_context(request.message)

    # Inject RAG context into user message if relevant docs found
    user_message_with_context = request.message
    if rag_context:
        user_message_with_context = f'{rag_context}\n\nUser question: {request.message}'
        logger.info('rag_context_injected', query=request.message[:50])

    history.append({'role': 'user', 'content': user_message_with_context})

    # Save original user message (without RAG context)
    user_msg = Message(
        conversation_id=conversation.id,
        role='user',
        content=request.message,
    )
    db.add(user_msg)
    await db.flush()

    async def generate():
        full_response = ''
        total_tokens = 0

        try:
            if settings.llm_provider == 'gemini':
                model = genai.GenerativeModel(
                    model_name=settings.gemini_model,
                    system_instruction=history[0]['content'] if history else '',
                )
                gemini_history = []
                for msg in history[1:-1]:
                    role = 'user' if msg['role'] == 'user' else 'model'
                    gemini_history.append({'role': role, 'parts': [msg['content']]})

                chat = model.start_chat(history=gemini_history)
                response = await chat.send_message_async(
                    user_message_with_context, stream=True
                )
                async for chunk in response:
                    if chunk.text:
                        full_response += chunk.text
                        yield f'data: {json.dumps({"type": "chunk", "content": chunk.text})}\n\n'

                total_tokens = len(full_response) // 4

            else:
                stream = await openai_client.chat.completions.create(
                    model=settings.openai_model,
                    messages=history,
                    max_tokens=settings.openai_max_tokens,
                    temperature=settings.openai_temperature,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        full_response += delta.content
                        yield f'data: {json.dumps({"type": "chunk", "content": delta.content})}\n\n'
                    if chunk.usage:
                        total_tokens = chunk.usage.total_tokens

            cost = calculate_cost(settings.llm_provider, total_tokens, 0)

            ai_message = Message(
                conversation_id=conversation.id,
                role='assistant',
                content=full_response,
                tokens_used=total_tokens,
                cost_usd=cost,
                model=settings.gemini_model if settings.llm_provider == 'gemini' else settings.openai_model,
            )
            db.add(ai_message)
            conversation.total_tokens += total_tokens
            conversation.total_cost_usd += cost
            await db.commit()

            logger.info('chat_completed',
                        user_id=str(current_user.id),
                        total_tokens=total_tokens,
                        rag_used=bool(rag_context))

            yield f'data: {json.dumps({"type": "done", "conversation_id": str(conversation.id), "tokens": total_tokens, "cost_usd": cost, "rag_used": bool(rag_context)})}\n\n'

        except Exception as e:
            logger.error('chat_error', error=str(e))
            yield f'data: {json.dumps({"type": "error", "message": str(e)})}\n\n'

    return StreamingResponse(
        generate(),
        media_type='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'},
    )


@router.get('/conversations', response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()
