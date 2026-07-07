"""
embeddings.py - Uses Gemini API for embeddings.
No local ML models. Works within 512MB free tier RAM.
"""
import google.generativeai as genai
from app.config import get_settings
from app.observability.logging import get_logger
from typing import List

settings = get_settings()
logger = get_logger(__name__)
genai.configure(api_key=settings.gemini_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIM = 768


def embed_texts(texts: List[str]) -> List[List[float]]:
    embeddings = []
    for text in texts:
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document",
            )
            embeddings.append(result["embedding"])
        except Exception as e:
            logger.error("embedding_failed", error=str(e))
            embeddings.append([0.0] * EMBEDDING_DIM)
    return embeddings


def embed_query(query: str) -> List[float]:
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query",
        )
        return result["embedding"]
    except Exception as e:
        logger.error("query_embedding_failed", error=str(e))
        return [0.0] * EMBEDDING_DIM
