export interface BeastStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export interface IndividualBeastData extends BeastStats {
  name: string;
  isResting: boolean;
}

export interface BeastState extends BeastStats {
  isResting: boolean;
  beastName: string;
  currentBeastId: string;
}

export type BeastMood = 'happy' | 'normal' | 'sad';

export interface GameState extends BeastState {
  currentBackgroundIndex: number;
}

export interface PooItem {
  id: string;
  x: number;
  y: number;
}
