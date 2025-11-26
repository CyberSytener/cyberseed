"""
Pydantic schemas for request and response models.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==================
# Request Models
# ==================

class LoginRequest(BaseModel):
    """Login request payload."""
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")


class ChatRequest(BaseModel):
    """Chat request payload."""
    query: str = Field(..., description="User query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of documents to retrieve")
    max_tokens: int = Field(default=512, ge=1, le=4096, description="Maximum tokens to generate")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Sampling temperature")
    include_sources: bool = Field(default=True, description="Include source documents in response")


class TranscribeRequest(BaseModel):
    """Transcription request payload."""
    file_path: str = Field(..., description="Path to audio file to transcribe")
    model: str = Field(default="small", description="Whisper model size")
    language: str = Field(default="en", description="Language code")


class TrainRequest(BaseModel):
    """RAG training/indexing request payload."""
    include_uploads: bool = Field(default=True, description="Include uploaded files")
    include_transcripts: bool = Field(default=True, description="Include transcript files")


class RefreshTokenRequest(BaseModel):
    """Refresh token request payload."""
    refresh_token: str = Field(..., description="Refresh token")


# ==================
# Response Models
# ==================

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Health status")


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")


class ChatResponse(BaseModel):
    """Chat response with LLM generation."""
    response_text: str = Field(..., description="Generated response text")
    used_docs: List[Dict[str, Any]] = Field(default_factory=list, description="Documents used for context")
    has_knowledge_base: bool = Field(..., description="Whether knowledge base exists")
    total_indexed_documents: int = Field(..., description="Total documents in index")


class TranscribeResponse(BaseModel):
    """Transcription response."""
    text: str = Field(..., description="Transcribed text")
    segments: List[Dict[str, Any]] = Field(default_factory=list, description="Transcription segments")
    text_path: str = Field(..., description="Path to saved transcript file")


class FileInfoResponse(BaseModel):
    """Information about a file."""
    filename: str
    size: int
    created_at: str
    category: str


class UploadResponse(BaseModel):
    """File upload response."""
    files: List[FileInfoResponse] = Field(..., description="Uploaded files")
    count: int = Field(..., description="Number of files uploaded")
    total_size: int = Field(..., description="Total size in bytes")


class FileListResponse(BaseModel):
    """File list response."""
    files: List[FileInfoResponse] = Field(..., description="List of files")
    count: int = Field(..., description="Total number of files")
    total_size: int = Field(..., description="Total size in bytes")


class DeleteResponse(BaseModel):
    """Delete operation response."""
    success: bool = Field(..., description="Whether deletion was successful")
    message: str = Field(..., description="Result message")


class SoulStatus(BaseModel):
    """Status information for a soul."""
    owner_id: str = Field(..., description="Owner identifier")
    soul_id: str = Field(..., description="Soul identifier")
    storage: Dict[str, Any] = Field(..., description="Storage statistics")
    rag: Dict[str, Any] = Field(..., description="RAG index status")


class LLMStatus(BaseModel):
    """LLM service status."""
    available: bool = Field(..., description="Whether LLM is available")
    model: Optional[str] = Field(None, description="Model name")
    phase: str = Field(..., description="Implementation phase")
    message: str = Field(..., description="Status message")


class TranscriptionStatus(BaseModel):
    """Transcription service status."""
    available: bool = Field(..., description="Whether transcription is available")
    model: Optional[str] = Field(None, description="Model name")
    phase: str = Field(..., description="Implementation phase")
    message: str = Field(..., description="Status message")


class SystemStatus(BaseModel):
    """Overall system status."""
    status: str = Field(..., description="Overall status")
    storage: Dict[str, Any] = Field(..., description="Storage status")
    llm: LLMStatus = Field(..., description="LLM status")
    transcription: TranscriptionStatus = Field(..., description="Transcription status")


class TrainResponse(BaseModel):
    """RAG training response."""
    success: bool = Field(..., description="Whether training was successful")
    indexed_documents: int = Field(..., description="Number of documents indexed")
    message: str = Field(..., description="Result message")
