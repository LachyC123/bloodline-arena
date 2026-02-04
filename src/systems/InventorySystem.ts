/**
 * InventorySystem - Manages player inventory and loadout
 * Handles item instances, equipment, consumables, and stat calculations
 */

import { WeaponData, ItemRarity, getWeaponById, WEAPONS_DATA, WEAPON_TYPE_INFO, WeaponType, createProceduralWeaponId, getWeaponIconVariantForSeed } from '../data/WeaponsData';
import { ArmorData, ArmorSlot, getArmorById, ARMOR_DATA, ARMOR_SLOT_INFO, createProceduralArmorId } from '../data/ArmorData';
import { rollAffixes, getAffixedItemName, calculateAffixStats, AffixedItemInstance, AffixedStats } from './AffixSystem';
import { RNG } from './RNGSystem';

// ========== ITEM TYPES ==========

export type ItemType = 'weapon' | 'armor' | 'trinket' | 'consumable';

export interface ItemInstance {
  instanceId: string;        // Unique instance ID
  itemId: string;            // Base item ID from data
  itemType: ItemType;
  slot?: ArmorSlot;          // For armor
  quantity: number;          // For consumables
  acquired: number;          // Timestamp
  
  // Affixes (v6)
  prefixId?: string;
  suffixId?: string;
  curseId?: string;
}

export interface TrinketData {
  id: string;
  name: string;
  rarity: ItemRarity;
  icon: string;
  description: string;
  effects: TrinketEffect[];
  price: number;
  sellPrice: number;
  leagueMin: 'bronze' | 'silver' | 'gold';
}

export interface TrinketEffect {
  type: 'stat_bonus' | 'combat_bonus' | 'passive';
  stat?: string;
  value: number;
  description: string;
}

export interface ConsumableData {
  id: string;
  name: string;
  rarity: ItemRarity;
  icon: string;
  description: string;
  usesPerFight: number;
  effect: ConsumableEffect;
  price: number;
  sellPrice: number;
  leagueMin: 'bronze' | 'silver' | 'gold';
}

export interface ConsumableEffect {
  type: 'heal' | 'stamina' | 'focus' | 'buff' | 'cure' | 'damage';
  value: number;
  duration?: number;
  description: string;
}

// ========== LOADOUT ==========

export interface Loadout {
  weaponId: string | null;
  armorId: string | null;
  helmetId: string | null;
  shieldId: string | null;
  trinket1Id: string | null;
  trinket2Id: string | null;
  consumable1Id: string | null;
  consumable2Id: string | null;
}

export const DEFAULT_LOADOUT: Loadout = {
  weaponId: null,
  armorId: null,
  helmetId: null,
  shieldId: null,
  trinket1Id: null,
  trinket2Id: null,
  consumable1Id: null,
  consumable2Id: null
};

// ========== TRINKETS DATA ==========

