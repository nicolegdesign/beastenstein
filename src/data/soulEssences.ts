export interface SoulEssence {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  maxLevel: number;
}

export const SOUL_ESSENCES: SoulEssence[] = [
  {
    id: 'dim-soul',
    name: 'Dim Soul',
    description: 'A faint glimmer of spiritual energy',
    imagePath: './images/items/dim-soul.png',
    rarity: 'common',
    maxLevel: 5
  },
  {
    id: 'glowing-soul',
    name: 'Glowing Soul',
    description: 'A warm, steady spiritual glow',
    imagePath: './images/items/glowing-soul.png',
    rarity: 'uncommon',
    maxLevel: 10
  },
  {
    id: 'bright-soul',
    name: 'Bright Soul',
    description: 'A radiant burst of spiritual power',
    imagePath: './images/items/bright-soul.png',
    rarity: 'rare',
    maxLevel: 15
  },
  {
    id: 'brilliant-soul',
    name: 'Brilliant Soul',
    description: 'An intense blaze of spiritual energy',
    imagePath: './images/items/brilliant-soul.png',
    rarity: 'epic',
    maxLevel: 20
  },
  {
    id: 'luminescent-soul',
    name: 'Luminescent Soul',
    description: 'The ultimate manifestation of spiritual essence',
    imagePath: './images/items/luminescent-soul.png',
    rarity: 'legendary',
    maxLevel: 25
  }
];

export const findSoulEssenceById = (id: string): SoulEssence | undefined => {
  return SOUL_ESSENCES.find(soul => soul.id === id);
};

export const getMaxLevelFromSoul = (soulId: string): number => {
  const soul = findSoulEssenceById(soulId);
  return soul?.maxLevel || 5; // Default to dim soul level
};

// Get the stat bonus multiplier for level ups based on soul essence rarity
export const getSoulStatMultiplier = (soulId: string): number => {
  const soul = findSoulEssenceById(soulId);
  if (!soul) return 1; // Default to 1 if soul not found
  
  switch (soul.rarity) {
    case 'common':     // dim-soul
      return 1;
    case 'uncommon':   // glowing-soul
      return 2;
    case 'rare':       // bright-soul
      return 3;
    case 'epic':       // brilliant-soul
      return 4;
    case 'legendary':  // luminescent-soul
      return 5;
    default:
      return 1;
  }
};
