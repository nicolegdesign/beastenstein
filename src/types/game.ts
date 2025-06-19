export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export interface IndividualPetData extends PetStats {
  name: string;
  isResting: boolean;
}

export interface PetState extends PetStats {
  isResting: boolean;
  petName: string;
  currentPetId: string;
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
