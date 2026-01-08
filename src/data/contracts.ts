/**
 * Contracts / Match Conditions - Optional objectives for extra rewards
 * Before some fights, player can accept 0-3 contracts
 */

export interface ContractReward {
  type: 'gold' | 'embers' | 'mastery' | 'signatureXP' | 'lootTier';
  value: number;
}

export interface Contract {
  id: string;
  name: string;
  icon: string;
  description: string;
  objective: string;  // Clear description of what to do
  difficulty: 1 | 2 | 3;  // Stars
  trackingType: 'count' | 'boolean' | 'health';
  target: number;  // How many / what threshold
  rewards: ContractReward[];
  tags: string[];
}

export const CONTRACTS: Contract[] = [
  // ===== EASY CONTRACTS (1 star) =====
  {
    id: 'contract_win',
    name: 'Victory',
    icon: '🏆',
    description: 'Simply win the fight',
    objective: 'Win the fight',
    difficulty: 1,
    trackingType: 'boolean',
    target: 1,
    rewards: [{ type: 'gold', value: 15 }],
    tags: ['basic']
  },
  {
    id: 'contract_light_attacks',
    name: 'Quick Hands',
    icon: '👋',
    description: 'Use 4 light attacks',
    objective: 'Use 4 light attacks',
    difficulty: 1,
    trackingType: 'count',
    target: 4,
    rewards: [{ type: 'gold', value: 20 }],
    tags: ['offense', 'light']
  },
  {
    id: 'contract_guard',
    name: 'Hold the Line',
    icon: '🛡️',
    description: 'Guard 2 times',
    objective: 'Use guard 2 times',
    difficulty: 1,
    trackingType: 'count',
    target: 2,
    rewards: [{ type: 'gold', value: 15 }],
    tags: ['defense']
  },
  {
    id: 'contract_dodge',
    name: 'Nimble Fighter',
    icon: '💨',
    description: 'Successfully dodge 2 attacks',
    objective: 'Dodge 2 attacks',
    difficulty: 1,
    trackingType: 'count',
    target: 2,
    rewards: [{ type: 'gold', value: 20 }],
    tags: ['defense', 'dodge']
  },
  
  // ===== MEDIUM CONTRACTS (2 stars) =====
  {
    id: 'contract_no_damage',
    name: 'Untouched',
    icon: '✨',
    description: 'Take less than 20 damage',
    objective: 'Take less than 20 total damage',
    difficulty: 2,
    trackingType: 'health',
    target: 20,
    rewards: [
      { type: 'gold', value: 40 },
      { type: 'embers', value: 1 }
    ],
    tags: ['defense', 'skill']
  },
  {
    id: 'contract_crits',
    name: 'Precision Striker',
    icon: '🎯',
    description: 'Land 2 critical hits',
    objective: 'Score 2 critical hits',
    difficulty: 2,
    trackingType: 'count',
    target: 2,
    rewards: [
      { type: 'gold', value: 30 },
      { type: 'signatureXP', value: 5 }
    ],
    tags: ['offense', 'crit']
  },
  {
    id: 'contract_parry',
    name: 'Parry Master',
    icon: '⚔️',
    description: 'Successfully parry 2 attacks',
    objective: 'Parry 2 enemy attacks',
    difficulty: 2,
    trackingType: 'count',
    target: 2,
    rewards: [
      { type: 'gold', value: 35 },
      { type: 'mastery', value: 1 }
    ],
    tags: ['defense', 'parry', 'skill']
  },
  {
    id: 'contract_heavy',
    name: 'Heavy Hitter',
    icon: '💪',
    description: 'Use 3 heavy attacks',
    objective: 'Use 3 heavy attacks',
    difficulty: 2,
    trackingType: 'count',
    target: 3,
    rewards: [
      { type: 'gold', value: 25 },
      { type: 'embers', value: 1 }
    ],
    tags: ['offense', 'heavy']
  },
  {
    id: 'contract_quick_win',
    name: 'Swift Victory',
    icon: '⚡',
    description: 'Win within 8 turns',
    objective: 'Win in 8 turns or less',
    difficulty: 2,
    trackingType: 'count',
    target: 8,
    rewards: [
      { type: 'gold', value: 35 },
      { type: 'signatureXP', value: 5 }
    ],
    tags: ['speed']
  },
  {
    id: 'contract_bleed',
    name: 'Blood Tax',
    icon: '🩸',
    description: 'Apply 5 bleed stacks total',
    objective: 'Apply 5 bleed stacks',
    difficulty: 2,
    trackingType: 'count',
    target: 5,
    rewards: [
      { type: 'gold', value: 30 },
      { type: 'embers', value: 1 }
    ],
    tags: ['offense', 'bleed']
  },
  
  // ===== HARD CONTRACTS (3 stars) =====
  {
    id: 'contract_flawless',
    name: 'Flawless Victory',
    icon: '💎',
    description: 'Win without taking any damage',
    objective: 'Take 0 damage',
    difficulty: 3,
    trackingType: 'health',
    target: 0,
    rewards: [
      { type: 'gold', value: 100 },
      { type: 'embers', value: 3 },
      { type: 'mastery', value: 1 }
    ],
    tags: ['defense', 'skill', 'hard']
  },
  {
    id: 'contract_no_guard',
    name: 'Aggressive Stance',
    icon: '🔥',
    description: 'Win without using guard',
    objective: 'Never use guard',
    difficulty: 3,
    trackingType: 'count',
    target: 0,
    rewards: [
      { type: 'gold', value: 60 },
      { type: 'embers', value: 2 }
    ],
    tags: ['offense', 'hard']
  },
  {
    id: 'contract_no_healing',
    name: 'Pure Skill',
    icon: '🩹',
    description: 'Win without using any healing items',
    objective: 'Use no healing items',
    difficulty: 3,
    trackingType: 'boolean',
    target: 0,
    rewards: [
      { type: 'gold', value: 50 },
      { type: 'signatureXP', value: 10 }
    ],
    tags: ['skill', 'hard']
  },
  {
    id: 'contract_finish_low',
    name: 'Clutch Fighter',
    icon: '💀',
    description: 'Win while below 20% HP',
    objective: 'Win with less than 20% HP remaining',
    difficulty: 3,
    trackingType: 'health',
    target: 20,
    rewards: [
      { type: 'gold', value: 70 },
      { type: 'embers', value: 2 },
      { type: 'mastery', value: 1 }
    ],
    tags: ['risk', 'hard']
  },
  {
    id: 'contract_full_combo',
    name: 'Combo King',
    icon: '🌀',
    description: 'Build momentum to 5 without taking a hit',
    objective: 'Reach 5 momentum without being hit',
    difficulty: 3,
    trackingType: 'count',
    target: 5,
    rewards: [
      { type: 'gold', value: 80 },
      { type: 'mastery', value: 2 }
    ],
    tags: ['momentum', 'skill', 'hard']
  }
];

// ===== HELPER FUNCTIONS =====

export function getContractById(id: string): Contract | undefined {
  return CONTRACTS.find(c => c.id === id);
}

export function getRandomContracts(count: number = 3, excludeIds: string[] = []): Contract[] {
  const available = CONTRACTS.filter(c => !excludeIds.includes(c.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateContractRewards(contracts: Contract[]): {
  gold: number;
  embers: number;
  mastery: number;
  signatureXP: number;
  lootTier: number;
} {
  const result = { gold: 0, embers: 0, mastery: 0, signatureXP: 0, lootTier: 0 };
  
  for (const contract of contracts) {
    for (const reward of contract.rewards) {
      switch (reward.type) {
        case 'gold': result.gold += reward.value; break;
        case 'embers': result.embers += reward.value; break;
        case 'mastery': result.mastery += reward.value; break;
        case 'signatureXP': result.signatureXP += reward.value; break;
        case 'lootTier': result.lootTier += reward.value; break;
      }
    }
  }
  
  return result;
}

export function getContractsByDifficulty(difficulty: 1 | 2 | 3): Contract[] {
  return CONTRACTS.filter(c => c.difficulty === difficulty);
}
