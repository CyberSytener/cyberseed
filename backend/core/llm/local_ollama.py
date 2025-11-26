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
            try:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
            except httpx.ConnectError as e:
                raise ConnectionError(
                    f"Failed to connect to Ollama at {self.base_url}. "
                    "Please ensure Ollama is running and accessible."
                ) from e
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(
                        f"Model '{model}' not found. Please pull the model using: ollama pull {model}"
                    ) from e
                raise RuntimeError(
                    f"Ollama API error (status {e.response.status_code}): {e.response.text}"
                ) from e
            except httpx.TimeoutException as e:
                raise TimeoutError(
                    f"Request to Ollama timed out after {self.timeout} seconds. "
                    "The model may be too large or the server is overloaded."
                ) from e
