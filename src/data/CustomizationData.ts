/**
 * CustomizationData - Fighter customization options
 * Includes cosmetic choices, combat philosophies, backgrounds, and starting techniques
 */

// ========== COMBAT PHILOSOPHIES ==========
// One-time choice that affects combat style

export interface CombatPhilosophy {
  id: string;
  name: string;
  icon: string;
  description: string;
  effects: {
    damageBonus?: number;
    defenseBonus?: number;
    guardBonus?: number;
    critBonus?: number;
    dodgeBonus?: number;
    maxHPBonus?: number;
    staminaBonus?: number;
  };
  drawback: string;
}

export const COMBAT_PHILOSOPHIES: CombatPhilosophy[] = [
  {
    id: 'aggressive',
    name: 'Aggressive',
    icon: '⚔️',
    description: 'Strike first, strike hard. Offense is the best defense.',
    effects: {
      damageBonus: 8,
      guardBonus: -10
    },
    drawback: '-10% guard effectiveness'
  },
  {
    id: 'defensive',
    name: 'Defensive',
    icon: '🛡️',
    description: 'Patience wins battles. Wait for openings.',
    effects: {
      guardBonus: 15,
      damageBonus: -5
    },
    drawback: '-5 damage'
  },
  {
    id: 'opportunist',
    name: 'Opportunist',
    icon: '🎯',
    description: 'Exploit weaknesses. Every opening is a chance to strike.',
    effects: {
      critBonus: 8,
      dodgeBonus: 5,
      maxHPBonus: -10
    },
    drawback: '-10 max HP'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: '⚖️',
    description: 'Adapt to any situation. No extremes.',
    effects: {
      damageBonus: 3,
      defenseBonus: 3,
      staminaBonus: 5
    },
    drawback: 'No significant bonuses'
  }
];

// ========== BACKGROUNDS ==========
// Provides flavor + small perk + small drawback

export interface Background {
  id: string;
  name: string;
  icon: string;
  description: string;
  perk: string;
  perkEffect: {
    statBonus?: { stat: string; value: number };
    special?: string;
  };
  drawback: string;
  drawbackEffect: {
    statPenalty?: { stat: string; value: number };
    special?: string;
  };
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'soldier',
    name: 'Former Soldier',
    icon: '🪖',
    description: 'You served in the army before the arena called.',
    perk: '+5 Defense, trained in formation fighting',
    perkEffect: { statBonus: { stat: 'defense', value: 5 } },
    drawback: 'Lower evasion from rigid training',
    drawbackEffect: { statPenalty: { stat: 'evasion', value: -3 } }
  },
  {
    id: 'street_fighter',
    name: 'Street Fighter',
    icon: '👊',
    description: 'Grew up scrapping in alleys. No rules.',
    perk: '+5 Crit chance, dirty fighting instincts',
    perkEffect: { statBonus: { stat: 'critChance', value: 5 } },
    drawback: 'Less disciplined defense',
    drawbackEffect: { statPenalty: { stat: 'defense', value: -2 } }
  },
  {
    id: 'noble',
    name: 'Disgraced Noble',
    icon: '👑',
    description: 'Once wealthy, now seeking glory to restore honor.',
    perk: '+10% starting gold, trained in fencing',
    perkEffect: { statBonus: { stat: 'accuracy', value: 5 }, special: 'extra_gold' },
    drawback: 'Lower max HP from soft upbringing',
    drawbackEffect: { statPenalty: { stat: 'maxHP', value: -5 } }
  },
  {
    id: 'farmer',
    name: 'Farm Hand',
    icon: '🌾',
    description: 'Years of hard labor built endurance.',
    perk: '+15 Stamina, tireless worker',
    perkEffect: { statBonus: { stat: 'maxStamina', value: 15 } },
    drawback: 'Slow reactions from rural life',
    drawbackEffect: { statPenalty: { stat: 'speed', value: -2 } }
  },
  {
    id: 'hunter',
    name: 'Hunter',
    icon: '🏹',
    description: 'Tracked prey through wilderness for years.',
    perk: '+10 Accuracy, patient stalker',
    perkEffect: { statBonus: { stat: 'accuracy', value: 10 } },
    drawback: 'Less raw power',
    drawbackEffect: { statPenalty: { stat: 'attack', value: -2 } }
  },
  {
    id: 'pit_slave',
    name: 'Pit Slave',
    icon: '⛓️',
    description: 'Forced to fight since childhood. Survival instinct.',
    perk: '+10 Max HP, hardened survivor',
    perkEffect: { statBonus: { stat: 'maxHP', value: 10 } },
    drawback: 'Emotional scars affect focus',
    drawbackEffect: { statPenalty: { stat: 'maxFocus', value: -5 } }
  }
];

