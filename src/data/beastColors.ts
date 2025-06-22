export interface BeastColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const BEAST_COLOR_SCHEMES: BeastColorScheme[] = [
  {
    id: 'natural',
    name: 'Natural',
    primary: '#8B4513',
    secondary: '#654321', 
    accent: '#A0522D',
    rarity: 'common'
  },
  {
    id: 'shadow',
    name: 'Shadow',
    primary: '#2C2C2C',
    secondary: '#1A1A1A',
    accent: '#4A4A4A',
    rarity: 'common'
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: '#228B22',
    secondary: '#006400',
    accent: '#32CD32',
    rarity: 'common'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#4682B4',
    secondary: '#191970',
    accent: '#87CEEB',
    rarity: 'uncommon'
  },
  {
    id: 'crimson',
    name: 'Crimson',
    primary: '#DC143C',
    secondary: '#8B0000',
    accent: '#FF6347',
    rarity: 'uncommon'
  },
  {
    id: 'arctic',
    name: 'Arctic',
    primary: '#F0F8FF',
    secondary: '#E6E6FA',
    accent: '#B0E0E6',
    rarity: 'rare'
  },
  {
    id: 'golden',
    name: 'Golden',
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FFFF00',
    rarity: 'rare'
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    primary: '#E6E6FA',
    secondary: '#DDA0DD',
    accent: '#FF69B4',
    rarity: 'epic'
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    primary: '#4B0082',
    secondary: '#8A2BE2',
    accent: '#00CED1',
    rarity: 'legendary'
  }
];

export const getDefaultColorScheme = (): BeastColorScheme => {
  return BEAST_COLOR_SCHEMES[0]; // Natural
};
