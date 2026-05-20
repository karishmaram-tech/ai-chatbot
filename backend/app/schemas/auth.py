"""
schemas/auth.py - Pydantic models for auth request/response data.

Schemas define the SHAPE of data coming in and going out of our API.
Pydantic automatically validates the data and gives clear error messages.
"""

from pydantic import BaseModel, EmailStr, Field
import uuid


class UserRegister(BaseModel):
    '''Data required to create a new account.'''
    email: EmailStr                          # Validates email format automatically
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8)      # Minimum 8 characters


class UserLogin(BaseModel):
    '''Data required to log in.'''
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    '''What we send back about a user - NEVER includes password.'''
    id: uuid.UUID
    email: str
    username: str
    is_active: bool

    model_config = {'from_attributes': True}  # Allows reading from SQLAlchemy model


class TokenResponse(BaseModel):
    '''What we return after successful login.'''
    access_token: str
    token_type: str = 'bearer'
    expires_in: int        # Seconds until token expires
    user: UserResponse


class TokenData(BaseModel):
    '''Data stored inside the JWT token.'''
    user_id: str
    email: str
