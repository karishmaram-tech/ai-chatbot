"""
schemas/chat.py - Data shapes for chat requests and responses.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: Optional[uuid.UUID] = None  # None = start new conversation


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    tokens_used: int
    cost_usd: float
    created_at: datetime

    model_config = {'from_attributes': True}


class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    total_tokens: int
    total_cost_usd: float
    created_at: datetime

    model_config = {'from_attributes': True}
