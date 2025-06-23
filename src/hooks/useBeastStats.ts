import { useState, useEffect, useCallback, useRef } from 'react';
import type { BeastStats, BeastMood } from '../types/game';
import type { GameOptions } from '../types/options';

export const useBeastStats = (
  initialStats: BeastStats = { hunger: 50, happiness: 50, energy: 50, health: 100, level: 1, age: 0 }, 
  beastId?: string,
  options?: GameOptions,
  createdAt?: number,
  initialExperience: number = 0,
  maxLevel: number = 50
) => {
  const [stats, setStats] = useState<BeastStats>(initialStats);
  const [isResting, setIsResting] = useState(false);
  const [experience, setExperience] = useState(initialExperience);
  const restIntervalRef = useRef<number | null>(null);
  const agingIntervalRef = useRef<number | null>(null);
  // const healthIntervalRef = useRef<number | null>(null); // Disabled for now
  const previousBeastIdRef = useRef(beastId);

  // Update stats when switching beasts (only when beastId changes)
  useEffect(() => {
    if (beastId && beastId !== previousBeastIdRef.current) {
      setStats(initialStats);
      setExperience(initialExperience);
      previousBeastIdRef.current = beastId;
    }
  }, [beastId, initialStats, initialExperience]);

  // Aging system - calculate age based on real time elapsed since creation
  useEffect(() => {
    if (options?.disableStatDecay) {
      return;
    }

    const updateAge = () => {
      if (createdAt) {
        const now = Date.now();
        const daysPassed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        setStats(prev => ({
          ...prev,
          age: daysPassed
        }));
      }
    };

    // Update age immediately
    updateAge();

    // Update age every minute to keep it current
    agingIntervalRef.current = window.setInterval(updateAge, 60000);

    return () => {
      if (agingIntervalRef.current) {
        clearInterval(agingIntervalRef.current);
      }
    };
  }, [options?.disableStatDecay, createdAt]);

  // Health system - DISABLED (health remains stable for now, will be used in future battle features)
  // useEffect(() => {
  //   if (options?.disableStatDecay) {
  //     return;
  //   }

  //   healthIntervalRef.current = window.setInterval(() => {
  //     setStats(prev => {
  //       let healthChange = 0;
  //       const criticalStats = [prev.hunger, prev.happiness, prev.energy];
  //       const lowStats = criticalStats.filter(stat => stat < 20).length;
  //       const goodStats = criticalStats.filter(stat => stat > 70).length;

  //       if (lowStats >= 2) {
  //         // Multiple low stats = health decline
  //         healthChange = -2;
  //       } else if (lowStats === 1) {
  //         // One low stat = slow health decline
  //         healthChange = -1;
  //       } else if (goodStats >= 2) {
  //         // Multiple good stats = health recovery
  //         healthChange = 1;
  //       }

  //       const newHealth = Math.max(0, Math.min(100, prev.health + healthChange));
  //       return { ...prev, health: newHealth };
  //     });
  //   }, 30000); // Check health every 30 seconds

  //   return () => {
  //     if (healthIntervalRef.current) {
  //       clearInterval(healthIntervalRef.current);
  //     }
  //   };
  // }, [options?.disableStatDecay]);

  // Leveling system - level up based on experience points
  useEffect(() => {
    const expNeeded = stats.level * 100; // 100 exp per level
    if (experience >= expNeeded && stats.level < maxLevel) { // Use maxLevel parameter
      setStats(prev => ({
        ...prev,
        level: prev.level + 1
      }));
      setExperience(0); // Reset experience after leveling
    }
  }, [experience, stats.level, maxLevel]);

  // Auto-decay stats every 3 seconds (unless disabled)
  useEffect(() => {
    // Don't create interval if stat decay is disabled
    if (options?.disableStatDecay) {
      return;
    }

    const interval = setInterval(() => {
      if (!isResting) {
        setStats(prev => ({
          ...prev,
          hunger: Math.max(0, prev.hunger - 2),
          happiness: Math.max(0, prev.happiness - 1),
          energy: Math.max(0, prev.energy - 1)
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isResting, options?.disableStatDecay]);

  // Rest cycle management
  useEffect(() => {
    if (isResting) {
      restIntervalRef.current = window.setInterval(() => {
        setStats(prev => {
          const newEnergy = Math.min(100, prev.energy + 10);
          if (newEnergy >= 100) {
            setIsResting(false);
          }
          return { ...prev, energy: newEnergy };
        });
      }, 500);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting]);

  const feed = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 15),
      happiness: Math.min(100, prev.happiness + 5)
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 10); // Gain experience for feeding
    }
  }, [isResting, stats.level, maxLevel]);

  const play = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      energy: Math.max(0, prev.energy - 15)
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 15); // Gain experience for playing
    }
  }, [isResting, stats.level, maxLevel]);

  const startRest = useCallback(() => {
    if (isResting) return;
    setIsResting(true);
  }, [isResting]);

  const travel = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 3)
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 5); // Gain experience for traveling
    }
  }, [isResting, stats.level, maxLevel]);

  const cleanup = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10)
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 8); // Gain experience for cleaning
    }
  }, [isResting, stats.level, maxLevel]);

  // Item effect functions for powerful boosts
  const fillHappiness = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: 100
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 20); // Bonus experience for using items
    }
  }, [isResting, stats.level, maxLevel]);

  const fillHunger = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      hunger: 100
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 20); // Bonus experience for using items
    }
  }, [isResting, stats.level, maxLevel]);

  const fillEnergy = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      energy: 100
    }));
    // Only gain experience if not at max level
    if (stats.level < maxLevel) {
      setExperience(prev => prev + 20); // Bonus experience for using items
    }
  }, [isResting, stats.level, maxLevel]);

  const getBeastMood = useCallback((): BeastMood => {
    if (stats.happiness >= 80) return 'happy';
    if (stats.happiness >= 20) return 'normal';
    return 'sad';
  }, [stats.happiness]);

  const getExperience = useCallback(() => experience, [experience]);

  const setExternalExperience = useCallback((newExperience: number) => {
    setExperience(newExperience);
  }, []);

  const getExpToNextLevel = useCallback(() => {
    return stats.level * 100 - experience;
  }, [stats.level, experience]);

  const resetToBaseStats = useCallback(() => {
    setStats({
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 100,
      level: 1,
      age: 0
    });
    setExperience(0);
  }, []);

  return {
    stats,
    isResting,
    setIsResting,
    feed,
    play,
    startRest,
    travel,
    cleanup,
    fillHappiness,
    fillHunger,
    fillEnergy,
    getBeastMood,
    getExperience,
    setExternalExperience,
    getExpToNextLevel,
    resetToBaseStats
  };
};
