"""
rag.py - RAG pipeline: document processing and semantic search.

Steps:
1. Upload PDF -> extract text
2. Split text into chunks (overlapping for context)
3. Embed chunks into vectors
4. Store in FAISS index
5. At query time: embed query, find similar chunks, return them
"""

import os
import json
import faiss
import numpy as np
from pathlib import Path
from pypdf import PdfReader
from app.llm.embeddings import embed_texts, embed_query
from app.observability.logging import get_logger

logger = get_logger(__name__)

# Where we store the FAISS index and document chunks
VECTOR_STORE_DIR = Path('vector_store')
VECTOR_STORE_DIR.mkdir(exist_ok=True)

INDEX_PATH = VECTOR_STORE_DIR / 'faiss.index'
CHUNKS_PATH = VECTOR_STORE_DIR / 'chunks.json'


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    logger.info('pdf_text_extracted', path=pdf_path, pages=len(reader.pages))
    return text


def split_into_chunks(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping chunks.

    Why overlap? So context at chunk boundaries is not lost.
    Example with chunk_size=10, overlap=3:
    'Hello world foo bar baz'
    Chunk 1: 'Hello world foo'
    Chunk 2: 'foo bar baz'      <- 'foo' repeated for context
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = ' '.join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap

    logger.info('text_split', total_words=len(words), chunks=len(chunks))
    return chunks


def load_or_create_index():
    """Load existing FAISS index or create a new empty one."""
    if INDEX_PATH.exists() and CHUNKS_PATH.exists():
        index = faiss.read_index(str(INDEX_PATH))
        with open(CHUNKS_PATH, 'r') as f:
            chunks = json.load(f)
        logger.info('vector_index_loaded', chunks=len(chunks))
        return index, chunks

    # Create new empty index
    # 384 = embedding dimension for all-MiniLM-L6-v2
    # IndexFlatIP = Inner Product (cosine similarity with normalized vectors)
    index = faiss.IndexFlatIP(384)
    chunks = []
    logger.info('vector_index_created')
    return index, chunks


def save_index(index, chunks: list[str]) -> None:
    """Save FAISS index and chunks to disk."""
    faiss.write_index(index, str(INDEX_PATH))
    with open(CHUNKS_PATH, 'w') as f:
        json.dump(chunks, f)
    logger.info('vector_index_saved', chunks=len(chunks))


def add_document(file_path: str, file_type: str = 'pdf') -> dict:
    """
    Process a document and add it to the vector store.

    Returns stats about what was indexed.
    """
    # Extract text
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

    # Split into chunks
    chunks = split_into_chunks(text)

    if not chunks:
        raise ValueError('No text could be extracted from document')

    # Embed chunks
    embeddings = embed_texts(chunks)

    # Load existing index and add new chunks
    index, existing_chunks = load_or_create_index()
    index.add(embeddings.astype(np.float32))
    existing_chunks.extend(chunks)

    # Save updated index
    save_index(index, existing_chunks)

    return {
        'chunks_added': len(chunks),
        'total_chunks': len(existing_chunks),
    }


def search_documents(query: str, top_k: int = 5) -> list[dict]:
    """
    Find the most relevant document chunks for a query.

    Returns top_k chunks with their similarity scores.
    """
    if not INDEX_PATH.exists():
        return []

    index, chunks = load_or_create_index()

    if index.ntotal == 0:
        return []

    # Embed the query
    query_embedding = embed_query(query).astype(np.float32)

    # Search for similar chunks
    # scores = similarity scores, indices = positions in chunks list
    scores, indices = index.search(query_embedding, min(top_k, index.ntotal))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx != -1 and score > 0.3:  # Filter low-relevance results
            results.append({
                'content': chunks[idx],
                'score': float(score),
            })

    logger.info('document_search', query=query[:50], results=len(results))
    return results


def build_rag_context(query: str) -> str:
    """
    Build context string from relevant document chunks.
    This gets injected into the AI prompt.
    """
    results = search_documents(query)

    if not results:
        return ''

    context_parts = ['Relevant information from documents:']
    for i, result in enumerate(results, 1):
        context_parts.append('[' + str(i) + '] ' + result['content'])

    return '\n\n'.join(context_parts)
