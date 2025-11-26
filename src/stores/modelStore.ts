import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default fallback model ID - will be synced with backend's default on first load
export const DEFAULT_MODEL_FALLBACK = 'local-llama';

interface ModelState {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModel: DEFAULT_MODEL_FALLBACK,
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    { name: 'model-storage' }
  )
);
