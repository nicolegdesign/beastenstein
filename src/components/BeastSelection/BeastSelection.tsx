import React, { useState } from 'react';
import './BeastSelection.css';

interface BeastSelectionProps {
  onBeastSelected: (name: string) => void;
}

export const BeastSelection: React.FC<BeastSelectionProps> = ({ onBeastSelected }) => {
  const [beastName, setBeastName] = useState('Night Wolf');
  const [isNaming, setIsNaming] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBeastName(e.target.value);
  };

  const handleStartJourney = () => {
    if (beastName.trim()) {
      onBeastSelected(beastName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && beastName.trim()) {
      handleStartJourney();
    }
  };

  return (
    <div className="beast-selection">
      <div className="forest-background" />
      <div className="forest-overlay" />
      
      <div className="selection-content">
        <div className="forest-clearing">
          <h1 className="selection-title">The Forest Clearing</h1>
          <p className="selection-subtitle">
            A mystical presence stirs in the shadows...
          </p>
          
          <div className="beast-preview">
            <div className="beast-silhouette">
              <img 
                src="/images/pet-normal.png" 
                alt="Night Wolf" 
                className="beast-image"
              />
              <div className="beast-aura" />
            </div>
            
            <div className="beast-info">
              <h2 className="beast-type">Night Wolf</h2>
              <p className="beast-description">
                A loyal and mysterious companion with piercing eyes that reflect ancient wisdom. 
                Night Wolves are known for their intelligence, fierce loyalty, and natural hunting instincts.
              </p>
              
              <div className="beast-stats">
                <div className="stat">
                  <span className="stat-label">Nature:</span>
                  <span className="stat-value">Loyal & Mysterious</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Element:</span>
                  <span className="stat-value">Shadow & Moon</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Abilities:</span>
                  <span className="stat-value">Night Vision, Pack Bond</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="naming-section">
            <h3 className="naming-title">Choose Your Companion's Name</h3>
            <div className="name-input-container">
              <input
                type="text"
                value={beastName}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsNaming(true)}
                onBlur={() => setIsNaming(false)}
                className={`name-input ${isNaming ? 'focused' : ''}`}
                placeholder="Enter a name..."
                maxLength={20}
              />
              <div className="input-glow" />
            </div>
            
            <button 
              className="start-journey-button"
              onClick={handleStartJourney}
              disabled={!beastName.trim()}
            >
              Begin Your Bond
            </button>
          </div>
        </div>
      </div>
      
      <div className="mystical-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
    </div>
  );
};
