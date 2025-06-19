import { useState, useEffect, useCallback, useRef } from 'react';
import type { PetStats, PetMood } from '../types/game';

export const usePetStats = (initialStats: PetStats = { hunger: 50, happiness: 50, energy: 50 }) => {
  const [stats, setStats] = useState<PetStats>(initialStats);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef<number | null>(null);

  // Auto-decay stats every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isResting) {
        setStats(prev => ({
          hunger: Math.max(0, prev.hunger - 2),
          happiness: Math.max(0, prev.happiness - 1),
          energy: Math.max(0, prev.energy - 1)
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isResting]);

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
  }, [isResting]);

  const play = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      energy: Math.max(0, prev.energy - 15)
    }));
  }, [isResting]);

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
  }, [isResting]);

  const cleanup = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10)
    }));
  }, [isResting]);

  const getPetMood = useCallback((): PetMood => {
    if (stats.happiness >= 80) return 'happy';
    if (stats.happiness >= 20) return 'normal';
    return 'sad';
  }, [stats.happiness]);

  return {
    stats,
    isResting,
    feed,
    play,
    startRest,
    travel,
    cleanup,
    getPetMood
  };
};
