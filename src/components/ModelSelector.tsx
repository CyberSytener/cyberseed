import { useState, useEffect } from 'react';
import { useModelStore } from '../stores/modelStore';
import { api } from '../lib/api';
import type { ModelsResponse } from '../lib/models';

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useModelStore();
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModels()
      .then((data) => {
        setModels(data);
        // If no model is selected yet, use the backend's default
        if (selectedModel === 'local-llama' && data.default !== selectedModel) {
          setSelectedModel(data.default);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedModel, setSelectedModel]);

  if (loading) return <span className="text-xs text-gray-400">Loading models...</span>;
  if (!models) return null;

  return (
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="text-sm border rounded px-2 py-1 bg-white"
    >
      {Object.entries(models.models).map(([id, config]) => (
        <option key={id} value={id}>
          {config.description}
        </option>
      ))}
    </select>
  );
}
