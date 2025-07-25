import type { IndividualBeastData } from '../types/game';
import type { EnhancedBeastPart, StatBonus, Ability } from '../types/abilities';
import type { SoulEssence } from '../data/soulEssences';
import type { Personality } from '../data/personalities';
import { createBeastFromTemplate } from '../data/beastTemplates';
import { getSoulStatMultiplier } from '../data/soulEssences';

// Use the same interface as Mausoleum component
export interface CustomBeast {
  name: string;
  gender: 'male' | 'female';
  personality: Personality;
  head: EnhancedBeastPart;
  torso: EnhancedBeastPart;
  armLeft: EnhancedBeastPart;
  armRight: EnhancedBeastPart;
  legLeft: EnhancedBeastPart;
  legRight: EnhancedBeastPart;
  wings?: EnhancedBeastPart;
  tail?: EnhancedBeastPart;
  soulEssence: SoulEssence;
  // Calculated stats and abilities
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

/**
 * BeastManager - Centralized service for beast data management
 * Handles beast creation, deletion, updates, and localStorage persistence
 */
export class BeastManager {
  private static readonly BEAST_DATA_KEY = 'beastData';
  private static readonly MAX_BEASTS = 8;

  /**
   * Load all beast data from localStorage
   */
  static loadBeastData(): Record<string, IndividualBeastData> {
    const customBeastData: Record<string, IndividualBeastData> = {};
    
    // First try to load from consolidated beastData
    const consolidatedData = localStorage.getItem(this.BEAST_DATA_KEY);
    if (consolidatedData) {
      try {
        const allBeastData = JSON.parse(consolidatedData);
        // Filter for custom beasts only
        Object.keys(allBeastData).forEach(beastId => {
          if (beastId.startsWith('custom_')) {
            const beastData = allBeastData[beastId];
            // Migrate old data without createdAt timestamp
            if (!beastData.createdAt) {
              beastData.createdAt = Date.now();
            }
            customBeastData[beastId] = beastData;
          }
        });
      } catch (error) {
        console.warn('Failed to load consolidated beast data:', error);
      }
    } else {
      // Fallback: Load all custom beast data from individual localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('beastData_custom_')) {
          try {
            const beastId = key.replace('beastData_', '');
            const savedData = localStorage.getItem(key);
            if (savedData) {
              const parsed = JSON.parse(savedData);
              // Migrate old data without createdAt timestamp
              if (!parsed.createdAt) {
                parsed.createdAt = Date.now();
              }
              customBeastData[beastId] = parsed;
            }
          } catch (error) {
            console.warn(`Failed to load beast data for ${key}:`, error);
          }
        }
      }
    }

