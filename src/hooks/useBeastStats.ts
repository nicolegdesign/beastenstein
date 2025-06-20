import { useState, useEffect, useCallback, useRef } from 'react';
import type { BeastStats, BeastMood } from '../types/game';
import type { GameOptions } from '../types/options';

export const useBeastStats = (
  initialStats: BeastStats = { hunger: 50, happiness: 50, energy: 50 }, 
  beastId?: string,
  options?: GameOptions
) => {
  const [stats, setStats] = useState<BeastStats>(initialStats);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef<number | null>(null);
  const previousBeastIdRef = useRef(beastId);

  // Update stats when switching beasts (only when beastId changes)
  useEffect(() => {
    if (beastId && beastId !== previousBeastIdRef.current) {
      setStats(initialStats);
      previousBeastIdRef.current = beastId;
    }
  }, [beastId, initialStats]);

  // Auto-decay stats every 3 seconds (unless disabled)
  useEffect(() => {
    // Don't create interval if stat decay is disabled
    if (options?.disableStatDecay) {
      return;
    }

    const interval = setInterval(() => {
      if (!isResting) {
        setStats(prev => ({
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

  // Item effect functions for powerful boosts
  const fillHappiness = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      happiness: 100
    }));
  }, [isResting]);

  const fillHunger = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      hunger: 100
    }));
  }, [isResting]);

  const fillEnergy = useCallback(() => {
    if (isResting) return;
    setStats(prev => ({
      ...prev,
      energy: 100
    }));
  }, [isResting]);

  const getBeastMood = useCallback((): BeastMood => {
    if (stats.happiness >= 80) return 'happy';
    if (stats.happiness >= 20) return 'normal';
    return 'sad';
  }, [stats.happiness]);

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
    getBeastMood
  };
};
