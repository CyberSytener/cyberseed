"""
Custom exception classes for the CyberSeed backend.
"""

from fastapi import HTTPException, status


class CyberSeedException(Exception):
    """Base exception for CyberSeed backend."""
    pass


class AuthenticationError(CyberSeedException):
    """Raised when authentication fails."""
    pass


class AuthorizationError(CyberSeedException):
    """Raised when user lacks permission."""
    pass


class StorageError(CyberSeedException):
    """Raised when file storage operations fail."""
    pass


class RAGError(CyberSeedException):
    """Raised when RAG operations fail."""
    pass


class TranscriptionError(CyberSeedException):
    """Raised when transcription operations fail."""
    pass


class LLMError(CyberSeedException):
    """Raised when LLM operations fail."""
    pass


def raise_http_exception(status_code: int, detail: str) -> HTTPException:
    """Helper to raise HTTP exceptions."""
    raise HTTPException(status_code=status_code, detail=detail)


def raise_unauthorized(detail: str = "Could not validate credentials") -> HTTPException:
    """Raise unauthorized HTTP exception."""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def raise_forbidden(detail: str = "Forbidden") -> HTTPException:
    """Raise forbidden HTTP exception."""
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def raise_not_found(detail: str = "Not found") -> HTTPException:
    """Raise not found HTTP exception."""
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def raise_bad_request(detail: str = "Bad request") -> HTTPException:
    """Raise bad request HTTP exception."""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
