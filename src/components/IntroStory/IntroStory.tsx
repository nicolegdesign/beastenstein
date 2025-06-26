import React, { useState, useEffect, useCallback } from 'react';
import './IntroStory.css';

interface IntroStoryProps {
  onComplete: () => void;
}

const storySegments = [
  {
    text: "You were born in the Forbidden Lands—a vast, shadow-soaked region stitched together by fog, bone, and forgotten rituals. For generations, the Stitchers have ruled here, shaping beasts from scraps of flesh, fur, and soul to fight, conquer, and dominate.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "You were raised among them… but you've never truly belonged.\n\nWhere others saw beasts as tools or trophies, you saw companions. While they stitched for power, you stitched for love. Your beasts are your friends—woven not from cold ambition, but from care and connection.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "Some call you soft. Others call you foolish.\n\nArmed with a soulneedle, a half-scorched bestiary, and a knack for creative anatomy, you leave the comfort of the Bonehome orphanage to chase a whisper: the ruins of Castle Beastenstein are stirring.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "They say the Heartstitch still pulses there. A lost relic. The key to ultimate creation… or total unraveling.\n\nNow, with your beast by your side and a fire in your heart, you set out into the wild dark. Not to conquer. Not to dominate.\n\nBut to prove that kindness is its own kind of power.",
    image: "./images/forrest-clearing.jpg"
  }
];

export const IntroStory: React.FC<IntroStoryProps> = ({ onComplete }) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Start the intro after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setTextVisible(true), 200);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (currentSegment < storySegments.length - 1) {
      setTextVisible(false);
      setTimeout(() => {
        setCurrentSegment(currentSegment + 1);
        setTimeout(() => setTextVisible(true), 200);
      }, 500);
    } else {
      setTextVisible(false);
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  }, [currentSegment, onComplete]);

  const handleSkip = useCallback(() => {
    setTextVisible(false);
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
        className={`intro-background ${isVisible ? 'visible' : ''}`}
        style={{ backgroundImage: `url(${currentStory.image})` }}
      />
      <div className="intro-overlay" />
      
      <div className={`intro-content ${isVisible ? 'visible' : ''}`}>
        <div className={`story-text ${textVisible ? 'text-visible' : ''}`}>
          {currentStory.text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < currentStory.text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        
        <div className={`intro-controls ${textVisible ? 'text-visible' : ''}`}>
          <button className="next-button" onClick={handleNext}>
            {currentSegment < storySegments.length - 1 ? 'Continue' : 'Begin Your Journey'}
          </button>
          <button className="skip-button" onClick={handleSkip}>
            Skip Intro
          </button>
        </div>
        
        <div className={`progress-dots ${textVisible ? 'text-visible' : ''}`}>
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
