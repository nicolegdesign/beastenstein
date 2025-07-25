import { useContext } from 'react';
import { GameStateContext } from '../contexts/GameStateContextDefinition';
import type { GameStateContextType } from '../contexts/GameStateContextDefinition';

/**
 * Hook to access the centralized game state
 * Replaces multiple useContext calls and localStorage operations
 */
export function useGameStateContext(): GameStateContextType {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
}
