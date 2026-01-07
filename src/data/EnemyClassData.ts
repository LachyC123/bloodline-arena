/**
 * EnemyClassData - Enemy archetypes with strengths, weaknesses, and distinct behaviors
 * 8+ classes with mechanical differences and AI patterns
 */

export type EnemyClassId = 
  | 'brute' 
  | 'duelist' 
  | 'shieldbearer' 
  | 'berserker' 
  | 'spearman'
  | 'executioner' 
  | 'trickster' 
  | 'knight'
  | 'pit_fighter'
  | 'veteran';

export interface EnemyClassWeakness {
  type: 'dodge' | 'parry' | 'armor_break' | 'stun' | 'bleed' | 'poison' | 'momentum' | 'pressure' | 'stamina_drain';
  description: string;
  damageMultiplier?: number;  // Extra damage from this type
  effectChanceMultiplier?: number;  // Extra chance for this effect
}

export interface EnemyClassStrength {
  type: 'high_damage' | 'high_defense' | 'high_dodge' | 'parry_master' | 'enrage' | 'first_strike' | 'fear' | 'poison' | 'armor' | 'stamina';
  description: string;
  value?: number;
}

export interface AIBehavior {
  preferredActions: {
    action: 'light_attack' | 'heavy_attack' | 'guard' | 'dodge' | 'special';
    weight: number;  // Higher = more likely
    condition?: 'low_hp' | 'high_hp' | 'low_stamina' | 'high_momentum' | 'player_guarding';
  }[];
  enrageThreshold?: number;  // HP percentage to enrage
  enrageEffect?: string;
}

export interface EnemyClass {
  id: EnemyClassId;
  name: string;
  title: string;
  icon: string;
  description: string;
  
  // Visual
  preferredWeaponTypes: string[];
  preferredArmorTypes: string[];
  
  // Stats modifiers (applied to base stats)
  statMods: {
    hp?: number;
    stamina?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    accuracy?: number;
    critChance?: number;
    dodge?: number;
  };
  
  // Passive abilities
  passives: {
    id: string;
    name: string;
    description: string;
    effect: string;
  }[];
  
  // Strengths and weaknesses
  strengths: EnemyClassStrength[];
  weaknesses: EnemyClassWeakness[];
  
  // AI behavior
  behavior: AIBehavior;
  
  // Taunt lines
  taunts: string[];
  enrageTaunts?: string[];
  
  // League availability
  leagueMin: 'bronze' | 'silver' | 'gold';
  leagueWeight: { bronze: number; silver: number; gold: number };
}

