"""
models.py - SQLAlchemy database models.

Each class here = one table in PostgreSQL.
Each class attribute = one column in that table.

Our tables:
- User: stores registered users
- Conversation: groups of messages (one chat session)
- Message: individual chat messages
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Text, Integer, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.postgres import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    '''
    Stores registered users.
    
    Table name: users
    '''
    __tablename__ = 'users'

    # Primary key - UUID is better than integer for production
    # (harder to guess, works across distributed systems)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,      # No two users with same email
        nullable=False,
        index=True,       # Index makes lookups by email fast
    )
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )
    # We NEVER store plain text passwords - always hashed
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # One user can have many conversations
    conversations: Mapped[list['Conversation']] = relationship(back_populates='user')

    def __repr__(self):
        return f'<User {self.email}>'


class Conversation(Base):
    '''
    A conversation is a collection of messages - one chat session.
    
    Table name: conversations
    '''
    __tablename__ = 'conversations'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), default='New Conversation')

    # Foreign key links this conversation to a user
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Token and cost tracking - crucial for production AI apps
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_cost_usd: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user: Mapped['User'] = relationship(back_populates='conversations')
    messages: Mapped[list['Message']] = relationship(back_populates='conversation')

    def __repr__(self):
        return f'<Conversation {self.id}>'


class Message(Base):
    '''
    Individual chat messages within a conversation.
    
    Table name: messages
    '''
    __tablename__ = 'messages'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('conversations.id'),
        nullable=False,
        index=True,
    )

    # 'user' = human message, 'assistant' = AI response, 'system' = instructions
    role: Mapped[str] = mapped_column(String(50), nullable=False)

    # The actual message text
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Token tracking per message
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)

    # Which AI model generated this response
    model: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    conversation: Mapped['Conversation'] = relationship(back_populates='messages')

    def __repr__(self):
        return f'<Message {self.role}: {self.content[:50]}>'
