import { useGameStateContext } from './useGameStateContext';
import type { BeastPartInventory } from '../types/inventory';
import type { InventoryItem } from '../types/inventory';
import type { GameOptions } from '../types/options';
import type { AdventureProgress } from './useGameState';

/**
 * Legacy support hooks for gradual migration
 * These allow existing components to continue working while we migrate
 */

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


