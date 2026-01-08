/**
 * Enemy Mutators - Class × Mutator combinations
 * Makes enemies feel different and keeps fights fresh
 */

export interface MutatorStatMods {
  hpMod?: number;          // +/- %
  damageMod?: number;      // +/- %
  defenseMod?: number;     // +/- %
  critMod?: number;        // +/- %
  dodgeMod?: number;       // +/- %
  parryMod?: number;       // +/- %
  staminaMod?: number;     // +/- %
  speedMod?: number;       // +/- %
}

export interface MutatorBehavior {
  aggressionMod?: number;  // +/- % (affects attack frequency)
  defensiveMod?: number;   // +/- % (affects guard/parry frequency)
  specialMod?: number;     // +/- % (affects special move frequency)
}

export interface MutatorSpecialRule {
  type: 'resistance' | 'vulnerability' | 'phase_trigger' | 'passive';
  trigger?: 'low_hp' | 'high_momentum' | 'start_of_fight' | 'on_hit';
  threshold?: number;      // For triggers (e.g., 25% HP)
  effect: string;
  value?: number;
}

export interface EnemyMutator {
  id: string;
  name: string;
  icon: string;
  description: string;
  shortWarning: string;    // 1-line combat warning
  weight: Record<string, number>;  // Weight by league
  statMods: MutatorStatMods;
  behaviorMods: MutatorBehavior;
  specialRules: MutatorSpecialRule[];
  tags: string[];
}

