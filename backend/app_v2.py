"""
CyberSeed FastAPI Backend Application (v2)
Phase 1: Core structure with JWT auth and scoped storage.
Phase 4: Added lazy loading support for resource optimization.
"""

import os
from pathlib import Path
from typing import List
from datetime import datetime

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.logging_config import get_logger
from backend.core.security_config import security_config
from backend.core.auth import (
    get_current_user,
    verify_dev_credentials,
    create_token_pair,
    decode_token,
    TokenData
)
from backend.core.scoped_storage import ScopedStorage, ScopedPathBuilder
from backend.core.scoped_rag import scoped_rag
from backend.core.async_operations import llm_runner, transcription_runner
from backend.core.exceptions import (
    StorageError,
    RAGError,
    TranscriptionError,
    raise_not_found,
    raise_bad_request
)

# Lazy loading support - when heavy modules are added, import like:
# from backend.core.lazy_init import embeddings_lazy, whisper_lazy
# This minimizes startup time for desktop app

from backend.schemas_v2 import (
    HealthResponse,
    LoginRequest,
    TokenResponse,
    ChatRequest,
    ChatResponse,
    TranscribeRequest,
    TranscribeResponse,
    TrainRequest,
    TrainResponse,
    UploadResponse,
    FileListResponse,
    FileInfoResponse,
    DeleteResponse,
    SoulStatus,
    SystemStatus,
    LLMStatus,
    TranscriptionStatus,
    RefreshTokenRequest
)

# Initialize logger
logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CyberSeed Backend API",
    description="FastAPI backend for CyberSeed with scoped storage and RAG",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=security_config.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize storage
storage = ScopedStorage()

logger.info(f"CyberSeed Backend starting in {security_config.environment} mode")


# ==================
# Health & Status Endpoints
# ==================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")


@app.get("/status", response_model=SystemStatus, tags=["Status"])
async def system_status():
    """Get overall system status."""
    return SystemStatus(
        status="operational",
        storage={
            "available": True,
            "data_dir": str(storage.data_dir),
            "writable": os.access(storage.data_dir, os.W_OK)
        },
        llm=LLMStatus(**llm_runner.check_status()),
        transcription=TranscriptionStatus(**transcription_runner.check_status())
    )


@app.get("/status/llm", response_model=LLMStatus, tags=["Status"])
async def llm_status():
    """Get LLM service status."""
    return LLMStatus(**llm_runner.check_status())


