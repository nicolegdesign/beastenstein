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
    if (!gameAreaRef.current) {
      console.log('Poo spawn skipped: no game area ref');
      return;
    }

    const gameArea = gameAreaRef.current;
    const rect = gameArea.getBoundingClientRect();
    
    // Generate random position within beast den bounds
    // Avoid edges to prevent poo from being too close to bed/bowl
    const margin = 100;
    const x = Math.random() * (rect.width - 2 * margin) + margin;
    const y = Math.random() * (rect.height - 2 * margin) + margin;
    
    const newPoo: PooItem = {
      id: `poo-${Date.now()}-${Math.random()}`,
      x,
      y
    };

    console.log('Spawning poo:', newPoo);
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

  // Poo spawning timer - spawn poo every 10-60 seconds when not resting (unless disabled)
  useEffect(() => {
    console.log('Poo manager effect:', { isResting, disablePooSpawning: options?.disablePooSpawning });
    if (isResting || options?.disablePooSpawning) {
      console.log('Poo spawning disabled:', { isResting, disablePooSpawning: options?.disablePooSpawning });
      return;
    }

    const minDelay = 60000; // 60 seconds
    const maxDelay = 1200000; // 120 seconds
    
    const scheduleNextPoo = () => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      console.log(`Next poo scheduled in ${delay / 1000} seconds`);
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
