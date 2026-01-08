/**
 * Item Curses - Powerful but dangerous modifiers
 * Curses have BOTH strong upsides AND real drawbacks
 * Displayed as "(Cursed: Name)" after the item name
 */

import { ItemType } from '../../systems/InventorySystem';
import { AffixTier, StatMod, ProcEffect, AffixData } from './prefixes';

export interface CurseData extends AffixData {
  upside: string;
  downside: string;
}

export const CURSES: CurseData[] = [
  // ========== WEAPON CURSES ==========
  {
    id: 'debt',
    name: 'Debt',
    description: '+30% damage, lose 10% gold after each fight',
    upside: '+30% damage',
    downside: '-10% gold per fight',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damagePercent', value: 30, isPercent: true },
      { stat: 'goldLossPerFight', value: 10, isPercent: true }
    ],
    tags: ['damage', 'gold']
  },
  {
    id: 'bloodprice',
    name: 'Blood Price',
    description: '+50% crit damage, take 3 damage on crit',
    upside: '+50% crit damage',
    downside: 'Take 3 damage when you crit',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'critDamage', value: 50, isPercent: true },
      { stat: 'selfDamageOnCrit', value: 3 }
    ],
    tags: ['crit', 'damage'],
    proc: {
      trigger: 'on_crit',
      chance: 100,
      effect: 'self_damage',
      value: 3
    }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: '+8 damage, cannot block or parry',
    upside: '+8 flat damage',
    downside: 'Cannot use block or parry',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'damageMin', value: 8 },
      { stat: 'damageMax', value: 8 },
      { stat: 'canBlock', value: 0 },
      { stat: 'canParry', value: 0 }
    ],
    tags: ['damage']
  },
  {
    id: 'gluttony',
    name: 'Gluttony',
    description: 'Heal 8 on kill, take +25% damage',
    upside: 'Heal 8 HP on kill',
    downside: 'Take 25% more damage',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'killHeal', value: 8 },
      { stat: 'damageTaken', value: 25, isPercent: true }
    ],
    tags: ['lifesteal', 'damage'],
    proc: {
      trigger: 'on_kill',
      chance: 100,
      effect: 'heal',
      value: 8
    }
  },
  {
    id: 'hungry',
    name: 'Hunger',
    description: '+3 damage per turn, lose 2 HP per turn',
    upside: '+3 damage each turn (stacks)',
    downside: 'Lose 2 HP each turn',
    weight: 20,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'rampingDamage', value: 3 },
      { stat: 'selfDamagePerTurn', value: 2 }
    ],
    tags: ['damage', 'hp']
  },
  {
    id: 'executioner_curse',
    name: 'Executioner',
    description: 'Kills grant +10% damage permanently, start at -20% HP',
    upside: 'Permanent +10% damage per kill',
    downside: 'Start fights at 80% HP',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['weapon'],
    statMods: [
      { stat: 'killDamageStack', value: 10, isPercent: true },
      { stat: 'startingHPPercent', value: -20, isPercent: true }
    ],
    tags: ['damage']
  },

  // ========== ARMOR CURSES ==========
  {
    id: 'heavy_burden',
    name: 'Heavy Burden',
    description: '+15 defense, -20% dodge, -10 stamina',
    upside: '+15 defense',
    downside: '-20% dodge, -10 max stamina',
    weight: 30,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'defense', value: 15 },
      { stat: 'dodge', value: -20, isPercent: true },
      { stat: 'maxStamina', value: -10 }
    ],
    tags: ['defense', 'dodge', 'stamina']
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: '+40% damage, -30% max HP',
    upside: '+40% damage dealt',
    downside: '-30% max HP',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'damagePercent', value: 40, isPercent: true },
      { stat: 'maxHPPercent', value: -30, isPercent: true }
    ],
    tags: ['damage', 'hp']
  },
  {
    id: 'marked',
    name: 'Marked',
    description: '+35 HP, enemies deal +15% damage to you',
    upside: '+35 max HP',
    downside: 'Enemies deal +15% damage to you',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 35 },
      { stat: 'enemyDamageBonus', value: 15, isPercent: true }
    ],
    tags: ['hp', 'defense']
  },
  {
    id: 'blood_oath',
    name: 'Blood Oath',
    description: 'Heal 5% damage dealt, bleed for 2/turn',
    upside: 'Lifesteal 5% of damage dealt',
    downside: 'Constantly bleeding (2 damage/turn)',
    weight: 25,
    tier: 'rare',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'lifesteal', value: 5, isPercent: true },
      { stat: 'selfDamagePerTurn', value: 2 }
    ],
    tags: ['lifesteal', 'bleed']
  },
  {
    id: 'cursed_vigor',
    name: 'Cursed Vigor',
    description: '+50 HP, cannot be healed above 50%',
    upside: '+50 max HP',
    downside: 'Cannot heal above 50% max HP',
    weight: 20,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'maxHP', value: 50 },
      { stat: 'maxHealPercent', value: 50, isPercent: true }
    ],
    tags: ['hp', 'heal']
  },
  {
    id: 'doomed',
    name: 'Doomed',
    description: 'Immune to wounds, die instantly at 0 HP (no second chance)',
    upside: 'Completely immune to wounds',
    downside: 'No last-stand chances, instant death at 0 HP',
    weight: 15,
    tier: 'epic',
    allowedItemTypes: ['armor'],
    statMods: [
      { stat: 'woundImmune', value: 1 },
      { stat: 'noLastStand', value: 1 }
    ],
    tags: ['wound', 'hp']
  }
];

// Helper functions
export function getCurseById(id: string): CurseData | undefined {
  return CURSES.find(c => c.id === id);
}

export function getCursesForItemType(itemType: ItemType): CurseData[] {
  return CURSES.filter(c => c.allowedItemTypes.includes(itemType));
}

export function getCurseChance(rarity: string): number {
  // Curses only appear on higher rarity items
  switch (rarity) {
    case 'epic': return 20;  // 20% chance
    case 'legendary': return 35;  // 35% chance
    default: return 0;  // No curses on common/uncommon/rare
  }
}
