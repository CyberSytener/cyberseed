import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import type { SoulStatus } from '../lib/types';
import { api } from '../lib/api';

interface SoulContextType {
  ownerId: string | null;
  soulId: string | null;
  soulStatus: SoulStatus | null;
  isLoading: boolean;
  error: string | null;
  setSoul: (ownerId: string, soulId: string) => void;
  refreshStatus: () => Promise<void>;
}

const SoulContext = createContext<SoulContextType | undefined>(undefined);

export function SoulProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [soulId, setSoulId] = useState<string | null>(null);
  const [soulStatus, setSoulStatus] = useState<SoulStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with default soul when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !ownerId && !soulId) {
      setOwnerId(user.owner_id);
      setSoulId('default-soul');
    }
  }, [isAuthenticated, user, ownerId, soulId]);

  // Fetch soul status when ownerId/soulId changes
  useEffect(() => {
    if (isAuthenticated && ownerId && soulId) {
      refreshStatus();
    }
  }, [isAuthenticated, ownerId, soulId]);

  const refreshStatus = async () => {
    if (!ownerId || !soulId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const status = await api.getSoulStatus(ownerId, soulId);
      setSoulStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch soul status');
    } finally {
      setIsLoading(false);
    }
  };

  const setSoul = (newOwnerId: string, newSoulId: string) => {
    setOwnerId(newOwnerId);
    setSoulId(newSoulId);
  };

  return (
    <SoulContext.Provider
      value={{
        ownerId,
        soulId,
        soulStatus,
        isLoading,
        error,
        setSoul,
        refreshStatus,
      }}
    >
      {children}
    </SoulContext.Provider>
  );
}

export function useSoul() {
  const context = useContext(SoulContext);
  if (!context) throw new Error('useSoul must be used within SoulProvider');
  return context;
}
