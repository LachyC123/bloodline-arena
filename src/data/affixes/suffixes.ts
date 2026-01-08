/**
 * Item Suffixes - Add special effects and bonuses
 * These go after the item name: "Sword of the Fox", "Axe of Bloodletting"
 */

import { ItemType } from '../../systems/InventorySystem';
import { AffixTier, StatMod, ProcEffect, AffixData } from './prefixes';

// ========== WEAPON SUFFIXES ==========

export const WEAPON_SUFFIXES: AffixData[] = [
  // Common
  {
    id: 'of_the_fox',
    name: 'of the Fox',
    description: '+5% dodge while attacking',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'attackDodge', value: 5, isPercent: true }
    ],
    tags: ['dodge']
  },
  {
    id: 'of_fury',
    name: 'of Fury',
    description: '+1 momentum on hit',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'momentumGain', value: 1 }
    ],
    tags: ['momentum']
  },
  {
    id: 'of_the_bear',
    name: 'of the Bear',
    description: '+3 damage, -2% speed',
    weight: 70,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 2 },
      { stat: 'damageMax', value: 3 },
      { stat: 'speed', value: -2, isPercent: true }
    ],
    tags: ['damage']
  },
  {
    id: 'of_reach',
    name: 'of Reach',
    description: 'First attack each fight: +20% accuracy',
    weight: 70,
    tier: 'common',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'firstStrikeAccuracy', value: 20, isPercent: true }
    ],
    tags: ['accuracy']
  },
  
  // Uncommon
  {
    id: 'of_bloodletting',
    name: 'of Bloodletting',
    description: '+12% bleed, bleeds stack',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bleedChance', value: 12, isPercent: true },
      { stat: 'bleedStack', value: 1 }
    ],
    tags: ['bleed']
  },
  {
    id: 'of_the_hawk',
    name: 'of the Hawk',
    description: '+12% crit, +5% accuracy',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'critChance', value: 12, isPercent: true },
      { stat: 'accuracy', value: 5, isPercent: true }
    ],
    tags: ['crit', 'accuracy']
  },
  {
    id: 'of_breaking',
    name: 'of Breaking',
    description: '+2 armor break per hit',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'armorBreak', value: 2 }
    ],
    tags: ['armorBreak']
  },
  {
    id: 'of_the_wolf',
    name: 'of the Wolf',
    description: '+15% damage vs bleeding enemies',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bonusVsBleeding', value: 15, isPercent: true }
    ],
    tags: ['bleed', 'damage']
  },
  {
    id: 'of_endurance',
    name: 'of Endurance',
    description: '-10 stamina cost, +5 stamina regen',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'staminaCost', value: -10 },
      { stat: 'staminaRegen', value: 5 }
    ],
    tags: ['stamina']
  },
  
  // Rare
  {
    id: 'of_the_viper',
    name: 'of the Viper',
    description: 'Crits apply 2 poison stacks',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'poisonOnCrit', value: 2 }
    ],
    tags: ['poison', 'crit'],
    proc: {
      trigger: 'on_crit',
      chance: 100,
      effect: 'apply_poison',
      value: 2
    }
  },
  {
    id: 'of_thunder',
    name: 'of Thunder',
    description: 'Heavy attacks: 20% stun chance',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'heavyStunChance', value: 20, isPercent: true }
    ],
    tags: ['stun'],
    proc: {
      trigger: 'on_hit',
      chance: 20,
      effect: 'stun'
    }
  },
  {
    id: 'of_the_arena',
    name: 'of the Arena',
    description: '+10% damage per momentum tier',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'momentumDamageBonus', value: 10, isPercent: true }
    ],
    tags: ['momentum', 'damage']
  },
  {
    id: 'of_execution',
    name: 'of Execution',
    description: '+50% damage vs enemies below 25% HP',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'executeDamage', value: 50, isPercent: true }
    ],
    tags: ['damage']
  },
  {
    id: 'of_the_crowd',
    name: 'of the Crowd',
    description: 'Kills restore 10 stamina, +5 gold',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'killStamina', value: 10 },
      { stat: 'killGold', value: 5 }
    ],
    tags: ['stamina', 'gold'],
    proc: {
      trigger: 'on_kill',
      chance: 100,
      effect: 'restore_stamina',
      value: 10
    }
  },
  
  // Epic
  {
    id: 'of_annihilation',
    name: 'of Annihilation',
    description: 'Crits deal +75% damage and ignore defense',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'critDamage', value: 75, isPercent: true },
      { stat: 'critIgnoreDefense', value: 1 }
    ],
    tags: ['crit', 'damage']
  },
  {
    id: 'of_the_legend',
    name: 'of the Legend',
    description: '+5 to all stats, +10% fame',
    weight: 12,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'allStats', value: 5 },
      { stat: 'fameBonus', value: 10, isPercent: true }
    ],
    tags: ['damage', 'fame']
  },
  {
    id: 'of_the_bloodline',
    name: 'of the Bloodline',
    description: 'Inherits 10% of previous fighter power',
    weight: 10,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'bloodlineInherit', value: 10, isPercent: true }
    ],
    tags: ['bloodline']
  },
  
  // Legendary
  {
    id: 'of_the_champion',
    name: 'of the Champion',
    description: 'Start combat with full momentum, cannot be stunned',
    weight: 5,
    tier: 'legendary',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'startingMomentum', value: 100 },
      { stat: 'stunImmune', value: 1 }
    ],
    tags: ['momentum', 'resist']
  },
  {
    id: 'of_endless_battle',
    name: 'of Endless Battle',
    description: 'Each hit: +1 damage permanently (resets each fight)',
    weight: 3,
    tier: 'legendary',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'rampingDamage', value: 1 }
    ],
    tags: ['damage'],
    proc: {
      trigger: 'on_hit',
      chance: 100,
      effect: 'stack_damage',
      value: 1
    }
  }
];

