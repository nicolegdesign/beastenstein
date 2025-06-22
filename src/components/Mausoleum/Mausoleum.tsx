import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomPersonality } from '../../data/personalities';
import type { Personality } from '../../data/personalities';
import { useBeastPartInventory } from '../../hooks/useBeastPartInventory';
import './Mausoleum.css';

interface BeastPart {
  id: string;
  name: string;
  imagePath: string;
  type: 'head' | 'torso' | 'armLeft' | 'armRight' | 'legLeft' | 'legRight';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface BeastPartSet {
  id: string;
  name: string;
  leftImagePath: string;
  rightImagePath: string;
  type: 'armSet' | 'legSet';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
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
  gender: 'male' | 'female';
  personality: Personality;
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

// Available beast parts from existing beasts (head and torso only)
const AVAILABLE_PARTS: BeastPart[] = [
  // Night Wolf parts
  {
    id: 'nightwolf-head',
    name: 'Night Wolf Head',
    imagePath: './images/beasts/night-wolf/night-wolf-head.svg',
    type: 'head',
    rarity: 'common'
  },
  {
    id: 'nightwolf-torso',
    name: 'Night Wolf Torso',
    imagePath: './images/beasts/night-wolf/night-wolf-torso.svg',
    type: 'torso',
    rarity: 'common'
  },
  // Mountain Dragon parts
  {
    id: 'mountaindragon-head',
    name: 'Mountain Dragon Head',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    type: 'head',
    rarity: 'common'
  },
  {
    id: 'mountaindragon-torso',
    name: 'Mountain Dragon Torso',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    type: 'torso',
    rarity: 'common'
  },
];

// Available arm and leg sets
const AVAILABLE_ARM_SETS: BeastPartSet[] = [
  {
    id: 'nightwolf-arms',
    name: 'Night Wolf Arms',
    leftImagePath: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    type: 'armSet',
    rarity: 'common'
  },
  {
    id: 'mountaindragon-arms',
    name: 'Mountain Dragon Arms',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    type: 'armSet',
    rarity: 'common'
  },
];

const AVAILABLE_LEG_SETS: BeastPartSet[] = [
  {
    id: 'nightwolf-legs',
    name: 'Night Wolf Legs',
    leftImagePath: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    type: 'legSet',
    rarity: 'common'
  },
  {
    id: 'mountaindragon-legs',
    name: 'Mountain Dragon Legs',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    type: 'legSet',
    rarity: 'common'
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
  const { getPartQuantity, getSetQuantity, getSoulEssenceQuantity, canCreateBeast, consumePartsForBeast } = useBeastPartInventory();
  
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
        imagePath: partSet.leftImagePath,
        type: 'armLeft',
        rarity: partSet.rarity
      };
      const rightArm: BeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        imagePath: partSet.rightImagePath,
        type: 'armRight',
        rarity: partSet.rarity
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
        imagePath: partSet.leftImagePath,
        type: 'legLeft',
        rarity: partSet.rarity
      };
      const rightLeg: BeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        imagePath: partSet.rightImagePath,
        type: 'legRight',
        rarity: partSet.rarity
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
      console.log("Trying to create with:", selectedParts);
      // Check if we can create the beast with current inventory
      const canCreate = canCreateBeast(
        selectedParts.head!.id,
        selectedParts.torso!.id,
        selectedParts.armLeft!.id,
        selectedParts.armRight!.id,
        selectedParts.legLeft!.id,
        selectedParts.legRight!.id,
        selectedParts.soulEssence!.id
      );

      if (!canCreate) {
        alert('Insufficient parts to create this beast! Some parts are out of stock.');
        return;
      }

      // Consume the parts
      const consumed = consumePartsForBeast(
        selectedParts.head!.id,
        selectedParts.torso!.id,
        selectedParts.armLeft!.id,
        selectedParts.armRight!.id,
        selectedParts.legLeft!.id,
        selectedParts.legRight!.id,
        selectedParts.soulEssence!.id
      );

      if (!consumed) {
        alert('Failed to consume parts for beast creation!');
        return;
      }

      // Randomly assign gender (50/50 chance for male/female)
      const gender = Math.random() < 0.5 ? 'male' : 'female';
      // Randomly assign personality
      const personality = getRandomPersonality();
      
      onCreateBeast({
        name: beastName,
        gender: gender,
        personality: personality,
        head: selectedParts.head!,
        torso: selectedParts.torso!,
        armLeft: selectedParts.armLeft!,
        armRight: selectedParts.armRight!,
        legLeft: selectedParts.legLeft!,
        legRight: selectedParts.legRight!,
        soulEssence: selectedParts.soulEssence!,
      });
      console.log("Consumed?", consumed);
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
                getPartsOfType(activePartType).map(part => {
                  const quantity = getPartQuantity(part.id);
                  const isOutOfStock = quantity <= 0;
                  return (
                    <div
                      key={part.id}
                      className={`part-option ${selectedParts[activePartType]?.id === part.id ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''} rarity-${part.rarity}`}
                      onClick={() => !isOutOfStock && selectPart(part)}
                    >
                      <img src={part.imagePath} alt={part.name} className="part-image" />
                      <div className="part-info">
                        <span className="part-name">{part.name}</span>
                        <span className={`part-rarity rarity-${part.rarity}`}>{part.rarity}</span>
                        <span className={`part-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>x{quantity}</span>
                      </div>
                    </div>
                  );
                })
              }
              
              {/* Render arm sets */}
              {activePartType === 'armSet' && 
                getSetsOfType('armSet').map(armSet => {
                  // Use set quantity directly
                  const setQuantity = getSetQuantity(armSet.id);
                  const isOutOfStock = setQuantity <= 0;
                  return (
                    <div
                      key={armSet.id}
                      className={`part-option ${getSelectedSetId('armSet') === armSet.id ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''} rarity-${armSet.rarity}`}
                      onClick={() => !isOutOfStock && selectPartSet(armSet)}
                    >
                      <div className="set-preview">
                        <img src={armSet.leftImagePath} alt={`${armSet.name} Left`} className="part-image set-left" />
                        <img src={armSet.rightImagePath} alt={`${armSet.name} Right`} className="part-image set-right" />
                      </div>
                      <div className="part-info">
                        <span className="part-name">{armSet.name}</span>
                        <span className={`part-rarity rarity-${armSet.rarity}`}>{armSet.rarity}</span>
                        <span className={`part-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>x{setQuantity}</span>
                      </div>
                    </div>
                  );
                })
              }
              
              {/* Render leg sets */}
              {activePartType === 'legSet' && 
                getSetsOfType('legSet').map(legSet => {
                  // Use set quantity directly
                  const setQuantity = getSetQuantity(legSet.id);
                  const isOutOfStock = setQuantity <= 0;
                  return (
                    <div
                      key={legSet.id}
                      className={`part-option ${getSelectedSetId('legSet') === legSet.id ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''} rarity-${legSet.rarity}`}
                      onClick={() => !isOutOfStock && selectPartSet(legSet)}
                    >
                      <div className="set-preview">
                        <img src={legSet.leftImagePath} alt={`${legSet.name} Left`} className="part-image set-left" />
                        <img src={legSet.rightImagePath} alt={`${legSet.name} Right`} className="part-image set-right" />
                      </div>
                      <div className="part-info">
                        <span className="part-name">{legSet.name}</span>
                        <span className={`part-rarity rarity-${legSet.rarity}`}>{legSet.rarity}</span>
                        <span className={`part-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>x{setQuantity}</span>
                      </div>
                    </div>
                  );
                })
              }

              {/* Render soul essences */}
              {activePartType === 'soulEssence' && 
                AVAILABLE_SOUL_ESSENCES.map(soulEssence => {
                  const quantity = getSoulEssenceQuantity(soulEssence.id);
                  const isOutOfStock = quantity <= 0;
                  return (
                    <div
                      key={soulEssence.id}
                      className={`part-option soul-option ${selectedParts.soulEssence?.id === soulEssence.id ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''} rarity-${soulEssence.rarity}`}
                      onClick={() => !isOutOfStock && selectSoulEssence(soulEssence)}
                    >
                      <img src={soulEssence.imagePath} alt={soulEssence.name} className="part-image soul-image" />
                      <div className="part-info">
                        <span className="part-name">{soulEssence.name}</span>
                        <span className="part-description">{soulEssence.description}</span>
                        <span className={`soul-rarity rarity-${soulEssence.rarity}`}>{soulEssence.rarity}</span>
                        <span className={`part-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>x{quantity}</span>
                      </div>
                    </div>
                  );
                })
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
