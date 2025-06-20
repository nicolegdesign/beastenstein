import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Beast } from '../Beast/Beast';
import './BattleArena.css';

interface BattleArenaProps {
  beastId: string;
  beastMood: 'happy' | 'normal' | 'sad';
  showBeastBorder?: boolean;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ beastId, beastMood, showBeastBorder = false }) => {
  const [beastPosition, setBeastPosition] = useState({ x: 300, y: 400 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isOnGround, setIsOnGround] = useState(true);
  const [keysPressed, setKeysPressed] = useState(new Set<string>());
  const arenaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Movement and physics constants
  const MOVE_SPEED = 6;
  const JUMP_FORCE = -18;
  const GRAVITY = 0.8;
  const GROUND_Y = 450; // Ground level
  const FRICTION = 0.85;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', ' '].includes(key)) {
      event.preventDefault();
      setKeysPressed(prev => new Set(prev).add(key));
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', ' '].includes(key)) {
      event.preventDefault();
      setKeysPressed(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, []);

  // Game loop for movement and physics
  useEffect(() => {
    const gameLoop = () => {
      if (!arenaRef.current) return;
      
      setBeastPosition(prevPos => {
        setVelocity(prevVel => {
          let newVelX = prevVel.x;
          let newVelY = prevVel.y;

          // Horizontal movement
          if (keysPressed.has('a')) {
            newVelX = -MOVE_SPEED;
          } else if (keysPressed.has('d')) {
            newVelX = MOVE_SPEED;
          } else {
            newVelX *= FRICTION; // Apply friction when no key pressed
          }

          // Jumping
          if (keysPressed.has(' ') && isOnGround) {
            newVelY = JUMP_FORCE;
            setIsOnGround(false);
          }

          // Apply gravity
          newVelY += GRAVITY;

          return { x: newVelX, y: newVelY };
        });

        return prevPos;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [keysPressed, isOnGround, MOVE_SPEED, JUMP_FORCE, GRAVITY, FRICTION]);

  // Update position based on velocity
  useEffect(() => {
    if (!arenaRef.current) return;

    const rect = arenaRef.current.getBoundingClientRect();
    const maxX = rect.width - 80;

    setBeastPosition(prevPos => {
      let newX = prevPos.x + velocity.x;
      let newY = prevPos.y + velocity.y;

      // Boundary checking
      newX = Math.max(0, Math.min(maxX, newX));

      // Ground collision
      if (newY >= GROUND_Y) {
        newY = GROUND_Y;
        setVelocity(prev => ({ ...prev, y: 0 }));
        setIsOnGround(true);
      }

      return { x: newX, y: newY };
    });
  }, [velocity, GROUND_Y]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="battle-arena" ref={arenaRef}>
      <div className="arena-background">
        <img 
          src="./images/arenas/arena1.jpg" 
          alt="Battle Arena" 
          className="arena-image"
        />
      </div>
      
      <div className="arena-overlay">
        <h2 className="arena-title">⚔️ Battle Arena</h2>
        <div className="arena-controls">
          <span className="control-hint">
            🎮 WASD to move • SPACE to jump
          </span>
        </div>
      </div>
      
      <div 
        className="beast-container"
        style={{
          position: 'absolute',
          left: `${beastPosition.x}px`,
          top: `${beastPosition.y}px`,
          zIndex: 10,
          transition: 'none',
          transform: velocity.x < 0 ? 'scaleX(-1)' : 'scaleX(1)',
          ...(showBeastBorder && {
            border: '2px solid red',
            width: '150px',
            height: '150px'
          })
        }}
      >
        <Beast
          mood={beastMood}
          isResting={false}
          position={beastPosition}
          beastId={beastId}
          disablePositioning={true}
        />
      </div>
    </div>
  );
};
