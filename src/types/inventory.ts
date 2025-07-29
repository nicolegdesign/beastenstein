export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  description?: string;
  effect: 'happiness' | 'hunger' | 'energy' | 'cleanup' | 'health' | 'mana' | 'none';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Beast part inventory types
export interface PartInventoryItem {
  id: string;
  quantity: number;
}

export interface SoulEssenceInventoryItem {
  id: string;
  quantity: number;
}

export interface BeastPartInventory {
  parts: Record<string, number>; // partId -> quantity (head, torso only)
  sets: Record<string, number>; // setId -> quantity (arm sets, leg sets)
  soulEssences: Record<string, number>; // soulEssenceId -> quantity
}
