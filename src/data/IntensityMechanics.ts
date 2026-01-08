/**
 * IntensityMechanics - Roguelike tension systems
 * Momentum, Wounds, Stances, Armor Break, Adrenaline
 */

// ========== MOMENTUM SYSTEM ==========
export interface MomentumState {
  current: number;       // 0-100
  maxMomentum: number;   // Usually 100
  gainRate: number;      // Multiplier for momentum gain
}

export const MOMENTUM_CONFIG = {
  // Gain amounts
  gainOnLightHit: 8,
  gainOnHeavyHit: 15,
  gainOnCrit: 10,
  gainOnParry: 12,
  gainOnDodge: 6,
  gainOnSpecial: 20,
  gainOnKill: 30,
  
  // Loss amounts
  lossOnMiss: -5,
  lossOnHit: -8,
  lossOnStagger: -15,
  lossPerTurn: -2,  // Natural decay
  
  // Spend thresholds
  burstCost: 50,         // Cost to do burst turn
  guaranteedCritCost: 40, // Cost for guaranteed crit
  
  // Effects
  burstDamageBonus: 0.25, // +25% damage during burst
  highMomentumThreshold: 70, // Above this, gain bonuses
  highMomentumDamageBonus: 0.1,
  highMomentumAccuracyBonus: 5
};

export interface MomentumAction {
  id: 'burst_turn' | 'guaranteed_crit' | 'momentum_strike';
  name: string;
  icon: string;
  cost: number;
  description: string;
  effect: string;
}

export const MOMENTUM_ACTIONS: MomentumAction[] = [
  {
    id: 'burst_turn',
    name: 'Burst Turn',
    icon: '⚡',
    cost: MOMENTUM_CONFIG.burstCost,
    description: 'Take an immediate extra action with +25% damage.',
    effect: 'Grants extra action this turn with bonus damage.'
  },
  {
    id: 'guaranteed_crit',
    name: 'Precision Strike',
    icon: '🎯',
    cost: MOMENTUM_CONFIG.guaranteedCritCost,
    description: 'Next attack is guaranteed to critically hit.',
    effect: 'Your next attack will be a critical hit.'
  },
  {
    id: 'momentum_strike',
    name: 'Momentum Strike',
    icon: '💥',
    cost: 30,
    description: 'Convert momentum into raw damage (+1 per 3 momentum).',
    effect: 'Adds bonus damage based on current momentum.'
  }
];

// ========== WOUND SYSTEM ==========
export type WoundSeverity = 'minor' | 'major' | 'critical';

export interface Wound {
  id: string;
  name: string;
  icon: string;
  severity: WoundSeverity;
  description: string;
  effects: WoundEffect[];
  triggerThreshold: number;  // HP percentage that triggers this wound
}

export interface WoundEffect {
  type: 'damage_penalty' | 'defense_penalty' | 'stamina_penalty' | 'speed_penalty' |
        'accuracy_penalty' | 'bleed_dot' | 'stun_chance' | 'focus_penalty';
  value: number;
}

export const WOUND_THRESHOLDS = {
  first: 75,   // First wound check at 75% HP
  second: 50,  // Second wound check at 50% HP
  third: 25    // Third wound check at 25% HP
};

export const WOUND_CHANCE = {
  light_attack: 0.15,
  heavy_attack: 0.30,
  critical: 0.45,
  special: 0.35
};

