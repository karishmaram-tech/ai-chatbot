"""
embeddings.py - Convert text to vectors for semantic search.

What is a vector/embedding?
A vector is a list of numbers that represents the MEANING of text.
Similar meanings = similar numbers = close in vector space.

Example:
'dog' -> [0.2, 0.8, 0.1, ...]
'puppy' -> [0.21, 0.79, 0.11, ...]  <- very close to 'dog'
'car' -> [0.9, 0.1, 0.7, ...]       <- far from 'dog'

We use this to find relevant document chunks for a user question.
"""

import os
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from app.observability.logging import get_logger

logger = get_logger(__name__)

# This model runs locally - no API key needed, completely free!
# It downloads once (~90MB) and caches locally
MODEL_NAME = 'all-MiniLM-L6-v2'

# Global model instance - loaded once at startup
_embedding_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        logger.info('loading_embedding_model', model=MODEL_NAME)
        _embedding_model = SentenceTransformer(MODEL_NAME)
        logger.info('embedding_model_loaded')
    return _embedding_model


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Convert a list of text strings into vectors.
    Returns a 2D numpy array of shape (len(texts), 384).
    384 is the vector dimension for all-MiniLM-L6-v2.
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        batch_size=32,
        normalize_embeddings=True,  # Normalize for cosine similarity
    )
    logger.info('texts_embedded', count=len(texts))
    return embeddings


def embed_query(query: str) -> np.ndarray:
    """
    Convert a single query string into a vector.
    Used at search time.
    """
    model = get_embedding_model()
    embedding = model.encode(
        [query],
        normalize_embeddings=True,
    )
    return embedding
