import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { ChatRequest, ChatResponse, UploadResponse, TrainResponse } from '../lib/types';

export function useChat(ownerId: string | null, soulId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (request: ChatRequest): Promise<ChatResponse | null> => {
      if (!ownerId || !soulId) {
        setError('Owner ID and Soul ID are required');
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await api.chat(ownerId, soulId, request);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [ownerId, soulId]
  );

  return { sendMessage, isLoading, error };
}

export function useFileUpload(ownerId: string | null, soulId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadResponse | null> => {
      if (!ownerId || !soulId) {
        setError('Owner ID and Soul ID are required');
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await api.uploadFiles(ownerId, soulId, files);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload files';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [ownerId, soulId]
  );

  return { uploadFiles, isLoading, error };
}

export function useTrainSoul(ownerId: string | null, soulId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trainSoul = useCallback(async (): Promise<TrainResponse | null> => {
    if (!ownerId || !soulId) {
      setError('Owner ID and Soul ID are required');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.trainSoul(ownerId, soulId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to train soul';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, soulId]);

  return { trainSoul, isLoading, error };
}

export function useHealth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getHealth();
      setIsHealthy(response.status === 'ok');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { checkHealth, isHealthy, isLoading, error };
}
