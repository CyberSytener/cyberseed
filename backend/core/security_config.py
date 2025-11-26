"""
Security configuration for the CyberSeed backend.
"""

import os
from typing import List, Literal
from pydantic import BaseModel, Field


class SecurityConfig(BaseModel):
    """Security configuration settings."""
    
    # JWT Configuration
    jwt_secret_key: str = Field(
        default_factory=lambda: os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
    )
    access_token_expire_minutes: int = Field(
        default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    )
    refresh_token_expire_days: int = Field(
        default_factory=lambda: int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    )
    
    # Request Limits
    max_request_size_mb: int = Field(
        default_factory=lambda: int(os.getenv("MAX_REQUEST_SIZE_MB", "100"))
    )
    max_upload_size_mb: int = Field(
        default_factory=lambda: int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))
    )
    rate_limit_per_minute: int = Field(
        default_factory=lambda: int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
    )
    
    # CORS Configuration
    cors_allowed_origins: List[str] = Field(
        default_factory=lambda: os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:1420,http://127.0.0.1:1420"
        ).split(",")
    )
    
    # Environment
    environment: Literal["development", "production"] = Field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development")
    )
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"


# Global security config instance
security_config = SecurityConfig()
