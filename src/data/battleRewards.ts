import type { InventoryItem } from '../types/inventory';

// Item drops with rarity-based drop rates
export const BATTLE_ITEM_DROPS: InventoryItem[] = [
  // Common items (70% chance)
  {
    id: 'stuffedLion',
    name: 'Stuffed Lion',
    image: './images/items/stuffedLion.svg',
    quantity: 1,
    description: 'A cuddly stuffed lion toy that makes beasts very happy!',
    effect: 'happiness',
    rarity: 'common'
  },
  {
    id: 'beastBiscuit',
    name: 'Beast Biscuit',
    image: './images/items/beastBiscuit.svg',
    quantity: 1,
    description: 'Delicious treats that completely satisfy hunger',
    effect: 'hunger',
    rarity: 'common'
  },
  {
    id: 'healthPotion',
    name: 'Health Potion',
    image: './images/items/healing-potion.svg',
    quantity: 1,
    description: 'A magical potion that heals 25% of a beast\'s health',
    effect: 'health',
    rarity: 'common'
  },
  {
    id: 'manaPotion',
    name: 'Mana Potion',
    image: './images/items/mana-potion.svg',
    quantity: 1,
    description: 'A mystical potion that restores 25% of a beast\'s mana',
    effect: 'mana',
    rarity: 'common'
  },
  
  // Uncommon items (20% chance)
  {
    id: 'shovel',
    name: 'Shovel',
    image: './images/items/shovel.svg',
    quantity: 1,
    description: 'A handy shovel for cleaning up all the poos',
    effect: 'cleanup',
    rarity: 'uncommon'
  },
  {
    id: 'mysteryMeat',
    name: 'Mystery Meat',
    image: './images/items/steak.svg',
    quantity: 1,
    description: 'Mysterious meat of unknown origin that satisfies hunger',
    effect: 'hunger',
    rarity: 'uncommon'
  },
  {
    id: 'fuzzyBall',
    name: 'Fuzzy Ball',
    image: './images/items/tennisBall.svg',
    quantity: 1,
    description: 'A fuzzy ball that beasts love to play with',
    effect: 'happiness',
    rarity: 'uncommon'
  },
  
  // Rare items (7% chance)
  {
    id: 'dragonScale',
    name: 'Dragon Scale',
    image: './images/items/dragonScale.svg',
    quantity: 1,
    description: 'A rare scale that provides temporary protection',
    effect: 'none',
    rarity: 'rare'
  },
  
  // Epic items (2.5% chance)
  {
    id: 'starFragment',
    name: 'Star Fragment',
    image: './images/items/starFragment.svg',
    quantity: 1,
    description: 'A fragment of a fallen star, radiating pure energy',
    effect: 'none',
    rarity: 'epic'
  },
  
  // Legendary items (0.5% chance)
  {
    id: 'voidCrystal',
    name: 'Void Crystal',
    image: './images/items/voidCrystal.svg',
    quantity: 1,
    description: 'An extremely rare crystal from the void between worlds',
    effect: 'none',
    rarity: 'legendary'
  }
];

// Rarity drop weights
export const ITEM_RARITY_WEIGHTS = {
  common: 700,    // 70%
  uncommon: 200,  // 20%
  rare: 70,       // 7%
  epic: 25,       // 2.5%
  legendary: 5    // 0.5%
} as const;

// Item drop chance based on level (higher level = better chance)
export const getItemDropChance = (level: number): number => {
  const baseChance = 80; // 80% base chance (increased for testing)
  const levelBonus = Math.min(level * 5, 50); // +5% per level, max +50%
  return Math.min(baseChance + levelBonus, 100); // Max 100% chance
};

// Generate random item drop based on rarity weights
export const generateItemDrop = (level: number): InventoryItem | null => {
  const dropChance = getItemDropChance(level);
  
  // Check if we get an item drop
  if (Math.random() * 100 > dropChance) {
    return null; // No item drop
  }
  
  // Calculate total weight
  const totalWeight = Object.values(ITEM_RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  let selectedRarity: keyof typeof ITEM_RARITY_WEIGHTS = 'common';
  
  for (const [rarity, weight] of Object.entries(ITEM_RARITY_WEIGHTS)) {
    currentWeight += weight;
    if (randomWeight <= currentWeight) {
      selectedRarity = rarity as keyof typeof ITEM_RARITY_WEIGHTS;
      break;
    }
  }
  
  // Filter items by selected rarity
  const itemsOfRarity = BATTLE_ITEM_DROPS.filter(item => item.rarity === selectedRarity);
  
  if (itemsOfRarity.length === 0) {
    return null; // Fallback if no items of this rarity
  }
  
  // Select random item from the rarity tier
  const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  
  return {
    ...randomItem,
    quantity: 1 // Always drop 1 item
  };
};
