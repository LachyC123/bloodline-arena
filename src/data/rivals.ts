/**
 * Evolving Rival Boss System
 * The rival learns from player's style and adapts countermeasures
 */

export interface PlayerStyleMetrics {
  parryRate: number;  // How often player parries (0-1)
  dodgeRate: number;  // How often player dodges (0-1)
  heavyRate: number;  // How often player uses heavy attacks (0-1)
  bleedFocus: number;  // How much player relies on bleed (0-1)
  healUsage: number;  // How often player heals (0-1)
  aggressiveness: number;  // Attack frequency vs defensive moves (0-1)
}

export interface RivalAdaptation {
  id: string;
  name: string;
  description: string;
  counterTo: keyof PlayerStyleMetrics;
  threshold: number;  // Style metric must be above this to trigger
  statMods: Record<string, number>;
  specialAbility?: string;
}

export interface RivalState {
  id: string;
  name: string;
  nickname: string;
  encounterCount: number;
  styleMetrics: PlayerStyleMetrics;
  activeAdaptations: string[];  // Adaptation IDs
  lastEncounterResult: 'win' | 'loss' | null;
  grudgeLevel: number;  // Increases on player wins, affects rivalry intensity
}

// Adaptations the rival can develop
export const RIVAL_ADAPTATIONS: RivalAdaptation[] = [
  // Counter parry players
  {
    id: 'adapt_feint_master',
    name: 'Feint Master',
    description: 'Learned to feint your parries',
    counterTo: 'parryRate',
    threshold: 0.4,
    statMods: { unparryableChance: 0.25 },
    specialAbility: 'feint_attack'
  },
  {
    id: 'adapt_pressure',
    name: 'Relentless Pressure',
    description: 'Never gives you time to set up parries',
    counterTo: 'parryRate',
    threshold: 0.5,
    statMods: { attackSpeed: 0.15, staminaRegen: 2 }
  },
  
  // Counter dodge players
  {
    id: 'adapt_wide_sweep',
    name: 'Wide Sweep',
    description: 'Attacks are harder to dodge',
    counterTo: 'dodgeRate',
    threshold: 0.4,
    statMods: { accuracy: 0.15 }
  },
  {
    id: 'adapt_predict',
    name: 'Movement Reader',
    description: 'Predicts your dodges',
    counterTo: 'dodgeRate',
    threshold: 0.5,
    statMods: { accuracy: 0.20, critChance: 0.10 }
  },
  
  // Counter heavy attack players
  {
    id: 'adapt_iron_stance',
    name: 'Iron Stance',
    description: 'Prepared for your heavy attacks',
    counterTo: 'heavyRate',
    threshold: 0.4,
    statMods: { defense: 5, armorBreakResist: 0.3 }
  },
  {
    id: 'adapt_counter_heavy',
    name: 'Heavy Punisher',
    description: 'Counters after you commit to heavy attacks',
    counterTo: 'heavyRate',
    threshold: 0.5,
    statMods: { counterChance: 0.30 },
    specialAbility: 'punish_heavy'
  },
  
  // Counter bleed players
  {
    id: 'adapt_thick_skin',
    name: 'Thick Skin',
    description: 'Resistant to your bleeding tactics',
    counterTo: 'bleedFocus',
    threshold: 0.3,
    statMods: { bleedResist: 0.40 }
  },
  {
    id: 'adapt_blood_fury',
    name: 'Blood Fury',
    description: 'Fights harder when bleeding',
    counterTo: 'bleedFocus',
    threshold: 0.5,
    statMods: { bleedResist: 0.20 },
    specialAbility: 'enrage_on_bleed'
  },
  
  // Counter heal players
  {
    id: 'adapt_aggressive',
    name: 'Aggressive Pursuit',
    description: 'Never lets you recover',
    counterTo: 'healUsage',
    threshold: 0.3,
    statMods: { damage: 0.10, attackSpeed: 0.10 }
  },
  {
    id: 'adapt_wound_master',
    name: 'Wound Master',
    description: 'Inflicts wounds that reduce healing',
    counterTo: 'healUsage',
    threshold: 0.5,
    statMods: { woundChance: 0.25 },
    specialAbility: 'anti_heal_wound'
  }
];

