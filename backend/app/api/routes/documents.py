"""
documents.py - Document upload endpoint for RAG.
"""

import os
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.auth import get_current_user
from app.db.models import User
from app.llm.rag import add_document, search_documents
from app.observability.logging import get_logger

router = APIRouter(prefix='/api/v1/documents', tags=['Documents'])
logger = get_logger(__name__)

ALLOWED_TYPES = {'application/pdf', 'text/plain'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post('/upload')
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a PDF or text file to the RAG vector store.
    After uploading, the AI can answer questions about its content.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f'File type {file.content_type} not supported. Use PDF or TXT.',
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail='File too large. Maximum size is 10MB.',
        )

    # Save to temp file and process
    suffix = '.pdf' if file.content_type == 'application/pdf' else '.txt'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        file_type = 'pdf' if suffix == '.pdf' else 'txt'
        stats = add_document(tmp_path, file_type)

        logger.info('document_uploaded',
                    user_id=str(current_user.id),
                    filename=file.filename,
                    chunks=stats['chunks_added'])

        return {
            'message': 'Document uploaded and indexed successfully',
            'filename': file.filename,
            'chunks_indexed': stats['chunks_added'],
            'total_chunks': stats['total_chunks'],
        }
    finally:
        os.unlink(tmp_path)  # Clean up temp file


@router.get('/search')
async def search(
    query: str,
    current_user: User = Depends(get_current_user),
):
    """Search the document store for relevant content."""
    results = search_documents(query, top_k=5)
    return {
        'query': query,
        'results': results,
        'count': len(results),
    }
