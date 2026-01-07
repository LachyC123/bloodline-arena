/**
 * TrainingData - Training programs and techniques for meaningful builds
 * Each program provides immediate stat changes + unlocks/levels techniques
 */

export type TrainingProgramId = 
  | 'footwork' 
  | 'guard_parry' 
  | 'power_strikes' 
  | 'bleed_craft'
  | 'endurance'
  | 'crowd_play';

export interface TrainingProgram {
  id: TrainingProgramId;
  name: string;
  icon: string;
  description: string;
  
  // Immediate stat changes
  statChanges: {
    attack?: number;
    defense?: number;
    accuracy?: number;
    dodge?: number;
    speed?: number;
    maxStamina?: number;
    maxFocus?: number;
    maxHP?: number;
  };
  
  // Fatigue cost (0-100)
  fatigueCost: number;
  
  // Sparring injury risk (0-1)
  injuryRisk: number;
  
  // Technique this program unlocks/levels
  techniqueId: string;
  
  // Visual preview text
  previewText: string;
  
  // Training vignette text
  trainingText: string;
}

export interface Technique {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  
  // Effects per level
  effects: TechniqueEffect[];
  
  // What this technique modifies in combat
  combatModifier: {
    action?: 'light_attack' | 'heavy_attack' | 'guard' | 'dodge' | 'special';
    trigger?: 'on_hit' | 'on_crit' | 'on_parry' | 'on_dodge' | 'on_guard' | 'on_kill';
    passive?: boolean;
  };
}

export interface TechniqueEffect {
  level: number;
  description: string;
  modifier: {
    type: 'stamina_cost' | 'damage_bonus' | 'accuracy_bonus' | 'focus_gain' | 
          'bleed_chance' | 'armor_break' | 'hype_bonus' | 'counter_damage' |
          'heal_on_trigger' | 'stun_chance';
    value: number;
  };
}

// Training Programs
export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'footwork',
    name: 'Footwork Drills',
    icon: '👣',
    description: 'Practice agility and positioning. Improves dodge and unlocks counter techniques.',
    statChanges: {
      dodge: 3,
      speed: 2,
      accuracy: 1
    },
    fatigueCost: 15,
    injuryRisk: 0.05,
    techniqueId: 'sidestep_counter',
    previewText: '+3 Dodge, +2 Speed, +1 Acc | Unlocks Sidestep Counter',
    trainingText: 'You spend hours dancing between training posts, learning to move without thinking.'
  },
  {
    id: 'guard_parry',
    name: 'Guard & Parry',
    icon: '🛡️',
    description: 'Master defensive timing. Wider parry window and bonus focus on perfect parries.',
    statChanges: {
      defense: 3,
      accuracy: -1
    },
    fatigueCost: 20,
    injuryRisk: 0.1,
    techniqueId: 'riposte_mastery',
    previewText: '+3 Defense, -1 Acc | Unlocks Riposte Mastery',
    trainingText: 'Wooden swords crack against your shield as you perfect your timing.'
  },
  {
    id: 'power_strikes',
    name: 'Power Strikes',
    icon: '💪',
    description: 'Train raw strength. Heavy attacks gain armor break but cost more stamina.',
    statChanges: {
      attack: 4,
      maxStamina: -5
    },
    fatigueCost: 25,
    injuryRisk: 0.15,
    techniqueId: 'crushing_blow',
    previewText: '+4 Attack, -5 Max Stamina | Unlocks Crushing Blow',
    trainingText: 'You lift stones and swing weighted weapons until your arms scream.'
  },
  {
    id: 'bleed_craft',
    name: 'Bleed Craft',
    icon: '🩸',
    description: 'Learn to cut deep. Light attacks have a chance to cause bleeding.',
    statChanges: {
      attack: 1,
      accuracy: 2
    },
    fatigueCost: 15,
    injuryRisk: 0.08,
    techniqueId: 'arterial_strike',
    previewText: '+1 Attack, +2 Acc | Unlocks Arterial Strike',
    trainingText: 'The trainer shows you exactly where to cut for maximum effect.'
  },
  {
    id: 'endurance',
    name: 'Endurance Training',
    icon: '🏃',
    description: 'Build stamina and resilience. More stamina, faster recovery.',
    statChanges: {
      maxStamina: 15,
      maxHP: 10,
      attack: -1
    },
    fatigueCost: 30,
    injuryRisk: 0.03,
    techniqueId: 'second_wind',
    previewText: '+15 Stamina, +10 HP, -1 Attack | Unlocks Second Wind',
    trainingText: 'Run. Lift. Carry. Repeat. Your body adapts to the punishment.'
  },
  {
    id: 'crowd_play',
    name: 'Crowd Play',
    icon: '🎭',
    description: 'Learn to work the audience. Hype builds faster, special moves cost less.',
    statChanges: {
      maxFocus: 10,
      accuracy: 1
    },
    fatigueCost: 10,
    injuryRisk: 0.02,
    techniqueId: 'showmanship',
    previewText: '+10 Focus, +1 Acc | Unlocks Showmanship',
    trainingText: 'An old performer teaches you how to make the crowd love you.'
  }
];

