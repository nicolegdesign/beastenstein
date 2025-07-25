import type { BeastCombatStats } from '../types/game';
import type { Ability } from '../types/abilities';
import type { 
  BattleBeast, 
  DamageResult, 
  HealingResult, 
  StatusEffectResult,
  ValidationResult,
  AbilityCooldown
} from '../types/combat';

export class CombatEngine {
  /**
   * Calculate turn order based on effective speed stats (fastest first)
   */
  static calculateTurnOrder(playerBeasts: BattleBeast[], opponentBeasts: BattleBeast[]): string[] {
    const allBeasts = [...playerBeasts, ...opponentBeasts]
      .filter(beast => !beast.isDefeated)
      .map(beast => ({
        id: beast.id,
        speed: this.getEffectiveStats(beast).speed,
        name: beast.customBeast.name // For debugging
      }))
      .sort((a, b) => b.speed - a.speed); // Sort by speed descending (fastest first)
    
    console.log('Turn order calculated:', allBeasts.map(b => `${b.name} (${b.speed} speed)`));
    return allBeasts.map(beast => beast.id);
  }

  /**
   * Calculate effective stats including status effect modifiers
   */
  static getEffectiveStats(beast: BattleBeast): BeastCombatStats & { health: number } {
    const baseStats = beast.stats;
    const statusEffects = beast.statusEffects;
    
    let attackModifier = 0;
    let defenseModifier = 0;
    let speedModifier = 0;
    let magicModifier = 0;
    
    // Apply all status effects
    Object.entries(statusEffects).forEach(([key, effect]) => {
      const statusEffect = effect as { duration: number; value: number };
      if (key.includes('_attack')) attackModifier += statusEffect.value;
      if (key.includes('_defense')) defenseModifier += statusEffect.value;
      if (key.includes('_speed')) speedModifier += statusEffect.value;
      if (key.includes('_magic')) magicModifier += statusEffect.value;
    });
    
    return {
      attack: Math.max(1, baseStats.attack + attackModifier),
      defense: Math.max(0, baseStats.defense + defenseModifier),
      speed: Math.max(1, baseStats.speed + speedModifier),
      magic: Math.max(1, baseStats.magic + magicModifier),
      health: baseStats.health // Health is not affected by temporary status effects
    };
  }

  /**
   * Process damage calculation for attacks and magic attacks
   */
  static processDamage(attacker: BattleBeast, target: BattleBeast, ability: Ability): DamageResult {
    const attackerEffectiveStats = this.getEffectiveStats(attacker);
    const targetEffectiveStats = this.getEffectiveStats(target);
    
    const baseDamage = ability.damage || 0;
    const statBonus = ability.type === 'magicAttack' 
      ? Math.floor(attackerEffectiveStats.magic / 2)
      : Math.floor(attackerEffectiveStats.attack / 2);
    const defenseReduction = Math.floor(targetEffectiveStats.defense / 3);
    const totalDamage = Math.max(1, baseDamage + statBonus - defenseReduction);
    
    const targetHealthAfterDamage = Math.max(0, target.currentHealth - totalDamage);
    const battleMessage = `${attacker.customBeast.name} uses ${ability.name} on ${target.customBeast.name} for ${totalDamage} damage!`;
    
    return {
      damage: totalDamage,
      targetHealthAfterDamage,
      battleMessage
    };
  }

