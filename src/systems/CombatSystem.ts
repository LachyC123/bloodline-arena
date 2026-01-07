/**
 * CombatSystem - Turn-based combat mechanics
 */

import { Fighter, FighterStats, StatusEffect, Injury, applyInjury } from './FighterSystem';
import { RNG } from './RNGSystem';
import { INJURIES_DATA } from '../data/CombatData';

// Target zones
export type TargetZone = 'head' | 'body' | 'legs';

// Combat actions
export type CombatAction = 
  | 'light_attack' 
  | 'heavy_attack' 
  | 'guard' 
  | 'dodge' 
  | 'special' 
  | 'item';

// Action result
export interface ActionResult {
  success: boolean;
  damage: number;
  damageBlocked: number;
  targetZone: TargetZone;
  critical: boolean;
  perfectParry: boolean;
  counterDamage: number;
  statusApplied: StatusEffect | null;
  staminaCost: number;
  focusGained: number;
  focusSpent: number;
  hypeGained: number;
  message: string;
  effectMessage?: string;
}

// Combat state
export interface CombatState {
  player: CombatantState;
  enemy: CombatantState;
  round: number;
  turn: 'player' | 'enemy';
  phase: 'select_action' | 'select_target' | 'execute' | 'result' | 'end';
  crowdHype: number; // 0-100
  log: CombatLogEntry[];
  isParryWindow: boolean;
  parryWindowStart: number;
  winner: 'player' | 'enemy' | null;
  lastAction: ActionResult | null;
}

export interface CombatantState {
  fighter: Fighter;
  currentHP: number;
  currentStamina: number;
  currentFocus: number;
  injuryMeter: number; // 0-100, higher = more injury risk
  activeEffects: Map<StatusEffect, number>; // effect -> turns remaining
  guardStance: TargetZone | null;
  lastAction: CombatAction | null;
  consecutiveGuards: number;
}

export interface CombatLogEntry {
  round: number;
  actor: 'player' | 'enemy';
  action: CombatAction;
  result: ActionResult;
  timestamp: number;
}

// Action costs and properties
const ACTION_CONFIG = {
  light_attack: {
    staminaCost: 10,
    baseDamage: 1.0,
    accuracy: 0.9,
    focusGain: 5,
    hypeGain: 5
  },
  heavy_attack: {
    staminaCost: 25,
    baseDamage: 1.8,
    accuracy: 0.75,
    focusGain: 10,
    hypeGain: 15
  },
  guard: {
    staminaCost: 5,
    blockMultiplier: 0.6,
    focusGain: 3,
    hypeGain: 0
  },
  dodge: {
    staminaCost: 15,
    evasionBonus: 0.3,
    focusGain: 5,
    hypeGain: 10
  },
  special: {
    staminaCost: 20,
    focusCost: 30,
    baseDamage: 2.0,
    accuracy: 0.85,
    hypeGain: 25
  },
  item: {
    staminaCost: 0,
    focusGain: 0,
    hypeGain: -5
  }
};

// Zone hit modifiers
const ZONE_MODIFIERS: Record<TargetZone, { damage: number; critBonus: number; effect: StatusEffect | null }> = {
  head: { damage: 1.2, critBonus: 0.1, effect: 'concuss' },
  body: { damage: 1.0, critBonus: 0, effect: null },
  legs: { damage: 0.9, critBonus: -0.05, effect: 'cripple' }
};

/**
 * Initialize combat state
 */
export function initCombat(player: Fighter, enemy: Fighter): CombatState {
  return {
    player: createCombatantState(player),
    enemy: createCombatantState(enemy),
    round: 1,
    turn: player.currentStats.speed >= enemy.currentStats.speed ? 'player' : 'enemy',
    phase: 'select_action',
    crowdHype: 30,
    log: [],
    isParryWindow: false,
    parryWindowStart: 0,
    winner: null,
    lastAction: null
  };
}

function createCombatantState(fighter: Fighter): CombatantState {
  return {
    fighter,
    currentHP: fighter.currentStats.currentHP,
    currentStamina: fighter.currentStats.currentStamina,
    currentFocus: 0,
    injuryMeter: 0,
    activeEffects: new Map(),
    guardStance: null,
    lastAction: null,
    consecutiveGuards: 0
  };
}

/**
 * Execute a combat action
 */
