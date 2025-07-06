import { EXTRA_LIMBS } from './beastParts';

export interface LootItem {
  id: string;
  name: string;
  type: 'part' | 'set';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath: string;
}

export const LOOT_ITEMS: LootItem[] = [
  // Basic beast parts
  { id: 'nightwolf-head', name: 'Night Wolf Head', type: 'part', rarity: 'common', imagePath: './images/beasts/night-wolf/night-wolf-head.svg' },
  { id: 'nightwolf-torso', name: 'Night Wolf Torso', type: 'part', rarity: 'common', imagePath: './images/beasts/night-wolf/night-wolf-torso.svg' },
  { id: 'mountaindragon-head', name: 'Mountain Dragon Head', type: 'part', rarity: 'common', imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg' },
  { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', type: 'part', rarity: 'common', imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg' },
  { id: 'woodenpuppet-head', name: 'Wooden Puppet Head', type: 'part', rarity: 'common', imagePath: './images/beasts/wooden-puppet/wooden-puppet-head.svg' },
  { id: 'woodenpuppet-torso', name: 'Wooden Puppet Torso', type: 'part', rarity: 'common', imagePath: './images/beasts/wooden-puppet/wooden-puppet-torso.svg' },
  
  // Uncommon parts
  { id: 'forestsprite-head', name: 'Forest Sprite Head', type: 'part', rarity: 'uncommon', imagePath: './images/beasts/forest-sprite/forest-sprite-head.svg' },
  { id: 'forestsprite-torso', name: 'Forest Sprite Torso', type: 'part', rarity: 'uncommon', imagePath: './images/beasts/forest-sprite/forest-sprite-torso.svg' },
  
  // Rare parts
  { id: 'shadowbeast-head', name: 'Shadow Beast Head', type: 'part', rarity: 'rare', imagePath: './images/beasts/shadow-beast/shadow-beast-head.svg' },
  { id: 'shadowbeast-torso', name: 'Shadow Beast Torso', type: 'part', rarity: 'rare', imagePath: './images/beasts/shadow-beast/shadow-beast-torso.svg' },
  
  // Epic parts
  { id: 'thundereagle-head', name: 'Thunder Eagle Head', type: 'part', rarity: 'epic', imagePath: './images/beasts/thunder-eagle/thunder-eagle-head.svg' },
  { id: 'thundereagle-torso', name: 'Thunder Eagle Torso', type: 'part', rarity: 'epic', imagePath: './images/beasts/thunder-eagle/thunder-eagle-torso.svg' },
  
  // Legendary parts
  { id: 'frostwolf-head', name: 'Frost Wolf Head', type: 'part', rarity: 'legendary', imagePath: './images/beasts/frost-wolf/frost-wolf-head.svg' },
  { id: 'frostwolf-torso', name: 'Frost Wolf Torso', type: 'part', rarity: 'legendary', imagePath: './images/beasts/frost-wolf/frost-wolf-torso.svg' },
  
  // Arm and leg sets
  { id: 'nightwolf-arms', name: 'Night Wolf Arms', type: 'set', rarity: 'common', imagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg' },
  { id: 'nightwolf-legs', name: 'Night Wolf Legs', type: 'set', rarity: 'common', imagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg' },
  { id: 'mountaindragon-arms', name: 'Mountain Dragon Arms', type: 'set', rarity: 'common', imagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg' },
  { id: 'mountaindragon-legs', name: 'Mountain Dragon Legs', type: 'set', rarity: 'common', imagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg' },
  { id: 'woodenpuppet-arms', name: 'Wooden Puppet Arms', type: 'set', rarity: 'common', imagePath: './images/beasts/wooden-puppet/wooden-puppet-arm-r.svg' },
  { id: 'woodenpuppet-legs', name: 'Wooden Puppet Legs', type: 'set', rarity: 'common', imagePath: './images/beasts/wooden-puppet/wooden-puppet-leg-r.svg' },
  
  // Extra parts (wings and tails) from centralized beast parts
  ...EXTRA_LIMBS.map(limb => ({
    id: limb.id,
    name: limb.name,
    type: 'part' as const,
    rarity: limb.rarity,
    imagePath: limb.imagePath
  }))
];

// Rarity weights (higher = more common)
export const RARITY_WEIGHTS = {
  'common': 50,
  'uncommon': 25,
  'rare': 15,
  'epic': 8,
  'legendary': 2
} as const;
