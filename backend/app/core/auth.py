"""
core/auth.py - Authentication business logic.

Handles:
- Password hashing with bcrypt
- JWT token creation and verification
- Getting the current logged-in user
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.db.postgres import get_db
from app.db.models import User
from app.schemas.auth import TokenData
from app.observability.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# bcrypt is the industry standard for password hashing.
# It is intentionally slow to make brute-force attacks hard.
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# HTTPBearer reads the 'Authorization: Bearer <token>' header
security = HTTPBearer()


# ── Password Utilities ────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    '''
    Convert plain text password to a bcrypt hash.
    Example: 'mypassword123' -> '...'
    '''
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    '''
    Check if a plain password matches a stored hash.
    Used during login.
    '''
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token Utilities ───────────────────────────────────────────

def create_access_token(user_id: uuid.UUID, email: str) -> str:
    '''
    Create a signed JWT token containing user information.
    
    The token has 3 parts:
    1. Header: algorithm used
    2. Payload: user data + expiry
    3. Signature: proves the token was created by us
    '''
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)

    payload = {
        'sub': str(user_id),   # 'sub' = subject (standard JWT field)
        'email': email,
        'exp': expire,         # Expiry time
        'iat': datetime.now(timezone.utc),  # Issued at
        'jti': str(uuid.uuid4()),           # Unique token ID
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    logger.info('token_created', user_id=str(user_id), expires=expire.isoformat())
    return token


def decode_token(token: str) -> TokenData:
    '''
    Decode and verify a JWT token.
    Raises HTTPException if token is invalid or expired.
    '''
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Invalid or expired token',
        headers={'WWW-Authenticate': 'Bearer'},
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: str = payload.get('sub')
        email: str = payload.get('email')

        if user_id is None or email is None:
            raise credentials_exception

        return TokenData(user_id=user_id, email=email)

    except JWTError as e:
        logger.warning('token_decode_failed', error=str(e))
        raise credentials_exception


# ── FastAPI Dependencies ──────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    '''
    FastAPI dependency that extracts and validates the current user
    from the JWT token in the request header.

    Usage in any protected route:
        async def my_route(current_user: User = Depends(get_current_user)):
            return {msg: f'Hello {current_user.email}'}
    '''
    token_data = decode_token(credentials.credentials)

    result = await db.execute(
        select(User).where(User.id == uuid.UUID(token_data.user_id))
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Account is disabled',
        )

    logger.info('user_authenticated', user_id=str(user.id), email=user.email)
    return user
