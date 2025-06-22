import { useState, useEffect } from 'react';
import type { BeastPartInventory } from '../types/inventory';

// Get all part IDs from Mausoleum data
const getAllPartIds = (): string[] => {
  return [
    // Night Wolf parts
    'nightwolf-head', 'nightwolf-torso',
    // Mountain Dragon parts
    'mountaindragon-head', 'mountaindragon-torso',
    // Forest Sprite parts
    'forestsprite-head', 'forestsprite-torso',
    // Shadow Beast parts
    'shadowbeast-head', 'shadowbeast-torso',
    // Thunder Eagle parts
    'thundereagle-head', 'thundereagle-torso',
    // Frost Wolf parts
    'frostwolf-head', 'frostwolf-torso'
  ];
};

const getAllSetIds = (): string[] => {
  return [
    // Arm sets
    'nightwolf-arms', 'mountaindragon-arms',
    // Leg sets  
    'nightwolf-legs', 'mountaindragon-legs'
  ];
};

const getAllSoulEssenceIds = (): string[] => {
  return [
    'dim-soul', 'glowing-soul', 'bright-soul', 'brilliant-soul', 'luminescent-soul'
  ];
};

const createDefaultInventory = (): BeastPartInventory => {
  const partIds = getAllPartIds();
  const setIds = getAllSetIds();
  const soulIds = getAllSoulEssenceIds();
  
  const parts: Record<string, number> = {};
  const sets: Record<string, number> = {};
  const soulEssences: Record<string, number> = {};
  
  // Start with 99 of each individual part (head, torso only)
  partIds.forEach(id => {
    parts[id] = 99;
  });
  
  // Start with 99 of each set (arms, legs)
  setIds.forEach(id => {
    sets[id] = 99;
  });
  
  // Start with 99 of each soul essence
  soulIds.forEach(id => {
    soulEssences[id] = 99;
  });
  
  return { parts, sets, soulEssences };
};

export const useBeastPartInventory = () => {
  const [inventory, setInventory] = useState<BeastPartInventory>(() => {
    // Load from localStorage or create default
    const saved = localStorage.getItem('beastPartInventory');
    if (saved) {
      try {
        const parsedInventory = JSON.parse(saved);
        
        // Migration: ensure inventory has all required properties
        const migratedInventory: BeastPartInventory = {
          parts: parsedInventory.parts || {},
          sets: parsedInventory.sets || {},
          soulEssences: parsedInventory.soulEssences || {}
        };
        
        // If sets is empty, initialize with default values
        if (Object.keys(migratedInventory.sets).length === 0) {
          const defaultInventory = createDefaultInventory();
          migratedInventory.sets = defaultInventory.sets;
        }
        
        return migratedInventory;
      } catch (e) {
        console.warn('Failed to parse beast part inventory from localStorage:', e);
      }
    }
    return createDefaultInventory();
  });

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    localStorage.setItem('beastPartInventory', JSON.stringify(inventory));
  }, [inventory]);

  const getPartQuantity = (partId: string): number => {
    return (inventory.parts && inventory.parts[partId]) || 0;
  };

  const getSetQuantity = (setId: string): number => {
    return (inventory.sets && inventory.sets[setId]) || 0;
  };

  const getSoulEssenceQuantity = (soulId: string): number => {
    return (inventory.soulEssences && inventory.soulEssences[soulId]) || 0;
  };

  const decrementPart = (partId: string): boolean => {
    const currentQuantity = getPartQuantity(partId);
    if (currentQuantity <= 0) {
      return false; // Cannot use part if none available
    }
    
    setInventory(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [partId]: Math.max(0, (prev.parts[partId] || 0) - 1)
      }
    }));
    return true;
  };

  const decrementSet = (setId: string): boolean => {
    const currentQuantity = getSetQuantity(setId);
    if (currentQuantity <= 0) {
      return false; // Cannot use set if none available
    }
    
    setInventory(prev => ({
      ...prev,
      sets: {
        ...prev.sets,
        [setId]: Math.max(0, (prev.sets[setId] || 0) - 1)
      }
    }));
    return true;
  };

  const decrementSoulEssence = (soulId: string): boolean => {
    const currentQuantity = getSoulEssenceQuantity(soulId);
    if (currentQuantity <= 0) {
      return false; // Cannot use soul essence if none available
    }
    
    setInventory(prev => ({
      ...prev,
      soulEssences: {
        ...prev.soulEssences,
        [soulId]: Math.max(0, (prev.soulEssences[soulId] || 0) - 1)
      }
    }));
    return true;
  };

  const canCreateBeast = (
    headId: string,
    torsoId: string,
    armLeftId: string,
    armRightId: string,
    legLeftId: string,
    legRightId: string,
    soulEssenceId: string
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
    
    return hasHeadAndTorso && hasArmSet && hasLegSet && hasSoulEssence;
  };

  const consumePartsForBeast = (
    headId: string,
    torsoId: string,
    armLeftId: string,
    armRightId: string,
    legLeftId: string,
    legRightId: string,
    soulEssenceId: string
  ): boolean => {
    // Check if we can create the beast first
    if (!canCreateBeast(headId, torsoId, armLeftId, armRightId, legLeftId, legRightId, soulEssenceId)) {
      return false;
    }

    // Determine set IDs
    const armSetId = getSetIdFromArmParts(armLeftId, armRightId);
    const legSetId = getSetIdFromLegParts(legLeftId, legRightId);
    
    if (!armSetId || !legSetId) {
      return false; // Invalid set configuration
    }

    // Consume individual parts and sets
    const success = (
      decrementPart(headId) &&
      decrementPart(torsoId) &&
      decrementSet(armSetId) &&
      decrementSet(legSetId) &&
      decrementSoulEssence(soulEssenceId)
    );

    return success;
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

  return {
    inventory,
    getPartQuantity,
    getSetQuantity,
    getSoulEssenceQuantity,
    canCreateBeast,
    consumePartsForBeast
  };
};
