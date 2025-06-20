import React from 'react';
import './Options.css';

export interface GameOptions {
  disableStatDecay: boolean;
  disablePooSpawning: boolean;
}

interface OptionsProps {
  options: GameOptions;
  onOptionsChange: (options: GameOptions) => void;
  onClose: () => void;
  isModal?: boolean;
}

export const Options: React.FC<OptionsProps> = ({ 
  options, 
  onOptionsChange, 
  onClose, 
  isModal = false 
}) => {
  const handleOptionChange = (key: keyof GameOptions, value: boolean) => {
    const updatedOptions = {
      ...options,
      [key]: value
    };
    onOptionsChange(updatedOptions);
  };

  const optionsContent = (
    <div className="options-content">
      <div className="options-header">
        <h2>⚙️ Game Options</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      
      <div className="options-list">
        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.disableStatDecay}
              onChange={(e) => handleOptionChange('disableStatDecay', e.target.checked)}
              className="option-checkbox"
            />
            <div className="option-info">
              <span className="option-title">🛡️ Disable Stat Decay</span>
              <span className="option-description">
                Pet's hunger, happiness, and energy won't decrease over time
              </span>
            </div>
          </label>
        </div>

        <div className="option-item">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.disablePooSpawning}
              onChange={(e) => handleOptionChange('disablePooSpawning', e.target.checked)}
              className="option-checkbox"
            />
            <div className="option-info">
              <span className="option-title">🚫 Disable Poo Spawning</span>
              <span className="option-description">
                Pet won't create poos that need to be cleaned up
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="options-footer">
        <p className="options-note">
          💡 These options help you enjoy the game at your own pace!
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="options-modal">
        <div className="options-backdrop" onClick={onClose}></div>
        {optionsContent}
      </div>
    );
  }

  return optionsContent;
};
