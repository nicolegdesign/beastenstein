import React, { useState } from 'react';
import { AnimatedCustomBeast } from '../AnimatedCustomBeast/AnimatedCustomBeast';
import './BeastSelection.css';

interface BeastSelectionProps {
  onBeastSelected: (name: string) => void;
}

export const BeastSelection: React.FC<BeastSelectionProps> = ({ onBeastSelected }) => {
  const [beastName, setBeastName] = useState('Night Wolf');
  const [isNaming, setIsNaming] = useState(false);

  // Night Wolf configuration for preview
  const nightWolfConfig = {
    name: 'Night Wolf',
    head: {
      imagePath: './images/beasts/night-wolf/night-wolf-head.svg'
    },
    torso: {
      imagePath: './images/beasts/night-wolf/night-wolf-torso.svg'
    },
    armLeft: {
      imagePath: './images/beasts/night-wolf/night-wolf-arm-l.svg'
    },
    armRight: {
      imagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg'
    },
    legLeft: {
      imagePath: './images/beasts/night-wolf/night-wolf-leg-l.svg'
    },
    legRight: {
      imagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg'
    }
  };

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
          <h1 className="selection-title">You've Stiched your first Beast!</h1>
          <p className="selection-subtitle">
            The seams look a bit loose,  but they should hold... Choose your beast's name and begin your journey.
          </p>
          
          <div className="beast-preview">
            <div className="beast-silhouette">
              <AnimatedCustomBeast
                customBeast={nightWolfConfig}
                mood="normal"
                size={200}
              />
            </div>
            
            <div className="beast-selection-info">
              <h2 className="beast-type">Night Wolf</h2>
              <p className="beast-description">
                This Night Wolf was stitched with care and compassion, 
                embodying the bond between beast and keeper.
              </p>
              
              <div className="beast-stats">
                <div className="stat-selection">
                  <span className="stat-selection-label">Nature:</span>
                  <span className="stat-selection-value">Loyal</span>
                </div>
                <div className="stat-selection">
                  <span className="stat-selection-label">Bond:</span>
                  <span className="stat-selection-value">Stitched with Love</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="naming-section">
            <h3 className="naming-title">Name Your Companion</h3>
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
            </div>
            
            <button 
              className="start-journey-button"
              onClick={handleStartJourney}
              disabled={!beastName.trim()}
            >
              Weave Your Bond
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
