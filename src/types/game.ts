export interface BeastCombatStats {
  attack: number;
  defense: number;
  speed: number;
  magic: number;
}

export interface BeastStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  level: number;
  age: number; // in days
}

export interface BeastFullStats extends BeastStats, BeastCombatStats {}

export interface IndividualBeastData extends BeastFullStats {
  name: string;
  isResting: boolean;
  createdAt: number; // timestamp when beast was first created
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
