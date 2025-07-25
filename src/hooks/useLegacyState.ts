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
  
  // Helper functions from the original useBeastPartInventory hook
  const getPartQuantity = (partId: string): number => {
    return beastPartInventory.parts?.[partId] || 0;
  };

  const getSetQuantity = (setId: string): number => {
    return beastPartInventory.sets?.[setId] || 0;
  };

  const getSoulEssenceQuantity = (soulId: string): number => {
    return beastPartInventory.soulEssences?.[soulId] || 0;
  };

  // Helper functions to work with sets
  const getSetIdFromArmParts = (leftArmId: string, rightArmId: string): string | null => {
    // IDs come in format: "setId-left" and "setId-right"
    // We need to extract the set ID and ensure both parts are from the same set
    const leftBase = leftArmId.replace('-left', '');
    const rightBase = rightArmId.replace('-right', '');
    
    // Check if both parts belong to the same set
    if (leftBase === rightBase) {
      return leftBase; // This should be something like "nightwolf-arms"
    }
    return null;
  };

  const getSetIdFromLegParts = (leftLegId: string, rightLegId: string): string | null => {
    // IDs come in format: "setId-left" and "setId-right"
    // We need to extract the set ID and ensure both parts are from the same set
    const leftBase = leftLegId.replace('-left', '');
    const rightBase = rightLegId.replace('-right', '');
    
    // Check if both parts belong to the same set
    if (leftBase === rightBase) {
      return leftBase; // This should be something like "nightwolf-legs"
    }
    return null;
  };

  const canCreateBeast = (
    headId: string,
    torsoId: string,
    armLeftId: string,
    armRightId: string,
    legLeftId: string,
    legRightId: string,
    soulEssenceId: string,
    wingsId?: string,
    tailId?: string
  ): boolean => {
    // Check individual parts (head, torso)
    const hasHeadAndTorso = getPartQuantity(headId) > 0 && getPartQuantity(torsoId) > 0;
    
    // Check arm set
    const armSetId = getSetIdFromArmParts(armLeftId, armRightId);
    const hasArmSet = armSetId ? getSetQuantity(armSetId) > 0 : false;
    
    // Check leg set
    const legSetId = getSetIdFromLegParts(legLeftId, legRightId);
    const hasLegSet = legSetId ? getSetQuantity(legSetId) > 0 : false;
    
    // Check soul essence
    const hasSoulEssence = getSoulEssenceQuantity(soulEssenceId) > 0;
    
    // Check optional extra limbs (only if provided)
    const hasWings = !wingsId || getPartQuantity(wingsId) > 0;
    const hasTail = !tailId || getPartQuantity(tailId) > 0;
    
    return hasHeadAndTorso && hasArmSet && hasLegSet && hasSoulEssence && hasWings && hasTail;
  };

  const consumePartsForBeast = (
    headId: string,
    torsoId: string,
    armLeftId: string,
    armRightId: string,
    legLeftId: string,
    legRightId: string,
    soulEssenceId: string,
    wingsId?: string,
    tailId?: string
  ): boolean => {
    // Check if we can create the beast first
    if (!canCreateBeast(headId, torsoId, armLeftId, armRightId, legLeftId, legRightId, soulEssenceId, wingsId, tailId)) {
      return false;
    }

    // Determine set IDs
    const armSetId = getSetIdFromArmParts(armLeftId, armRightId);
    const legSetId = getSetIdFromLegParts(legLeftId, legRightId);
    
    if (!armSetId || !legSetId) {
      return false; // Invalid set configuration
    }

    // Consume individual parts and sets in a single state update
    updateBeastPartInventory(prev => {
      const newParts = {
        ...prev.parts,
        [headId]: Math.max(0, (prev.parts[headId] || 0) - 1),
        [torsoId]: Math.max(0, (prev.parts[torsoId] || 0) - 1)
      };

      // Consume extra limbs if provided
      if (wingsId) {
        newParts[wingsId] = Math.max(0, (prev.parts[wingsId] || 0) - 1);
      }
      if (tailId) {
        newParts[tailId] = Math.max(0, (prev.parts[tailId] || 0) - 1);
      }

      return {
        ...prev,
        parts: newParts,
        sets: {
          ...prev.sets,
          [armSetId]: Math.max(0, (prev.sets[armSetId] || 0) - 1),
          [legSetId]: Math.max(0, (prev.sets[legSetId] || 0) - 1)
        },
        soulEssences: {
          ...prev.soulEssences,
          [soulEssenceId]: Math.max(0, (prev.soulEssences[soulEssenceId] || 0) - 1)
        }
      };
    });
    
    return true;
  };

  return {
    inventory: beastPartInventory,
    setInventory: (updater: (prev: BeastPartInventory) => BeastPartInventory) => {
      updateBeastPartInventory(updater);
    },
    getPartQuantity,
    getSetQuantity,
    getSoulEssenceQuantity,
    canCreateBeast,
    consumePartsForBeast
  };
}

// Beast name management (replaces direct localStorage calls)
export function useBeastName() {
  const getBeastName = (beastId: string): string | null => {
    try {
      return localStorage.getItem(`beastName_${beastId}`);
    } catch (error) {
      console.warn(`Failed to load beast name for ${beastId}:`, error);
      return null;
    }
  };

  const setBeastName = (beastId: string, name: string): void => {
    try {
      localStorage.setItem(`beastName_${beastId}`, name);
    } catch (error) {
      console.error(`Failed to save beast name for ${beastId}:`, error);
    }
  };

  return {
    getBeastName,
    setBeastName
  };
}

// Custom beast data management (replaces direct localStorage calls)
export function useCustomBeastData() {
  const getCustomBeastData = (beastId: string): unknown => {
    try {
      const customBeastData = localStorage.getItem(`customBeast_${beastId}`);
      return customBeastData ? JSON.parse(customBeastData) : null;
    } catch (error) {
      console.warn(`Failed to load custom beast data for ${beastId}:`, error);
      return null;
    }
  };

  const setCustomBeastData = (beastId: string, beastData: unknown): void => {
    try {
      localStorage.setItem(`customBeast_${beastId}`, JSON.stringify(beastData));
    } catch (error) {
      console.error(`Failed to save custom beast data for ${beastId}:`, error);
    }
  };

  return {
    getCustomBeastData,
    setCustomBeastData
  };
}
