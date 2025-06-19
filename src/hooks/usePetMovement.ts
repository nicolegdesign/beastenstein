import { useState, useEffect, useRef, useCallback } from 'react';

export const usePetMovement = (isResting: boolean, gameAreaRef?: React.RefObject<HTMLDivElement | null>) => {
  const [position, setPosition] = useState({ x: 50, y: 60 });
  const timeoutRef = useRef<number | null>(null);

  const movePetRandomly = useCallback(() => {
    if (isResting || !gameAreaRef?.current) return;

    const gameArea = gameAreaRef.current;
    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;
    const petWidth = 150;
    const petHeight = 150;

    const maxX = gameWidth - petWidth;
    const maxY = gameHeight - petHeight;

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    setPosition({ x: newX, y: newY });
  }, [isResting, gameAreaRef]);

  const scheduleNextMove = useCallback(() => {
    const nextMoveTime = 5000 + Math.random() * 5000; // 5-10 seconds
    timeoutRef.current = window.setTimeout(() => {
      movePetRandomly();
      scheduleNextMove();
    }, nextMoveTime);
  }, [movePetRandomly]);

  useEffect(() => {
    if (!isResting) {
      scheduleNextMove();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isResting, scheduleNextMove]);

  return { position };
};
