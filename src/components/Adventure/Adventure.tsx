import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCustomBeast } from '../AnimatedCustomBeast/AnimatedCustomBeast';
import { useInventoryContext } from '../../contexts/InventoryContext';
import type { BeastCombatStats } from '../../types/game';
import type { EnhancedBeastPart, Ability, StatBonus } from '../../types/abilities';
import './Adventure.css';

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
  head: EnhancedBeastPart;
  torso: EnhancedBeastPart;
  armLeft: EnhancedBeastPart;
  armRight: EnhancedBeastPart;
  legLeft: EnhancedBeastPart;
  legRight: EnhancedBeastPart;
  soulEssence: SoulEssence;
  colorScheme?: { id: string; name: string; primary: string; secondary: string; accent: string; rarity: string };
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

interface AbilityCooldown {
  abilityId: string;
  turnsLeft: number;
}

interface CombatState {
  playerHealth: number;
  playerMana: number;
  opponentHealth: number;
  playerAbilityCooldowns: AbilityCooldown[];
  statusEffects: {
    player: { [key: string]: { duration: number; value: number } };
    opponent: { [key: string]: { duration: number; value: number } };
  };
  turn: 'player' | 'opponent';
}

interface DroppedLoot {
  id: string;
  name: string;
  type: 'part' | 'set';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath: string;
}

interface AdventureProps {
  currentBeastId: string;
  playerStats: BeastCombatStats & { health: number };
  onClose: () => void;
  onUpdateExperience: (beastId: string, newExperience: number) => boolean;
}

