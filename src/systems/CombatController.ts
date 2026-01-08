/**
 * CombatController - Centralized combat action handling
 * All combat actions route through here to prevent softlocks
 */

import { CombatState, CombatAction, TargetZone, executeAction, nextTurn } from './CombatSystem';
import { SaveSystem } from './SaveSystem';

// Combat controller state
interface CombatControllerState {
  scene: Phaser.Scene | null;
  combatState: CombatState | null;
  isResolvingAction: boolean;
  actionQueue: CombatAction[];
  resolutionStartTime: number;
  onActionComplete: (() => void) | null;
  onInputStateChange: ((enabled: boolean) => void) | null;
  debugMode: boolean;
}

const state: CombatControllerState = {
  scene: null,
  combatState: null,
  isResolvingAction: false,
  actionQueue: [],
  resolutionStartTime: 0,
  onActionComplete: null,
  onInputStateChange: null,
  debugMode: false
};

// Anti-softlock timeout (3 seconds)
const SOFTLOCK_TIMEOUT = 3000;
let softlockCheckInterval: number | null = null;

/**
 * Initialize controller for a combat scene
 */
export function initCombatController(
  scene: Phaser.Scene,
  combatState: CombatState,
  onInputStateChange: (enabled: boolean) => void
): void {
  state.scene = scene;
  state.combatState = combatState;
  state.isResolvingAction = false;
  state.actionQueue = [];
  state.resolutionStartTime = 0;
  state.onInputStateChange = onInputStateChange;
  state.debugMode = SaveSystem.getSettings().debugMode || false;
  
  // Start softlock check
  if (softlockCheckInterval) {
    clearInterval(softlockCheckInterval);
  }
  softlockCheckInterval = window.setInterval(checkForSoftlock, 1000);
  
  log('Combat controller initialized');
}

/**
 * Clean up controller
 */
export function destroyCombatController(): void {
  if (softlockCheckInterval) {
    clearInterval(softlockCheckInterval);
    softlockCheckInterval = null;
  }
  state.scene = null;
  state.combatState = null;
  state.isResolvingAction = false;
  state.actionQueue = [];
}

/**
 * Update combat state reference (after mutations)
 */
export function updateCombatState(combatState: CombatState): void {
  state.combatState = combatState;
}

/**
 * Check if player can take an action
 */
export function canPlayerAct(): { canAct: boolean; reason: string } {
  if (!state.combatState) {
    return { canAct: false, reason: 'No combat state' };
  }
  
  if (state.isResolvingAction) {
    return { canAct: false, reason: 'Action in progress' };
  }
  
  if (state.combatState.turn !== 'player') {
    return { canAct: false, reason: 'Not player turn' };
  }
  
  if (state.combatState.phase === 'end') {
    return { canAct: false, reason: 'Combat ended' };
  }
  
  return { canAct: true, reason: 'OK' };
}

/**
 * Check stamina requirement
 */
export function hasEnoughStamina(action: CombatAction): boolean {
  if (!state.combatState) return false;
  
  const costs: Record<CombatAction, number> = {
    light_attack: 10,
    heavy_attack: 25,
    guard: 5,
    dodge: 15,
    special: 20,
    item: 0
  };
  
  return state.combatState.player.currentStamina >= costs[action];
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
  
  log(`playerChooseAction: ${action}, canAct=${check.canAct}, reason=${check.reason}`);
  
  if (!check.canAct) {
    return { success: false, reason: check.reason };
  }
  
  if (!hasEnoughStamina(action)) {
    return { success: false, reason: 'Not enough stamina' };
  }
  
  if (action === 'special' && state.combatState!.player.currentFocus < 30) {
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
  state.isResolvingAction = true;
  state.resolutionStartTime = Date.now();
  
  if (state.onInputStateChange) {
    state.onInputStateChange(false);
  }
  
  log('Action resolution started');
}

/**
 * End action resolution (re-enables input if player's turn)
 * MUST be called in a finally block
 */
export function endActionResolution(): void {
  state.isResolvingAction = false;
  state.resolutionStartTime = 0;
  
  log('Action resolution ended');
  
  // Re-enable input if it's player's turn and combat isn't over
  if (state.combatState && 
      state.combatState.turn === 'player' && 
      state.combatState.phase !== 'end' &&
      !state.combatState.winner) {
    if (state.onInputStateChange) {
      state.onInputStateChange(true);
    }
  }
}

/**
 * Force end resolution (for softlock recovery)
 */
export function forceEndResolution(): void {
  console.error('[CombatController] FORCE ending resolution (softlock detected)');
  state.isResolvingAction = false;
  state.resolutionStartTime = 0;
  
  // Advance to next turn if stuck
  if (state.combatState && state.combatState.phase !== 'end') {
    nextTurn(state.combatState);
  }
  
  // Re-enable input
  if (state.onInputStateChange) {
    state.onInputStateChange(true);
  }
}

/**
 * Check for softlock condition
 */
function checkForSoftlock(): void {
  if (!state.isResolvingAction) return;
  
  const elapsed = Date.now() - state.resolutionStartTime;
  if (elapsed > SOFTLOCK_TIMEOUT) {
    console.error(`[CombatController] Softlock detected! Resolution stuck for ${elapsed}ms`);
    forceEndResolution();
  }
}

/**
 * Get current controller state for debug display
 */
export function getDebugState(): {
  isResolvingAction: boolean;
  turn: string;
  phase: string;
  playerHP: number;
  enemyHP: number;
  actionQueueLength: number;
  resolutionTime: number;
} {
  return {
    isResolvingAction: state.isResolvingAction,
    turn: state.combatState?.turn || 'none',
    phase: state.combatState?.phase || 'none',
    playerHP: state.combatState?.player.currentHP || 0,
    enemyHP: state.combatState?.enemy.currentHP || 0,
    actionQueueLength: state.actionQueue.length,
    resolutionTime: state.isResolvingAction ? Date.now() - state.resolutionStartTime : 0
  };
}

/**
 * Debug logging
 */
function log(message: string): void {
  if (state.debugMode) {
    console.log(`[CombatController] ${message}`);
  }
}
