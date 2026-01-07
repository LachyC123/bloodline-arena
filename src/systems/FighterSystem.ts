/**
 * FighterSystem - Fighter creation, stats, and management
 */

import { RNG } from './RNGSystem';
import { NAMES_DATA, BACKSTORIES_DATA, KEEPSAKES_DATA, TRAITS_DATA, VOICE_LINES_DATA } from '../data/FighterData';

// Fighter status effects
export type StatusEffect = 
  | 'bleed' 
  | 'stun' 
  | 'cripple' 
  | 'concuss' 
  | 'fear' 
  | 'disarmed'
  | 'inspired'
  | 'enraged';

// Injury types
export interface Injury {
  id: string;
  name: string;
  location: 'head' | 'body' | 'legs';
  severity: 'minor' | 'moderate' | 'severe';
  effect: string;
  statPenalty: Partial<FighterStats>;
  healTime: number; // weeks to heal
  scarChance: number;
}

// Fighter stats
export interface FighterStats {
  maxHP: number;
  currentHP: number;
  maxStamina: number;
  currentStamina: number;
  maxFocus: number;
  currentFocus: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  evasion: number;
  critChance: number;
  critDamage: number;
}

// Fighter equipment slot
export interface EquipmentSlot {
  weapon: EquippedItem | null;
  armor: EquippedItem | null;
  accessory: EquippedItem | null;
}

export interface EquippedItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  stats: Partial<FighterStats>;
  effect?: string;
  description: string;
}

// Keepsake item
export interface Keepsake {
  id: string;
  name: string;
  backstory: string;
  effect: string;
  statBonus: Partial<FighterStats>;
  upgraded: boolean;
  upgradeEffect?: string;
}

// Trait definition
export interface Trait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: string;
  statModifier?: Partial<FighterStats>;
  evolutionStage?: number;
  maxEvolution?: number;
  evolutionNames?: string[];
}

// Portrait data
export interface PortraitData {
  baseIndex: number;
  eyeIndex: number;
  hairIndex: number;
  beardIndex: number;
  scarIndex: number;
  warpaintIndex: number;
  hoodIndex: number;
  skinTone: string;
  hairColor: string;
  injuryOverlays: string[];
}

// Voice line categories
export type VoiceLineCategory = 
  | 'battle_start' 
  | 'taking_damage' 
  | 'dealing_damage' 
  | 'low_health' 
  | 'victory' 
  | 'defeat'
  | 'rest'
  | 'training'
  | 'shop'
  | 'idle';

// Fighter status
export type FighterStatus = 'healthy' | 'injured' | 'critical' | 'dead' | 'retired';

// Complete fighter definition
export interface Fighter {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  fullName: string;
  age: number;
  birthplace: string;
  backstory: string;
  personality: 'stoic' | 'aggressive' | 'honorable' | 'cunning' | 'fearful' | 'jovial';
  
  // Stats
  baseStats: FighterStats;
  currentStats: FighterStats;
  
  // Equipment
  equipment: EquipmentSlot;
  keepsake: Keepsake;
  inventory: EquippedItem[];
  
  // Traits
  signatureTrait: Trait;
  traits: Trait[];
  flaws: Trait[];
  
  // Portrait
  portrait: PortraitData;
  
  // Progression
  level: number;
  experience: number;
  wins: number;
  losses: number;
  kills: number;
  
  // Status
  status: FighterStatus;
  injuries: Injury[];
  scars: string[];
  activeEffects: StatusEffect[];
  
  // Trust/Bond
  trust: number; // 0-100
  trustLevel: 'stranger' | 'acquaintance' | 'ally' | 'bonded' | 'legendary';
  
  // Combat stats tracking
  totalDamageDealt: number;
  totalDamageTaken: number;
  perfectParries: number;
  signatureMoveUses: number;
  closestCall: number; // lowest HP survived
  bestWin: string; // description of best victory
  
