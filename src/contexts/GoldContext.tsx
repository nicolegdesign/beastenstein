import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'beastenstein_gold';

interface GoldContextType {
  gold: number;
  addGold: (amount: number) => void;
  subtractGold: (amount: number) => void;
  setGold: (amount: number) => void;
  hasEnoughGold: (amount: number) => boolean;
}

export const GoldContext = createContext<GoldContextType | undefined>(undefined);

interface GoldProviderProps {
  children: ReactNode;
}

export const GoldProvider: React.FC<GoldProviderProps> = ({ children }) => {
  const [gold, setGoldState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Failed to load gold from localStorage:', error);
      return 0;
    }
  });

  // Save to localStorage whenever gold changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, gold.toString());
    } catch (error) {
      console.error('Failed to save gold to localStorage:', error);
    }
  }, [gold]);

  const addGold = (amount: number) => {
    setGoldState(prev => Math.max(0, prev + amount));
  };

  const subtractGold = (amount: number) => {
    setGoldState(prev => Math.max(0, prev - amount));
  };

  const setGold = (amount: number) => {
    setGoldState(Math.max(0, amount));
  };

  const hasEnoughGold = (amount: number) => {
    return gold >= amount;
  };

  const value: GoldContextType = {
    gold,
    addGold,
    subtractGold,
    setGold,
    hasEnoughGold
  };

  return (
    <GoldContext.Provider value={value}>
      {children}
    </GoldContext.Provider>
  );
};