export const Adventure: React.FC<AdventureProps> = ({ currentBeastId, playerStats, onClose, onUpdateExperience }) => {
  const { setInventory } = useInventoryContext();
  const [gameState, setGameState] = useState<'setup' | 'battle' | 'victory' | 'defeat' | 'loot'>('setup');
  const [opponentLevel] = useState(1); // Start with level 1 opponents
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [opponent, setOpponent] = useState<CustomBeast | null>(null);
  const [opponentStats] = useState<BeastCombatStats>({
    attack: 5,
    defense: 4,
    speed: 3,
    magic: 2
  });
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [droppedLoot, setDroppedLoot] = useState<DroppedLoot | null>(null);
  const [experienceGained, setExperienceGained] = useState<number>(0);
  
  // Enhanced combat state
  const [combatState, setCombatState] = useState<CombatState>({
    playerHealth: playerStats.health,
    playerMana: 50, // Starting mana
    opponentHealth: 30,
    playerAbilityCooldowns: [],
    statusEffects: {
      player: {},
      opponent: {}
    },
    turn: 'player'
  });

  // Generate random opponent
  useEffect(() => {
    const generateOpponent = (): CustomBeast => {
      const availableParts = {
        heads: [
          { id: 'nightwolf-head', name: 'Night Wolf Head', imagePath: './images/beasts/night-wolf/night-wolf-head.svg', type: 'head' as const, rarity: 'common' as const },
          { id: 'mountaindragon-head', name: 'Mountain Dragon Head', imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg', type: 'head' as const, rarity: 'common' as const }
        ],
        torsos: [
          { id: 'nightwolf-torso', name: 'Night Wolf Torso', imagePath: './images/beasts/night-wolf/night-wolf-torso.svg', type: 'torso' as const, rarity: 'common' as const },
          { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg', type: 'torso' as const, rarity: 'common' as const }
        ],
        arms: [
          { left: './images/beasts/night-wolf/night-wolf-arm-l.svg', right: './images/beasts/night-wolf/night-wolf-arm-r.svg', name: 'Night Wolf Arms' },
          { left: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg', name: 'Mountain Dragon Arms' }
        ],
        legs: [
          { left: './images/beasts/night-wolf/night-wolf-leg-l.svg', right: './images/beasts/night-wolf/night-wolf-leg-r.svg', name: 'Night Wolf Legs' },
          { left: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg', name: 'Mountain Dragon Legs' }
        ]
      };

      const randomHead = availableParts.heads[Math.floor(Math.random() * availableParts.heads.length)];
      const randomTorso = availableParts.torsos[Math.floor(Math.random() * availableParts.torsos.length)];
      const randomArms = availableParts.arms[Math.floor(Math.random() * availableParts.arms.length)];
      const randomLegs = availableParts.legs[Math.floor(Math.random() * availableParts.legs.length)];

      return {
        name: 'Wild Beast',
        gender: Math.random() < 0.5 ? 'male' : 'female',
        head: {
          ...randomHead,
          statBonus: { magic: 1 },
          ability: {
            id: 'bite',
            name: 'Bite',
            description: 'A savage bite attack',
            type: 'attack' as const,
            damage: 12,
            cooldown: 2,
            manaCost: 5
          }
        },
        torso: {
          ...randomTorso,
          statBonus: { defense: 2, health: 5 }
        },
        armLeft: {
          id: 'opponent-arm-left',
          name: `${randomArms.name} Left`,
          imagePath: randomArms.left,
          type: 'armLeft',
          rarity: 'common',
          statBonus: { attack: 1 }
        },
        armRight: {
          id: 'opponent-arm-right',
          name: `${randomArms.name} Right`,
          imagePath: randomArms.right,
          type: 'armRight',
          rarity: 'common',
          statBonus: { attack: 1 },
          ability: {
            id: 'claw',
            name: 'Claw',
            description: 'Sharp claw attack',
            type: 'attack' as const,
            damage: 10,
            cooldown: 1,
            manaCost: 3
          }
        },
        legLeft: {
          id: 'opponent-leg-left',
          name: `${randomLegs.name} Left`,
          imagePath: randomLegs.left,
          type: 'legLeft',
          rarity: 'common',
          statBonus: { speed: 1 }
        },
        legRight: {
          id: 'opponent-leg-right',
          name: `${randomLegs.name} Right`,
          imagePath: randomLegs.right,
          type: 'legRight',
          rarity: 'common',
          statBonus: { speed: 1 }
        },
        soulEssence: {
          id: 'dim-soul',
          name: 'Dim Soul',
          description: 'A faint glimmer of spiritual energy',
          imagePath: './images/items/dim-soul.png',
          rarity: 'common'
        },
        totalStatBonus: { attack: 2, defense: 2, speed: 2, magic: 1, health: 5 },
        availableAbilities: [
          {
            id: 'bite',
            name: 'Bite',
            description: 'A savage bite attack',
            type: 'attack' as const,
            damage: 12,
            cooldown: 2,
            manaCost: 5
          },
          {
            id: 'claw',
            name: 'Claw',
            description: 'Sharp claw attack',
            type: 'attack' as const,
            damage: 10,
            cooldown: 1,
            manaCost: 3
          }
        ]
      };
    };

    const newOpponent = generateOpponent();
    setOpponent(newOpponent);
    
    // Determine who goes first based on speed
    if (playerStats.speed >= opponentStats.speed) {
      setCurrentTurn('player');
      setBattleLog(['Battle begins! You move first!']);
    } else {
      setCurrentTurn('opponent');
      setBattleLog(['Battle begins! The opponent moves first!']);
    }
    
    setGameState('battle');
  }, [playerStats.speed, opponentStats.speed]);

  // Generate loot drop based on rarity weights
  const generateLoot = (): DroppedLoot => {
    const availableLoot = [
      // Individual parts (head, torso only)
      { id: 'nightwolf-head', name: 'Night Wolf Head', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-head.svg' },
      { id: 'nightwolf-torso', name: 'Night Wolf Torso', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-torso.svg' },
      { id: 'mountaindragon-head', name: 'Mountain Dragon Head', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg' },
      { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg' },
      { id: 'forestsprite-head', name: 'Forest Sprite Head', type: 'part' as const, rarity: 'uncommon' as const, imagePath: './images/beasts/forest-sprite/forest-sprite-head.svg' },
      { id: 'forestsprite-torso', name: 'Forest Sprite Torso', type: 'part' as const, rarity: 'uncommon' as const, imagePath: './images/beasts/forest-sprite/forest-sprite-torso.svg' },
      { id: 'shadowbeast-head', name: 'Shadow Beast Head', type: 'part' as const, rarity: 'rare' as const, imagePath: './images/beasts/shadow-beast/shadow-beast-head.svg' },
      { id: 'shadowbeast-torso', name: 'Shadow Beast Torso', type: 'part' as const, rarity: 'rare' as const, imagePath: './images/beasts/shadow-beast/shadow-beast-torso.svg' },
      { id: 'thundereagle-head', name: 'Thunder Eagle Head', type: 'part' as const, rarity: 'epic' as const, imagePath: './images/beasts/thunder-eagle/thunder-eagle-head.svg' },
      { id: 'thundereagle-torso', name: 'Thunder Eagle Torso', type: 'part' as const, rarity: 'epic' as const, imagePath: './images/beasts/thunder-eagle/thunder-eagle-torso.svg' },
      { id: 'frostwolf-head', name: 'Frost Wolf Head', type: 'part' as const, rarity: 'legendary' as const, imagePath: './images/beasts/frost-wolf/frost-wolf-head.svg' },
      { id: 'frostwolf-torso', name: 'Frost Wolf Torso', type: 'part' as const, rarity: 'legendary' as const, imagePath: './images/beasts/frost-wolf/frost-wolf-torso.svg' },
      
      // Arm and leg sets
      { id: 'nightwolf-arms', name: 'Night Wolf Arms', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg' },
      { id: 'nightwolf-legs', name: 'Night Wolf Legs', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg' },
      { id: 'mountaindragon-arms', name: 'Mountain Dragon Arms', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg' },
      { id: 'mountaindragon-legs', name: 'Mountain Dragon Legs', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg' }
    ];

    // Rarity weights (higher = more common)
    const rarityWeights = {
      'common': 50,
      'uncommon': 25,
      'rare': 15,
      'epic': 8,
      'legendary': 2
    };

    // Create weighted array
    const weightedLoot: typeof availableLoot = [];
    availableLoot.forEach(item => {
      const weight = rarityWeights[item.rarity];
      for (let i = 0; i < weight; i++) {
        weightedLoot.push(item);
      }
    });

    // Select random item
    const selectedLoot = weightedLoot[Math.floor(Math.random() * weightedLoot.length)];
    return selectedLoot;
  };

  // Calculate experience gained based on opponent level
  const calculateExperienceGain = (defeatedLevel: number): number => {
    return defeatedLevel * 50; // 10 XP per opponent level
  };

  // Add experience to the player's beast
  const gainExperience = (expGained: number) => {
    console.log('gainExperience called with:', expGained, 'for beast:', currentBeastId);
    try {
      // Get current experience from single source of truth
      const currentExp = getCurrentExperience();
      const newExp = currentExp + expGained;
      
      // Use the prop function to update experience globally
      const success = onUpdateExperience(currentBeastId, newExp);
      
      if (success) {
        console.log('Updated experience - Current exp:', currentExp, 'New exp:', newExp);
        setExperienceGained(expGained);
        setBattleLog(prev => [...prev, `Your beast gained ${expGained} experience!`]);
        console.log('Experience updated successfully, UI state set to:', expGained);
      } else {
        console.error('Failed to update experience via prop function');
      }
    } catch (error) {
      console.error('Failed to update beast experience:', error);
    }
  };

  // Get current experience from main beastData storage
  const getCurrentExperience = (): number => {
    try {
      const beastDataKey = `beastData`;
      const mainBeastData = localStorage.getItem(beastDataKey);
      
      if (mainBeastData) {
        const allBeastData = JSON.parse(mainBeastData);
        if (allBeastData[currentBeastId]) {
          return allBeastData[currentBeastId].experience || 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Failed to get current experience:', error);
      return 0;
    }
  };

  // Enhanced combat functions with abilities
  const castAbility = (ability: Ability) => {
    if (currentTurn !== 'player' || gameState !== 'battle') return;
    if (combatState.playerMana < (ability.manaCost || 0)) {
      setBattleLog(prev => [...prev, `Not enough mana to use ${ability.name}! (Need ${ability.manaCost})`]);
      return;
    }

    // Check cooldown
    const cooldown = combatState.playerAbilityCooldowns.find(cd => cd.abilityId === ability.id);
    if (cooldown && cooldown.turnsLeft > 0) {
      setBattleLog(prev => [...prev, `${ability.name} is on cooldown for ${cooldown.turnsLeft} more turns!`]);
      return;
    }

    // Calculate final stats with bonuses and status effects
    const getEffectiveStats = (baseStats: BeastCombatStats, statBonuses: StatBonus, statusEffects: { [key: string]: { duration: number; value: number } }) => {
      return {
        attack: baseStats.attack + (statBonuses.attack || 0) + Object.values(statusEffects).reduce((acc: number, effect: { duration: number; value: number }) => acc + (effect.value || 0), 0),
        defense: baseStats.defense + (statBonuses.defense || 0),
        speed: baseStats.speed + (statBonuses.speed || 0),
        magic: baseStats.magic + (statBonuses.magic || 0)
      };
    };

    // Get player's effective stats
    const playerEffectiveStats = getEffectiveStats(
      playerStats, 
      playerBeast?.totalStatBonus || {}, 
      combatState.statusEffects.player
    );

    setCombatState(prev => {
      const newState = { ...prev };
      
      // Consume mana
      newState.playerMana -= (ability.manaCost || 0);
      
      // Apply ability effects
      if (ability.type === 'attack') {
        const baseDamage = ability.damage || 0;
        const bonusDamage = Math.floor(playerEffectiveStats.attack / 2);
        const totalDamage = Math.max(1, baseDamage + bonusDamage);
        
        newState.opponentHealth = Math.max(0, prev.opponentHealth - totalDamage);
        setBattleLog(prevLog => [...prevLog, `You use ${ability.name} for ${totalDamage} damage!`]);
        
        if (newState.opponentHealth <= 0) {
          handleVictory();
          return newState;
        }
      } else if (ability.type === 'heal') {
        const healing = ability.healing || 0;
        newState.playerHealth = Math.min(playerStats.health, prev.playerHealth + healing);
        setBattleLog(prevLog => [...prevLog, `You use ${ability.name} and heal for ${healing} HP!`]);
      } else if (ability.type === 'buff' && ability.effects?.statModifier) {
        // Apply buff to player
        const duration = ability.effects.duration || 3;
        Object.entries(ability.effects.statModifier).forEach(([stat, value]) => {
          if (value) {
            newState.statusEffects.player[`${ability.id}_${stat}`] = { duration, value };
          }
        });
        setBattleLog(prevLog => [...prevLog, `You use ${ability.name} and feel empowered!`]);
      } else if (ability.type === 'debuff' && ability.effects?.statModifier) {
        // Apply debuff to opponent
        const duration = ability.effects.duration || 3;
        Object.entries(ability.effects.statModifier).forEach(([stat, value]) => {
          if (value) {
            newState.statusEffects.opponent[`${ability.id}_${stat}`] = { duration, value };
          }
        });
        setBattleLog(prevLog => [...prevLog, `You use ${ability.name} and weaken your opponent!`]);
      }
      
      // Set cooldown
      const cooldownIndex = newState.playerAbilityCooldowns.findIndex(cd => cd.abilityId === ability.id);
      if (cooldownIndex >= 0) {
        newState.playerAbilityCooldowns[cooldownIndex].turnsLeft = ability.cooldown;
      } else {
        newState.playerAbilityCooldowns.push({ abilityId: ability.id, turnsLeft: ability.cooldown });
      }
      
      newState.turn = 'opponent';
      return newState;
    });

    setCurrentTurn('opponent');
    
    // Opponent attacks after a delay
    setTimeout(() => {
      opponentAttack();
    }, 1500);
  };

  const handleVictory = () => {
    setGameState('victory');
    setBattleLog(prev => [...prev, 'Victory! You defeated the wild beast!']);
    
    // Generate loot drop
    const loot = generateLoot();
    setDroppedLoot(loot);
    setBattleLog(prev => [...prev, `The opponent dropped: ${loot.name}!`]);
    
    // Add loot to inventory
    if (loot.type === 'part') {
      setInventory(prev => ({
        ...prev,
        parts: {
          ...prev.parts,
          [loot.id]: (prev.parts[loot.id] || 0) + 1
        }
      }));
    } else if (loot.type === 'set') {
      setInventory(prev => ({
        ...prev,
        sets: {
          ...prev.sets,
          [loot.id]: (prev.sets[loot.id] || 0) + 1
        }
      }));
    }
    
    // Calculate and gain experience
    const expGained = calculateExperienceGain(opponentLevel);
    console.log('Victory! Calculating experience:', expGained, 'for opponent level:', opponentLevel);
    gainExperience(expGained);
  };

  const basicAttack = () => {
    if (currentTurn !== 'player' || gameState !== 'battle') return;

    // Calculate damage with stat bonuses
    const playerEffectiveAttack = playerStats.attack + (playerBeast?.totalStatBonus?.attack || 0);
    const opponentEffectiveDefense = opponentStats.defense + (opponent?.totalStatBonus?.defense || 0);
    const damage = Math.max(1, playerEffectiveAttack - Math.floor(opponentEffectiveDefense / 2) + Math.floor(Math.random() * 3) - 1);
    
    setCombatState(prev => {
      const newOpponentHealth = Math.max(0, prev.opponentHealth - damage);
      setBattleLog(prevLog => [...prevLog, `You attack for ${damage} damage!`]);
      
      if (newOpponentHealth <= 0) {
        handleVictory();
        return { ...prev, opponentHealth: newOpponentHealth };
      }
      
      return { ...prev, opponentHealth: newOpponentHealth, turn: 'opponent' };
    });

    setCurrentTurn('opponent');
    
    // Opponent attacks after a delay
    setTimeout(() => {
      opponentAttack();
    }, 1500);
  };

  const updateCooldowns = () => {
    setCombatState(prev => {
      // Update status effects
      const newPlayerEffects: { [key: string]: { duration: number; value: number } } = {};
      const newOpponentEffects: { [key: string]: { duration: number; value: number } } = {};
      
      // Reduce duration and keep active effects
      Object.entries(prev.statusEffects.player).forEach(([key, effect]) => {
        if (effect.duration > 1) {
          newPlayerEffects[key] = { ...effect, duration: effect.duration - 1 };
        }
      });
      
      Object.entries(prev.statusEffects.opponent).forEach(([key, effect]) => {
        if (effect.duration > 1) {
          newOpponentEffects[key] = { ...effect, duration: effect.duration - 1 };
        }
      });
      
      return {
        ...prev,
        playerMana: Math.min(50, prev.playerMana + 5), // Regenerate 5 mana per turn
        playerAbilityCooldowns: prev.playerAbilityCooldowns.map(cd => ({
          ...cd,
          turnsLeft: Math.max(0, cd.turnsLeft - 1)
        })).filter(cd => cd.turnsLeft > 0),
        statusEffects: {
          player: newPlayerEffects,
          opponent: newOpponentEffects
        }
      };
    });
  };

  const opponentAttack = () => {
    if (gameState !== 'battle') return;

    // Opponent might use an ability (simple AI)
    const shouldUseAbility = opponent?.availableAbilities && Math.random() < 0.3; // 30% chance
    
    if (shouldUseAbility && opponent?.availableAbilities.length > 0) {
      const availableAbilities = opponent.availableAbilities.filter(ability => 
        !(ability.manaCost && ability.manaCost > 30) // Assume opponent has 30 mana
      );
      
      if (availableAbilities.length > 0) {
        const randomAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
        
        if (randomAbility.type === 'attack') {
          const finalAttack = opponentStats.attack + (opponent.totalStatBonus.attack || 0);
          const finalPlayerDefense = playerStats.defense + (playerBeast?.totalStatBonus?.defense || 0);
          const damage = (randomAbility.damage || 0) + Math.floor(finalAttack / 2) - Math.floor(finalPlayerDefense / 2);
          
          setCombatState(prev => {
            const newPlayerHealth = Math.max(0, prev.playerHealth - damage);
            setBattleLog(prevLog => [...prevLog, `Opponent uses ${randomAbility.name} for ${damage} damage!`]);
            
            if (newPlayerHealth <= 0) {
              setGameState('defeat');
              setBattleLog(prevLog => [...prevLog, 'Defeat! Your beast has fallen...']);
              return { ...prev, playerHealth: newPlayerHealth };
            }
            
            return { ...prev, playerHealth: newPlayerHealth, turn: 'player' };
          });
        } else {
          setBattleLog(prev => [...prev, `Opponent uses ${randomAbility.name}!`]);
          setCombatState(prev => ({ ...prev, turn: 'player' }));
        }
        
        setCurrentTurn('player');
        updateCooldowns();
        return;
      }
    }
    
    // Basic attack with stat bonuses
    const finalAttack = opponentStats.attack + (opponent?.totalStatBonus?.attack || 0);
    const finalPlayerDefense = playerStats.defense + (playerBeast?.totalStatBonus?.defense || 0);
    const damage = Math.max(1, finalAttack - Math.floor(finalPlayerDefense / 2) + Math.floor(Math.random() * 3) - 1);
    
    setCombatState(prev => {
      const newPlayerHealth = Math.max(0, prev.playerHealth - damage);
      setBattleLog(prevLog => [...prevLog, `The wild beast attacks for ${damage} damage!`]);
      
      if (newPlayerHealth <= 0) {
        setGameState('defeat');
        setBattleLog(prevLog => [...prevLog, 'Defeat! Your beast has fallen...']);
        return { ...prev, playerHealth: newPlayerHealth };
      }
      
      return { ...prev, playerHealth: newPlayerHealth, turn: 'player' };
    });

    setCurrentTurn('player');
    updateCooldowns();
  };

  const proceedToLoot = () => {
    setGameState('loot');
  };

  const getPlayerBeast = (): CustomBeast | null => {
    try {
      const customBeastData = localStorage.getItem(`customBeast_${currentBeastId}`);
      if (customBeastData) {
        const beast = JSON.parse(customBeastData);
        
        // Ensure beast has enhanced properties for combat
        if (!beast.totalStatBonus) {
          beast.totalStatBonus = {
            attack: (beast.armLeft?.statBonus?.attack || 0) + (beast.armRight?.statBonus?.attack || 0),
            defense: (beast.torso?.statBonus?.defense || 0),
            speed: (beast.legLeft?.statBonus?.speed || 0) + (beast.legRight?.statBonus?.speed || 0),
            magic: (beast.head?.statBonus?.magic || 0),
            health: (beast.torso?.statBonus?.health || 0)
          };
        }
        
        // Ensure beast has abilities
        if (!beast.availableAbilities) {
          const abilities: Ability[] = [];
          
          // Add abilities from parts
          [beast.head, beast.torso, beast.armLeft, beast.armRight, beast.legLeft, beast.legRight].forEach(part => {
            if (part?.ability && !abilities.some((a: Ability) => a.id === part.ability!.id)) {
              abilities.push(part.ability);
            }
          });
          
          // Add a basic heal ability if no abilities exist
          if (abilities.length === 0) {
            abilities.push({
              id: 'basicHeal',
              name: 'Basic Heal',
              description: 'A simple healing spell',
              type: 'heal' as const,
              healing: 10,
              cooldown: 3,
              manaCost: 8
            });
          }
          
          beast.availableAbilities = abilities;
        }
        
        return beast;
      }
    } catch (e) {
      console.error('Failed to load player beast:', e);
    }
    return null;
  };

  const playerBeast = getPlayerBeast();

  return (
    <div className="adventure">
      {gameState === 'battle' && (
        <div className="battle-arena">
          {/* Background */}
          <div className="adventure-background">
            <img src="./images/arenas/arena2.jpg" alt="Adventure Arena" className="adventure-bg-image" />
          </div>
          
          {/* Header */}
          <div className="adventure-header">
            <h1>🗺️ Adventure Mode</h1>
          </div>

          {/* Battle Content */}
          <div className="battle-content">
            {/* Player Beast */}
            <div className="beast-container player-beast">
              <div className="beast-info">
                <h3>{playerBeast?.name || 'Your Beast'}</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill player-health" 
                    style={{ width: `${(combatState.playerHealth / playerStats.health) * 100}%` }}
                  />
                  <span className="health-text">{combatState.playerHealth}/{playerStats.health}</span>
                </div>
                <div className="stats-mini">
                  <span>ATK: {playerStats.attack + (playerBeast?.totalStatBonus?.attack || 0)}</span>
                  <span>DEF: {playerStats.defense + (playerBeast?.totalStatBonus?.defense || 0)}</span>
                  <span>SPD: {playerStats.speed + (playerBeast?.totalStatBonus?.speed || 0)}</span>
                  <span>MAG: {playerStats.magic + (playerBeast?.totalStatBonus?.magic || 0)}</span>
                </div>
                {Object.keys(combatState.statusEffects.player).length > 0 && (
                  <div className="status-effects">
                    <div className="status-label">Active Effects:</div>
                    {Object.entries(combatState.statusEffects.player).map(([key, effect]) => (
                      <div key={key} className="status-effect buff">
                        {key.split('_')[0]} ({effect.duration} turns)
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {playerBeast && (
                <div className="beast-visual">
                  <AnimatedCustomBeast 
                    mood="normal" 
                    size={200}
                    customBeast={playerBeast}
                  />
                </div>
              )}
            </div>

            {/* VS Indicator */}
            <div className="vs-indicator">
              <motion.div
                className="vs-text"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                VS
              </motion.div>
            </div>

            {/* Opponent Beast */}
            <div className="beast-container opponent-beast">
              <div className="beast-info">
                <h3>{opponent?.name || 'Wild Beast'} (Lvl {opponentLevel})</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill opponent-health" 
                    style={{ width: `${(combatState.opponentHealth / 30) * 100}%` }}
                  />
                  <span className="health-text">{combatState.opponentHealth}/30</span>
                </div>
                <div className="stats-mini">
                  <span>ATK: {opponentStats.attack + (opponent?.totalStatBonus?.attack || 0)}</span>
                  <span>DEF: {opponentStats.defense + (opponent?.totalStatBonus?.defense || 0)}</span>
                  <span>SPD: {opponentStats.speed + (opponent?.totalStatBonus?.speed || 0)}</span>
                  <span>MAG: {opponentStats.magic + (opponent?.totalStatBonus?.magic || 0)}</span>
                </div>
                {Object.keys(combatState.statusEffects.opponent).length > 0 && (
                  <div className="status-effects">
                    <div className="status-label">Active Effects:</div>
                    {Object.entries(combatState.statusEffects.opponent).map(([key, effect]) => (
                      <div key={key} className="status-effect debuff">
                        {key.split('_')[0]} ({effect.duration} turns)
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {opponent && (
                <div className="beast-visual">
                  <AnimatedCustomBeast 
                    mood="normal" 
                    size={200}
                    customBeast={opponent}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Battle Controls */}
          <div className="battle-controls">
            <div className="turn-indicator">
              {currentTurn === 'player' ? "Your Turn!" : "Opponent's Turn..."}
            </div>
            
            {/* Player Mana */}
            <div className="mana-bar">
              <div className="mana-label">Mana</div>
              <div className="mana-fill-container">
                <div 
                  className="mana-fill" 
                  style={{ width: `${(combatState.playerMana / 50) * 100}%` }}
                />
                <span className="mana-text">{combatState.playerMana}/50</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <motion.button
                className={`action-btn basic-attack ${currentTurn !== 'player' ? 'disabled' : ''}`}
                onClick={basicAttack}
                disabled={currentTurn !== 'player'}
                whileHover={currentTurn === 'player' ? { scale: 1.05 } : {}}
                whileTap={currentTurn === 'player' ? { scale: 0.95 } : {}}
              >
                ⚔️ Basic Attack
              </motion.button>

              {/* Ability Buttons */}
              {playerBeast?.availableAbilities?.map(ability => {
                const cooldown = combatState.playerAbilityCooldowns.find(cd => cd.abilityId === ability.id);
                const isOnCooldown = cooldown && cooldown.turnsLeft > 0;
                const hasEnoughMana = combatState.playerMana >= (ability.manaCost || 0);
                const canUse = currentTurn === 'player' && !isOnCooldown && hasEnoughMana;

                return (
                  <motion.button
                    key={ability.id}
                    className={`action-btn ability-btn ${!canUse ? 'disabled' : ''} ${ability.type}`}
                    onClick={() => castAbility(ability)}
                    disabled={!canUse}
                    whileHover={canUse ? { scale: 1.05 } : {}}
                    whileTap={canUse ? { scale: 0.95 } : {}}
                    title={`${ability.description}\nDamage: ${ability.damage || 'N/A'}\nMana: ${ability.manaCost || 0}\nCooldown: ${ability.cooldown} turns`}
                  >
                    <div className="ability-name">{ability.name}</div>
                    <div className="ability-cost">💧{ability.manaCost || 0}</div>
                    {isOnCooldown && (
                      <div className="cooldown-overlay">
                        {cooldown.turnsLeft}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            <h4>Battle Log</h4>
            <div className="log-content">
              {battleLog.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Screen */}
      {(gameState === 'victory' || gameState === 'defeat') && (
        <div className="battle-result">
          <motion.div
            className={`result-text ${gameState}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {gameState === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}
          </motion.div>
          {gameState === 'victory' && experienceGained > 0 && (
            <motion.div 
              className="experience-gained"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              +{experienceGained} XP Gained!
            </motion.div>
          )}
          {gameState === 'victory' ? (
            <motion.button
              className="result-btn"
              onClick={proceedToLoot}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Claim Loot
            </motion.button>
          ) : (
            <motion.button
              className="result-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Beast Den
            </motion.button>
          )}
        </div>
      )}

      {/* Loot Screen */}
      {gameState === 'loot' && droppedLoot && (
        <div className="loot-screen">
          <motion.div
            className="loot-container"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <h2 className="loot-title">🎁 Loot Acquired!</h2>
            <div className="loot-item">
              <div className={`loot-icon rarity-${droppedLoot.rarity}`}>
                <img 
                  src={droppedLoot.imagePath} 
                  alt={droppedLoot.name}
                  className="loot-image"
                />
              </div>
              <div className="loot-details">
                <h3 className="loot-name">{droppedLoot.name}</h3>
                <span className={`loot-rarity rarity-${droppedLoot.rarity}`}>
                  {droppedLoot.rarity.charAt(0).toUpperCase() + droppedLoot.rarity.slice(1)}
                </span>
                <p className="loot-type">
                  {droppedLoot.type === 'part' ? 'Beast Part' : 'Part Set'}
                </p>
              </div>
            </div>
            <motion.button
              className="loot-continue-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Beast Den
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
