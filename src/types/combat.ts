import type { BeastCombatStats } from './game';
import type { Ability, StatBonus, EnhancedBeastPart } from './abilities';

export interface AbilityCooldown {
  abilityId: string;
  turnsLeft: number;
}

export interface SoulEssence {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface CustomBeast {
  name: string;
  gender: 'male' | 'female';
  head: EnhancedBeastPart;
  torso: EnhancedBeastPart;
  armLeft: EnhancedBeastPart;
  armRight: EnhancedBeastPart;
  legLeft: EnhancedBeastPart;
  legRight: EnhancedBeastPart;
  wings?: EnhancedBeastPart;
  tail?: EnhancedBeastPart;
  soulEssence: SoulEssence;
  colorScheme?: { id: string; name: string; primary: string; secondary: string; accent: string; rarity: string };
  totalStatBonus: StatBonus;
  availableAbilities: Ability[];
}

export interface BattleBeast {
  id: string;
  customBeast: CustomBeast;
  stats: BeastCombatStats & { health: number };
  currentHealth: number;
  currentMana: number;
  position: 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight';
  abilityCooldowns: AbilityCooldown[];
  statusEffects: { [key: string]: { duration: number; value: number } };
  isDefeated: boolean;
}

export interface CombatState {
  playerBeasts: BattleBeast[];
  opponentBeasts: BattleBeast[];
  turnOrder: string[]; // Array of beast IDs in speed order
  currentTurnIndex: number; // Index in turnOrder array
  currentRound: number; // Current round number
  selectedPlayerBeast: string | null; // ID of currently selected player beast
  selectedTarget: string | null; // ID of target opponent beast
}

export interface DamageResult {
  damage: number;
  targetHealthAfterDamage: number;
  battleMessage: string;
}

export interface HealingResult {
  healing: number;
  casterHealthAfterHealing: number;
  battleMessage: string;
}

export interface StatusEffectResult {
  battleMessage: string;
  effects: { [key: string]: { duration: number; value: number } };
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}
