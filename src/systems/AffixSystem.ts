/**
 * AffixSystem - Manages item affixes (prefixes, suffixes, curses)
 * Handles generation, stat resolution, and display
 */

import { ItemType, ItemInstance } from './InventorySystem';
import { ItemRarity } from '../data/WeaponsData';
import { RNG } from './RNGSystem';
import { AffixData, AffixTier, getPrefixById, getPrefixesForItemType, StatMod, ProcEffect } from '../data/affixes/prefixes';
import { getSuffixById, getSuffixesForItemType } from '../data/affixes/suffixes';
import { CurseData, getCurseById, getCursesForItemType, getCurseChance, CURSES } from '../data/affixes/curses';

// Extended ItemInstance with affixes
export interface AffixedItemInstance extends ItemInstance {
  prefixId?: string;
  suffixId?: string;
  curseId?: string;
}

// Computed stats from an affixed item
export interface AffixedStats {
  // Flat bonuses
  damageMin: number;
  damageMax: number;
  defense: number;
  maxHP: number;
  maxStamina: number;
  staminaCost: number;
  staminaRegen: number;
  
  // Percentage bonuses
  accuracy: number;
  critChance: number;
  critDamage: number;
  dodge: number;
  parryWindow: number;
  speed: number;
  
  // Special effects
  bleedChance: number;
  bleedDamage: number;
  stunChance: number;
  armorBreak: number;
  lifesteal: number;
  thornsDamage: number;
  momentumGain: number;
  
  // Resistances
  bleedResist: number;
  stunResist: number;
  woundResist: number;
  armorBreakResist: number;
  
  // Special flags
  canBlock: boolean;
  canParry: boolean;
  stunImmune: boolean;
  woundImmune: boolean;
  armorBreakImmune: boolean;
  
  // Procs
  procs: ProcEffect[];
}

const DEFAULT_AFFIXED_STATS: AffixedStats = {
  damageMin: 0,
  damageMax: 0,
  defense: 0,
  maxHP: 0,
  maxStamina: 0,
  staminaCost: 0,
  staminaRegen: 0,
  accuracy: 0,
  critChance: 0,
  critDamage: 0,
  dodge: 0,
  parryWindow: 0,
  speed: 0,
  bleedChance: 0,
  bleedDamage: 0,
  stunChance: 0,
  armorBreak: 0,
  lifesteal: 0,
  thornsDamage: 0,
  momentumGain: 0,
  bleedResist: 0,
  stunResist: 0,
  woundResist: 0,
  armorBreakResist: 0,
  canBlock: true,
  canParry: true,
  stunImmune: false,
  woundImmune: false,
  armorBreakImmune: false,
  procs: []
};

// ========== AFFIX GENERATION ==========

/**
 * Determine how many affixes based on rarity
 */
function getAffixCounts(rarity: ItemRarity): { prefixChance: number; suffixChance: number } {
  switch (rarity) {
    case 'common':
      return { prefixChance: 25, suffixChance: 0 };  // 25% one affix
    case 'uncommon':
      return { prefixChance: 60, suffixChance: 30 };  // Usually 1, sometimes 2
    case 'rare':
      return { prefixChance: 80, suffixChance: 60 };  // Usually 1-2
    case 'epic':
      return { prefixChance: 100, suffixChance: 80 };  // Always prefix, usually suffix
    case 'legendary':
      return { prefixChance: 100, suffixChance: 100 };  // Always both
    default:
      return { prefixChance: 0, suffixChance: 0 };
  }
}

/**
 * Select an affix by weighted random
 */
function selectAffix(affixes: AffixData[], maxTier: AffixTier, league: string): AffixData | null {
  // Filter by tier availability
  const tierOrder: AffixTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const maxTierIdx = tierOrder.indexOf(maxTier);
  
  // Higher leagues unlock higher tiers
  const leagueTierBonus: Record<string, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
    champion: 3
  };
  const effectiveMaxTier = Math.min(maxTierIdx + (leagueTierBonus[league] || 0), 4);
  
  const available = affixes.filter(a => tierOrder.indexOf(a.tier) <= effectiveMaxTier);
  if (available.length === 0) return null;
  
  // Weighted random selection
  const totalWeight = available.reduce((sum, a) => sum + a.weight, 0);
  let roll = RNG.random() * totalWeight;
  
  for (const affix of available) {
    roll -= affix.weight;
    if (roll <= 0) return affix;
  }
  
  return available[0];
}

/**
 * Roll affixes for a new item
 */
