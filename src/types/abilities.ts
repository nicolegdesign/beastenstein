export interface Ability {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'magicAttack' | 'defense' | 'heal' | 'buff' | 'debuff';
  damage?: number;
  healing?: number;
  effects?: {
    statModifier?: {
      attack?: number;
      defense?: number;
      speed?: number;
      magic?: number;
    };
    duration?: number; // turns
  };
  cooldown: number; // turns
  manaCost?: number;
  critChance?: number; // Override crit chance (0.0 to 1.0)
  missChance?: number; // Override miss chance (0.0 to 1.0)
}

export interface StatBonus {
  attack?: number;
  defense?: number;
  speed?: number;
  magic?: number;
  health?: number;
}

export interface EnhancedBeastPart {
  id: string;
  name: string;
  imagePath: string;
  type: 'head' | 'torso' | 'armLeft' | 'armRight' | 'legLeft' | 'legRight' | 'wings' | 'tail';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statBonus: StatBonus;
  ability?: Ability;
}

export interface EnhancedBeastPartSet {
  id: string;
  name: string;
  leftImagePath: string;
  rightImagePath: string;
  type: 'armSet' | 'legSet';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statBonus: StatBonus;
  ability?: Ability;
}
