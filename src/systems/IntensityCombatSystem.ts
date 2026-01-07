/**
 * IntensityCombatSystem - Extension of CombatSystem with intensity mechanics
 * Adds Momentum, Wounds, Stances, Armor Break, Adrenaline, and Enemy Enrage
 */

import { CombatState, CombatantState, ActionResult, CombatAction, TargetZone } from './CombatSystem';
import { SaveSystem } from './SaveSystem';
import { 
  MOMENTUM_CONFIG, 
  STANCES, 
  StanceType, 
  WOUND_THRESHOLDS,
  WOUNDS,
  Wound,
  ARMOR_BREAK_CONFIG,
  ADRENALINE_CONFIG,
  ENRAGE_CONFIG,
  rollForWound,
  WoundSeverity
} from '../data/IntensityMechanics';
import { EnemyClass, getClassWeaknessMultiplier, getClassEffectChanceMultiplier } from '../data/EnemyClassData';
import { WeaponData, getWeaponById } from '../data/WeaponsData';
import { calculateLoadoutStats } from './InventorySystem';

// Extended combat state with intensity mechanics
export interface IntensityCombatState extends CombatState {
  playerMomentum: number;
  enemyMomentum: number;
  playerStance: StanceType;
  enemyStance: StanceType;
  playerWounds: Wound[];
  enemyWounds: Wound[];
  playerArmorBreak: number;
  enemyArmorBreak: number;
  playerAdrenalineAvailable: boolean;
  playerAdrenalineUsed: boolean;
  enemyEnraged: boolean;
  enemyClass?: EnemyClass;
  playerWeapon?: WeaponData;
  
  // Wound thresholds crossed
  playerWoundThresholds: number[];
  enemyWoundThresholds: number[];
}

// Initialize enhanced combat state
export function initIntensityCombat(baseState: CombatState, enemyClass?: EnemyClass): IntensityCombatState {
  // Get player weapon from loadout
  const inventory = SaveSystem.getInventory();
  const loadout = SaveSystem.getLoadout();
  let playerWeapon: WeaponData | undefined;
  
  if (loadout.weaponId) {
    const weaponInstance = inventory.find(i => i.instanceId === loadout.weaponId);
    if (weaponInstance) {
      playerWeapon = getWeaponById(weaponInstance.itemId);
    }
  }
  
  return {
    ...baseState,
    playerMomentum: 0,
    enemyMomentum: 0,
    playerStance: SaveSystem.getStance(),
    enemyStance: 'balanced',
    playerWounds: [],
    enemyWounds: [],
    playerArmorBreak: 0,
    enemyArmorBreak: 0,
    playerAdrenalineAvailable: true,
    playerAdrenalineUsed: false,
    enemyEnraged: false,
    enemyClass,
    playerWeapon,
    playerWoundThresholds: [],
    enemyWoundThresholds: []
  };
}

// Apply stance modifiers to action
export function applyStanceModifiers(
  state: IntensityCombatState, 
  actor: 'player' | 'enemy',
  result: ActionResult
): ActionResult {
  const stance = actor === 'player' ? state.playerStance : state.enemyStance;
  const stanceData = STANCES[stance];
  
  // Apply damage modifier
  if (result.damage > 0) {
    result.damage = Math.round(result.damage * (1 + stanceData.effects.damageBonus / 100));
  }
  
  return result;
}

// Update momentum after action
export function updateMomentum(
  state: IntensityCombatState,
  actor: 'player' | 'enemy',
  action: CombatAction,
  result: ActionResult
): void {
  const config = MOMENTUM_CONFIG;
  let change = 0;
  
  if (result.success) {
    switch (action) {
      case 'light_attack':
        change = result.damage > 0 ? config.gainOnLightHit : config.lossOnMiss;
        break;
      case 'heavy_attack':
        change = result.damage > 0 ? config.gainOnHeavyHit : config.lossOnMiss;
        break;
      case 'guard':
        change = result.perfectParry ? config.gainOnParry : 0;
        break;
      case 'dodge':
        change = config.gainOnDodge;
        break;
      case 'special':
        change = config.gainOnSpecial;
        break;
    }
    
    if (result.critical) {
      change += config.gainOnCrit;
    }
  } else {
    change = config.lossOnMiss;
  }
  
  // Apply momentum gain rate modifiers
  if (actor === 'player') {
    state.playerMomentum = Math.max(0, Math.min(100, state.playerMomentum + change));
    SaveSystem.setMomentum(state.playerMomentum);
  } else {
    state.enemyMomentum = Math.max(0, Math.min(100, state.enemyMomentum + change));
  }
}

// Decay momentum at end of turn
export function decayMomentum(state: IntensityCombatState): void {
  state.playerMomentum = Math.max(0, state.playerMomentum + MOMENTUM_CONFIG.lossPerTurn);
  state.enemyMomentum = Math.max(0, state.enemyMomentum + MOMENTUM_CONFIG.lossPerTurn);
  SaveSystem.setMomentum(state.playerMomentum);
}

