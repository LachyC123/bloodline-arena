/**
 * CombatEntry - Hardened combat entry pipeline
 * Validates state before entering combat, prevents black screens
 */

import { SaveSystem, RunState } from './SaveSystem';
import { generateEnemy } from './EnemySystem';
import { Fighter } from './FighterSystem';
import { errorOverlay, logSceneTransition } from './ErrorOverlay';

// EnemyFighter is just Fighter with optional mutatorIds for our purposes here
export type EnemyLike = Fighter & { mutatorIds?: string[] };

export interface CombatEntryParams {
  nodeId?: string;
  nodeType?: 'fight' | 'elite' | 'champion' | 'rival';
  enemySeed?: number;
  isElite?: boolean;
  isChampion?: boolean;
}

export interface CurrentEncounter {
  enemy: EnemyLike;
  nodeId?: string;
  nodeType: string;
  isElite: boolean;
  isChampion: boolean;
  timestamp: number;
}

export interface CombatEntryResult {
  success: boolean;
  error?: string;
  encounter?: CurrentEncounter;
}

/**
 * Validate run state before combat
 */
export function validateRunState(): { valid: boolean; error?: string; run?: RunState; fighter?: Fighter } {
  try {
    const run = SaveSystem.getRun();
    
    if (!run) {
      return { valid: false, error: 'No active run found' };
    }
    
    if (!run.fighter) {
      return { valid: false, error: 'No active fighter in run' };
    }
    
    const fighter = run.fighter;
    
    if (fighter.status === 'dead') {
      return { valid: false, error: 'Fighter is dead' };
    }
    
    if (fighter.currentStats.currentHP <= 0) {
      return { valid: false, error: 'Fighter has no HP' };
    }
    
    return { valid: true, run, fighter };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { valid: false, error: `State validation failed: ${error}` };
  }
}

/**
 * Generate enemy for combat
 */
export function generateEncounterEnemy(
  league: string,
  week: number,
  params: CombatEntryParams
): { success: boolean; enemy?: EnemyLike; error?: string } {
  try {
    // Determine enemy tier
    const isElite = params.isElite || params.nodeType === 'elite';
    const isChampion = params.isChampion || params.nodeType === 'champion';
    const tier = isChampion ? 'champion' : isElite ? 'elite' : 'normal';
    
    console.log(`[CombatEntry] Generating enemy: league=${league}, week=${week}, tier=${tier}`);
    console.log(`[CombatEntry] isElite=${isElite}, isChampion=${isChampion}, nodeType=${params.nodeType}`);
    
    // Generate base enemy
    const enemy = generateEnemy(league as any, week);
    
    if (!enemy) {
      console.error('[CombatEntry] generateEnemy returned null/undefined');
      return { success: false, error: 'Enemy generation returned null' };
    }
    
    if (!enemy.firstName || !enemy.currentStats) {
      console.error('[CombatEntry] Enemy missing required properties:', {
        hasFirstName: !!enemy.firstName,
        hasCurrentStats: !!enemy.currentStats
      });
      return { success: false, error: 'Generated enemy is incomplete' };
    }
    
    // Apply elite/champion stat multipliers
    if (isElite) {
      console.log('[CombatEntry] Applying elite stat buffs');
      enemy.currentStats.maxHP = Math.round(enemy.currentStats.maxHP * 1.3);
      enemy.currentStats.currentHP = enemy.currentStats.maxHP;
      enemy.currentStats.attack = Math.round(enemy.currentStats.attack * 1.2);
      enemy.currentStats.defense = Math.round(enemy.currentStats.defense * 1.15);
      enemy.nickname = `Elite ${enemy.nickname}`;
    }
    
    if (isChampion) {
      console.log('[CombatEntry] Applying champion stat buffs');
      enemy.currentStats.maxHP = Math.round(enemy.currentStats.maxHP * 1.5);
      enemy.currentStats.currentHP = enemy.currentStats.maxHP;
      enemy.currentStats.attack = Math.round(enemy.currentStats.attack * 1.4);
      enemy.currentStats.defense = Math.round(enemy.currentStats.defense * 1.3);
      enemy.currentStats.critChance += 10;
      enemy.nickname = `Champion ${enemy.nickname}`;
    }
    
    console.log(`[CombatEntry] Generated ${tier} enemy: ${enemy.firstName} "${enemy.nickname}"`);
    console.log(`[CombatEntry] Enemy stats: HP=${enemy.currentStats.maxHP}, ATK=${enemy.currentStats.attack}, DEF=${enemy.currentStats.defense}`);
    
    return { success: true, enemy };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : '';
    console.error('[CombatEntry] Enemy generation failed:', e);
    console.error('[CombatEntry] Stack:', stack);
    return { success: false, error: `Enemy generation failed: ${error}` };
  }
}

/**
 * Prepare combat encounter and store it
 */
export function prepareCombatEncounter(params: CombatEntryParams = {}): CombatEntryResult {
  console.log('[CombatEntry] Preparing combat encounter...');
  console.log('[CombatEntry] Params:', JSON.stringify(params));
  
  // Step 1: Validate run state
  const stateCheck = validateRunState();
  if (!stateCheck.valid) {
    console.error('[CombatEntry] State validation failed:', stateCheck.error);
    return { success: false, error: stateCheck.error };
  }
  
  const run = stateCheck.run!;
  const fighter = stateCheck.fighter!;
  
  console.log(`[CombatEntry] Fighter: ${fighter.firstName} "${fighter.nickname}", HP: ${fighter.currentStats.currentHP}/${fighter.currentStats.maxHP}`);
  
  // Step 2: Generate enemy
  const enemyResult = generateEncounterEnemy(
    run.league,
    run.week,
    params
  );
  
  if (!enemyResult.success) {
    console.error('[CombatEntry] Enemy generation failed:', enemyResult.error);
    return { success: false, error: enemyResult.error };
  }
  
  // Step 3: Create encounter object
  const encounter: CurrentEncounter = {
    enemy: enemyResult.enemy!,
    nodeId: params.nodeId,
    nodeType: params.nodeType || 'fight',
    isElite: params.isElite || params.nodeType === 'elite',
    isChampion: params.isChampion || params.nodeType === 'champion',
    timestamp: Date.now()
  };
  
  // Step 4: Store in registry (will be read by FightScene)
  // We don't store in SaveSystem to avoid serialization issues with enemy
  console.log('[CombatEntry] Encounter prepared successfully');
  
  return { success: true, encounter };
}