export const WOUNDS: Wound[] = [
  // Minor wounds
  {
    id: 'grazed',
    name: 'Grazed',
    icon: '🩸',
    severity: 'minor',
    description: 'A shallow cut. Bleeds slightly.',
    effects: [
      { type: 'bleed_dot', value: 2 }
    ],
    triggerThreshold: 75
  },
  {
    id: 'bruised',
    name: 'Bruised',
    icon: '🟣',
    severity: 'minor',
    description: 'Painful bruising.',
    effects: [
      { type: 'damage_penalty', value: -5 }
    ],
    triggerThreshold: 75
  },
  {
    id: 'winded',
    name: 'Winded',
    icon: '💨',
    severity: 'minor',
    description: 'Struggling to catch breath.',
    effects: [
      { type: 'stamina_penalty', value: -10 }
    ],
    triggerThreshold: 75
  },
  
  // Major wounds
  {
    id: 'deep_cut',
    name: 'Deep Cut',
    icon: '🩸',
    severity: 'major',
    description: 'A deep wound that bleeds heavily.',
    effects: [
      { type: 'bleed_dot', value: 5 },
      { type: 'damage_penalty', value: -8 }
    ],
    triggerThreshold: 50
  },
  {
    id: 'limping',
    name: 'Limping',
    icon: '🦿',
    severity: 'major',
    description: 'Leg injury. Movement impaired.',
    effects: [
      { type: 'speed_penalty', value: -3 },
      { type: 'accuracy_penalty', value: -10 }
    ],
    triggerThreshold: 50
  },
  {
    id: 'concussed',
    name: 'Concussed',
    icon: '💫',
    severity: 'major',
    description: 'Head trauma. Vision blurred.',
    effects: [
      { type: 'accuracy_penalty', value: -15 },
      { type: 'focus_penalty', value: -20 }
    ],
    triggerThreshold: 50
  },
  {
    id: 'arm_wounded',
    name: 'Arm Wounded',
    icon: '💪',
    severity: 'major',
    description: 'Arm injury. Attacks weakened.',
    effects: [
      { type: 'damage_penalty', value: -15 }
    ],
    triggerThreshold: 50
  },
  
  // Critical wounds
  {
    id: 'hemorrhaging',
    name: 'Hemorrhaging',
    icon: '🩸',
    severity: 'critical',
    description: 'Severe bleeding. Life draining fast.',
    effects: [
      { type: 'bleed_dot', value: 10 }
    ],
    triggerThreshold: 25
  },
  {
    id: 'crippled',
    name: 'Crippled',
    icon: '🦯',
    severity: 'critical',
    description: 'Barely able to stand.',
    effects: [
      { type: 'speed_penalty', value: -5 },
      { type: 'accuracy_penalty', value: -20 },
      { type: 'damage_penalty', value: -10 }
    ],
    triggerThreshold: 25
  },
  {
    id: 'seeing_stars',
    name: 'Seeing Stars',
    icon: '⭐',
    severity: 'critical',
    description: 'On the verge of unconsciousness.',
    effects: [
      { type: 'stun_chance', value: 25 },
      { type: 'accuracy_penalty', value: -25 }
    ],
    triggerThreshold: 25
  }
];

// ========== STANCE SYSTEM ==========
export type StanceType = 'aggressive' | 'balanced' | 'defensive';

export interface Stance {
  id: StanceType;
  name: string;
  icon: string;
  description: string;
  effects: {
    damageBonus: number;
    defenseBonus: number;
    guardBonus: number;
    dodgeBonus: number;
    staminaCostMod: number;
    accuracyBonus: number;
  };
}

export const STANCES: Record<StanceType, Stance> = {
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    icon: '⚔️',
    description: 'All-out attack. More damage, less defense.',
    effects: {
      damageBonus: 20,
      defenseBonus: -15,
      guardBonus: -20,
      dodgeBonus: -10,
      staminaCostMod: 10,
      accuracyBonus: 5
    }
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    icon: '⚖️',
    description: 'No bonuses or penalties. Standard fighting.',
    effects: {
      damageBonus: 0,
      defenseBonus: 0,
      guardBonus: 0,
      dodgeBonus: 0,
      staminaCostMod: 0,
      accuracyBonus: 0
    }
  },
  defensive: {
    id: 'defensive',
    name: 'Defensive',
    icon: '🛡️',
    description: 'Focus on defense. Better guard and dodge, less damage.',
    effects: {
      damageBonus: -15,
      defenseBonus: 20,
      guardBonus: 25,
      dodgeBonus: 15,
      staminaCostMod: -5,
      accuracyBonus: -5
    }
  }
};

// ========== ARMOR BREAK SYSTEM ==========
export interface ArmorBreakState {
  stacks: number;
  maxStacks: number;
  defenseReductionPerStack: number;
}

export const ARMOR_BREAK_CONFIG = {
  maxStacks: 10,
  defenseReductionPerStack: 8,  // Each stack = -8% defense
  decayPerTurn: 1,              // Lose 1 stack per turn
  
  // Thresholds for visual effects
  minorBreak: 3,
  majorBreak: 6,
  criticalBreak: 9
};

