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

export const BEASTS: BeastConfig[] = [
  {
    id: 'emi',
    name: 'Emi',
    images: {
      normal: './images/pet-normal.png',
      happy: './images/pet-happy.png',
      sad: './images/pet-sad.png',
      rest: './images/pet-rest.png',
    },
    defaultStats: {
      attack: 10,
      defense: 8,
      speed: 12,
      magic: 6,
    },
  },
  {
    id: 'hobbes',
    name: 'Hobbes', 
    images: {
      normal: './images/pet2-normal.png',
      happy: './images/pet2-happy.png',
      sad: './images/pet2-sad.png',
      rest: './images/pet2-rest.png',
    },
    defaultStats: {
      attack: 12,
      defense: 10,
      speed: 8,
      magic: 8,
    },
  },
];

export const getBeastById = (id: string): BeastConfig | undefined => {
  return BEASTS.find(beast => beast.id === id);
};
