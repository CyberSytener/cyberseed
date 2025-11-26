"""
Lazy Module Loader for CyberSeed Backend
Thread-safe deferred imports to minimize startup time and memory usage.
"""

import importlib
import threading
from typing import Any, Optional, Callable


class LazyModule:
    """
    A lazy-loading module wrapper that defers imports until first access.
    Thread-safe implementation using double-checked locking pattern.
    """
    
    def __init__(self, module_name: str, import_fn: Optional[Callable] = None):
        """
        Initialize a lazy module loader.
        
        Args:
            module_name: Name of the module to import (e.g., 'transformers.AutoModel')
            import_fn: Optional custom import function. If None, uses standard importlib.
        """
        self._module_name = module_name
        self._import_fn = import_fn
        self._module: Optional[Any] = None
        self._lock = threading.Lock()
        self._loaded = False
    
    def _load(self) -> Any:
        """Load the module using double-checked locking pattern."""
        # First check without lock (fast path)
        if self._loaded:
            return self._module
        
        # Acquire lock for initialization
        with self._lock:
            # Second check with lock (prevents race condition)
            if self._loaded:
                return self._module
            
            # Actually load the module
            if self._import_fn:
                self._module = self._import_fn()
            else:
                # Standard import using importlib
                parts = self._module_name.split('.')
                if len(parts) == 1:
                    # Simple module import
                    self._module = importlib.import_module(self._module_name)
                else:
                    # Nested attribute access (e.g., 'os.path')
                    module = importlib.import_module('.'.join(parts[:-1]))
                    self._module = getattr(module, parts[-1])
            
            self._loaded = True
            return self._module
    
    def __getattr__(self, name: str) -> Any:
        """Delegate attribute access to the loaded module."""
        module = self._load()
        return getattr(module, name)
    
    def __call__(self, *args, **kwargs) -> Any:
        """Allow calling the module if it's callable."""
        module = self._load()
        return module(*args, **kwargs)
    
    @property
    def is_loaded(self) -> bool:
        """Check if module has been loaded."""
        return self._loaded


def lazy_import(module_name: str, import_fn: Optional[Callable] = None) -> LazyModule:
    """
    Helper function to create a lazy-loaded module.
    
    Example:
        # Instead of: from transformers import AutoModel
        # Use: AutoModel = lazy_import('transformers.AutoModel')
        
        # Custom import:
        def custom_import():
            from transformers import AutoModel
            return AutoModel
        AutoModel = lazy_import('custom', custom_import)
    
    Args:
        module_name: Name of the module to import
        import_fn: Optional custom import function
    
    Returns:
        LazyModule instance that will load on first access
    """
    return LazyModule(module_name, import_fn)


# Pre-defined lazy modules for common heavy dependencies
# These can be imported and used throughout the codebase

# LLM-related lazy imports
def _import_llm_router():
    """Custom import for LLM router to avoid circular imports."""
    # Placeholder - will be implemented when LLM router exists
    return None

llm_router_lazy = lazy_import('backend.routers.llm', _import_llm_router)


# Embeddings lazy import
def _import_embeddings():
    """Custom import for embeddings model."""
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer
    except ImportError:
        return None

embeddings_lazy = lazy_import('embeddings', _import_embeddings)


# Whisper lazy import
def _import_whisper():
    """Custom import for Whisper transcription."""
    try:
        import whisper
        return whisper
    except ImportError:
        return None

whisper_lazy = lazy_import('whisper', _import_whisper)


# Transformers lazy imports
def _import_transformers():
    """Custom import for transformers library."""
    try:
        import transformers
        return transformers
    except ImportError:
        return None

transformers_lazy = lazy_import('transformers', _import_transformers)


# Example usage in comments:
"""
# In your code, instead of:
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('model-name')

# Use:
from backend.core.lazy_init import embeddings_lazy
model = embeddings_lazy('model-name')  # Only loads on first use

# Or define your own:
from backend.core.lazy_init import lazy_import
MyHeavyModule = lazy_import('my_package.heavy_module')
MyHeavyModule.some_function()  # Loads module here, not at import time
"""
