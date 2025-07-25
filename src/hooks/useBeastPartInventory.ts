import { useCallback } from 'react';
import { useGameStateContext } from './useGameStateContext';

export const useBeastPartInventory = () => {
  const { beastPartInventory, updateBeastPartInventory } = useGameStateContext();

  const getPartQuantity = useCallback((partId: string): number => {
    return beastPartInventory.parts?.[partId] || 0;
  }, [beastPartInventory.parts]);

  const getSetQuantity = useCallback((setId: string): number => {
    return beastPartInventory.sets?.[setId] || 0;
  }, [beastPartInventory.sets]);

  const getSoulEssenceQuantity = useCallback((soulId: string): number => {
    return beastPartInventory.soulEssences?.[soulId] || 0;
  }, [beastPartInventory.soulEssences]);

  // Helper functions to work with sets
  const getSetIdFromArmParts = useCallback((leftArmId: string, rightArmId: string): string | null => {
    // IDs come in format: "setId-left" and "setId-right"
    // We need to extract the set ID and ensure both parts are from the same set
    const leftBase = leftArmId.replace('-left', '');
    const rightBase = rightArmId.replace('-right', '');
    
    // Check if both parts belong to the same set
    if (leftBase === rightBase) {
      return leftBase; // This should be something like "nightwolf-arms"
    }
    return null;
  }, []);

  const getSetIdFromLegParts = useCallback((leftLegId: string, rightLegId: string): string | null => {
    // IDs come in format: "setId-left" and "setId-right"
    // We need to extract the set ID and ensure both parts are from the same set
    const leftBase = leftLegId.replace('-left', '');
    const rightBase = rightLegId.replace('-right', '');
    
    // Check if both parts belong to the same set
    if (leftBase === rightBase) {
      return leftBase; // This should be something like "nightwolf-legs"
    }
    return null;
  }, []);

  const canCreateBeast = useCallback((
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
  }, [getPartQuantity, getSetQuantity, getSoulEssenceQuantity, getSetIdFromArmParts, getSetIdFromLegParts]);

  const consumePartsForBeast = useCallback((
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
  }, [canCreateBeast, getSetIdFromArmParts, getSetIdFromLegParts, updateBeastPartInventory]);

  return {
    inventory: beastPartInventory,
    getPartQuantity,
    getSetQuantity,
    getSoulEssenceQuantity,
    canCreateBeast,
    consumePartsForBeast
  };
};
