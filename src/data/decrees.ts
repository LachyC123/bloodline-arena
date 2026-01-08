/**
 * Arena Decrees - Stackable run modifiers
 * Each decree changes game rules and increases rewards
 */

export interface DecreeMods {
  // Player modifiers
  playerDamageMod?: number;       // +/- %
  playerDefenseMod?: number;      // +/- %
  healingMod?: number;            // +/- % (affects healing items/abilities)
  staminaRegenMod?: number;       // +/- %
  parryWindowMod?: number;        // +/- %
  dodgeMod?: number;              // +/- %
  woundChanceMod?: number;        // +/- % (chance to receive wounds)
  maxHPMod?: number;              // +/- %
  startingStaminaMod?: number;    // +/- flat
  
  // Enemy modifiers
  enemyDamageMod?: number;        // +/- %
  enemyHPMod?: number;            // +/- %
  enemyDefenseMod?: number;       // +/- %
  enemyMomentumGain?: number;     // +/- flat
  enemyWoundChanceMod?: number;   // +/- %
  enemyAggressionMod?: number;    // +/- % (affects AI weights)
  
  // Economy modifiers
  goldMod?: number;               // +/- % gold rewards
  lootRarityMod?: number;         // +/- tiers on loot
  affixTierBoost?: number;        // +/- tiers on affix rolls
  shopPriceMod?: number;          // +/- % shop prices
  
  // Combat rules
  noHealing?: boolean;            // No healing during fights
  noDodge?: boolean;              // Cannot dodge
  noParry?: boolean;              // Cannot parry
  armorBreakPotent?: boolean;     // Armor break 2x effective
  critDamageMod?: number;         // +/- % crit damage (both sides)
  bleedStacksMod?: number;        // +/- max bleed stacks
  momentumCapMod?: number;        // +/- momentum cap
  turnLimitPerFight?: number;     // Optional turn limit
}

export interface Decree {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficultyValue: number;        // 1-5, affects rewards
  tags: string[];
  mods: DecreeMods;
  exclusionTags?: string[];       // Can't stack with decrees having these tags
}

