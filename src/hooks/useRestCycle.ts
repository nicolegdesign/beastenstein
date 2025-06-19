import { useEffect, useRef } from 'react';

export const useRestCycle = (
  isResting: boolean,
  energy: number,
  onEnergyChange: (energy: number) => void,
  onRestComplete: () => void
) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isResting) {
      intervalRef.current = setInterval(() => {
        onEnergyChange(Math.min(100, energy + 10));
        
        if (energy >= 100) {
          onRestComplete();
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isResting, energy, onEnergyChange, onRestComplete]);
};