export const TRINKETS_DATA: TrinketData[] = [
  {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    rarity: 'common',
    icon: '🪙',
    description: 'A coin from your first win.',
    effects: [
      { type: 'stat_bonus', stat: 'critChance', value: 3, description: '+3% crit chance' }
    ],
    price: 50,
    sellPrice: 17,
    leagueMin: 'bronze'
  },
  {
    id: 'fighters_ring',
    name: 'Fighter\'s Ring',
    rarity: 'common',
    icon: '💍',
    description: 'A simple iron ring.',
    effects: [
      { type: 'stat_bonus', stat: 'attack', value: 2, description: '+2 Attack' }
    ],
    price: 60,
    sellPrice: 20,
    leagueMin: 'bronze'
  },
  {
    id: 'leather_armband',
    name: 'Leather Armband',
    rarity: 'common',
    icon: '🎗️',
    description: 'Reinforced wrist protection.',
    effects: [
      { type: 'stat_bonus', stat: 'defense', value: 2, description: '+2 Defense' }
    ],
    price: 55,
    sellPrice: 18,
    leagueMin: 'bronze'
  },
  {
    id: 'endurance_pendant',
    name: 'Endurance Pendant',
    rarity: 'uncommon',
    icon: '📿',
    description: 'Grants stamina when you need it.',
    effects: [
      { type: 'stat_bonus', stat: 'maxStamina', value: 15, description: '+15 Max Stamina' },
      { type: 'combat_bonus', stat: 'staminaRegen', value: 3, description: '+3 Stamina/turn' }
    ],
    price: 120,
    sellPrice: 40,
    leagueMin: 'bronze'
  },
  {
    id: 'bloodstone_amulet',
    name: 'Bloodstone Amulet',
    rarity: 'uncommon',
    icon: '🔴',
    description: 'Absorbs blood to heal.',
    effects: [
      { type: 'passive', value: 10, description: 'Heal 10% of bleed damage dealt' }
    ],
    price: 140,
    sellPrice: 48,
    leagueMin: 'bronze'
  },
  {
    id: 'crowd_favor_token',
    name: 'Crowd Favor Token',
    rarity: 'uncommon',
    icon: '🎭',
    description: 'The crowd loves you.',
    effects: [
      { type: 'combat_bonus', stat: 'momentumGain', value: 25, description: '+25% Momentum gain' }
    ],
    price: 130,
    sellPrice: 45,
    leagueMin: 'bronze'
  },
  {
    id: 'champions_signet',
    name: 'Champion\'s Signet',
    rarity: 'rare',
    icon: '💎',
    description: 'Ring of a former champion.',
    effects: [
      { type: 'stat_bonus', stat: 'attack', value: 4, description: '+4 Attack' },
      { type: 'stat_bonus', stat: 'critChance', value: 5, description: '+5% Crit' }
    ],
    price: 250,
    sellPrice: 85,
    leagueMin: 'silver'
  },
  {
    id: 'iron_will_charm',
    name: 'Iron Will Charm',
    rarity: 'rare',
    icon: '🧿',
    description: 'Protects against fear and control.',
    effects: [
      { type: 'passive', value: 50, description: '50% stun resistance' },
      { type: 'stat_bonus', stat: 'maxFocus', value: 10, description: '+10 Max Focus' }
    ],
    price: 220,
    sellPrice: 75,
    leagueMin: 'silver'
  },
  {
    id: 'berserker_fang',
    name: 'Berserker\'s Fang',
    rarity: 'rare',
    icon: '🦷',
    description: 'Power through pain.',
    effects: [
      { type: 'passive', value: 1, description: '+1% damage per 5% HP missing' }
    ],
    price: 280,
    sellPrice: 95,
    leagueMin: 'silver'
  },
  {
    id: 'executioners_eye',
    name: 'Executioner\'s Eye',
    rarity: 'epic',
    icon: '👁️',
    description: 'Sees the killing blow.',
    effects: [
      { type: 'stat_bonus', stat: 'critChance', value: 10, description: '+10% Crit' },
      { type: 'stat_bonus', stat: 'critDamage', value: 25, description: '+25% Crit Damage' }
    ],
    price: 450,
    sellPrice: 150,
    leagueMin: 'gold'
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    rarity: 'legendary',
    icon: '🪶',
    description: 'Rise from death once.',
    effects: [
      { type: 'passive', value: 30, description: 'Once per fight: Revive at 30% HP when killed' }
    ],
    price: 800,
    sellPrice: 270,
    leagueMin: 'gold'
  }
];

// ========== CONSUMABLES DATA ==========