export const DECREES: Decree[] = [
  // ========== DIFFICULTY 1 (MILD) ==========
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    icon: '🛡️',
    description: 'Enemies have +10% HP, but you gain +5% defense.',
    difficultyValue: 1,
    tags: ['defense', 'enemy_hp'],
    mods: {
      enemyHPMod: 10,
      playerDefenseMod: 5
    }
  },
  {
    id: 'hungry_crowd',
    name: 'Hungry Crowd',
    icon: '👥',
    description: 'Fights give +15% gold, but enemies deal +5% damage.',
    difficultyValue: 1,
    tags: ['gold', 'enemy_damage'],
    mods: {
      goldMod: 15,
      enemyDamageMod: 5
    }
  },
  {
    id: 'sharp_weapons',
    name: 'Sharp Weapons',
    icon: '🗡️',
    description: 'All attacks deal +10% damage (both sides).',
    difficultyValue: 1,
    tags: ['damage', 'symmetric'],
    mods: {
      playerDamageMod: 10,
      enemyDamageMod: 10
    }
  },
  {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    icon: '💎',
    description: 'Better loot rarity, but shop prices +10%.',
    difficultyValue: 1,
    tags: ['loot', 'shop'],
    mods: {
      lootRarityMod: 1,
      shopPriceMod: 10
    }
  },
  {
    id: 'adrenaline_junkie',
    name: 'Adrenaline Junkie',
    icon: '⚡',
    description: 'Start with +20 momentum, but enemies +15% more aggressive.',
    difficultyValue: 1,
    tags: ['momentum', 'enemy_ai'],
    mods: {
      startingStaminaMod: 10,
      enemyAggressionMod: 15
    }
  },
  
  // ========== DIFFICULTY 2 (MODERATE) ==========
  {
    id: 'blood_sport',
    name: 'Blood Sport',
    icon: '🩸',
    description: 'Bleed stacks +1 max, enemies also bleed more.',
    difficultyValue: 2,
    tags: ['bleed'],
    mods: {
      bleedStacksMod: 1,
      goldMod: 10
    }
  },
  {
    id: 'heavyweight',
    name: 'Heavyweight',
    icon: '🏋️',
    description: 'Enemies have +20% HP, loot rarity +1.',
    difficultyValue: 2,
    tags: ['enemy_hp', 'loot'],
    mods: {
      enemyHPMod: 20,
      lootRarityMod: 1
    }
  },
  {
    id: 'relentless_foes',
    name: 'Relentless Foes',
    icon: '😤',
    description: 'Enemies gain +2 momentum per action, +20% gold.',
    difficultyValue: 2,
    tags: ['enemy_momentum', 'gold'],
    mods: {
      enemyMomentumGain: 2,
      goldMod: 20
    }
  },
  {
    id: 'fragile',
    name: 'Fragile',
    icon: '💔',
    description: '-15% max HP, but +20% damage.',
    difficultyValue: 2,
    tags: ['hp', 'damage'],
    mods: {
      maxHPMod: -15,
      playerDamageMod: 20
    }
  },
  {
    id: 'crowd_favorite',
    name: 'Crowd Favorite',
    icon: '🌟',
    description: 'Crits deal +25% damage (both sides), +15% gold.',
    difficultyValue: 2,
    tags: ['crit', 'gold'],
    mods: {
      critDamageMod: 25,
      goldMod: 15
    }
  },
  {
    id: 'quick_reflexes',
    name: 'Quick Reflexes',
    icon: '💨',
    description: '+15% parry window, but -10% stamina regen.',
    difficultyValue: 2,
    tags: ['parry', 'stamina'],
    mods: {
      parryWindowMod: 15,
      staminaRegenMod: -10
    }
  },
  {
    id: 'fortune_seeker',
    name: 'Fortune Seeker',
    icon: '🍀',
    description: '+25% gold, +1 affix tier chance, enemies +10% damage.',
    difficultyValue: 2,
    tags: ['gold', 'affix', 'enemy_damage'],
    mods: {
      goldMod: 25,
      affixTierBoost: 1,
      enemyDamageMod: 10
    }
  },
  
  // ========== DIFFICULTY 3 (HARD) ==========
  {
    id: 'no_mercy',
    name: 'No Mercy',
    icon: '☠️',
    description: 'Enemies deal +20% damage, but +30% gold.',
    difficultyValue: 3,
    tags: ['enemy_damage', 'gold'],
    mods: {
      enemyDamageMod: 20,
      goldMod: 30
    }
  },
  {
    id: 'brutal_arena',
    name: 'Brutal Arena',
    icon: '🏟️',
    description: 'Both sides +50% wound chance, +2 loot rarity.',
    difficultyValue: 3,
    tags: ['wound', 'loot'],
    mods: {
      woundChanceMod: 50,
      enemyWoundChanceMod: 50,
      lootRarityMod: 2
    }
  },
  {
    id: 'armor_piercing',
    name: 'Armor Piercing',
    icon: '🛠️',
    description: 'Armor break 2x effective, enemies +15% defense.',
    difficultyValue: 3,
    tags: ['armor_break', 'enemy_defense'],
    mods: {
      armorBreakPotent: true,
      enemyDefenseMod: 15
    }
  },
  {
    id: 'stamina_tax',
    name: 'Stamina Tax',
    icon: '😰',
    description: '-25% stamina regen, +35% gold.',
    difficultyValue: 3,
    tags: ['stamina', 'gold'],
    mods: {
      staminaRegenMod: -25,
      goldMod: 35
    }
  },
  {
    id: 'resilient_foes',
    name: 'Resilient Foes',
    icon: '🦾',
    description: 'Enemies +25% HP and +10% defense, +2 affix tiers.',
    difficultyValue: 3,
    tags: ['enemy_hp', 'enemy_defense', 'affix'],
    mods: {
      enemyHPMod: 25,
      enemyDefenseMod: 10,
      affixTierBoost: 2
    }
  },
  {
    id: 'glass_arena',
    name: 'Glass Arena',
    icon: '🔮',
    description: 'All damage +30%, -20% HP (both sides).',
    difficultyValue: 3,
    tags: ['damage', 'hp', 'symmetric'],
    mods: {
      playerDamageMod: 30,
      enemyDamageMod: 30,
      maxHPMod: -20
    }
  },
  
  // ========== DIFFICULTY 4 (VERY HARD) ==========
  {
    id: 'no_rest',
    name: 'No Rest',
    icon: '🚫',
    description: 'Cannot heal during fights. +40% gold, +2 loot rarity.',
    difficultyValue: 4,
    tags: ['no_heal', 'gold', 'loot'],
    mods: {
      noHealing: true,
      goldMod: 40,
      lootRarityMod: 2
    },
    exclusionTags: ['heal_focus']
  },
  {
    id: 'dodge_or_die',
    name: 'Dodge or Die',
    icon: '🎯',
    description: 'Cannot parry, +25% dodge, +50% gold.',
    difficultyValue: 4,
    tags: ['no_parry', 'dodge', 'gold'],
    mods: {
      noParry: true,
      dodgeMod: 25,
      goldMod: 50
    },
    exclusionTags: ['parry_focus']
  },
  {
    id: 'stand_and_fight',
    name: 'Stand and Fight',
    icon: '🗡️',
    description: 'Cannot dodge, +25% parry window, +50% gold.',
    difficultyValue: 4,
    tags: ['no_dodge', 'parry', 'gold'],
    mods: {
      noDodge: true,
      parryWindowMod: 25,
      goldMod: 50
    },
    exclusionTags: ['dodge_focus']
  },
  {
    id: 'elite_enemies',
    name: 'Elite Enemies',
    icon: '👑',
    description: 'Enemies +30% HP, +20% damage, always have 2 mutators.',
    difficultyValue: 4,
    tags: ['enemy_hp', 'enemy_damage', 'mutators'],
    mods: {
      enemyHPMod: 30,
      enemyDamageMod: 20,
      goldMod: 45,
      lootRarityMod: 1
    }
  },
  {
    id: 'time_pressure',
    name: 'Time Pressure',
    icon: '⏰',
    description: '20 turn limit per fight. +60% gold if you win.',
    difficultyValue: 4,
    tags: ['turn_limit', 'gold'],
    mods: {
      turnLimitPerFight: 20,
      goldMod: 60
    }
  },
  
  // ========== DIFFICULTY 5 (EXTREME) ==========
  {
    id: 'death_wish',
    name: 'Death Wish',
    icon: '💀',
    description: '-30% max HP, enemies +25% damage, but +75% gold and +3 loot rarity.',
    difficultyValue: 5,
    tags: ['hp', 'enemy_damage', 'gold', 'loot'],
    mods: {
      maxHPMod: -30,
      enemyDamageMod: 25,
      goldMod: 75,
      lootRarityMod: 3
    }
  },
  {
    id: 'champions_gauntlet',
    name: "Champion's Gauntlet",
    icon: '🏆',
    description: 'Enemies +40% HP and damage, but double gold and guaranteed epic loot.',
    difficultyValue: 5,
    tags: ['enemy_hp', 'enemy_damage', 'gold', 'loot'],
    mods: {
      enemyHPMod: 40,
      enemyDamageMod: 40,
      goldMod: 100,
      lootRarityMod: 3
    }
  },
  {
    id: 'cursed_arena',
    name: 'Cursed Arena',
    icon: '👻',
    description: 'All items gain curses, but curses are 50% less severe.',
    difficultyValue: 5,
    tags: ['curse', 'item'],
    mods: {
      affixTierBoost: 2,
      goldMod: 50
    }
  }
];

