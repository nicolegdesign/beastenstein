import { useContext } from 'react';
import { GoldContext } from '../contexts/GoldContext';

export const useGold = () => {
  const context = useContext(GoldContext);
  if (context === undefined) {
    throw new Error('useGold must be used within a GoldProvider');
  }
  return context;
};
