import { useState, useEffect, useCallback } from 'react';

interface PooItem {
  id: string;
  x: number;
  y: number;
}

export const usePooManager = (isResting: boolean, gameAreaRef: React.RefObject<HTMLDivElement | null>) => {
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

  // Poo spawning timer - spawn poo every 30-60 seconds when not resting
  useEffect(() => {
    if (isResting) return;

    const minDelay = 30000; // 30 seconds
    const maxDelay = 60000; // 60 seconds
    
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
  }, [isResting, spawnPoo]);

  return {
    poos,
    cleanupPoo,
    clearAllPoos
  };
};
