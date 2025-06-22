import React from 'react';
import type { BeastMood } from '../../types/game';
import { getBeastById } from '../../types/beasts';
import { AnimatedNightWolf } from '../AnimatedNightWolf/AnimatedNightWolf';
import { AnimatedMountainDragon } from '../AnimatedMountainDragon/AnimatedMountainDragon';
import './Beast.css';

interface BeastProps {
  mood: BeastMood;
  isResting: boolean;
  position: { x: number; y: number };
  beastId: string;
  disablePositioning?: boolean;
}

export const Beast: React.FC<BeastProps> = ({ mood, isResting, position, beastId, disablePositioning = false }) => {
  const beastConfig = getBeastById(beastId);
  
  const getBeastImage = (): string => {
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

  const renderBeastContent = () => {
    // Use animated SVG for Night Wolf
    if (beastId === 'nightwolf') {
      const animatedMood = isResting ? 'rest' : mood;
      return (
        <AnimatedNightWolf 
          mood={animatedMood} 
          size={500} // Adjust size as needed
        />
      );
    }
    
    // Use animated SVG for Mountain Dragon
    if (beastId === 'mountaindragon') {
      const animatedMood = isResting ? 'rest' : mood;
      return (
        <AnimatedMountainDragon 
          mood={animatedMood} 
          size={500} // Adjust size as needed
        />
      );
    }
    
    // Use static image for other beasts
    return <img src={getBeastImage()} alt="Your Beast" />;
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
      {renderBeastContent()}
    </div>
  );
};
