import React, { forwardRef } from 'react';
import { Beast } from '../Beast/Beast';
import { Poo } from '../Poo/Poo';
import { AnimatedSteak } from '../AnimatedSteak/AnimatedSteak';
import type { BeastMood, BeastCombatStats } from '../../types/game';
import './BeastDen.css';

interface PooItem {
  id: string;
  x: number;
  y: number;
}

interface BeastDenProps {
  backgroundIndex: number;
  beastMood: BeastMood;
  isResting: boolean;
  beastPosition: { x: number; y: number };
  beastId: string;
  hunger: number;
  combatStats: BeastCombatStats;
  poos: PooItem[];
  onFeedFromBowl: () => void;
  onRestFromBed: () => void;
  onCleanupPoo: (pooId: string) => void;
  showSteakAnimation?: boolean;
  onSteakAnimationComplete?: () => void;
  children?: React.ReactNode;
}

const backgroundImages = [
  './images/beastDen.jpg',
  './images/background2.jpg',
  './images/background3.jpg',
  './images/background4.jpg'
];

export const BeastDen = forwardRef<HTMLDivElement, BeastDenProps>(({
  backgroundIndex,
  beastMood,
  isResting,
  beastPosition,
  beastId,
  hunger,
  combatStats,
  poos,
  onFeedFromBowl,
  onRestFromBed,
  onCleanupPoo,
  showSteakAnimation = false,
  onSteakAnimationComplete = () => {},
  children
}, ref) => {
  const getBowlImage = () => {
    return hunger <= 20 ? './images/bowlEmpty.svg' : './images/bowlFull.svg';
  };

  return (
    <div 
      ref={ref}
      id="beast-den"
      style={{
        backgroundImage: `url('${backgroundImages[backgroundIndex]}')`
      }}
    >
      <Beast 
        key={beastId}
        mood={beastMood}
        isResting={isResting}
        position={beastPosition}
        beastId={beastId}
      />
      
      {/* Combat Stats Table */}
      <div className="combat-stats-container">
        <div className="combat-stats-table">
          <h4 className="stats-title">Combat Stats</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">⚔️</span>
              <span className="stat-label">Attack</span>
              <span className="stat-value">{combatStats.attack}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛡️</span>
              <span className="stat-label">Defense</span>
              <span className="stat-value">{combatStats.defense}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔮</span>
              <span className="stat-label">Magic</span>
              <span className="stat-value">{combatStats.magic}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div id="food-bowl" onClick={onFeedFromBowl}>
        <img src={getBowlImage()} alt="Food Bowl" />
      </div>
      
      <div id="beast-bed" onClick={onRestFromBed}>
        <img src="./images/petBed.svg" alt="Beast Bed" />
      </div>

      {/* Render poos */}
      {poos.map((poo: PooItem) => (
        <Poo
          key={poo.id}
          id={poo.id}
          x={poo.x}
          y={poo.y}
          onCleanup={onCleanupPoo}
        />
      ))}

      {/* Animated steak */}
      <AnimatedSteak 
        isVisible={showSteakAnimation}
        onAnimationComplete={onSteakAnimationComplete}
      />
      
      {children}
    </div>
  );
});

BeastDen.displayName = 'BeastDen';
