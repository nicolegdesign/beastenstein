import type { Ability } from '../types/abilities';

export const ABILITIES: Record<string, Ability> = {
  // Arm abilities
  slash: {
    id: 'slash',
    name: 'Slash',
    description: 'A quick slashing attack that deals damage',
    type: 'attack',
    damage: 15,
    cooldown: 1,
    manaCost: 5
  },
  
  dragonClaw: {
    id: 'dragonClaw',
    name: 'Dragon Claw',
    description: 'A powerful claw strike that ignores some defense',
    type: 'attack',
    damage: 20,
    cooldown: 2,
    manaCost: 8
  },

  // Head abilities  
  howl: {
    id: 'howl',
    name: 'Howl',
    description: 'Intimidates the enemy, reducing their attack',
    type: 'debuff',
    effects: {
      statModifier: { attack: -3 },
      duration: 3
    },
    cooldown: 3,
    manaCost: 10
  },
  
  dragonBreath: {
    id: 'dragonBreath',
    name: 'Dragon Breath',
    description: 'Breathes fire dealing magic damage',
    type: 'magicAttack',
    damage: 18,
    cooldown: 3,
    manaCost: 12
  },

  // Leg abilities
  charge: {
    id: 'charge',
    name: 'Charge',
    description: 'Rush at the enemy with increased speed',
    type: 'attack',
    damage: 12,
    effects: {
      statModifier: { speed: 5 },
      duration: 1
    },
    cooldown: 2,
    manaCost: 6
  },
  
  dragonLeap: {
    id: 'dragonLeap',
    name: 'Dragon Leap',
    description: 'Leap high and strike down with great force',
    type: 'attack',
    damage: 22,
    cooldown: 4,
    manaCost: 15
  },

  // Defensive abilities
  ironHide: {
    id: 'ironHide',
    name: 'Iron Hide',
    description: 'Hardens skin to reduce incoming damage',
    type: 'buff',
    effects: {
      statModifier: { defense: 8 },
      duration: 4
    },
    cooldown: 5,
    manaCost: 12
  },

  heal: {
    id: 'heal',
    name: 'Heal',
    description: 'Restore health to yourself',
    type: 'heal',
    healing: 15,
    cooldown: 3,
    manaCost: 12
  }
};
