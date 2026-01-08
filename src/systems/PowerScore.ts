/**
 * PowerScore - Unified power rating system
 * Combines base stats, equipment, and buffs into a single meaningful number
 */

import { Fighter } from './FighterSystem';
import { SaveSystem } from './SaveSystem';
import { calculateLoadoutStats, LoadoutStats, ItemInstance, Loadout } from './InventorySystem';
import { Wound, getWoundEffects } from '../data/IntensityMechanics';
import { EnemyClass } from '../data/EnemyClassData';

export interface PowerBreakdown {
  // Categories
  baseStats: number;
  weapon: number;
  armor: number;
  traits: number;
  buffs: number;
  penalties: number;
  
  // Detailed breakdown
  details: {
    hp: number;
    damage: number;
    defense: number;
    stamina: number;
    crit: number;
    dodge: number;
    parry: number;
    speed: number;
    resistances: number;
    special: number;
  };
}

export interface PowerResult {
  power: number;
  breakdown: PowerBreakdown;
  tier: 'weak' | 'average' | 'strong' | 'elite' | 'champion';
}

// Power tier thresholds
const POWER_TIERS = {
  weak: 0,
  average: 100,
  strong: 200,
  elite: 350,
  champion: 500
};

// Weights for different stats (tuned for balance)
const WEIGHTS = {
  hp: 0.35,           // Per HP point
  damage: 1.8,        // Per average damage
  defense: 0.9,       // Per defense point
  stamina: 0.25,      // Per stamina point
  staminaRegen: 2.0,  // Per regen point
  crit: 1.2,          // Per crit % point
  critDamage: 0.15,   // Per crit damage %
  dodge: 1.0,         // Per dodge % point
  parry: 1.5,         // Per parry bonus
  speed: 3.0,         // Per speed point
  accuracy: 0.5,      // Per accuracy % point
  resistance: 0.3,    // Per resistance % point
  special: 5.0        // Per special synergy
};

// League scaling modifiers
const LEAGUE_MULTIPLIERS: Record<string, number> = {
  bronze: 1.0,
  silver: 1.05,
  gold: 1.1,
  champion: 1.15
};

/**
 * Calculate power score for the current player state
 */
export function calculatePower(fighter: Fighter, inventory?: ItemInstance[], loadout?: Loadout): PowerResult {
  const inv = inventory ?? SaveSystem.getInventory();
  const lo = loadout ?? SaveSystem.getLoadout();
  const loadoutStats = calculateLoadoutStats(inv, lo);
  const wounds = SaveSystem.getWounds();
  const run = SaveSystem.getRun();
  
  return calculatePowerFromStats(fighter, loadoutStats, wounds, run.league);
}

/**
 * Calculate power from raw stats (for display/comparison)
 */
export function calculatePowerFromStats(
  fighter: Fighter,
  loadoutStats: LoadoutStats,
  wounds: Wound[] = [],
  league: string = 'bronze'
): PowerResult {
  const stats = fighter.currentStats;
  const woundEffects = getWoundEffects(wounds);
  
  // Base stats contribution
  const hpScore = stats.maxHP * WEIGHTS.hp;
  const staminaScore = (stats.maxStamina * WEIGHTS.stamina) + 
                       ((loadoutStats.staminaRegenMod + 10) * WEIGHTS.staminaRegen);
  
  // Damage contribution
  const avgDamage = (loadoutStats.damageMin + loadoutStats.damageMax) / 2;
  const damageScore = (stats.attack + avgDamage) * WEIGHTS.damage;
  
  // Defense contribution
  const totalDefense = stats.defense + loadoutStats.totalDefense;
  const defenseScore = totalDefense * WEIGHTS.defense;
  
  // Crit contribution
  const critScore = (stats.critChance + loadoutStats.critChanceMod) * WEIGHTS.crit +
                    stats.critDamage * WEIGHTS.critDamage;
  
  // Dodge and speed
  const dodgeScore = (loadoutStats.dodgeMod + 10) * WEIGHTS.dodge;
  const speedScore = (stats.speed + loadoutStats.speedMod) * WEIGHTS.speed;
  
  // Parry (estimated from defense)
  const parryScore = (stats.defense / 5) * WEIGHTS.parry;
  
  // Accuracy
  const accuracyScore = (stats.accuracy + loadoutStats.accuracyMod) * WEIGHTS.accuracy;
  
  // Resistances
  const resistScore = (
    loadoutStats.bleedResist +
    loadoutStats.stunResist +
    loadoutStats.poisonResist +
    loadoutStats.critResist
  ) * WEIGHTS.resistance;
  
  // Special synergies (weapon effects)
  let specialScore = 0;
  if (loadoutStats.weaponEffects.length > 0) {
    specialScore += loadoutStats.weaponEffects.length * WEIGHTS.special;
  }
  if (loadoutStats.armorPerks.length > 0) {
    specialScore += loadoutStats.armorPerks.length * WEIGHTS.special * 0.5;
  }
  
  // Trait bonus
  let traitScore = 0;
  if (fighter.signatureTrait) {
    traitScore = 15; // Base trait value
  }
  
  // Wound penalties
  let woundPenalty = 0;
  if (woundEffects.damage_penalty) woundPenalty += Math.abs(woundEffects.damage_penalty) * WEIGHTS.damage * 0.5;
  if (woundEffects.defense_penalty) woundPenalty += Math.abs(woundEffects.defense_penalty) * WEIGHTS.defense * 0.5;
  if (woundEffects.accuracy_penalty) woundPenalty += Math.abs(woundEffects.accuracy_penalty) * WEIGHTS.accuracy * 0.5;
  
  // Calculate category totals
  const baseStatsTotal = hpScore + staminaScore + speedScore + accuracyScore;
  const weaponTotal = damageScore + critScore;
  const armorTotal = defenseScore + resistScore;
  const traitsTotal = traitScore + specialScore;
  const buffsTotal = parryScore + dodgeScore;
  const penaltiesTotal = woundPenalty;
  
  // Sum all contributions
  let rawPower = baseStatsTotal + weaponTotal + armorTotal + traitsTotal + buffsTotal - penaltiesTotal;
  
  // Apply league modifier
  const leagueMultiplier = LEAGUE_MULTIPLIERS[league] || 1.0;
  rawPower *= leagueMultiplier;
  
  // Round to integer
  const power = Math.round(rawPower);
  
  // Determine tier
  let tier: PowerResult['tier'] = 'weak';
  if (power >= POWER_TIERS.champion) tier = 'champion';
  else if (power >= POWER_TIERS.elite) tier = 'elite';
  else if (power >= POWER_TIERS.strong) tier = 'strong';
  else if (power >= POWER_TIERS.average) tier = 'average';
  
  return {
    power,
    tier,
    breakdown: {
      baseStats: Math.round(baseStatsTotal),
      weapon: Math.round(weaponTotal),
      armor: Math.round(armorTotal),
      traits: Math.round(traitsTotal),
      buffs: Math.round(buffsTotal),
      penalties: Math.round(penaltiesTotal),
      details: {
        hp: Math.round(hpScore),
        damage: Math.round(damageScore),
        defense: Math.round(defenseScore),
        stamina: Math.round(staminaScore),
        crit: Math.round(critScore),
        dodge: Math.round(dodgeScore),
        parry: Math.round(parryScore),
        speed: Math.round(speedScore),
        resistances: Math.round(resistScore),
        special: Math.round(specialScore)
      }
    }
  };
}

