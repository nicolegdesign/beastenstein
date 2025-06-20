import { useState, useEffect, useCallback } from 'react';
import type { GameOptions } from '../types/options';

interface PooItem {
  id: string;
  x: number;
  y: number;
}

export const usePooManager = (
  isResting: boolean, 
  gameAreaRef: React.RefObject<HTMLDivElement | null>,
  options?: GameOptions
) => {
  const [poos, setPoos] = useState<PooItem[]>([]);

  const spawnPoo = useCallback(() => {
    if (!gameAreaRef.current) return;

    const gameArea = gameAreaRef.current;
    const rect = gameArea.getBoundingClientRect();
    
    // Generate random position within game area bounds
    // Avoid edges to prevent poo from being too close to bed/bowl
    const margin = 100;
    const x = Math.random() * (rect.width - 2 * margin) + margin;
    const y = Math.random() * (rect.height - 2 * margin) + margin;
    
    const newPoo: PooItem = {
      id: `poo-${Date.now()}-${Math.random()}`,
      x,
      y
    };

    setPoos(prev => [...prev, newPoo]);
  }, [gameAreaRef]);

  const cleanupPoo = useCallback((pooId: string) => {
    setPoos(prev => prev.filter(poo => poo.id !== pooId));
    // Return happiness boost for cleaning up poo
    return 10;
  }, []);

  const clearAllPoos = useCallback(() => {
    setPoos([]);
  }, []);

  // Poo spawning timer - spawn poo every 60-120 seconds when not resting (unless disabled)
  useEffect(() => {
    if (isResting || options?.disablePooSpawning) return;

    const minDelay = 60000; // 30 seconds
    const maxDelay = 1200000; // 60 seconds
    
    const scheduleNextPoo = () => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      return setTimeout(() => {
        spawnPoo();
        scheduleNextPoo();
      }, delay);
    };

    const timeoutId = scheduleNextPoo();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isResting, spawnPoo, options?.disablePooSpawning]);

  return {
    poos,
    cleanupPoo,
    clearAllPoos
  };
};