export function executeAction(
  state: CombatState,
  actor: 'player' | 'enemy',
  action: CombatAction,
  targetZone: TargetZone,
  itemId?: string
): ActionResult {
  const attacker = state[actor];
  const defender = state[actor === 'player' ? 'enemy' : 'player'];
  const config = ACTION_CONFIG[action];
  
  let result: ActionResult = {
    success: false,
    damage: 0,
    damageBlocked: 0,
    targetZone,
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: config.staminaCost,
    focusGained: 0,
    focusSpent: 0,
    hypeGained: 0,
    message: ''
  };
  
  // Check stamina
  if (attacker.currentStamina < config.staminaCost) {
    result.message = `${attacker.fighter.firstName} is too exhausted!`;
    return result;
  }
  
  // Spend stamina
  attacker.currentStamina -= config.staminaCost;
  
  switch (action) {
    case 'light_attack':
    case 'heavy_attack':
      result = executeAttack(state, attacker, defender, action, targetZone);
      break;
      
    case 'guard':
      result = executeGuard(attacker, targetZone);
      break;
      
    case 'dodge':
      result = executeDodge(attacker);
      break;
      
    case 'special':
      result = executeSpecial(state, attacker, defender, targetZone);
      break;
      
    case 'item':
      result = executeItem(attacker, itemId);
      break;
  }
  
  // Update last action
  attacker.lastAction = action;
  
  // Add to log
  state.log.push({
    round: state.round,
    actor,
    action,
    result,
    timestamp: Date.now()
  });
  
  // Update crowd hype
  state.crowdHype = Math.max(0, Math.min(100, state.crowdHype + result.hypeGained));
  
  // Check for combat end
  if (defender.currentHP <= 0) {
    state.winner = actor;
    state.phase = 'end';
  } else if (attacker.currentHP <= 0) {
    state.winner = actor === 'player' ? 'enemy' : 'player';
    state.phase = 'end';
  }
  
  state.lastAction = result;
  
  return result;
}

function executeAttack(
  state: CombatState,
  attacker: CombatantState,
  defender: CombatantState,
  action: 'light_attack' | 'heavy_attack',
  targetZone: TargetZone
): ActionResult {
  const config = ACTION_CONFIG[action];
  const zoneModifier = ZONE_MODIFIERS[targetZone];
  
  const result: ActionResult = {
    success: false,
    damage: 0,
    damageBlocked: 0,
    targetZone,
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: config.staminaCost,
    focusGained: 0,
    focusSpent: 0,
    hypeGained: 0,
    message: ''
  };
  
  // Calculate hit chance
  let hitChance = config.accuracy * (attacker.fighter.currentStats.accuracy / 100);
  
  // Check for dodge stance
  if (defender.lastAction === 'dodge') {
    hitChance -= ACTION_CONFIG.dodge.evasionBonus;
  }
  
  // Apply effects
  if (attacker.activeEffects.has('concuss')) hitChance -= 0.15;
  if (defender.activeEffects.has('cripple') && targetZone === 'legs') hitChance += 0.1;
  
  // Roll to hit
  if (RNG.chance(hitChance)) {
    result.success = true;
    
    // Calculate damage
    let baseDamage = attacker.fighter.currentStats.attack * config.baseDamage;
    baseDamage *= zoneModifier.damage;
    
    // Check for crit
    const critChance = (attacker.fighter.currentStats.critChance / 100) + zoneModifier.critBonus;
    if (RNG.chance(critChance)) {
      result.critical = true;
      baseDamage *= attacker.fighter.currentStats.critDamage / 100;
      result.hypeGained += 10;
    }
    
    // Check for guard
    if (defender.lastAction === 'guard' && defender.guardStance === targetZone) {
      result.damageBlocked = baseDamage * ACTION_CONFIG.guard.blockMultiplier;
      baseDamage -= result.damageBlocked;
      
      // Perfect parry check (handled separately via timing)
      result.message = `${defender.fighter.firstName} blocked! `;
    }
    
    // Apply defense
    const defense = defender.fighter.currentStats.defense;
    const finalDamage = Math.max(1, Math.round(baseDamage - defense * 0.3));
    
    result.damage = finalDamage;
    defender.currentHP -= finalDamage;
    
    // Track lowest HP
    if (defender.currentHP < defender.fighter.closestCall) {
      defender.fighter.closestCall = defender.currentHP;
    }
    
    // Update injury meter
    defender.injuryMeter += finalDamage * 0.5;
    if (result.critical) defender.injuryMeter += 10;
    
    // Check for status effect
    if (zoneModifier.effect && RNG.chance(0.2 + (result.critical ? 0.1 : 0))) {
      result.statusApplied = zoneModifier.effect;
      defender.activeEffects.set(zoneModifier.effect, 3);
    }
    
    // Focus gain
    result.focusGained = config.focusGain;
    attacker.currentFocus = Math.min(
      attacker.fighter.currentStats.maxFocus,
      attacker.currentFocus + result.focusGained
    );
    
    // Hype gain
    result.hypeGained += config.hypeGain;
    
    // Build message
    const attackName = action === 'light_attack' ? 'quick strike' : 'heavy blow';
    result.message += `${attacker.fighter.firstName}'s ${attackName} hits the ${targetZone} for ${finalDamage} damage!`;
    if (result.critical) result.message += ' CRITICAL HIT!';
    if (result.statusApplied) result.message += ` ${defender.fighter.firstName} is ${result.statusApplied}ed!`;
    
  } else {
    result.message = `${attacker.fighter.firstName}'s attack misses!`;
    if (defender.lastAction === 'dodge') {
      result.message = `${defender.fighter.firstName} dodges the attack!`;
      result.hypeGained = 5;
    }
  }
  
  return result;
}

