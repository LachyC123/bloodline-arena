/**
 * Item Prefixes - Modify base stats of items
 * These go before the item name: "Sharp Sword", "Rusted Axe"
 */

import { ItemType } from '../../systems/InventorySystem';

export type AffixTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface StatMod {
  stat: string;
  value: number;
  isPercent?: boolean;
}

export interface ProcEffect {
  trigger: 'on_hit' | 'on_crit' | 'on_kill' | 'on_block' | 'on_dodge' | 'on_low_hp';
  chance: number;  // 0-100
  effect: string;
  value?: number;
}

export interface AffixData {
  id: string;
  name: string;
  description: string;
  weight: number;  // Higher = more common
  tier: AffixTier;
  allowedItemTypes: ItemType[];
  statMods: StatMod[];
  tags: string[];
  proc?: ProcEffect;
}

// ========== WEAPON PREFIXES ==========

export const WEAPON_PREFIXES: AffixData[] = [
  // Common
  {
    id: 'sharp',
    name: 'Sharp',
    description: '+2-3 base damage',
    weight: 100,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 2 },
      { stat: 'damageMax', value: 3 }
    ],
    tags: ['damage']
  },
  {
    id: 'heavy',
    name: 'Heavy',
    description: '+5 max damage, +3 stamina cost',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMax', value: 5 },
      { stat: 'staminaCost', value: 3 }
    ],
    tags: ['damage', 'stamina']
  },
  {
    id: 'light',
    name: 'Light',
    description: '-5 stamina cost, -1 damage',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'staminaCost', value: -5 },
      { stat: 'damageMin', value: -1 }
    ],
    tags: ['stamina']
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: '+5% accuracy',
    weight: 90,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'accuracy', value: 5, isPercent: true }
    ],
    tags: ['accuracy']
  },
  {
    id: 'rusted',
    name: 'Rusted',
    description: '-2 damage, +8% bleed chance',
    weight: 70,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: -2 },
      { stat: 'bleedChance', value: 8, isPercent: true }
    ],
    tags: ['bleed', 'damage']
  },
  
  // Uncommon
  {
    id: 'vicious',
    name: 'Vicious',
    description: '+8% crit chance',
    weight: 60,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'critChance', value: 8, isPercent: true }
    ],
    tags: ['crit']
  },
  {
    id: 'precise',
    name: 'Precise',
    description: '+10% accuracy, +5% crit',
    weight: 55,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'accuracy', value: 10, isPercent: true },
      { stat: 'critChance', value: 5, isPercent: true }
    ],
    tags: ['accuracy', 'crit']
  },
  {
    id: 'serrated',
    name: 'Serrated',
    description: '+15% bleed chance, +1 bleed damage',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bleedChance', value: 15, isPercent: true },
      { stat: 'bleedDamage', value: 1 }
    ],
    tags: ['bleed']
  },
  {
    id: 'brutal',
    name: 'Brutal',
    description: '+4-6 damage, +1 armor break',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 4 },
      { stat: 'damageMax', value: 6 },
      { stat: 'armorBreak', value: 1 }
    ],
    tags: ['damage', 'armorBreak']
  },
  {
    id: 'quick',
    name: 'Quick',
    description: '-8 stamina cost, +5% dodge',
    weight: 55,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'staminaCost', value: -8 },
      { stat: 'dodge', value: 5, isPercent: true }
    ],
    tags: ['stamina', 'dodge']
  },
  
  // Rare
  {
    id: 'bloodthirsty',
    name: 'Bloodthirsty',
    description: '+20% bleed, heals 2 HP on kill',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bleedChance', value: 20, isPercent: true }
    ],
    tags: ['bleed', 'lifesteal'],
    proc: {
      trigger: 'on_kill',
      chance: 100,
      effect: 'heal',
      value: 2
    }
  },
  {
    id: 'thundering',
    name: 'Thundering',
    description: '+15% stun chance on heavy attacks',
    weight: 35,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'stunChance', value: 15, isPercent: true }
    ],
    tags: ['stun'],
    proc: {
      trigger: 'on_hit',
      chance: 15,
      effect: 'stun_visual'
    }
  },
  {
    id: 'sundering',
    name: 'Sundering',
    description: '+2 armor break, +10% vs armored',
    weight: 35,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'armorBreak', value: 2 },
      { stat: 'bonusVsArmored', value: 10, isPercent: true }
    ],
    tags: ['armorBreak']
  },
  {
    id: 'vampiric',
    name: 'Vampiric',
    description: 'Heals 3% of damage dealt',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'lifesteal', value: 3, isPercent: true }
    ],
    tags: ['lifesteal']
  },
  {
    id: 'relentless',
    name: 'Relentless',
    description: '+2 momentum per hit',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'momentumGain', value: 2 }
    ],
    tags: ['momentum']
  },
  
  // Epic
  {
    id: 'devastating',
    name: 'Devastating',
    description: '+8-12 damage, +50% crit damage',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 8 },
      { stat: 'damageMax', value: 12 },
      { stat: 'critDamage', value: 50, isPercent: true }
    ],
    tags: ['damage', 'crit']
  },
  {
    id: 'executioner',
    name: "Executioner's",
    description: '+100% damage vs wounded enemies',
    weight: 12,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bonusVsWounded', value: 100, isPercent: true }
    ],
    tags: ['damage', 'wound']
  },
  {
    id: 'flawless',
    name: 'Flawless',
    description: '+15% accuracy, +15% crit, +5 damage',
    weight: 10,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'accuracy', value: 15, isPercent: true },
      { stat: 'critChance', value: 15, isPercent: true },
      { stat: 'damageMin', value: 5 }
    ],
    tags: ['accuracy', 'crit', 'damage']
  },
  
  // Legendary
  {
    id: 'annihilating',
    name: 'Annihilating',
    description: '+15 damage, crits cause wound',
    weight: 5,
    tier: 'legendary',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 10 },
      { stat: 'damageMax', value: 15 }
    ],
    tags: ['damage', 'wound'],
    proc: {
      trigger: 'on_crit',
      chance: 100,
      effect: 'inflict_wound'
    }
  },
  {
    id: 'legendary_champion',
    name: "Champion's",
    description: 'All stats +10%, momentum starts at 20',
    weight: 3,
    tier: 'legendary',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'allStats', value: 10, isPercent: true },
      { stat: 'startingMomentum', value: 20 }
    ],
    tags: ['momentum', 'damage', 'crit']
  }
];