export const CONSUMABLES_DATA: ConsumableData[] = [
  {
    id: 'bandage',
    name: 'Bandage',
    rarity: 'common',
    icon: '🩹',
    description: 'Basic wound care.',
    usesPerFight: 2,
    effect: { type: 'heal', value: 20, description: 'Heal 20 HP' },
    price: 15,
    sellPrice: 5,
    leagueMin: 'bronze'
  },
  {
    id: 'healing_salve',
    name: 'Healing Salve',
    rarity: 'uncommon',
    icon: '🧴',
    description: 'Potent healing mixture.',
    usesPerFight: 1,
    effect: { type: 'heal', value: 50, description: 'Heal 50 HP' },
    price: 40,
    sellPrice: 14,
    leagueMin: 'bronze'
  },
  {
    id: 'stamina_tonic',
    name: 'Stamina Tonic',
    rarity: 'common',
    icon: '⚗️',
    description: 'Restores energy.',
    usesPerFight: 2,
    effect: { type: 'stamina', value: 40, description: 'Restore 40 Stamina' },
    price: 20,
    sellPrice: 7,
    leagueMin: 'bronze'
  },
  {
    id: 'focus_elixir',
    name: 'Focus Elixir',
    rarity: 'uncommon',
    icon: '🧪',
    description: 'Sharpens the mind.',
    usesPerFight: 1,
    effect: { type: 'focus', value: 30, description: 'Gain 30 Focus' },
    price: 35,
    sellPrice: 12,
    leagueMin: 'bronze'
  },
  {
    id: 'antidote',
    name: 'Antidote',
    rarity: 'common',
    icon: '💊',
    description: 'Cures poison.',
    usesPerFight: 2,
    effect: { type: 'cure', value: 1, description: 'Remove poison effect' },
    price: 25,
    sellPrice: 8,
    leagueMin: 'bronze'
  },
  {
    id: 'rage_potion',
    name: 'Rage Potion',
    rarity: 'rare',
    icon: '🔴',
    description: 'Temporary power surge.',
    usesPerFight: 1,
    effect: { type: 'buff', value: 25, duration: 3, description: '+25% Damage for 3 turns' },
    price: 80,
    sellPrice: 28,
    leagueMin: 'silver'
  },
  {
    id: 'iron_skin_draft',
    name: 'Iron Skin Draft',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Temporary defense boost.',
    usesPerFight: 1,
    effect: { type: 'buff', value: 30, duration: 3, description: '+30% Defense for 3 turns' },
    price: 75,
    sellPrice: 25,
    leagueMin: 'silver'
  },
  {
    id: 'throwing_knife',
    name: 'Throwing Knife',
    rarity: 'uncommon',
    icon: '🗡️',
    description: 'Ranged surprise attack.',
    usesPerFight: 3,
    effect: { type: 'damage', value: 15, description: 'Deal 15 damage instantly' },
    price: 30,
    sellPrice: 10,
    leagueMin: 'bronze'
  },
  {
    id: 'flash_powder',
    name: 'Flash Powder',
    rarity: 'rare',
    icon: '✨',
    description: 'Blind and stun briefly.',
    usesPerFight: 1,
    effect: { type: 'buff', value: 1, duration: 1, description: 'Enemy skips next turn' },
    price: 100,
    sellPrice: 35,
    leagueMin: 'silver'
  },
  {
    id: 'champions_brew',
    name: 'Champion\'s Brew',
    rarity: 'epic',
    icon: '🍺',
    description: 'The drink of legends.',
    usesPerFight: 1,
    effect: { type: 'buff', value: 15, duration: 5, description: '+15% to all stats for 5 turns' },
    price: 200,
    sellPrice: 68,
    leagueMin: 'gold'
  }
];

const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1
};

function rollRarityForLeague(league: 'bronze' | 'silver' | 'gold'): ItemRarity {
  const weights = { ...RARITY_WEIGHTS };
  if (league === 'silver') {
    weights.rare += 5;
    weights.epic += 2;
  } else if (league === 'gold') {
    weights.rare += 10;
    weights.epic += 5;
    weights.legendary += 2;
  }
  const options: [ItemRarity, number][] = Object.entries(weights) as [ItemRarity, number][];
  return RNG.weightedPick(options);
}

function hashStringToSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

// ========== HELPER FUNCTIONS ==========

export function getTrinketById(id: string): TrinketData | undefined {
  return TRINKETS_DATA.find(t => t.id === id);
}

export function getConsumableById(id: string): ConsumableData | undefined {
  return CONSUMABLES_DATA.find(c => c.id === id);
}

export function generateInstanceId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createItemInstance(
  itemId: string, 
  itemType: ItemType, 
  slot?: ArmorSlot,
  quantity: number = 1,
  affixes?: { prefixId?: string; suffixId?: string; curseId?: string }
): ItemInstance {
  const instance: ItemInstance = {
    instanceId: generateInstanceId(),
    itemId,
    itemType,
    slot,
    quantity,
    acquired: Date.now()
  };
  
  // Apply affixes if provided
  if (affixes) {
    if (affixes.prefixId) instance.prefixId = affixes.prefixId;
    if (affixes.suffixId) instance.suffixId = affixes.suffixId;
    if (affixes.curseId) instance.curseId = affixes.curseId;
  }
  
  return instance;
}

/**
 * Create item instance with randomly rolled affixes
 */
export function createAffixedItemInstance(
  itemId: string,
  itemType: ItemType,
  rarity: ItemRarity,
  league: string,
  slot?: ArmorSlot
): ItemInstance {
  const affixes = rollAffixes(itemType, rarity, league);
  return createItemInstance(itemId, itemType, slot, 1, affixes);
}

