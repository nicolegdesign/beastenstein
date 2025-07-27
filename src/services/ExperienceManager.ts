/**
 * Centralized Experience Management System
 * Handles all experience-related calculations, leveling, and progression
 */

export interface ExperienceData {
  currentExperience: number;
  currentLevel: number;
  experienceInCurrentLevel: number;
  experienceNeededForCurrentLevel: number;
  experienceNeededForNextLevel: number;
  experienceToNextLevel: number;
  progressPercent: number;
  isAtMaxLevel: boolean;
  maxLevel: number;
}

export interface LevelUpResult {
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
  experienceOverflow: number;
}

export interface ExperienceGainResult extends LevelUpResult {
  oldLevel: number;
  experienceGained: number;
  finalExperience: number;
}

export class ExperienceManager {
  /**
   * Experience formula: Each level requires level * 100 XP to complete
   * Level 1: 0-99 XP (100 XP to complete level 1)
   * Level 2: 100-299 XP (200 XP to complete level 2)  
   * Level 3: 300-599 XP (300 XP to complete level 3)
   * etc.
   */
  private static readonly XP_PER_LEVEL_MULTIPLIER = 100;

  /**
   * Calculate experience needed for a specific level
   */
  static getExperienceNeededForLevel(level: number): number {
    return level * this.XP_PER_LEVEL_MULTIPLIER;
  }

  /**
   * Calculate total experience needed to reach a level from level 1
   */
  static getTotalExperienceForLevel(level: number): number {
    let totalExp = 0;
    for (let i = 1; i < level; i++) {
      totalExp += this.getExperienceNeededForLevel(i);
    }
    return totalExp;
  }

  /**
   * Calculate level from total experience
   */
  static getLevelFromExperience(experience: number): number {
    let level = 1;
    let totalExpUsed = 0;
    
    while (true) {
      const expNeededForCurrentLevel = this.getExperienceNeededForLevel(level);
      if (experience < totalExpUsed + expNeededForCurrentLevel) {
        break; // Current experience falls within this level
      }
      totalExpUsed += expNeededForCurrentLevel;
      level++;
    }
    
    return level;
  }

  /**
   * Get comprehensive experience data for a beast
   */
  static getExperienceData(
    currentExperience: number,
    maxLevel: number = 50
  ): ExperienceData {
    const currentLevel = this.getLevelFromExperience(currentExperience);
    const isAtMaxLevel = currentLevel >= maxLevel;
    
    // Calculate experience within current level
    const totalExpForPreviousLevels = this.getTotalExperienceForLevel(currentLevel);
    const experienceInCurrentLevel = currentExperience - totalExpForPreviousLevels;
    
    // Experience requirements
    const experienceNeededForCurrentLevel = this.getExperienceNeededForLevel(currentLevel);
    const experienceNeededForNextLevel = isAtMaxLevel 
      ? experienceNeededForCurrentLevel 
      : this.getExperienceNeededForLevel(currentLevel + 1);
    
    const experienceToNextLevel = isAtMaxLevel 
      ? 0 
      : experienceNeededForCurrentLevel - experienceInCurrentLevel;
    
    const progressPercent = isAtMaxLevel 
      ? 100 
      : (experienceInCurrentLevel / experienceNeededForCurrentLevel) * 100;

    return {
      currentExperience,
      currentLevel,
      experienceInCurrentLevel,
      experienceNeededForCurrentLevel,
      experienceNeededForNextLevel,
      experienceToNextLevel,
      progressPercent,
      isAtMaxLevel,
      maxLevel
    };
  }

