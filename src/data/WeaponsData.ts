/**
 * WeaponsData - Expanded weapon types with damage descriptions
 * 40+ weapons across 8 weapon types with distinct feels
 */

export type WeaponType = 
  | 'sword' 
  | 'axe' 
  | 'mace' 
  | 'spear' 
  | 'dagger' 
  | 'greatsword' 
  | 'flail' 
  | 'hammer';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface WeaponEffect {
  type: 'bleed' | 'stun' | 'armor_break' | 'crit_bonus' | 'first_strike' | 
        'guard_crush' | 'lifesteal' | 'focus_gain' | 'momentum_gain' | 'poison';
  chance: number;  // 0-1
  value: number;   // Effect strength
  description: string;
}

export interface WeaponData {
  id: string;
  name: string;
  type: WeaponType;
  rarity: ItemRarity;
  icon: string;
  
  // Damage
  damageMin: number;
  damageMax: number;
  
  // Costs
  lightStaminaCost: number;
  heavyStaminaCost: number;
  
  // Modifiers
  accuracyMod: number;      // Added to base accuracy
  critChanceMod: number;    // Added to base crit chance
  speedMod: number;         // Turn order modifier
  
  // Effects
  effects: WeaponEffect[];
  
  // Descriptions
  damageDescription: string;  // Plain English attack description
  lore: string;
  
  // Economy
  price: number;
  sellPrice: number;
  leagueMin: 'bronze' | 'silver' | 'gold';  // Minimum league to find
}

// Weapon type base characteristics
export const WEAPON_TYPE_INFO: Record<WeaponType, { name: string; icon: string; description: string }> = {
  sword: {
    name: 'Sword',
    icon: '⚔️',
    description: 'Balanced weapons with good speed and damage.'
  },
  axe: {
    name: 'Axe',
    icon: '🪓',
    description: 'Heavy choppers that break through armor.'
  },
  mace: {
    name: 'Mace',
    icon: '🔨',
    description: 'Crushing weapons that stun and crush guards.'
  },
  spear: {
    name: 'Spear',
    icon: '🔱',
    description: 'Long reach weapons with first strike advantage.'
  },
  dagger: {
    name: 'Dagger',
    icon: '🗡️',
    description: 'Fast blades with high crit and bleed chance.'
  },
  greatsword: {
    name: 'Greatsword',
    icon: '⚔️',
    description: 'Massive two-handers with devastating power.'
  },
  flail: {
    name: 'Flail',
    icon: '⛓️',
    description: 'Unpredictable weapons that bypass some guard.'
  },
  hammer: {
    name: 'Hammer',
    icon: '🔨',
    description: 'Slow but devastating armor-crushing weapons.'
  }
};

