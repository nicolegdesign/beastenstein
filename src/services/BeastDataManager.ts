/**
 * Centralized Beast Data Management System
 * Handles all beast data operations to ensure consistency between experience and level
 */

import { ExperienceManager } from './ExperienceManager';
import type { IndividualBeastData } from '../types/game';

export class BeastDataManager {
  private static readonly BEAST_DATA_KEY = 'beastData';

  /**
   * Get all beast data from localStorage
   */
  static getAllBeastData(): Record<string, IndividualBeastData> {
    try {
      const stored = localStorage.getItem(this.BEAST_DATA_KEY);
      const result = stored ? JSON.parse(stored) : {};
      console.log(`🔧 BeastDataManager.getAllBeastData() returning:`, result);
      console.log(`🔧 localStorage key '${this.BEAST_DATA_KEY}' contains:`, stored ? 'data' : 'null');
      return result;
    } catch (error) {
      console.error('Failed to load beast data:', error);
      return {};
    }
  }

  /**
   * Get specific beast data
   */
  static getBeastData(beastId: string): IndividualBeastData | null {
    const allData = this.getAllBeastData();
    return allData[beastId] || null;
  }

  /**
   * Get current experience for a beast
   */
  static getBeastExperience(beastId: string): number {
    const beastData = this.getBeastData(beastId);
    return beastData?.experience || 0;
  }

  /**
   * Get current level for a beast (calculated from experience)
   */
  static getBeastLevel(beastId: string): number {
    const experience = this.getBeastExperience(beastId);
    return ExperienceManager.getLevelFromExperience(experience);
  }

  /**
   * Get max level for a beast
   */
  static getBeastMaxLevel(beastId: string): number {
    const beastData = this.getBeastData(beastId);
    return beastData?.maxLevel || 5;
  }

  /**
   * Update beast experience and automatically sync the level
   * This is the ONLY method that should be used to update experience
   */
  static updateBeastExperience(beastId: string, newExperience: number): boolean {
    try {
      console.log(`🔧 BeastDataManager.updateBeastExperience called with: ${beastId}, ${newExperience} XP`);
      
      const allData = this.getAllBeastData();
      console.log(`🔧 Current localStorage data:`, allData);
      console.log(`🔧 Looking for beast: ${beastId}`);
      console.log(`🔧 Available beast IDs:`, Object.keys(allData));
      
      if (!allData[beastId]) {
        console.error(`❌ Beast ${beastId} not found in beastData`);
        console.error(`❌ Available beasts:`, Object.keys(allData));
        
        // Check if beast exists in old format
        const oldFormat = localStorage.getItem(`beastData_${beastId}`);
        if (oldFormat) {
          console.log(`🔧 Found beast in old format: beastData_${beastId}`);
          console.log(`🔧 Old format data:`, JSON.parse(oldFormat));
        }
        
        return false;
      }

      console.log(`🔧 Beast found! Current data:`, allData[beastId]);

      // Calculate the new level from experience
      const newLevel = ExperienceManager.getLevelFromExperience(newExperience);
      
      // Update both experience and level atomically
      allData[beastId].experience = newExperience;
      allData[beastId].level = newLevel;
      
      console.log(`🔧 Updated beast data:`, allData[beastId]);
      
      // Save to localStorage
      localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allData));
      
      // Verify the save worked immediately
      const immediateVerification = localStorage.getItem(this.BEAST_DATA_KEY);
      const immediateVerifyData = immediateVerification ? JSON.parse(immediateVerification) : {};
      console.log(`🔧 Immediate verification - beast after save:`, immediateVerifyData[beastId]);
      console.log(`🔧 Full localStorage contents:`, Object.keys(localStorage).filter(k => k.includes('beast')));
      