  // Run tracking
  lettersWritten: string[];
  weeksSurvived: number;
  
  // Death data (filled when dead)
  causeOfDeath?: string;
  lastWords?: string;
  killedBy?: string;
}

/**
 * Generate a new random fighter
 */
export function generateFighter(promoterLevel: number = 1): Fighter {
  const firstName = RNG.pick(NAMES_DATA.firstNames);
  const lastName = RNG.pick(NAMES_DATA.lastNames);
  const nickname = RNG.pick(NAMES_DATA.nicknames);
  const age = RNG.int(18, 45);
  const birthplace = RNG.pick(BACKSTORIES_DATA.birthplaces);
  const backstory = RNG.pick(BACKSTORIES_DATA.snippets)
    .replace('{birthplace}', birthplace)
    .replace('{age}', String(age));
  
  const personality = RNG.pick([
    'stoic', 'aggressive', 'honorable', 'cunning', 'fearful', 'jovial'
  ] as const);
  
  // Generate base stats with some variance
  const statBonus = Math.floor(promoterLevel / 2);
  const baseStats = generateBaseStats(statBonus);
  
  // Generate portrait
  const portrait = generatePortrait();
  
  // Generate keepsake
  const keepsakeData = RNG.pick(KEEPSAKES_DATA);
  const keepsake: Keepsake = {
    id: keepsakeData.id,
    name: keepsakeData.name,
    backstory: keepsakeData.backstory,
    effect: keepsakeData.effect,
    statBonus: keepsakeData.statBonus,
    upgraded: false,
    upgradeEffect: keepsakeData.upgradeEffect
  };
  
  // Generate signature trait
  const signatureTraitData = RNG.pick(TRAITS_DATA.signature);
  const signatureTrait: Trait = {
    ...signatureTraitData,
    evolutionStage: 0,
    maxEvolution: signatureTraitData.evolutionNames?.length || 3
  };
  
  // Generate 1-2 regular traits
  const numTraits = RNG.int(1, 2);
  const traits = RNG.pickMultiple(TRAITS_DATA.positive, numTraits).map(t => ({ ...t }));
  
  // Generate 1 flaw
  const flaws = [{ ...RNG.pick(TRAITS_DATA.negative) }];
  
  const fighter: Fighter = {
    id: RNG.id(12),
    firstName,
    lastName,
    nickname,
    fullName: `${firstName} '${nickname}' ${lastName}`,
    age,
    birthplace,
    backstory,
    personality,
    
    baseStats,
    currentStats: { ...baseStats },
    
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    },
    keepsake,
    inventory: [],
    
    signatureTrait,
    traits,
    flaws,
    
    portrait,
    
    level: 1,
    experience: 0,
    wins: 0,
    losses: 0,
    kills: 0,
    
    status: 'healthy',
    injuries: [],
    scars: [],
    activeEffects: [],
    
    trust: 20,
    trustLevel: 'stranger',
    
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    perfectParries: 0,
    signatureMoveUses: 0,
    closestCall: baseStats.maxHP,
    bestWin: '',
    
    lettersWritten: [],
    weeksSurvived: 0
  };
  
  return fighter;
}

/**
 * Generate base stats with variance
 */
function generateBaseStats(bonus: number = 0): FighterStats {
  return {
    maxHP: RNG.int(80, 120) + bonus * 5,
    currentHP: 0, // Will be set to maxHP
    maxStamina: RNG.int(80, 100) + bonus * 3,
    currentStamina: 0,
    maxFocus: RNG.int(50, 80) + bonus * 2,
    currentFocus: 0,
    attack: RNG.int(8, 15) + bonus,
    defense: RNG.int(5, 12) + bonus,
    speed: RNG.int(5, 12) + bonus,
    accuracy: RNG.int(70, 90) + bonus,
    evasion: RNG.int(5, 15) + bonus,
    critChance: RNG.int(5, 15),
    critDamage: RNG.int(140, 180)
  };
}

