import React, { useState, useEffect, useCallback, useRef } from 'react';
import './IntroStory.css';

interface IntroStoryProps {
  onComplete: () => void;
  musicEnabled?: boolean;
}

const storySegments = [
  {
    text: "You were born in the Forbidden Lands. A vast, shadow-soaked region stitched together by fog, bone, and dark rituals. For generations, the Stitchers have ruled here, shaping beasts from scraps of flesh, fur, and soul to fight, conquer, and dominate.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "You were raised among them… but you've never truly belonged.\n\nWhere others saw beasts as tools or trophies, you saw companions. While they stitched for power, you stitched for love. Your beasts are your friends—woven not from cold ambition, but from care and connection.\n\n Some call you soft. Others call you foolish.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "Armed with the magic soulneedle, a half-scorched bestiary, and a knack for creative anatomy, you leave the comfort of the Kinderstich orphanage to chase a whisper: the ruins of Castle Beastenstein are stirring.",
    image: "./images/forrest-clearing.jpg"
  },
  {
    text: "They say the Heartstitch still pulses there. A lost relic. The key to ultimate creation… or total unraveling.\n\nNow, with your beast by your side and a fire in your heart, you set out into the wild dark. Not to conquer. Not to dominate.\n\nBut to prove that kindness is its own kind of power.",
    image: "./images/forrest-clearing.jpg"
  }
];

export const IntroStory: React.FC<IntroStoryProps> = ({ onComplete, musicEnabled = true }) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const introMusicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Start the intro after a brief delay - don't try to play music automatically
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setTextVisible(true), 200);
    }, 500);
    
    // Cleanup function to stop music when component unmounts
    const musicElement = introMusicRef.current;
    return () => {
      clearTimeout(timer);
      if (musicElement) {
        musicElement.pause();
        musicElement.currentTime = 0;
      }
    };
  }, []);

  // Function to try starting music on user interaction
  const tryStartMusic = useCallback(() => {
    const musicElement = introMusicRef.current;
    if (musicElement && musicEnabled && !musicStarted) {
      musicElement.volume = 0.3;
      musicElement.loop = true;
      musicElement.play().then(() => {
        setMusicStarted(true);
      }).catch(error => {
        console.log('Could not play intro music:', error);
      });
    }
  }, [musicEnabled, musicStarted]);

  const handleNext = useCallback(() => {
    // Try to start music on first user interaction
    tryStartMusic();
    
    if (currentSegment < storySegments.length - 1) {
      setTextVisible(false);
      setTimeout(() => {
        setCurrentSegment(currentSegment + 1);
        setTimeout(() => setTextVisible(true), 200);
      }, 500);
    } else {
      // Stop intro music when completing
      if (introMusicRef.current) {
        introMusicRef.current.pause();
        introMusicRef.current.currentTime = 0;
      }
      
      setTextVisible(false);
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  }, [currentSegment, onComplete, tryStartMusic]);

  const handleSkip = useCallback(() => {
    // Try to start music on first user interaction
    tryStartMusic();
    
    // Stop intro music
    if (introMusicRef.current) {
      introMusicRef.current.pause();
      introMusicRef.current.currentTime = 0;
    }
    
    setTextVisible(false);
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete, tryStartMusic]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Try to start music on first keyboard interaction
      tryStartMusic();
      
      if (event.key === 'Enter' || event.key === ' ') {
        handleNext();
      } else if (event.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSegment, handleNext, handleSkip, tryStartMusic]);

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
          <button 
            className="next-button" 
            onClick={handleNext}
            onMouseDown={tryStartMusic}
          >
            {currentSegment < storySegments.length - 1 ? 'Continue' : 'Begin Your Journey'}
          </button>
          <button 
            className="skip-button" 
            onClick={handleSkip}
            onMouseDown={tryStartMusic}
          >
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
        {musicStarted && musicEnabled && (
          <div style={{ fontSize: '0.8em', color: '#8b5cf6', marginTop: '4px' }}>
            🎵 Music playing
          </div>
        )}
      </div>
      
      {/* Intro background music */}
      <audio
        ref={introMusicRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="./sounds/beast-den-music.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};
