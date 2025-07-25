import type { CustomBeast, BattleBeast } from '../types/combat';
import type { BeastCombatStats, IndividualBeastData } from '../types/game';

export class BeastFactory {
  /**
   * Create a battle beast from a custom beast with calculated stats
   */
  static createBattleBeast(
    customBeast: CustomBeast, 
    stats: BeastCombatStats & { health: number }, 
    position: BattleBeast['position']
  ): BattleBeast {
    return {
      id: `${customBeast.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customBeast,
      stats,
      currentHealth: stats.health,
      currentMana: 50,
      position,
      abilityCooldowns: [],
      statusEffects: {},
      isDefeated: false
    };
  }

  /**
   * Calculate beast stats including part bonuses and level scaling
   */
  static calculateBeastStats(
    customBeast: CustomBeast,
    baseStats: BeastCombatStats & { health: number },
    beastData?: IndividualBeastData
  ): BeastCombatStats & { health: number } {
    // Use individual beast data if available, otherwise use base stats
    const finalStats = beastData ? {
      attack: beastData.attack + (customBeast.totalStatBonus.attack || 0),
      defense: beastData.defense + (customBeast.totalStatBonus.defense || 0),
      speed: beastData.speed + (customBeast.totalStatBonus.speed || 0),
      magic: beastData.magic + (customBeast.totalStatBonus.magic || 0),
      health: beastData.health + (customBeast.totalStatBonus.health || 0)
    } : {
      attack: baseStats.attack + (customBeast.totalStatBonus.attack || 0),
      defense: baseStats.defense + (customBeast.totalStatBonus.defense || 0),
      speed: baseStats.speed + (customBeast.totalStatBonus.speed || 0),
      magic: baseStats.magic + (customBeast.totalStatBonus.magic || 0),
      health: baseStats.health + (customBeast.totalStatBonus.health || 0)
    };

    return finalStats;
  }
}