/**
 * Calculate enemy power for comparison
 */
export function calculateEnemyPower(
  enemy: Fighter,
  enemyClass?: EnemyClass
): PowerResult {
  const stats = enemy.currentStats;
  
  // Simulate enemy loadout stats (enemies don't use item system)
  const mockLoadoutStats: LoadoutStats = {
    damageMin: Math.floor(stats.attack * 0.8),
    damageMax: Math.floor(stats.attack * 1.2),
    lightStaminaCost: 10,
    heavyStaminaCost: 22,
    accuracyMod: 0,
    critChanceMod: 0,
    speedMod: 0,
    totalDefense: stats.defense,
    staminaRegenMod: 0,
    dodgeMod: 0,
    weaponEffects: [],
    armorPerks: [],
    trinketEffects: [],
    bleedResist: 0,
    stunResist: 0,
    poisonResist: 0,
    critResist: 0
  };
  
  // Apply enemy class modifiers
  if (enemyClass) {
    const mods = enemyClass.statMods;
    if (mods.accuracy) mockLoadoutStats.accuracyMod += mods.accuracy;
    if (mods.critChance) mockLoadoutStats.critChanceMod += mods.critChance;
    if (mods.dodge) mockLoadoutStats.dodgeMod += mods.dodge;
    if (mods.speed) mockLoadoutStats.speedMod += mods.speed;
  }
  
  return calculatePowerFromStats(enemy, mockLoadoutStats, [], 'bronze');
}

/**
 * Get fight risk assessment based on power comparison
 */
export function getFightRisk(playerPower: number, enemyPower: number): {
  label: string;
  color: string;
  description: string;
} {
  const ratio = playerPower / Math.max(enemyPower, 1);
  
  if (ratio >= 1.5) {
    return {
      label: 'Easy',
      color: '#6b8e23',
      description: 'You outclass this opponent.'
    };
  } else if (ratio >= 1.15) {
    return {
      label: 'Fair',
      color: '#8b7355',
      description: 'A balanced fight.'
    };
  } else if (ratio >= 0.85) {
    return {
      label: 'Even',
      color: '#daa520',
      description: 'Could go either way.'
    };
  } else if (ratio >= 0.6) {
    return {
      label: 'Risky',
      color: '#cd5c5c',
      description: 'Prepare carefully.'
    };
  } else {
    return {
      label: 'Deadly',
      color: '#8b0000',
      description: 'Expect to lose.'
    };
  }
}

/**
 * Calculate power difference with visual indicator
 */
export function getPowerDelta(oldPower: number, newPower: number): {
  delta: number;
  text: string;
  color: string;
} {
  const delta = newPower - oldPower;
  
  if (delta > 0) {
    return {
      delta,
      text: `+${delta}`,
      color: '#6b8e23'
    };
  } else if (delta < 0) {
    return {
      delta,
      text: `${delta}`,
      color: '#8b0000'
    };
  } else {
    return {
      delta: 0,
      text: '±0',
      color: '#5a4a3a'
    };
  }
}

/**
 * Get tier color for display
 */
export function getTierColor(tier: PowerResult['tier']): string {
  switch (tier) {
    case 'champion': return '#ff8800';
    case 'elite': return '#aa44ff';
    case 'strong': return '#3388ff';
    case 'average': return '#22cc22';
    case 'weak': return '#888888';
    default: return '#888888';
  }
}

/**
 * Format power for display
 */
export function formatPower(power: number): string {
  return power.toLocaleString();
}