export function rollAffixes(
  itemType: ItemType,
  rarity: ItemRarity,
  league: string
): { prefixId?: string; suffixId?: string; curseId?: string } {
  const result: { prefixId?: string; suffixId?: string; curseId?: string } = {};
  const counts = getAffixCounts(rarity);
  
  // Determine max affix tier based on item rarity
  const rarityToMaxTier: Record<ItemRarity, AffixTier> = {
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    epic: 'epic',
    legendary: 'legendary'
  };
  const maxTier = rarityToMaxTier[rarity];
  
  // Roll for prefix
  if (RNG.random() * 100 < counts.prefixChance) {
    const prefixes = getPrefixesForItemType(itemType);
    const prefix = selectAffix(prefixes, maxTier, league);
    if (prefix) result.prefixId = prefix.id;
  }
  
  // Roll for suffix
  if (RNG.random() * 100 < counts.suffixChance) {
    const suffixes = getSuffixesForItemType(itemType);
    const suffix = selectAffix(suffixes, maxTier, league);
    if (suffix) result.suffixId = suffix.id;
  }
  
  // Roll for curse on high rarity items
  const curseChance = getCurseChance(rarity);
  if (curseChance > 0 && RNG.random() * 100 < curseChance) {
    const curses = getCursesForItemType(itemType);
    if (curses.length > 0) {
      const curse = RNG.pick(curses);
      result.curseId = curse.id;
    }
  }
  
  return result;
}

// ========== STAT RESOLUTION ==========

/**
 * Apply stat mods from an affix
 */
function applyStatMods(stats: AffixedStats, mods: StatMod[]): void {
  for (const mod of mods) {
    switch (mod.stat) {
      case 'damageMin': stats.damageMin += mod.value; break;
      case 'damageMax': stats.damageMax += mod.value; break;
      case 'defense': stats.defense += mod.value; break;
      case 'maxHP': stats.maxHP += mod.value; break;
      case 'maxStamina': stats.maxStamina += mod.value; break;
      case 'staminaCost': stats.staminaCost += mod.value; break;
      case 'staminaRegen': stats.staminaRegen += mod.value; break;
      case 'accuracy': stats.accuracy += mod.value; break;
      case 'critChance': stats.critChance += mod.value; break;
      case 'critDamage': stats.critDamage += mod.value; break;
      case 'dodge': stats.dodge += mod.value; break;
      case 'parryWindow': stats.parryWindow += mod.value; break;
      case 'speed': stats.speed += mod.value; break;
      case 'bleedChance': stats.bleedChance += mod.value; break;
      case 'bleedDamage': stats.bleedDamage += mod.value; break;
      case 'stunChance': stats.stunChance += mod.value; break;
      case 'armorBreak': stats.armorBreak += mod.value; break;
      case 'lifesteal': stats.lifesteal += mod.value; break;
      case 'thornsDamage': stats.thornsDamage += mod.value; break;
      case 'momentumGain': stats.momentumGain += mod.value; break;
      case 'bleedResist': stats.bleedResist += mod.value; break;
      case 'stunResist': stats.stunResist += mod.value; break;
      case 'woundResist': stats.woundResist += mod.value; break;
      case 'armorBreakResist': stats.armorBreakResist += mod.value; break;
      case 'canBlock': stats.canBlock = mod.value !== 0; break;
      case 'canParry': stats.canParry = mod.value !== 0; break;
      case 'stunImmune': stats.stunImmune = mod.value !== 0; break;
      case 'woundImmune': stats.woundImmune = mod.value !== 0; break;
      case 'armorBreakImmune': stats.armorBreakImmune = mod.value !== 0; break;
    }
  }
}

/**
 * Calculate total affix stats for an item
 */
export function calculateAffixStats(item: AffixedItemInstance): AffixedStats {
  const stats = { ...DEFAULT_AFFIXED_STATS, procs: [] as ProcEffect[] };
  
  // Apply prefix
  if (item.prefixId) {
    const prefix = getPrefixById(item.prefixId);
    if (prefix) {
      applyStatMods(stats, prefix.statMods);
      if (prefix.proc) stats.procs.push(prefix.proc);
    }
  }
  
  // Apply suffix
  if (item.suffixId) {
    const suffix = getSuffixById(item.suffixId);
    if (suffix) {
      applyStatMods(stats, suffix.statMods);
      if (suffix.proc) stats.procs.push(suffix.proc);
    }
  }
  
  // Apply curse
  if (item.curseId) {
    const curse = getCurseById(item.curseId);
    if (curse) {
      applyStatMods(stats, curse.statMods);
      if (curse.proc) stats.procs.push(curse.proc);
    }
  }
  
  return stats;
}

