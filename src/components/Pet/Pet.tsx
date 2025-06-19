import React from 'react';
import type { PetMood } from '../../types/game';
import { getPetById } from '../../types/pets';
import './Pet.css';

interface PetProps {
  mood: PetMood;
  isResting: boolean;
  position: { x: number; y: number };
  petId: string;
}

export const Pet: React.FC<PetProps> = ({ mood, isResting, position, petId }) => {
  const getPetImage = (): string => {
    const petConfig = getPetById(petId);
    if (!petConfig) return './images/pet-normal.png'; // fallback
    
    if (isResting) return petConfig.images.rest;
    
    switch (mood) {
      case 'happy':
        return petConfig.images.happy;
      case 'sad':
        return petConfig.images.sad;
      default:
        return petConfig.images.normal;
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
