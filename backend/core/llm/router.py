from typing import List, Optional
from .model_registry import get_model_config, DEFAULT_MODEL
from .local_ollama import OllamaClient

PROVIDERS = {
    "ollama": OllamaClient
}

async def run_inference(
    prompt: str,
    history: Optional[List[dict]] = None,
    model_id: str = None
) -> str:
    if model_id is None:
        model_id = DEFAULT_MODEL
    
    config = get_model_config(model_id)
    provider = config["provider"]
    
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider: {provider}")
    
    client = PROVIDERS[provider]()
    
    return await client.generate(
        prompt=prompt,
        history=history,
        max_tokens=config.get("max_tokens", 2048),
        temperature=config.get("temperature", 0.7),
        model=config["model_name"]
    )
