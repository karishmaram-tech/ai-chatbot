from google.generativeai import GenerativeModel
import google.generativeai as genai
from app.core.config import settings
from app.services.rag_service import retrieve_context
import asyncio

genai.configure(api_key=settings.GEMINI_API_KEY)

async def stream_chat_response(message: str, session_id: str, user_id: int):
    # 1. Retrieve RAG context
    context_docs = await retrieve_context(message)
    context = "\n".join([doc.page_content for doc in context_docs])

    # 2. Build prompt with context
    prompt = f"""You are a helpful assistant. Use the context below to answer.
    
Context:
{context}

User question: {message}

Answer:"""

    # 3. Stream from Gemini
    model = GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt, stream=True)
    
    for chunk in response:
        if chunk.text:
            yield chunk.text
            await asyncio.sleep(0)  # yield control to event loop