/**
 * EnemySystem - Enemy AI and generation
 */

import { Fighter, FighterStats, generatePortrait } from './FighterSystem';
import { CombatState, CombatAction, TargetZone } from './CombatSystem';
import { RNG } from './RNGSystem';
import { ENEMY_ARCHETYPES, ENEMY_NAMES } from '../data/EnemyData';

// Enemy AI personality types
export type EnemyAIType = 'aggressive' | 'defensive' | 'trickster' | 'brutal' | 'balanced' | 'cautious' | 'berserker' | 'tactical';

// Enemy archetype definition
export interface EnemyArchetype {
  id: string;
  name: string;
  title: string;
  aiType: EnemyAIType;
  statMultipliers: Partial<FighterStats>;
  specialAbility?: string;
  flavorText: string;
  taunts: string[];
}

/**
 * Generate an enemy fighter
 */
export function generateEnemy(
  league: 'bronze' | 'silver' | 'gold' | 'champion',
  week: number
): Fighter {
  const archetype = RNG.pick(ENEMY_ARCHETYPES);
  const nameData = RNG.pick(ENEMY_NAMES);
  
  // Base stats scale with league and week
  const leagueMultiplier = {
    bronze: 1.0,
    silver: 1.3,
    gold: 1.6,
    champion: 2.0
  }[league];
  
  const weekBonus = Math.min(week * 2, 20);
  
  const baseStats: FighterStats = {
    maxHP: Math.round((80 + weekBonus) * leagueMultiplier * (archetype.statMultipliers.maxHP || 1)),
    currentHP: 0,
    maxStamina: Math.round((80 + weekBonus * 0.5) * (archetype.statMultipliers.maxStamina || 1)),
    currentStamina: 0,
    maxFocus: Math.round(60 * (archetype.statMultipliers.maxFocus || 1)),
    currentFocus: 0,
    attack: Math.round((10 + weekBonus * 0.3) * leagueMultiplier * (archetype.statMultipliers.attack || 1)),
    defense: Math.round((8 + weekBonus * 0.2) * leagueMultiplier * (archetype.statMultipliers.defense || 1)),
    speed: Math.round((8 + weekBonus * 0.2) * (archetype.statMultipliers.speed || 1)),
    accuracy: Math.round(75 + weekBonus * 0.5),
    evasion: Math.round(10 + weekBonus * 0.3),
    critChance: 10,
    critDamage: 150
  };
  
  baseStats.currentHP = baseStats.maxHP;
  baseStats.currentStamina = baseStats.maxStamina;
  
  const enemy: Fighter = {
    id: `enemy_${RNG.id(8)}`,
    firstName: nameData.first,
    lastName: nameData.last,
    nickname: archetype.title,
    fullName: `${nameData.first} '${archetype.title}' ${nameData.last}`,
    age: RNG.int(20, 50),
    birthplace: 'Unknown',
    backstory: archetype.flavorText,
    personality: aiTypeToPersonality(archetype.aiType),
    
    baseStats,
    currentStats: { ...baseStats },
    
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    },
    keepsake: {
      id: 'enemy_keepsake',
      name: 'Fighter\'s Token',
      backstory: 'A simple token.',
      effect: 'None',
      statBonus: {},
      upgraded: false
    },
    inventory: [],
    
    signatureTrait: {
      id: archetype.id,
      name: archetype.name,
      description: archetype.specialAbility || 'No special ability',
      type: 'neutral',
      effect: archetype.specialAbility || ''
    },
    traits: [],
    flaws: [],
    
    portrait: generatePortrait(),
    
    level: Math.ceil(week / 2),
    experience: 0,
    wins: RNG.int(0, week * 2),
    losses: RNG.int(0, week),
    kills: RNG.int(0, week),
    
    status: 'healthy',
    injuries: [],
    scars: [],
    activeEffects: [],
    
    trust: 0,
    trustLevel: 'stranger',
    
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    perfectParries: 0,
    signatureMoveUses: 0,
    closestCall: baseStats.maxHP,
    bestWin: '',
    
    lettersWritten: [],
    weeksSurvived: week
  };
  
  return enemy;
}

function aiTypeToPersonality(aiType: EnemyAIType): Fighter['personality'] {
  const mapping: Record<EnemyAIType, Fighter['personality']> = {
    aggressive: 'aggressive',
    defensive: 'stoic',
    trickster: 'cunning',
    brutal: 'aggressive',
    balanced: 'stoic',
    cautious: 'fearful',
    berserker: 'aggressive',
    tactical: 'cunning'
  };
  return mapping[aiType];
}

