import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCustomBeast } from '../AnimatedCustomBeast/AnimatedCustomBeast';
import { AdventureMap } from '../AdventureMap/AdventureMap';
import { useInventoryContext } from '../../contexts/InventoryContext';
import type { BeastCombatStats, IndividualBeastData } from '../../types/game';
import type { EnhancedBeastPart, Ability, StatBonus } from '../../types/abilities';
import { EXTRA_LIMBS } from '../../data/beastParts';
import { LOOT_ITEMS, RARITY_WEIGHTS, type LootItem } from '../../data/lootData';
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
  wings?: EnhancedBeastPart;
  tail?: EnhancedBeastPart;
  soulEssence: SoulEssence;
  colorScheme?: { id: string; name: string; primary: string; secondary: string; accent: string; rarity: string };
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

interface AbilityCooldown {
  abilityId: string;
  turnsLeft: number;
}

interface BattleBeast {
  id: string;
  customBeast: CustomBeast;
  stats: BeastCombatStats & { health: number };
  currentHealth: number;
  currentMana: number;
  position: 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight';
  abilityCooldowns: AbilityCooldown[];
  statusEffects: { [key: string]: { duration: number; value: number } };
  isDefeated: boolean;
}

interface CombatState {
  playerBeasts: BattleBeast[];
  opponentBeasts: BattleBeast[];
  turn: 'player' | 'opponent';
  selectedPlayerBeast: string | null; // ID of currently selected player beast
  selectedTarget: string | null; // ID of target opponent beast
}

interface AdventureProps {
  playerStats: BeastCombatStats & { health: number };
  onClose: () => void;
  onUpdateExperience: (beastId: string, newExperience: number) => boolean;
  soundEffectsEnabled?: boolean;
  beastData?: Record<string, IndividualBeastData>; // Add beast data for accessing all beasts
}

