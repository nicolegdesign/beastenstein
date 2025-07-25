import type { BattleBeast } from '../types/combat';
import { CombatEngine } from './CombatEngine';

export interface AIAction {
  type: 'attack' | 'ability';
  targetId?: string;
  abilityId?: string;
}

export class AIEngine {
  /**
   * Select the best action for an AI beast
   * Currently implements simple AI logic: attack the first targetable enemy
   */
  static selectAction(_attacker: BattleBeast, playerBeasts: BattleBeast[]): AIAction {
    const targetableBeasts = CombatEngine.getTargetableBeasts(playerBeasts);
    
    if (targetableBeasts.length === 0) {
      // Fallback - should not happen in normal gameplay
      return { type: 'attack' };
    }
    
    // Simple AI: just attack the first available target
    // TODO: Implement more sophisticated AI logic:
    // - Prefer low health targets
    // - Use abilities when appropriate
    // - Consider status effects
    // - Target priority based on threat level
    
    return {
      type: 'attack',
      targetId: targetableBeasts[0].id
    };
  }

  /**
   * Execute an AI attack on a target
   */
  static executeAttack(attacker: BattleBeast, target: BattleBeast): {
    damage: number;
    targetHealthAfterDamage: number;
    battleMessage: string;
  } {
    const attackerEffectiveStats = CombatEngine.getEffectiveStats(attacker);
    const targetEffectiveStats = CombatEngine.getEffectiveStats(target);
    const damage = Math.max(1, attackerEffectiveStats.attack - Math.floor(targetEffectiveStats.defense / 2) + Math.floor(Math.random() * 3) - 1);
    
    const targetHealthAfterDamage = Math.max(0, target.currentHealth - damage);
    const battleMessage = `${attacker.customBeast.name} attacks ${target.customBeast.name} for ${damage} damage!`;
    
    return {
      damage,
      targetHealthAfterDamage,
      battleMessage
    };
  }

  /**
   * Determine if AI should use an ability instead of basic attack
   * TODO: Implement ability usage logic
   */
  static shouldUseAbility(_attacker: BattleBeast): boolean {
    // TODO: Implement ability usage logic based on attacker stats, mana, etc.
    return false;
  }
}