export const ENEMY_MUTATORS: EnemyMutator[] = [
  // ========== DEFENSIVE MUTATORS ==========
  {
    id: 'armored',
    name: 'Armored',
    icon: '🛡️',
    description: 'High defense, resistant to armor break',
    shortWarning: 'ARMORED: Guard is stronger',
    weight: { bronze: 30, silver: 25, gold: 20, champion: 15 },
    statMods: { defenseMod: 30, speedMod: -10 },
    behaviorMods: { defensiveMod: 20 },
    specialRules: [
      { type: 'resistance', effect: 'armor_break', value: -50 }
    ],
    tags: ['defense', 'slow']
  },
  {
    id: 'shielded',
    name: 'Shielded',
    icon: '🪖',
    description: 'Blocks first 3 hits, then shield breaks',
    shortWarning: 'SHIELDED: First 3 hits blocked',
    weight: { bronze: 25, silver: 30, gold: 25, champion: 20 },
    statMods: {},
    behaviorMods: { defensiveMod: 15 },
    specialRules: [
      { type: 'passive', effect: 'shield_charges', value: 3 }
    ],
    tags: ['defense', 'shield']
  },
  {
    id: 'evasive',
    name: 'Evasive',
    icon: '💨',
    description: 'High dodge, low HP',
    shortWarning: 'EVASIVE: Hard to hit',
    weight: { bronze: 20, silver: 25, gold: 30, champion: 30 },
    statMods: { dodgeMod: 40, hpMod: -20 },
    behaviorMods: { aggressionMod: -10 },
    specialRules: [
      { type: 'vulnerability', effect: 'stun', value: 25 }
    ],
    tags: ['dodge', 'glass']
  },
  {
    id: 'turtle',
    name: 'Turtle',
    icon: '🐢',
    description: 'Very defensive, counters after blocking',
    shortWarning: 'TURTLE: Counters after block',
    weight: { bronze: 20, silver: 25, gold: 25, champion: 20 },
    statMods: { defenseMod: 20, damageMod: -15 },
    behaviorMods: { defensiveMod: 40, aggressionMod: -30 },
    specialRules: [
      { type: 'passive', effect: 'counter_on_block', value: 8 }
    ],
    tags: ['defense', 'counter']
  },

  // ========== OFFENSIVE MUTATORS ==========
  {
    id: 'brutal',
    name: 'Brutal',
    icon: '💪',
    description: 'High damage, less defensive',
    shortWarning: 'BRUTAL: Hits hard',
    weight: { bronze: 30, silver: 30, gold: 25, champion: 20 },
    statMods: { damageMod: 25, defenseMod: -15 },
    behaviorMods: { aggressionMod: 25 },
    specialRules: [],
    tags: ['damage', 'aggressive']
  },
  {
    id: 'berserker',
    name: 'Berserker',
    icon: '🔥',
    description: 'Enrages at low HP: +50% damage',
    shortWarning: 'BERSERKER: Enrages at low HP',
    weight: { bronze: 25, silver: 30, gold: 30, champion: 25 },
    statMods: {},
    behaviorMods: {},
    specialRules: [
      { type: 'phase_trigger', trigger: 'low_hp', threshold: 30, effect: 'enrage', value: 50 }
    ],
    tags: ['damage', 'enrage']
  },
  {
    id: 'relentless',
    name: 'Relentless',
    icon: '⚡',
    description: 'Never tires, constant aggression',
    shortWarning: 'RELENTLESS: Never stops attacking',
    weight: { bronze: 20, silver: 25, gold: 30, champion: 30 },
    statMods: { staminaMod: 50 },
    behaviorMods: { aggressionMod: 35 },
    specialRules: [
      { type: 'passive', effect: 'stamina_regen', value: 10 }
    ],
    tags: ['stamina', 'aggressive']
  },
  {
    id: 'crusher',
    name: 'Crusher',
    icon: '🔨',
    description: 'Heavy attacks apply double armor break',
    shortWarning: 'CRUSHER: Destroys armor',
    weight: { bronze: 15, silver: 25, gold: 30, champion: 30 },
    statMods: { damageMod: 10 },
    behaviorMods: { aggressionMod: 15 },
    specialRules: [
      { type: 'passive', effect: 'double_armor_break', value: 1 }
    ],
    tags: ['armor_break', 'damage']
  },

  // ========== TACTICAL MUTATORS ==========
  {
    id: 'cunning',
    name: 'Cunning',
    icon: '🦊',
    description: 'Unpredictable, mixes attacks and dodges',
    shortWarning: 'CUNNING: Unpredictable moves',
    weight: { bronze: 15, silver: 25, gold: 30, champion: 35 },
    statMods: { dodgeMod: 15, critMod: 10 },
    behaviorMods: {},
    specialRules: [
      { type: 'passive', effect: 'random_action_bonus', value: 15 }
    ],
    tags: ['tactical', 'dodge', 'crit']
  },
  {
    id: 'patient',
    name: 'Patient',
    icon: '🧘',
    description: 'Waits for openings, devastating counters',
    shortWarning: 'PATIENT: Waits then strikes',
    weight: { bronze: 15, silver: 20, gold: 30, champion: 35 },
    statMods: { parryMod: 30, damageMod: 15 },
    behaviorMods: { defensiveMod: 25, aggressionMod: -20 },
    specialRules: [
      { type: 'passive', effect: 'parry_damage_bonus', value: 50 }
    ],
    tags: ['parry', 'counter', 'tactical']
  },
  {
    id: 'momentum_master',
    name: 'Momentum Master',
    icon: '🌊',
    description: 'Builds momentum faster, uses specials more',
    shortWarning: 'MOMENTUM: Builds power fast',
    weight: { bronze: 10, silver: 20, gold: 30, champion: 40 },
    statMods: {},
    behaviorMods: { specialMod: 30 },
    specialRules: [
      { type: 'passive', effect: 'momentum_gain', value: 3 }
    ],
    tags: ['momentum', 'special']
  },

  // ========== STATUS MUTATORS ==========
  {
    id: 'venomous',
    name: 'Venomous',
    icon: '🐍',
    description: 'Attacks apply poison',
    shortWarning: 'VENOMOUS: Poison on hit',
    weight: { bronze: 20, silver: 30, gold: 25, champion: 20 },
    statMods: { damageMod: -10 },
    behaviorMods: {},
    specialRules: [
      { type: 'passive', effect: 'poison_on_hit', value: 3 }
    ],
    tags: ['poison', 'status']
  },
  {
    id: 'bleeder',
    name: 'Bleeder',
    icon: '🩸',
    description: 'Attacks cause bleeding',
    shortWarning: 'BLEEDER: Causes bleed',
    weight: { bronze: 25, silver: 30, gold: 25, champion: 20 },
    statMods: {},
    behaviorMods: { aggressionMod: 10 },
    specialRules: [
      { type: 'passive', effect: 'bleed_on_hit', value: 2 }
    ],
    tags: ['bleed', 'status']
  },
  {
    id: 'stunning',
    name: 'Stunning',
    icon: '💫',
    description: 'Heavy attacks can stun',
    shortWarning: 'STUNNING: Can stun you',
    weight: { bronze: 15, silver: 25, gold: 30, champion: 30 },
    statMods: {},
    behaviorMods: { aggressionMod: 5 },
    specialRules: [
      { type: 'passive', effect: 'stun_on_heavy', value: 25 }
    ],
    tags: ['stun', 'status']
  },

  // ========== SPECIAL MUTATORS ==========
  {
    id: 'vampiric',
    name: 'Vampiric',
    icon: '🧛',
    description: 'Heals from damage dealt',
    shortWarning: 'VAMPIRIC: Heals on hit',
    weight: { bronze: 10, silver: 20, gold: 30, champion: 35 },
    statMods: { hpMod: -15 },
    behaviorMods: { aggressionMod: 20 },
    specialRules: [
      { type: 'passive', effect: 'lifesteal', value: 20 }
    ],
    tags: ['lifesteal', 'heal']
  },
  {
    id: 'thorny',
    name: 'Thorny',
    icon: '🌵',
    description: 'Reflects damage when hit',
    shortWarning: 'THORNY: Reflects damage',
    weight: { bronze: 15, silver: 25, gold: 30, champion: 25 },
    statMods: { defenseMod: 10 },
    behaviorMods: { defensiveMod: 10 },
    specialRules: [
      { type: 'passive', effect: 'thorns', value: 5 }
    ],
    tags: ['thorns', 'defense']
  },
  {
    id: 'regenerating',
    name: 'Regenerating',
    icon: '💚',
    description: 'Heals each turn',
    shortWarning: 'REGENERATING: Heals over time',
    weight: { bronze: 20, silver: 25, gold: 25, champion: 20 },
    statMods: { hpMod: 10 },
    behaviorMods: { defensiveMod: 15 },
    specialRules: [
      { type: 'passive', effect: 'hp_regen', value: 5 }
    ],
    tags: ['heal', 'defense']
  },
  {
    id: 'giant',
    name: 'Giant',
    icon: '🦣',
    description: 'Massive HP pool, slow but devastating',
    shortWarning: 'GIANT: Huge HP pool',
    weight: { bronze: 15, silver: 20, gold: 25, champion: 30 },
    statMods: { hpMod: 60, speedMod: -25, damageMod: 15 },
    behaviorMods: { aggressionMod: -15 },
    specialRules: [
      { type: 'vulnerability', effect: 'bleed', value: 25 }
    ],
    tags: ['hp', 'slow', 'damage']
  },
  {
    id: 'ghost',
    name: 'Ghost',
    icon: '👻',
    description: '25% chance to phase through attacks',
    shortWarning: 'GHOST: Can phase through hits',
    weight: { bronze: 5, silver: 15, gold: 25, champion: 35 },
    statMods: { hpMod: -25 },
    behaviorMods: {},
    specialRules: [
      { type: 'passive', effect: 'phase_chance', value: 25 }
    ],
    tags: ['dodge', 'special']
  }
];

