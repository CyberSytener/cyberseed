from typing import Dict, Any

MODELS: Dict[str, Dict[str, Any]] = {
    "local-llama": {
        "provider": "ollama",
        "model_name": "llama3:8b",
        "max_tokens": 2048,
        "temperature": 0.7,
        "description": "Llama 3 8B (Local via Ollama)"
    },
    "local-mistral": {
        "provider": "ollama", 
        "model_name": "mistral:7b",
        "max_tokens": 2048,
        "temperature": 0.7,
        "description": "Mistral 7B (Local via Ollama)"
    }
}

DEFAULT_MODEL = "local-llama"

def get_model_config(model_id: str) -> Dict[str, Any]:
    if model_id not in MODELS:
        raise ValueError(f"Unknown model: {model_id}. Available: {list(MODELS.keys())}")
    return MODELS[model_id]

def list_models() -> Dict[str, Dict[str, Any]]:
    return MODELS