// ========== DISPLAY HELPERS ==========

/**
 * Generate the full name of an affixed item
 * e.g., "Sharp Iron Sword of the Fox (Cursed: Debt)"
 */
export function getAffixedItemName(item: AffixedItemInstance, baseName: string): string {
  let name = baseName;
  
  // Add prefix
  if (item.prefixId) {
    const prefix = getPrefixById(item.prefixId);
    if (prefix) {
      name = `${prefix.name} ${name}`;
    }
  }
  
  // Add suffix
  if (item.suffixId) {
    const suffix = getSuffixById(item.suffixId);
    if (suffix) {
      name = `${name} ${suffix.name}`;
    }
  }
  
  // Add curse indicator
  if (item.curseId) {
    const curse = getCurseById(item.curseId);
    if (curse) {
      name = `${name} (Cursed: ${curse.name})`;
    }
  }
  
  return name;
}

/**
 * Get a summary of affix effects for display
 */
export function getAffixSummary(item: AffixedItemInstance): string[] {
  const effects: string[] = [];
  
  if (item.prefixId) {
    const prefix = getPrefixById(item.prefixId);
    if (prefix) effects.push(prefix.description);
  }
  
  if (item.suffixId) {
    const suffix = getSuffixById(item.suffixId);
    if (suffix) effects.push(suffix.description);
  }
  
  if (item.curseId) {
    const curse = getCurseById(item.curseId);
    if (curse) {
      effects.push(`⚠️ ${curse.upside}`);
      effects.push(`☠️ ${curse.downside}`);
    }
  }
  
  return effects;
}

/**
 * Get all tags from an item's affixes
 */
export function getAffixTags(item: AffixedItemInstance): string[] {
  const tags: Set<string> = new Set();
  
  if (item.prefixId) {
    const prefix = getPrefixById(item.prefixId);
    prefix?.tags.forEach(t => tags.add(t));
  }
  
  if (item.suffixId) {
    const suffix = getSuffixById(item.suffixId);
    suffix?.tags.forEach(t => tags.add(t));
  }
  
  if (item.curseId) {
    const curse = getCurseById(item.curseId);
    curse?.tags.forEach(t => tags.add(t));
    tags.add('cursed');
  }
  
  return Array.from(tags);
}

/**
 * Get icon for a tag
 */
export function getTagIcon(tag: string): string {
  const icons: Record<string, string> = {
    damage: '⚔️',
    crit: '⚡',
    bleed: '🩸',
    stun: '💫',
    armorBreak: '🛠️',
    dodge: '💨',
    parry: '🛡️',
    stamina: '💪',
    hp: '❤️',
    heal: '💚',
    lifesteal: '🧛',
    momentum: '🔥',
    gold: '💰',
    fame: '⭐',
    resist: '🛡️',
    thorns: '🌵',
    poison: '☠️',
    wound: '🩹',
    cursed: '💀',
    defense: '🛡️',
    accuracy: '🎯',
    speed: '⚡',
    block: '🛡️',
    bloodline: '👑'
  };
  return icons[tag] || '•';
}

/**
 * Check if an item has any affixes
 */
export function hasAffixes(item: ItemInstance): item is AffixedItemInstance {
  const affixed = item as AffixedItemInstance;
  return !!(affixed.prefixId || affixed.suffixId || affixed.curseId);
}

/**
 * Calculate power contribution from affixes
 */
export function calculateAffixPowerBonus(item: AffixedItemInstance): number {
  const stats = calculateAffixStats(item);
  let power = 0;
  
  // Offensive stats
  power += (stats.damageMin + stats.damageMax) * 2;
  power += stats.critChance * 0.5;
  power += stats.critDamage * 0.3;
  power += stats.accuracy * 0.3;
  power += stats.bleedChance * 0.4;
  power += stats.stunChance * 0.6;
  power += stats.armorBreak * 3;
  power += stats.lifesteal * 2;
  power += stats.momentumGain * 4;
  
  // Defensive stats
  power += stats.defense * 1.5;
  power += stats.maxHP * 0.3;
  power += stats.maxStamina * 0.2;
  power += stats.dodge * 0.5;
  power += stats.parryWindow * 0.4;
  power += stats.thornsDamage * 1.5;
  
  // Resistances
  power += stats.bleedResist * 0.2;
  power += stats.stunResist * 0.2;
  power += stats.woundResist * 0.3;
  
  return Math.round(power);
}