// Spend momentum for special action
export function spendMomentum(
  state: IntensityCombatState,
  actor: 'player' | 'enemy',
  cost: number
): boolean {
  if (actor === 'player') {
    if (state.playerMomentum >= cost) {
      state.playerMomentum -= cost;
      SaveSystem.setMomentum(state.playerMomentum);
      return true;
    }
  } else {
    if (state.enemyMomentum >= cost) {
      state.enemyMomentum -= cost;
      return true;
    }
  }
  return false;
}

// Check and apply wounds based on HP thresholds
export function checkForWounds(
  state: IntensityCombatState,
  target: 'player' | 'enemy',
  damageTaken: number,
  attackType: CombatAction,
  wasCrit: boolean
): Wound | null {
  const combatant = target === 'player' ? state.player : state.enemy;
  const maxHP = combatant.fighter.currentStats.maxHP;
  const currentHPPercent = (combatant.currentHP / maxHP) * 100;
  
  const thresholdsCrossed = target === 'player' ? state.playerWoundThresholds : state.enemyWoundThresholds;
  const wounds = target === 'player' ? state.playerWounds : state.enemyWounds;
  
  // Check each threshold
  let newWound: Wound | null = null;
  
  if (currentHPPercent <= WOUND_THRESHOLDS.first && !thresholdsCrossed.includes(75)) {
    thresholdsCrossed.push(75);
    newWound = rollForWound('minor', attackType, wasCrit);
  } else if (currentHPPercent <= WOUND_THRESHOLDS.second && !thresholdsCrossed.includes(50)) {
    thresholdsCrossed.push(50);
    newWound = rollForWound('major', attackType, wasCrit);
  } else if (currentHPPercent <= WOUND_THRESHOLDS.third && !thresholdsCrossed.includes(25)) {
    thresholdsCrossed.push(25);
    newWound = rollForWound('critical', attackType, wasCrit);
  }
  
  if (newWound) {
    wounds.push(newWound);
    
    if (target === 'player') {
      SaveSystem.addWound(newWound);
    }
  }
  
  return newWound;
}

// Get total wound effects for a combatant
export function getWoundEffects(wounds: Wound[]): Record<string, number> {
  const effects: Record<string, number> = {};
  
  for (const wound of wounds) {
    for (const effect of wound.effects) {
      effects[effect.type] = (effects[effect.type] || 0) + effect.value;
    }
  }
  
  return effects;
}

// Apply armor break
export function applyArmorBreak(
  state: IntensityCombatState,
  target: 'player' | 'enemy',
  stacks: number
): void {
  if (target === 'player') {
    state.playerArmorBreak = Math.min(
      ARMOR_BREAK_CONFIG.maxStacks,
      state.playerArmorBreak + stacks
    );
    SaveSystem.setArmorBreakStacks(state.playerArmorBreak);
  } else {
    state.enemyArmorBreak = Math.min(
      ARMOR_BREAK_CONFIG.maxStacks,
      state.enemyArmorBreak + stacks
    );
  }
}

// Calculate defense with armor break
export function getEffectiveDefense(
  baseDefense: number,
  armorBreakStacks: number,
  wounds: Wound[]
): number {
  // Apply armor break penalty
  const armorBreakPenalty = armorBreakStacks * ARMOR_BREAK_CONFIG.defenseReductionPerStack;
  let defense = baseDefense * (1 - armorBreakPenalty / 100);
  
  // Apply wound penalties
  const woundEffects = getWoundEffects(wounds);
  if (woundEffects.defense_penalty) {
    defense += woundEffects.defense_penalty;
  }
  
  return Math.max(0, Math.round(defense));
}

// Decay armor break at end of turn
export function decayArmorBreak(state: IntensityCombatState): void {
  state.playerArmorBreak = Math.max(0, state.playerArmorBreak - ARMOR_BREAK_CONFIG.decayPerTurn);
  state.enemyArmorBreak = Math.max(0, state.enemyArmorBreak - ARMOR_BREAK_CONFIG.decayPerTurn);
  SaveSystem.setArmorBreakStacks(state.playerArmorBreak);
}

// Check if adrenaline can be triggered
export function canTriggerAdrenaline(state: IntensityCombatState): boolean {
  const hpPercent = (state.player.currentHP / state.player.fighter.currentStats.maxHP) * 100;
  return (
    hpPercent <= ADRENALINE_CONFIG.triggerThreshold &&
    state.playerAdrenalineAvailable &&
    !state.playerAdrenalineUsed
  );
}

// Trigger adrenaline choice
export function useAdrenaline(
  state: IntensityCombatState,
  choice: 'last_stand' | 'second_wind'
): void {
  state.playerAdrenalineUsed = true;
  state.playerAdrenalineAvailable = false;
  SaveSystem.useAdrenaline();
  
  if (choice === 'last_stand') {
    // Apply temporary buffs (would be tracked in combat state)
    // The actual effect application would happen in the fight scene
  } else if (choice === 'second_wind') {
    // Heal and restore stamina
    const healAmount = Math.round(state.player.fighter.currentStats.maxHP * (ADRENALINE_CONFIG.secondWindHealPercent / 100));
    state.player.currentHP = Math.min(
      state.player.fighter.currentStats.maxHP,
      state.player.currentHP + healAmount
    );
    state.player.currentStamina = Math.min(
      state.player.fighter.currentStats.maxStamina,
      state.player.currentStamina + ADRENALINE_CONFIG.secondWindStaminaRestore
    );
  }
}

