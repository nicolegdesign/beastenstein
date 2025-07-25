import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomPersonality } from '../../data/personalities';
import type { Personality } from '../../data/personalities';
import { useBeastPartInventory } from '../../hooks/useBeastPartInventory';
import type { EnhancedBeastPart, EnhancedBeastPartSet, StatBonus, Ability } from '../../types/abilities';
import { BEAST_PARTS, ARM_SETS, LEG_SETS, EXTRA_LIMBS } from '../../data/beastParts';
import { SOUL_ESSENCES, type SoulEssence } from '../../data/soulEssences';
import './Mausoleum.css';

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
  wings?: EnhancedBeastPart;
  tail?: EnhancedBeastPart;
  soulEssence: SoulEssence;
  // Calculated stats and abilities
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

interface MausoleumProps {
  onClose: () => void;
  onCreateBeast: (beast: CustomBeast) => void;
}

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
      selectedParts.legRight,
      selectedParts.wings,
      selectedParts.tail
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
  const [activePartType, setActivePartType] = useState<'head' | 'torso' | 'armSet' | 'legSet' | 'extraLimbs' | 'soulEssence'>('head');

  const getPartsOfType = (type: EnhancedBeastPart['type']) => {
    return BEAST_PARTS.filter(part => part.type === type);
  };

  const getSetsOfType = (type: EnhancedBeastPartSet['type']) => {
    if (type === 'armSet') return ARM_SETS;
    if (type === 'legSet') return LEG_SETS;
    return [];
  };

  const selectPart = (part: EnhancedBeastPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.type]: part
    }));
  };

  const selectExtraLimb = (part: EnhancedBeastPart) => {
    if (part.type === 'wings' || part.type === 'tail') {
      setSelectedParts(prev => ({
        ...prev,
        [part.type]: part
      }));
    }
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
        selectedParts.soulEssence!.id,
        selectedParts.wings?.id,
        selectedParts.tail?.id
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
        selectedParts.soulEssence!.id,
        selectedParts.wings?.id,
        selectedParts.tail?.id
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
        wings: selectedParts.wings,
        tail: selectedParts.tail,
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
    { key: 'extraLimbs' as const, label: 'Extra Limbs' },
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
                  
                  {/* Extra Limbs */}
                  {selectedParts.wings && (
                    <img src={selectedParts.wings.imagePath} alt="Wings" className="preview-part preview-wings" />
                  )}
                  {selectedParts.tail && (
                    <img src={selectedParts.tail.imagePath} alt="Tail" className="preview-part preview-tail" />
                  )}
                  
                  {/* Soul Essence Display */}
                  {selectedParts.soulEssence && (
                    <div className="preview-soul-essence">
                      <img src={selectedParts.soulEssence.imagePath} alt={selectedParts.soulEssence.name} className="preview-soul-image" />
                      
                    </div>
                  )}
                </div>
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
                  {partType.key === 'extraLimbs' && (selectedParts.wings || selectedParts.tail) && <span className="tab-indicator">✓</span>}
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
                            value && typeof value === 'number' && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          ).filter(Boolean)}
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
                            value && typeof value === 'number' && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          ).filter(Boolean)}
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
                            value && typeof value === 'number' && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          ).filter(Boolean)}
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

              {/* Render extra limbs */}
              {activePartType === 'extraLimbs' && 
                EXTRA_LIMBS.map(extraLimb => {
                  const quantity = getPartQuantity(extraLimb.id);
                  const isOutOfStock = quantity <= 0;
                  const isSelected = (extraLimb.type === 'wings' && selectedParts.wings?.id === extraLimb.id) ||
                                   (extraLimb.type === 'tail' && selectedParts.tail?.id === extraLimb.id);
                  return (
                    <div
                      key={extraLimb.id}
                      className={`part-option ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''} rarity-${extraLimb.rarity}`}
                      onClick={() => !isOutOfStock && selectExtraLimb(extraLimb)}
                    >
                      <img src={extraLimb.imagePath} alt={extraLimb.name} className="part-image" />
                      <div className="part-info">
                        <span className="part-name">{extraLimb.name}</span>
                        <span className={`part-rarity rarity-${extraLimb.rarity}`}>{extraLimb.rarity}</span>
                        
                        {/* Stat bonuses */}
                        <div className="part-stats">
                          {Object.entries(extraLimb.statBonus).map(([stat, value]) => 
                            value && typeof value === 'number' && value > 0 && (
                              <span key={stat} className={`stat-bonus ${stat}`}>
                                +{value} {stat}
                              </span>
                            )
                          ).filter(Boolean)}
                        </div>
                        
                        {/* Ability */}
                        {extraLimb.ability && (
                          <div className="part-ability">
                            <span className="ability-name">⚡ {extraLimb.ability.name}</span>
                          </div>
                        )}
                        
                        <span className={`part-quantity ${isOutOfStock ? 'out-of-stock' : ''}`}>x{quantity}</span>
                      </div>
                    </div>
                  );
                })
              }

              {/* Render soul essences */}
              {activePartType === 'soulEssence' && 
                SOUL_ESSENCES.map(soulEssence => {
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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
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

          {/* Stat Bonuses and Abilities Display */}
          {(() => {
            const { totalStatBonus, availableAbilities } = calculateBeastStats();
            return (
              <>
                <div className="beast-stats-abilities-container">
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
                </div>
              </>
            );
          })()}


        </div>
      </div>
    </div>
  );
};
