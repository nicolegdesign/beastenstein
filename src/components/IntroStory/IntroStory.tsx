import React, { useState, useEffect, useCallback } from 'react';
import './IntroStory.css';

interface IntroStoryProps {
  onComplete: () => void;
}

const storySegments = [
  {
    text: "In a world where magic flows through ancient forests...",
    image: "/images/background1.jpg"
  },
  {
    text: "Mystical creatures roam the wilderness, seeking companions who understand their souls.",
    image: "/images/background2.jpg"
  },
  {
    text: "You are a Beast Keeper, gifted with the rare ability to bond with these magnificent beings.",
    image: "/images/background3.jpg"
  },
  {
    text: "Your journey begins now, in the heart of the Enchanted Wilderness...",
    image: "/images/background4.jpg"
  }
];

export const IntroStory: React.FC<IntroStoryProps> = ({ onComplete }) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = useCallback(() => {
    if (currentSegment < storySegments.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSegment(currentSegment + 1);
        setIsVisible(true);
      }, 500);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [currentSegment, onComplete]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleNext();
      } else if (event.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSegment, handleNext, handleSkip]);

  const currentStory = storySegments[currentSegment];

  return (
    <div className="intro-story">
      <div 
        className="intro-background"
        style={{ backgroundImage: `url(${currentStory.image})` }}
      />
      <div className="intro-overlay" />
      
      <div className={`intro-content ${isVisible ? 'visible' : ''}`}>
        <div className="story-text">
          {currentStory.text}
        </div>
        
        <div className="intro-controls">
          <button className="next-button" onClick={handleNext}>
            {currentSegment < storySegments.length - 1 ? 'Continue' : 'Begin Your Journey'}
          </button>
          <button className="skip-button" onClick={handleSkip}>
            Skip Intro
          </button>
        </div>
        
        <div className="progress-dots">
          {storySegments.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === currentSegment ? 'active' : ''} ${index < currentSegment ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>
      
      <div className="intro-instructions">
        Press ENTER or SPACE to continue • ESC to skip
      </div>
    </div>
  );
};
