/**
 * CombatController - Centralized combat action handling
 * All combat actions route through here to prevent softlocks
 * 
 * Turn State Machine:
 * - INIT: Combat just started, setup in progress
 * - PLAYER_TURN: Player can act
 * - RESOLVING: An action is being animated/processed
 * - ENEMY_TURN: Enemy is acting
 * - ENDED: Combat is over
 */

import { CombatState, CombatAction, TargetZone, nextTurn } from './CombatSystem';
import { SaveSystem } from './SaveSystem';

export type CombatPhase = 'INIT' | 'PLAYER_TURN' | 'RESOLVING' | 'ENEMY_TURN' | 'ENDED';

// Combat controller state - now uses a getter for combatState to ensure freshness
interface CombatControllerInstance {
  scene: Phaser.Scene | null;
  getCombatState: (() => CombatState | null) | null;
  phase: CombatPhase;
  lastPhaseChangeTime: number;
  onInputStateChange: ((enabled: boolean) => void) | null;
  debugMode: boolean;
}

let instance: CombatControllerInstance = {
  scene: null,
  getCombatState: null,
  phase: 'INIT',
  lastPhaseChangeTime: 0,
  onInputStateChange: null,
  debugMode: false
};

// Anti-softlock timeout (3 seconds)
const SOFTLOCK_TIMEOUT = 3000;
let softlockCheckInterval: number | null = null;

/**
 * Initialize controller for a combat scene
 * Uses a getter function to always get the current combat state
 */
export function initCombatController(
  scene: Phaser.Scene,
  getCombatState: () => CombatState,
  onInputStateChange: (enabled: boolean) => void
): void {
  // Clean up any previous instance
  destroyCombatController();
  
  instance = {
    scene,
    getCombatState,
    phase: 'INIT',
    lastPhaseChangeTime: Date.now(),
    onInputStateChange,
    debugMode: SaveSystem.getSettings().debugMode || false
  };
  
  // Start softlock check
  softlockCheckInterval = window.setInterval(checkForSoftlock, 1000);
  
  log(`Combat controller initialized, initial turn: ${getCombatState().turn}`);
  
  // Transition to appropriate phase based on initial turn
  const combatState = getCombatState();
  if (combatState.turn === 'player') {
    setPhase('PLAYER_TURN');
  } else {
    setPhase('ENEMY_TURN');
  }
}

/**
 * Clean up controller
 */
export function destroyCombatController(): void {
  if (softlockCheckInterval) {
    clearInterval(softlockCheckInterval);
    softlockCheckInterval = null;
  }
  instance = {
    scene: null,
    getCombatState: null,
    phase: 'INIT',
    lastPhaseChangeTime: 0,
    onInputStateChange: null,
    debugMode: false
  };
}

/**
 * Set the current phase
 */
export function setPhase(newPhase: CombatPhase): void {
  const oldPhase = instance.phase;
  instance.phase = newPhase;
  instance.lastPhaseChangeTime = Date.now();
  
  log(`Phase: ${oldPhase} -> ${newPhase}`);
  
  // Enable/disable input based on phase
  if (instance.onInputStateChange) {
    const shouldEnableInput = newPhase === 'PLAYER_TURN';
    instance.onInputStateChange(shouldEnableInput);
  }
}

/**
 * Get current phase
 */
export function getPhase(): CombatPhase {
  return instance.phase;
}

/**
 * Check if player can take an action
 */
export function canPlayerAct(): { canAct: boolean; reason: string } {
  const combatState = instance.getCombatState?.();
  
  if (!combatState) {
    return { canAct: false, reason: 'No combat state' };
  }
  
  // Check phase first (our explicit state machine)
  switch (instance.phase) {
    case 'INIT':
      return { canAct: false, reason: 'Starting...' };
    case 'RESOLVING':
      return { canAct: false, reason: 'Resolving...' };
    case 'ENEMY_TURN':
      return { canAct: false, reason: 'Enemy turn' };
    case 'ENDED':
      return { canAct: false, reason: 'Combat ended' };
    case 'PLAYER_TURN':
      // Continue to additional checks
      break;
  }
  
  // Also check the underlying combat state for safety
  if (combatState.winner) {
    setPhase('ENDED');
    return { canAct: false, reason: 'Combat ended' };
  }
  
  if (combatState.turn !== 'player') {
    // Sync phase with actual state
    setPhase('ENEMY_TURN');
    return { canAct: false, reason: 'Not player turn' };
  }
  
  return { canAct: true, reason: 'OK' };
}