  /**
   * Process basic attack damage calculation
   */
  static processBasicAttack(attacker: BattleBeast, target: BattleBeast): DamageResult {
    const attackerEffectiveStats = this.getEffectiveStats(attacker);
    const targetEffectiveStats = this.getEffectiveStats(target);
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
   * Process healing ability
   */
  static processHealing(caster: BattleBeast, ability: Ability): HealingResult {
    const healing = ability.healing || 0;
    const casterHealthAfterHealing = Math.min(caster.stats.health, caster.currentHealth + healing);
    const battleMessage = `${caster.customBeast.name} uses ${ability.name} and heals for ${healing} HP!`;
    
    return {
      healing,
      casterHealthAfterHealing,
      battleMessage
    };
  }

  /**
   * Process status effect application (buffs/debuffs)
   */
  static processStatusEffect(caster: BattleBeast, target: BattleBeast | null, ability: Ability, isDebuff: boolean = false): StatusEffectResult {
    const effects: { [key: string]: { duration: number; value: number } } = {};
    
    if (ability.effects?.statModifier) {
      const duration = ability.effects.duration || 3;
      const statModifiers = ability.effects.statModifier;
      
      Object.entries(statModifiers).forEach(([stat, value]) => {
        if (value && value !== 0) {
          const effectValue = isDebuff ? -Math.abs(value) : value;
          effects[`${ability.id}_${stat}`] = {
            duration,
            value: effectValue
          };
        }
      });
    }
    
    const targetName = target ? target.customBeast.name : caster.customBeast.name;
    const battleMessage = isDebuff 
      ? `${caster.customBeast.name} uses ${ability.name} on ${targetName} and applies a debuff!`
      : `${caster.customBeast.name} uses ${ability.name} and gains a buff!`;
    
    return {
      battleMessage,
      effects
    };
  }

  /**
   * Get targetable beasts (front line first, then back line)
   */
  static getTargetableBeasts(beasts: BattleBeast[]): BattleBeast[] {
    const frontLineBeasts = beasts.filter(b => !b.isDefeated && (b.position === 'frontLeft' || b.position === 'frontRight'));
    if (frontLineBeasts.length > 0) {
      return frontLineBeasts;
    }
    // If no front line beasts, back line becomes targetable
    return beasts.filter(b => !b.isDefeated && (b.position === 'backLeft' || b.position === 'backRight'));
  }

  /**
   * Check if battle has ended
   */
  static checkBattleEnd(playerBeasts: BattleBeast[], opponentBeasts: BattleBeast[]): 'playerWin' | 'opponentWin' | 'continue' {
    const playerAlive = playerBeasts.some(b => !b.isDefeated);
    const opponentAlive = opponentBeasts.some(b => !b.isDefeated);
    
    if (!playerAlive) return 'opponentWin';
    if (!opponentAlive) return 'playerWin';
    return 'continue';
  }

  /**
   * Update cooldowns and regenerate mana for all beasts
   */
  static updateCooldowns(beasts: BattleBeast[]): BattleBeast[] {
    return beasts.map(beast => {
      // Update status effects
      const updatedStatusEffects: { [key: string]: { duration: number; value: number } } = {};
      Object.entries(beast.statusEffects).forEach(([key, effect]) => {
        const statusEffect = effect as { duration: number; value: number };
        const newDuration = statusEffect.duration - 1;
        if (newDuration > 0) {
          updatedStatusEffects[key] = { ...statusEffect, duration: newDuration };
        }
      });

      return {
        ...beast,
        currentMana: Math.min(50, beast.currentMana + 2), // Regenerate 2 mana per turn
        abilityCooldowns: beast.abilityCooldowns.map((cd: AbilityCooldown) => ({
          ...cd,
          turnsLeft: Math.max(0, cd.turnsLeft - 1)
        })).filter((cd: AbilityCooldown) => cd.turnsLeft > 0),
        statusEffects: updatedStatusEffects
      };
    });
  }

  /**
   * Validate ability usage
   */
  static validateAbilityUsage(caster: BattleBeast, ability: Ability, targetId?: string): ValidationResult {
    // Check mana
    if (caster.currentMana < (ability.manaCost || 0)) {
      return {
        isValid: false,
        errorMessage: `${caster.customBeast.name} doesn't have enough mana to use ${ability.name}! (Need ${ability.manaCost})`
      };
    }

    // Check cooldown
    const cooldown = caster.abilityCooldowns.find((cd: AbilityCooldown) => cd.abilityId === ability.id);
    if (cooldown && cooldown.turnsLeft > 0) {
      return {
        isValid: false,
        errorMessage: `${ability.name} is on cooldown for ${cooldown.turnsLeft} more turns!`
      };
    }

    // For attack and debuff abilities, need a target
    if ((ability.type === 'attack' || ability.type === 'magicAttack' || ability.type === 'debuff') && !targetId) {
      return {
        isValid: false,
        errorMessage: `Select a target for ${ability.name}!`
      };
    }

    return { isValid: true };
  }
}