// ========== STARTING TECHNIQUES ==========
// A small ability/modifier that affects early combat

export interface StartingTechnique {
  id: string;
  name: string;
  icon: string;
  description: string;
  effect: string;
  mechanicType: 'passive' | 'active' | 'trigger';
  modifier: {
    type: string;
    value: number;
  };
}

export const STARTING_TECHNIQUES: StartingTechnique[] = [
  {
    id: 'quick_feet',
    name: 'Quick Feet',
    icon: '👟',
    description: 'Dodge costs less stamina.',
    effect: '-3 stamina cost for dodge actions',
    mechanicType: 'passive',
    modifier: { type: 'dodge_cost', value: -3 }
  },
  {
    id: 'heavy_hitter',
    name: 'Heavy Hitter',
    icon: '💪',
    description: 'Heavy attacks hit harder but cost more.',
    effect: '+15% heavy attack damage, +5 stamina cost',
    mechanicType: 'passive',
    modifier: { type: 'heavy_damage', value: 15 }
  },
  {
    id: 'counter_stance',
    name: 'Counter Stance',
    icon: '↩️',
    description: 'Successful parries deal small retaliation damage.',
    effect: 'Parry deals 3 damage back',
    mechanicType: 'trigger',
    modifier: { type: 'parry_counter', value: 3 }
  },
  {
    id: 'adrenaline_surge',
    name: 'Adrenaline Surge',
    icon: '⚡',
    description: 'Gain momentum faster when hit.',
    effect: '+50% momentum gain when taking damage',
    mechanicType: 'passive',
    modifier: { type: 'momentum_on_hit', value: 50 }
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    icon: '🧱',
    description: 'First hit each fight deals reduced damage.',
    effect: 'First damage taken reduced by 30%',
    mechanicType: 'trigger',
    modifier: { type: 'first_hit_reduction', value: 30 }
  },
  {
    id: 'opening_strike',
    name: 'Opening Strike',
    icon: '🎪',
    description: 'First attack of fight has bonus crit chance.',
    effect: '+25% crit chance on first attack',
    mechanicType: 'trigger',
    modifier: { type: 'first_attack_crit', value: 25 }
  }
];

// ========== COSMETIC OPTIONS ==========

export interface CosmeticOptions {
  // Name editing
  firstName: string;
  lastName: string;
  nickname: string;
  
  // Portrait parts (indices)
  faceIndex: number;
  eyeIndex: number;
  hairIndex: number;
  beardIndex: number;
  scarIndex: number;
  warpaintIndex: number;
  hoodIndex: number;
  
  // Colors
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  accentColor: string; // Cloak/banner color
}

export const DEFAULT_COSMETICS: CosmeticOptions = {
  firstName: '',
  lastName: '',
  nickname: '',
  faceIndex: 0,
  eyeIndex: 0,
  hairIndex: 0,
  beardIndex: 0,
  scarIndex: 0,
  warpaintIndex: 0,
  hoodIndex: 0,
  skinTone: '#d4a574',
  hairColor: '#3d2314',
  eyeColor: '#5a4a3a',
  accentColor: '#8b0000'
};

// Available colors for customization
export const SKIN_TONES = ['#f5d0b9', '#e8c4a8', '#d4a574', '#a67c52', '#8b5a3c', '#5c3d2e', '#3b2417'];
export const HAIR_COLORS = ['#1a1a1a', '#3d2314', '#6b4423', '#8b6914', '#a08060', '#c0c0c0', '#8b0000', '#4a0080'];
export const EYE_COLORS = ['#3d2314', '#5a4a3a', '#3388cc', '#228b22', '#8b4513', '#4a0080'];
export const ACCENT_COLORS = ['#8b0000', '#00008b', '#006400', '#4b0082', '#daa520', '#2f4f4f', '#800080', '#ff4500'];

// Number of options for each part
export const PORTRAIT_PART_COUNTS = {
  face: 6,
  eyes: 5,
  hair: 8,
  beard: 6,
  scar: 4,
  warpaint: 5,
  hood: 4
};

