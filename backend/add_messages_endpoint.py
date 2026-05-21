content = """
@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    from sqlalchemy import select
    from app.db.models import Message, Conversation

    # Verify conversation belongs to user
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == uuid.UUID(conversation_id),
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == uuid.UUID(conversation_id))
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "tokens_used": m.tokens_used,
            "cost_usd": m.cost_usd,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]
"""

# Append to chat.py
with open("app/api/routes/chat.py", "r") as f:
    existing = f.read()

with open("app/api/routes/chat.py", "w", encoding="utf-8", newline="\n") as f:
    f.write(existing + content)

print("Messages endpoint added!")