export function getItemData(instance: ItemInstance): WeaponData | ArmorData | TrinketData | ConsumableData | undefined {
  switch (instance.itemType) {
    case 'weapon':
      return getWeaponById(instance.itemId);
    case 'armor':
      return getArmorById(instance.itemId);
    case 'trinket':
      return getTrinketById(instance.itemId);
    case 'consumable':
      return getConsumableById(instance.itemId);
    default:
      return undefined;
  }
}

export function getItemName(instance: ItemInstance): string {
  const data = getItemData(instance);
  const baseName = data?.name || 'Unknown Item';
  
  // If item has affixes, generate full name
  if (instance.prefixId || instance.suffixId || instance.curseId) {
    return getAffixedItemName(instance as AffixedItemInstance, baseName);
  }
  
  return baseName;
}

/**
 * Get the base item name without affixes
 */
export function getBaseItemName(instance: ItemInstance): string {
  const data = getItemData(instance);
  return data?.name || 'Unknown Item';
}

export function getItemIcon(instance: ItemInstance): string {
  const data = getItemData(instance);
  if (instance.itemType === 'weapon' && data && 'type' in data) {
    const seed = hashStringToSeed(instance.instanceId);
    return getWeaponIconVariantForSeed(seed, data.type as WeaponType);
  }
  return data?.icon || '❓';
}

export function getItemRarity(instance: ItemInstance): ItemRarity {
  const data = getItemData(instance);
  return (data as { rarity?: ItemRarity })?.rarity || 'common';
}

export function getItemPrice(instance: ItemInstance): number {
  const data = getItemData(instance);
  return (data as { price?: number })?.price || 0;
}

export function getItemSellPrice(instance: ItemInstance): number {
  const data = getItemData(instance);
  return (data as { sellPrice?: number })?.sellPrice || 0;
}

// ========== LOADOUT STAT CALCULATIONS ==========

export interface LoadoutStats {
  // Offensive
  damageMin: number;
  damageMax: number;
  lightStaminaCost: number;
  heavyStaminaCost: number;
  accuracyMod: number;
  critChanceMod: number;
  speedMod: number;
  
  // Defensive
  totalDefense: number;
  staminaRegenMod: number;
  dodgeMod: number;
  
  // Perks and effects
  weaponEffects: string[];
  armorPerks: string[];
  trinketEffects: string[];
  
  // Resistances
  bleedResist: number;
  stunResist: number;
  poisonResist: number;
  critResist: number;
}

// Default stats for fresh recruits without gear
export const DEFAULT_LOADOUT_STATS: LoadoutStats = {
  damageMin: 5,
  damageMax: 8,
  lightStaminaCost: 10,
  heavyStaminaCost: 22,
  accuracyMod: 0,
  critChanceMod: 0,
  speedMod: 0,
  totalDefense: 2,
  staminaRegenMod: 0,
  dodgeMod: 0,
  weaponEffects: [],
  armorPerks: [],
  trinketEffects: [],
  bleedResist: 0,
  stunResist: 0,
  poisonResist: 0,
  critResist: 0
};