/**
 * Get AI action decision
 */
export function getAIAction(
  state: CombatState,
  aiType: EnemyAIType
): { action: CombatAction; targetZone: TargetZone } {
  const enemy = state.enemy;
  const player = state.player;
  
  // Get available actions based on resources
  const canHeavyAttack = enemy.currentStamina >= 25;
  const canSpecial = enemy.currentFocus >= 30 && enemy.currentStamina >= 20;
  const canDodge = enemy.currentStamina >= 15;
  
  // Health-based decisions
  const healthPercent = enemy.currentHP / enemy.fighter.currentStats.maxHP;
  const playerHealthPercent = player.currentHP / player.fighter.currentStats.maxHP;
  
  // AI decision matrix based on type
  let action: CombatAction;
  let targetZone: TargetZone;
  
  switch (aiType) {
    case 'aggressive':
      action = selectAggressiveAction(canHeavyAttack, canSpecial, healthPercent);
      targetZone = RNG.chance(0.4) ? 'head' : RNG.chance(0.5) ? 'body' : 'legs';
      break;
      
    case 'defensive':
      action = selectDefensiveAction(canDodge, healthPercent, player.lastAction);
      targetZone = player.guardStance ? getUnguardedZone(player.guardStance) : 'body';
      break;
      
    case 'trickster':
      action = selectTricksterAction(canDodge, canSpecial, state);
      targetZone = selectTricksterTarget(player);
      break;
      
    case 'brutal':
      action = selectBrutalAction(canHeavyAttack, canSpecial);
      targetZone = 'head'; // Always go for the head
      break;
      
    case 'balanced':
      action = selectBalancedAction(canHeavyAttack, canSpecial, canDodge, healthPercent);
      targetZone = RNG.pick(['head', 'body', 'legs']);
      break;
      
    case 'cautious':
      action = selectCautiousAction(canDodge, healthPercent, playerHealthPercent);
      targetZone = 'body';
      break;
      
    case 'berserker':
      action = selectBerserkerAction(canHeavyAttack, canSpecial, healthPercent);
      targetZone = RNG.chance(0.6) ? 'head' : 'body';
      break;
      
    case 'tactical':
      action = selectTacticalAction(state, canHeavyAttack, canSpecial, canDodge);
      targetZone = selectTacticalTarget(player);
      break;
      
    default:
      action = 'light_attack';
      targetZone = 'body';
  }
  
  return { action, targetZone };
}

function selectAggressiveAction(
  canHeavy: boolean,
  canSpecial: boolean,
  health: number
): CombatAction {
  if (canSpecial && RNG.chance(0.3)) return 'special';
  if (canHeavy && RNG.chance(0.5)) return 'heavy_attack';
  return 'light_attack';
}

function selectDefensiveAction(
  canDodge: boolean,
  health: number,
  playerLastAction: CombatAction | null
): CombatAction {
  // Guard more when low health
  if (health < 0.3 && RNG.chance(0.6)) return 'guard';
  
  // React to player's last action
  if (playerLastAction === 'heavy_attack' && canDodge) {
    return RNG.chance(0.5) ? 'dodge' : 'guard';
  }
  
  if (RNG.chance(0.3)) return 'guard';
  if (canDodge && RNG.chance(0.2)) return 'dodge';
  return 'light_attack';
}

function selectTricksterAction(
  canDodge: boolean,
  canSpecial: boolean,
  state: CombatState
): CombatAction {
  // Tricksters like to dodge and counter
  if (canDodge && state.player.lastAction === 'heavy_attack') return 'dodge';
  if (canSpecial && RNG.chance(0.4)) return 'special';
  if (RNG.chance(0.3)) return 'dodge';
  return 'light_attack';
}

function selectTricksterTarget(player: { guardStance: TargetZone | null }): TargetZone {
  // Always attack unguarded zone
  if (player.guardStance) {
    return getUnguardedZone(player.guardStance);
  }
  // Random otherwise
  return RNG.pick(['head', 'body', 'legs']);
}

function selectBrutalAction(canHeavy: boolean, canSpecial: boolean): CombatAction {
  if (canSpecial && RNG.chance(0.4)) return 'special';
  if (canHeavy) return 'heavy_attack';
  return 'light_attack';
}