// ========== HELPER FUNCTIONS ==========

export function getMutatorById(id: string): EnemyMutator | undefined {
  return ENEMY_MUTATORS.find(m => m.id === id);
}

/**
 * Get mutator spawn chance by league
 */
export function getMutatorChance(league: string): { oneChance: number; twoChance: number } {
  switch (league) {
    case 'bronze':
      return { oneChance: 30, twoChance: 0 };  // 30% for 1, never 2
    case 'silver':
      return { oneChance: 100, twoChance: 15 };  // Always 1, 15% for 2
    case 'gold':
      return { oneChance: 100, twoChance: 35 };  // Always 1, 35% for 2
    case 'champion':
      return { oneChance: 100, twoChance: 60 };  // Always 1, 60% for 2
    default:
      return { oneChance: 30, twoChance: 0 };
  }
}

/**
 * Roll mutators for an enemy
 */
export function rollMutators(league: string): string[] {
  const chances = getMutatorChance(league);
  const result: string[] = [];
  
  // Check for first mutator
  if (Math.random() * 100 < chances.oneChance) {
    const available = ENEMY_MUTATORS.filter(m => m.weight[league] > 0);
    const first = selectWeightedMutator(available, league);
    if (first) result.push(first.id);
    
    // Check for second mutator
    if (result.length > 0 && Math.random() * 100 < chances.twoChance) {
      // Avoid duplicate and conflicting mutators
      const remaining = available.filter(m => {
        if (m.id === result[0]) return false;
        // Avoid stacking similar effects
        const firstMutator = getMutatorById(result[0]);
        if (firstMutator) {
          const sharedTags = m.tags.filter(t => firstMutator.tags.includes(t));
          if (sharedTags.length > 1) return false;  // Too similar
        }
        return true;
      });
      
      const second = selectWeightedMutator(remaining, league);
      if (second) result.push(second.id);
    }
  }
  
  return result;
}

