import httpx
from typing import List, Optional
import os
from .base import LLMClient

class OllamaClient(LLMClient):
    """Ollama local LLM provider."""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.timeout = 120.0
    
    async def generate(
        self,
        prompt: str,
        history: Optional[List[dict]] = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        model: str = "llama3:8b"
    ) -> str:
        messages = []
        
        if history:
            for msg in history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature
            }
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