/**
 * Start combat with full validation
 * Returns true if combat started, false if error (with error shown)
 */
export function startCombat(
  scene: Phaser.Scene,
  params: CombatEntryParams = {}
): boolean {
  logSceneTransition(scene.scene.key, 'FightScene', params as Record<string, unknown>);
  
  // Prepare encounter
  const result = prepareCombatEncounter(params);
  
  if (!result.success) {
    // Show error and don't navigate
    errorOverlay.addSceneError('CombatEntry', 'prepareCombatEncounter', result.error || 'Unknown error');
    showCombatError(scene, result.error || 'Failed to start combat');
    return false;
  }
  
  // Store encounter in registry for FightScene to read
  scene.registry.set('currentEncounter', result.encounter);
  
  // Navigate to fight scene
  try {
    scene.cameras.main.fadeOut(300);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
      scene.scene.start('FightScene');
    });
    
    // Failsafe: if fade doesn't complete in 2s, force transition
    scene.time.delayedCall(2000, () => {
      if (scene.scene.isActive(scene.scene.key)) {
        console.warn('[CombatEntry] Fade timeout, forcing transition');
        scene.scene.start('FightScene');
      }
    });
    
    return true;
  } catch (e) {
    console.error('[CombatEntry] Failed to start FightScene:', e);
    errorOverlay.addSceneError('CombatEntry', 'scene.start', e as Error);
    return false;
  }
}

/**
 * Start combat via PrepareScene (for equipment selection)
 */
export function startPrepareScene(
  scene: Phaser.Scene,
  params: CombatEntryParams = {}
): boolean {
  logSceneTransition(scene.scene.key, 'PrepareScene', params as Record<string, unknown>);
  
  // Validate state first
  const stateCheck = validateRunState();
  if (!stateCheck.valid) {
    errorOverlay.addSceneError('CombatEntry', 'validateRunState', stateCheck.error || 'Unknown error');
    showCombatError(scene, stateCheck.error || 'Cannot enter combat');
    return false;
  }
  
  // Store params in registry for PrepareScene
  scene.registry.set('combatParams', params);
  
  try {
    scene.cameras.main.fadeOut(300);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
      scene.scene.start('PrepareScene', params);
    });
    
    // Failsafe
    scene.time.delayedCall(2000, () => {
      if (scene.scene.isActive(scene.scene.key)) {
        console.warn('[CombatEntry] Fade timeout, forcing transition');
        scene.scene.start('PrepareScene', params);
      }
    });
    
    return true;
  } catch (e) {
    console.error('[CombatEntry] Failed to start PrepareScene:', e);
    errorOverlay.addSceneError('CombatEntry', 'scene.start', e as Error);
    return false;
  }
}

/**
 * Show combat error modal in scene
 */
function showCombatError(scene: Phaser.Scene, message: string): void {
  const { width, height } = scene.cameras.main;
  
  // Ensure camera is visible
  scene.cameras.main.setAlpha(1);
  scene.cameras.main.resetFX();
  
  // Semi-transparent overlay
  const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
  overlay.setDepth(5000);
  overlay.setInteractive(); // Block clicks behind
  
  // Modal background
  const modalBg = scene.add.rectangle(width / 2, height / 2, 280, 180, 0x2a1a1a);
  modalBg.setStrokeStyle(2, 0x8b0000);
  modalBg.setDepth(5001);
  
  // Error icon
  scene.add.text(width / 2, height / 2 - 50, '⚠️', {
    fontSize: '32px'
  }).setOrigin(0.5).setDepth(5002);
  
  // Error title
  scene.add.text(width / 2, height / 2 - 15, 'Cannot Start Combat', {
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    color: '#ff6666'
  }).setOrigin(0.5).setDepth(5002);
  
  // Error message
  scene.add.text(width / 2, height / 2 + 15, message, {
    fontFamily: 'Georgia, serif',
    fontSize: '11px',
    color: '#cc8888',
    wordWrap: { width: 240 },
    align: 'center'
  }).setOrigin(0.5).setDepth(5002);
  
  // Return button
  const btnBg = scene.add.rectangle(width / 2, height / 2 + 60, 140, 36, 0x3a2a1a);
  btnBg.setStrokeStyle(2, 0x8b7355);
  btnBg.setDepth(5002);
  btnBg.setInteractive({ useHandCursor: true });
  
  scene.add.text(width / 2, height / 2 + 60, 'Return to Map', {
    fontFamily: 'Georgia, serif',
    fontSize: '12px',
    color: '#c9a959'
  }).setOrigin(0.5).setDepth(5003);
  
  btnBg.on('pointerdown', () => {
    overlay.destroy();
    modalBg.destroy();
    scene.scene.start('RunMapScene');
  });
}

/**
 * Clear current encounter data
 */
export function clearEncounter(scene: Phaser.Scene): void {
  scene.registry.remove('currentEncounter');
  scene.registry.remove('combatParams');
  console.log('[CombatEntry] Encounter cleared');
}
