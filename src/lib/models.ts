export interface ModelConfig {
  id: string;
  provider: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  description: string;
}

export interface ModelsResponse {
  models: Record<string, ModelConfig>;
  default: string;
}
