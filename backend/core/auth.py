"""
JWT authentication for the CyberSeed backend.
"""

from datetime import datetime, timedelta
from typing import Optional, Literal
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.core.security_config import security_config
from backend.core.exceptions import raise_unauthorized
from backend.core.logging_config import get_logger

logger = get_logger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token security
security_bearer = HTTPBearer()


class TokenData(BaseModel):
    """Data stored in JWT token."""
    user_id: str
    owner_id: str
    role: Literal["owner", "admin"]
    exp: Optional[datetime] = None


class TokenPair(BaseModel):
    """Access and refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


def hash_password(password: str) -> str:
    """
    Hash a password.
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
    
    Returns:
        True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: str,
    owner_id: str,
    role: str = "owner",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User identifier
        owner_id: Owner identifier (for scoped access)
        role: User role (owner, admin)
        expires_delta: Optional custom expiration time
    
    Returns:
        JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=security_config.access_token_expire_minutes)
    
    to_encode = {
        "user_id": user_id,
        "owner_id": owner_id,
        "role": role,
        "exp": expire,
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        security_config.jwt_secret_key,
        algorithm="HS256"
    )
    
    return encoded_jwt


def create_refresh_token(
    user_id: str,
    owner_id: str,
    role: str = "owner"
) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        user_id: User identifier
        owner_id: Owner identifier
        role: User role
    
    Returns:
        JWT refresh token string
    """
    expire = datetime.utcnow() + timedelta(days=security_config.refresh_token_expire_days)
    
    to_encode = {
        "user_id": user_id,
        "owner_id": owner_id,
        "role": role,
        "exp": expire,
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        security_config.jwt_secret_key,
        algorithm="HS256"
    )
    
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        TokenData object
    
    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            security_config.jwt_secret_key,
            algorithms=["HS256"]
        )
        
        user_id: str = payload.get("user_id")
        owner_id: str = payload.get("owner_id")
        role: str = payload.get("role")
        
        if user_id is None or owner_id is None:
            logger.warning("Token missing required fields")
            raise_unauthorized("Invalid token: missing required fields")
        
        return TokenData(
            user_id=user_id,
            owner_id=owner_id,
            role=role,
            exp=datetime.fromtimestamp(payload.get("exp"))
        )
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise_unauthorized(f"Could not validate credentials: {e}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer)
) -> TokenData:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
    
    Returns:
        TokenData object
    
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    token_data = decode_token(token)
    
    # Check if token has expired
    if token_data.exp and token_data.exp < datetime.utcnow():
        logger.warning("Token has expired")
        raise_unauthorized("Token has expired")
    
    return token_data


def verify_dev_credentials(username: str, password: str) -> bool:
    """
    Verify development mode credentials.
    
    Args:
        username: Username
        password: Password
    
    Returns:
        True if credentials are valid in dev mode
    """
    if security_config.is_development:
        # In dev mode, accept "dev" username with "dev" password
        return username == "dev" and password == "dev"
    return False


def create_token_pair(user_id: str, owner_id: str, role: str = "owner") -> TokenPair:
    """
    Create access and refresh token pair.
    
    Args:
        user_id: User identifier
        owner_id: Owner identifier
        role: User role
    
    Returns:
        TokenPair with access and refresh tokens
    """
    access_token = create_access_token(user_id, owner_id, role)
    refresh_token = create_refresh_token(user_id, owner_id, role)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )
