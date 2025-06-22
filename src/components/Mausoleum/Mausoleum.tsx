import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Mausoleum.css';

interface BeastPart {
  id: string;
  name: string;
  source: string; // Which beast it comes from
  imagePath: string;
  type: 'head' | 'torso' | 'armLeft' | 'armRight' | 'legLeft' | 'legRight';
}

interface CustomBeast {
  name: string;
  head: BeastPart;
  torso: BeastPart;
  armLeft: BeastPart;
  armRight: BeastPart;
  legLeft: BeastPart;
  legRight: BeastPart;
}

interface MausoleumProps {
  onClose: () => void;
  onCreateBeast: (beast: CustomBeast) => void;
}

// Available beast parts from existing beasts
const AVAILABLE_PARTS: BeastPart[] = [
  // Night Wolf parts
  {
    id: 'nightwolf-head',
    name: 'Night Wolf Head',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-head.svg',
    type: 'head'
  },
  {
    id: 'nightwolf-torso',
    name: 'Night Wolf Torso',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-torso.svg',
    type: 'torso'
  },
  {
    id: 'nightwolf-arm-l',
    name: 'Night Wolf Left Arm',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    type: 'armLeft'
  },
  {
    id: 'nightwolf-arm-r',
    name: 'Night Wolf Right Arm',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    type: 'armRight'
  },
  {
    id: 'nightwolf-leg-l',
    name: 'Night Wolf Left Leg',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    type: 'legLeft'
  },
  {
    id: 'nightwolf-leg-r',
    name: 'Night Wolf Right Leg',
    source: 'Night Wolf',
    imagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    type: 'legRight'
  },
  // Mountain Dragon parts
  {
    id: 'mountaindragon-head',
    name: 'Mountain Dragon Head',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    type: 'head'
  },
  {
    id: 'mountaindragon-torso',
    name: 'Mountain Dragon Torso',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    type: 'torso'
  },
  {
    id: 'mountaindragon-arm-l',
    name: 'Mountain Dragon Left Arm',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    type: 'armLeft'
  },
  {
    id: 'mountaindragon-arm-r',
    name: 'Mountain Dragon Right Arm',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    type: 'armRight'
  },
  {
    id: 'mountaindragon-leg-l',
    name: 'Mountain Dragon Left Leg',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    type: 'legLeft'
  },
  {
    id: 'mountaindragon-leg-r',
    name: 'Mountain Dragon Right Leg',
    source: 'Mountain Dragon',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    type: 'legRight'
  },
];

export const Mausoleum: React.FC<MausoleumProps> = ({ onClose, onCreateBeast }) => {
  const [beastName, setBeastName] = useState('');
  const [selectedParts, setSelectedParts] = useState<Partial<CustomBeast>>({
    name: '',
    head: undefined,
    torso: undefined,
    armLeft: undefined,
    armRight: undefined,
    legLeft: undefined,
    legRight: undefined,
  });
  const [activePartType, setActivePartType] = useState<keyof Omit<CustomBeast, 'name'>>('head');

  const getPartsOfType = (type: BeastPart['type']) => {
    return AVAILABLE_PARTS.filter(part => part.type === type);
  };

  const selectPart = (part: BeastPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.type]: part
    }));
  };

  const isComplete = () => {
    return beastName.trim() !== '' && 
           selectedParts.head && 
           selectedParts.torso && 
           selectedParts.armLeft && 
           selectedParts.armRight && 
           selectedParts.legLeft && 
           selectedParts.legRight;
  };

  const handleCreate = () => {
    if (isComplete()) {
      onCreateBeast({
        name: beastName,
        head: selectedParts.head!,
        torso: selectedParts.torso!,
        armLeft: selectedParts.armLeft!,
        armRight: selectedParts.armRight!,
        legLeft: selectedParts.legLeft!,
        legRight: selectedParts.legRight!,
      });
    }
  };

  const partTypes = [
    { key: 'head' as const, label: 'Head' },
    { key: 'torso' as const, label: 'Torso' },
    { key: 'armLeft' as const, label: 'Left Arm' },
    { key: 'armRight' as const, label: 'Right Arm' },
    { key: 'legLeft' as const, label: 'Left Leg' },
    { key: 'legRight' as const, label: 'Right Leg' },
  ];

  return (
    <div className="mausoleum">
      <div className="mausoleum-background">
        <img src="./images/mausoleum.jpg" alt="Mausoleum" className="mausoleum-bg-image" />
      </div>
      
      <div className="mausoleum-content">
        <div className="mausoleum-header">
          <h1>🏛️ The Mausoleum</h1>
          <p>Create your own custom beast by mixing and matching parts</p>
          <button onClick={onClose} className="mausoleum-close-btn">✕</button>
        </div>

        <div className="mausoleum-creator">
          {/* Beast Preview */}
          <div className="beast-preview">
            <h3>Beast Preview</h3>
            <div className="preview-container">
              {selectedParts.head && (
                <img src={selectedParts.head.imagePath} alt="Head" className="preview-part preview-head" />
              )}
              {selectedParts.torso && (
                <img src={selectedParts.torso.imagePath} alt="Torso" className="preview-part preview-torso" />
              )}
              {selectedParts.armLeft && (
                <img src={selectedParts.armLeft.imagePath} alt="Left Arm" className="preview-part preview-arm-left" />
              )}
              {selectedParts.armRight && (
                <img src={selectedParts.armRight.imagePath} alt="Right Arm" className="preview-part preview-arm-right" />
              )}
              {selectedParts.legLeft && (
                <img src={selectedParts.legLeft.imagePath} alt="Left Leg" className="preview-part preview-leg-left" />
              )}
              {selectedParts.legRight && (
                <img src={selectedParts.legRight.imagePath} alt="Right Leg" className="preview-part preview-leg-right" />
              )}
            </div>
          </div>

          {/* Part Selection */}
          <div className="part-selection">
            <div className="part-tabs">
              {partTypes.map(partType => (
                <button
                  key={partType.key}
                  className={`part-tab ${activePartType === partType.key ? 'active' : ''}`}
                  onClick={() => setActivePartType(partType.key)}
                >
                  {partType.label}
                  {selectedParts[partType.key] && <span className="tab-indicator">✓</span>}
                </button>
              ))}
            </div>

            <div className="parts-grid">
              {getPartsOfType(activePartType).map(part => (
                <div
                  key={part.id}
                  className={`part-option ${selectedParts[activePartType]?.id === part.id ? 'selected' : ''}`}
                  onClick={() => selectPart(part)}
                >
                  <img src={part.imagePath} alt={part.name} className="part-image" />
                  <div className="part-info">
                    <span className="part-name">{part.name}</span>
                    <span className="part-source">from {part.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beast Name and Create */}
          <div className="beast-creation">
            <div className="beast-name-input">
              <label htmlFor="beast-name">Beast Name:</label>
              <input
                id="beast-name"
                type="text"
                value={beastName}
                onChange={(e) => setBeastName(e.target.value)}
                placeholder="Enter your beast's name..."
                maxLength={20}
              />
            </div>

            <motion.button
              className={`create-beast-btn ${isComplete() ? 'ready' : 'disabled'}`}
              onClick={handleCreate}
              disabled={!isComplete()}
              whileHover={isComplete() ? { scale: 1.05 } : {}}
              whileTap={isComplete() ? { scale: 0.95 } : {}}
            >
              {isComplete() ? '✨ Create Beast' : 'Select all parts to create'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