export function calculateArmorBreakPenalty(stacks: number): number {
  return Math.min(stacks, ARMOR_BREAK_CONFIG.maxStacks) * ARMOR_BREAK_CONFIG.defenseReductionPerStack;
}

// ========== ADRENALINE SYSTEM ==========
export interface AdrenalineState {
  available: boolean;
  used: boolean;
  triggerThreshold: number;  // HP percentage
}

export const ADRENALINE_CONFIG = {
  triggerThreshold: 20,  // Below 20% HP
  
  // Last Stand effect
  lastStandDamageBonus: 50,
  lastStandDefenseBonus: 20,
  lastStandDuration: 3,  // Turns
  lastStandFatigueCost: 25,  // Fatigue added after fight
  
  // Second Wind effect (alternative)
  secondWindHealPercent: 25,
  secondWindStaminaRestore: 50
};

export interface AdrenalineChoice {
  id: 'last_stand' | 'second_wind';
  name: string;
  icon: string;
  description: string;
  effect: string;
  fatigueCost: number;
}

export const ADRENALINE_CHOICES: AdrenalineChoice[] = [
  {
    id: 'last_stand',
    name: 'Last Stand',
    icon: '🔥',
    description: 'Fight with everything you have. +50% damage, +20% defense for 3 turns.',
    effect: 'Massive combat boost but adds fatigue after fight.',
    fatigueCost: ADRENALINE_CONFIG.lastStandFatigueCost
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    icon: '💨',
    description: 'Catch your breath. Heal 25% HP and restore 50 stamina.',
    effect: 'Recovery option for survival.',
    fatigueCost: 15
  }
];

// ========== ENEMY ENRAGE SYSTEM ==========
export interface EnrageState {
  active: boolean;
  threshold: number;
  triggered: boolean;
}

export const ENRAGE_CONFIG = {
  defaultThreshold: 35,  // Below 35% HP
  
  // Effects when enraged
  damageBonus: 25,
  speedBonus: 2,
  accuracyPenalty: -10,
  defensePenalty: -10,
  
  // Visual
  enrageMessage: 'becomes ENRAGED!',
  enrageIcon: '😡'
};

// ========== HELPER FUNCTIONS ==========

export function rollForWound(severity: WoundSeverity, attackType: string, isCrit: boolean): Wound | null {
  const baseChance = WOUND_CHANCE[attackType as keyof typeof WOUND_CHANCE] || 0.2;
  const chance = isCrit ? baseChance + 0.15 : baseChance;
  
  if (Math.random() < chance) {
    const wounds = WOUNDS.filter(w => w.severity === severity);
    return wounds[Math.floor(Math.random() * wounds.length)];
  }
  
  return null;
}

export function getWoundsBySeverity(severity: WoundSeverity): Wound[] {
  return WOUNDS.filter(w => w.severity === severity);
}

export function calculateWoundEffects(wounds: Wound[]): Record<string, number> {
  const totals: Record<string, number> = {};
  
  for (const wound of wounds) {
    for (const effect of wound.effects) {
      totals[effect.type] = (totals[effect.type] || 0) + effect.value;
    }
  }
  
  return totals;
}

export function getMomentumActionById(id: string): MomentumAction | undefined {
  return MOMENTUM_ACTIONS.find(a => a.id === id);
}

export function canAffordMomentumAction(momentum: number, action: MomentumAction): boolean {
  return momentum >= action.cost;
}

/**
 * Get combined wound effects for power calculation
 */
export function getWoundEffects(wounds: Wound[]): {
  damage_penalty: number;
  defense_penalty: number;
  accuracy_penalty: number;
  stamina_penalty: number;
  speed_penalty: number;
  bleed_dot: number;
} {
  const effects = {
    damage_penalty: 0,
    defense_penalty: 0,
    accuracy_penalty: 0,
    stamina_penalty: 0,
    speed_penalty: 0,
    bleed_dot: 0
  };
  
  for (const wound of wounds) {
    for (const effect of wound.effects) {
      if (effect.type in effects) {
        (effects as Record<string, number>)[effect.type] += effect.value;
      }
    }
  }
  
  return effects;
}
