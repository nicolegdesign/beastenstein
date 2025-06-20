import React from 'react';
import type { BeastMood } from '../../types/game';
import { getBeastById } from '../../types/pets';
import './Beast.css';

interface BeastProps {
  mood: BeastMood;
  isResting: boolean;
  position: { x: number; y: number };
  beastId: string;
  disablePositioning?: boolean;
}

export const Beast: React.FC<BeastProps> = ({ mood, isResting, position, beastId, disablePositioning = false }) => {
  const getBeastImage = (): string => {
    const beastConfig = getBeastById(beastId);
    if (!beastConfig) return './images/pet-normal.png'; // fallback
    
    if (isResting) return beastConfig.images.rest;
    
    switch (mood) {
      case 'happy':
        return beastConfig.images.happy;
      case 'sad':
        return beastConfig.images.sad;
      default:
        return beastConfig.images.normal;
    }
  };

  const getAnimationClass = (): string => {
    if (isResting) return '';
    
    switch (mood) {
      case 'happy':
        return 'beast-happy';
      case 'sad':
        return 'beast-sad';
      default:
        return 'beast-normal';
    }
  };

  return (
    <div 
      id="beast" 
      className={`beast ${getAnimationClass()} ${disablePositioning ? 'beast-no-position' : ''}`}
      style={disablePositioning ? {} : {
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <img src={getBeastImage()} alt="Your Beast" />
    </div>
  );
};