export const ENEMY_CLASSES: EnemyClass[] = [
  // ========== BRUTE ==========
  {
    id: 'brute',
    name: 'Brute',
    title: 'The Crusher',
    icon: '💪',
    description: 'A massive fighter who relies on raw power. Devastating damage but poor stamina management.',
    preferredWeaponTypes: ['hammer', 'axe', 'greatsword'],
    preferredArmorTypes: ['light', 'medium'],
    statMods: {
      hp: 20,
      attack: 8,
      defense: -2,
      stamina: -15,
      speed: -2,
      accuracy: -10
    },
    passives: [
      {
        id: 'crushing_blows',
        name: 'Crushing Blows',
        description: 'Heavy attacks deal 25% more damage',
        effect: 'heavy_damage_bonus'
      }
    ],
    strengths: [
      { type: 'high_damage', description: 'Devastating heavy attacks', value: 25 }
    ],
    weaknesses: [
      { type: 'dodge', description: 'Slow attacks easy to dodge', damageMultiplier: 1.0, effectChanceMultiplier: 1.3 },
      { type: 'parry', description: 'Telegraphed swings easy to parry', damageMultiplier: 1.0, effectChanceMultiplier: 1.25 },
      { type: 'stamina_drain', description: 'Burns out quickly', damageMultiplier: 1.0, effectChanceMultiplier: 1.0 }
    ],
    behavior: {
      preferredActions: [
        { action: 'heavy_attack', weight: 50 },
        { action: 'light_attack', weight: 25 },
        { action: 'guard', weight: 15 },
        { action: 'dodge', weight: 10 }
      ],
      enrageThreshold: 30,
      enrageEffect: 'Attack +20%, but accuracy -15%'
    },
    taunts: [
      'I\'ll crush you!',
      'You\'re nothing but a bug.',
      'One hit is all I need.'
    ],
    enrageTaunts: [
      'NOW YOU DIE!',
      'RAAARGH!'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 25, silver: 15, gold: 10 }
  },

  // ========== DUELIST ==========
  {
    id: 'duelist',
    name: 'Duelist',
    title: 'The Blade Dancer',
    icon: '🤺',
    description: 'A technical fighter with excellent parry and dodge. Weak against armor-breaking attacks.',
    preferredWeaponTypes: ['sword', 'dagger', 'spear'],
    preferredArmorTypes: ['light'],
    statMods: {
      hp: -10,
      attack: 0,
      defense: -3,
      stamina: 10,
      speed: 4,
      accuracy: 15,
      critChance: 10,
      dodge: 15
    },
    passives: [
      {
        id: 'riposte',
        name: 'Riposte',
        description: 'Successful parries deal counter damage',
        effect: 'parry_counter'
      }
    ],
    strengths: [
      { type: 'high_dodge', description: 'Excellent evasion', value: 15 },
      { type: 'parry_master', description: 'Master parrier', value: 20 }
    ],
    weaknesses: [
      { type: 'armor_break', description: 'Light armor breaks easily', damageMultiplier: 1.25, effectChanceMultiplier: 1.5 },
      { type: 'stun', description: 'Stunned easily', damageMultiplier: 1.0, effectChanceMultiplier: 1.4 }
    ],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 35 },
        { action: 'dodge', weight: 30 },
        { action: 'guard', weight: 20, condition: 'player_guarding' },
        { action: 'heavy_attack', weight: 10 },
        { action: 'special', weight: 5 }
      ]
    },
    taunts: [
      'Your form is sloppy.',
      'I\'ll dance circles around you.',
      'Try to hit me.'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 15, silver: 25, gold: 20 }
  },

  // ========== SHIELDBEARER ==========
  {
    id: 'shieldbearer',
    name: 'Shieldbearer',
    title: 'The Wall',
    icon: '🛡️',
    description: 'A defensive specialist who relies on their shield. Vulnerable to guard-crushing attacks.',
    preferredWeaponTypes: ['sword', 'mace'],
    preferredArmorTypes: ['heavy'],
    statMods: {
      hp: 15,
      attack: -3,
      defense: 12,
      stamina: -5,
      speed: -2,
      accuracy: 5
    },
    passives: [
      {
        id: 'shield_wall',
        name: 'Shield Wall',
        description: 'Guard blocks 75% damage instead of 60%',
        effect: 'improved_guard'
      }
    ],
    strengths: [
      { type: 'high_defense', description: 'Incredible blocking', value: 75 },
      { type: 'armor', description: 'Heavy armor', value: 12 }
    ],
    weaknesses: [
      { type: 'armor_break', description: 'Armor break devastates', damageMultiplier: 1.3, effectChanceMultiplier: 1.5 },
      { type: 'pressure', description: 'Aggressive combos overwhelm', damageMultiplier: 1.1, effectChanceMultiplier: 1.0 }
    ],
    behavior: {
      preferredActions: [
        { action: 'guard', weight: 45 },
        { action: 'light_attack', weight: 30 },
        { action: 'heavy_attack', weight: 15 },
        { action: 'dodge', weight: 10 }
      ]
    },
    taunts: [
      'You can\'t break through.',
      'My shield has never failed.',
      'Come and try.'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 20, silver: 20, gold: 15 }
  },

  // ========== BERSERKER ==========
  {
    id: 'berserker',
    name: 'Berserker',
    title: 'The Mad',
    icon: '😤',
    description: 'A wild fighter who grows stronger as they take damage. Control effects shut them down.',
    preferredWeaponTypes: ['axe', 'greatsword', 'hammer'],
    preferredArmorTypes: ['light', 'furs'],
    statMods: {
      hp: 10,
      attack: 5,
      defense: -5,
      stamina: 15,
      speed: 2,
      accuracy: -5
    },
    passives: [
      {
        id: 'blood_rage',
        name: 'Blood Rage',
        description: 'Gains +5% damage for every 10% HP lost',
        effect: 'low_hp_damage_boost'
      }
    ],
    strengths: [
      { type: 'enrage', description: 'Stronger when wounded', value: 50 },
      { type: 'stamina', description: 'High endurance', value: 15 }
    ],
    weaknesses: [
      { type: 'stun', description: 'Rage interrupted by stuns', damageMultiplier: 1.0, effectChanceMultiplier: 1.5 },
      { type: 'poison', description: 'Poison drains rage', damageMultiplier: 1.2, effectChanceMultiplier: 1.3 }
    ],
    behavior: {
      preferredActions: [
        { action: 'heavy_attack', weight: 40 },
        { action: 'light_attack', weight: 35 },
        { action: 'special', weight: 15, condition: 'low_hp' },
        { action: 'dodge', weight: 10 }
      ],
      enrageThreshold: 50,
      enrageEffect: 'Attack +30%, Speed +2, Defense -5'
    },
    taunts: [
      'BLOOD!',
      'Pain makes me stronger!',
      'You\'ll feed my rage!'
    ],
    enrageTaunts: [
      'YES! MORE!',
      'I CANNOT BE STOPPED!'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 15, silver: 20, gold: 25 }
  },

  // ========== SPEARMAN ==========
  {
    id: 'spearman',
    name: 'Spearman',
    title: 'The Reacher',
    icon: '🔱',
    description: 'A fighter with superior reach who strikes first. Vulnerable when pressured up close.',
    preferredWeaponTypes: ['spear'],
    preferredArmorTypes: ['medium'],
    statMods: {
      hp: 0,
      attack: 2,
      defense: 0,
      stamina: 5,
      speed: 5,
      accuracy: 12
    },
    passives: [
      {
        id: 'reach_advantage',
        name: 'Reach Advantage',
        description: 'Always attacks first in a round',
        effect: 'first_strike'
      }
    ],
    strengths: [
      { type: 'first_strike', description: 'Always strikes first', value: 100 },
      { type: 'high_dodge', description: 'Can keep distance', value: 10 }
    ],
    weaknesses: [
      { type: 'pressure', description: 'Collapses under pressure', damageMultiplier: 1.15, effectChanceMultiplier: 1.0 },
      { type: 'momentum', description: 'Loses to momentum', damageMultiplier: 1.2, effectChanceMultiplier: 1.0 }
    ],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 45 },
        { action: 'heavy_attack', weight: 25 },
        { action: 'dodge', weight: 20 },
        { action: 'guard', weight: 10 }
      ]
    },
    taunts: [
      'You can\'t reach me.',
      'Stay back!',
      'I strike before you move.'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 20, silver: 20, gold: 15 }
  },

  // ========== EXECUTIONER ==========
  {
    id: 'executioner',
    name: 'Executioner',
    title: 'The Dread',
    icon: '💀',
    description: 'A terrifying fighter with fear-inducing presence. Burns stamina quickly.',
    preferredWeaponTypes: ['axe', 'greatsword', 'hammer'],
    preferredArmorTypes: ['heavy'],
    statMods: {
      hp: 20,
      attack: 10,
      defense: 5,
      stamina: -20,
      speed: -3,
      accuracy: 0,
      critChance: 15
    },
    passives: [
      {
        id: 'dread_presence',
        name: 'Dread Presence',
        description: 'Enemy loses 5 focus when hit',
        effect: 'fear_aura'
      }
    ],
    strengths: [
      { type: 'fear', description: 'Drains focus', value: 5 },
      { type: 'high_damage', description: 'Massive damage', value: 20 }
    ],
    weaknesses: [
      { type: 'stamina_drain', description: 'Exhausts quickly', damageMultiplier: 1.0, effectChanceMultiplier: 1.0 },
      { type: 'dodge', description: 'Slow and predictable', damageMultiplier: 1.0, effectChanceMultiplier: 1.3 }
    ],
    behavior: {
      preferredActions: [
        { action: 'heavy_attack', weight: 55 },
        { action: 'light_attack', weight: 20 },
        { action: 'guard', weight: 15, condition: 'low_stamina' },
        { action: 'special', weight: 10 }
      ]
    },
    taunts: [
      'Your execution awaits.',
      'I am death.',
      'Fear me.'
    ],
    leagueMin: 'silver',
    leagueWeight: { bronze: 5, silver: 20, gold: 25 }
  },

  // ========== TRICKSTER ==========
  {
    id: 'trickster',
    name: 'Trickster',
    title: 'The Cunning',
    icon: '🎭',
    description: 'A dirty fighter who uses poison and debuffs. Weak raw defense.',
    preferredWeaponTypes: ['dagger', 'flail'],
    preferredArmorTypes: ['light'],
    statMods: {
      hp: -15,
      attack: -2,
      defense: -5,
      stamina: 10,
      speed: 4,
      accuracy: 10,
      critChance: 20,
      dodge: 10
    },
    passives: [
      {
        id: 'dirty_tricks',
        name: 'Dirty Tricks',
        description: '25% chance to apply random debuff on hit',
        effect: 'random_debuff'
      }
    ],
    strengths: [
      { type: 'poison', description: 'Poison attacks', value: 35 },
      { type: 'high_dodge', description: 'Slippery', value: 10 }
    ],
    weaknesses: [
      { type: 'armor_break', description: 'No armor to break', damageMultiplier: 1.2, effectChanceMultiplier: 1.0 },
      { type: 'pressure', description: 'Crumbles under aggression', damageMultiplier: 1.25, effectChanceMultiplier: 1.0 }
    ],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 40 },
        { action: 'dodge', weight: 30 },
        { action: 'special', weight: 20 },
        { action: 'heavy_attack', weight: 10 }
      ]
    },
    taunts: [
      'Let\'s play a game.',
      'Trust nothing.',
      'Surprise!'
    ],
    leagueMin: 'silver',
    leagueWeight: { bronze: 5, silver: 20, gold: 20 }
  },

  // ========== KNIGHT ==========
  {
    id: 'knight',
    name: 'Knight',
    title: 'The Honorable',
    icon: '🏰',
    description: 'A balanced, well-armored warrior. Weak to bleed and armor break stacks.',
    preferredWeaponTypes: ['sword', 'mace'],
    preferredArmorTypes: ['heavy'],
    statMods: {
      hp: 15,
      attack: 3,
      defense: 10,
      stamina: 0,
      speed: -1,
      accuracy: 8
    },
    passives: [
      {
        id: 'plate_armor',
        name: 'Plate Armor',
        description: '40% bleed resistance, 20% crit resistance',
        effect: 'heavy_armor_bonuses'
      }
    ],
    strengths: [
      { type: 'armor', description: 'Full plate protection', value: 10 },
      { type: 'high_defense', description: 'Excellent defense', value: 40 }
    ],
    weaknesses: [
      { type: 'bleed', description: 'Armor gaps allow bleed', damageMultiplier: 1.25, effectChanceMultiplier: 1.3 },
      { type: 'armor_break', description: 'Stacking breaks devastate', damageMultiplier: 1.35, effectChanceMultiplier: 1.4 }
    ],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 35 },
        { action: 'guard', weight: 30 },
        { action: 'heavy_attack', weight: 25 },
        { action: 'dodge', weight: 10 }
      ]
    },
    taunts: [
      'For honor!',
      'Face me fairly.',
      'My armor is my faith.'
    ],
    leagueMin: 'silver',
    leagueWeight: { bronze: 5, silver: 15, gold: 25 }
  },

  // ========== PIT FIGHTER ==========
  {
    id: 'pit_fighter',
    name: 'Pit Fighter',
    title: 'The Survivor',
    icon: '⚔️',
    description: 'A balanced arena veteran. No major weaknesses but no major strengths.',
    preferredWeaponTypes: ['sword', 'axe', 'mace'],
    preferredArmorTypes: ['medium'],
    statMods: {
      hp: 5,
      attack: 2,
      defense: 2,
      stamina: 5,
      speed: 1,
      accuracy: 5
    },
    passives: [
      {
        id: 'arena_experience',
        name: 'Arena Experience',
        description: 'Gains momentum 20% faster',
        effect: 'momentum_boost'
      }
    ],
    strengths: [
      { type: 'stamina', description: 'Good endurance', value: 5 }
    ],
    weaknesses: [],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 35 },
        { action: 'heavy_attack', weight: 25 },
        { action: 'guard', weight: 20 },
        { action: 'dodge', weight: 15 },
        { action: 'special', weight: 5 }
      ]
    },
    taunts: [
      'I\'ve seen better.',
      'Another day, another fight.',
      'Let\'s get this over with.'
    ],
    leagueMin: 'bronze',
    leagueWeight: { bronze: 30, silver: 20, gold: 10 }
  },

  // ========== VETERAN ==========
  {
    id: 'veteran',
    name: 'Veteran',
    title: 'The Scarred',
    icon: '🎖️',
    description: 'A grizzled warrior with experience against everything. Adapts mid-fight.',
    preferredWeaponTypes: ['sword', 'axe', 'spear', 'mace'],
    preferredArmorTypes: ['medium', 'heavy'],
    statMods: {
      hp: 10,
      attack: 4,
      defense: 4,
      stamina: 10,
      speed: 0,
      accuracy: 10,
      critChance: 5
    },
    passives: [
      {
        id: 'battle_wisdom',
        name: 'Battle Wisdom',
        description: 'Adapts to enemy patterns, +10% counter damage per round',
        effect: 'adaptive_combat'
      }
    ],
    strengths: [
      { type: 'stamina', description: 'High endurance', value: 10 }
    ],
    weaknesses: [
      { type: 'momentum', description: 'Slow to adapt to aggression', damageMultiplier: 1.1, effectChanceMultiplier: 1.0 }
    ],
    behavior: {
      preferredActions: [
        { action: 'light_attack', weight: 30 },
        { action: 'guard', weight: 25 },
        { action: 'heavy_attack', weight: 20 },
        { action: 'dodge', weight: 15 },
        { action: 'special', weight: 10 }
      ]
    },
    taunts: [
      'I\'ve killed better than you.',
      'Younglings...',
      'This won\'t take long.'
    ],
    leagueMin: 'silver',
    leagueWeight: { bronze: 0, silver: 15, gold: 30 }
  }
];

// Helper functions
export function getEnemyClass(id: EnemyClassId): EnemyClass | undefined {
  return ENEMY_CLASSES.find(c => c.id === id);
}

export function getEnemyClassesForLeague(league: 'bronze' | 'silver' | 'gold'): EnemyClass[] {
  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  return ENEMY_CLASSES.filter(c => leagueOrder.indexOf(c.leagueMin) <= leagueIdx);
}

export function rollEnemyClass(league: 'bronze' | 'silver' | 'gold'): EnemyClass {
  const available = getEnemyClassesForLeague(league);
  const weights = available.map(c => c.leagueWeight[league]);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < available.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      return available[i];
    }
  }
  
  return available[0];
}

export function getClassWeaknessMultiplier(enemyClass: EnemyClass, effectType: string): number {
  const weakness = enemyClass.weaknesses.find(w => w.type === effectType);
  return weakness?.damageMultiplier || 1.0;
}

export function getClassEffectChanceMultiplier(enemyClass: EnemyClass, effectType: string): number {
  const weakness = enemyClass.weaknesses.find(w => w.type === effectType);
  return weakness?.effectChanceMultiplier || 1.0;
}