function executeGuard(attacker: CombatantState, targetZone: TargetZone): ActionResult {
  attacker.guardStance = targetZone;
  attacker.consecutiveGuards++;
  
  const focusGain = ACTION_CONFIG.guard.focusGain * Math.min(attacker.consecutiveGuards, 3);
  attacker.currentFocus = Math.min(
    attacker.fighter.currentStats.maxFocus,
    attacker.currentFocus + focusGain
  );
  
  return {
    success: true,
    damage: 0,
    damageBlocked: 0,
    targetZone,
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: ACTION_CONFIG.guard.staminaCost,
    focusGained: focusGain,
    focusSpent: 0,
    hypeGained: 0,
    message: `${attacker.fighter.firstName} raises guard to protect ${targetZone}!`
  };
}

function executeDodge(attacker: CombatantState): ActionResult {
  attacker.guardStance = null;
  attacker.consecutiveGuards = 0;
  
  return {
    success: true,
    damage: 0,
    damageBlocked: 0,
    targetZone: 'body',
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: ACTION_CONFIG.dodge.staminaCost,
    focusGained: ACTION_CONFIG.dodge.focusGain,
    focusSpent: 0,
    hypeGained: ACTION_CONFIG.dodge.hypeGain,
    message: `${attacker.fighter.firstName} prepares to dodge!`
  };
}

function executeSpecial(
  state: CombatState,
  attacker: CombatantState,
  defender: CombatantState,
  targetZone: TargetZone
): ActionResult {
  const config = ACTION_CONFIG.special;
  
  // Check focus
  if (attacker.currentFocus < config.focusCost) {
    return {
      success: false,
      damage: 0,
      damageBlocked: 0,
      targetZone,
      critical: false,
      perfectParry: false,
      counterDamage: 0,
      statusApplied: null,
      staminaCost: 0,
      focusGained: 0,
      focusSpent: 0,
      hypeGained: -5,
      message: `${attacker.fighter.firstName} lacks focus for a special move!`
    };
  }
  
  attacker.currentFocus -= config.focusCost;
  attacker.fighter.signatureMoveUses++;
  
  // Special attacks always hit with high damage
  const baseDamage = attacker.fighter.currentStats.attack * config.baseDamage;
  const finalDamage = Math.round(baseDamage * RNG.float(0.9, 1.2));
  
  defender.currentHP -= finalDamage;
  defender.injuryMeter += finalDamage * 0.7;
  
  return {
    success: true,
    damage: finalDamage,
    damageBlocked: 0,
    targetZone,
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: config.staminaCost,
    focusGained: 0,
    focusSpent: config.focusCost,
    hypeGained: config.hypeGain,
    message: `${attacker.fighter.firstName} unleashes "${attacker.fighter.signatureTrait.name}"! ${finalDamage} damage!`
  };
}

function executeItem(attacker: CombatantState, itemId?: string): ActionResult {
  // Basic healing item for now
  const healAmount = 30;
  attacker.currentHP = Math.min(
    attacker.fighter.currentStats.maxHP,
    attacker.currentHP + healAmount
  );
  
  return {
    success: true,
    damage: 0,
    damageBlocked: 0,
    targetZone: 'body',
    critical: false,
    perfectParry: false,
    counterDamage: 0,
    statusApplied: null,
    staminaCost: 0,
    focusGained: 0,
    focusSpent: 0,
    hypeGained: -5,
    message: `${attacker.fighter.firstName} uses a healing item! Restored ${healAmount} HP.`
  };
}

/**
 * Handle perfect parry timing
 */