      // Set up a delayed verification to see if data gets cleared
      setTimeout(() => {
        const delayedVerification = localStorage.getItem(this.BEAST_DATA_KEY);
        if (!delayedVerification) {
          console.error(`❌ CRITICAL: beastData localStorage key was DELETED after save!`);
          console.error(`❌ This means something else is clearing localStorage!`);
        } else {
          const delayedVerifyData = JSON.parse(delayedVerification);
          console.log(`🔧 Delayed verification (1s later) - beast still exists:`, !!delayedVerifyData[beastId]);
          if (!delayedVerifyData[beastId]) {
            console.error(`❌ CRITICAL: Beast ${beastId} was removed from beastData!`);
          }
        }
      }, 1000);
      
      console.log(`🔄 BeastDataManager: Updated ${beastId} to ${newExperience} XP, level ${newLevel}`);
      
      return true;
    } catch (error) {
      console.error('Failed to update beast experience:', error);
      return false;
    }
  }

  /**
   * Save complete beast data
   */
  static saveBeastData(beastId: string, data: IndividualBeastData): boolean {
    try {
      const allData = this.getAllBeastData();
      
      // Ensure level matches experience
      const calculatedLevel = ExperienceManager.getLevelFromExperience(data.experience);
      data.level = calculatedLevel;
      
      allData[beastId] = data;
      localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allData));
      
      return true;
    } catch (error) {
      console.error('Failed to save beast data:', error);
      return false;
    }
  }

  /**
   * Create new beast data
   */
  static createBeastData(beastId: string, data: IndividualBeastData): boolean {
    try {
      const allData = this.getAllBeastData();
      
      // Ensure level matches experience for new beast
      const calculatedLevel = ExperienceManager.getLevelFromExperience(data.experience);
      data.level = calculatedLevel;
      
      allData[beastId] = data;
      localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allData));
      
      console.log(`🆕 BeastDataManager: Created beast ${beastId} with ${data.experience} XP, level ${calculatedLevel}`);
      
      return true;
    } catch (error) {
      console.error('Failed to create beast data:', error);
      return false;
    }
  }

  /**
   * Delete beast data
   */
  static deleteBeastData(beastId: string): boolean {
    try {
      const allData = this.getAllBeastData();
      delete allData[beastId];
      localStorage.setItem(this.BEAST_DATA_KEY, JSON.stringify(allData));
      
      console.log(`🗑️ BeastDataManager: Deleted beast ${beastId}`);
      
      return true;
    } catch (error) {
      console.error('Failed to delete beast data:', error);
      return false;
    }
  }

  /**
   * Get experience data with level info for a beast
   */
  static getBeastExperienceData(beastId: string) {
    const experience = this.getBeastExperience(beastId);
    const maxLevel = this.getBeastMaxLevel(beastId);
    
    return ExperienceManager.getExperienceData(experience, maxLevel);
  }

  /**
   * Add experience to a beast and return level up info
   */
  static addExperience(beastId: string, experienceToAdd: number) {
    console.log(`🎯 BeastDataManager.addExperience called with beastId=${beastId}, experienceToAdd=${experienceToAdd}`);
    
    const currentExperience = this.getBeastExperience(beastId);
    const maxLevel = this.getBeastMaxLevel(beastId);
    
    console.log(`🎯 Current data: experience=${currentExperience}, maxLevel=${maxLevel}`);
    
    // Check if the beast exists in localStorage
    const beastExists = this.getBeastData(beastId);
    if (!beastExists) {
      console.error(`❌ Beast ${beastId} not found in localStorage!`);
      console.log(`🔍 Available beast IDs:`, Object.keys(this.getAllBeastData()));
      // Return a dummy result to prevent crashes
      return {
        oldLevel: 1,
        newLevel: 1,
        leveledUp: false,
        finalExperience: currentExperience,
        experienceOverflow: 0
      };
    }
    
    const result = ExperienceManager.addExperience(currentExperience, experienceToAdd, maxLevel);
    console.log(`🎯 ExperienceManager result:`, result);
    
    // Update the stored experience and level
    const updateSuccess = this.updateBeastExperience(beastId, result.finalExperience);
    console.log(`🎯 Update success: ${updateSuccess}`);
    
    return result;
  }
}
