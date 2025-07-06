import { BEAST_PARTS, ARM_SETS, LEG_SETS, EXTRA_LIMBS } from './beastParts';

export interface LootItem {
  id: string;
  name: string;
  type: 'part' | 'set';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath: string;
}

// Convert beast parts to loot items - this eliminates duplication!
export const LOOT_ITEMS: LootItem[] = [
  // Individual beast parts (heads, torsos)
  ...BEAST_PARTS.map(part => ({
    id: part.id,
    name: part.name,
    type: 'part' as const,
    rarity: part.rarity,
    imagePath: part.imagePath
  })),
  
  // Arm sets
  ...ARM_SETS.map(set => ({
    id: set.id,
    name: set.name,
    type: 'set' as const,
    rarity: set.rarity,
    imagePath: set.rightImagePath // Use right arm image for loot display
  })),
  
  // Leg sets
  ...LEG_SETS.map(set => ({
    id: set.id,
    name: set.name,
    type: 'set' as const,
    rarity: set.rarity,
    imagePath: set.rightImagePath // Use right leg image for loot display
  })),
  
  // Extra limbs (wings, tails)
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
