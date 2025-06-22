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

interface BeastPartSet {
  id: string;
  name: string;
  source: string;
  leftImagePath: string;
  rightImagePath: string;
  type: 'armSet' | 'legSet';
}

interface SoulEssence {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CustomBeast {
  name: string;
  head: BeastPart;
  torso: BeastPart;
  armLeft: BeastPart;
  armRight: BeastPart;
  legLeft: BeastPart;
  legRight: BeastPart;
  soulEssence: SoulEssence;
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

// Available arm and leg sets
const AVAILABLE_ARM_SETS: BeastPartSet[] = [
  {
    id: 'nightwolf-arms',
    name: 'Night Wolf Arms',
    source: 'Night Wolf',
    leftImagePath: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    type: 'armSet'
  },
  {
    id: 'mountaindragon-arms',
    name: 'Mountain Dragon Arms',
    source: 'Mountain Dragon',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    type: 'armSet'
  },
];

const AVAILABLE_LEG_SETS: BeastPartSet[] = [
  {
    id: 'nightwolf-legs',
    name: 'Night Wolf Legs',
    source: 'Night Wolf',
    leftImagePath: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    type: 'legSet'
  },
  {
    id: 'mountaindragon-legs',
    name: 'Mountain Dragon Legs',
    source: 'Mountain Dragon',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    type: 'legSet'
  },
];

// Available soul essences
const AVAILABLE_SOUL_ESSENCES: SoulEssence[] = [
  {
    id: 'dim-soul',
    name: 'Dim Soul',
    description: 'A faint glimmer of spiritual energy',
    imagePath: './images/items/dim-soul.png',
    rarity: 'common'
  },
  {
    id: 'glowing-soul',
    name: 'Glowing Soul',
    description: 'A warm, steady spiritual glow',
    imagePath: './images/items/glowing-soul.png',
    rarity: 'uncommon'
  },
  {
    id: 'bright-soul',
    name: 'Bright Soul',
    description: 'A radiant burst of spiritual power',
    imagePath: './images/items/bright-soul.png',
    rarity: 'rare'
  },
  {
    id: 'brilliant-soul',
    name: 'Brilliant Soul',
    description: 'An intense blaze of spiritual energy',
    imagePath: './images/items/brilliant-soul.png',
    rarity: 'epic'
  },
  {
    id: 'luminescent-soul',
    name: 'Luminescent Soul',
    description: 'The ultimate manifestation of spiritual essence',
    imagePath: './images/items/luminescent-soul.png',
    rarity: 'legendary'
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
    soulEssence: undefined,
  });
  const [activePartType, setActivePartType] = useState<'head' | 'torso' | 'armSet' | 'legSet' | 'soulEssence'>('head');

  const getPartsOfType = (type: BeastPart['type']) => {
    return AVAILABLE_PARTS.filter(part => part.type === type);
  };

  const getSetsOfType = (type: BeastPartSet['type']) => {
    if (type === 'armSet') return AVAILABLE_ARM_SETS;
    if (type === 'legSet') return AVAILABLE_LEG_SETS;
    return [];
  };