export function calculateLoadoutStats(
  inventory: ItemInstance[],
  loadout: Loadout
): LoadoutStats {
  const stats: LoadoutStats = {
    damageMin: 5,
    damageMax: 8,
    lightStaminaCost: 10,
    heavyStaminaCost: 22,
    accuracyMod: 0,
    critChanceMod: 0,
    speedMod: 0,
    totalDefense: 0,
    staminaRegenMod: 0,
    dodgeMod: 0,
    weaponEffects: [],
    armorPerks: [],
    trinketEffects: [],
    bleedResist: 0,
    stunResist: 0,
    poisonResist: 0,
    critResist: 0
  };
  
  // Weapon stats
  if (loadout.weaponId) {
    const weaponInstance = inventory.find(i => i.instanceId === loadout.weaponId);
    if (weaponInstance) {
      const weapon = getWeaponById(weaponInstance.itemId);
      if (weapon) {
        stats.damageMin = weapon.damageMin;
        stats.damageMax = weapon.damageMax;
        stats.lightStaminaCost = weapon.lightStaminaCost;
        stats.heavyStaminaCost = weapon.heavyStaminaCost;
        stats.accuracyMod += weapon.accuracyMod;
        stats.critChanceMod += weapon.critChanceMod;
        stats.speedMod += weapon.speedMod;
        stats.weaponEffects = weapon.effects.map(e => e.description);
      }
    }
  }
  
  // Armor stats
  const armorSlots = [loadout.armorId, loadout.helmetId, loadout.shieldId];
  for (const armorId of armorSlots) {
    if (armorId) {
      const armorInstance = inventory.find(i => i.instanceId === armorId);
      if (armorInstance) {
        const armor = getArmorById(armorInstance.itemId);
        if (armor) {
          stats.totalDefense += armor.defense;
          stats.staminaRegenMod += armor.staminaRegenMod;
          stats.dodgeMod += armor.dodgeMod;
          stats.speedMod += armor.speedMod;
          
          for (const perk of armor.perks) {
            stats.armorPerks.push(perk.description);
            switch (perk.type) {
              case 'bleed_resist':
                stats.bleedResist += perk.value;
                break;
              case 'stun_resist':
                stats.stunResist += perk.value;
                break;
              case 'poison_resist':
                stats.poisonResist += perk.value;
                break;
              case 'crit_resist':
                stats.critResist += perk.value;
                break;
              case 'dodge_boost':
                stats.dodgeMod += perk.value;
                break;
            }
          }
        }
      }
    }
  }
  
  // Trinket stats
  const trinketSlots = [loadout.trinket1Id, loadout.trinket2Id];
  for (const trinketId of trinketSlots) {
    if (trinketId) {
      const trinketInstance = inventory.find(i => i.instanceId === trinketId);
      if (trinketInstance) {
        const trinket = getTrinketById(trinketInstance.itemId);
        if (trinket) {
          for (const effect of trinket.effects) {
            stats.trinketEffects.push(effect.description);
            if (effect.type === 'stat_bonus' && effect.stat) {
              switch (effect.stat) {
                case 'attack':
                  stats.damageMin += effect.value;
                  stats.damageMax += effect.value;
                  break;
                case 'defense':
                  stats.totalDefense += effect.value;
                  break;
                case 'critChance':
                  stats.critChanceMod += effect.value;
                  break;
                case 'critDamage':
                  // Tracked separately
                  break;
              }
            }
          }
        }
      }
    }
  }
  
  // Apply affix stats from equipped items
  const equippedItems = [
    loadout.weaponId,
    loadout.armorId,
    loadout.helmetId,
    loadout.shieldId
  ].filter(Boolean);
  
  for (const itemId of equippedItems) {
    const instance = inventory.find(i => i.instanceId === itemId);
    if (instance && (instance.prefixId || instance.suffixId || instance.curseId)) {
      const affixStats = calculateAffixStats(instance as AffixedItemInstance);
      
      // Apply affix bonuses
      stats.damageMin += affixStats.damageMin;
      stats.damageMax += affixStats.damageMax;
      stats.totalDefense += affixStats.defense;
      stats.critChanceMod += affixStats.critChance;
      stats.accuracyMod += affixStats.accuracy;
      stats.dodgeMod += affixStats.dodge;
      stats.speedMod += affixStats.speed;
      stats.staminaRegenMod += affixStats.staminaRegen;
      stats.lightStaminaCost += affixStats.staminaCost;
      stats.heavyStaminaCost += affixStats.staminaCost;
      stats.bleedResist += affixStats.bleedResist;
      stats.stunResist += affixStats.stunResist;
    }
  }
  
  return stats;
}

// ========== STARTER ITEMS ==========

export function getStarterItems(): ItemInstance[] {
  return [
    createItemInstance('rusty_sword', 'weapon'),
    createItemInstance('tattered_tunic', 'armor', 'body'),
    createItemInstance('bandage', 'consumable', undefined, 3)
  ];
}

export function getDefaultLoadout(inventory: ItemInstance[]): Loadout {
  const loadout = { ...DEFAULT_LOADOUT };
  
  // Find first weapon
  const weapon = inventory.find(i => i.itemType === 'weapon');
  if (weapon) loadout.weaponId = weapon.instanceId;
  
  // Find first body armor
  const armor = inventory.find(i => i.itemType === 'armor' && i.slot === 'body');
  if (armor) loadout.armorId = armor.instanceId;
  
  return loadout;
}

// ========== RARITY COLORS ==========