// ========== HELPER FUNCTIONS ==========

export function getDecreeById(id: string): Decree | undefined {
  return DECREES.find(d => d.id === id);
}

/**
 * Get random decrees for draft, respecting exclusions
 */
export function getDecreeDraftOptions(
  activeDecreeIds: string[],
  count: number = 3
): Decree[] {
  const activeDecrees = activeDecreeIds.map(id => getDecreeById(id)).filter(Boolean) as Decree[];
  const activeTags = new Set(activeDecrees.flatMap(d => d.tags));
  const activeExclusions = new Set(activeDecrees.flatMap(d => d.exclusionTags || []));
  
  // Filter out incompatible decrees
  const available = DECREES.filter(d => {
    // Already active
    if (activeDecreeIds.includes(d.id)) return false;
    
    // Excluded by active decree
    if (d.tags.some(t => activeExclusions.has(t))) return false;
    
    // Would exclude active decree
    if (d.exclusionTags?.some(t => activeTags.has(t))) return false;
    
    return true;
  });
  
  // Shuffle and pick
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Calculate total difficulty of active decrees
 */
export function calculateTotalDifficulty(decreeIds: string[]): number {
  return decreeIds.reduce((sum, id) => {
    const decree = getDecreeById(id);
    return sum + (decree?.difficultyValue || 0);
  }, 0);
}

/**
 * Calculate reward multiplier from decrees
 */
export function calculateDecreeRewardMultiplier(decreeIds: string[]): {
  goldMod: number;
  lootRarityMod: number;
  affixTierBoost: number;
} {
  const result = { goldMod: 0, lootRarityMod: 0, affixTierBoost: 0 };
  
  for (const id of decreeIds) {
    const decree = getDecreeById(id);
    if (decree) {
      result.goldMod += decree.mods.goldMod || 0;
      result.lootRarityMod += decree.mods.lootRarityMod || 0;
      result.affixTierBoost += decree.mods.affixTierBoost || 0;
    }
  }
  
  return result;
}

/**
 * Combine all decree mods into one object
 */
export function combineDecreeMods(decreeIds: string[]): DecreeMods {
  const combined: DecreeMods = {};
  
  for (const id of decreeIds) {
    const decree = getDecreeById(id);
    if (!decree) continue;
    
    const mods = decree.mods;
    
    // Additive number mods
    if (mods.playerDamageMod) combined.playerDamageMod = (combined.playerDamageMod || 0) + mods.playerDamageMod;
    if (mods.playerDefenseMod) combined.playerDefenseMod = (combined.playerDefenseMod || 0) + mods.playerDefenseMod;
    if (mods.healingMod) combined.healingMod = (combined.healingMod || 0) + mods.healingMod;
    if (mods.staminaRegenMod) combined.staminaRegenMod = (combined.staminaRegenMod || 0) + mods.staminaRegenMod;
    if (mods.parryWindowMod) combined.parryWindowMod = (combined.parryWindowMod || 0) + mods.parryWindowMod;
    if (mods.dodgeMod) combined.dodgeMod = (combined.dodgeMod || 0) + mods.dodgeMod;
    if (mods.woundChanceMod) combined.woundChanceMod = (combined.woundChanceMod || 0) + mods.woundChanceMod;
    if (mods.maxHPMod) combined.maxHPMod = (combined.maxHPMod || 0) + mods.maxHPMod;
    if (mods.startingStaminaMod) combined.startingStaminaMod = (combined.startingStaminaMod || 0) + mods.startingStaminaMod;
    if (mods.enemyDamageMod) combined.enemyDamageMod = (combined.enemyDamageMod || 0) + mods.enemyDamageMod;
    if (mods.enemyHPMod) combined.enemyHPMod = (combined.enemyHPMod || 0) + mods.enemyHPMod;
    if (mods.enemyDefenseMod) combined.enemyDefenseMod = (combined.enemyDefenseMod || 0) + mods.enemyDefenseMod;
    if (mods.enemyMomentumGain) combined.enemyMomentumGain = (combined.enemyMomentumGain || 0) + mods.enemyMomentumGain;
    if (mods.enemyWoundChanceMod) combined.enemyWoundChanceMod = (combined.enemyWoundChanceMod || 0) + mods.enemyWoundChanceMod;
    if (mods.enemyAggressionMod) combined.enemyAggressionMod = (combined.enemyAggressionMod || 0) + mods.enemyAggressionMod;
    if (mods.goldMod) combined.goldMod = (combined.goldMod || 0) + mods.goldMod;
    if (mods.lootRarityMod) combined.lootRarityMod = (combined.lootRarityMod || 0) + mods.lootRarityMod;
    if (mods.affixTierBoost) combined.affixTierBoost = (combined.affixTierBoost || 0) + mods.affixTierBoost;
    if (mods.shopPriceMod) combined.shopPriceMod = (combined.shopPriceMod || 0) + mods.shopPriceMod;
    if (mods.critDamageMod) combined.critDamageMod = (combined.critDamageMod || 0) + mods.critDamageMod;
    if (mods.bleedStacksMod) combined.bleedStacksMod = (combined.bleedStacksMod || 0) + mods.bleedStacksMod;
    if (mods.momentumCapMod) combined.momentumCapMod = (combined.momentumCapMod || 0) + mods.momentumCapMod;
    
    // Boolean mods (any true = true)
    if (mods.noHealing) combined.noHealing = true;
    if (mods.noDodge) combined.noDodge = true;
    if (mods.noParry) combined.noParry = true;
    if (mods.armorBreakPotent) combined.armorBreakPotent = true;
    
    // Take minimum turn limit
    if (mods.turnLimitPerFight) {
      combined.turnLimitPerFight = combined.turnLimitPerFight 
        ? Math.min(combined.turnLimitPerFight, mods.turnLimitPerFight)
        : mods.turnLimitPerFight;
    }
  }
  
  return combined;
}
