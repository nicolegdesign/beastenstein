import type { BeastCombatStats } from './game';

export interface BeastConfig {
  id: string;
  name: string;
  images: {
    normal: string;
    happy: string;
    sad: string;
    rest: string;
  };
  defaultStats: BeastCombatStats;
}

// All beasts are now custom beasts - this array is kept for backward compatibility but not used
export const BEASTS: BeastConfig[] = [];

export const getBeastById = (id: string): BeastConfig | undefined => {
  return BEASTS.find(beast => beast.id === id);
};
