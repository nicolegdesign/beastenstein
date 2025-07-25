import { useGameStateContext } from './useGameStateContext';
import type { IndividualBeastData } from '../types/game';
import type { BeastPartInventory } from '../types/inventory';
import type { InventoryItem } from '../types/inventory';
import type { GameOptions } from '../types/options';
import type { AdventureProgress } from './useGameState';

/**
 * Legacy support hooks for gradual migration
 * These allow existing components to continue working while we migrate
 */

// Beast data access (replaces beastData state in App.tsx)
export function useBeastData() {
  const { beasts, currentBeastId, addBeast, removeBeast, updateBeast, updateCurrentBeastId } = useGameStateContext();
  return {
    beastData: beasts,
    currentBeastId,
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
    },
    setCurrentBeastId: updateCurrentBeastId
  };
}

// Inventory items access (replaces inventoryItems state in App.tsx)
export function useInventoryItems() {
  const { inventoryItems, updateInventoryItems } = useGameStateContext();
  return {
    inventoryItems,
    setInventoryItems: (updater: (prev: InventoryItem[]) => InventoryItem[]) => {
      updateInventoryItems(updater);
    }
  };
}

// Game options access (replaces gameOptions state in App.tsx)
export function useGameOptions() {
  const { gameOptions, updateGameOptions } = useGameStateContext();
  return {
    gameOptions,
    setGameOptions: (updater: (prev: GameOptions) => GameOptions) => {
      updateGameOptions(updater);
    }
  };
}

// Adventure progress access
export function useAdventureProgress() {
  const { adventureProgress, updateAdventureProgress } = useGameStateContext();
  return {
    adventureProgress,
    setAdventureProgress: (updater: (prev: AdventureProgress) => AdventureProgress) => {
      updateAdventureProgress(updater);
    }
  };
}

// Beast order access (replaces beastOrder state in components)
export function useBeastOrder() {
  const { beastOrder, updateBeastOrder } = useGameStateContext();
  return {
    beastOrder,
    setBeastOrder: updateBeastOrder
  };
}

// Beast part inventory access (replaces InventoryContext usage)
export function useBeastPartInventory() {
  const { beastPartInventory, updateBeastPartInventory } = useGameStateContext();
  
  return {
    inventory: beastPartInventory,
    setInventory: (updater: (prev: BeastPartInventory) => BeastPartInventory) => {
      updateBeastPartInventory(updater);
    }
  };
}


