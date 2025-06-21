import React, { forwardRef } from 'react';
import { Beast } from '../Beast/Beast';
import { Poo } from '../Poo/Poo';
import type { BeastMood } from '../../types/game';
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
  poos: PooItem[];
  onFeedFromBowl: () => void;
  onRestFromBed: () => void;
  onCleanupPoo: (pooId: string) => void;
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
  poos,
  onFeedFromBowl,
  onRestFromBed,
  onCleanupPoo,
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
        mood={beastMood}
        isResting={isResting}
        position={beastPosition}
        beastId={beastId}
      />
      
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
      
      {children}
    </div>
  );
});

BeastDen.displayName = 'BeastDen';
