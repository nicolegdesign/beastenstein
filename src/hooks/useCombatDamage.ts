import type { Ability } from '../types/abilities';
import type { BattleBeast } from '../types/combat';
import { CombatEngine } from '../services/CombatEngine';

interface DamageCalculation {
  isMiss: boolean;
  isCriticalHit: boolean;
  finalDamage: number;
  battleMessage: string;
}

export const useCombatDamage = () => {
  const calculateAbilityDamage = (
    ability: Ability,
    attacker: BattleBeast,
    target: BattleBeast
  ): DamageCalculation => {
    const attackerEffectiveStats = CombatEngine.getEffectiveStats(attacker);
    const targetEffectiveStats = CombatEngine.getEffectiveStats(target);
    
    // Check for ability-specific miss chance
    let isMiss = false;
    if (ability.missChance !== undefined) {
      const missRoll = Math.random();
      isMiss = missRoll < ability.missChance;
    }
    
    if (isMiss) {
      return {
        isMiss: true,
        isCriticalHit: false,
        finalDamage: 0,
        battleMessage: `${attacker.customBeast.name} uses ${ability.name} on ${target.customBeast.name} but misses!`
      };
    }
    
    // Check for ability-specific crit chance
    let isCriticalHit = false;
    if (ability.critChance !== undefined) {
      const critRoll = Math.random();
      isCriticalHit = critRoll < ability.critChance;
    }
    
    const baseDamage = ability.damage || 0;
    const statBonus = ability.type === 'magicAttack' 
      ? Math.floor(attackerEffectiveStats.magic / 2)
      : Math.floor(attackerEffectiveStats.attack / 2);
    const defenseReduction = Math.floor(targetEffectiveStats.defense / 3);
    let totalDamage = Math.max(1, baseDamage + statBonus - defenseReduction);
    
    // Apply critical hit multiplier for abilities
    if (isCriticalHit) {
      totalDamage = Math.floor(totalDamage * 1.5);
    }
    
    const battleMessage = isCriticalHit 
      ? `${attacker.customBeast.name} uses ${ability.name} on ${target.customBeast.name} for a CRITICAL ${totalDamage} damage!`
      : `${attacker.customBeast.name} uses ${ability.name} on ${target.customBeast.name} for ${totalDamage} damage!`;
    
    return {
      isMiss: false,
      isCriticalHit,
      finalDamage: totalDamage,
      battleMessage
    };
  };

  const calculateBasicAttackDamage = (
    attacker: BattleBeast,
    target: BattleBeast
  ): DamageCalculation => {
    const attackerEffectiveStats = CombatEngine.getEffectiveStats(attacker);
    const targetEffectiveStats = CombatEngine.getEffectiveStats(target);
    
    // Miss chance based on target's speed vs attacker's accuracy
    const baseMissChance = 0.1; // 10% base miss chance
    const speedDifference = targetEffectiveStats.speed - attackerEffectiveStats.speed;
    const missChance = Math.max(0.05, Math.min(0.25, baseMissChance + speedDifference / 200));
    const isMiss = Math.random() < missChance;
    
    if (isMiss) {
      return {
        isMiss: true,
        isCriticalHit: false,
        finalDamage: 0,
        battleMessage: `${attacker.customBeast.name} attacks ${target.customBeast.name} but misses!`
      };
    }
    
    // Critical hit chance based on speed
    const critChance = Math.min(0.15, attackerEffectiveStats.speed / 1000);
    const isCriticalHit = Math.random() < critChance;
    
    let baseDamage = Math.max(1, attackerEffectiveStats.attack - Math.floor(targetEffectiveStats.defense / 2) + Math.floor(Math.random() * 3) - 1);
    
    // Apply critical hit multiplier
    if (isCriticalHit) {
      baseDamage = Math.floor(baseDamage * 1.5);
    }
    
    const battleMessage = isCriticalHit 
      ? `${attacker.customBeast.name} lands a CRITICAL HIT on ${target.customBeast.name} for ${baseDamage} damage!`
      : `${attacker.customBeast.name} attacks ${target.customBeast.name} for ${baseDamage} damage!`;
    
    return {
      isMiss: false,
      isCriticalHit,
      finalDamage: baseDamage,
      battleMessage
    };
  };

  return {
    calculateAbilityDamage,
    calculateBasicAttackDamage
  };
};
