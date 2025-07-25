import { createContext } from 'react';
import type { GameState, AdventureProgress } from '../hooks/useGameState';
import type { IndividualBeastData } from '../types/game';
import type { BeastPartInventory } from '../types/inventory';
import type { InventoryItem } from '../types/inventory';
import type { GameOptions } from '../types/options';

// Context type includes all the return values from useGameState
export interface GameStateContextType {
  // State
  gameState: GameState;
  
  // Beast operations
  beasts: Record<string, IndividualBeastData>;
  currentBeastId: string;
  addBeast: (beastId: string, beastData: IndividualBeastData) => void;
  removeBeast: (beastId: string) => void;
  updateBeast: (beastId: string, updater: (beast: IndividualBeastData) => IndividualBeastData) => void;
  updateBeastExperience: (beastId: string, newExperience: number) => void;
  updateCurrentBeastId: (beastId: string) => void;
  
  // Inventory operations
  beastPartInventory: BeastPartInventory;
  inventoryItems: InventoryItem[];
  updateBeastPartInventory: (updater: (inventory: BeastPartInventory) => BeastPartInventory) => void;
  updateInventoryItems: (updater: (items: InventoryItem[]) => InventoryItem[]) => void;
  
  // Settings
  gameOptions: GameOptions;
  updateGameOptions: (updater: (options: GameOptions) => GameOptions) => void;
  
  // Adventure
  adventureProgress: AdventureProgress;
  updateAdventureProgress: (updater: (progress: AdventureProgress) => AdventureProgress) => void;
  
  // Beast order
  beastOrder: string[];
  updateBeastOrder: (order: string[]) => void;
  
  // Beast names
  beastNames: Record<string, string>;
  updateBeastName: (beastId: string, name: string) => void;
  
  // Custom beasts
  customBeasts: Record<string, unknown>;
  updateCustomBeast: (beastId: string, customBeastData: unknown) => void;
  
  // Global flags
  hasPlayedBefore: boolean;
  markHasPlayedBefore: () => void;
  
  // Utilities
  resetGameState: () => void;
}

export const GameStateContext = createContext<GameStateContextType | undefined>(undefined);
