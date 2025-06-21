import React from 'react';
import { BEASTS } from '../../types/pets';
import type { BeastConfig } from '../../types/pets';
import type { IndividualBeastData } from '../../types/game';
import './BeastSelector.css';

interface BeastSelectorProps {
  currentBeastId: string;
  onBeastChange: (beastId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
  beastData?: Record<string, IndividualBeastData>;
}

export const BeastSelector: React.FC<BeastSelectorProps> = ({ 
  currentBeastId, 
  onBeastChange, 
  onClose, 
  isModal = false,
  beastData 
}) => {
  const handleBeastSelect = (beastId: string) => {
    onBeastChange(beastId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {isModal && <div className="beast-selector-overlay" onClick={onClose}></div>}
      <div className={`beast-selector ${isModal ? 'modal' : ''}`}>
        <div className="beast-selector-header">
          <h3>Select Your Beast:</h3>
          {isModal && onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="beast-buttons">
          {BEASTS.map((beast: BeastConfig) => {
            const data = beastData?.[beast.id];
            const displayName = data?.name || beast.name;
            
            return (
              <button
                key={beast.id}
                className={`beast-button ${currentBeastId === beast.id ? 'active' : ''}`}
                onClick={() => handleBeastSelect(beast.id)}
              >
                <img src={beast.images.normal} alt={displayName} />
                <div className="beast-info">
                  <span className="beast-name">{displayName}</span>
                  {data && (
                    <div className="beast-stats">
                      <div className="stat">❤️ {data.health}</div>
                      <div className="stat">🍖 {data.hunger}</div>
                      <div className="stat">😊 {data.happiness}</div>
                      <div className="stat">⚡ {data.energy}</div>
                      <div className="stat">Lv.{data.level}</div>
                      <div className="stat">{data.age}d</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