// Techniques unlocked by training
export const TECHNIQUES: Technique[] = [
  {
    id: 'sidestep_counter',
    name: 'Sidestep Counter',
    icon: '↪️',
    description: 'After a successful dodge, your next attack deals bonus damage.',
    maxLevel: 3,
    effects: [
      { level: 1, description: '+15% damage after dodge', modifier: { type: 'counter_damage', value: 15 } },
      { level: 2, description: '+25% damage after dodge', modifier: { type: 'counter_damage', value: 25 } },
      { level: 3, description: '+35% damage after dodge, costs no stamina', modifier: { type: 'counter_damage', value: 35 } }
    ],
    combatModifier: { trigger: 'on_dodge' }
  },
  {
    id: 'riposte_mastery',
    name: 'Riposte Mastery',
    icon: '⚔️',
    description: 'Perfect parries grant focus and allow an instant counter-attack.',
    maxLevel: 3,
    effects: [
      { level: 1, description: '+10 Focus on perfect parry', modifier: { type: 'focus_gain', value: 10 } },
      { level: 2, description: '+15 Focus, 20% stun chance', modifier: { type: 'focus_gain', value: 15 } },
      { level: 3, description: '+20 Focus, 35% stun, free counter', modifier: { type: 'focus_gain', value: 20 } }
    ],
    combatModifier: { trigger: 'on_parry' }
  },
  {
    id: 'crushing_blow',
    name: 'Crushing Blow',
    icon: '💥',
    description: 'Heavy attacks break through armor and can stagger enemies.',
    maxLevel: 3,
    effects: [
      { level: 1, description: 'Heavy ignores 20% armor', modifier: { type: 'armor_break', value: 20 } },
      { level: 2, description: 'Heavy ignores 35% armor', modifier: { type: 'armor_break', value: 35 } },
      { level: 3, description: 'Heavy ignores 50% armor, 25% stun', modifier: { type: 'armor_break', value: 50 } }
    ],
    combatModifier: { action: 'heavy_attack' }
  },
  {
    id: 'arterial_strike',
    name: 'Arterial Strike',
    icon: '🩸',
    description: 'Light attacks have a chance to cause bleeding damage over time.',
    maxLevel: 3,
    effects: [
      { level: 1, description: '15% bleed chance on light', modifier: { type: 'bleed_chance', value: 15 } },
      { level: 2, description: '25% bleed, stronger effect', modifier: { type: 'bleed_chance', value: 25 } },
      { level: 3, description: '35% bleed, can stack 3x', modifier: { type: 'bleed_chance', value: 35 } }
    ],
    combatModifier: { action: 'light_attack' }
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    icon: '💨',
    description: 'Recover stamina when low, gaining a burst of energy.',
    maxLevel: 3,
    effects: [
      { level: 1, description: 'Recover 15 stamina when below 20%', modifier: { type: 'stamina_cost', value: -15 } },
      { level: 2, description: 'Recover 25 stamina, +10 HP', modifier: { type: 'stamina_cost', value: -25 } },
      { level: 3, description: 'Recover 35 stamina, +15 HP, once per fight', modifier: { type: 'stamina_cost', value: -35 } }
    ],
    combatModifier: { passive: true }
  },
  {
    id: 'showmanship',
    name: 'Showmanship',
    icon: '✨',
    description: 'Special moves cost less focus and generate more crowd hype.',
    maxLevel: 3,
    effects: [
      { level: 1, description: '-5 focus cost, +10% hype', modifier: { type: 'hype_bonus', value: 10 } },
      { level: 2, description: '-10 focus cost, +20% hype', modifier: { type: 'hype_bonus', value: 20 } },
      { level: 3, description: '-15 focus cost, +30% hype, gold bonus', modifier: { type: 'hype_bonus', value: 30 } }
    ],
    combatModifier: { action: 'special' }
  }
];

// Minor injuries from sparring
export const SPARRING_INJURIES = [
  { id: 'bruised_ribs', name: 'Bruised Ribs', effect: '-5 Max Stamina for 1 fight', duration: 1 },
  { id: 'sprained_wrist', name: 'Sprained Wrist', effect: '-2 Attack for 1 fight', duration: 1 },
  { id: 'twisted_ankle', name: 'Twisted Ankle', effect: '-3 Dodge for 1 fight', duration: 1 },
  { id: 'sore_muscles', name: 'Sore Muscles', effect: '-1 to all stats for 1 fight', duration: 1 },
  { id: 'black_eye', name: 'Black Eye', effect: '-3 Accuracy for 1 fight', duration: 1 }
];

/**
 * Get training program by ID
 */
export function getTrainingProgram(id: TrainingProgramId): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find(p => p.id === id);
}

/**
 * Get technique by ID
 */
export function getTechnique(id: string): Technique | undefined {
  return TECHNIQUES.find(t => t.id === id);
}

/**
 * Get technique effect for a given level
 */
export function getTechniqueEffect(techniqueId: string, level: number): TechniqueEffect | undefined {
  const technique = getTechnique(techniqueId);
  if (!technique) return undefined;
  return technique.effects.find(e => e.level === level);
}

/**
 * Roll for sparring injury
 */
export function rollSparringInjury(injuryRisk: number): typeof SPARRING_INJURIES[0] | null {
  if (Math.random() < injuryRisk) {
    return SPARRING_INJURIES[Math.floor(Math.random() * SPARRING_INJURIES.length)];
  }
  return null;
}

/**
 * Calculate fatigue recovery from rest/letters
 */
export function calculateFatigueRecovery(action: 'rest' | 'letter'): number {
  switch (action) {
    case 'rest': return 40;
    case 'letter': return 15;
    default: return 0;
  }
}