  const selectPart = (part: BeastPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.type]: part
    }));
  };

  const selectPartSet = (partSet: BeastPartSet) => {
    if (partSet.type === 'armSet') {
      // Create arm parts from the set
      const leftArm: BeastPart = {
        id: `${partSet.id}-left`,
        name: `${partSet.name} Left`,
        source: partSet.source,
        imagePath: partSet.leftImagePath,
        type: 'armLeft'
      };
      const rightArm: BeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        source: partSet.source,
        imagePath: partSet.rightImagePath,
        type: 'armRight'
      };
      
      setSelectedParts(prev => ({
        ...prev,
        armLeft: leftArm,
        armRight: rightArm
      }));
    } else if (partSet.type === 'legSet') {
      // Create leg parts from the set
      const leftLeg: BeastPart = {
        id: `${partSet.id}-left`,
        name: `${partSet.name} Left`,
        source: partSet.source,
        imagePath: partSet.leftImagePath,
        type: 'legLeft'
      };
      const rightLeg: BeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        source: partSet.source,
        imagePath: partSet.rightImagePath,
        type: 'legRight'
      };
      
      setSelectedParts(prev => ({
        ...prev,
        legLeft: leftLeg,
        legRight: rightLeg
      }));
    }
  };

  const selectSoulEssence = (soulEssence: SoulEssence) => {
    setSelectedParts(prev => ({
      ...prev,
      soulEssence: soulEssence
    }));
  };

  const isComplete = () => {
    return beastName.trim() !== '' && 
           selectedParts.head && 
           selectedParts.torso && 
           selectedParts.armLeft && 
           selectedParts.armRight && 
           selectedParts.legLeft && 
           selectedParts.legRight &&
           selectedParts.soulEssence;
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
        soulEssence: selectedParts.soulEssence!,
      });
    }
  };

  const partTypes = [
    { key: 'head' as const, label: 'Head' },
    { key: 'torso' as const, label: 'Torso' },
    { key: 'armSet' as const, label: 'Arms' },
    { key: 'legSet' as const, label: 'Legs' },
    { key: 'soulEssence' as const, label: 'Soul Essence' },
  ];

  const hasSelectedSet = (setType: 'armSet' | 'legSet') => {
    if (setType === 'armSet') {
      return selectedParts.armLeft && selectedParts.armRight;
    } else if (setType === 'legSet') {
      return selectedParts.legLeft && selectedParts.legRight;
    }
    return false;
  };

  const getSelectedSetId = (setType: 'armSet' | 'legSet') => {
    if (setType === 'armSet' && selectedParts.armLeft) {
      // Extract set ID from individual part ID
      return selectedParts.armLeft.id.replace('-left', '');
    } else if (setType === 'legSet' && selectedParts.legLeft) {
      return selectedParts.legLeft.id.replace('-left', '');
    }
    return null;
  };

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
            <h3>Beast Preview</h3>          <div className="preview-container">
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
            
            {/* Soul Essence Display */}
            {selectedParts.soulEssence && (
              <div className="preview-soul-essence">
                <img src={selectedParts.soulEssence.imagePath} alt={selectedParts.soulEssence.name} className="preview-soul-image" />
                <span className={`preview-soul-name rarity-${selectedParts.soulEssence.rarity}`}>
                  {selectedParts.soulEssence.name}
                </span>
              </div>
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
                  {/* Show checkmark for individual parts or sets */}
                  {partType.key === 'head' && selectedParts.head && <span className="tab-indicator">✓</span>}
                  {partType.key === 'torso' && selectedParts.torso && <span className="tab-indicator">✓</span>}
                  {partType.key === 'armSet' && hasSelectedSet('armSet') && <span className="tab-indicator">✓</span>}
                  {partType.key === 'legSet' && hasSelectedSet('legSet') && <span className="tab-indicator">✓</span>}
                  {partType.key === 'soulEssence' && selectedParts.soulEssence && <span className="tab-indicator">✓</span>}
                </button>
              ))}
            </div>

            <div className="parts-grid">
              {/* Render individual parts for head and torso */}
              {(activePartType === 'head' || activePartType === 'torso') && 
                getPartsOfType(activePartType).map(part => (
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
                ))
              }
              
              {/* Render arm sets */}
              {activePartType === 'armSet' && 
                getSetsOfType('armSet').map(armSet => (
                  <div
                    key={armSet.id}
                    className={`part-option ${getSelectedSetId('armSet') === armSet.id ? 'selected' : ''}`}
                    onClick={() => selectPartSet(armSet)}
                  >
                    <div className="set-preview">
                      <img src={armSet.leftImagePath} alt={`${armSet.name} Left`} className="part-image set-left" />
                      <img src={armSet.rightImagePath} alt={`${armSet.name} Right`} className="part-image set-right" />
                    </div>
                    <div className="part-info">
                      <span className="part-name">{armSet.name}</span>
                      <span className="part-source">from {armSet.source}</span>
                    </div>
                  </div>
                ))
              }
              
              {/* Render leg sets */}
              {activePartType === 'legSet' && 
                getSetsOfType('legSet').map(legSet => (
                  <div
                    key={legSet.id}
                    className={`part-option ${getSelectedSetId('legSet') === legSet.id ? 'selected' : ''}`}
                    onClick={() => selectPartSet(legSet)}
                  >
                    <div className="set-preview">
                      <img src={legSet.leftImagePath} alt={`${legSet.name} Left`} className="part-image set-left" />
                      <img src={legSet.rightImagePath} alt={`${legSet.name} Right`} className="part-image set-right" />
                    </div>
                    <div className="part-info">
                      <span className="part-name">{legSet.name}</span>
                      <span className="part-source">from {legSet.source}</span>
                    </div>
                  </div>
                ))
              }

              {/* Render soul essences */}
              {activePartType === 'soulEssence' && 
                AVAILABLE_SOUL_ESSENCES.map(soulEssence => (
                  <div
                    key={soulEssence.id}
                    className={`part-option soul-option ${selectedParts.soulEssence?.id === soulEssence.id ? 'selected' : ''} rarity-${soulEssence.rarity}`}
                    onClick={() => selectSoulEssence(soulEssence)}
                  >
                    <img src={soulEssence.imagePath} alt={soulEssence.name} className="part-image soul-image" />
                    <div className="part-info">
                      <span className="part-name">{soulEssence.name}</span>
                      <span className="part-source">{soulEssence.description}</span>
                      <span className={`soul-rarity rarity-${soulEssence.rarity}`}>{soulEssence.rarity}</span>
                    </div>
                  </div>
                ))
              }
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
