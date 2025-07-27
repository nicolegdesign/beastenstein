import { useMemo } from 'react';
import { ExperienceManager, type ExperienceGainResult } from '../services/ExperienceManager';

/**
 * Hook for managing beast experience in React components
 */
export function useExperience(currentExperience: number, maxLevel: number = 50) {
  const experienceData = useMemo(() => {
    return ExperienceManager.getExperienceData(currentExperience, maxLevel);
  }, [currentExperience, maxLevel]);

  const formatters = useMemo(() => {
    return ExperienceManager.formatExperienceDisplay(experienceData);
  }, [experienceData]);

  return {
    data: experienceData,
    formatters,
    
    // Helper functions
    addExperience: (experienceToAdd: number): ExperienceGainResult => {
      return ExperienceManager.addExperience(currentExperience, experienceToAdd, maxLevel);
    },
    
    createBarData: (experienceGained: number) => {
      return ExperienceManager.createExperienceBarData(currentExperience, experienceGained, maxLevel);
    },
    
    getLevel: () => experienceData.currentLevel,
    getProgress: () => experienceData.progressPercent,
    isMaxLevel: () => experienceData.isAtMaxLevel,
    getExperienceToNext: () => experienceData.experienceToNextLevel
  };
}

/**
 * Hook for experience bar UI data
 */
export function useExperienceBar(
  currentExperience: number,
  experienceGained: number = 0,
  maxLevel: number = 50
) {
  return useMemo(() => {
    return ExperienceManager.createExperienceBarData(currentExperience, experienceGained, maxLevel);
  }, [currentExperience, experienceGained, maxLevel]);
}
