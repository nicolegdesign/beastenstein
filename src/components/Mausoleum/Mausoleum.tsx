import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomPersonality } from '../../data/personalities';
import type { Personality } from '../../data/personalities';
import { useBeastPartInventory } from '../../hooks/useBeastPartInventory';
import type { EnhancedBeastPart, EnhancedBeastPartSet, StatBonus, Ability } from '../../types/abilities';
import { ABILITIES } from '../../data/abilities';
import './Mausoleum.css';

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
  head: EnhancedBeastPart;
  torso: EnhancedBeastPart;
  armLeft: EnhancedBeastPart;
  armRight: EnhancedBeastPart;
  legLeft: EnhancedBeastPart;
  legRight: EnhancedBeastPart;
  soulEssence: SoulEssence;
  // Calculated stats and abilities
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

interface MausoleumProps {
  onClose: () => void;
  onCreateBeast: (beast: CustomBeast) => void;
}

// Available beast parts from existing beasts (head and torso only)
const AVAILABLE_PARTS: EnhancedBeastPart[] = [
  // Night Wolf parts
  {
    id: 'nightwolf-head',
    name: 'Night Wolf Head',
    imagePath: './images/beasts/night-wolf/night-wolf-head.svg',
    type: 'head',
    rarity: 'common',
    statBonus: { magic: 2 },
    ability: ABILITIES.howl
  },
  {
    id: 'nightwolf-torso',
    name: 'Night Wolf Torso',
    imagePath: './images/beasts/night-wolf/night-wolf-torso.svg',
    type: 'torso',
    rarity: 'common',
    statBonus: { defense: 3, health: 10 }
    // No ability for torsos
  },
  // Mountain Dragon parts
  {
    id: 'mountaindragon-head',
    name: 'Mountain Dragon Head',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    type: 'head',
    rarity: 'common',
    statBonus: { magic: 3, attack: 1 },
    ability: ABILITIES.dragonBreath
  },
  {
    id: 'mountaindragon-torso',
    name: 'Mountain Dragon Torso',
    imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    type: 'torso',
    rarity: 'common',
    statBonus: { defense: 4, health: 15 }
    // No ability for torsos
  },
  // Wooden Mannequin parts
  {
    id: 'woodenmannequin-head',
    name: 'Wooden Mannequin Head',
    imagePath: './images/beasts/wooden-mannequin/wooden-mannequin-head.svg',
    type: 'head',
    rarity: 'common',
    statBonus: { defense: 2, health: 5 },
    ability: {
      id: 'splinter',
      name: 'Splinter',
      description: 'Wooden fragments pierce the enemy',
      type: 'attack' as const,
      damage: 8,
      cooldown: 1,
      manaCost: 3
    }
  },
  {
    id: 'woodenmannequin-torso',
    name: 'Wooden Mannequin Torso',
    imagePath: './images/beasts/wooden-mannequin/wooden-mannequin-torso.svg',
    type: 'torso',
    rarity: 'common',
    statBonus: { defense: 5, health: 20 }
    // No ability for torsos
  },
];

// Available arm and leg sets
const AVAILABLE_ARM_SETS: EnhancedBeastPartSet[] = [
  {
    id: 'nightwolf-arms',
    name: 'Night Wolf Arms',
    leftImagePath: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    type: 'armSet',
    rarity: 'common',
    statBonus: { attack: 2, speed: 1 },
    ability: ABILITIES.slash
  },
  {
    id: 'mountaindragon-arms',
    name: 'Mountain Dragon Arms',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    type: 'armSet',
    rarity: 'common',
    statBonus: { attack: 3, magic: 1 },
    ability: ABILITIES.dragonClaw
  },
  {
    id: 'woodenmannequin-arms',
    name: 'Wooden Mannequin Arms',
    leftImagePath: './images/beasts/wooden-mannequin/wooden-mannequin-arm-l.svg',
    rightImagePath: './images/beasts/wooden-mannequin/wooden-mannequin-arm-r.svg',
    type: 'armSet',
    rarity: 'common',
    statBonus: { defense: 2, health: 10 },
    ability: {
      id: 'woodenStrike',
      name: 'Wooden Strike',
      description: 'A sturdy wooden blow',
      type: 'attack' as const,
      damage: 6,
      cooldown: 1,
      manaCost: 2
    }
  },
];

