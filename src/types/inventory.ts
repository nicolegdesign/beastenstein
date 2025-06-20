// Import SVG files
import stuffedLionSvg from '/images/items/stuffedLion.svg';
import shovelSvg from '/images/items/shovel.svg';
import beastBiscuitSvg from '/images/items/beastBiscuit.svg';

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  description?: string;
  effect: 'happiness' | 'hunger' | 'energy' | 'cleanup' | 'none';
}

export const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 'stuffedLion',
    name: 'Stuffed Lion',
    image: stuffedLionSvg,
    quantity: 99,
    description: 'A cuddly stuffed lion toy that makes beasts very happy!',
    effect: 'happiness'
  },
  {
    id: 'shovel',
    name: 'Shovel',
    image: shovelSvg,
    quantity: 99,
    description: 'A handy shovel for cleaning up all the poos',
    effect: 'cleanup'
  },
  {
    id: 'beastBiscuit',
    name: 'Beast Biscuit',
    image: beastBiscuitSvg,
    quantity: 99,
    description: 'Delicious treats that completely satisfy hunger',
    effect: 'hunger'
  }
];
