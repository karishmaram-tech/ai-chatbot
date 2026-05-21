# backend/app/routers/chat.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.services.ai_service import stream_chat_response
from app.schemas import ChatRequest
import json

router = APIRouter()

@router.post("/api/v1/chat/stream")
async def stream_chat(request: ChatRequest, current_user = Depends(get_current_user)):
    async def event_generator():
        async for chunk in stream_chat_response(request.message, request.session_id, current_user.id):
            data = json.dumps({"chunk": chunk, "done": False})
            yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # critical for nginx
        }
    )