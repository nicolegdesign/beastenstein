import { useCallback } from 'react';
import { BeastManager } from '../services/BeastManager';
import { ExperienceManager } from '../services/ExperienceManager';
import type { IndividualBeastData } from '../types/game';

interface LevelUpHookProps {
  gameOptions: {
    soundEffectsEnabled: boolean;
  };
  setShowLevelUp: (show: boolean) => void;
  setToast: (toast: { message: string; show: boolean; type: 'success' | 'info' }) => void;
  setBeastData: (updater: (prev: Record<string, IndividualBeastData>) => Record<string, IndividualBeastData>) => void;
  levelUpSoundRef: React.RefObject<HTMLAudioElement | null>;
  updateHealth?: (health: number) => void;
}

export const useLevelUp = ({
  gameOptions,
  setShowLevelUp,
  setToast,
  setBeastData,
  levelUpSoundRef,
  updateHealth
}: LevelUpHookProps) => {
  
  const playLevelUpSound = useCallback(() => {
    if (levelUpSoundRef.current && gameOptions.soundEffectsEnabled) {
      levelUpSoundRef.current.currentTime = 0;
      levelUpSoundRef.current.volume = 0.7;
      levelUpSoundRef.current.play().catch(error => {
        console.log('Could not play level up sound:', error);
      });
    }
  }, [levelUpSoundRef, gameOptions.soundEffectsEnabled]);

  const showLevelUpEffects = useCallback((beastName: string, newLevel: number, statBonus: number, healthBonus: number) => {
    setShowLevelUp(true);
    setToast({
      message: `🎉 ${beastName} reached Level ${newLevel}! (+${statBonus} to all stats, +${healthBonus} health)`,
      show: true,
      type: 'success'
    });
    
    playLevelUpSound();
    
    // Hide level up effect after animation
    setTimeout(() => {
      setShowLevelUp(false);
    }, 3000);
  }, [setShowLevelUp, setToast, playLevelUpSound]);

  const applyLevelUpBonuses = useCallback((
    beastId: string, 
    currentBeast: IndividualBeastData, 
    levelsGained: number
  ) => {
    const bonuses = BeastManager.calculateLevelUpBonuses(beastId, levelsGained);
    
    setBeastData(prev => {
      const updatedData = BeastManager.applyLevelUpBonuses(
        prev[beastId],
        bonuses.statIncrease,
        bonuses.healthIncrease
      );
      
      // Save the updated data
      BeastManager.saveBeastData(beastId, updatedData);
      
      return {
        ...prev,
        [beastId]: updatedData
      };
    });

    // Update current health if this is the active beast
    if (updateHealth) {
      updateHealth(currentBeast.health + bonuses.healthIncrease);
    }

    return bonuses;
  }, [setBeastData, updateHealth]);

  const handleLevelUp = useCallback((
    beastId: string,
    currentBeast: IndividualBeastData,
    oldLevel: number,
    newLevel: number
  ) => {
    const levelsGained = newLevel - oldLevel;
    const bonuses = applyLevelUpBonuses(beastId, currentBeast, levelsGained);
    
    const statBonusPerLevel = bonuses.statIncrease / levelsGained;
    showLevelUpEffects(currentBeast.name, newLevel, statBonusPerLevel, bonuses.healthIncrease);
    
    return bonuses;
  }, [applyLevelUpBonuses, showLevelUpEffects]);

  const checkForLevelUp = useCallback((
    beastId: string,
    currentBeast: IndividualBeastData | undefined,
    newExperience: number
  ): boolean => {
    if (!currentBeast) return false;
    
    const maxLevel = currentBeast.maxLevel || 5;
    const oldExperienceData = ExperienceManager.getExperienceData(currentBeast.experience, maxLevel);
    const newExperienceData = ExperienceManager.getExperienceData(newExperience, maxLevel);
    const oldLevel = oldExperienceData.currentLevel;
    const newLevel = newExperienceData.currentLevel;
    
    if (newLevel > oldLevel) {
      handleLevelUp(beastId, currentBeast, oldLevel, newLevel);
      return true;
    }
    
    return false;
  }, [handleLevelUp]);

  return {
    checkForLevelUp,
    handleLevelUp,
    applyLevelUpBonuses,
    showLevelUpEffects
  };
};
