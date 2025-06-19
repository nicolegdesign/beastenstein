import React from 'react';
import { PETS } from '../../types/pets';
import type { PetConfig } from '../../types/pets';
import './PetSelector.css';

interface PetSelectorProps {
  currentPetId: string;
  onPetChange: (petId: string) => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({ currentPetId, onPetChange }) => {
  return (
    <div className="pet-selector">
      <h3>Select Your Pet:</h3>
      <div className="pet-buttons">
        {PETS.map((pet: PetConfig) => (
          <button
            key={pet.id}
            className={`pet-button ${currentPetId === pet.id ? 'active' : ''}`}
            onClick={() => onPetChange(pet.id)}
          >
            <img src={pet.images.normal} alt={pet.name} />
            <span>{pet.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
