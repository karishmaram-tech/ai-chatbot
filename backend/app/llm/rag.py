"""
rag.py - RAG pipeline: document processing and semantic search via Neon (pgvector).

Steps:
1. Upload PDF -> extract text
2. Split text into chunks (overlapping for context)
3. Embed chunks into vectors
4. Store directly in Neon PostgreSQL using pgvector
5. At query time: embed query, find similar chunks natively in SQL, return them
"""

import os
import json
import psycopg
import numpy as np
from pathlib import Path
from pypdf import PdfReader
from app.llm.embeddings import embed_texts, embed_query
from app.observability.logging import get_logger

logger = get_logger(__name__)

def get_db_connection():
    """Extract connection parameters from .env and return a psycopg connection."""
    # Read the updated .env file manually or look for environment variables
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        # Fallback to reading file directly if environment isn't populated yet
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    
    # Strip drivers prefix if added for async engines (+psycopg or +asyncpg)
    if "postgresql+" in db_url:
        db_url = db_url.split("+", 1)[0] + "://" + db_url.split("://", 1)[1]
        
    return psycopg.connect(db_url)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    logger.info('pdf_text_extracted', path=pdf_path, pages=len(reader.pages))
    return text

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks so context at boundaries isn't lost."""
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

def add_document(file_path: str, file_type: str = 'pdf') -> dict:
    """Process a document, compute vectors, and insert into the Neon database."""
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

    chunks = split_into_chunks(text)
    if not chunks:
        raise ValueError('No text could be extracted from document')

    # Generate embeddings
    embeddings = embed_texts(chunks)

    # Insert into Neon cloud database
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for chunk, embedding in zip(chunks, embeddings):
                # Convert embedding numpy array directly to a list format for pgvector
                embedding_list = embedding.tolist()
                
                cur.execute(
                    """
                    INSERT INTO document_chunks (content, embedding, metadata_json)
                    VALUES (%s, %s::vector, %s);
                    """,
                    (chunk, embedding_list, json.dumps({"source": os.path.basename(file_path)}))
                )
            conn.commit()

    # Query current count total
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM document_chunks;")
            total_chunks = cur.fetchone()[0]

    return {
        'chunks_added': len(chunks),
        'total_chunks': total_chunks,
    }

def search_documents(query: str, top_k: int = 5) -> list[dict]:
    """Find the most relevant document chunks directly inside Neon using cosine similarity."""
    query_embedding = embed_query(query)
    # Ensure it's converted to list format
    if hasattr(query_embedding, "tolist"):
        query_embedding = query_embedding.tolist()

    results = []
    
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # 1 - (embedding <=> %s) calculates cosine similarity natively in Postgres!
                cur.execute(
                    """
                    SELECT content, 1 - (embedding <=> %s::vector) AS similarity
                    FROM document_chunks
                    WHERE 1 - (embedding <=> %s::vector) > 0.3
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s;
                    """,
                    (query_embedding, query_embedding, query_embedding, top_k)
                )
                
                rows = cur.fetchall()
                for row in rows:
                    results.append({
                        'content': row[0],
                        'score': float(row[1]),
                    })
    except Exception as e:
        logger.error('database_search_failed', error=str(e))
        return []

    logger.info('document_search', query=query[:50], results=len(results))
    return results

def build_rag_context(query: str) -> str:
    """Build context string from relevant document chunks for the AI prompt."""
    results = search_documents(query)

    if not results:
        return ''

    context_parts = ['Relevant information from documents:']
    for i, result in enumerate(results, 1):
        context_parts.append('[' + str(i) + '] ' + result['content'])

    return '\n\n'.join(context_parts)