// Check and trigger enemy enrage
export function checkEnemyEnrage(state: IntensityCombatState): boolean {
  if (state.enemyEnraged) return false;
  
  const enemyHPPercent = (state.enemy.currentHP / state.enemy.fighter.currentStats.maxHP) * 100;
  const threshold = state.enemyClass?.behavior.enrageThreshold || ENRAGE_CONFIG.defaultThreshold;
  
  if (enemyHPPercent <= threshold) {
    state.enemyEnraged = true;
    return true;
  }
  
  return false;
}

// Get enrage bonuses for enemy
export function getEnrageModifiers(state: IntensityCombatState): {
  damageBonus: number;
  speedBonus: number;
  accuracyPenalty: number;
  defensePenalty: number;
} {
  if (!state.enemyEnraged) {
    return { damageBonus: 0, speedBonus: 0, accuracyPenalty: 0, defensePenalty: 0 };
  }
  
  return {
    damageBonus: ENRAGE_CONFIG.damageBonus,
    speedBonus: ENRAGE_CONFIG.speedBonus,
    accuracyPenalty: ENRAGE_CONFIG.accuracyPenalty,
    defensePenalty: ENRAGE_CONFIG.defensePenalty
  };
}

// Apply weapon effects to attack
export function applyWeaponEffects(
  state: IntensityCombatState,
  result: ActionResult,
  targetZone: TargetZone
): ActionResult {
  const weapon = state.playerWeapon;
  if (!weapon || result.damage === 0) return result;
  
  for (const effect of weapon.effects) {
    // Roll for effect
    if (Math.random() < effect.chance) {
      switch (effect.type) {
        case 'bleed':
          result.statusApplied = 'bleed';
          result.effectMessage = `Bleeding! (${effect.value} dmg/turn)`;
          break;
        case 'stun':
          result.statusApplied = 'stun';
          result.effectMessage = 'Stunned!';
          break;
        case 'armor_break':
          applyArmorBreak(state, 'enemy', effect.value);
          result.effectMessage = `Armor Break x${effect.value}!`;
          break;
        case 'poison':
          result.statusApplied = 'poison';
          result.effectMessage = `Poisoned! (${effect.value} dmg/turn)`;
          break;
        case 'momentum_gain':
          state.playerMomentum = Math.min(100, state.playerMomentum + effect.value);
          SaveSystem.setMomentum(state.playerMomentum);
          result.effectMessage = `Momentum +${effect.value}!`;
          break;
      }
    }
  }
  
  return result;
}

// Apply enemy class weakness multipliers
export function applyEnemyClassWeakness(
  state: IntensityCombatState,
  damage: number,
  effectType?: string
): number {
  if (!state.enemyClass) return damage;
  
  // Check for damage multipliers based on player weapon type
  // This is simplified - could check specific weapon effects
  const multiplier = effectType ? getClassWeaknessMultiplier(state.enemyClass, effectType) : 1.0;
  
  return Math.round(damage * multiplier);
}

// Get momentum bonus for attack
export function getMomentumBonus(momentum: number): number {
  if (momentum >= MOMENTUM_CONFIG.highMomentumThreshold) {
    return MOMENTUM_CONFIG.highMomentumDamageBonus;
  }
  return 0;
}

// Get momentum accuracy bonus
export function getMomentumAccuracyBonus(momentum: number): number {
  if (momentum >= MOMENTUM_CONFIG.highMomentumThreshold) {
    return MOMENTUM_CONFIG.highMomentumAccuracyBonus;
  }
  return 0;
}

// Process bleed damage from wounds
export function processWoundBleed(state: IntensityCombatState, target: 'player' | 'enemy'): number {
  const wounds = target === 'player' ? state.playerWounds : state.enemyWounds;
  const woundEffects = getWoundEffects(wounds);
  
  const bleedDamage = woundEffects.bleed_dot || 0;
  
  if (bleedDamage > 0) {
    const combatant = target === 'player' ? state.player : state.enemy;
    combatant.currentHP -= bleedDamage;
  }
  
  return bleedDamage;
}

// Get stance defense modifier
export function getStanceDefenseModifier(stance: StanceType): number {
  return STANCES[stance].effects.defenseBonus;
}

// Get stance damage modifier
export function getStanceDamageModifier(stance: StanceType): number {
  return STANCES[stance].effects.damageBonus;
}

// Calculate loadout-based damage
export function calculateLoadoutDamage(isHeavy: boolean): { min: number; max: number; staminaCost: number } {
  const inventory = SaveSystem.getInventory();
  const loadout = SaveSystem.getLoadout();
  const stats = calculateLoadoutStats(inventory, loadout);
  
  return {
    min: stats.damageMin,
    max: stats.damageMax,
    staminaCost: isHeavy ? stats.heavyStaminaCost : stats.lightStaminaCost
  };
}
