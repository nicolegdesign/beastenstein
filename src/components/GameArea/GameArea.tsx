import React, { forwardRef } from 'react';
import { Pet } from '../Pet/Pet';
import { Poo } from '../Poo/Poo';
import type { PetMood } from '../../types/game';
import './GameArea.css';

interface PooItem {
  id: string;
  x: number;
  y: number;
}

interface GameAreaProps {
  backgroundIndex: number;
  petMood: PetMood;
  isResting: boolean;
  petPosition: { x: number; y: number };
  hunger: number;
  poos: PooItem[];
  onFeedFromBowl: () => void;
  onRestFromBed: () => void;
  onCleanupPoo: (pooId: string) => void;
  children?: React.ReactNode;
}

const backgroundImages = [
  '/images/background1.jpg',
  '/images/background2.jpg',
  '/images/background3.jpg',
  '/images/background4.jpg'
];

export const GameArea = forwardRef<HTMLDivElement, GameAreaProps>(({
  backgroundIndex,
  petMood,
  isResting,
  petPosition,
  hunger,
  poos,
  onFeedFromBowl,
  onRestFromBed,
  onCleanupPoo,
  children
}, ref) => {
  const getBowlImage = () => {
    return hunger <= 20 ? '/images/bowlEmpty.svg' : '/images/bowlFull.svg';
  };

  return (
    <div 
      ref={ref}
      id="game-area"
      style={{
        backgroundImage: `url('${backgroundImages[backgroundIndex]}')`
      }}
    >
      <Pet 
        mood={petMood}
        isResting={isResting}
        position={petPosition}
      />
      
      <div id="food-bowl" onClick={onFeedFromBowl}>
        <img src={getBowlImage()} alt="Food Bowl" />
      </div>
      
      <div id="pet-bed" onClick={onRestFromBed}>
        <img src="/images/petBed.svg" alt="Pet Bed" />
      </div>

      {/* Render poos */}
      {poos.map(poo => (
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

GameArea.displayName = 'GameArea';