export const Adventure: React.FC<AdventureProps> = ({ playerStats, onClose, onUpdateExperience, soundEffectsEnabled = true, beastData }) => {
  const { setInventory } = useInventoryContext();
  const victorySoundRef = useRef<HTMLAudioElement>(null);
  const lootSoundRef = useRef<HTMLAudioElement>(null);
  const magicAttackSoundRef = useRef<HTMLAudioElement>(null);
  const battleMusicRef = useRef<HTMLAudioElement>(null);
  const battleLogRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'map' | 'setup' | 'battle' | 'victory' | 'defeat' | 'loot'>('map');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [opponentLevel, setOpponentLevel] = useState<number>(1);
  const [opponent, setOpponent] = useState<CustomBeast | null>(null);
  const [opponentStats, setOpponentStats] = useState<BeastCombatStats>({
    attack: 5,
    defense: 4,
    speed: 3,
    magic: 2
  });
  const [opponentMaxHealth, setOpponentMaxHealth] = useState<number>(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [droppedLoot, setDroppedLoot] = useState<LootItem | null>(null);
  const [experienceGained, setExperienceGained] = useState<number>(0);
  
  // Animation states for attack visuals
  const [playerAttacking, setPlayerAttacking] = useState<boolean>(false);
  const [opponentAttacking, setOpponentAttacking] = useState<boolean>(false);
  
  // Play victory sound when entering victory state
  useEffect(() => {
    if (gameState === 'victory' && victorySoundRef.current && soundEffectsEnabled) {
      victorySoundRef.current.currentTime = 0; // Reset to beginning
      victorySoundRef.current.volume = 0.7; // Set volume to 70%
      victorySoundRef.current.play().catch(error => {
        console.log('Could not play victory sound:', error);
      });
    }
  }, [gameState, soundEffectsEnabled]);

  // Play loot sound when entering loot state
  useEffect(() => {
    if (gameState === 'loot' && lootSoundRef.current && soundEffectsEnabled) {
      lootSoundRef.current.currentTime = 0; // Reset to beginning
      lootSoundRef.current.volume = 0.6; // Set volume to 60%
      lootSoundRef.current.play().catch(error => {
        console.log('Could not play loot sound:', error);
      });
    }
  }, [gameState, soundEffectsEnabled]);

  // Battle music management
  useEffect(() => {
    const battleMusicElement = battleMusicRef.current;
    
    if (gameState === 'battle' && battleMusicElement && soundEffectsEnabled) {
      // Play battle music when entering battle
      battleMusicElement.volume = 0.2;
      battleMusicElement.loop = true;
      battleMusicElement.play().catch(error => {
        console.log('Could not play battle music:', error);
      });
    } else if (battleMusicElement) {
      // Stop battle music when leaving battle state
      battleMusicElement.pause();
      battleMusicElement.currentTime = 0;
    }

    // Cleanup function to stop music when component unmounts or state changes
    return () => {
      if (battleMusicElement) {
        battleMusicElement.pause();
        battleMusicElement.currentTime = 0;
      }
    };
  }, [gameState, soundEffectsEnabled]);
  
  // Enhanced combat state
  const [combatState, setCombatState] = useState<CombatState>({
    playerBeasts: [],
    opponentBeasts: [],
    turn: 'player',
    selectedPlayerBeast: null,
    selectedTarget: null
  });

  // Handle level selection from map
  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setOpponentLevel(level);
    setGameState('setup');
    
    // Scale opponent stats based on level
    const baseStats = { attack: 5, defense: 4, speed: 3, magic: 2 };
    const scaledStats = {
      attack: baseStats.attack + (level - 1) * 2,
      defense: baseStats.defense + (level - 1) * 2,
      speed: baseStats.speed + (level - 1) * 1,
      magic: baseStats.magic + (level - 1) * 1
    };
    setOpponentStats(scaledStats);
    
    // Calculate opponent health based on level and their parts
    // Base health of 100, +20 per level, +health bonuses from parts
    const baseHealth = 100;
    const levelHealthBonus = (level - 1) * 20;
    // Will be updated when opponent is generated with their part bonuses
    
    setCombatState(prev => ({
      ...prev,
      playerHealth: playerStats.health,
      opponentHealth: baseHealth + levelHealthBonus // Will be updated with part bonuses
    }));
  };

  const handleMapClose = () => {
    onClose();
  };

  // Generate random opponent when entering setup
  useEffect(() => {
    if (gameState === 'setup') {
      const generateOpponent = (): CustomBeast => {
        const availableParts = {
          heads: [
            { id: 'nightwolf-head', name: 'Night Wolf Head', imagePath: './images/beasts/night-wolf/night-wolf-head.svg', type: 'head' as const, rarity: 'common' as const },
            { id: 'mountaindragon-head', name: 'Mountain Dragon Head', imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg', type: 'head' as const, rarity: 'common' as const },
            { id: 'woodenpuppet-head', name: 'Wooden Puppet Head', imagePath: './images/beasts/wooden-puppet/wooden-puppet-head.svg', type: 'head' as const, rarity: 'common' as const }
          ],
          torsos: [
            { id: 'nightwolf-torso', name: 'Night Wolf Torso', imagePath: './images/beasts/night-wolf/night-wolf-torso.svg', type: 'torso' as const, rarity: 'common' as const },
            { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg', type: 'torso' as const, rarity: 'common' as const },
            { id: 'woodenpuppet-torso', name: 'Wooden Puppet Torso', imagePath: './images/beasts/wooden-puppet/wooden-puppet-torso.svg', type: 'torso' as const, rarity: 'common' as const }
          ],
          arms: [
            { left: './images/beasts/night-wolf/night-wolf-arm-l.svg', right: './images/beasts/night-wolf/night-wolf-arm-r.svg', name: 'Night Wolf Arms' },
            { left: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg', name: 'Mountain Dragon Arms' },
            { left: './images/beasts/wooden-puppet/wooden-puppet-arm-l.svg', right: './images/beasts/wooden-puppet/wooden-puppet-arm-r.svg', name: 'Wooden Puppet Arms' }
          ],
          legs: [
            { left: './images/beasts/night-wolf/night-wolf-leg-l.svg', right: './images/beasts/night-wolf/night-wolf-leg-r.svg', name: 'Night Wolf Legs' },
            { left: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg', name: 'Mountain Dragon Legs' },
            { left: './images/beasts/wooden-puppet/wooden-puppet-leg-l.svg', right: './images/beasts/wooden-puppet/wooden-puppet-leg-r.svg', name: 'Wooden Puppet Legs' }
          ]
        };

        // Get available extra limbs from the centralized beast parts
        const availableWings = EXTRA_LIMBS.filter(limb => limb.type === 'wings');
        const availableTails = EXTRA_LIMBS.filter(limb => limb.type === 'tail');

        const randomHead = availableParts.heads[Math.floor(Math.random() * availableParts.heads.length)];
        const randomTorso = availableParts.torsos[Math.floor(Math.random() * availableParts.torsos.length)];
        const randomArms = availableParts.arms[Math.floor(Math.random() * availableParts.arms.length)];
        const randomLegs = availableParts.legs[Math.floor(Math.random() * availableParts.legs.length)];

        // Randomly decide if opponent gets extra parts (higher chance at higher levels)
        const wingsChance = 0.3 + (opponentLevel - 1) * 0.1; // 30% base, +10% per level
        const tailChance = 0.4 + (opponentLevel - 1) * 0.1; // 40% base, +10% per level
        
        const hasWings = Math.random() < wingsChance && availableWings.length > 0;
        const hasTail = Math.random() < tailChance && availableTails.length > 0;

        const randomWings = hasWings ? availableWings[Math.floor(Math.random() * availableWings.length)] : null;
        const randomTail = hasTail ? availableTails[Math.floor(Math.random() * availableTails.length)] : null;

        // Scale part bonuses based on level
        const levelMultiplier = 1 + (opponentLevel - 1) * 0.2; // 20% increase per level
        
        // Calculate total stat bonuses including extra parts
        let totalAttack = Math.floor(4 * levelMultiplier);
        let totalDefense = Math.floor(3 * levelMultiplier);
        let totalSpeed = Math.floor(2 * levelMultiplier);
        let totalMagic = Math.floor(2 * levelMultiplier);
        const totalHealth = Math.floor(20 * levelMultiplier);

        // Extra bonuses from wings and tail - use actual stat bonuses from EXTRA_LIMBS
        if (hasWings && randomWings?.statBonus) {
          totalSpeed += (randomWings.statBonus.speed || 0) * Math.floor(levelMultiplier);
          totalMagic += (randomWings.statBonus.magic || 0) * Math.floor(levelMultiplier);
          totalAttack += (randomWings.statBonus.attack || 0) * Math.floor(levelMultiplier);
          totalDefense += (randomWings.statBonus.defense || 0) * Math.floor(levelMultiplier);
        }
        if (hasTail && randomTail?.statBonus) {
          totalSpeed += (randomTail.statBonus.speed || 0) * Math.floor(levelMultiplier);
          totalMagic += (randomTail.statBonus.magic || 0) * Math.floor(levelMultiplier);
          totalAttack += (randomTail.statBonus.attack || 0) * Math.floor(levelMultiplier);
          totalDefense += (randomTail.statBonus.defense || 0) * Math.floor(levelMultiplier);
        }

        // Generate species name using same logic as getBeastSpecies in App.tsx
        // Extract species from torso part image path (first word)
        let torsoSpecies = '';
        if (randomTorso.imagePath) {
          const torsoFileName = randomTorso.imagePath.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg)$/i, '') || '';
          const torsoParts = torsoFileName.split('-');
          if (torsoParts.length >= 1) {
            torsoSpecies = torsoParts[0]; // "night-wolf-torso" -> "night"
          }
        }
        
        // Extract species from head part image path (second word)
        let headSpecies = '';
        if (randomHead.imagePath) {
          const headFileName = randomHead.imagePath.split('/').pop()?.replace(/\.(svg|png|jpg|jpeg)$/i, '') || '';
          const headParts = headFileName.split('-');
          if (headParts.length >= 2) {
            headSpecies = headParts[1]; // "night-wolf-head" -> "wolf"
          }
        }
        
        // Capitalize and combine like in App.tsx
        let speciesName = 'Wild Beast'; // fallback
        if (headSpecies && torsoSpecies) {
          const capitalizedTorso = torsoSpecies.charAt(0).toUpperCase() + torsoSpecies.slice(1);
          const capitalizedHead = headSpecies.charAt(0).toUpperCase() + headSpecies.slice(1);
          speciesName = `${capitalizedTorso} ${capitalizedHead}`;
        }

        const opponent: CustomBeast = {
          name: speciesName,
          gender: Math.random() < 0.5 ? 'male' : 'female',
          head: {
            ...randomHead,
            statBonus: { magic: Math.floor(2 * levelMultiplier) },
            ability: {
              id: 'bite',
              name: 'Bite',
              description: 'A savage bite attack',
              type: 'attack' as const,
              damage: Math.floor(12 * levelMultiplier),
              cooldown: 2,
              manaCost: 5
            }
          },
          torso: {
            ...randomTorso,
            statBonus: { 
              defense: Math.floor(3 * levelMultiplier), 
              health: Math.floor(20 * levelMultiplier) // More health from torso
            }
          },
          armLeft: {
            id: 'opponent-arm-left',
            name: `${randomArms.name} Left`,
            imagePath: randomArms.left,
            type: 'armLeft',
            rarity: 'common',
            statBonus: { attack: Math.floor(2 * levelMultiplier) }
          },
          armRight: {
            id: 'opponent-arm-right',
            name: `${randomArms.name} Right`,
            imagePath: randomArms.right,
            type: 'armRight',
            rarity: 'common',
            statBonus: { attack: Math.floor(2 * levelMultiplier) },
            ability: {
              id: 'claw',
              name: 'Claw',
              description: 'Sharp claw attack',
              type: 'attack' as const,
              damage: Math.floor(10 * levelMultiplier),
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
            statBonus: { speed: Math.floor(1 * levelMultiplier) }
          },
          legRight: {
            id: 'opponent-leg-right',
            name: `${randomLegs.name} Right`,
            imagePath: randomLegs.right,
            type: 'legRight',
            rarity: 'common',
            statBonus: { speed: Math.floor(1 * levelMultiplier) }
          },
          ...(randomWings && {
            wings: {
              ...randomWings,
              statBonus: {
                ...(randomWings.statBonus || {}),
                // Scale existing bonuses by level
                magic: (randomWings.statBonus?.magic || 0) * Math.floor(levelMultiplier),
                speed: (randomWings.statBonus?.speed || 0) * Math.floor(levelMultiplier),
                attack: (randomWings.statBonus?.attack || 0) * Math.floor(levelMultiplier),
                defense: (randomWings.statBonus?.defense || 0) * Math.floor(levelMultiplier)
              }
            }
          }),
          ...(randomTail && {
            tail: {
              ...randomTail,
              statBonus: {
                ...(randomTail.statBonus || {}),
                // Scale existing bonuses by level
                magic: (randomTail.statBonus?.magic || 0) * Math.floor(levelMultiplier),
                speed: (randomTail.statBonus?.speed || 0) * Math.floor(levelMultiplier),
                attack: (randomTail.statBonus?.attack || 0) * Math.floor(levelMultiplier),
                defense: (randomTail.statBonus?.defense || 0) * Math.floor(levelMultiplier)
              }
            }
          }),
          soulEssence: {
            id: 'dim-soul',
            name: 'Dim Soul',
            description: 'A faint glimmer of spiritual energy',
            imagePath: './images/items/dim-soul.png',
            rarity: 'common'
          },
          totalStatBonus: { 
            attack: totalAttack, 
            defense: totalDefense, 
            speed: totalSpeed, 
            magic: totalMagic, 
            health: totalHealth 
          },
          availableAbilities: [
            {
              id: 'bite',
              name: 'Bite',
              description: 'A savage bite attack',
              type: 'attack' as const,
              damage: Math.floor(12 * levelMultiplier),
              cooldown: 2,
              manaCost: 5
            },
            {
              id: 'claw',
              name: 'Claw',
              description: 'Sharp claw attack',
              type: 'attack' as const,
              damage: Math.floor(10 * levelMultiplier),
              cooldown: 1,
              manaCost: 3
            }
          ]
        };

        return opponent;
      };

      const newOpponent = generateOpponent();
      setOpponent(newOpponent);
      
      // Log extra parts for testing
      const extraParts = [];
      if (newOpponent.wings) extraParts.push(`Wings: ${newOpponent.wings.name}`);
      if (newOpponent.tail) extraParts.push(`Tail: ${newOpponent.tail.name}`);
      if (extraParts.length > 0) {
        console.log(`Generated opponent with extra parts: ${extraParts.join(', ')}`);
      }
      setOpponent(newOpponent);
      
      // Update combat state with proper opponent health including part bonuses
      const baseHealth = 100;
      const levelHealthBonus = (selectedLevel - 1) * 20;
      const partHealthBonus = newOpponent.totalStatBonus.health || 0;
      const totalOpponentHealth = baseHealth + levelHealthBonus + partHealthBonus;
      
      setOpponentMaxHealth(totalOpponentHealth);
      setCombatState(prev => ({
        ...prev,
        opponentHealth: totalOpponentHealth
      }));
      
      console.log(`Generated Level ${opponentLevel} opponent with ${totalOpponentHealth} health (base: ${baseHealth}, level bonus: ${levelHealthBonus}, part bonus: ${partHealthBonus})`);
    }
  }, [gameState, selectedLevel, opponentLevel]);

  // Generate loot drop based on rarity weights
  const generateLoot = (): LootItem => {
    // Create weighted array
    const weightedLoot: LootItem[] = [];
    LOOT_ITEMS.forEach(item => {
      const weight = RARITY_WEIGHTS[item.rarity];
      for (let i = 0; i < weight; i++) {
        weightedLoot.push(item);
      }
    });

    // Select random item
    const selectedLoot = weightedLoot[Math.floor(Math.random() * weightedLoot.length)];
    return selectedLoot;
  };

  // Helper functions for multi-beast combat
  const createBattleBeast = (customBeast: CustomBeast, stats: BeastCombatStats & { health: number }, position: BattleBeast['position']): BattleBeast => {
    return {
      id: `${customBeast.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customBeast,
      stats,
      currentHealth: stats.health,
      currentMana: 50,
      position,
      abilityCooldowns: [],
      statusEffects: {},
      isDefeated: false
    };
  };

  const getTargetableBeasts = (beasts: BattleBeast[]): BattleBeast[] => {
    const frontLineBeasts = beasts.filter(b => !b.isDefeated && (b.position === 'frontLeft' || b.position === 'frontRight'));
    if (frontLineBeasts.length > 0) {
      return frontLineBeasts;
    }
    // If no front line beasts, back line becomes targetable
    return beasts.filter(b => !b.isDefeated && (b.position === 'backLeft' || b.position === 'backRight'));
  };

  const getActiveBeast = (beasts: BattleBeast[], selectedId: string | null): BattleBeast | null => {
    if (!selectedId) return beasts.find(b => !b.isDefeated) || null;
    return beasts.find(b => b.id === selectedId && !b.isDefeated) || null;
  };

  const checkBattleEnd = (state?: CombatState): 'playerWin' | 'opponentWin' | 'continue' => {
    const currentState = state || combatState;
    const playerAlive = currentState.playerBeasts.some(b => !b.isDefeated);
    const opponentAlive = currentState.opponentBeasts.some(b => !b.isDefeated);
    
    if (!playerAlive) return 'opponentWin';
    if (!opponentAlive) return 'playerWin';
    return 'continue';
  };

  // Calculate experience gained based on opponent level
  const calculateExperienceGain = (defeatedLevel: number): number => {
    return defeatedLevel * 50; // 50 XP per opponent level
  };

  // Get current experience from main beastData storage for a specific beast
  const getCurrentExperienceForBeast = (beastId: string): number => {
    try {
      const beastDataKey = `beastData`;
      const mainBeastData = localStorage.getItem(beastDataKey);
      
      if (mainBeastData) {
        const allBeastData = JSON.parse(mainBeastData);
        if (allBeastData[beastId]) {
          return allBeastData[beastId].experience || 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Failed to get current experience for beast:', beastId, error);
      return 0;
    }
  };

  // Helper function to calculate effective stats with status effects
  const getEffectiveStats = (beast: BattleBeast) => {
    const baseStats = beast.stats;
    const statusEffects = beast.statusEffects;
    
    let attackModifier = 0;
    let defenseModifier = 0;
    let speedModifier = 0;
    let magicModifier = 0;
    
    // Apply all status effects
    Object.entries(statusEffects).forEach(([key, effect]) => {
      if (key.includes('_attack')) attackModifier += effect.value;
      if (key.includes('_defense')) defenseModifier += effect.value;
      if (key.includes('_speed')) speedModifier += effect.value;
      if (key.includes('_magic')) magicModifier += effect.value;
    });
    
    return {
      attack: Math.max(1, baseStats.attack + attackModifier),
      defense: Math.max(0, baseStats.defense + defenseModifier),
      speed: Math.max(1, baseStats.speed + speedModifier),
      magic: Math.max(1, baseStats.magic + magicModifier),
      health: baseStats.health // Health is not affected by temporary status effects
    };
  };

  // Enhanced combat functions with abilities for multi-beast system
  const castAbility = (ability: Ability, targetId?: string) => { 
    if (combatState.turn !== 'player' || gameState !== 'battle') {
      return;
    }

    const activeBeast = getActiveBeast(combatState.playerBeasts, combatState.selectedPlayerBeast);
    if (!activeBeast) return;

    if (activeBeast.currentMana < (ability.manaCost || 0)) {
      setBattleLog(prev => [...prev, `${activeBeast.customBeast.name} doesn't have enough mana to use ${ability.name}! (Need ${ability.manaCost})`]);
      return;
    }

    // Check cooldown
    const cooldown = activeBeast.abilityCooldowns.find(cd => cd.abilityId === ability.id);
    if (cooldown && cooldown.turnsLeft > 0) {
      setBattleLog(prev => [...prev, `${ability.name} is on cooldown for ${cooldown.turnsLeft} more turns!`]);
      return;
    }

    // For attack and debuff abilities, need a target
    if ((ability.type === 'attack' || ability.type === 'magicAttack' || ability.type === 'debuff') && !targetId) {
      setBattleLog(prev => [...prev, `Select a target for ${ability.name}!`]);
      return;
    }

    // Calculate damage/healing/mana once, then apply all changes atomically
    let battleMessage = '';
    let targetHealthAfterDamage = 0;
    let casterHealthAfterHealing = 0;
    let casterManaAfterUse = 0;
    
    // Pre-calculate all values based on current state
    if (ability.type === 'attack' || ability.type === 'magicAttack') {
      const targetBeast = combatState.opponentBeasts.find(b => b.id === targetId);
      if (targetBeast) {
        const attackerEffectiveStats = getEffectiveStats(activeBeast);
        const targetEffectiveStats = getEffectiveStats(targetBeast);
        
        const baseDamage = ability.damage || 0;
        const statBonus = ability.type === 'magicAttack' 
          ? Math.floor(attackerEffectiveStats.magic / 2)
          : Math.floor(attackerEffectiveStats.attack / 2);
        const defenseReduction = Math.floor(targetEffectiveStats.defense / 3);
        const totalDamage = Math.max(1, baseDamage + statBonus - defenseReduction);
        
        targetHealthAfterDamage = Math.max(0, targetBeast.currentHealth - totalDamage);
        
        battleMessage = `${activeBeast.customBeast.name} uses ${ability.name} on ${targetBeast.customBeast.name} for ${totalDamage} damage!`;
      }
    } else if (ability.type === 'heal') {
      const healing = ability.healing || 0;
      casterHealthAfterHealing = Math.min(activeBeast.stats.health, activeBeast.currentHealth + healing);
      battleMessage = `${activeBeast.customBeast.name} uses ${ability.name} and heals for ${healing} HP!`;
    } else if (ability.type === 'buff') {
      battleMessage = `${activeBeast.customBeast.name} uses ${ability.name} and gains a buff!`;
    } else if (ability.type === 'debuff') {
      const targetBeast = combatState.opponentBeasts.find(b => b.id === targetId);
      if (targetBeast) {
        battleMessage = `${activeBeast.customBeast.name} uses ${ability.name} on ${targetBeast.customBeast.name} and applies a debuff!`;
      }
    }
    
    // Pre-calculate mana consumption
    casterManaAfterUse = Math.max(0, activeBeast.currentMana - (ability.manaCost || 0));
    
    // Immediately set turn to 'opponent' to prevent double execution
    setCombatState(prev => {
      // Early exit if not player's turn (double-click protection)
      if (prev.turn !== 'player') return prev;
      
      // Idempotency check: verify if this update has already been applied
      const currentBeast = prev.playerBeasts.find(b => b.id === activeBeast.id);
      if (currentBeast && currentBeast.currentMana === casterManaAfterUse) {
        // If mana is already at the expected value, this update was already applied
        return { ...prev, turn: 'opponent' as const };
      }
      
      const newState = { ...prev, turn: 'opponent' as const };
      
      // Update the active beast's mana and cooldowns
      const beastIndex = newState.playerBeasts.findIndex(b => b.id === activeBeast.id);
      if (beastIndex === -1) return prev;
      
      newState.playerBeasts[beastIndex] = {
        ...newState.playerBeasts[beastIndex],
        currentMana: casterManaAfterUse
      };
      
      // Set cooldown
      const cooldownIndex = newState.playerBeasts[beastIndex].abilityCooldowns.findIndex(cd => cd.abilityId === ability.id);
      if (cooldownIndex >= 0) {
        newState.playerBeasts[beastIndex].abilityCooldowns[cooldownIndex].turnsLeft = ability.cooldown;
      } else {
        newState.playerBeasts[beastIndex].abilityCooldowns.push({ abilityId: ability.id, turnsLeft: ability.cooldown });
      }
      
      // Apply ability effects using pre-calculated final values
      if (ability.type === 'attack' || ability.type === 'magicAttack') {
        const targetIndex = newState.opponentBeasts.findIndex(b => b.id === targetId);
        if (targetIndex >= 0) {
          newState.opponentBeasts[targetIndex] = {
            ...newState.opponentBeasts[targetIndex],
            currentHealth: targetHealthAfterDamage
          };
          
          if (newState.opponentBeasts[targetIndex].currentHealth <= 0) {
            newState.opponentBeasts[targetIndex].isDefeated = true;
          }
        }
      } else if (ability.type === 'heal') {
        newState.playerBeasts[beastIndex] = {
          ...newState.playerBeasts[beastIndex],
          currentHealth: casterHealthAfterHealing
        };
      } else if (ability.type === 'buff') {
        // Apply buff to the caster (self-buff)
        if (ability.effects?.statModifier) {
          const duration = ability.effects.duration || 3;
          const effects = ability.effects.statModifier;
          
          // Apply status effects to the caster
          Object.entries(effects).forEach(([stat, value]) => {
            if (value && value !== 0) {
              newState.playerBeasts[beastIndex].statusEffects[`${ability.id}_${stat}`] = {
                duration,
                value
              };
            }
          });
        }
      } else if (ability.type === 'debuff') {
        // Apply debuff to the target
        const targetIndex = newState.opponentBeasts.findIndex(b => b.id === targetId);
        if (targetIndex >= 0 && ability.effects?.statModifier) {
          const duration = ability.effects.duration || 3;
          const effects = ability.effects.statModifier;
          
          // Apply status effects to the target
          Object.entries(effects).forEach(([stat, value]) => {
            if (value && value !== 0) {
              newState.opponentBeasts[targetIndex].statusEffects[`${ability.id}_${stat}`] = {
                duration,
                value: -Math.abs(value) // Debuffs are negative
              };
            }
          });
        }
      }
      
      return newState;
    });

    // Add battle log message outside of setState to prevent double execution (same pattern as basicAttack)
    if (battleMessage) {
      setBattleLog(prev => [...prev, battleMessage]);
    }

    // Trigger player attack animation
    setPlayerAttacking(true);
    setTimeout(() => setPlayerAttacking(false), 1200);

    // Play magic attack sound for magic abilities
    if (ability.type === 'magicAttack' && soundEffectsEnabled && magicAttackSoundRef.current) {
      magicAttackSoundRef.current.play().catch(error => {
        console.warn('Failed to play magic attack sound:', error);
      });
    }

    // Check for victory and proceed with next turn after a delay
    setTimeout(() => {
      const finalBattleResult = checkBattleEnd();
      if (finalBattleResult === 'playerWin') {
        handleVictory();
      } else if (finalBattleResult === 'continue') {
        // Only proceed with opponent attack if battle is still ongoing
        opponentAttack();
      }
      // If finalBattleResult === 'opponentWin', the game should have already transitioned to defeat
    }, 1500); // Use the same delay as opponent attack
  };

  const handleVictory = () => {
    setGameState('victory');
    setBattleLog(prev => [...prev, `Victory! You defeated the ${opponent?.name?.toLowerCase() || 'wild beast'}!`]);
    
    // Update adventure progress
    updateAdventureProgress(selectedLevel);
    
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
    
    // Calculate and distribute experience among all participating beasts
    const totalExpGained = calculateExperienceGain(opponentLevel);
    const expPerBeast = Math.floor(totalExpGained / combatState.playerBeasts.length);
    const orderedBeastIds = getOrderedBeastIds();
    
    console.log('Victory! Distributing experience:', totalExpGained, 'total,', expPerBeast, 'per beast');
    
    // Give experience to all participating beasts
    let totalDistributedExp = 0;
    for (let i = 0; i < combatState.playerBeasts.length; i++) {
      const beastId = orderedBeastIds[i];
      if (beastId) {
        const success = onUpdateExperience(beastId, getCurrentExperienceForBeast(beastId) + expPerBeast);
        if (success) {
          totalDistributedExp += expPerBeast;
        }
      }
    }
    
    setExperienceGained(totalDistributedExp);
    setBattleLog(prev => [...prev, `Your team gained ${totalDistributedExp} experience total!`]);
  };

  // Update adventure progress when a level is completed
  const updateAdventureProgress = (completedLevel: number) => {
    try {
      const savedProgress = localStorage.getItem('adventureProgress');
      let progress: { maxUnlockedLevel: number; completedLevels: number[] } = { 
        maxUnlockedLevel: 1, 
        completedLevels: [] 
      };
      
      if (savedProgress) {
        progress = JSON.parse(savedProgress);
        // Ensure arrays are properly initialized
        if (!progress.completedLevels) {
          progress.completedLevels = [];
        }
      }
      
      // Mark level as completed
      if (!progress.completedLevels.includes(completedLevel)) {
        progress.completedLevels.push(completedLevel);
      }
      
      // Unlock next level
      if (completedLevel >= progress.maxUnlockedLevel && completedLevel < 10) {
        progress.maxUnlockedLevel = completedLevel + 1;
      }
      
      localStorage.setItem('adventureProgress', JSON.stringify(progress));
      console.log('Adventure progress updated:', progress);
    } catch (error) {
      console.error('Failed to update adventure progress:', error);
    }
  };

  // Basic attack function for multi-beast system
  const basicAttack = () => {
    const activeBeast = getActiveBeast(combatState.playerBeasts, combatState.selectedPlayerBeast);
    const targetableBeasts = getTargetableBeasts(combatState.opponentBeasts);
    
    if (!activeBeast || targetableBeasts.length === 0) {
      return;
    }
    
    // Auto-select first targetable beast for basic attack
    const target = targetableBeasts[0];

    // Calculate damage outside of setState so we can use it for the battle log
    const attackerEffectiveStats = getEffectiveStats(activeBeast);
    const targetEffectiveStats = getEffectiveStats(target);
    const damage = Math.max(1, attackerEffectiveStats.attack - Math.floor(targetEffectiveStats.defense / 2) + Math.floor(Math.random() * 3) - 1);

    // Immediately set turn to 'opponent' to prevent double execution
    setCombatState(prev => {
      // Early exit if not player's turn (double-click protection)
      if (prev.turn !== 'player') return prev;
      
      const newState = { ...prev, turn: 'opponent' as const };
      const targetIndex = newState.opponentBeasts.findIndex(b => b.id === target.id);
      
      newState.opponentBeasts[targetIndex] = {
        ...newState.opponentBeasts[targetIndex],
        currentHealth: Math.max(0, target.currentHealth - damage)
      };
      
      if (newState.opponentBeasts[targetIndex].currentHealth <= 0) {
        newState.opponentBeasts[targetIndex].isDefeated = true;
      }
      
      return newState;
    });

    // Add battle log message outside of setState to prevent double execution
    setBattleLog(prev => [...prev, `${activeBeast.customBeast.name} attacks ${target.customBeast.name} for ${damage} damage!`]);

    setPlayerAttacking(true);
    setTimeout(() => setPlayerAttacking(false), 1200);

    // Check for victory and proceed with next turn after a delay
    setTimeout(() => {
      const battleResult = checkBattleEnd();
      if (battleResult === 'playerWin') {
        handleVictory();
      } else if (battleResult === 'continue') {
        // Only proceed with opponent attack if battle is still ongoing
        opponentAttack();
      }
      // If battleResult === 'opponentWin', the game should have already transitioned to defeat
    }, 1500); // Use the same delay as opponent attack
  };

  const updateCooldowns = () => {
    setCombatState(prev => {
      const newState = { ...prev };
      
      // Update player beast cooldowns, regenerate mana, and update status effects
      newState.playerBeasts = newState.playerBeasts.map(beast => {
        // Update status effects
        const updatedStatusEffects: { [key: string]: { duration: number; value: number } } = {};
        Object.entries(beast.statusEffects).forEach(([key, effect]) => {
          const newDuration = effect.duration - 1;
          if (newDuration > 0) {
            updatedStatusEffects[key] = { ...effect, duration: newDuration };
          }
        });

        return {
          ...beast,
          currentMana: Math.min(50, beast.currentMana + 2), // Reduced from 5 to 2 for slower mana regen
          abilityCooldowns: beast.abilityCooldowns.map(cd => ({
            ...cd,
            turnsLeft: Math.max(0, cd.turnsLeft - 1)
          })).filter(cd => cd.turnsLeft > 0),
          statusEffects: updatedStatusEffects
        };
      });

      // Update opponent beast status effects too
      newState.opponentBeasts = newState.opponentBeasts.map(beast => {
        // Update status effects
        const updatedStatusEffects: { [key: string]: { duration: number; value: number } } = {};
        Object.entries(beast.statusEffects).forEach(([key, effect]) => {
          const newDuration = effect.duration - 1;
          if (newDuration > 0) {
            updatedStatusEffects[key] = { ...effect, duration: newDuration };
          }
        });

        return {
          ...beast,
          statusEffects: updatedStatusEffects
        };
      });
      
      return newState;
    });
  };

  const opponentAttack = () => {
    if (gameState !== 'battle') return;

    const activeOpponentBeasts = combatState.opponentBeasts.filter(b => !b.isDefeated);
    const targetablePlayerBeasts = getTargetableBeasts(combatState.playerBeasts);
    
    if (activeOpponentBeasts.length === 0 || targetablePlayerBeasts.length === 0) return;
    
    // Simple AI: first active opponent attacks first targetable player beast
    const attacker = activeOpponentBeasts[0];
    const target = targetablePlayerBeasts[0];

    setOpponentAttacking(true);
    setTimeout(() => setOpponentAttacking(false), 1200);

    const attackerEffectiveStats = getEffectiveStats(attacker);
    const targetEffectiveStats = getEffectiveStats(target);
    const damage = Math.max(1, attackerEffectiveStats.attack - Math.floor(targetEffectiveStats.defense / 2) + Math.floor(Math.random() * 3) - 1);
    
    setCombatState(prev => {
      const newState = { ...prev };
      const targetIndex = newState.playerBeasts.findIndex(b => b.id === target.id);
      
      newState.playerBeasts[targetIndex] = {
        ...newState.playerBeasts[targetIndex],
        currentHealth: Math.max(0, target.currentHealth - damage)
      };
      
      if (newState.playerBeasts[targetIndex].currentHealth <= 0) {
        newState.playerBeasts[targetIndex].isDefeated = true;
      }
      
      newState.turn = 'player';
      
      return newState;
    });

    // Add battle log messages outside of setState to prevent double execution
    setBattleLog(prev => [...prev, `${attacker.customBeast.name} attacks ${target.customBeast.name} for ${damage} damage!`]);
    
    // Check for battle end after state update
    setTimeout(() => {
      const battleResult = checkBattleEnd();
      if (battleResult === 'opponentWin') {
        setGameState('defeat');
        setBattleLog(prev => [...prev, 'Defeat! All your beasts have fallen...']);
      } else if (battleResult === 'playerWin') {
        handleVictory();
      }
    }, 100); // Small delay to ensure state has updated

    updateCooldowns();
  };

  const proceedToLoot = () => {
    setGameState('loot');
  };

  const returnToMap = () => {
    setGameState('map');
  };

  const startBattle = () => {
    // Initialize beasts for battle - get first 4 beasts from user's collection
    const playerBeasts = getPlayerBeasts();
    const orderedBeastIds = getOrderedBeastIds();
    
    console.log('Starting battle with beasts:', playerBeasts.map(b => b.name), 'from ordered IDs:', orderedBeastIds);
    
    if (playerBeasts.length === 0 || !opponent) {
      console.error('No player beasts available or no opponent generated');
      setBattleLog(['Error: No beasts available for battle!']);
      return;
    }

    // Create battle beasts for each player beast
    const playerBattleBeasts: BattleBeast[] = [];
    const positions: Array<'frontLeft' | 'frontRight' | 'backLeft' | 'backRight'> = ['frontLeft', 'frontRight', 'backLeft', 'backRight'];
    
    for (let i = 0; i < Math.min(4, playerBeasts.length); i++) {
      const beast = playerBeasts[i];
      
      // Find the corresponding beast ID for this beast
      let beastId = '';
      if (beastData) {
        // Look for the beast ID that matches this beast data
        const matchingBeastId = orderedBeastIds[i];
        if (matchingBeastId && beastData[matchingBeastId]) {
          beastId = matchingBeastId;
        }
      }
      
      // Get the beast's individual data (stats, level, etc.)
      const beastIndividualData = beastId && beastData ? beastData[beastId] : null;
      
      const beastStats = beastIndividualData ? {
        attack: beastIndividualData.attack + (beast.totalStatBonus.attack || 0),
        defense: beastIndividualData.defense + (beast.totalStatBonus.defense || 0),
        speed: beastIndividualData.speed + (beast.totalStatBonus.speed || 0),
        magic: beastIndividualData.magic + (beast.totalStatBonus.magic || 0),
        health: beastIndividualData.health + (beast.totalStatBonus.health || 0)
      } : {
        attack: playerStats.attack + (beast.totalStatBonus.attack || 0),
        defense: playerStats.defense + (beast.totalStatBonus.defense || 0),
        speed: playerStats.speed + (beast.totalStatBonus.speed || 0),
        magic: playerStats.magic + (beast.totalStatBonus.magic || 0),
        health: playerStats.health + (beast.totalStatBonus.health || 0)
      };
      
      console.log(`Beast ${i + 1}: ${beast.name} at position ${positions[i]} with stats:`, beastStats);
      console.log(`Beast ${i + 1} abilities:`, beast.availableAbilities);
      
      const battleBeast = createBattleBeast(beast, beastStats, positions[i]);
      playerBattleBeasts.push(battleBeast);
    }
    
    const opponentBattleBeast = createBattleBeast(
      opponent, 
      {
        attack: opponentStats.attack + (opponent.totalStatBonus.attack || 0),
        defense: opponentStats.defense + (opponent.totalStatBonus.defense || 0),
        speed: opponentStats.speed + (opponent.totalStatBonus.speed || 0),
        magic: opponentStats.magic + (opponent.totalStatBonus.magic || 0),
        health: opponentMaxHealth
      }, 
      'frontLeft'
    );

    // Reset battle state with all player beasts
    setCombatState({
      playerBeasts: playerBattleBeasts,
      opponentBeasts: [opponentBattleBeast],
      turn: 'player',
      selectedPlayerBeast: playerBattleBeasts[0]?.id || null,
      selectedTarget: null
    });
    
    // Reset battle log
    setBattleLog([`Battle begins with ${playerBattleBeasts.length} beast${playerBattleBeasts.length > 1 ? 's' : ''}! You move first!`]);
    
    // Start the battle
    setGameState('battle');
  };

  // Helper function to get the ordered beast list from localStorage
  const getOrderedBeastIds = (): string[] => {
    const stored = localStorage.getItem('beastOrder');
    const order = stored ? JSON.parse(stored) : [];
    
    // Get all available beast IDs from beastData
    const allBeastIds = beastData ? Object.keys(beastData) : [];
    
    // Return ordered beasts, plus any that weren't in the saved order
    const orderedIds: string[] = [];
    const unorderedIds: string[] = [];
    
    // Add beasts in saved order
    order.forEach((id: string) => {
      if (allBeastIds.includes(id)) {
        orderedIds.push(id);
      }
    });
    
    // Add any remaining beasts that weren't in the saved order
    allBeastIds.forEach(id => {
      if (!orderedIds.includes(id)) {
        unorderedIds.push(id);
      }
    });
    
    return [...orderedIds, ...unorderedIds];
  };

  // Get up to 4 player beasts for battle (in user's preferred order)
  const getPlayerBeasts = (): CustomBeast[] => {
    const orderedBeastIds = getOrderedBeastIds();
    const playerBeasts: CustomBeast[] = [];
    
    // Get the first 4 beasts (or as many as available)
    for (let i = 0; i < Math.min(4, orderedBeastIds.length); i++) {
      const beastId = orderedBeastIds[i];
      const beast = getPlayerBeastById(beastId);
      if (beast) {
        playerBeasts.push(beast);
      }
    }
    
    // If we don't have any beasts, something is wrong - return empty array
    // The battle initialization will handle this gracefully
    return playerBeasts;
  };

  // Get a specific player beast by ID
  const getPlayerBeastById = (beastId: string): CustomBeast | null => {
    try {
      const customBeastData = localStorage.getItem(`customBeast_${beastId}`);
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
          console.log('Beast has no abilities, creating default ones for:', beast.name);
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
          console.log('Added abilities to beast:', beast.name, abilities);
        } else {
          console.log('Beast already has abilities:', beast.name, beast.availableAbilities);
        }
        
        return beast;
      }
    } catch (e) {
      console.error(`Failed to load player beast ${beastId}:`, e);
    }
    return null;
  };

  // Auto-scroll battle log to bottom when new messages are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  return (
    <div className="adventure">
      {/* Adventure Map */}
      {gameState === 'map' && (
        <AdventureMap 
          onLevelSelect={handleLevelSelect}
          onClose={handleMapClose}
        />
      )}

      {/* Setup Screen */}
      {gameState === 'setup' && (
        <div className="setup-screen">
          <div className="setup-background">
            <div className="setup-overlay" />
          </div>
          
          <div className="setup-content">
            <motion.h2 
              className="setup-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Level {selectedLevel} Challenge
            </motion.h2>
            
            <div className="opponent-preview">
              <motion.div 
                className="opponent-info"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3>{opponent?.name || 'Wild Beast'} (Level {opponentLevel})</h3>
                <div className="opponent-stats-preview">
                  <div className="stat-preview">
                    <span className="stat-icon">⚔️</span>
                    <span>ATK: {opponentStats.attack + (opponent?.totalStatBonus?.attack || 0)}</span>
                  </div>
                  <div className="stat-preview">
                    <span className="stat-icon">🛡️</span>
                    <span>DEF: {opponentStats.defense + (opponent?.totalStatBonus?.defense || 0)}</span>
                  </div>
                  <div className="stat-preview">
                    <span className="stat-icon">⚡</span>
                    <span>SPD: {opponentStats.speed + (opponent?.totalStatBonus?.speed || 0)}</span>
                  </div>
                  <div className="stat-preview">
                    <span className="stat-icon">✨</span>
                    <span>MAG: {opponentStats.magic + (opponent?.totalStatBonus?.magic || 0)}</span>
                  </div>
                </div>
               
                {opponent && (
                  <div className="opponent-visual-preview">
                    <AnimatedCustomBeast 
                      mood="normal" 
                      size={250}
                      soundEffectsEnabled={soundEffectsEnabled}
                      customBeast={opponent}
                    />
                  </div>
                )}
              </motion.div>
            </div>
            
            <div className="setup-actions">
              <motion.button
                className="setup-btn back-to-map"
                onClick={returnToMap}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                ← Back to Map
              </motion.button>
              
              <motion.button
                className="setup-btn start-battle"
                onClick={startBattle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Begin Battle! ⚔️
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'battle' && (
        <div className="battle-arena">
          {/* Background */}
          <div className="adventure-background">
            <img src="./images/arenas/forrest-arena1.jpg" alt="Adventure Arena" className="adventure-bg-image" />
          </div>
          
          {/* Battle Content */}
          <div className="battle-content">
            {/* Player Beasts */}
            <div className="beast-container player-beast">
              <div className="beast-info">
                <h3>Your Team</h3>
                {combatState.playerBeasts.map((beast) => (
                  <div 
                    key={beast.id} 
                    className={`beast-card ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedPlayerBeast === beast.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (!beast.isDefeated) {
                        setCombatState(prev => ({ ...prev, selectedPlayerBeast: beast.id }));
                      }
                    }}
                  >
                    <div className="beast-name">
                      {beast.customBeast.name}
                      <span className="beast-level" style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '8px' }}>Lvl {(() => {
                        // Get the beast's level from beastData using the ordered beast IDs
                        const orderedBeastIds = getOrderedBeastIds();
                        const beastIndex = combatState.playerBeasts.findIndex(b => b.id === beast.id);
                        const beastId = orderedBeastIds[beastIndex];
                        return beastData && beastId && beastData[beastId] ? beastData[beastId].level : 1;
                      })()}</span>
                    </div>
                    <div className="health-bar">
                      <div 
                        className="health-fill player-health" 
                        style={{ width: `${(beast.currentHealth / beast.stats.health) * 100}%` }}
                      />
                      <span className="health-text">{beast.currentHealth}/{beast.stats.health}</span>
                    </div>
                    <div className="mana-bar-mini">
                      <div 
                        className="mana-fill" 
                        style={{ width: `${(beast.currentMana / 50) * 100}%` }}
                      />
                      <span className="mana-text-mini">{beast.currentMana}/50</span>
                    </div>
                    <div className="position-indicator">{beast.position}</div>
                    {Object.keys(beast.statusEffects).length > 0 && (
                      <div className="status-effects-indicator">
                        {Object.entries(beast.statusEffects).map(([effectKey, effect]) => (
                          <span key={effectKey} className={`status-effect ${effect.value > 0 ? 'buff' : 'debuff'}`}>
                            {effect.value > 0 ? '↑' : '↓'}{effect.duration}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {combatState.playerBeasts.length > 0 && (
                <div className="beast-visual-grid">
                  <div className="beast-line backLine">
                    {combatState.playerBeasts
                      .filter(beast => beast.position === 'backLeft' || beast.position === 'backRight')
                      .map((beast) => (
                        <div 
                          key={beast.id} 
                          className={`beast-visual-slot ${beast.position} ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedPlayerBeast === beast.id ? 'selected' : ''}`}
                          onClick={() => setCombatState(prev => ({ ...prev, selectedPlayerBeast: beast.id }))}
                        >
                          <AnimatedCustomBeast 
                            mood={playerAttacking && combatState.selectedPlayerBeast === beast.id ? "attack" : beast.isDefeated ? "laying" : "normal"} 
                            size={200}
                            soundEffectsEnabled={soundEffectsEnabled}
                            customBeast={beast.customBeast}
                          />
                          <div className="beast-visual-label">{beast.customBeast.name}</div>
                          <div className="beast-visual-position">{beast.position}</div>
                        </div>
                      ))}
                  </div>
                  <div className="beast-line frontLine">
                    {combatState.playerBeasts
                      .filter(beast => beast.position === 'frontLeft' || beast.position === 'frontRight')
                      .map((beast) => (
                        <div 
                          key={beast.id} 
                          className={`beast-visual-slot ${beast.position} ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedPlayerBeast === beast.id ? 'selected' : ''}`}
                          onClick={() => setCombatState(prev => ({ ...prev, selectedPlayerBeast: beast.id }))}
                        >
                          <AnimatedCustomBeast 
                            mood={playerAttacking && combatState.selectedPlayerBeast === beast.id ? "attack" : beast.isDefeated ? "laying" : "normal"} 
                            size={200}
                            soundEffectsEnabled={soundEffectsEnabled}
                            customBeast={beast.customBeast}
                          />
                          <div className="beast-visual-label">{beast.customBeast.name}</div>
                          <div className="beast-visual-position">{beast.position}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Opponent Beasts */}
            <div className="beast-container opponent-beast">
              <div className="beast-info">
                <h3>Enemy Team</h3>
                {combatState.opponentBeasts.map((beast) => (
                  <div 
                    key={beast.id} 
                    className={`beast-card ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedTarget === beast.id ? 'target-selected' : ''} ${getTargetableBeasts(combatState.opponentBeasts).includes(beast) ? 'targetable' : 'not-targetable'}`}
                    onClick={() => {
                      if (getTargetableBeasts(combatState.opponentBeasts).includes(beast)) {
                        setCombatState(prev => ({ ...prev, selectedTarget: beast.id }));
                      }
                    }}
                    style={{ cursor: getTargetableBeasts(combatState.opponentBeasts).includes(beast) ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="beast-name">
                      {beast.customBeast.name} 
                      <span className="beast-level" style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '8px' }}>Lvl {opponentLevel}</span>
                    </div>
                    <div className="health-bar">
                      <div 
                        className="health-fill opponent-health" 
                        style={{ width: `${(beast.currentHealth / beast.stats.health) * 100}%` }}
                      />
                      <span className="health-text">{beast.currentHealth}/{beast.stats.health}</span>
                    </div>
                    <div className="position-indicator">{beast.position}</div>
                    {Object.keys(beast.statusEffects).length > 0 && (
                      <div className="status-effects-indicator">
                        {Object.entries(beast.statusEffects).map(([effectKey, effect]) => (
                          <span key={effectKey} className={`status-effect ${effect.value > 0 ? 'buff' : 'debuff'}`}>
                            {effect.value > 0 ? '↑' : '↓'}{effect.duration}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {combatState.opponentBeasts.length > 0 && (
                <div className="beast-visual-grid opponent-grid">
                  <div className="beast-line backLine">
                    {combatState.opponentBeasts
                      .filter(beast => beast.position === 'backLeft' || beast.position === 'backRight')
                      .map((beast) => (
                        <div 
                          key={beast.id} 
                          className={`beast-visual-slot ${beast.position} ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedTarget === beast.id ? 'target-selected' : ''}`}
                          onClick={() => {
                            if (getTargetableBeasts(combatState.opponentBeasts).includes(beast)) {
                              setCombatState(prev => ({ ...prev, selectedTarget: beast.id }));
                            }
                          }}
                        >
                          <AnimatedCustomBeast 
                            mood={opponentAttacking ? "attack" : beast.isDefeated ? "laying" : "normal"} 
                            size={200}
                            soundEffectsEnabled={soundEffectsEnabled}
                            customBeast={beast.customBeast}
                          />
                          <div className="beast-visual-label">{beast.customBeast.name}</div>
                          <div className="beast-visual-position">{beast.position}</div>
                          {getTargetableBeasts(combatState.opponentBeasts).includes(beast) && (
                            <div className="targetable-indicator">🎯</div>
                          )}
                        </div>
                      ))}
                  </div>
                  <div className="beast-line frontLine">
                    {combatState.opponentBeasts
                      .filter(beast => beast.position === 'frontLeft' || beast.position === 'frontRight')
                      .map((beast) => (
                        <div 
                          key={beast.id} 
                          className={`beast-visual-slot ${beast.position} ${beast.isDefeated ? 'defeated' : ''} ${combatState.selectedTarget === beast.id ? 'target-selected' : ''}`}
                          onClick={() => {
                            if (getTargetableBeasts(combatState.opponentBeasts).includes(beast)) {
                              setCombatState(prev => ({ ...prev, selectedTarget: beast.id }));
                            }
                          }}
                        >
                          <AnimatedCustomBeast 
                            mood={opponentAttacking ? "attack" : beast.isDefeated ? "laying" : "normal"} 
                            size={200}
                            soundEffectsEnabled={soundEffectsEnabled}
                            customBeast={beast.customBeast}
                          />
                          <div className="beast-visual-label">{beast.customBeast.name}</div>
                          <div className="beast-visual-position">{beast.position}</div>
                          {getTargetableBeasts(combatState.opponentBeasts).includes(beast) && (
                            <div className="targetable-indicator">🎯</div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Battle Controls */}
          <div className="battle-controls">
            <div className="turn-indicator">
              {(() => {
                if (combatState.turn === 'player') {
                  const selectedBeast = combatState.playerBeasts.find(b => b.id === combatState.selectedPlayerBeast);
                  if (selectedBeast) {
                    return `It's your turn, ${selectedBeast.customBeast.name}!`;
                  }
                  return "Your Turn!";
                } else {
                  const activeOpponentBeasts = combatState.opponentBeasts.filter(b => !b.isDefeated);
                  if (activeOpponentBeasts.length > 0) {
                    return `${activeOpponentBeasts[0].customBeast.name} is attacking...`;
                  }
                  return "Opponent's Turn...";
                }
              })()}
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <motion.button
                className={`action-btn basic-attack ${combatState.turn !== 'player' ? 'disabled' : ''}`}
                onClick={basicAttack}
                disabled={combatState.turn !== 'player'}
                whileHover={combatState.turn === 'player' ? { scale: 1.05 } : {}}
                whileTap={combatState.turn === 'player' ? { scale: 0.95 } : {}}
              >
                ⚔️ Basic Attack
              </motion.button>

              {/* Ability Buttons */}
              {(() => {
                const selectedBeast = combatState.playerBeasts.find(b => b.id === combatState.selectedPlayerBeast);
                if (!selectedBeast) {
                  return null;
                }
                
                return selectedBeast.customBeast.availableAbilities?.map(ability => {
                  const cooldown = selectedBeast.abilityCooldowns.find(cd => cd.abilityId === ability.id);
                  const isOnCooldown = cooldown && cooldown.turnsLeft > 0;
                  const hasEnoughMana = selectedBeast.currentMana >= (ability.manaCost || 0);
                  const needsTarget = ability.type === 'attack' || ability.type === 'magicAttack' || ability.type === 'debuff';
                  const hasTarget = combatState.selectedTarget !== null;
                  const canUse = combatState.turn === 'player' && !isOnCooldown && hasEnoughMana && (!needsTarget || hasTarget);

                  return (
                    <motion.button
                      key={ability.id}
                      className={`action-btn ability-btn ${!canUse ? 'disabled' : ''} ${ability.type}`}
                      onClick={() => castAbility(ability, combatState.selectedTarget || undefined)}
                      disabled={!canUse}
                      whileHover={canUse ? { scale: 1.05 } : {}}
                      whileTap={canUse ? { scale: 0.95 } : {}}
                      title={`${ability.description}\nDamage: ${ability.damage || 'N/A'}\nMana: ${ability.manaCost || 0}\nCooldown: ${ability.cooldown} turns`}
                    >
                      <div className="ability-name">{ability.name}</div>
                      <div className="ability-cost">💧{ability.manaCost || 0}</div>
                      {isOnCooldown && (
                        <div className="cooldown-overlay">
                          {cooldown?.turnsLeft}
                        </div>
                      )}
                    </motion.button>
                  );
                });
              })()}

              {/* Flee Button */}
              <motion.button
                className="action-btn flee-btn"
                onClick={() => {
                  setGameState('defeat');
                  setBattleLog(prev => [...prev, 'You fled from battle!']);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏃 Flee
              </motion.button>
            </div>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            <h4>Battle Log</h4>
            <div className="log-content" ref={battleLogRef}>
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
              onClick={returnToMap}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Map
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Victory sound effect */}
      <audio
        ref={victorySoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/chime1.mp3" type="audio/mpeg" />
      </audio>

      {/* Loot sound effect */}
      <audio
        ref={lootSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/item1.mp3" type="audio/mpeg" />
      </audio>

      {/* Magic attack sound effect */}
      <audio
        ref={magicAttackSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/magic-attack1.mp3" type="audio/mpeg" />
      </audio>

      {/* Battle background music */}
      <audio
        ref={battleMusicRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="./sounds/forrest-battle.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};
