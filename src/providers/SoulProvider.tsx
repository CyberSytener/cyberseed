import React, { createContext, useContext, useState } from 'react';

interface SoulContextType {
  ownerId: string;
  soulId: string;
  setOwnerId: (id: string) => void;
  setSoulId: (id: string) => void;
}

const SoulContext = createContext<SoulContextType | undefined>(undefined);

export function SoulProvider({ children }: { children: React.ReactNode }) {
  const [ownerId, setOwnerIdState] = useState(() => localStorage.getItem('cyberseed_owner') || 'dev');
  const [soulId, setSoulIdState] = useState(() => localStorage.getItem('cyberseed_soul') || 'default');

  const setOwnerId = (id: string) => {
    localStorage.setItem('cyberseed_owner', id);
    setOwnerIdState(id);
  };

  const setSoulId = (id: string) => {
    localStorage.setItem('cyberseed_soul', id);
    setSoulIdState(id);
  };

  return (
    <SoulContext.Provider value={{ ownerId, soulId, setOwnerId, setSoulId }}>
      {children}
    </SoulContext.Provider>
  );
}

export function useSoul() {
  const context = useContext(SoulContext);
  if (!context) throw new Error('useSoul must be used within SoulProvider');
  return context;
}