// Base rival templates
export const RIVAL_TEMPLATES = [
  {
    id: 'rival_shadow',
    name: 'The Shadow',
    baseStats: { hp: 100, damage: 15, defense: 8, speed: 12 },
    personality: 'A dark figure who mirrors your every move'
  },
  {
    id: 'rival_brute',
    name: 'Gorath the Crusher',
    baseStats: { hp: 130, damage: 18, defense: 10, speed: 8 },
    personality: 'A massive warrior who remembers every defeat'
  },
  {
    id: 'rival_duelist',
    name: 'Silvara the Swift',
    baseStats: { hp: 80, damage: 12, defense: 5, speed: 15 },
    personality: 'A nimble fencer who studies your technique'
  }
];

// ===== HELPER FUNCTIONS =====

export function getDefaultStyleMetrics(): PlayerStyleMetrics {
  return {
    parryRate: 0,
    dodgeRate: 0,
    heavyRate: 0,
    bleedFocus: 0,
    healUsage: 0,
    aggressiveness: 0.5
  };
}

export function updateStyleMetrics(
  current: PlayerStyleMetrics, 
  fightStats: Partial<PlayerStyleMetrics>,
  weight: number = 0.3
): PlayerStyleMetrics {
  const updated = { ...current };
  
  for (const key of Object.keys(fightStats) as (keyof PlayerStyleMetrics)[]) {
    if (fightStats[key] !== undefined) {
      // Weighted average with existing data
      updated[key] = current[key] * (1 - weight) + (fightStats[key] || 0) * weight;
    }
  }
  
  return updated;
}

export function getActiveAdaptations(metrics: PlayerStyleMetrics): RivalAdaptation[] {
  return RIVAL_ADAPTATIONS.filter(adapt => {
    const metricValue = metrics[adapt.counterTo];
    return metricValue >= adapt.threshold;
  });
}

export function calculateRivalStatMods(adaptations: RivalAdaptation[]): Record<string, number> {
  const mods: Record<string, number> = {};
  
  for (const adapt of adaptations) {
    for (const [stat, value] of Object.entries(adapt.statMods)) {
      mods[stat] = (mods[stat] || 0) + value;
    }
  }
  
  return mods;
}

export function generateRivalDialogue(
  rival: RivalState, 
  context: 'encounter' | 'win' | 'loss'
): string {
  const grudge = rival.grudgeLevel;
  
  if (context === 'encounter') {
    if (grudge === 0) {
      return "So, you're the one they speak of. Let's see what you've got.";
    } else if (grudge < 3) {
      return "We meet again. I've learned from our last encounter.";
    } else if (grudge < 5) {
      return "You! I've been waiting for this rematch. I know your tricks now.";
    } else {
      return "THIS ENDS TODAY! I've dedicated everything to defeating you!";
    }
  } else if (context === 'win') {
    if (grudge < 3) {
      return "Impressive... but I'll be ready next time.";
    } else {
      return "NO! This can't be happening again! I'll destroy you next time!";
    }
  } else {
    return "Finally... I've proven myself superior. Remember this defeat.";
  }
}

export function createRival(templateId?: string): RivalState {
  const template = templateId 
    ? RIVAL_TEMPLATES.find(t => t.id === templateId) || RIVAL_TEMPLATES[0]
    : RIVAL_TEMPLATES[Math.floor(Math.random() * RIVAL_TEMPLATES.length)];
  
  return {
    id: template.id,
    name: template.name,
    nickname: 'Your Nemesis',
    encounterCount: 0,
    styleMetrics: getDefaultStyleMetrics(),
    activeAdaptations: [],
    lastEncounterResult: null,
    grudgeLevel: 0
  };
}
