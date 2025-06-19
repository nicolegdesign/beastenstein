import React from 'react';
import { PETS } from '../../types/pets';
import type { PetConfig } from '../../types/pets';
import type { IndividualPetData } from '../../types/game';
import './PetSelector.css';

interface PetSelectorProps {
  currentPetId: string;
  onPetChange: (petId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
  petData?: Record<string, IndividualPetData>;
}

export const PetSelector: React.FC<PetSelectorProps> = ({ 
  currentPetId, 
  onPetChange, 
  onClose, 
  isModal = false,
  petData 
}) => {
  const handlePetSelect = (petId: string) => {
    onPetChange(petId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {isModal && <div className="pet-selector-overlay" onClick={onClose}></div>}
      <div className={`pet-selector ${isModal ? 'modal' : ''}`}>
        <div className="pet-selector-header">
          <h3>Select Your Pet:</h3>
          {isModal && onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="pet-buttons">
          {PETS.map((pet: PetConfig) => {
            const data = petData?.[pet.id];
            const displayName = data?.name || pet.name;
            
            return (
              <button
                key={pet.id}
                className={`pet-button ${currentPetId === pet.id ? 'active' : ''}`}
                onClick={() => handlePetSelect(pet.id)}
              >
                <img src={pet.images.normal} alt={displayName} />
                <div className="pet-info">
                  <span className="pet-name">{displayName}</span>
                  {data && (
                    <div className="pet-stats">
                      <div className="stat">🍖 {data.hunger}</div>
                      <div className="stat">😊 {data.happiness}</div>
                      <div className="stat">⚡ {data.energy}</div>
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
