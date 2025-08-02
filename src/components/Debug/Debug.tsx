import React from 'react';
import type { GameOptions } from '../../types/options';
import './Debug.css';

interface DebugProps {
  options: GameOptions;
  onOptionsChange: (newOptions: GameOptions) => void;
  onClose: () => void;
  isModal?: boolean;
  onResetAllBeasts?: () => void;
  onTestLevelUp?: () => void;
  onAddTestItems?: () => void;
}

export const Debug: React.FC<DebugProps> = ({ options, onOptionsChange, onClose, isModal = false, onResetAllBeasts, onTestLevelUp, onAddTestItems }) => {
  const handleToggle = (key: keyof GameOptions) => {
    const newOptions = {
      ...options,
      [key]: !options[key]
    };
    onOptionsChange(newOptions);
  };

  const content = (
    <div className="debug-content">
      <h2>🐛 Debug Options</h2>
      
      <div className="debug-section">
        <h3>Movement Debug</h3>
        <div className="debug-options">
          <label className="debug-option">
            <input
              type="checkbox"
              checked={options.disableRandomMovement}
              onChange={() => handleToggle('disableRandomMovement')}
            />
            <span className="debug-option-text">
              Disable Random Beast Movement
            </span>
            <span className="debug-description">
              Stops the beast from moving randomly around the game area for easier testing
            </span>
          </label>
        </div>
      </div>
      
      <div className="debug-section">
        <h3>⚠️ Reset Options</h3>
        <div className="debug-options">
          <div className="debug-reset-section">
            <p className="debug-description">
              Reset all beasts to their base stats (Level 1, 50 hunger/happiness/energy, 100 health/mana, 0 age)
            </p>
            <button 
              onClick={onResetAllBeasts} 
              className="debug-reset-btn"
              disabled={!onResetAllBeasts}
            >
              🔄 Reset All Beasts to Base Stats
            </button>
          </div>
        </div>
      </div>
      
      <div className="debug-section">
        <h3>🧪 Test Functions</h3>
        <div className="debug-options">
          <div className="debug-reset-section">
            <p className="debug-description">
              Test level-up functionality by adding experience to reach next level
            </p>
            <button 
              onClick={onTestLevelUp} 
              className="debug-reset-btn"
              disabled={!onTestLevelUp}
            >
              ⬆️ Test Level Up
            </button>
          </div>
          
          <div className="debug-reset-section">
            <p className="debug-description">
              Add one of every item to inventory for testing item effects
            </p>
            <button 
              onClick={onAddTestItems} 
              className="debug-reset-btn"
              disabled={!onAddTestItems}
            >
              🎒 Add Test Items
            </button>
          </div>
        </div>
      </div>

      {isModal && (
        <div className="debug-actions">
          <button onClick={onClose} className="debug-close-btn">
            Close
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="debug-modal">
        <div className="debug-overlay" onClick={onClose}></div>
        <div className="debug-modal-content">
          {content}
        </div>
      </div>
    );
  }

  return <div className="debug-panel">{content}</div>;
};