/**
 * Generate random portrait data
 */
export function generatePortrait(): PortraitData {
  const skinTones = ['#f5d0b9', '#d4a574', '#8b5a3c', '#5c3d2e', '#3b2417'];
  const hairColors = ['#1a1a1a', '#3d2314', '#6b4423', '#8b6914', '#a08060', '#c0c0c0', '#8b0000'];
  
  return {
    baseIndex: RNG.int(0, 5),
    eyeIndex: RNG.int(0, 4),
    hairIndex: RNG.int(0, 7),
    beardIndex: RNG.int(0, 5),
    scarIndex: 0, // No scars initially
    warpaintIndex: RNG.chance(0.3) ? RNG.int(1, 4) : 0,
    hoodIndex: 0,
    skinTone: RNG.pick(skinTones),
    hairColor: RNG.pick(hairColors),
    injuryOverlays: []
  };
}

/**
 * Restore fighter to full stats
 */
export function restoreFighter(fighter: Fighter): void {
  fighter.currentStats.currentHP = fighter.currentStats.maxHP;
  fighter.currentStats.currentStamina = fighter.currentStats.maxStamina;
  fighter.currentStats.currentFocus = 0; // Focus starts at 0
  fighter.activeEffects = [];
}

/**
 * Apply injury to fighter
 */
export function applyInjury(fighter: Fighter, injury: Injury): void {
  fighter.injuries.push(injury);
  fighter.status = injury.severity === 'severe' ? 'critical' : 'injured';
  
  // Apply stat penalty
  for (const [stat, value] of Object.entries(injury.statPenalty)) {
    const key = stat as keyof FighterStats;
    if (typeof fighter.currentStats[key] === 'number' && typeof value === 'number') {
      (fighter.currentStats[key] as number) -= value;
    }
  }
  
  // Add injury overlay to portrait
  fighter.portrait.injuryOverlays.push(`injury_${injury.location}_${injury.severity}`);
  
  // Check for scar
  if (RNG.chance(injury.scarChance)) {
    const scarId = `scar_${injury.location}_${fighter.scars.length}`;
    fighter.scars.push(scarId);
    fighter.portrait.scarIndex = Math.min(fighter.portrait.scarIndex + 1, 5);
  }
}

/**
 * Heal injuries over time
 */
export function healInjuries(fighter: Fighter, weeks: number = 1): void {
  const healed: string[] = [];
  
  fighter.injuries = fighter.injuries.filter(injury => {
    injury.healTime -= weeks;
    if (injury.healTime <= 0) {
      healed.push(injury.id);
      
      // Remove stat penalty
      for (const [stat, value] of Object.entries(injury.statPenalty)) {
        const key = stat as keyof FighterStats;
        if (typeof fighter.currentStats[key] === 'number' && typeof value === 'number') {
          (fighter.currentStats[key] as number) += value;
        }
      }
      return false;
    }
    return true;
  });
  
  // Remove healed injury overlays
  fighter.portrait.injuryOverlays = fighter.portrait.injuryOverlays.filter(
    overlay => !healed.some(id => overlay.includes(id.split('_')[1]))
  );
  
  // Update status
  if (fighter.injuries.length === 0) {
    fighter.status = 'healthy';
  } else if (fighter.injuries.some(i => i.severity === 'severe')) {
    fighter.status = 'critical';
  } else {
    fighter.status = 'injured';
  }
}

/**
 * Update trust level based on current trust value
 */
export function updateTrustLevel(fighter: Fighter): void {
  if (fighter.trust >= 90) {
    fighter.trustLevel = 'legendary';
  } else if (fighter.trust >= 70) {
    fighter.trustLevel = 'bonded';
  } else if (fighter.trust >= 50) {
    fighter.trustLevel = 'ally';
  } else if (fighter.trust >= 25) {
    fighter.trustLevel = 'acquaintance';
  } else {
    fighter.trustLevel = 'stranger';
  }
}

