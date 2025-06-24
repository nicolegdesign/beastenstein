export interface GameOptions {
  disableStatDecay: boolean;
  disablePooSpawning: boolean;
  disableRandomMovement: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = {
  disableStatDecay: false,
  disablePooSpawning: false,
  disableRandomMovement: false,
};