@app.get("/status/soul/{owner_id}/{soul_id}", response_model=SoulStatus, tags=["Status"])
async def soul_status(
    owner_id: str,
    soul_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get status for a specific soul."""
    # Verify user has access to this owner_id
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    storage_stats = storage.get_storage_stats(owner_id, soul_id)
    rag_status = scoped_rag.check_index_status(owner_id, soul_id)
    
    return SoulStatus(
        owner_id=owner_id,
        soul_id=soul_id,
        storage=storage_stats,
        rag=rag_status
    )


# ==================
# Authentication Endpoints
# ==================

@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
async def login(request: LoginRequest):
    """
    Login endpoint for development.
    In dev mode, accepts username=dev, password=dev.
    """
    # Verify credentials
    if not verify_dev_credentials(request.username, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token pair
    # In dev mode, owner_id matches username
    token_pair = create_token_pair(
        user_id=request.username,
        owner_id=request.username,
        role="owner"
    )
    
    logger.info(f"User logged in: {request.username}")
    
    return TokenResponse(
        access_token=token_pair.access_token,
        refresh_token=token_pair.refresh_token,
        token_type=token_pair.token_type
    )


@app.post("/auth/refresh", response_model=TokenResponse, tags=["Auth"])
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    """
    try:
        # Decode refresh token
        token_data = decode_token(request.refresh_token)
        
        # Create new token pair
        token_pair = create_token_pair(
            user_id=token_data.user_id,
            owner_id=token_data.owner_id,
            role=token_data.role
        )
        
        logger.info(f"Token refreshed for user: {token_data.user_id}")
        
        return TokenResponse(
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
            token_type=token_pair.token_type
        )
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


# ==================
# File & Storage Endpoints
# ==================

@app.post("/souls/{owner_id}/{soul_id}/upload", response_model=UploadResponse, tags=["Storage"])
async def upload_files(
    owner_id: str,
    soul_id: str,
    files: List[UploadFile] = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """Upload files to soul storage."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    uploaded_files = []
    total_size = 0
    
    try:
        for file in files:
            # Check file size
            content = await file.read()
            file_size = len(content)
            
            if file_size > security_config.max_upload_size_mb * 1024 * 1024:
                raise_bad_request(f"File {file.filename} exceeds maximum upload size")
            
            # Reset file pointer
            await file.seek(0)
            
            # Save file
            file_info = storage.save_file(
                owner_id=owner_id,
                soul_id=soul_id,
                file_content=file.file,
                filename=file.filename,
                category=ScopedPathBuilder.CATEGORY_UPLOADS
            )
            
            uploaded_files.append(FileInfoResponse(
                filename=file_info.filename,
                size=file_info.size,
                created_at=file_info.created_at.isoformat(),
                category=file_info.category
            ))
            total_size += file_info.size
        
        logger.info(f"Uploaded {len(files)} files for {owner_id}/{soul_id}")
        
        return UploadResponse(
            files=uploaded_files,
            count=len(uploaded_files),
            total_size=total_size
        )
    except StorageError as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


@app.get("/souls/{owner_id}/{soul_id}/files", response_model=FileListResponse, tags=["Storage"])
async def list_files(
    owner_id: str,
    soul_id: str,
    category: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    """List files in soul storage."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    files = storage.list_files(owner_id, soul_id, category)
    
    file_responses = [
        FileInfoResponse(
            filename=f.filename,
            size=f.size,
            created_at=f.created_at.isoformat(),
            category=f.category
        )
        for f in files
    ]
    
    total_size = sum(f.size for f in files)
    
    return FileListResponse(
        files=file_responses,
        count=len(files),
        total_size=total_size
    )


@app.delete("/souls/{owner_id}/{soul_id}/files/{filename}", response_model=DeleteResponse, tags=["Storage"])
async def delete_file(
    owner_id: str,
    soul_id: str,
    filename: str,
    category: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a specific file."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    success = storage.delete_file(owner_id, soul_id, filename, category)
    
    if not success:
        raise_not_found("File not found")
    
    return DeleteResponse(
        success=True,
        message=f"File {filename} deleted successfully"
    )


@app.delete("/souls/{owner_id}/{soul_id}/data", response_model=DeleteResponse, tags=["Storage"])
async def delete_soul_data(
    owner_id: str,
    soul_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete all data for a soul."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    success = storage.delete_soul_data(owner_id, soul_id)
    
    if not success:
        raise_not_found("Soul data not found")
    
    logger.info(f"Deleted all data for soul {owner_id}/{soul_id}")
    
    return DeleteResponse(
        success=True,
        message=f"All data for soul {soul_id} deleted successfully"
    )


@app.delete("/owners/{owner_id}/data", response_model=DeleteResponse, tags=["Storage"])
async def delete_owner_data(
    owner_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete all data for an owner."""
    # Verify access (only the owner or admin can delete)
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    success = storage.delete_owner_data(owner_id)
    
    if not success:
        raise_not_found("Owner data not found")
    
    logger.info(f"Deleted all data for owner {owner_id}")
    
    return DeleteResponse(
        success=True,
        message=f"All data for owner {owner_id} deleted successfully"
    )


# ==================
# Core Endpoints
# ==================

@app.post("/souls/{owner_id}/{soul_id}/transcribe", response_model=TranscribeResponse, tags=["Core"])
async def transcribe_audio(
    owner_id: str,
    soul_id: str,
    request: TranscribeRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Transcribe audio file."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    try:
        # Perform transcription (placeholder in Phase 1)
        result = await transcription_runner.transcribe(
            file_path=request.file_path,
            model=request.model,
            language=request.language
        )
        
        # Save transcript to storage
        transcript_path = storage.path_builder.get_category_path(
            owner_id, soul_id, ScopedPathBuilder.CATEGORY_TRANSCRIPTS
        )
        transcript_path.mkdir(parents=True, exist_ok=True)
        
        # Generate transcript filename
        filename = Path(request.file_path).stem + "_transcript.txt"
        text_path = transcript_path / filename
        
        # Save transcript text
        with open(text_path, "w") as f:
            f.write(result["text"])
        
        logger.info(f"Transcribed audio for {owner_id}/{soul_id}: {request.file_path}")
        
        return TranscribeResponse(
            text=result["text"],
            segments=result["segments"],
            text_path=str(text_path)
        )
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )


@app.post("/souls/{owner_id}/{soul_id}/train", response_model=TrainResponse, tags=["Core"])
async def train_rag(
    owner_id: str,
    soul_id: str,
    request: TrainRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Build or update RAG index for soul."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    try:
        # Build RAG index (placeholder in Phase 1)
        result = await scoped_rag.build_index(
            owner_id=owner_id,
            soul_id=soul_id,
            include_uploads=request.include_uploads,
            include_transcripts=request.include_transcripts
        )
        
        logger.info(f"Built RAG index for {owner_id}/{soul_id}")
        
        return TrainResponse(
            success=result["success"],
            indexed_documents=result["indexed_documents"],
            message=result["message"]
        )
    except Exception as e:
        logger.error(f"RAG training failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG training failed: {str(e)}"
        )


@app.post("/souls/{owner_id}/{soul_id}/chat", response_model=ChatResponse, tags=["Core"])
async def chat(
    owner_id: str,
    soul_id: str,
    request: ChatRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Chat with RAG + LLM."""
    # Verify access
    if current_user.owner_id != owner_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this owner's data"
        )
    
    try:
        # Check if RAG index exists
        rag_status = scoped_rag.check_index_status(owner_id, soul_id)
        has_knowledge_base = rag_status["has_index"]
        
        # Query RAG for relevant documents
        docs = []
        if has_knowledge_base and request.include_sources:
            docs = await scoped_rag.query(
                owner_id=owner_id,
                soul_id=soul_id,
                query=request.query,
                top_k=request.top_k
            )
        
        # Build context from documents
        context = [doc.get("text", "") for doc in docs] if docs else None
        
        # Generate response with LLM (placeholder in Phase 1)
        response_text = await llm_runner.generate(
            prompt=request.query,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            context=context
        )
        
        logger.info(f"Chat response generated for {owner_id}/{soul_id}")
        
        return ChatResponse(
            response_text=response_text,
            used_docs=docs if request.include_sources else [],
            has_knowledge_base=has_knowledge_base,
            total_indexed_documents=rag_status["indexed_documents"]
        )
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}"
        )


# ==================
# Startup/Shutdown Events
# ==================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("CyberSeed Backend started successfully")
    logger.info(f"Environment: {security_config.environment}")
    logger.info(f"Data directory: {storage.data_dir}")
    logger.info(f"CORS origins: {security_config.cors_allowed_origins}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("CyberSeed Backend shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