// ========== ARMOR SUFFIXES ==========

export const ARMOR_SUFFIXES: AffixData[] = [
  // Common
  {
    id: 'of_protection',
    name: 'of Protection',
    description: '+10% block effectiveness',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'blockEffectiveness', value: 10, isPercent: true }
    ],
    tags: ['block']
  },
  {
    id: 'of_the_turtle',
    name: 'of the Turtle',
    description: '+15% parry window',
    weight: 75,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'parryWindow', value: 15, isPercent: true }
    ],
    tags: ['parry']
  },
  {
    id: 'of_stamina',
    name: 'of Stamina',
    description: '+15 max stamina',
    weight: 80,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxStamina', value: 15 }
    ],
    tags: ['stamina']
  },
  {
    id: 'of_recovery',
    name: 'of Recovery',
    description: '+3 stamina regen per turn',
    weight: 70,
    tier: 'common',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'staminaRegen', value: 3 }
    ],
    tags: ['stamina']
  },
  
  // Uncommon
  {
    id: 'of_the_guardian',
    name: 'of the Guardian',
    description: 'Blocking restores 5 stamina',
    weight: 50,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'blockStamina', value: 5 }
    ],
    tags: ['block', 'stamina'],
    proc: {
      trigger: 'on_block',
      chance: 100,
      effect: 'restore_stamina',
      value: 5
    }
  },
  {
    id: 'of_the_wind',
    name: 'of the Wind',
    description: '+15% dodge, +5% speed',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'dodge', value: 15, isPercent: true },
      { stat: 'speed', value: 5, isPercent: true }
    ],
    tags: ['dodge', 'speed']
  },
  {
    id: 'of_the_iron_will',
    name: 'of Iron Will',
    description: '+35% wound resist',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'woundResist', value: 35, isPercent: true }
    ],
    tags: ['resist', 'wound']
  },
  {
    id: 'of_thorns',
    name: 'of Thorns',
    description: 'Reflect 5 damage when hit',
    weight: 45,
    tier: 'uncommon',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'thornsDamage', value: 5 }
    ],
    tags: ['thorns']
  },
  
  // Rare
  {
    id: 'of_the_phoenix',
    name: 'of the Phoenix',
    description: 'Once per fight: survive lethal with 1 HP',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'surviveLethal', value: 1 }
    ],
    tags: ['hp'],
    proc: {
      trigger: 'on_low_hp',
      chance: 100,
      effect: 'survive_lethal'
    }
  },
  {
    id: 'of_vitality',
    name: 'of Vitality',
    description: '+35 max HP, heal 5 on block',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 35 },
      { stat: 'blockHeal', value: 5 }
    ],
    tags: ['hp', 'heal'],
    proc: {
      trigger: 'on_block',
      chance: 100,
      effect: 'heal',
      value: 5
    }
  },
  {
    id: 'of_the_counter',
    name: 'of the Counter',
    description: 'Perfect parry: counter-attack for 10 damage',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'counterDamage', value: 10 }
    ],
    tags: ['parry', 'damage']
  },
  {
    id: 'of_the_crowd_favorite',
    name: 'of the Crowd Favorite',
    description: '+20% fame, +5 gold per fight',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'fameBonus', value: 20, isPercent: true },
      { stat: 'fightGold', value: 5 }
    ],
    tags: ['fame', 'gold']
  },
  
  // Epic
  {
    id: 'of_undying',
    name: 'of the Undying',
    description: 'Heal 10% max HP per turn below 25% HP',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'lowHPRegen', value: 10, isPercent: true }
    ],
    tags: ['hp', 'heal']
  },
  {
    id: 'of_the_mountain',
    name: 'of the Mountain',
    description: 'Cannot be knocked back or moved, +50% stagger resist',
    weight: 12,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'immovable', value: 1 },
      { stat: 'staggerResist', value: 50, isPercent: true }
    ],
    tags: ['resist', 'defense']
  },
  
  // Legendary
  {
    id: 'of_immortality',
    name: 'of Immortality',
    description: 'Take no damage first 2 turns, -20% damage after',
    weight: 5,
    tier: 'legendary',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'invulnTurns', value: 2 },
      { stat: 'damageTaken', value: -20, isPercent: true }
    ],
    tags: ['defense']
  },
  {
    id: 'of_the_arena_master',
    name: 'of the Arena Master',
    description: '+50% all resist, attacks grant momentum',
    weight: 3,
    tier: 'legendary',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'allResist', value: 50, isPercent: true },
      { stat: 'momentumOnBlock', value: 5 }
    ],
    tags: ['resist', 'momentum']
  }
];

// Combined suffixes
export const ALL_SUFFIXES: AffixData[] = [...WEAPON_SUFFIXES, ...ARMOR_SUFFIXES];

// Helper functions
export function getSuffixById(id: string): AffixData | undefined {
  return ALL_SUFFIXES.find(s => s.id === id);
}

export function getSuffixesForItemType(itemType: ItemType): AffixData[] {
  return ALL_SUFFIXES.filter(s => s.allowedItemTypes.includes(itemType));
}

export function getSuffixesByTier(tier: AffixTier): AffixData[] {
  return ALL_SUFFIXES.filter(s => s.tier === tier);
}