/**
 * Add trust to fighter (clamped 0-100)
 */
export function addTrust(fighter: Fighter, amount: number): void {
  fighter.trust = Math.max(0, Math.min(100, fighter.trust + amount));
  updateTrustLevel(fighter);
}

/**
 * Evolve signature trait
 */
export function evolveSignatureTrait(fighter: Fighter): boolean {
  const trait = fighter.signatureTrait;
  if (trait.evolutionStage === undefined || trait.maxEvolution === undefined) {
    return false;
  }
  
  if (trait.evolutionStage < trait.maxEvolution - 1) {
    trait.evolutionStage++;
    if (trait.evolutionNames && trait.evolutionNames[trait.evolutionStage]) {
      trait.name = trait.evolutionNames[trait.evolutionStage];
    }
    return true;
  }
  
  return false;
}

/**
 * Get a voice line for the fighter
 */
export function getVoiceLine(fighter: Fighter, category: VoiceLineCategory): string {
  const personalityLines = VOICE_LINES_DATA[fighter.personality];
  if (personalityLines && personalityLines[category]) {
    return RNG.pick(personalityLines[category]);
  }
  return '';
}

/**
 * Calculate effective stats (base + equipment + traits - injuries)
 */
export function calculateEffectiveStats(fighter: Fighter): FighterStats {
  const stats = { ...fighter.baseStats };
  
  // Apply equipment bonuses
  for (const slot of Object.values(fighter.equipment)) {
    if (slot?.stats) {
      for (const [key, value] of Object.entries(slot.stats)) {
        if (typeof value === 'number') {
          (stats[key as keyof FighterStats] as number) += value;
        }
      }
    }
  }
  
  // Apply keepsake bonus
  if (fighter.keepsake.statBonus) {
    for (const [key, value] of Object.entries(fighter.keepsake.statBonus)) {
      if (typeof value === 'number') {
        (stats[key as keyof FighterStats] as number) += value;
      }
    }
  }
  
  // Apply trait modifiers
  for (const trait of [...fighter.traits, ...fighter.flaws]) {
    if (trait.statModifier) {
      for (const [key, value] of Object.entries(trait.statModifier)) {
        if (typeof value === 'number') {
          (stats[key as keyof FighterStats] as number) += value;
        }
      }
    }
  }
  
  // Set current values to max
  stats.currentHP = stats.maxHP;
  stats.currentStamina = stats.maxStamina;
  stats.currentFocus = 0;
  
  return stats;
}

/**
 * Generate cause of death string
 */
export function generateCauseOfDeath(
  finalBlow: { damage: number; location: string; weaponType: string },
  round: number,
  enemyName: string
): string {
  const causes = [
    `Fell to ${enemyName} in round ${round}. ${finalBlow.location} strike proved fatal.`,
    `Collapsed from a ${finalBlow.weaponType} wound to the ${finalBlow.location} in round ${round}.`,
    `${finalBlow.location === 'head' ? 'Skull cracked' : finalBlow.location === 'body' ? 'Heart pierced' : 'Leg shattered'} by ${enemyName}'s ${finalBlow.weaponType}.`,
    `Bled out from wounds sustained in round ${round}. The crowd fell silent.`,
    `${enemyName}'s final blow to the ${finalBlow.location} ended it all in round ${round}.`
  ];
  
  return RNG.pick(causes);
}

/**
 * Get potential last words
 */
export function getLastWords(fighter: Fighter): string | undefined {
  if (!RNG.chance(0.3)) return undefined;
  
  const lastWords = [
    "Tell them... I tried.",
    "Don't sell my keepsake...",
    "Run... while you can...",
    "It was... worth it...",
    "Remember my name...",
    "The crowd... they loved me...",
    `Tell ${fighter.birthplace}... I'm sorry...`,
    "One more fight... I could have...",
    "My keepsake... keep it safe...",
    "Honor... above all..."
  ];
  
  return RNG.pick(lastWords);
}
