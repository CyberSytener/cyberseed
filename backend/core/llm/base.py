from abc import ABC, abstractmethod
from typing import List, Optional

class LLMClient(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        history: Optional[List[dict]] = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        model: str = None
    ) -> str:
        """Generate a response from the LLM."""
        pass