function selectBalancedAction(
  canHeavy: boolean,
  canSpecial: boolean,
  canDodge: boolean,
  health: number
): CombatAction {
  const roll = RNG.random();
  if (canSpecial && roll < 0.15) return 'special';
  if (canHeavy && roll < 0.35) return 'heavy_attack';
  if (roll < 0.45) return 'guard';
  if (canDodge && roll < 0.55) return 'dodge';
  return 'light_attack';
}

function selectCautiousAction(
  canDodge: boolean,
  health: number,
  playerHealth: number
): CombatAction {
  // Very defensive when hurt
  if (health < 0.4) {
    return RNG.chance(0.5) ? 'guard' : (canDodge ? 'dodge' : 'guard');
  }
  
  // More aggressive when player is hurt
  if (playerHealth < 0.3) {
    return RNG.chance(0.6) ? 'light_attack' : 'heavy_attack';
  }
  
  // Default cautious behavior
  const roll = RNG.random();
  if (roll < 0.3) return 'guard';
  if (canDodge && roll < 0.4) return 'dodge';
  return 'light_attack';
}

function selectBerserkerAction(
  canHeavy: boolean,
  canSpecial: boolean,
  health: number
): CombatAction {
  // Gets more aggressive as health drops
  const aggressionBonus = (1 - health) * 0.3;
  
  if (canSpecial && RNG.chance(0.3 + aggressionBonus)) return 'special';
  if (canHeavy && RNG.chance(0.6 + aggressionBonus)) return 'heavy_attack';
  return 'light_attack';
}

function selectTacticalAction(
  state: CombatState,
  canHeavy: boolean,
  canSpecial: boolean,
  canDodge: boolean
): CombatAction {
  const player = state.player;
  const enemy = state.enemy;
  
  // React to player patterns
  if (player.consecutiveGuards >= 2 && canSpecial) return 'special';
  if (player.lastAction === 'heavy_attack' && canDodge) return 'dodge';
  if (enemy.currentFocus >= 50 && canSpecial) return 'special';
  if (player.currentStamina < 20) return canHeavy ? 'heavy_attack' : 'light_attack';
  
  // Default tactical choice
  return canHeavy ? 'heavy_attack' : 'light_attack';
}

function selectTacticalTarget(player: {
  guardStance: TargetZone | null;
  activeEffects: Map<any, any>;
}): TargetZone {
  // Target already-injured zones
  if (player.activeEffects.has('cripple')) return 'legs';
  if (player.activeEffects.has('concuss')) return 'head';
  
  // Avoid guarded zone
  if (player.guardStance) {
    return getUnguardedZone(player.guardStance);
  }
  
  return RNG.pick(['head', 'body', 'legs']);
}

function getUnguardedZone(guardedZone: TargetZone): TargetZone {
  const zones: TargetZone[] = ['head', 'body', 'legs'];
  const available = zones.filter(z => z !== guardedZone);
  return RNG.pick(available);
}

/**
 * Get enemy taunt
 */
export function getEnemyTaunt(enemy: Fighter): string {
  const archetype = ENEMY_ARCHETYPES.find(a => a.id === enemy.signatureTrait.id);
  if (archetype?.taunts) {
    return RNG.pick(archetype.taunts);
  }
  return "You'll fall like the rest.";
}

/**
 * Generate rival NPC
 */
export function generateRival(league: 'bronze' | 'silver' | 'gold'): Fighter {
  const rival = generateEnemy(league, 5);
  rival.nickname = 'The Rival';
  return rival;
}

/**
 * Generate friend NPC
 */
export function generateFriend(): { name: string; role: 'medic' | 'trainer'; lines: Record<string, string> } {
  const names = ['Old Marcus', 'Sister Helena', 'Grim Tobias', 'The Crone', 'Patch'];
  const roles: ('medic' | 'trainer')[] = ['medic', 'trainer'];
  
  const name = RNG.pick(names);
  const role = RNG.pick(roles);
  
  const medicLines = {
    greeting: `"Let me see those wounds, fighter."`,
    heal: `"This will sting, but you'll live."`,
    warning: `"Be careful out there. I can't fix everything."`,
    death_react: `"Another one lost... I tried my best."`
  };
  
  const trainerLines = {
    greeting: `"Ready for another lesson?"`,
    train: `"Again! Faster this time!"`,
    warning: `"Don't get cocky. Pride kills fighters."`,
    death_react: `"A waste of talent... such a waste."`
  };
  
  return {
    name,
    role,
    lines: role === 'medic' ? medicLines : trainerLines
  };
}
