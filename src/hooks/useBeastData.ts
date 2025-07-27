import { useGameStateContext } from './useGameStateContext';
import type { IndividualBeastData } from '../types/game';

/**
 * Hook for managing beast data - replaces legacy useBeastData from useLegacyState.ts
 * 
 * Provides direct access to beast management functionality through the game state context.
 * This is the new canonical way to access beast data in the application.
 */
export function useBeastData() {
  const { 
    beasts, 
    currentBeastId, 
    addBeast, 
    removeBeast, 
    updateBeast, 
    updateCurrentBeastId 
  } = useGameStateContext();

  return {
    // Current beast state
    beasts,
    currentBeastId,
    
    // Beast management
    addBeast,
    removeBeast,
    updateBeast,
    setCurrentBeastId: updateCurrentBeastId,
    
    // Legacy compatibility - these match the old interface
    beastData: beasts,
    
    // Helper methods
    getBeast: (beastId: string) => beasts[beastId],
    getCurrentBeast: () => beasts[currentBeastId],
    hasBeast: (beastId: string) => beastId in beasts,
    getBeastIds: () => Object.keys(beasts),
    getBeastCount: () => Object.keys(beasts).length,
    
    // Batch operations
    addMultipleBeasts: (beastsToAdd: Record<string, IndividualBeastData>) => {
      Object.entries(beastsToAdd).forEach(([beastId, beastData]) => {
        addBeast(beastId, beastData);
      });
    },
    
    removeMultipleBeasts: (beastIds: string[]) => {
      beastIds.forEach(beastId => {
        removeBeast(beastId);
      });
    },
    
    // Legacy setBeastData method for gradual migration
    setBeastData: (updater: (prev: Record<string, IndividualBeastData>) => Record<string, IndividualBeastData>) => {
      const currentBeasts = beasts;
      const newBeasts = updater(currentBeasts);
      
      // Apply the changes
      Object.keys(newBeasts).forEach(beastId => {
        if (!currentBeasts[beastId]) {
          addBeast(beastId, newBeasts[beastId]);
        } else if (JSON.stringify(currentBeasts[beastId]) !== JSON.stringify(newBeasts[beastId])) {
          updateBeast(beastId, () => newBeasts[beastId]);
        }
      });
      
      // Remove deleted beasts
      Object.keys(currentBeasts).forEach(beastId => {
        if (!newBeasts[beastId]) {
          removeBeast(beastId);
        }
      });
    }
  };
}
