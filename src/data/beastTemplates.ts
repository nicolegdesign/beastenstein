import type { EnhancedBeastPart } from '../types/abilities';
import { getPartsByBeastType } from './beastParts';
import { findSoulEssenceById } from './soulEssences';
import { getDefaultPersonality, type Personality } from './personalities';

// Beast template interface
export interface BeastTemplate {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  headId: string;
  torsoId: string;
  armSetId: string;
  legSetId: string;
  defaultSoulId: string;
  defaultGender: 'male' | 'female';
}

// Temporary interface until we move CustomBeastData to a shared location
interface CustomBeastData {
  name: string;
  gender: 'male' | 'female';
  personality: Personality;
  head: EnhancedBeastPart;
  torso: EnhancedBeastPart;
  armLeft: EnhancedBeastPart;
  armRight: EnhancedBeastPart;
  legLeft: EnhancedBeastPart;
  legRight: EnhancedBeastPart;
  soulEssence: {
    id: string;
    name: string;
    description: string;
    imagePath: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
}

// Beast template interface
export interface BeastTemplate {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  headId: string;
  torsoId: string;
  armSetId: string;
  legSetId: string;
  defaultSoulId: string;
  defaultGender: 'male' | 'female';
}

// Predefined beast templates
export const BEAST_TEMPLATES: BeastTemplate[] = [
  {
    id: 'nightwolf',
    name: 'Night Wolf',
    description: 'A loyal and fierce companion of the night',
    rarity: 'common',
    headId: 'nightwolf-head',
    torsoId: 'nightwolf-torso',
    armSetId: 'nightwolf-arms',
    legSetId: 'nightwolf-legs',
    defaultSoulId: 'dim-soul',
    defaultGender: 'male'
  },
  {
    id: 'mountaindragon',
    name: 'Mountain Dragon',
    description: 'A powerful dragon from the highest peaks',
    rarity: 'uncommon',
    headId: 'mountaindragon-head',
    torsoId: 'mountaindragon-torso',
    armSetId: 'mountaindragon-arms',
    legSetId: 'mountaindragon-legs',
    defaultSoulId: 'glowing-soul',
    defaultGender: 'female'
  },
  {
    id: 'woodenpuppet',
    name: 'Wooden Puppet',
    description: 'An enchanted puppet given life through magic',
    rarity: 'common',
    headId: 'woodenpuppet-head',
    torsoId: 'woodenpuppet-torso',
    armSetId: 'woodenpuppet-arms',
    legSetId: 'woodenpuppet-legs',
    defaultSoulId: 'dim-soul',
    defaultGender: 'male'
  }
];

// Function to create a beast from a template
export const createBeastFromTemplate = (
  templateId: string,
  customName?: string,
  customGender?: 'male' | 'female',
  customSoulId?: string
): CustomBeastData | null => {
  const template = BEAST_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const parts = getPartsByBeastType(templateId as 'nightwolf' | 'mountaindragon' | 'woodenpuppet');
  const soulEssence = findSoulEssenceById(customSoulId || template.defaultSoulId);
  
  if (!parts.head || !parts.torso || !parts.armSet || !parts.legSet || !soulEssence) {
    console.error(`Missing parts for beast template: ${templateId}`);
    return null;
  }

  // Create individual arm and leg parts from sets
  const armLeft: EnhancedBeastPart = {
    id: `${parts.armSet.id}-left`,
    name: `${parts.armSet.name} Left`,
    imagePath: parts.armSet.leftImagePath,
    type: 'armLeft',
    rarity: parts.armSet.rarity,
    statBonus: parts.armSet.statBonus,
    ability: parts.armSet.ability
  };

  const armRight: EnhancedBeastPart = {
    id: `${parts.armSet.id}-right`,
    name: `${parts.armSet.name} Right`,
    imagePath: parts.armSet.rightImagePath,
    type: 'armRight',
    rarity: parts.armSet.rarity,
    statBonus: parts.armSet.statBonus,
    ability: parts.armSet.ability
  };

  const legLeft: EnhancedBeastPart = {
    id: `${parts.legSet.id}-left`,
    name: `${parts.legSet.name} Left`,
    imagePath: parts.legSet.leftImagePath,
    type: 'legLeft',
    rarity: parts.legSet.rarity,
    statBonus: parts.legSet.statBonus,
    ability: parts.legSet.ability
  };

  const legRight: EnhancedBeastPart = {
    id: `${parts.legSet.id}-right`,
    name: `${parts.legSet.name} Right`,
    imagePath: parts.legSet.rightImagePath,
    type: 'legRight',
    rarity: parts.legSet.rarity,
    statBonus: parts.legSet.statBonus,
    ability: parts.legSet.ability
  };

  return {
    name: customName || template.name,
    gender: customGender || template.defaultGender,
    personality: getDefaultPersonality(),
    head: parts.head,
    torso: parts.torso,
    armLeft,
    armRight,
    legLeft,
    legRight,
    soulEssence: {
      id: soulEssence.id,
      name: soulEssence.name,
      description: soulEssence.description,
      imagePath: soulEssence.imagePath,
      rarity: soulEssence.rarity
    }
  };
};

// Function to find beast template by ID
export const findBeastTemplate = (id: string): BeastTemplate | undefined => {
  return BEAST_TEMPLATES.find(template => template.id === id);
};