  /**
   * Calculate level up result when adding experience
   */
  static calculateLevelUp(
    currentExperience: number,
    experienceToAdd: number,
    maxLevel: number = 50
  ): LevelUpResult {
    const startLevel = this.getLevelFromExperience(currentExperience);
    const finalExperience = currentExperience + experienceToAdd;
    const finalLevel = Math.min(this.getLevelFromExperience(finalExperience), maxLevel);
    
    const leveledUp = finalLevel > startLevel;
    const levelsGained = finalLevel - startLevel;
    
    // Calculate experience overflow (experience beyond max level)
    let experienceOverflow = 0;
    if (finalLevel >= maxLevel) {
      const maxLevelTotalExp = this.getTotalExperienceForLevel(maxLevel);
      const maxLevelCurrentLevelExp = this.getExperienceNeededForLevel(maxLevel);
      const maxTotalExperience = maxLevelTotalExp + maxLevelCurrentLevelExp;
      
      if (finalExperience > maxTotalExperience) {
        experienceOverflow = finalExperience - maxTotalExperience;
      }
    }

    return {
      newLevel: finalLevel,
      leveledUp,
      levelsGained,
      experienceOverflow
    };
  }

  /**
   * Add experience to a beast and get comprehensive result
   */
  static addExperience(
    currentExperience: number,
    experienceToAdd: number,
    maxLevel: number = 50
  ): ExperienceGainResult {
    const oldLevel = this.getLevelFromExperience(currentExperience);
    const levelUpResult = this.calculateLevelUp(currentExperience, experienceToAdd, maxLevel);
    
    // Cap final experience at max level
    let finalExperience = currentExperience + experienceToAdd;
    if (levelUpResult.experienceOverflow > 0) {
      finalExperience -= levelUpResult.experienceOverflow;
    }

    return {
      ...levelUpResult,
      oldLevel,
      experienceGained: experienceToAdd,
      finalExperience
    };
  }

  /**
   * Calculate experience gained from activities
   */
  static calculateActivityExperience(activityType: 'feeding' | 'playing' | 'traveling' | 'battle'): number {
    const experienceTable = {
      feeding: 10,
      playing: 15,
      traveling: 5,
      battle: 50 // Base battle experience, should be multiplied by opponent level
    };
    
    return experienceTable[activityType];
  }

  /**
   * Calculate battle experience based on opponent level
   */
  static calculateBattleExperience(opponentLevel: number): number {
    return opponentLevel * this.calculateActivityExperience('battle');
  }

  /**
   * Calculate experience distribution among team members
   */
  static distributeBattleExperience(
    totalExperience: number,
    teamSize: number
  ): number {
    return Math.floor(totalExperience / teamSize);
  }

  /**
   * Format experience for display
   */
  static formatExperienceDisplay(experienceData: ExperienceData): {
    current: string;
    progress: string;
    toNext: string;
  } {
    if (experienceData.isAtMaxLevel) {
      return {
        current: 'MAX LEVEL',
        progress: 'MAX LEVEL',
        toNext: 'MAX LEVEL'
      };
    }

    return {
      current: `${experienceData.experienceInCurrentLevel}/${experienceData.experienceNeededForCurrentLevel} EXP`,
      progress: `${Math.round(experienceData.progressPercent)}%`,
      toNext: `${experienceData.experienceToNextLevel} to next level`
    };
  }

  /**
   * Create an experience bar data object for UI components
   */
  static createExperienceBarData(
    currentExperience: number,
    experienceGained: number,
    maxLevel: number = 50
  ): {
    baseData: ExperienceData;
    gainData: {
      gainedPercent: number;
      willLevelUp: boolean;
      levelsGained: number;
    };
    display: ReturnType<typeof ExperienceManager.formatExperienceDisplay>;
  } {
    const baseData = this.getExperienceData(currentExperience, maxLevel);
    const gainResult = this.addExperience(currentExperience, experienceGained, maxLevel);
    
    const gainedPercent = baseData.isAtMaxLevel 
      ? 0 
      : Math.min(
          100 - baseData.progressPercent,
          (experienceGained / baseData.experienceNeededForCurrentLevel) * 100
        );

    return {
      baseData,
      gainData: {
        gainedPercent,
        willLevelUp: gainResult.leveledUp,
        levelsGained: gainResult.levelsGained
      },
      display: this.formatExperienceDisplay(baseData)
    };
  }
}