const AVAILABLE_LEG_SETS: EnhancedBeastPartSet[] = [
  {
    id: 'nightwolf-legs',
    name: 'Night Wolf Legs',
    leftImagePath: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    rightImagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    type: 'legSet',
    rarity: 'common',
    statBonus: { speed: 3, defense: 1 },
    ability: ABILITIES.charge
  },
  {
    id: 'mountaindragon-legs',
    name: 'Mountain Dragon Legs',
    leftImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    rightImagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    type: 'legSet',
    rarity: 'common',
    statBonus: { speed: 2, attack: 2 },
    ability: ABILITIES.dragonLeap
  },
  {
    id: 'woodenmannequin-legs',
    name: 'Wooden Mannequin Legs',
    leftImagePath: './images/beasts/wooden-mannequin/wooden-mannequin-leg-l.svg',
    rightImagePath: './images/beasts/wooden-mannequin/wooden-mannequin-leg-r.svg',
    type: 'legSet',
    rarity: 'common',
    statBonus: { defense: 3, speed: 1 },
    ability: {
      id: 'rootedStance',
      name: 'Rooted Stance',
      description: 'Plant firmly for increased defense',
      type: 'buff' as const,
      cooldown: 3,
      manaCost: 8,
      effects: {
        statModifier: { defense: 3 },
        duration: 3
      }
    }
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
  
  // Calculate total stat bonuses and available abilities
  const calculateBeastStats = (): { totalStatBonus: StatBonus; availableAbilities: Ability[] } => {
    const totalStatBonus: StatBonus = {
      attack: 0,
      defense: 0,
      speed: 0,
      magic: 0,
      health: 0
    };
    const availableAbilities: Ability[] = [];

    // Add bonuses from each part
    const parts = [
      selectedParts.head,
      selectedParts.torso,
      selectedParts.armLeft,
      selectedParts.armRight,
      selectedParts.legLeft,
      selectedParts.legRight
    ];

    parts.forEach(part => {
      if (part) {
        Object.keys(part.statBonus).forEach(stat => {
          const statKey = stat as keyof StatBonus;
          totalStatBonus[statKey] = (totalStatBonus[statKey] || 0) + (part.statBonus[statKey] || 0);
        });

        // Add ability if it exists and isn't already added
        if (part.ability && !availableAbilities.some(a => a.id === part.ability!.id)) {
          availableAbilities.push(part.ability);
        }
      }
    });

    return { totalStatBonus, availableAbilities };
  };

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

  const getPartsOfType = (type: EnhancedBeastPart['type']) => {
    return AVAILABLE_PARTS.filter(part => part.type === type);
  };

  const getSetsOfType = (type: EnhancedBeastPartSet['type']) => {
    if (type === 'armSet') return AVAILABLE_ARM_SETS;
    if (type === 'legSet') return AVAILABLE_LEG_SETS;
    return [];
  };

  const selectPart = (part: EnhancedBeastPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.type]: part
    }));
  };

  const selectPartSet = (partSet: EnhancedBeastPartSet) => {
    if (partSet.type === 'armSet') {
      // Create enhanced arm parts from the set
      const leftArm: EnhancedBeastPart = {
        id: `${partSet.id}-left`,
        name: `${partSet.name} Left`,
        imagePath: partSet.leftImagePath,
        type: 'armLeft',
        rarity: partSet.rarity,
        statBonus: partSet.statBonus,
        ability: partSet.ability
      };
      const rightArm: EnhancedBeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        imagePath: partSet.rightImagePath,
        type: 'armRight',
        rarity: partSet.rarity,
        statBonus: partSet.statBonus,
        ability: partSet.ability
      };
      
      setSelectedParts(prev => ({
        ...prev,
        armLeft: leftArm,
        armRight: rightArm
      }));
    } else if (partSet.type === 'legSet') {
      // Create enhanced leg parts from the set
      const leftLeg: EnhancedBeastPart = {
        id: `${partSet.id}-left`,
        name: `${partSet.name} Left`,
        imagePath: partSet.leftImagePath,
        type: 'legLeft',
        rarity: partSet.rarity,
        statBonus: partSet.statBonus,
        ability: partSet.ability
      };
      const rightLeg: EnhancedBeastPart = {
        id: `${partSet.id}-right`,
        name: `${partSet.name} Right`,
        imagePath: partSet.rightImagePath,
        type: 'legRight',
        rarity: partSet.rarity,
        statBonus: partSet.statBonus,
        ability: partSet.ability
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

      // Calculate total stats and abilities
      const { totalStatBonus, availableAbilities } = calculateBeastStats();

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
        totalStatBonus,
        availableAbilities
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
            <h3>Beast Preview</h3>          
            <div className="preview-container">
              <div className="preview-beast">
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

          {/* Stat Bonuses and Abilities Display */}
          {(() => {
            const { totalStatBonus, availableAbilities } = calculateBeastStats();
            return (
              <>
                {/* Stat Bonuses Display */}
                {Object.keys(totalStatBonus).some(key => totalStatBonus[key as keyof StatBonus]! > 0) && (
                  <div className="stat-bonuses">
                    <h4>Stat Bonuses</h4>
                    <div className="bonus-list">
                      {totalStatBonus.attack! > 0 && <span className="stat-bonus attack">⚔️ +{totalStatBonus.attack} Attack</span>}
                      {totalStatBonus.defense! > 0 && <span className="stat-bonus defense">🛡️ +{totalStatBonus.defense} Defense</span>}
                      {totalStatBonus.speed! > 0 && <span className="stat-bonus speed">⚡ +{totalStatBonus.speed} Speed</span>}
                      {totalStatBonus.magic! > 0 && <span className="stat-bonus magic">🔮 +{totalStatBonus.magic} Magic</span>}
                      {totalStatBonus.health! > 0 && <span className="stat-bonus health">❤️ +{totalStatBonus.health} Health</span>}
                    </div>
                  </div>
                )}

                {/* Available Abilities Display */}
                {availableAbilities.length > 0 && (
                  <div className="available-abilities">
                    <h4>Battle Abilities</h4>
                    <div className="ability-list">
                      {availableAbilities.map(ability => (
                        <div key={ability.id} className={`ability-preview ${ability.type}`}>
                          <span className="ability-name">{ability.name}</span>
                          <span className="ability-description">{ability.description}</span>
                          {ability.damage && <span className="ability-damage">💥 {ability.damage} damage</span>}
                          {ability.healing && <span className="ability-healing">💚 {ability.healing} healing</span>}
                          <span className="ability-cooldown">🕐 {ability.cooldown} turn cooldown</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
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
                        
                        {/* Stat bonuses */}
                        <div className="part-stats">
                          {Object.entries(part.statBonus).map(([stat, value]) => 
                            value && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          )}
                        </div>
                        
                        {/* Ability */}
                        {part.ability && (
                          <div className="part-ability">
                            <span className="ability-name">⚡ {part.ability.name}</span>
                          </div>
                        )}
                        
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
                        
                        {/* Stat bonuses */}
                        <div className="part-stats">
                          {Object.entries(armSet.statBonus).map(([stat, value]) => 
                            value && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          )}
                        </div>
                        
                        {/* Ability */}
                        {armSet.ability && (
                          <div className="part-ability">
                            <span className="ability-name">⚡ {armSet.ability.name}</span>
                          </div>
                        )}
                        
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
                        
                        {/* Stat bonuses */}
                        <div className="part-stats">
                          {Object.entries(legSet.statBonus).map(([stat, value]) => 
                            value && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          )}
                        </div>
                        
                        {/* Ability */}
                        {legSet.ability && (
                          <div className="part-ability">
                            <span className="ability-name">⚡ {legSet.ability.name}</span>
                          </div>
                        )}
                        
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