function selectWeightedMutator(mutators: EnemyMutator[], league: string): EnemyMutator | null {
  if (mutators.length === 0) return null;
  
  const totalWeight = mutators.reduce((sum, m) => sum + (m.weight[league] || 0), 0);
  let roll = Math.random() * totalWeight;
  
  for (const mutator of mutators) {
    roll -= mutator.weight[league] || 0;
    if (roll <= 0) return mutator;
  }
  
  return mutators[0];
}

/**
 * Calculate combined stat mods from mutators
 */
export function combineMutatorStatMods(mutatorIds: string[]): MutatorStatMods {
  const combined: MutatorStatMods = {};
  
  for (const id of mutatorIds) {
    const mutator = getMutatorById(id);
    if (!mutator) continue;
    
    const mods = mutator.statMods;
    if (mods.hpMod) combined.hpMod = (combined.hpMod || 0) + mods.hpMod;
    if (mods.damageMod) combined.damageMod = (combined.damageMod || 0) + mods.damageMod;
    if (mods.defenseMod) combined.defenseMod = (combined.defenseMod || 0) + mods.defenseMod;
    if (mods.critMod) combined.critMod = (combined.critMod || 0) + mods.critMod;
    if (mods.dodgeMod) combined.dodgeMod = (combined.dodgeMod || 0) + mods.dodgeMod;
    if (mods.parryMod) combined.parryMod = (combined.parryMod || 0) + mods.parryMod;
    if (mods.staminaMod) combined.staminaMod = (combined.staminaMod || 0) + mods.staminaMod;
    if (mods.speedMod) combined.speedMod = (combined.speedMod || 0) + mods.speedMod;
  }
  
  return combined;
}

/**
 * Get all special rules from mutators
 */
export function getMutatorSpecialRules(mutatorIds: string[]): MutatorSpecialRule[] {
  const rules: MutatorSpecialRule[] = [];
  
  for (const id of mutatorIds) {
    const mutator = getMutatorById(id);
    if (mutator) {
      rules.push(...mutator.specialRules);
    }
  }
  
  return rules;
}
