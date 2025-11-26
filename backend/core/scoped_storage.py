"""
Scoped file storage for the CyberSeed backend.
Files are organized by owner_id and soul_id.
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional, BinaryIO
from dataclasses import dataclass
from datetime import datetime

from backend.core.logging_config import get_logger
from backend.core.exceptions import StorageError

logger = get_logger(__name__)


@dataclass
class FileInfo:
    """Information about a stored file."""
    filename: str
    size: int
    created_at: datetime
    path: str
    category: str


class ScopedPathBuilder:
    """Build scoped file paths based on owner and soul IDs."""
    
    # Category constants
    CATEGORY_UPLOADS = "uploads"
    CATEGORY_TRANSCRIPTS = "transcripts"
    CATEGORY_INDEX = "index"
    
    def __init__(self, data_dir: str = None):
        """
        Initialize path builder.
        
        Args:
            data_dir: Root directory for data storage
        """
        self.data_dir = Path(data_dir or os.getenv("DATA_DIR", "./data"))
    
    def get_soul_path(self, owner_id: str, soul_id: str) -> Path:
        """
        Get the base path for a soul.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
        
        Returns:
            Path to soul directory
        """
        return self.data_dir / owner_id / soul_id
    
    def get_category_path(self, owner_id: str, soul_id: str, category: str) -> Path:
        """
        Get the path for a specific category within a soul.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
            category: Category name (uploads, transcripts, index)
        
        Returns:
            Path to category directory
        """
        return self.get_soul_path(owner_id, soul_id) / category
    
    def get_owner_path(self, owner_id: str) -> Path:
        """
        Get the base path for an owner.
        
        Args:
            owner_id: Owner identifier
        
        Returns:
            Path to owner directory
        """
        return self.data_dir / owner_id
    
    def ensure_paths_exist(self, owner_id: str, soul_id: str) -> None:
        """
        Create all necessary directories for a soul.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
        """
        for category in [self.CATEGORY_UPLOADS, self.CATEGORY_TRANSCRIPTS, self.CATEGORY_INDEX]:
            path = self.get_category_path(owner_id, soul_id, category)
            path.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Ensured path exists: {path}")


class ScopedStorage:
    """Scoped file storage manager."""
    
    def __init__(self, data_dir: str = None):
        """
        Initialize scoped storage.
        
        Args:
            data_dir: Root directory for data storage
        """
        self.path_builder = ScopedPathBuilder(data_dir)
        self.data_dir = self.path_builder.data_dir
        logger.info(f"Initialized ScopedStorage with data_dir: {self.data_dir}")
    
    def save_file(
        self,
        owner_id: str,
        soul_id: str,
        file_content: BinaryIO,
        filename: str,
        category: str
    ) -> FileInfo:
        """
        Save a file to scoped storage.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
            file_content: File content as binary stream
            filename: Name of the file
            category: Category for the file
        
        Returns:
            FileInfo object with file details
        
        Raises:
            StorageError: If file save fails
        """
        try:
            # Ensure paths exist
            self.path_builder.ensure_paths_exist(owner_id, soul_id)
            
            # Get target path
            category_path = self.path_builder.get_category_path(owner_id, soul_id, category)
            file_path = category_path / filename
            
            # Save file
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file_content, f)
            
            # Get file info
            stats = file_path.stat()
            
            logger.info(f"Saved file: {file_path} ({stats.st_size} bytes)")
            
            return FileInfo(
                filename=filename,
                size=stats.st_size,
                created_at=datetime.fromtimestamp(stats.st_ctime),
                path=str(file_path),
                category=category
            )
        except Exception as e:
            logger.error(f"Failed to save file {filename}: {e}")
            raise StorageError(f"Failed to save file: {e}")
    
    def list_files(
        self,
        owner_id: str,
        soul_id: str,
        category: Optional[str] = None
    ) -> List[FileInfo]:
        """
        List files in scoped storage.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
            category: Optional category filter
        
        Returns:
            List of FileInfo objects
        """
        files = []
        
        if category:
            categories = [category]
        else:
            categories = [
                ScopedPathBuilder.CATEGORY_UPLOADS,
                ScopedPathBuilder.CATEGORY_TRANSCRIPTS,
                ScopedPathBuilder.CATEGORY_INDEX,
            ]
        
        for cat in categories:
            category_path = self.path_builder.get_category_path(owner_id, soul_id, cat)
            if not category_path.exists():
                continue
            
            for file_path in category_path.iterdir():
                if file_path.is_file():
                    stats = file_path.stat()
                    files.append(FileInfo(
                        filename=file_path.name,
                        size=stats.st_size,
                        created_at=datetime.fromtimestamp(stats.st_ctime),
                        path=str(file_path),
                        category=cat
                    ))
        
        return files
    
    def delete_file(
        self,
        owner_id: str,
        soul_id: str,
        filename: str,
        category: str
    ) -> bool:
        """
        Delete a specific file.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
            filename: Name of the file to delete
            category: Category of the file
        
        Returns:
            True if file was deleted, False if not found
        """
        file_path = self.path_builder.get_category_path(owner_id, soul_id, category) / filename
        
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted file: {file_path}")
            return True
        
        logger.warning(f"File not found for deletion: {file_path}")
        return False
    
    def delete_soul_data(self, owner_id: str, soul_id: str) -> bool:
        """
        Delete all data for a soul.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
        
        Returns:
            True if data was deleted, False if not found
        """
        soul_path = self.path_builder.get_soul_path(owner_id, soul_id)
        
        if soul_path.exists():
            shutil.rmtree(soul_path)
            logger.info(f"Deleted soul data: {soul_path}")
            return True
        
        logger.warning(f"Soul data not found for deletion: {soul_path}")
        return False
    
    def delete_owner_data(self, owner_id: str) -> bool:
        """
        Delete all data for an owner.
        
        Args:
            owner_id: Owner identifier
        
        Returns:
            True if data was deleted, False if not found
        """
        owner_path = self.path_builder.get_owner_path(owner_id)
        
        if owner_path.exists():
            shutil.rmtree(owner_path)
            logger.info(f"Deleted owner data: {owner_path}")
            return True
        
        logger.warning(f"Owner data not found for deletion: {owner_path}")
        return False
    
    def get_storage_stats(self, owner_id: str, soul_id: str) -> dict:
        """
        Get storage statistics for a soul.
        
        Args:
            owner_id: Owner identifier
            soul_id: Soul identifier
        
        Returns:
            Dictionary with storage statistics
        """
        stats = {
            "uploads": {"count": 0, "total_size": 0},
            "transcripts": {"count": 0, "total_size": 0},
            "index": {"count": 0, "total_size": 0},
        }
        
        for category in [
            ScopedPathBuilder.CATEGORY_UPLOADS,
            ScopedPathBuilder.CATEGORY_TRANSCRIPTS,
            ScopedPathBuilder.CATEGORY_INDEX,
        ]:
            files = self.list_files(owner_id, soul_id, category)
            stats[category] = {
                "count": len(files),
                "total_size": sum(f.size for f in files)
            }
        
        return stats
