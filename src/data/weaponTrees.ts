/**
 * Weapon Skill Trees - Per weapon type mastery progression
 * Each weapon type has a branching tree of 6-10 nodes
 */

export interface SkillNodeEffect {
  stat?: string;
  value?: number;
  isPercent?: boolean;
  special?: string;
  description: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 1 | 2 | 3;  // Tier unlocks: 1 = 0pts, 2 = 2pts, 3 = 4pts
  cost: number;  // Mastery points to unlock
  requires?: string[];  // Required node IDs
  exclusive?: string[];  // Can't have these if this is picked
  effects: SkillNodeEffect[];
}

export interface WeaponTree {
  weaponType: string;
  name: string;
  icon: string;
  description: string;
  nodes: SkillNode[];
}

export const WEAPON_TREES: WeaponTree[] = [
  // ===== SWORD TREE =====
  {
    weaponType: 'sword',
    name: 'Way of the Blade',
    icon: '⚔️',
    description: 'Master the versatile art of sword combat',
    nodes: [
      {
        id: 'sword_precision',
        name: 'Precision Strikes',
        description: '+10% accuracy with all attacks',
        icon: '🎯',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'accuracy', value: 0.10, isPercent: true, description: '+10% Accuracy' }]
      },
      {
        id: 'sword_riposte',
        name: 'Riposte',
        description: 'After parrying, next attack deals +25% damage',
        icon: '⚡',
        tier: 1,
        cost: 1,
        effects: [{ special: 'riposte_damage', value: 0.25, description: '+25% damage after parry' }]
      },
      {
        id: 'sword_finesse',
        name: 'Finesse',
        description: '-2 stamina cost on light attacks',
        icon: '💨',
        tier: 2,
        cost: 2,
        requires: ['sword_precision'],
        effects: [{ stat: 'lightAttackCost', value: -2, description: '-2 Stamina on light attacks' }]
      },
      {
        id: 'sword_counter',
        name: 'Counter Master',
        description: '+15% parry window',
        icon: '🛡️',
        tier: 2,
        cost: 2,
        requires: ['sword_riposte'],
        effects: [{ stat: 'parryWindow', value: 0.15, isPercent: true, description: '+15% Parry window' }]
      },
      {
        id: 'sword_flourish',
        name: 'Deadly Flourish',
        description: 'Critical hits ignore 20% defense',
        icon: '✨',
        tier: 2,
        cost: 2,
        requires: ['sword_precision'],
        effects: [{ special: 'crit_armor_pierce', value: 0.20, description: 'Crits ignore 20% DEF' }]
      },
      {
        id: 'sword_dance',
        name: "Blade Dancer",
        description: 'Consecutive hits increase crit chance by 5%',
        icon: '💃',
        tier: 3,
        cost: 3,
        requires: ['sword_finesse', 'sword_flourish'],
        effects: [{ special: 'combo_crit', value: 0.05, description: '+5% Crit per consecutive hit' }]
      },
      {
        id: 'sword_master',
        name: 'Sword Master',
        description: '+15% damage with all sword attacks',
        icon: '👑',
        tier: 3,
        cost: 3,
        requires: ['sword_counter'],
        effects: [{ stat: 'damage', value: 0.15, isPercent: true, description: '+15% Sword damage' }]
      }
    ]
  },
  
  // ===== AXE TREE =====
  {
    weaponType: 'axe',
    name: 'Path of the Cleaver',
    icon: '🪓',
    description: 'Crush armor and break defenses',
    nodes: [
      {
        id: 'axe_rend',
        name: 'Rending Blows',
        description: '+1 Armor Break stack on hit',
        icon: '💥',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'armorBreak', value: 1, description: '+1 Armor Break per hit' }]
      },
      {
        id: 'axe_brutal',
        name: 'Brutal Force',
        description: '+15% heavy attack damage',
        icon: '💪',
        tier: 1,
        cost: 1,
        effects: [{ special: 'heavy_damage', value: 0.15, description: '+15% Heavy damage' }]
      },
      {
        id: 'axe_shatter',
        name: 'Armor Shatter',
        description: 'At 3+ Armor Break, enemy takes 10% more damage',
        icon: '🔨',
        tier: 2,
        cost: 2,
        requires: ['axe_rend'],
        effects: [{ special: 'armor_break_bonus', value: 0.10, description: '+10% dmg at 3+ Armor Break' }]
      },
      {
        id: 'axe_overhead',
        name: 'Overhead Slam',
        description: 'Heavy attacks have 10% stun chance',
        icon: '⬇️',
        tier: 2,
        cost: 2,
        requires: ['axe_brutal'],
        effects: [{ special: 'heavy_stun', value: 0.10, description: '10% Stun on heavy attacks' }]
      },
      {
        id: 'axe_executioner',
        name: 'Executioner',
        description: '+25% damage vs enemies below 30% HP',
        icon: '☠️',
        tier: 2,
        cost: 2,
        requires: ['axe_brutal'],
        effects: [{ special: 'execute_damage', value: 0.25, description: '+25% dmg vs low HP' }]
      },
      {
        id: 'axe_breaker',
        name: 'Shield Breaker',
        description: 'Attacks vs guarding enemies deal +30% damage',
        icon: '🛡️💔',
        tier: 3,
        cost: 3,
        requires: ['axe_shatter'],
        effects: [{ special: 'guard_damage', value: 0.30, description: '+30% vs guarding' }]
      },
      {
        id: 'axe_cleave',
        name: 'Devastating Cleave',
        description: 'Heavy attacks apply 2 Armor Break',
        icon: '🌀',
        tier: 3,
        cost: 3,
        requires: ['axe_overhead', 'axe_shatter'],
        effects: [{ stat: 'heavyArmorBreak', value: 2, description: '+2 Armor Break on heavy' }]
      }
    ]
  },
  
  // ===== DAGGER TREE =====
  {
    weaponType: 'dagger',
    name: 'Art of the Shadow',
    icon: '🗡️',
    description: 'Swift strikes and deadly crits',
    nodes: [
      {
        id: 'dagger_swift',
        name: 'Swift Cuts',
        description: '-3 stamina on light attacks',
        icon: '💨',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'lightAttackCost', value: -3, description: '-3 Stamina on lights' }]
      },
      {
        id: 'dagger_vital',
        name: 'Vital Targets',
        description: '+10% critical chance',
        icon: '🎯',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'critChance', value: 0.10, isPercent: true, description: '+10% Crit chance' }]
      },
      {
        id: 'dagger_bleed',
        name: 'Deep Cuts',
        description: 'Crits apply 2 stacks of bleed',
        icon: '🩸',
        tier: 2,
        cost: 2,
        requires: ['dagger_vital'],
        effects: [{ special: 'crit_bleed', value: 2, description: 'Crits apply 2 Bleed' }]
      },
      {
        id: 'dagger_evade',
        name: 'Evasive Strikes',
        description: '+10% dodge chance',
        icon: '👻',
        tier: 2,
        cost: 2,
        requires: ['dagger_swift'],
        effects: [{ stat: 'dodge', value: 0.10, isPercent: true, description: '+10% Dodge' }]
      },
      {
        id: 'dagger_poison',
        name: 'Poison Edge',
        description: 'Attacks have 15% chance to poison (3 dmg/turn)',
        icon: '☠️',
        tier: 2,
        cost: 2,
        requires: ['dagger_bleed'],
        effects: [{ special: 'poison_chance', value: 0.15, description: '15% Poison chance' }]
      },
      {
        id: 'dagger_assassin',
        name: 'Assassin Strike',
        description: '+50% crit damage',
        icon: '💀',
        tier: 3,
        cost: 3,
        requires: ['dagger_bleed', 'dagger_vital'],
        effects: [{ stat: 'critDamage', value: 0.50, isPercent: true, description: '+50% Crit damage' }]
      },
      {
        id: 'dagger_shadow',
        name: 'Shadow Step',
        description: 'Successful dodge grants +20% damage on next attack',
        icon: '🌑',
        tier: 3,
        cost: 3,
        requires: ['dagger_evade'],
        effects: [{ special: 'dodge_damage', value: 0.20, description: '+20% dmg after dodge' }]
      }
    ]
  },
  
  // ===== SPEAR TREE =====
  {
    weaponType: 'spear',
    name: 'Way of the Reach',
    icon: '🔱',
    description: 'Keep enemies at distance with superior reach',
    nodes: [
      {
        id: 'spear_reach',
        name: 'Extended Reach',
        description: '+5% accuracy, can attack before enemy closes',
        icon: '📏',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'accuracy', value: 0.05, isPercent: true, description: '+5% Accuracy' }]
      },
      {
        id: 'spear_thrust',
        name: 'Piercing Thrust',
        description: 'Light attacks ignore 10% armor',
        icon: '➡️',
        tier: 1,
        cost: 1,
        effects: [{ special: 'light_pierce', value: 0.10, description: 'Lights pierce 10% DEF' }]
      },
      {
        id: 'spear_poke',
        name: 'Keep at Bay',
        description: 'First attack each combat has +15% damage',
        icon: '🛑',
        tier: 2,
        cost: 2,
        requires: ['spear_reach'],
        effects: [{ special: 'first_strike', value: 0.15, description: '+15% first attack damage' }]
      },
      {
        id: 'spear_impale',
        name: 'Impaling Strike',
        description: 'Heavy attacks cause 2 bleed stacks',
        icon: '🩸',
        tier: 2,
        cost: 2,
        requires: ['spear_thrust'],
        effects: [{ special: 'heavy_bleed', value: 2, description: 'Heavies apply 2 Bleed' }]
      },
      {
        id: 'spear_stance',
        name: 'Defensive Stance',
        description: '+10% parry window when at full stamina',
        icon: '🛡️',
        tier: 2,
        cost: 2,
        requires: ['spear_reach'],
        effects: [{ special: 'full_stamina_parry', value: 0.10, description: '+10% Parry at full stamina' }]
      },
      {
        id: 'spear_legion',
        name: 'Legion Tactics',
        description: 'Guard regenerates 3 stamina instead of costing',
        icon: '🏛️',
        tier: 3,
        cost: 3,
        requires: ['spear_stance'],
        effects: [{ special: 'guard_regen', value: 3, description: 'Guard gives +3 stamina' }]
      },
      {
        id: 'spear_master',
        name: 'Spear Master',
        description: '+20% damage when enemy below 50% stamina',
        icon: '👑',
        tier: 3,
        cost: 3,
        requires: ['spear_impale', 'spear_poke'],
        effects: [{ special: 'stamina_damage', value: 0.20, description: '+20% dmg vs low stamina' }]
      }
    ]
  },
  
  // ===== MACE TREE =====
  {
    weaponType: 'mace',
    name: 'Path of the Crusher',
    icon: '🔨',
    description: 'Stun enemies and break their will',
    nodes: [
      {
        id: 'mace_concussion',
        name: 'Concussive Blows',
        description: '+10% stun chance on all attacks',
        icon: '💫',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'stunChance', value: 0.10, isPercent: true, description: '+10% Stun chance' }]
      },
      {
        id: 'mace_weight',
        name: 'Weighted Strikes',
        description: '+10% damage with heavy attacks',
        icon: '💪',
        tier: 1,
        cost: 1,
        effects: [{ special: 'heavy_damage', value: 0.10, description: '+10% Heavy damage' }]
      },
      {
        id: 'mace_followup',
        name: 'Follow-Up Strike',
        description: 'Stunned enemies take +20% damage',
        icon: '⚡',
        tier: 2,
        cost: 2,
        requires: ['mace_concussion'],
        effects: [{ special: 'stun_damage', value: 0.20, description: '+20% vs Stunned' }]
      },
      {
        id: 'mace_guard_crush',
        name: 'Guard Crush',
        description: 'Heavy attacks vs guarding apply 2 Armor Break',
        icon: '🛡️💥',
        tier: 2,
        cost: 2,
        requires: ['mace_weight'],
        effects: [{ special: 'guard_armor_break', value: 2, description: '2 Armor Break vs guard' }]
      },
      {
        id: 'mace_intimidate',
        name: 'Intimidating Presence',
        description: 'Enemies have -5% accuracy',
        icon: '😰',
        tier: 2,
        cost: 2,
        requires: ['mace_concussion'],
        effects: [{ special: 'enemy_accuracy_debuff', value: -0.05, description: 'Enemy -5% Accuracy' }]
      },
      {
        id: 'mace_shockwave',
        name: 'Shockwave',
        description: 'Stuns last 1 additional turn',
        icon: '🌊',
        tier: 3,
        cost: 3,
        requires: ['mace_followup', 'mace_intimidate'],
        effects: [{ special: 'stun_duration', value: 1, description: '+1 Stun duration' }]
      },
      {
        id: 'mace_skull_crack',
        name: 'Skull Cracker',
        description: 'Heavy attacks have 20% stun chance',
        icon: '💀',
        tier: 3,
        cost: 3,
        requires: ['mace_guard_crush', 'mace_concussion'],
        effects: [{ special: 'heavy_stun', value: 0.20, description: '20% Stun on heavy' }]
      }
    ]
  },
  
  // ===== GREATSWORD TREE =====
  {
    weaponType: 'greatsword',
    name: 'Way of the Colossus',
    icon: '🗡️',
    description: 'Overwhelm foes with massive strikes',
    nodes: [
      {
        id: 'great_momentum',
        name: 'Building Momentum',
        description: '+1 Momentum gain per attack',
        icon: '🔄',
        tier: 1,
        cost: 1,
        effects: [{ stat: 'momentumGain', value: 1, description: '+1 Momentum gain' }]
      },
      {
        id: 'great_sweeping',
        name: 'Sweeping Strikes',
        description: '+15% damage on heavy attacks',
        icon: '🌀',
        tier: 1,
        cost: 1,
        effects: [{ special: 'heavy_damage', value: 0.15, description: '+15% Heavy damage' }]
      },
      {
        id: 'great_unstoppable',
        name: 'Unstoppable Force',
        description: 'Attacks can\'t be parried at 3+ Momentum',
        icon: '🚀',
        tier: 2,
        cost: 2,
        requires: ['great_momentum'],
        effects: [{ special: 'unparryable', value: 3, description: 'Unparryable at 3+ Momentum' }]
      },
      {
        id: 'great_cleave',
        name: 'Mighty Cleave',
        description: 'Heavy attacks deal +5 flat damage',
        icon: '⚔️',
        tier: 2,
        cost: 2,
        requires: ['great_sweeping'],
        effects: [{ special: 'heavy_flat_damage', value: 5, description: '+5 Heavy damage' }]
      },
      {
        id: 'great_endurance',
        name: 'Enduring Strength',
        description: '-5 stamina cost on heavy attacks',
        icon: '💪',
        tier: 2,
        cost: 2,
        requires: ['great_sweeping'],
        effects: [{ stat: 'heavyAttackCost', value: -5, description: '-5 Heavy stamina' }]
      },
      {
        id: 'great_execution',
        name: 'Execution',
        description: 'Heavy attacks at 5+ Momentum deal +40% damage',
        icon: '☠️',
        tier: 3,
        cost: 3,
        requires: ['great_unstoppable', 'great_cleave'],
        effects: [{ special: 'momentum_execute', value: 0.40, description: '+40% dmg at 5+ Momentum' }]
      },
      {
        id: 'great_intimidate',
        name: 'Overwhelming Presence',
        description: 'At 3+ Momentum, enemy dodge reduced by 10%',
        icon: '😱',
        tier: 3,
        cost: 3,
        requires: ['great_endurance', 'great_unstoppable'],
        effects: [{ special: 'reduce_enemy_dodge', value: -0.10, description: 'Enemy -10% Dodge' }]
      }
    ]
  }
];

