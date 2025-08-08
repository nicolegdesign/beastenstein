import { useState, useEffect, useRef, useCallback } from 'react';

export const useBeastMovement = (
  isResting: boolean, 
  containerRef?: React.RefObject<HTMLDivElement | null>,
  disableRandomMovement: boolean = false
) => {
  // Start with a safe default position (centered with some offset from center)
  const [position, setPosition] = useState({ x: 200, y: 150 });
  const [facing, setFacing] = useState<'left' | 'right'>('right'); // Track which direction beast is facing
  const [isWalking, setIsWalking] = useState<boolean>(false); // Expose when beast should play walking animation
  const timeoutRef = useRef<number | null>(null);
  const walkingTimeoutRef = useRef<number | null>(null);

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
        setFacing(newFacing);
      }
    }
    
    setPosition(safePosition);
  }, [constrainPosition]);

  const moveBeastRandomly = useCallback(() => {
  if (isResting || disableRandomMovement) return;

    const bounds = getValidBounds();
    if (!bounds) return;

  const { minX, minY, maxX, maxY } = bounds;

    // Ensure we have valid movement area
  if (maxX <= minX || maxY <= minY) return;

    // Find a target that is far enough to warrant a walking animation
    const MIN_MOVE_DISTANCE = 12; // px; avoid walk for tiny nudges
    let newX = position.x;
    let newY = position.y;
    let attempt = 0;
    while (attempt < 5) {
      const candidateX = minX + Math.random() * (maxX - minX);
      const candidateY = minY + Math.random() * (maxY - minY);
      const dx = candidateX - position.x;
      const dy = candidateY - position.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= MIN_MOVE_DISTANCE) {
        newX = candidateX;
        newY = candidateY;
        break;
      }
      attempt++;
    }

    const dx = newX - position.x;
    const dy = newY - position.y;
    const dist = Math.hypot(dx, dy);

    // Only play walking animation if we're actually moving a visible distance
    if (dist >= MIN_MOVE_DISTANCE) {
      // Trigger walking animation for the duration of the CSS transition (2s) + small buffer
      // Note: .beast has `transition: all 2s ease-in-out;`
      const WALK_MS = 2000;
      setIsWalking(true);
      if (walkingTimeoutRef.current) {
        clearTimeout(walkingTimeoutRef.current);
      }
      walkingTimeoutRef.current = window.setTimeout(() => {
        setIsWalking(false);
        walkingTimeoutRef.current = null;
      }, WALK_MS + 200);
    } else {
      setIsWalking(false);
    }

    // If we ended up not changing position (due to constraints), don't keep walking
    if (newX === position.x && newY === position.y) {
      setIsWalking(false);
    }
    setSafePosition({ x: newX, y: newY }, position);
  }, [isResting, disableRandomMovement, getValidBounds, setSafePosition, position]);

  const scheduleNextMove = useCallback(() => {
    const nextMoveTime = 5000 + Math.random() * 5000; // 5-10 seconds
    // Clear any previous timers to avoid overlaps
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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
      // Ensure we stop walking when resting or random movement disabled
      if (walkingTimeoutRef.current) {
        clearTimeout(walkingTimeoutRef.current);
        walkingTimeoutRef.current = null;
      }
      setIsWalking(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  // Do NOT clear walkingTimeout here; allow the current walk to complete
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

  return { position, facing, isWalking };
};
