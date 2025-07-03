import type { EnhancedBeastPart, EnhancedBeastPartSet } from '../types/abilities';
import { ABILITIES } from './abilities';

// Individual beast parts (heads and torsos)
export const BEAST_PARTS: EnhancedBeastPart[] = [
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
  },
  
  // Wooden Puppet parts
  {
    id: 'woodenpuppet-head',
    name: 'Wooden Puppet Head',
    imagePath: './images/beasts/wooden-puppet/wooden-puppet-head.svg',
    type: 'head',
    rarity: 'common',
    statBonus: { defense: 2, health: 5 },
    ability: {
      id: 'splinter',
      name: 'Splinter',
      description: 'Wooden fragments pierce the enemy',
      type: 'attack',
      damage: 8,
      cooldown: 1,
      manaCost: 3
    }
  },
  {
    id: 'woodenpuppet-torso',
    name: 'Wooden Puppet Torso',
    imagePath: './images/beasts/wooden-puppet/wooden-puppet-torso.svg',
    type: 'torso',
    rarity: 'common',
    statBonus: { defense: 5, health: 20 }
  }
];

// Arm sets
export const ARM_SETS: EnhancedBeastPartSet[] = [
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
    id: 'woodenpuppet-arms',
    name: 'Wooden Puppet Arms',
    leftImagePath: './images/beasts/wooden-puppet/wooden-puppet-arm-l.svg',
    rightImagePath: './images/beasts/wooden-puppet/wooden-puppet-arm-r.svg',
    type: 'armSet',
    rarity: 'common',
    statBonus: { defense: 2, health: 10 },
    ability: {
      id: 'woodenStrike',
      name: 'Wooden Strike',
      description: 'A sturdy wooden blow',
      type: 'attack',
      damage: 6,
      cooldown: 1,
      manaCost: 2
    }
  }
];

// Leg sets
export const LEG_SETS: EnhancedBeastPartSet[] = [
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
    id: 'woodenpuppet-legs',
    name: 'Wooden Puppet Legs',
    leftImagePath: './images/beasts/wooden-puppet/wooden-puppet-leg-l.svg',
    rightImagePath: './images/beasts/wooden-puppet/wooden-puppet-leg-r.svg',
    type: 'legSet',
    rarity: 'common',
    statBonus: { defense: 3, speed: 1 },
    ability: {
      id: 'rootedStance',
      name: 'Rooted Stance',
      description: 'Plant firmly for increased defense',
      type: 'buff',
      cooldown: 3,
      manaCost: 8,
      effects: {
        statModifier: { defense: 3 },
        duration: 3
      }
    }
  }
];

// Helper functions to find parts by ID or type
export const findPartById = (id: string): EnhancedBeastPart | undefined => {
  return BEAST_PARTS.find(part => part.id === id);
};

export const findArmSetById = (id: string): EnhancedBeastPartSet | undefined => {
  return ARM_SETS.find(set => set.id === id);
};

export const findLegSetById = (id: string): EnhancedBeastPartSet | undefined => {
  return LEG_SETS.find(set => set.id === id);
};

export const getPartsByType = (type: EnhancedBeastPart['type']): EnhancedBeastPart[] => {
  return BEAST_PARTS.filter(part => part.type === type);
};

export const getPartsByBeastType = (beastType: 'nightwolf' | 'mountaindragon' | 'woodenpuppet'): {
  head: EnhancedBeastPart | undefined;
  torso: EnhancedBeastPart | undefined;
  armSet: EnhancedBeastPartSet | undefined;
  legSet: EnhancedBeastPartSet | undefined;
} => {
  return {
    head: BEAST_PARTS.find(part => part.id === `${beastType}-head`),
    torso: BEAST_PARTS.find(part => part.id === `${beastType}-torso`),
    armSet: ARM_SETS.find(set => set.id === `${beastType}-arms`),
    legSet: LEG_SETS.find(set => set.id === `${beastType}-legs`)
  };
};
