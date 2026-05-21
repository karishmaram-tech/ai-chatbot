from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.postgres import get_db
from app.db.models import User, Conversation, Message
from app.core.auth import get_current_user
from app.observability.logging import get_logger

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])
logger = get_logger(__name__)


@router.get("/usage")
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get usage statistics for the current user."""

    # Total conversations
    conv_result = await db.execute(
        select(func.count(Conversation.id)).where(
            Conversation.user_id == current_user.id
        )
    )
    total_conversations = conv_result.scalar() or 0

    # Total tokens and cost
    cost_result = await db.execute(
        select(
            func.sum(Conversation.total_tokens),
            func.sum(Conversation.total_cost_usd),
        ).where(Conversation.user_id == current_user.id)
    )
    row = cost_result.one()
    total_tokens = int(row[0] or 0)
    total_cost = float(row[1] or 0.0)

    # Total messages
    msg_result = await db.execute(
        select(func.count(Message.id))
        .join(Conversation)
        .where(Conversation.user_id == current_user.id)
    )
    total_messages = msg_result.scalar() or 0

    # Recent conversations with costs
    recent_result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .limit(5)
    )
    recent = recent_result.scalars().all()

    logger.info("usage_stats_retrieved", user_id=str(current_user.id))

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_tokens": total_tokens,
        "total_cost_usd": round(total_cost, 6),
        "estimated_remaining_free_tier": max(0, 1500 - total_conversations),
        "recent_conversations": [
            {
                "id": str(c.id),
                "title": c.title,
                "tokens": c.total_tokens,
                "cost_usd": round(c.total_cost_usd, 6),
                "created_at": c.created_at.isoformat(),
            }
            for c in recent
        ],
    }


@router.get("/health-summary")
async def health_summary(
    current_user: User = Depends(get_current_user),
):
    """Quick health summary for dashboard."""
    return {
        "status": "operational",
        "ai_provider": "Google Gemini",
        "rag_enabled": True,
        "streaming_enabled": True,
        "user": current_user.username,
    }

