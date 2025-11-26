import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { HealthResponse, SoulStatus, FileInfo } from '../lib/types';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHealth(): UseApiResult<HealthResponse> {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useSoulStatus(ownerId: string, soulId: string): UseApiResult<SoulStatus> {
  const [data, setData] = useState<SoulStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!ownerId || !soulId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.getSoulStatus(ownerId, soulId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch soul status');
    } finally {
      setLoading(false);
    }
  }, [ownerId, soulId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useFiles(ownerId: string, soulId: string, category?: string): UseApiResult<FileInfo[]> {
  const [data, setData] = useState<FileInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!ownerId || !soulId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.listFiles(ownerId, soulId, category);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [ownerId, soulId, category]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}