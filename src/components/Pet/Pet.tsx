import React from 'react';
import type { PetMood } from '../../types/game';
import './Pet.css';

interface PetProps {
  mood: PetMood;
  isResting: boolean;
  position: { x: number; y: number };
}

export const Pet: React.FC<PetProps> = ({ mood, isResting, position }) => {
  const getPetImage = (): string => {
    if (isResting) return '/images/pet-rest.png';
    
    switch (mood) {
      case 'happy':
        return '/images/pet-happy.png';
      case 'sad':
        return '/images/pet-sad.png';
      default:
        return '/images/pet-normal.png';
    }
  };

  const getAnimationClass = (): string => {
    if (isResting) return '';
    
    switch (mood) {
      case 'happy':
        return 'pet-happy';
      case 'sad':
        return 'pet-sad';
      default:
        return 'pet-normal';
    }
  };

  return (
    <div 
      id="pet" 
      className={`pet ${getAnimationClass()}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <img src={getPetImage()} alt="Your Pet" />
    </div>
  );
};
