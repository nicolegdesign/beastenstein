import React from 'react';
import type { GameOptions } from '../../types/options';
import './Debug.css';

interface DebugProps {
  options: GameOptions;
  onOptionsChange: (newOptions: GameOptions) => void;
  onClose: () => void;
  isModal?: boolean;
  onResetAllBeasts?: () => void;
}

export const Debug: React.FC<DebugProps> = ({ options, onOptionsChange, onClose, isModal = false, onResetAllBeasts }) => {
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
        <h3>Visual Debug</h3>
        <div className="debug-options">
          <label className="debug-option">
            <input
              type="checkbox"
              checked={options.showBeastBorder}
              onChange={() => handleToggle('showBeastBorder')}
            />
            <span className="debug-option-text">
              Show Beast Border (Battle Arena)
            </span>
            <span className="debug-description">
              Shows a red border around the beast in Battle Arena for debugging positioning
            </span>
          </label>
        </div>
      </div>
      
      <div className="debug-section">
        <h3>⚠️ Reset Options</h3>
        <div className="debug-options">
          <div className="debug-reset-section">
            <p className="debug-description">
              Reset all beasts to their base stats (Level 1, 50 hunger/happiness/energy, 100 health, 0 age)
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