export const RARITY_COLORS: Record<ItemRarity, number> = {
  common: 0x888888,
  uncommon: 0x22cc22,
  rare: 0x3388ff,
  epic: 0xaa44ff,
  legendary: 0xffaa00
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

// ========== ITEM GENERATION FOR DROPS/SHOP ==========

export function generateRandomWeapon(league: 'bronze' | 'silver' | 'gold', withAffixes: boolean = true): ItemInstance {
  const proceduralChance = league === 'gold' ? 0.6 : league === 'silver' ? 0.45 : 0.3;
  if (RNG.chance(proceduralChance)) {
    return generateProceduralWeapon(league, withAffixes);
  }

  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);

  const available = WEAPONS_DATA.filter(w => leagueOrder.indexOf(w.leagueMin) <= leagueIdx);
  const weighted = available.map(w => ({
    weapon: w,
    weight: RARITY_WEIGHTS[w.rarity]
  }));
  
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = RNG.float(0, totalWeight);
  
  for (const { weapon, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) {
      if (withAffixes) {
        return createAffixedItemInstance(weapon.id, 'weapon', weapon.rarity, league);
      }
      return createItemInstance(weapon.id, 'weapon');
    }
  }
  
  const fallback = available[0];
  if (withAffixes) {
    return createAffixedItemInstance(fallback.id, 'weapon', fallback.rarity, league);
  }
  return createItemInstance(fallback.id, 'weapon');
}

export function generateRandomArmor(league: 'bronze' | 'silver' | 'gold', slot?: ArmorSlot, withAffixes: boolean = true): ItemInstance {
  const proceduralChance = league === 'gold' ? 0.6 : league === 'silver' ? 0.45 : 0.3;
  if (RNG.chance(proceduralChance)) {
    return generateProceduralArmor(league, slot, withAffixes);
  }

  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  
  let available = ARMOR_DATA.filter(a => leagueOrder.indexOf(a.leagueMin) <= leagueIdx);
  if (slot) {
    available = available.filter(a => a.slot === slot);
  }
  
  const weighted = available.map(a => ({
    armor: a,
    weight: RARITY_WEIGHTS[a.rarity]
  }));
  
  const totalWeight = weighted.reduce((sum, a) => sum + a.weight, 0);
  let roll = RNG.float(0, totalWeight);
  
  for (const { armor, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) {
      if (withAffixes) {
        return createAffixedItemInstance(armor.id, 'armor', armor.rarity, league, armor.slot);
      }
      return createItemInstance(armor.id, 'armor', armor.slot);
    }
  }
  
  const first = available[0];
  if (withAffixes) {
    return createAffixedItemInstance(first.id, 'armor', first.rarity, league, first.slot);
  }
  return createItemInstance(first.id, 'armor', first.slot);
}

export function generateProceduralWeapon(league: 'bronze' | 'silver' | 'gold', withAffixes: boolean = true): ItemInstance {
  const rarity = rollRarityForLeague(league);
  const type = RNG.pick(Object.keys(WEAPON_TYPE_INFO) as WeaponType[]);
  const seed = RNG.int(100000, 999999);
  const id = createProceduralWeaponId(seed, league, rarity, type);
  if (withAffixes) {
    return createAffixedItemInstance(id, 'weapon', rarity, league);
  }
  return createItemInstance(id, 'weapon');
}

export function generateProceduralArmor(league: 'bronze' | 'silver' | 'gold', slot?: ArmorSlot, withAffixes: boolean = true): ItemInstance {
  const rarity = rollRarityForLeague(league);
  const resolvedSlot = slot ?? RNG.pick(Object.keys(ARMOR_SLOT_INFO) as ArmorSlot[]);
  const seed = RNG.int(100000, 999999);
  const id = createProceduralArmorId(seed, league, rarity, resolvedSlot);
  if (withAffixes) {
    return createAffixedItemInstance(id, 'armor', rarity, league, resolvedSlot);
  }
  return createItemInstance(id, 'armor', resolvedSlot);
}

export function generateRandomTrinket(league: 'bronze' | 'silver' | 'gold'): ItemInstance {
  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  const available = TRINKETS_DATA.filter(t => leagueOrder.indexOf(t.leagueMin) <= leagueIdx);
  const weighted = available.map(t => [t, RARITY_WEIGHTS[t.rarity]] as [TrinketData, number]);
  const picked = RNG.weightedPick(weighted);
  return createItemInstance(picked.id, 'trinket');
}

export function generateRandomConsumable(league: 'bronze' | 'silver' | 'gold'): ItemInstance {
  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  const available = CONSUMABLES_DATA.filter(c => leagueOrder.indexOf(c.leagueMin) <= leagueIdx);
  const weighted = available.map(c => [c, RARITY_WEIGHTS[c.rarity]] as [ConsumableData, number]);
  const picked = RNG.weightedPick(weighted);
  return createItemInstance(picked.id, 'consumable', undefined, 1);
}
