import React from 'react';
import type { BeastMood } from '../../types/game';
import { AnimatedCustomBeast } from '../AnimatedCustomBeast/AnimatedCustomBeast';
import './Beast.css';

interface BeastProps {
  mood: BeastMood;
  isResting: boolean;
  isLayingDown?: boolean;
  position: { x: number; y: number };
  facing?: 'left' | 'right';
  beastId: string;
  disablePositioning?: boolean;
}

export const Beast: React.FC<BeastProps> = ({ mood, isResting, isLayingDown = false, position, facing = 'right', beastId, disablePositioning = false }) => {
  const getBeastImage = (): string => {
    // Fallback static image (not used for custom beasts but kept for compatibility)
    if (isResting) return './images/pet-rest.png';
    
    switch (mood) {
      case 'happy':
        return './images/pet-happy.png';
      case 'sad':
        return './images/pet-sad.png';
      default:
        return './images/pet-normal.png';
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
    // All beasts are now custom beasts
    if (beastId.startsWith('custom_')) {
      const customBeastData = localStorage.getItem(`customBeast_${beastId}`);
      if (customBeastData) {
        try {
          const customBeast = JSON.parse(customBeastData);
          let animatedMood: 'normal' | 'happy' | 'sad' | 'rest' | 'laying';
          if (isLayingDown) {
            animatedMood = 'laying';
          } else if (isResting) {
            animatedMood = 'rest';
          } else {
            animatedMood = mood;
          }
          return (
            <AnimatedCustomBeast 
              mood={animatedMood} 
              size={500}
              facing={facing}
              customBeast={customBeast}
            />
          );
        } catch (e) {
          console.error('Failed to parse custom beast data:', e);
        }
      }
    }
    
    // Fallback to static image for any edge cases
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