/**
 * Check stamina requirement
 */
export function hasEnoughStamina(action: CombatAction): boolean {
  const combatState = instance.getCombatState?.();
  if (!combatState) return false;
  
  const costs: Record<CombatAction, number> = {
    light_attack: 10,
    heavy_attack: 25,
    guard: 5,
    dodge: 15,
    special: 20,
    item: 0
  };
  
  return combatState.player.currentStamina >= costs[action];
}

/**
 * Main entry point - player chooses an action
 * Returns true if action was queued/started, false if blocked
 */
export function playerChooseAction(
  action: CombatAction,
  targetZone: TargetZone = 'body'
): { success: boolean; reason: string } {
  const check = canPlayerAct();
  
  log(`playerChooseAction: ${action}, phase=${instance.phase}, canAct=${check.canAct}, reason=${check.reason}`);
  
  if (!check.canAct) {
    return { success: false, reason: check.reason };
  }
  
  if (!hasEnoughStamina(action)) {
    return { success: false, reason: 'Not enough stamina' };
  }
  
  const combatState = instance.getCombatState?.();
  if (action === 'special' && combatState && combatState.player.currentFocus < 30) {
    return { success: false, reason: 'Not enough focus' };
  }
  
  // Start resolution
  beginActionResolution();
  
  return { success: true, reason: 'Action started' };
}

/**
 * Begin action resolution (disables input)
 */
function beginActionResolution(): void {
  setPhase('RESOLVING');
  log('Action resolution started');
}

/**
 * Called when player's action and enemy response are complete
 * Switches back to player turn
 */
export function endActionResolution(): void {
  const combatState = instance.getCombatState?.();
  
  log('Action resolution ended');
  
  // Check if combat is over
  if (combatState?.winner) {
    setPhase('ENDED');
    return;
  }
  
  // Check if it should be player's turn now
  if (combatState?.turn === 'player') {
    setPhase('PLAYER_TURN');
  } else {
    setPhase('ENEMY_TURN');
  }
}

/**
 * Called when starting enemy turn
 */
export function beginEnemyTurn(): void {
  setPhase('ENEMY_TURN');
  log('Enemy turn started');
}

/**
 * Called when enemy turn ends and it's player's turn again
 */
export function endEnemyTurn(): void {
  const combatState = instance.getCombatState?.();
  
  log('Enemy turn ended');
  
  if (combatState?.winner) {
    setPhase('ENDED');
    return;
  }
  
  setPhase('PLAYER_TURN');
}

/**
 * Force end resolution (for softlock recovery)
 */
export function forceEndResolution(): void {
  console.error('[CombatController] FORCE ending resolution (softlock detected)');
  console.error('[CombatController] Current state:', getDebugState());
  
  const combatState = instance.getCombatState?.();
  
  // Force to player turn unless combat is over
  if (combatState?.winner) {
    setPhase('ENDED');
  } else {
    // Force switch to player turn
    if (combatState) {
      combatState.turn = 'player';
    }
    setPhase('PLAYER_TURN');
  }
}

/**
 * Check for softlock condition
 */
function checkForSoftlock(): void {
  if (instance.phase !== 'RESOLVING') return;
  
  const elapsed = Date.now() - instance.lastPhaseChangeTime;
  if (elapsed > SOFTLOCK_TIMEOUT) {
    console.error(`[CombatController] Softlock detected! Phase RESOLVING for ${elapsed}ms`);
    forceEndResolution();
  }
}

/**
 * Get current controller state for debug display
 */
export function getDebugState(): {
  phase: CombatPhase;
  turn: string;
  combatPhase: string;
  playerHP: number;
  enemyHP: number;
  timeSincePhaseChange: number;
  winner: string | null;
} {
  const combatState = instance.getCombatState?.();
  
  return {
    phase: instance.phase,
    turn: combatState?.turn || 'none',
    combatPhase: combatState?.phase || 'none',
    playerHP: combatState?.player.currentHP || 0,
    enemyHP: combatState?.enemy.currentHP || 0,
    timeSincePhaseChange: Date.now() - instance.lastPhaseChangeTime,
    winner: combatState?.winner || null
  };
}

/**
 * Debug logging
 */
function log(message: string): void {
  if (instance.debugMode) {
    console.log(`[CombatController] ${message}`);
  }
}
