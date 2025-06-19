import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  onTravel: () => void;
  isResting: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onFeed, 
  onPlay, 
  onRest, 
  onTravel,
  isResting 
}) => {
  return (
    <div id="actions">
      <button onClick={onFeed} disabled={isResting}>
        <span className="icon">🥩</span>
        <span className="text">Feed</span>
      </button>
      <button onClick={onPlay} disabled={isResting}>
        <span className="icon">🎾</span>
        <span className="text">Play</span>
      </button>
      <button onClick={onRest} disabled={isResting}>
        <span className="icon">😴</span>
        <span className="text">Rest</span>
      </button>
      <button onClick={onTravel} disabled={isResting}>
        <span className="icon">✈️</span>
        <span className="text">Travel</span>
      </button>
    </div>
  );
};
