export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export interface PetState extends PetStats {
  isResting: boolean;
  petName: string;
}

export type PetMood = 'happy' | 'normal' | 'sad';

export interface GameState extends PetState {
  currentBackgroundIndex: number;
}

export interface PooItem {
  id: string;
  x: number;
  y: number;
}
