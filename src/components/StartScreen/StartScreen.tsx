import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  hasSavedData: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGame, hasSavedData }) => {
  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <img 
          src="./images/logo.png" 
          alt="Beastenstein Logo" 
          className="game-logo"
        />
        
        <div className="game-tagline">
          "Need a friend? Just make one!"
        </div>
        
        <div className="start-screen-buttons">
          <button 
            className="start-button new-game-button"
            onClick={onNewGame}
          >
            New Game
          </button>
          
          <button 
            className="start-button load-game-button"
            onClick={onLoadGame}
            disabled={!hasSavedData}
          >
            Load Game
          </button>
        </div>
      </div>
    </div>
  );
};
