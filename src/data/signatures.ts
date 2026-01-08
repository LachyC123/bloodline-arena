/**
 * Signature Moves - Unique abilities that level up during a run
 * Each fighter picks one at run start, levels it up through milestones
 */

export interface SignatureLevel {
  level: number;
  xpRequired: number;  // XP needed to reach this level
  effect: string;
  value: number;
}

export interface SignatureMove {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'active' | 'passive';
  triggerCondition?: string;  // For passive: when does it trigger
  cooldown?: number;  // For active: turns between uses
  levels: SignatureLevel[];
  tags: string[];
}

export const SIGNATURE_MOVES: SignatureMove[] = [
  // ===== OFFENSIVE SIGNATURES =====
  {
    id: 'sig_fury_strike',
    name: 'Fury Strike',
    icon: '💥',
    description: 'A devastating blow that ignores armor',
    type: 'active',
    cooldown: 4,
    levels: [
      { level: 1, xpRequired: 0, effect: 'Deals 150% damage, ignores 20% DEF', value: 1.5 },
      { level: 2, xpRequired: 50, effect: 'Deals 175% damage, ignores 30% DEF', value: 1.75 },
      { level: 3, xpRequired: 150, effect: 'Deals 200% damage, ignores 40% DEF', value: 2.0 },
      { level: 4, xpRequired: 300, effect: 'Deals 225% damage, ignores 50% DEF', value: 2.25 },
      { level: 5, xpRequired: 500, effect: 'Deals 250% damage, ignores 60% DEF', value: 2.5 }
    ],
    tags: ['damage', 'armor-pierce']
  },
  {
    id: 'sig_bleed_mastery',
    name: 'Blood Ritual',
    icon: '🩸',
    description: 'Your attacks cause grievous wounds',
    type: 'passive',
    triggerCondition: 'On critical hit',
    levels: [
      { level: 1, xpRequired: 0, effect: 'Crits apply 2 bleed stacks', value: 2 },
      { level: 2, xpRequired: 50, effect: 'Crits apply 3 bleed stacks', value: 3 },
      { level: 3, xpRequired: 150, effect: 'Crits apply 4 bleed stacks', value: 4 },
      { level: 4, xpRequired: 300, effect: 'Crits apply 5 bleed stacks', value: 5 },
      { level: 5, xpRequired: 500, effect: 'Crits apply 6 bleed + enemy takes +10% bleed dmg', value: 6 }
    ],
    tags: ['bleed', 'crit']
  },
  {
    id: 'sig_execute',
    name: 'Executioner\'s Mark',
    icon: '☠️',
    description: 'Finish wounded foes with deadly precision',
    type: 'passive',
    triggerCondition: 'Enemy below 25% HP',
    levels: [
      { level: 1, xpRequired: 0, effect: '+20% damage vs low HP enemies', value: 0.20 },
      { level: 2, xpRequired: 50, effect: '+30% damage vs low HP enemies', value: 0.30 },
      { level: 3, xpRequired: 150, effect: '+40% damage vs low HP enemies', value: 0.40 },
      { level: 4, xpRequired: 300, effect: '+50% damage vs low HP enemies', value: 0.50 },
      { level: 5, xpRequired: 500, effect: '+60% damage, +10% crit vs low HP', value: 0.60 }
    ],
    tags: ['execute', 'damage']
  },
  
  // ===== DEFENSIVE SIGNATURES =====
  {
    id: 'sig_iron_skin',
    name: 'Iron Skin',
    icon: '🛡️',
    description: 'Harden your body against attacks',
    type: 'active',
    cooldown: 5,
    levels: [
      { level: 1, xpRequired: 0, effect: 'Block next attack, gain 10% DEF for 2 turns', value: 0.10 },
      { level: 2, xpRequired: 50, effect: 'Block next attack, gain 15% DEF for 2 turns', value: 0.15 },
      { level: 3, xpRequired: 150, effect: 'Block next 2 attacks, gain 20% DEF for 3 turns', value: 0.20 },
      { level: 4, xpRequired: 300, effect: 'Block next 2 attacks, gain 25% DEF for 3 turns', value: 0.25 },
      { level: 5, xpRequired: 500, effect: 'Block next 3 attacks, gain 30% DEF for 4 turns', value: 0.30 }
    ],
    tags: ['defense', 'buff']
  },
  {
    id: 'sig_counter',
    name: 'Counter Stance',
    icon: '⚡',
    description: 'Turn enemy attacks into opportunities',
    type: 'passive',
    triggerCondition: 'On successful parry',
    levels: [
      { level: 1, xpRequired: 0, effect: 'After parry, auto-attack for 50% damage', value: 0.50 },
      { level: 2, xpRequired: 50, effect: 'After parry, auto-attack for 75% damage', value: 0.75 },
      { level: 3, xpRequired: 150, effect: 'After parry, auto-attack for 100% damage', value: 1.0 },
      { level: 4, xpRequired: 300, effect: 'After parry, attack for 100% + 15% crit', value: 1.0 },
      { level: 5, xpRequired: 500, effect: 'After parry, attack for 125% + 25% crit', value: 1.25 }
    ],
    tags: ['parry', 'counter']
  },
  {
    id: 'sig_last_stand',
    name: 'Last Stand',
    icon: '🔥',
    description: 'Fight harder when near death',
    type: 'passive',
    triggerCondition: 'HP below 30%',
    levels: [
      { level: 1, xpRequired: 0, effect: '+15% damage when low HP', value: 0.15 },
      { level: 2, xpRequired: 50, effect: '+20% damage, +5% dodge when low HP', value: 0.20 },
      { level: 3, xpRequired: 150, effect: '+25% damage, +10% dodge when low HP', value: 0.25 },
      { level: 4, xpRequired: 300, effect: '+30% damage, +15% dodge when low HP', value: 0.30 },
      { level: 5, xpRequired: 500, effect: '+35% damage, +20% dodge, heal 10% on kill', value: 0.35 }
    ],
    tags: ['survival', 'clutch']
  },
  
  // ===== UTILITY SIGNATURES =====
  {
    id: 'sig_momentum_master',
    name: 'Momentum Master',
    icon: '🌀',
    description: 'Build and use momentum more effectively',
    type: 'passive',
    triggerCondition: 'On attack',
    levels: [
      { level: 1, xpRequired: 0, effect: '+1 Momentum gain on hit', value: 1 },
      { level: 2, xpRequired: 50, effect: '+1 Momentum, burst costs 1 less', value: 1 },
      { level: 3, xpRequired: 150, effect: '+2 Momentum, burst costs 1 less', value: 2 },
      { level: 4, xpRequired: 300, effect: '+2 Momentum, burst costs 2 less', value: 2 },
      { level: 5, xpRequired: 500, effect: '+3 Momentum, burst gives +30% damage', value: 3 }
    ],
    tags: ['momentum', 'utility']
  },
  {
    id: 'sig_crowd_pleaser',
    name: 'Crowd Pleaser',
    icon: '👏',
    description: 'The crowd loves you, and it shows',
    type: 'passive',
    triggerCondition: 'On kill or critical hit',
    levels: [
      { level: 1, xpRequired: 0, effect: '+10% hype gain from actions', value: 0.10 },
      { level: 2, xpRequired: 50, effect: '+15% hype gain, hype boosts heal slightly', value: 0.15 },
      { level: 3, xpRequired: 150, effect: '+20% hype gain, heal +3 HP per hype boost', value: 0.20 },
      { level: 4, xpRequired: 300, effect: '+25% hype gain, heal +5 HP per hype boost', value: 0.25 },
      { level: 5, xpRequired: 500, effect: '+30% hype, +10 HP on crowd favorite', value: 0.30 }
    ],
    tags: ['hype', 'heal']
  },
  {
    id: 'sig_stamina_flow',
    name: 'Endless Stamina',
    icon: '💨',
    description: 'Your endurance knows no bounds',
    type: 'passive',
    triggerCondition: 'Per turn',
    levels: [
      { level: 1, xpRequired: 0, effect: '+2 stamina regen per turn', value: 2 },
      { level: 2, xpRequired: 50, effect: '+3 stamina regen per turn', value: 3 },
      { level: 3, xpRequired: 150, effect: '+4 stamina regen, -1 light attack cost', value: 4 },
      { level: 4, xpRequired: 300, effect: '+5 stamina regen, -2 light attack cost', value: 5 },
      { level: 5, xpRequired: 500, effect: '+6 stamina regen, heavy costs -3', value: 6 }
    ],
    tags: ['stamina', 'sustain']
  },
  {
    id: 'sig_intimidation',
    name: 'Intimidating Presence',
    icon: '😈',
    description: 'Your presence weakens enemies',
    type: 'passive',
    triggerCondition: 'At fight start',
    levels: [
      { level: 1, xpRequired: 0, effect: 'Enemy starts with -5% damage', value: -0.05 },
      { level: 2, xpRequired: 50, effect: 'Enemy starts with -8% damage', value: -0.08 },
      { level: 3, xpRequired: 150, effect: 'Enemy -10% damage, -5% accuracy', value: -0.10 },
      { level: 4, xpRequired: 300, effect: 'Enemy -12% damage, -8% accuracy', value: -0.12 },
      { level: 5, xpRequired: 500, effect: 'Enemy -15% damage, -10% accuracy, -5% crit', value: -0.15 }
    ],
    tags: ['debuff', 'control']
  }
];

// ===== HELPER FUNCTIONS =====

export function getSignatureById(id: string): SignatureMove | undefined {
  return SIGNATURE_MOVES.find(s => s.id === id);
}

export function getSignatureLevel(signature: SignatureMove, currentXP: number): SignatureLevel {
  // Return highest level that player has enough XP for
  let result = signature.levels[0];
  for (const level of signature.levels) {
    if (currentXP >= level.xpRequired) {
      result = level;
    }
  }
  return result;
}

export function getXPToNextLevel(signature: SignatureMove, currentXP: number): number | null {
  const currentLevel = getSignatureLevel(signature, currentXP);
  const nextLevel = signature.levels.find(l => l.level === currentLevel.level + 1);
  if (!nextLevel) return null;  // Max level
  return nextLevel.xpRequired - currentXP;
}

export function getRandomSignatures(count: number = 3): SignatureMove[] {
  const shuffled = [...SIGNATURE_MOVES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateSignatureXPFromWin(isElite: boolean = false): number {
  const base = 10;
  return isElite ? base * 3 : base;
}
