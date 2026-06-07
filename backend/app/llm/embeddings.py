"""
embeddings.py - Uses Gemini API for embeddings instead of local sentence-transformers.
No heavy ML models loaded into memory. Works on free tier (512MB RAM).
"""
import google.generativeai as genai
from app.config import get_settings
from app.observability.logging import get_logger
from typing import List
import numpy as np

settings = get_settings()
logger = get_logger(__name__)

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIM = 768


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a list of texts using Gemini API."""
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
            # Return zero vector on failure
            embeddings.append([0.0] * EMBEDDING_DIM)
    return embeddings


def embed_query(query: str) -> List[float]:
    """Embed a single query using Gemini API."""
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


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_np = np.array(a)
    b_np = np.array(b)
    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_np, b_np) / (norm_a * norm_b))
