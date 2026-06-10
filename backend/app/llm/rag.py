"""
rag.py - RAG pipeline using Neon PostgreSQL with pgvector.
Uses Gemini API for embeddings. No local ML models.
"""

import os
import json
from pypdf import PdfReader
from app.llm.embeddings import embed_texts, embed_query
from app.observability.logging import get_logger

logger = get_logger(__name__)


def get_db_url() -> str:
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    db_url = db_url.replace("postgres+asyncpg://", "postgresql://")
    return db_url


def get_db_connection():
    import psycopg
    return psycopg.connect(get_db_url())


def ensure_table_exists():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS document_chunks (
                        id SERIAL PRIMARY KEY,
                        content TEXT NOT NULL,
                        embedding vector(768),
                        metadata_json TEXT DEFAULT '{}',
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );
                """)
                conn.commit()
        logger.info("rag_table_ready")
    except Exception as e:
        logger.warning("rag_table_setup_warning", error=str(e))


def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + chr(10)
    return text

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def add_document(file_path: str, file_type: str = "pdf") -> dict:
    ensure_table_exists()
    if file_type == "pdf":
        text = extract_text_from_pdf(file_path)
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    chunks = split_into_chunks(text)
    if not chunks:
        raise ValueError("No text could be extracted from document")
    embeddings = embed_texts(chunks)
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            for chunk, embedding in zip(chunks, embeddings):
                emb_list = embedding if isinstance(embedding, list) else list(embedding)
                cur.execute(
                    "INSERT INTO document_chunks (content, embedding, metadata_json) VALUES (%s, %s::vector, %s);",
                    (chunk, emb_list, json.dumps({"source": os.path.basename(file_path)}))
                )
            conn.commit()
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM document_chunks;")
            total_chunks = cur.fetchone()[0]
    return {"chunks_added": len(chunks), "total_chunks": total_chunks}


def search_documents(query: str, top_k: int = 5) -> list:
    query_embedding = embed_query(query)
    if hasattr(query_embedding, "tolist"):
        query_embedding = query_embedding.tolist()
    results = []
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
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
                    results.append({"content": row[0], "score": float(row[1])})
    except Exception as e:
        logger.error("database_search_failed", error=str(e))
        return []
    return results


def build_rag_context(query: str) -> str:
    try:
        results = search_documents(query)
    except Exception as e:
        logger.warning("rag_context_failed", error=str(e))
        return ""
    if not results:
        return ""
    context_parts = ["Relevant information from uploaded documents:"]
    for i, result in enumerate(results, 1):
        context_parts.append(f"[{i}] {result['content']}")
    return chr(10).join(context_parts)
