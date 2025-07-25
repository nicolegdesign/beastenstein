import type { ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameStateContext } from './GameStateContextDefinition';

interface GameStateProviderProps {
  children: ReactNode;
}

/**
 * GameStateProvider - Provides centralized game state management to the entire app
 * Replaces the need for multiple separate contexts and localStorage operations
 */
function GameStateProvider({ children }: GameStateProviderProps) {
  const gameStateHook = useGameState();

  return (
    <GameStateContext.Provider value={gameStateHook}>
      {children}
    </GameStateContext.Provider>
  );
}

// Named export
export { GameStateProvider };

// Default export for compatibility
export default GameStateProvider;