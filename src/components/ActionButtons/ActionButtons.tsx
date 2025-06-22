import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  onTravel: () => void;
  onSendToFarm: () => void;
  isResting: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onFeed, 
  onPlay, 
  onRest, 
  onTravel,
  onSendToFarm,
  isResting 
}) => {
  return (
    <div id="actions-container">
      <div id="actions">
        <button onClick={onFeed} disabled={isResting}>
          <span className="icon">🥩</span>
          <span className="text">FEED</span>
        </button>
        <button onClick={onPlay} disabled={isResting}>
          <span className="icon">🎾</span>
          <span className="text">PLAY</span>
        </button>
        <button onClick={onRest} disabled={isResting}>
          <span className="icon">😴</span>
          <span className="text">REST</span>
        </button>
        <button onClick={onTravel} disabled={isResting}>
          <span className="icon">✈️</span>
          <span className="text">TRAVEL</span>
        </button>
        <button onClick={onSendToFarm} disabled={isResting} className="send-to-farm-button">
          <span className="icon">🚜</span>
          <span className="text">SEND TO FARM</span>
        </button>
      </div>
    </div>
  );
};
