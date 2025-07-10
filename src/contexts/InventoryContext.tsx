import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BeastPartInventory } from '../types/inventory';

interface InventoryContextType {
  inventory: BeastPartInventory;
  setInventory: React.Dispatch<React.SetStateAction<BeastPartInventory>>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Helper function to create default inventory
const createDefaultInventory = (): BeastPartInventory => {
  const parts: Record<string, number> = {};
  const sets: Record<string, number> = {};
  const soulEssences: Record<string, number> = {};
  
  // Individual parts (head, torso only)
  const partIds = [
    'nightwolf-head', 'nightwolf-torso',
    'mountaindragon-head', 'mountaindragon-torso',
    'woodenpuppet-head', 'woodenpuppet-torso',
    'forestsprite-head', 'forestsprite-torso',
    'shadowbeast-head', 'shadowbeast-torso',
    'thundereagle-head', 'thundereagle-torso',
    'frostwolf-head', 'frostwolf-torso',
    'nightwolf-extra-tail',
    'mountaindragon-extra-wings',
    'mountaindragon-extra-tail'
  ];
  
  partIds.forEach(id => {
    parts[id] = 0; // Start with 0, will be earned through gameplay
  });
  
  // Give the player some starting parts for initial beast creation
  parts['woodenpuppet-head'] = 1;
  parts['woodenpuppet-torso'] = 1;
  
  // Arm and leg sets
  const setIds = [
    'nightwolf-arms', 'mountaindragon-arms', 'woodenpuppet-arms',
    'nightwolf-legs', 'mountaindragon-legs', 'woodenpuppet-legs'
  ];
  
  setIds.forEach(id => {
    sets[id] = 0; // Start with 0, will be earned through gameplay
  });
  
  // Give the player some starting sets for initial beast creation
  sets['woodenpuppet-arms'] = 1;
  sets['woodenpuppet-legs'] = 1;
  
  // Soul essences - start with realistic values
  const soulIds = [
    'dim-soul', 'glowing-soul', 'bright-soul', 'brilliant-soul', 'luminescent-soul'
  ];
  
  soulIds.forEach(id => {
    soulEssences[id] = 0; // Start with 0, will be earned through gameplay
  });
  
  // Give the player a starting dim soul for their first beast creation
  soulEssences['dim-soul'] = 1;
  
  return { parts, sets, soulEssences };
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within InventoryProvider');
  }
  return context;
};