// ========== ARMOR PREFIXES ==========

export const ARMOR_PREFIXES: AffixData[] = [
  // Common
  {
    id: 'sturdy',
    name: 'Sturdy',
    description: '+3 defense',
    weight: 100,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 3 }
    ],
    tags: ['defense']
  },
  {
    id: 'padded',
    name: 'Padded',
    description: '+10 max HP',
    weight: 90,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 10 }
    ],
    tags: ['hp']
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: '+5% dodge, -1 defense',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'dodge', value: 5, isPercent: true },
      { stat: 'defense', value: -1 }
    ],
    tags: ['dodge']
  },
  {
    id: 'reinforced',
    name: 'Reinforced',
    description: '+5 defense, -3% dodge',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 5 },
      { stat: 'dodge', value: -3, isPercent: true }
    ],
    tags: ['defense']
  },
  
  // Uncommon
  {
    id: 'resilient',
    name: 'Resilient',
    description: '+15 max HP, +2 defense',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 15 },
      { stat: 'defense', value: 2 }
    ],
    tags: ['hp', 'defense']
  },
  {
    id: 'agile',
    name: 'Agile',
    description: '+10% dodge, +5% parry',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'dodge', value: 10, isPercent: true },
      { stat: 'parryWindow', value: 5, isPercent: true }
    ],
    tags: ['dodge', 'parry']
  },
  {
    id: 'spiked',
    name: 'Spiked',
    description: 'Reflects 3 damage when hit',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'thornsDamage', value: 3 }
    ],
    tags: ['thorns']
  },
  {
    id: 'warded',
    name: 'Warded',
    description: '+25% bleed resist, +25% stun resist',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'bleedResist', value: 25, isPercent: true },
      { stat: 'stunResist', value: 25, isPercent: true }
    ],
    tags: ['resist']
  },
  
  // Rare
  {
    id: 'impervious',
    name: 'Impervious',
    description: '+8 defense, +50% armor break resist',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 8 },
      { stat: 'armorBreakResist', value: 50, isPercent: true }
    ],
    tags: ['defense', 'resist']
  },
  {
    id: 'regenerating',
    name: 'Regenerating',
    description: 'Heal 2 HP per turn',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'hpRegen', value: 2 }
    ],
    tags: ['heal']
  },
  {
    id: 'enduring',
    name: 'Enduring',
    description: '+25 max HP, +15 stamina',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 25 },
      { stat: 'maxStamina', value: 15 }
    ],
    tags: ['hp', 'stamina']
  },
  
  // Epic
  {
    id: 'invincible',
    name: 'Invincible',
    description: '+12 defense, 10% damage reduction',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 12 },
      { stat: 'damageReduction', value: 10, isPercent: true }
    ],
    tags: ['defense']
  },
  {
    id: 'vampiric_armor',
    name: 'Vampiric',
    description: 'Heal 5% of damage blocked',
    weight: 12,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'blockHeal', value: 5, isPercent: true }
    ],
    tags: ['lifesteal', 'defense']
  },
  
  // Legendary
  {
    id: 'legendary_fortress',
    name: 'Fortress',
    description: '+20 defense, +40 HP, immune to armor break',
    weight: 5,
    tier: 'legendary',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 20 },
      { stat: 'maxHP', value: 40 },
      { stat: 'armorBreakImmune', value: 1 }
    ],
    tags: ['defense', 'hp']
  }
];

// Combined prefixes
export const ALL_PREFIXES: AffixData[] = [...WEAPON_PREFIXES, ...ARMOR_PREFIXES];

// Helper functions
export function getPrefixById(id: string): AffixData | undefined {
  return ALL_PREFIXES.find(p => p.id === id);
}

export function getPrefixesForItemType(itemType: ItemType): AffixData[] {
  return ALL_PREFIXES.filter(p => p.allowedItemTypes.includes(itemType));
}

export function getPrefixesByTier(tier: AffixTier): AffixData[] {
  return ALL_PREFIXES.filter(p => p.tier === tier);
}
