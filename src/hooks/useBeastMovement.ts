import { useState, useEffect, useRef, useCallback } from 'react';

export const useBeastMovement = (
  isResting: boolean, 
  containerRef?: React.RefObject<HTMLDivElement | null>,
  disableRandomMovement: boolean = false
) => {
  // Start with a safe default position (centered with some offset from center)
  const [position, setPosition] = useState({ x: 200, y: 150 });
  const [facing, setFacing] = useState<'left' | 'right'>('right'); // Track which direction beast is facing
  const timeoutRef = useRef<number | null>(null);

  // Function to get valid position bounds
  const getValidBounds = useCallback(() => {
    if (!containerRef?.current) return null;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Beast dimensions (matching the CSS width of 250px)
    const beastWidth = 300;
    const beastHeight = 500;
    
    // Padding to keep beast away from edges and interactive elements
    const padding = 60;
    const bottomPadding = 100; // Extra padding at bottom for food bowl and bed
    
    const maxX = containerWidth - beastWidth - padding;
    const maxY = containerHeight - beastHeight - bottomPadding;
    const minX = padding;
    const minY = padding;

    return { minX, minY, maxX, maxY, containerWidth, containerHeight };
  }, [containerRef]);

  // Function to constrain position within valid bounds
  const constrainPosition = useCallback((pos: { x: number; y: number }) => {
    const bounds = getValidBounds();
    if (!bounds) return pos;

    const { minX, minY, maxX, maxY } = bounds;
    
    // Ensure position is within bounds
    const constrainedX = Math.max(minX, Math.min(maxX, pos.x));
    const constrainedY = Math.max(minY, Math.min(maxY, pos.y));
    
    return { x: constrainedX, y: constrainedY };
  }, [getValidBounds]);

  // Safe position setter that always constrains the position and updates facing direction
  const setSafePosition = useCallback((newPosition: { x: number; y: number }, currentPosition?: { x: number; y: number }) => {
    const safePosition = constrainPosition(newPosition);
    
    // Update facing direction based on movement
    if (currentPosition) {
      const deltaX = safePosition.x - currentPosition.x;
      if (Math.abs(deltaX) > 5) { // Only change facing if there's significant horizontal movement
        const newFacing = deltaX > 0 ? 'right' : 'left';
        // console.log('Beast facing change:', { deltaX, newFacing, from: currentPosition, to: safePosition });
        setFacing(newFacing);
      }
    }
    
    setPosition(safePosition);
  }, [constrainPosition]);

  const moveBeastRandomly = useCallback(() => {
    if (isResting || disableRandomMovement) return;

    const bounds = getValidBounds();
    if (!bounds) return;

    const { minX, minY, maxX, maxY, containerWidth, containerHeight } = bounds;

    // Ensure we have valid movement area
    if (maxX <= minX || maxY <= minY) {
      console.warn('Container too small for beast movement', { containerWidth, containerHeight, maxX, maxY, minX, minY });
      return;
    }

    const newX = minX + Math.random() * (maxX - minX);
    const newY = minY + Math.random() * (maxY - minY);

    setSafePosition({ x: newX, y: newY }, position);
  }, [isResting, disableRandomMovement, getValidBounds, setSafePosition, position]);

  const scheduleNextMove = useCallback(() => {
    const nextMoveTime = 5000 + Math.random() * 5000; // 5-10 seconds
    timeoutRef.current = window.setTimeout(() => {
      moveBeastRandomly();
      scheduleNextMove();
    }, nextMoveTime);
  }, [moveBeastRandomly]);

  useEffect(() => {
    if (!isResting && !disableRandomMovement) {
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
  }, [isResting, scheduleNextMove, disableRandomMovement]);

  // Initialize position when container becomes available
  useEffect(() => {
    if (containerRef?.current) {
      const bounds = getValidBounds();
      if (bounds) {
        const { minX, minY, maxX, maxY } = bounds;
        
        if (maxX > minX && maxY > minY) {
          // Center the beast initially with some random offset
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const offsetX = (Math.random() - 0.5) * 100; // Random offset up to 50px in each direction
          const offsetY = (Math.random() - 0.5) * 100;
          
          const initialX = centerX + offsetX;
          const initialY = centerY + offsetY;
          
          // Don't update facing direction on initial positioning
          const safePosition = constrainPosition({ x: initialX, y: initialY });
          setPosition(safePosition);
        }
      }
    }
  }, [containerRef, getValidBounds, constrainPosition]);

  return { position, facing };
};