export function attemptPerfectParry(
  state: CombatState,
  defender: 'player' | 'enemy',
  timing: number // 0-1, how close to perfect
): ActionResult | null {
  if (!state.isParryWindow) return null;
  
  const parryThreshold = 0.15; // 15% window for perfect parry
  const defenderState = state[defender];
  
  if (timing < parryThreshold) {
    // Perfect parry!
    const focusGain = 15;
    defenderState.currentFocus = Math.min(
      defenderState.fighter.currentStats.maxFocus,
      defenderState.currentFocus + focusGain
    );
    defenderState.fighter.perfectParries++;
    
    // Counter damage
    const counterDamage = Math.round(defenderState.fighter.currentStats.attack * 0.5);
    const attacker = defender === 'player' ? state.enemy : state.player;
    attacker.currentHP -= counterDamage;
    
    return {
      success: true,
      damage: 0,
      damageBlocked: state.lastAction?.damage || 0,
      targetZone: 'body',
      critical: false,
      perfectParry: true,
      counterDamage,
      statusApplied: null,
      staminaCost: 0,
      focusGained: focusGain,
      focusSpent: 0,
      hypeGained: 20,
      message: `PERFECT PARRY! ${defenderState.fighter.firstName} counters for ${counterDamage} damage!`
    };
  }
  
  return null;
}

/**
 * Process end of turn effects
 */
export function processTurnEnd(state: CombatState): void {
  // Process both combatants
  for (const role of ['player', 'enemy'] as const) {
    const combatant = state[role];
    
    // Regenerate stamina
    combatant.currentStamina = Math.min(
      combatant.fighter.currentStats.maxStamina,
      combatant.currentStamina + 10
    );
    
    // Process status effects
    for (const [effect, turns] of combatant.activeEffects) {
      // Apply ongoing damage for bleed
      if (effect === 'bleed') {
        combatant.currentHP -= 5;
        state.log.push({
          round: state.round,
          actor: role,
          action: 'light_attack',
          result: {
            success: true,
            damage: 5,
            damageBlocked: 0,
            targetZone: 'body',
            critical: false,
            perfectParry: false,
            counterDamage: 0,
            statusApplied: null,
            staminaCost: 0,
            focusGained: 0,
            focusSpent: 0,
            hypeGained: 0,
            message: `${combatant.fighter.firstName} bleeds for 5 damage!`
          },
          timestamp: Date.now()
        });
      }
      
      // Decrement turn counter
      if (turns <= 1) {
        combatant.activeEffects.delete(effect);
      } else {
        combatant.activeEffects.set(effect, turns - 1);
      }
    }
    
    // Reset guard if not guarding
    if (combatant.lastAction !== 'guard') {
      combatant.guardStance = null;
      combatant.consecutiveGuards = 0;
    }
  }
}

/**
 * Switch turns
 */
export function nextTurn(state: CombatState): void {
  processTurnEnd(state);
  state.turn = state.turn === 'player' ? 'enemy' : 'player';
  
  // Increment round when back to player
  if (state.turn === 'player') {
    state.round++;
  }
  
  state.phase = 'select_action';
  state.isParryWindow = false;
}

/**
 * Check if injury should occur after combat
 */
export function rollForInjury(combatant: CombatantState, won: boolean): Injury | null {
  // Injury chance based on injury meter
  const injuryChance = combatant.injuryMeter / 200; // 50% at 100 meter
  
  if (!won) {
    // Losers always get injured
    return generateInjury('moderate');
  }
  
  if (RNG.chance(injuryChance)) {
    const severity = combatant.injuryMeter > 80 ? 'severe' : 
                     combatant.injuryMeter > 40 ? 'moderate' : 'minor';
    return generateInjury(severity);
  }
  
  return null;
}

function generateInjury(severity: 'minor' | 'moderate' | 'severe'): Injury {
  const injuries = INJURIES_DATA.filter(i => i.severity === severity);
  const template = RNG.pick(injuries);
  
  return {
    ...template,
    id: `injury_${RNG.id(8)}`
  };
}

/**
 * Calculate combat rewards
 */
export function calculateRewards(
  state: CombatState,
  won: boolean,
  league: string
): { gold: number; fame: number; xp: number } {
  if (!won) {
    return { gold: 0, fame: 0, xp: 10 };
  }
  
  const leagueMultiplier = league === 'bronze' ? 1 : league === 'silver' ? 1.5 : 2;
  const hypeBonus = 1 + (state.crowdHype / 100) * 0.5;
  
  const baseGold = 20 + state.round * 5;
  const baseFame = 10 + state.round * 2;
  const baseXP = 25 + state.round * 5;
  
  return {
    gold: Math.round(baseGold * leagueMultiplier * hypeBonus),
    fame: Math.round(baseFame * leagueMultiplier * hypeBonus),
    xp: Math.round(baseXP * leagueMultiplier)
  };
}
