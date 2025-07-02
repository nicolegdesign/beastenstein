export interface GameOptions {
  disableStatDecay: boolean;
  disablePooSpawning: boolean;
  disableRandomMovement: boolean;
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = {
  disableStatDecay: false,
  disablePooSpawning: false,
  disableRandomMovement: false,
  soundEffectsEnabled: true,
  musicEnabled: true,
};
