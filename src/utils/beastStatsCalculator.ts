import type { StatBonus } from '../types/abilities';
import type { EnhancedBeastPart } from '../types/abilities';

/**
 * Calculate total stat bonuses from a set of beast parts
 * Used to ensure consistent stat calculations across all beast creation methods
 * Arms and legs are treated as sets - only count their bonuses once, not per individual limb
 */
export function calculateTotalStatBonus(parts: {
  head?: EnhancedBeastPart | { statBonus?: StatBonus };
  torso?: EnhancedBeastPart | { statBonus?: StatBonus };
  armLeft?: EnhancedBeastPart | { statBonus?: StatBonus };
  armRight?: EnhancedBeastPart | { statBonus?: StatBonus };
  legLeft?: EnhancedBeastPart | { statBonus?: StatBonus };
  legRight?: EnhancedBeastPart | { statBonus?: StatBonus };
  wings?: EnhancedBeastPart | { statBonus?: StatBonus };
  tail?: EnhancedBeastPart | { statBonus?: StatBonus };
}): StatBonus {
  const totalStatBonus: StatBonus = {
    attack: 0,
    defense: 0,
    speed: 0,
    magic: 0,
    health: 0
  };

  // Individual parts that count fully
  const individualParts = [parts.head, parts.torso, parts.wings, parts.tail];
  
  individualParts.forEach(part => {
    if (part && part.statBonus) {
      Object.keys(part.statBonus).forEach(stat => {
        const statKey = stat as keyof StatBonus;
        totalStatBonus[statKey] = (totalStatBonus[statKey] || 0) + (part.statBonus![statKey] || 0);
      });
    }
  });

  // Arms: only count once (use left arm if available since both should have identical bonuses)
  if (parts.armLeft && parts.armLeft.statBonus) {
    Object.keys(parts.armLeft.statBonus).forEach(stat => {
      const statKey = stat as keyof StatBonus;
      totalStatBonus[statKey] = (totalStatBonus[statKey] || 0) + (parts.armLeft!.statBonus![statKey] || 0);
    });
  }

  // Legs: only count once (use left leg if available since both should have identical bonuses)
  if (parts.legLeft && parts.legLeft.statBonus) {
    Object.keys(parts.legLeft.statBonus).forEach(stat => {
      const statKey = stat as keyof StatBonus;
      totalStatBonus[statKey] = (totalStatBonus[statKey] || 0) + (parts.legLeft!.statBonus![statKey] || 0);
    });
  }

  return totalStatBonus;
}