    return customBeastData;
  }

  /**
   * Create default beast for returning users who have no beasts
   */
  static createDefaultBeast(): { beastId: string; beastData: IndividualBeastData } | null {
    const hasPlayed = localStorage.getItem('hasPlayedBefore');
    if (!hasPlayed) return null;

    const defaultBeastId = 'custom_default_nightwolf';
    const now = Date.now();
    
    const defaultBeastData: IndividualBeastData = {
      name: 'Night Wolf',
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 100,
      level: 1,
      age: 0,
      attack: 7,  // Base 6 + 1 from Brave personality
      defense: 6,
      speed: 6,
      magic: 6,
      isResting: false,
      createdAt: now,
      experience: 0,
      maxLevel: 5  // Dim soul max level
    };

    // Save the default beast data using consolidated approach
    this.saveBeastData(defaultBeastId, defaultBeastData);
    
    // Create and save the default custom beast configuration
    const defaultCustomBeast = createBeastFromTemplate('nightwolf', 'Night Wolf');
    if (defaultCustomBeast) {
      localStorage.setItem(`customBeast_${defaultBeastId}`, JSON.stringify(defaultCustomBeast));
    }

    return { beastId: defaultBeastId, beastData: defaultBeastData };
  }

  /**
   * Save beast data to localStorage
   */
  static saveBeastData(beastId: string, data: IndividualBeastData): void {
    try {
      const existingData = localStorage.getItem(this.BEAST_DATA_KEY);
      const allBeastData = existingData ? JSON.parse(existingData) : {};
      
      allBeastData[beastId] = data;
      localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allBeastData));
      
      // Beast data saved successfully
    } catch (error) {
      console.error('Failed to save beast data:', error);
      // Fallback to old method if consolidation fails
      localStorage.setItem(`beastData_${beastId}`, JSON.stringify(data));
    }
  }

  /**
   * Create a new custom beast
   */
  static createCustomBeast(
    customBeast: CustomBeast,
    existingBeastCount: number
  ): { success: boolean; beastId?: string; beastData?: IndividualBeastData; error?: string } {
    // Check if we've reached the maximum beast limit
    if (existingBeastCount >= this.MAX_BEASTS) {
      return {
        success: false,
        error: 'Maximum of 8 beasts allowed! Release a beast to the wild to make room.'
      };
    }
    
    // Create a new custom beast ID
    const customBeastId = `custom_${Date.now()}`;
    const now = Date.now();
    
    // Create new beast data with base stats + personality modifiers + part bonuses
    const baseStats = {
      attack: 6,  // Balanced stats for custom beasts
      defense: 6,
      speed: 6,
      magic: 6,
    };
    
    // Apply personality stat modifiers
    const personalityStats = {
      attack: baseStats.attack + (customBeast.personality.statModifiers.attack || 0),
      defense: baseStats.defense + (customBeast.personality.statModifiers.defense || 0),
      speed: baseStats.speed + (customBeast.personality.statModifiers.speed || 0),
      magic: baseStats.magic + (customBeast.personality.statModifiers.magic || 0),
    };

    // Apply part stat bonuses
    const finalStats = {
      attack: personalityStats.attack + (customBeast.totalStatBonus.attack || 0),
      defense: personalityStats.defense + (customBeast.totalStatBonus.defense || 0),
      speed: personalityStats.speed + (customBeast.totalStatBonus.speed || 0),
      magic: personalityStats.magic + (customBeast.totalStatBonus.magic || 0),
    };
    
    const newBeastData: IndividualBeastData = {
      name: customBeast.name,
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 100 + (customBeast.totalStatBonus.health || 0), // Apply health bonus from parts
      level: 1,
      age: 0,
      attack: finalStats.attack,
      defense: finalStats.defense,
      speed: finalStats.speed,
      magic: finalStats.magic,
      isResting: false,
      createdAt: now,
      experience: 0,
      maxLevel: customBeast.soulEssence.maxLevel
    };

    // Save beast data and custom beast configuration
    this.saveBeastData(customBeastId, newBeastData);
    // Note: Custom beast configuration is now saved by the calling component to centralized state

    return {
      success: true,
      beastId: customBeastId,
      beastData: newBeastData
    };
  }

  /**
   * Delete a beast and clean up all related data
   */
  static deleteBeast(beastId: string): void {
    try {
      // Remove from consolidated beast data
      const existingData = localStorage.getItem(this.BEAST_DATA_KEY);
      if (existingData) {
        const allBeastData = JSON.parse(existingData);
        delete allBeastData[beastId];
        localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allBeastData));
      }
    } catch (error) {
      console.error('Failed to remove beast from consolidated data:', error);
      // Fallback to old method
      localStorage.removeItem(`beastData_${beastId}`);
    }

    // Clean up related data
    localStorage.removeItem(`beastName_${beastId}`);
    
    // If it's a custom beast, also remove the custom beast config
    if (beastId.startsWith('custom_')) {
      localStorage.removeItem(`customBeast_${beastId}`);
    }
  }

  /**
   * Update beast experience in localStorage
   */
  static updateBeastExperience(beastId: string, newExperience: number): boolean {
    try {
      const existingData = localStorage.getItem(this.BEAST_DATA_KEY);
      const allBeastData = existingData ? JSON.parse(existingData) : {};
      
      if (allBeastData[beastId]) {
        allBeastData[beastId].experience = newExperience;
        localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allBeastData));
        
        // Experience updated successfully
        return true;
      } else {
        console.error(`Beast ${beastId} not found in beastData`);
        return false;
      }
    } catch (error) {
      console.error('Failed to update beast experience:', error);
      return false;
    }
  }

  /**
   * Calculate level up stat bonuses based on soul essence
   */
  static calculateLevelUpBonuses(beastId: string, levelsGained: number): {
    statIncrease: number;
    healthIncrease: number;
  } {
    let soulMultiplier = 1; // Default multiplier
    
    try {
      const customBeastData = localStorage.getItem(`customBeast_${beastId}`);
      if (customBeastData) {
        const customBeast = JSON.parse(customBeastData);
        if (customBeast.soulEssence?.id) {
          soulMultiplier = getSoulStatMultiplier(customBeast.soulEssence.id);
        }
      }
    } catch (error) {
      console.error('Failed to get soul multiplier:', error);
    }

    return {
      statIncrease: levelsGained * soulMultiplier, // Base +1 per level, multiplied by soul rarity
      healthIncrease: levelsGained * 10 // +10 health per level (unchanged)
    };
  }

  /**
   * Apply level up bonuses to beast stats
   */
  static applyLevelUpBonuses(
    currentBeastData: IndividualBeastData,
    statIncrease: number,
    healthIncrease: number
  ): IndividualBeastData {
    return {
      ...currentBeastData,
      attack: currentBeastData.attack + statIncrease,
      defense: currentBeastData.defense + statIncrease,
      speed: currentBeastData.speed + statIncrease,
      magic: currentBeastData.magic + statIncrease,
      health: currentBeastData.health + healthIncrease
    };
  }

  /**
   * Get the first available beast ID from a beast data collection
   */
  static getFirstBeastId(beastData: Record<string, IndividualBeastData>): string {
    const beastIds = Object.keys(beastData);
    return beastIds.length > 0 ? beastIds[0] : '';
  }

  /**
   * Get the next available beast ID when switching beasts (after deletion)
   */
  static getNextBeastId(
    beastData: Record<string, IndividualBeastData>,
    excludeBeastId: string
  ): string | null {
    const availableBeasts = Object.keys(beastData).filter(id => id !== excludeBeastId);
    return availableBeasts.length > 0 ? availableBeasts[0] : null;
  }

  /**
   * Validate beast data integrity
   */
  static validateBeastData(beastData: Partial<IndividualBeastData>): boolean {
    const requiredFields = [
      'name', 'hunger', 'happiness', 'energy', 'health', 'level', 'age',
      'attack', 'defense', 'speed', 'magic', 'isResting', 'experience', 'maxLevel'
    ];

    return requiredFields.every(field => field in beastData && beastData[field as keyof IndividualBeastData] !== undefined);
  }

  /**
   * Migrate old beast data format to new format (if needed)
   */
  static migrateBeastData(beastData: Partial<IndividualBeastData> & Record<string, unknown>): IndividualBeastData {
    // Add any missing fields with default values
    const migrated = {
      ...beastData,
      createdAt: beastData.createdAt || Date.now(),
      maxLevel: beastData.maxLevel || 5,
      experience: beastData.experience || 0
    };

    return migrated as IndividualBeastData;
  }
}