// ========== HELPER FUNCTIONS ==========

export function getPhilosophy(id: string): CombatPhilosophy | undefined {
  return COMBAT_PHILOSOPHIES.find(p => p.id === id);
}

export function getBackground(id: string): Background | undefined {
  return BACKGROUNDS.find(b => b.id === id);
}

export function getTechnique(id: string): StartingTechnique | undefined {
  return STARTING_TECHNIQUES.find(t => t.id === id);
}

/**
 * Apply philosophy effects to fighter stats
 */
export function applyPhilosophyEffects(
  stats: Record<string, number>,
  philosophyId: string
): Record<string, number> {
  const philosophy = getPhilosophy(philosophyId);
  if (!philosophy) return stats;
  
  const result = { ...stats };
  const effects = philosophy.effects;
  
  if (effects.damageBonus) result.attack = (result.attack || 0) + effects.damageBonus;
  if (effects.defenseBonus) result.defense = (result.defense || 0) + effects.defenseBonus;
  if (effects.guardBonus) result.guard = (result.guard || 0) + effects.guardBonus;
  if (effects.critBonus) result.critChance = (result.critChance || 0) + effects.critBonus;
  if (effects.dodgeBonus) result.evasion = (result.evasion || 0) + effects.dodgeBonus;
  if (effects.maxHPBonus) result.maxHP = (result.maxHP || 0) + effects.maxHPBonus;
  if (effects.staminaBonus) result.maxStamina = (result.maxStamina || 0) + effects.staminaBonus;
  
  return result;
}

/**
 * Apply background effects to fighter stats
 */
export function applyBackgroundEffects(
  stats: Record<string, number>,
  backgroundId: string
): Record<string, number> {
  const background = getBackground(backgroundId);
  if (!background) return stats;
  
  const result = { ...stats };
  
  // Apply perk
  if (background.perkEffect.statBonus) {
    const { stat, value } = background.perkEffect.statBonus;
    result[stat] = (result[stat] || 0) + value;
  }
  
  // Apply drawback
  if (background.drawbackEffect.statPenalty) {
    const { stat, value } = background.drawbackEffect.statPenalty;
    result[stat] = (result[stat] || 0) + value;
  }
  
  return result;
}

/**
 * Randomize cosmetic options
 */
export function randomizeCosmetics(): Partial<CosmeticOptions> {
  return {
    faceIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.face),
    eyeIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.eyes),
    hairIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.hair),
    beardIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.beard),
    scarIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.scar),
    warpaintIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.warpaint),
    hoodIndex: Math.floor(Math.random() * PORTRAIT_PART_COUNTS.hood),
    skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
    accentColor: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
  };
}

/**
 * Calculate stat delta from customization choices
 */
export function calculateCustomizationDeltas(
  philosophyId: string | null,
  backgroundId: string | null
): Record<string, number> {
  const deltas: Record<string, number> = {};
  
  if (philosophyId) {
    const philosophy = getPhilosophy(philosophyId);
    if (philosophy) {
      const effects = philosophy.effects;
      if (effects.damageBonus) deltas.attack = (deltas.attack || 0) + effects.damageBonus;
      if (effects.defenseBonus) deltas.defense = (deltas.defense || 0) + effects.defenseBonus;
      if (effects.guardBonus) deltas.guard = (deltas.guard || 0) + effects.guardBonus;
      if (effects.critBonus) deltas.critChance = (deltas.critChance || 0) + effects.critBonus;
      if (effects.dodgeBonus) deltas.evasion = (deltas.evasion || 0) + effects.dodgeBonus;
      if (effects.maxHPBonus) deltas.maxHP = (deltas.maxHP || 0) + effects.maxHPBonus;
      if (effects.staminaBonus) deltas.maxStamina = (deltas.maxStamina || 0) + effects.staminaBonus;
    }
  }
  
  if (backgroundId) {
    const background = getBackground(backgroundId);
    if (background) {
      if (background.perkEffect.statBonus) {
        const { stat, value } = background.perkEffect.statBonus;
        deltas[stat] = (deltas[stat] || 0) + value;
      }
      if (background.drawbackEffect.statPenalty) {
        const { stat, value } = background.drawbackEffect.statPenalty;
        deltas[stat] = (deltas[stat] || 0) + value;
      }
    }
  }
  
  return deltas;
}
