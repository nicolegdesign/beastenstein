import { useState, useEffect, useRef, useCallback } from 'react';

export const useBeastMovement = (isResting: boolean, gameAreaRef?: React.RefObject<HTMLDivElement | null>) => {
  const [position, setPosition] = useState({ x: 50, y: 60 });
  const timeoutRef = useRef<number | null>(null);

  const moveBeastRandomly = useCallback(() => {
    if (isResting || !gameAreaRef?.current) return;

    const gameArea = gameAreaRef.current;
    const gameWidth = gameArea.offsetWidth;
    const gameHeight = gameArea.offsetHeight;
    const beastWidth = 150;
    const beastHeight = 150;

    const maxX = gameWidth - beastWidth;
    const maxY = gameHeight - beastHeight;

    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    setPosition({ x: newX, y: newY });
  }, [isResting, gameAreaRef]);

  const scheduleNextMove = useCallback(() => {
    const nextMoveTime = 5000 + Math.random() * 5000; // 5-10 seconds
    timeoutRef.current = window.setTimeout(() => {
      moveBeastRandomly();
      scheduleNextMove();
    }, nextMoveTime);
  }, [moveBeastRandomly]);

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