// All weapons data
export const WEAPONS_DATA: WeaponData[] = [
  // ========== SWORDS ==========
  {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    type: 'sword',
    rarity: 'common',
    icon: '⚔️',
    damageMin: 5,
    damageMax: 8,
    lightStaminaCost: 10,
    heavyStaminaCost: 22,
    accuracyMod: 0,
    critChanceMod: 0,
    speedMod: 0,
    effects: [],
    damageDescription: 'Light: Quick slash. Heavy: Overhead chop.',
    lore: 'A worn blade, but it still cuts.',
    price: 30,
    sellPrice: 10,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_gladius',
    name: 'Iron Gladius',
    type: 'sword',
    rarity: 'common',
    icon: '⚔️',
    damageMin: 7,
    damageMax: 10,
    lightStaminaCost: 10,
    heavyStaminaCost: 22,
    accuracyMod: 5,
    critChanceMod: 0,
    speedMod: 1,
    effects: [],
    damageDescription: 'Light: Precise thrust. Heavy: Wide slash with good accuracy.',
    lore: 'Standard arena issue. Reliable.',
    price: 60,
    sellPrice: 20,
    leagueMin: 'bronze'
  },
  {
    id: 'pit_fighter_blade',
    name: 'Pit Fighter\'s Blade',
    type: 'sword',
    rarity: 'uncommon',
    icon: '⚔️',
    damageMin: 9,
    damageMax: 13,
    lightStaminaCost: 10,
    heavyStaminaCost: 24,
    accuracyMod: 5,
    critChanceMod: 5,
    speedMod: 0,
    effects: [
      { type: 'bleed', chance: 0.15, value: 3, description: '15% bleed on hit' }
    ],
    damageDescription: 'Light: Fast cut with bleed chance. Heavy: Deep slash.',
    lore: 'Notched from countless fights.',
    price: 120,
    sellPrice: 40,
    leagueMin: 'bronze'
  },
  {
    id: 'arena_champion_sword',
    name: 'Arena Champion\'s Sword',
    type: 'sword',
    rarity: 'rare',
    icon: '⚔️',
    damageMin: 12,
    damageMax: 17,
    lightStaminaCost: 10,
    heavyStaminaCost: 24,
    accuracyMod: 8,
    critChanceMod: 8,
    speedMod: 2,
    effects: [
      { type: 'momentum_gain', chance: 0.25, value: 1, description: 'Builds momentum on hit' }
    ],
    damageDescription: 'Light: Swift strike that builds momentum. Heavy: Crowd-pleasing cleave.',
    lore: 'Won by a champion who never lost.',
    price: 250,
    sellPrice: 85,
    leagueMin: 'silver'
  },
  {
    id: 'bloodletter',
    name: 'Bloodletter',
    type: 'sword',
    rarity: 'epic',
    icon: '⚔️',
    damageMin: 14,
    damageMax: 20,
    lightStaminaCost: 12,
    heavyStaminaCost: 26,
    accuracyMod: 5,
    critChanceMod: 10,
    speedMod: 1,
    effects: [
      { type: 'bleed', chance: 0.35, value: 5, description: '35% bleed on any hit' },
      { type: 'lifesteal', chance: 0.2, value: 15, description: '20% chance to heal 15% of damage' }
    ],
    damageDescription: 'Light: Bleeding cut. Heavy: Deep wound that may heal you.',
    lore: 'The blade drinks deep.',
    price: 450,
    sellPrice: 150,
    leagueMin: 'silver'
  },
  {
    id: 'executioners_edge',
    name: 'Executioner\'s Edge',
    type: 'sword',
    rarity: 'legendary',
    icon: '⚔️',
    damageMin: 18,
    damageMax: 26,
    lightStaminaCost: 12,
    heavyStaminaCost: 28,
    accuracyMod: 10,
    critChanceMod: 15,
    speedMod: 2,
    effects: [
      { type: 'crit_bonus', chance: 1, value: 25, description: '+25% crit damage' },
      { type: 'bleed', chance: 0.4, value: 6, description: 'Severe bleeding on crit' }
    ],
    damageDescription: 'Light: Precise cut. Heavy: Devastating execution strike with massive crit potential.',
    lore: 'The last blade many have seen.',
    price: 800,
    sellPrice: 270,
    leagueMin: 'gold'
  },

  // ========== AXES ==========
  {
    id: 'wood_axe',
    name: 'Woodcutter\'s Axe',
    type: 'axe',
    rarity: 'common',
    icon: '🪓',
    damageMin: 6,
    damageMax: 10,
    lightStaminaCost: 12,
    heavyStaminaCost: 28,
    accuracyMod: -5,
    critChanceMod: 0,
    speedMod: -1,
    effects: [
      { type: 'armor_break', chance: 0.2, value: 1, description: 'Can chip armor' }
    ],
    damageDescription: 'Light: Wide chop. Heavy: Overhead slam with armor break.',
    lore: 'Made for trees, works on men too.',
    price: 35,
    sellPrice: 12,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_battleaxe',
    name: 'Iron Battleaxe',
    type: 'axe',
    rarity: 'uncommon',
    icon: '🪓',
    damageMin: 10,
    damageMax: 15,
    lightStaminaCost: 14,
    heavyStaminaCost: 30,
    accuracyMod: -3,
    critChanceMod: 5,
    speedMod: -1,
    effects: [
      { type: 'armor_break', chance: 0.35, value: 2, description: '35% to apply 2 armor break' }
    ],
    damageDescription: 'Light: Hooking cut. Heavy: Brutal chop that breaks armor.',
    lore: 'A soldier\'s trusted companion.',
    price: 100,
    sellPrice: 35,
    leagueMin: 'bronze'
  },
  {
    id: 'berserker_cleaver',
    name: 'Berserker\'s Cleaver',
    type: 'axe',
    rarity: 'rare',
    icon: '🪓',
    damageMin: 14,
    damageMax: 21,
    lightStaminaCost: 14,
    heavyStaminaCost: 32,
    accuracyMod: -5,
    critChanceMod: 10,
    speedMod: -2,
    effects: [
      { type: 'armor_break', chance: 0.5, value: 3, description: 'Shatters armor on heavy hits' },
      { type: 'momentum_gain', chance: 0.3, value: 2, description: 'Rage builds momentum' }
    ],
    damageDescription: 'Light: Wild swing. Heavy: Devastating cleave that destroys armor.',
    lore: 'Forged in fury.',
    price: 220,
    sellPrice: 75,
    leagueMin: 'silver'
  },
  {
    id: 'skull_splitter',
    name: 'Skull Splitter',
    type: 'axe',
    rarity: 'epic',
    icon: '🪓',
    damageMin: 18,
    damageMax: 28,
    lightStaminaCost: 16,
    heavyStaminaCost: 35,
    accuracyMod: -8,
    critChanceMod: 15,
    speedMod: -2,
    effects: [
      { type: 'armor_break', chance: 0.6, value: 4, description: 'Massive armor destruction' },
      { type: 'stun', chance: 0.2, value: 1, description: '20% stun on head hits' }
    ],
    damageDescription: 'Light: Powerful chop. Heavy: Skull-crushing blow that stuns and breaks all armor.',
    lore: 'Its name is well earned.',
    price: 420,
    sellPrice: 140,
    leagueMin: 'silver'
  },

  // ========== MACES ==========
  {
    id: 'wooden_club',
    name: 'Wooden Club',
    type: 'mace',
    rarity: 'common',
    icon: '🔨',
    damageMin: 5,
    damageMax: 9,
    lightStaminaCost: 11,
    heavyStaminaCost: 25,
    accuracyMod: 5,
    critChanceMod: -5,
    speedMod: 0,
    effects: [
      { type: 'stun', chance: 0.1, value: 1, description: 'Chance to daze' }
    ],
    damageDescription: 'Light: Quick bonk. Heavy: Overhead smash.',
    lore: 'Simple but effective.',
    price: 25,
    sellPrice: 8,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_mace',
    name: 'Iron Mace',
    type: 'mace',
    rarity: 'common',
    icon: '🔨',
    damageMin: 7,
    damageMax: 11,
    lightStaminaCost: 12,
    heavyStaminaCost: 26,
    accuracyMod: 3,
    critChanceMod: 0,
    speedMod: 0,
    effects: [
      { type: 'stun', chance: 0.15, value: 1, description: '15% stun chance' },
      { type: 'guard_crush', chance: 0.2, value: 50, description: 'Bypasses 50% guard on crit' }
    ],
    damageDescription: 'Light: Swift strike. Heavy: Guard-crushing smash.',
    lore: 'Dents helmets nicely.',
    price: 65,
    sellPrice: 22,
    leagueMin: 'bronze'
  },
  {
    id: 'flanged_mace',
    name: 'Flanged Mace',
    type: 'mace',
    rarity: 'uncommon',
    icon: '🔨',
    damageMin: 10,
    damageMax: 15,
    lightStaminaCost: 13,
    heavyStaminaCost: 28,
    accuracyMod: 5,
    critChanceMod: 5,
    speedMod: 0,
    effects: [
      { type: 'stun', chance: 0.25, value: 1, description: 'High stun chance' },
      { type: 'armor_break', chance: 0.2, value: 1, description: 'Dents armor' }
    ],
    damageDescription: 'Light: Flanged strike. Heavy: Devastating crush that stuns and dents.',
    lore: 'Designed to defeat armor.',
    price: 130,
    sellPrice: 45,
    leagueMin: 'bronze'
  },
  {
    id: 'morningstar',
    name: 'Morningstar',
    type: 'mace',
    rarity: 'rare',
    icon: '🔨',
    damageMin: 12,
    damageMax: 18,
    lightStaminaCost: 14,
    heavyStaminaCost: 30,
    accuracyMod: 0,
    critChanceMod: 10,
    speedMod: -1,
    effects: [
      { type: 'stun', chance: 0.35, value: 1, description: 'Spiked head stuns often' },
      { type: 'bleed', chance: 0.2, value: 3, description: 'Spikes cause bleeding' }
    ],
    damageDescription: 'Light: Spiked swing. Heavy: Crushing blow that stuns and tears.',
    lore: 'Spikes add conviction.',
    price: 200,
    sellPrice: 68,
    leagueMin: 'silver'
  },

  // ========== SPEARS ==========
  {
    id: 'wooden_spear',
    name: 'Wooden Spear',
    type: 'spear',
    rarity: 'common',
    icon: '🔱',
    damageMin: 4,
    damageMax: 8,
    lightStaminaCost: 9,
    heavyStaminaCost: 20,
    accuracyMod: 10,
    critChanceMod: 0,
    speedMod: 2,
    effects: [
      { type: 'first_strike', chance: 1, value: 1, description: 'Always strikes first' }
    ],
    damageDescription: 'Light: Quick jab with reach advantage. Heavy: Powerful thrust.',
    lore: 'Reach is everything.',
    price: 30,
    sellPrice: 10,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_pike',
    name: 'Iron Pike',
    type: 'spear',
    rarity: 'uncommon',
    icon: '🔱',
    damageMin: 7,
    damageMax: 12,
    lightStaminaCost: 10,
    heavyStaminaCost: 22,
    accuracyMod: 12,
    critChanceMod: 5,
    speedMod: 3,
    effects: [
      { type: 'first_strike', chance: 1, value: 1, description: 'Strike before they reach you' },
      { type: 'bleed', chance: 0.15, value: 2, description: 'Piercing causes bleeding' }
    ],
    damageDescription: 'Light: Precise thrust. Heavy: Deep penetrating stab with bleed.',
    lore: 'Keep them at distance.',
    price: 110,
    sellPrice: 38,
    leagueMin: 'bronze'
  },
  {
    id: 'gladiator_trident',
    name: 'Gladiator\'s Trident',
    type: 'spear',
    rarity: 'rare',
    icon: '🔱',
    damageMin: 10,
    damageMax: 16,
    lightStaminaCost: 11,
    heavyStaminaCost: 24,
    accuracyMod: 15,
    critChanceMod: 8,
    speedMod: 3,
    effects: [
      { type: 'first_strike', chance: 1, value: 1, description: 'Always first' },
      { type: 'bleed', chance: 0.3, value: 4, description: 'Three prongs cause severe bleeding' }
    ],
    damageDescription: 'Light: Triple-pronged jab. Heavy: Hooking thrust that tears and bleeds.',
    lore: 'A crowd favorite.',
    price: 240,
    sellPrice: 80,
    leagueMin: 'silver'
  },

  // ========== DAGGERS ==========
  {
    id: 'rusty_shiv',
    name: 'Rusty Shiv',
    type: 'dagger',
    rarity: 'common',
    icon: '🗡️',
    damageMin: 3,
    damageMax: 6,
    lightStaminaCost: 6,
    heavyStaminaCost: 14,
    accuracyMod: 10,
    critChanceMod: 15,
    speedMod: 3,
    effects: [
      { type: 'bleed', chance: 0.2, value: 2, description: 'Causes infection-prone cuts' }
    ],
    damageDescription: 'Light: Quick stab. Heavy: Targeted vital strike.',
    lore: 'Prison-made but deadly.',
    price: 20,
    sellPrice: 7,
    leagueMin: 'bronze'
  },
  {
    id: 'assassins_blade',
    name: 'Assassin\'s Blade',
    type: 'dagger',
    rarity: 'uncommon',
    icon: '🗡️',
    damageMin: 5,
    damageMax: 9,
    lightStaminaCost: 7,
    heavyStaminaCost: 15,
    accuracyMod: 15,
    critChanceMod: 25,
    speedMod: 4,
    effects: [
      { type: 'crit_bonus', chance: 1, value: 20, description: '+20% crit damage' },
      { type: 'bleed', chance: 0.3, value: 3, description: 'Precise cuts bleed heavily' }
    ],
    damageDescription: 'Light: Surgical cut. Heavy: Vital strike with massive crit chance.',
    lore: 'Silent and deadly.',
    price: 140,
    sellPrice: 48,
    leagueMin: 'bronze'
  },
  {
    id: 'venom_fang',
    name: 'Venom Fang',
    type: 'dagger',
    rarity: 'rare',
    icon: '🗡️',
    damageMin: 6,
    damageMax: 11,
    lightStaminaCost: 8,
    heavyStaminaCost: 16,
    accuracyMod: 12,
    critChanceMod: 20,
    speedMod: 4,
    effects: [
      { type: 'poison', chance: 0.4, value: 4, description: '40% poison that deals 4/turn' },
      { type: 'crit_bonus', chance: 1, value: 15, description: 'Extra crit damage' }
    ],
    damageDescription: 'Light: Poisoned nick. Heavy: Deep venomous stab.',
    lore: 'The poison does the work.',
    price: 280,
    sellPrice: 95,
    leagueMin: 'silver'
  },
  {
    id: 'shadowstrike',
    name: 'Shadowstrike',
    type: 'dagger',
    rarity: 'epic',
    icon: '🗡️',
    damageMin: 8,
    damageMax: 14,
    lightStaminaCost: 8,
    heavyStaminaCost: 18,
    accuracyMod: 18,
    critChanceMod: 35,
    speedMod: 5,
    effects: [
      { type: 'crit_bonus', chance: 1, value: 40, description: '+40% crit damage' },
      { type: 'bleed', chance: 0.5, value: 5, description: 'Devastating bleeds on crit' },
      { type: 'momentum_gain', chance: 0.4, value: 1, description: 'Builds momentum quickly' }
    ],
    damageDescription: 'Light: Lightning-fast slash. Heavy: Devastating backstab with massive crit.',
    lore: 'They never see it coming.',
    price: 500,
    sellPrice: 170,
    leagueMin: 'gold'
  },

  // ========== GREATSWORDS ==========
  {
    id: 'crude_zweihander',
    name: 'Crude Zweihander',
    type: 'greatsword',
    rarity: 'uncommon',
    icon: '⚔️',
    damageMin: 12,
    damageMax: 20,
    lightStaminaCost: 18,
    heavyStaminaCost: 38,
    accuracyMod: -10,
    critChanceMod: 5,
    speedMod: -3,
    effects: [
      { type: 'armor_break', chance: 0.3, value: 2, description: 'Weight breaks armor' }
    ],
    damageDescription: 'Light: Wide sweep. Heavy: Devastating overhead cleave.',
    lore: 'More steel than skill.',
    price: 150,
    sellPrice: 50,
    leagueMin: 'bronze'
  },
  {
    id: 'champions_greatsword',
    name: 'Champion\'s Greatsword',
    type: 'greatsword',
    rarity: 'rare',
    icon: '⚔️',
    damageMin: 16,
    damageMax: 26,
    lightStaminaCost: 20,
    heavyStaminaCost: 40,
    accuracyMod: -5,
    critChanceMod: 10,
    speedMod: -2,
    effects: [
      { type: 'armor_break', chance: 0.45, value: 3, description: 'Shatters defenses' },
      { type: 'momentum_gain', chance: 0.35, value: 2, description: 'Crowd loves big swings' }
    ],
    damageDescription: 'Light: Powerful sweep. Heavy: Arena-shaking cleave that destroys armor.',
    lore: 'Only the strong can wield it.',
    price: 300,
    sellPrice: 100,
    leagueMin: 'silver'
  },
  {
    id: 'doom_bringer',
    name: 'Doom Bringer',
    type: 'greatsword',
    rarity: 'legendary',
    icon: '⚔️',
    damageMin: 22,
    damageMax: 35,
    lightStaminaCost: 22,
    heavyStaminaCost: 45,
    accuracyMod: -5,
    critChanceMod: 15,
    speedMod: -3,
    effects: [
      { type: 'armor_break', chance: 0.6, value: 5, description: 'Absolute armor destruction' },
      { type: 'stun', chance: 0.25, value: 1, description: 'Impact stuns' },
      { type: 'momentum_gain', chance: 0.5, value: 3, description: 'Massive momentum on hit' }
    ],
    damageDescription: 'Light: Earth-shaking sweep. Heavy: Apocalyptic strike that ends fights.',
    lore: 'Forged from a fallen star.',
    price: 900,
    sellPrice: 300,
    leagueMin: 'gold'
  },

  // ========== FLAILS ==========
  {
    id: 'chain_flail',
    name: 'Chain Flail',
    type: 'flail',
    rarity: 'uncommon',
    icon: '⛓️',
    damageMin: 8,
    damageMax: 14,
    lightStaminaCost: 14,
    heavyStaminaCost: 28,
    accuracyMod: -8,
    critChanceMod: 5,
    speedMod: 0,
    effects: [
      { type: 'guard_crush', chance: 0.4, value: 60, description: 'Bypasses 60% of guard' }
    ],
    damageDescription: 'Light: Unpredictable swing. Heavy: Guard-ignoring smash.',
    lore: 'The chain finds a way.',
    price: 120,
    sellPrice: 40,
    leagueMin: 'bronze'
  },
  {
    id: 'spiked_flail',
    name: 'Spiked Flail',
    type: 'flail',
    rarity: 'rare',
    icon: '⛓️',
    damageMin: 11,
    damageMax: 18,
    lightStaminaCost: 15,
    heavyStaminaCost: 30,
    accuracyMod: -10,
    critChanceMod: 8,
    speedMod: -1,
    effects: [
      { type: 'guard_crush', chance: 0.5, value: 70, description: 'Almost ignores guard' },
      { type: 'bleed', chance: 0.25, value: 3, description: 'Spikes tear flesh' }
    ],
    damageDescription: 'Light: Whirling strike. Heavy: Devastating guard-bypassing blow.',
    lore: 'Impossible to block properly.',
    price: 220,
    sellPrice: 75,
    leagueMin: 'silver'
  },

  // ========== HAMMERS ==========
  {
    id: 'sledgehammer',
    name: 'Sledgehammer',
    type: 'hammer',
    rarity: 'uncommon',
    icon: '🔨',
    damageMin: 14,
    damageMax: 22,
    lightStaminaCost: 20,
    heavyStaminaCost: 42,
    accuracyMod: -15,
    critChanceMod: 0,
    speedMod: -4,
    effects: [
      { type: 'armor_break', chance: 0.6, value: 4, description: 'Massive armor break' },
      { type: 'stun', chance: 0.3, value: 1, description: 'Concussive force' }
    ],
    damageDescription: 'Light: Heavy swing. Heavy: Armor-obliterating smash.',
    lore: 'Built for demolition.',
    price: 180,
    sellPrice: 60,
    leagueMin: 'bronze'
  },
  {
    id: 'war_hammer',
    name: 'War Hammer',
    type: 'hammer',
    rarity: 'rare',
    icon: '🔨',
    damageMin: 18,
    damageMax: 28,
    lightStaminaCost: 22,
    heavyStaminaCost: 45,
    accuracyMod: -12,
    critChanceMod: 5,
    speedMod: -3,
    effects: [
      { type: 'armor_break', chance: 0.7, value: 5, description: 'Destroys all armor' },
      { type: 'stun', chance: 0.4, value: 1, description: 'High stun chance' },
      { type: 'guard_crush', chance: 0.5, value: 80, description: 'Nearly ignores guard' }
    ],
    damageDescription: 'Light: Crushing swing. Heavy: Earth-shattering blow that ignores defenses.',
    lore: 'The ultimate answer to armor.',
    price: 350,
    sellPrice: 120,
    leagueMin: 'silver'
  },
  {
    id: 'titans_maul',
    name: 'Titan\'s Maul',
    type: 'hammer',
    rarity: 'legendary',
    icon: '🔨',
    damageMin: 25,
    damageMax: 40,
    lightStaminaCost: 25,
    heavyStaminaCost: 50,
    accuracyMod: -15,
    critChanceMod: 10,
    speedMod: -5,
    effects: [
      { type: 'armor_break', chance: 1, value: 6, description: 'Guaranteed total armor break' },
      { type: 'stun', chance: 0.5, value: 2, description: '50% chance of 2-turn stun' },
      { type: 'guard_crush', chance: 1, value: 100, description: 'Completely ignores guard' }
    ],
    damageDescription: 'Light: Massive swing. Heavy: Unstoppable force that breaks everything.',
    lore: 'Said to be wielded by giants.',
    price: 1000,
    sellPrice: 335,
    leagueMin: 'gold'
  }
];

// Helper functions
export function getWeaponById(id: string): WeaponData | undefined {
  return WEAPONS_DATA.find(w => w.id === id);
}

export function getWeaponsByType(type: WeaponType): WeaponData[] {
  return WEAPONS_DATA.filter(w => w.type === type);
}

export function getWeaponsByRarity(rarity: ItemRarity): WeaponData[] {
  return WEAPONS_DATA.filter(w => w.rarity === rarity);
}

export function getWeaponsForLeague(league: 'bronze' | 'silver' | 'gold'): WeaponData[] {
  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  return WEAPONS_DATA.filter(w => leagueOrder.indexOf(w.leagueMin) <= leagueIdx);
}

export function calculateWeaponDamage(weapon: WeaponData): number {
  return Math.floor((weapon.damageMin + weapon.damageMax) / 2);
}

export function getWeaponEffectDescription(weapon: WeaponData): string {
  if (weapon.effects.length === 0) return 'No special effects';
  return weapon.effects.map(e => e.description).join(', ');
}
