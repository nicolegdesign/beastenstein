export interface GameOptions {
  disableStatDecay: boolean;
  disablePooSpawning: boolean;
  showBeastBorder: boolean;
  disableRandomMovement: boolean;
}

export const DEFAULT_OPTIONS: GameOptions = {
  disableStatDecay: false,
  disablePooSpawning: false,
  showBeastBorder: false,
  disableRandomMovement: false,
};