// ===== HELPER FUNCTIONS =====

export function getWeaponTree(weaponType: string): WeaponTree | undefined {
  return WEAPON_TREES.find(t => t.weaponType === weaponType);
}

export function getTreeNode(weaponType: string, nodeId: string): SkillNode | undefined {
  const tree = getWeaponTree(weaponType);
  return tree?.nodes.find(n => n.id === nodeId);
}

export function getUnlockedNodes(weaponType: string, unlockedIds: string[]): SkillNode[] {
  const tree = getWeaponTree(weaponType);
  if (!tree) return [];
  return tree.nodes.filter(n => unlockedIds.includes(n.id));
}

export function canUnlockNode(
  node: SkillNode, 
  unlockedIds: string[],
  totalMasteryPoints: number,
  spentPoints: number
): { canUnlock: boolean; reason?: string } {
  // Check cost
  if (totalMasteryPoints - spentPoints < node.cost) {
    return { canUnlock: false, reason: `Need ${node.cost} Mastery Points` };
  }
  
  // Check requirements
  if (node.requires) {
    for (const reqId of node.requires) {
      if (!unlockedIds.includes(reqId)) {
        return { canUnlock: false, reason: 'Requires previous node' };
      }
    }
  }
  
  // Check exclusions
  if (node.exclusive) {
    for (const exclId of node.exclusive) {
      if (unlockedIds.includes(exclId)) {
        return { canUnlock: false, reason: 'Exclusive with another node' };
      }
    }
  }
  
  // Check tier (need enough total spent for higher tiers)
  const tierRequirements = { 1: 0, 2: 2, 3: 4 };
  if (spentPoints < tierRequirements[node.tier]) {
    return { canUnlock: false, reason: `Need ${tierRequirements[node.tier]} points in tree` };
  }
  
  return { canUnlock: true };
}

export function calculateTreeBonuses(weaponType: string, unlockedIds: string[]): Record<string, number> {
  const bonuses: Record<string, number> = {};
  const nodes = getUnlockedNodes(weaponType, unlockedIds);
  
  for (const node of nodes) {
    for (const effect of node.effects) {
      if (effect.stat) {
        bonuses[effect.stat] = (bonuses[effect.stat] || 0) + (effect.value || 0);
      }
      if (effect.special) {
        bonuses[effect.special] = (bonuses[effect.special] || 0) + (effect.value || 0);
      }
    }
  }
  
  return bonuses;
}

export function getTotalSpentPoints(weaponType: string, unlockedIds: string[]): number {
  const nodes = getUnlockedNodes(weaponType, unlockedIds);
  return nodes.reduce((sum, n) => sum + n.cost, 0);
}
