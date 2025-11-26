import { useState, useEffect } from 'react';
import { useModelStore, DEFAULT_MODEL_FALLBACK } from '../stores/modelStore';
import { api } from '../lib/api';
import type { ModelsResponse, ModelConfig } from '../lib/models';

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useModelStore();
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModels()
      .then((data) => {
        setModels(data);
        // If no model is selected yet, use the backend's default
        if (selectedModel === DEFAULT_MODEL_FALLBACK && data.default !== selectedModel) {
          setSelectedModel(data.default);
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load models:', err);
        setError('Failed to load models');
      })
      .finally(() => setLoading(false));
  }, [selectedModel, setSelectedModel]);

  if (loading) return <span className="text-xs text-gray-400">Loading models...</span>;
  if (error) return <span className="text-xs text-red-400">{error}</span>;
  if (!models) return null;

  return (
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="text-sm border rounded px-2 py-1 bg-white"
    >
      {Object.entries(models.models).map(([id, config]: [string, ModelConfig]) => (
        <option key={id} value={id}>
          {config.description}
        </option>
      ))}
    </select>
  );
}
