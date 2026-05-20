"""
llm/memory.py - Conversation memory management.

When you chat with GPT, it has NO memory by default.
Every message is independent. To give it memory, we must
send the full conversation history with every request.

This file loads previous messages from PostgreSQL and
formats them for the OpenAI API.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Message, Conversation
from app.observability.logging import get_logger
import uuid

logger = get_logger(__name__)

# System prompt - the AI's personality and instructions
SYSTEM_PROMPT = """You are a helpful, knowledgeable AI assistant. 
You provide clear, accurate, and thoughtful responses.
You remember the context of the conversation and refer back to it when relevant.
When you don't know something, you say so honestly.
Keep responses concise but complete."""


async def get_conversation_history(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    max_messages: int = 20,
) -> list[dict]:
    """
    Load the last N messages from a conversation and format
    them as OpenAI message objects.

    We limit to 20 messages to avoid hitting token limits.
    In production you would use a smarter truncation strategy.
    """
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(max_messages)
    )
    messages = result.scalars().all()

    # Reverse so oldest messages come first
    messages = list(reversed(messages))

    # Format for OpenAI API
    formatted = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    for msg in messages:
        formatted.append({'role': msg.role, 'content': msg.content})

    logger.info('conversation_history_loaded',
                conversation_id=str(conversation_id),
                message_count=len(messages))
    return formatted


async def get_or_create_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID | None,
    user_id: uuid.UUID,
    first_message: str,
) -> Conversation:
    """
    Get existing conversation or create a new one.
    Uses first 50 chars of first message as the title.
    """
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conv = result.scalar_one_or_none()
        if conv:
            return conv

    # Create new conversation
    title = first_message[:50] + ('...' if len(first_message) > 50 else '')
    conv = Conversation(user_id=user_id, title=title)
    db.add(conv)
    await db.flush()

    logger.info('conversation_created',
                conversation_id=str(conv.id),
                user_id=str(user_id))
    return conv
