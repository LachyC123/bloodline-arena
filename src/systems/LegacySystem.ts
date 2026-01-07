/**
 * LegacySystem - Handles Hall of Legends, bloodline perks, and ghost moments
 */

import { Fighter } from './FighterSystem';
import { SaveSystem, GhostMoment, HeirloomItem } from './SaveSystem';
import { RNG } from './RNGSystem';

// Legend entry for Hall of Legends
export interface LegendEntry {
  id: string;
  fighter: {
    id: string;
    fullName: string;
    nickname: string;
    age: number;
    birthplace: string;
    portrait: Fighter['portrait'];
    signatureTrait: string;
  };
  
  // Run stats
  leagueReached: 'bronze' | 'silver' | 'gold' | 'champion';
  wins: number;
  kills: number;
  weeksSurvived: number;
  
  // Status
  status: 'dead' | 'retired' | 'champion';
  causeOfDeath?: string;
  lastWords?: string;
  
  // Promise
  promiseType: string;
  promiseKept: boolean;
  
  // Memorable moments
  bestWin: string;
  closestCall: number;
  signatureMoveUses: number;
  perfectParries: number;
  
  // Letters
  lettersWritten: string[];
  
  // Player note
  playerNote?: string;
  
  // Date
  dateAdded: number;
}

// Bloodline perk definition
export interface BloodlinePerk {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
  tier: 1 | 2 | 3;
  prerequisite?: string;
  statBonus?: Partial<{
    maxHP: number;
    maxStamina: number;
    maxFocus: number;
    attack: number;
    defense: number;
    speed: number;
  }>;
}

// Available bloodline perks
export const BLOODLINE_PERKS: BloodlinePerk[] = [
  // Tier 1 (5 points each)
  {
    id: 'hardy_stock',
    name: 'Hardy Stock',
    description: 'Your bloodline is tough. Start with +10 max HP.',
    effect: '+10 Max HP',
    cost: 5,
    tier: 1,
    statBonus: { maxHP: 10 }
  },
  {
    id: 'fighting_spirit',
    name: 'Fighting Spirit',
    description: 'Generations of warriors flow through you. +5 max Stamina.',
    effect: '+5 Max Stamina',
    cost: 5,
    tier: 1,
    statBonus: { maxStamina: 5 }
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Experience comes faster. +10% XP from all sources.',
    effect: '+10% XP',
    cost: 5,
    tier: 1
  },
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    description: 'Better deals at shops. -10% shop prices.',
    effect: '-10% Shop Prices',
    cost: 5,
    tier: 1
  },
  {
    id: 'crowd_favorite',
    name: 'Crowd Favorite',
    description: 'The crowd remembers your lineage. Start with +10 Hype.',
    effect: '+10 Starting Hype',
    cost: 5,
    tier: 1
  },
  
  // Tier 2 (10 points each, require tier 1)
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Resist fear and panic. Immune to Fear status.',
    effect: 'Fear Immunity',
    cost: 10,
    tier: 2,
    prerequisite: 'hardy_stock'
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Recover faster between fights. +20% stamina regen.',
    effect: '+20% Stamina Regen',
    cost: 10,
    tier: 2,
    prerequisite: 'fighting_spirit'
  },
  {
    id: 'veterans_insight',
    name: "Veteran's Insight",
    description: 'Start with one extra trait choice.',
    effect: '+1 Trait Choice',
    cost: 10,
    tier: 2,
    prerequisite: 'quick_learner'
  },
  {
    id: 'haggler',
    name: 'Haggler',
    description: 'Even better deals. Additional -15% shop prices.',
    effect: '-15% More Shop Prices',
    cost: 10,
    tier: 2,
    prerequisite: 'silver_tongue'
  },
  {
    id: 'showman',
    name: 'Showman',
    description: 'Hype gains increased by 25%.',
    effect: '+25% Hype Gain',
    cost: 10,
    tier: 2,
    prerequisite: 'crowd_favorite'
  },
  
  // Tier 3 (20 points each, require tier 2)
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Survive one fatal blow per run at 1 HP.',
    effect: 'Survive Fatal (1x)',
    cost: 20,
    tier: 3,
    prerequisite: 'iron_will'
  },
  {
    id: 'berserker_blood',
    name: 'Berserker Blood',
    description: 'Deal 20% more damage when below 30% HP.',
    effect: '+20% Low HP Damage',
    cost: 20,
    tier: 3,
    prerequisite: 'second_wind'
  },
  {
    id: 'legendary_lineage',
    name: 'Legendary Lineage',
    description: 'All stat bonuses from bloodline perks doubled.',
    effect: '2x Bloodline Stats',
    cost: 20,
    tier: 3,
    prerequisite: 'veterans_insight'
  }
];

/**
 * Add a fighter to the Hall of Legends
 */
export function addToHallOfLegends(
  fighter: Fighter,
  status: 'dead' | 'retired' | 'champion',
  leagueReached: 'bronze' | 'silver' | 'gold' | 'champion',
  promiseType: string,
  promiseKept: boolean
): LegendEntry {
  const entry: LegendEntry = {
    id: `legend_${fighter.id}`,
    fighter: {
      id: fighter.id,
      fullName: fighter.fullName,
      nickname: fighter.nickname,
      age: fighter.age,
      birthplace: fighter.birthplace,
      portrait: { ...fighter.portrait },
      signatureTrait: fighter.signatureTrait.name
    },
    leagueReached,
    wins: fighter.wins,
    kills: fighter.kills,
    weeksSurvived: fighter.weeksSurvived,
    status,
    causeOfDeath: fighter.causeOfDeath,
    lastWords: fighter.lastWords,
    promiseType,
    promiseKept,
    bestWin: fighter.bestWin || 'No notable victories',
    closestCall: fighter.closestCall,
    signatureMoveUses: fighter.signatureMoveUses,
    perfectParries: fighter.perfectParries,
    lettersWritten: [...fighter.lettersWritten],
    dateAdded: Date.now()
  };
  
  SaveSystem.addToHallOfLegends(entry);
  
  // Create ghost moments for future runs
  createGhostMoments(fighter, status);
  
  // Handle heirloom recovery
  if (status === 'dead') {
    attemptHeirloomRecovery(fighter);
  }
  
  return entry;
}

/**
 * Create ghost moments for a fallen/retired fighter
 */
function createGhostMoments(fighter: Fighter, status: 'dead' | 'retired' | 'champion'): void {
  // Crowd chant (always)
  SaveSystem.addGhostMoment({
    fighterId: fighter.id,
    fighterName: fighter.firstName,
    nickname: fighter.nickname,
    type: 'crowd_chant',
    triggered: false
  });
  
  // Item drop (if had notable items)
  if (fighter.equipment.weapon || fighter.equipment.armor) {
    SaveSystem.addGhostMoment({
      fighterId: fighter.id,
      fighterName: fighter.firstName,
      nickname: fighter.nickname,
      type: 'item_drop',
      triggered: false
    });
  }
  
  // Statue (if retired or champion)
  if (status === 'retired' || status === 'champion') {
    SaveSystem.addGhostMoment({
      fighterId: fighter.id,
      fighterName: fighter.firstName,
      nickname: fighter.nickname,
      type: 'statue',
      triggered: false
    });
  }
  
  // Story reference (random chance)
  if (RNG.chance(0.5)) {
    SaveSystem.addGhostMoment({
      fighterId: fighter.id,
      fighterName: fighter.firstName,
      nickname: fighter.nickname,
      type: 'story',
      triggered: false
    });
  }
}

/**
 * Attempt to recover an heirloom from a fallen fighter
 */
function attemptHeirloomRecovery(fighter: Fighter): void {
  const meta = SaveSystem.getMeta();
  const recoveryChance = 0.3 + (meta.promoterLevel * 0.05); // Better chance with higher rep
  
  if (RNG.chance(recoveryChance)) {
    const heirloom: HeirloomItem = {
      id: `heirloom_${fighter.id}`,
      name: fighter.keepsake.name,
      description: `${fighter.keepsake.backstory} Once belonged to ${fighter.fullName}.`,
      fromFighter: fighter.fullName,
      effect: fighter.keepsake.effect,
      recovered: true
    };
    
    SaveSystem.addHeirloom(heirloom);
  }
}

/**
 * Get a random ghost moment for the current context
 */
export function getGhostMoment(context: 'arena' | 'camp' | 'shop'): GhostMoment | null {
  const moments = SaveSystem.getUntriggeredGhostMoments();
  
  if (moments.length === 0) return null;
  
  // Filter by context-appropriate types
  const contextTypes: Record<string, ('crowd_chant' | 'item_drop' | 'statue' | 'story')[]> = {
    arena: ['crowd_chant', 'statue'],
    camp: ['story'],
    shop: ['item_drop']
  };
  
  const eligible = moments.filter(m => contextTypes[context].includes(m.type));
  
  if (eligible.length === 0) return null;
  
  // Random chance to trigger
  if (!RNG.chance(0.15)) return null;
  
  const moment = RNG.pick(eligible);
  SaveSystem.triggerGhostMoment(moment.fighterId, moment.type);
  
  return moment;
}

/**
 * Generate ghost moment text
 */
export function getGhostMomentText(moment: GhostMoment): string {
  switch (moment.type) {
    case 'crowd_chant':
      return `The crowd chants: "${moment.nickname}! ${moment.nickname}!" Someone remembers...`;
    case 'item_drop':
      return `You find a worn item. A tag reads: "Property of ${moment.fighterName} '${moment.nickname}'"`;
    case 'statue':
      return `A weathered statue stands in the corner. The plaque reads: "${moment.fighterName} '${moment.nickname}' - Never Forgotten"`;
    case 'story':
      return `An old fighter tells tales of ${moment.fighterName} '${moment.nickname}'. The legend lives on.`;
    default:
      return '';
  }
}

/**
 * Get bloodline stat bonuses for a new fighter
 */
export function getBloodlineStatBonuses(): Partial<{
  maxHP: number;
  maxStamina: number;
  maxFocus: number;
  attack: number;
  defense: number;
  speed: number;
}> {
  const meta = SaveSystem.getMeta();
  const bonuses: Record<string, number> = {};
  
  let hasLegendaryLineage = false;
  
  for (const perkId of meta.unlockedPerks) {
    const perk = BLOODLINE_PERKS.find(p => p.id === perkId);
    if (perk?.statBonus) {
      for (const [stat, value] of Object.entries(perk.statBonus)) {
        bonuses[stat] = (bonuses[stat] || 0) + value;
      }
    }
    if (perkId === 'legendary_lineage') {
      hasLegendaryLineage = true;
    }
  }
  
  // Double bonuses if legendary lineage
  if (hasLegendaryLineage) {
    for (const stat of Object.keys(bonuses)) {
      bonuses[stat] *= 2;
    }
  }
  
  return bonuses;
}

/**
 * Check if a bloodline perk is available for purchase
 */
export function canPurchasePerk(perkId: string): { canPurchase: boolean; reason: string } {
  const meta = SaveSystem.getMeta();
  const perk = BLOODLINE_PERKS.find(p => p.id === perkId);
  
  if (!perk) {
    return { canPurchase: false, reason: 'Perk not found' };
  }
  
  if (meta.unlockedPerks.includes(perkId)) {
    return { canPurchase: false, reason: 'Already owned' };
  }
  
  if (perk.prerequisite && !meta.unlockedPerks.includes(perk.prerequisite)) {
    const prereq = BLOODLINE_PERKS.find(p => p.id === perk.prerequisite);
    return { canPurchase: false, reason: `Requires: ${prereq?.name || perk.prerequisite}` };
  }
  
  if (meta.bloodlinePoints < perk.cost) {
    return { canPurchase: false, reason: `Need ${perk.cost} points (have ${meta.bloodlinePoints})` };
  }
  
  return { canPurchase: true, reason: '' };
}

/**
 * Purchase a bloodline perk
 */
export function purchasePerk(perkId: string): boolean {
  const { canPurchase } = canPurchasePerk(perkId);
  if (!canPurchase) return false;
  
  const perk = BLOODLINE_PERKS.find(p => p.id === perkId);
  if (!perk) return false;
  
  if (SaveSystem.spendBloodlinePoints(perk.cost)) {
    SaveSystem.unlockPerk(perkId);
    return true;
  }
  
  return false;
}

/**
 * Calculate retirement cost
 */
export function getRetirementCost(fighter: Fighter, league: string): number {
  const baseCost = 500;
  const leagueMultiplier = league === 'bronze' ? 1 : league === 'silver' ? 0.8 : 0.6;
  const trustDiscount = fighter.trust > 80 ? 0.7 : fighter.trust > 50 ? 0.85 : 1;
  
  return Math.round(baseCost * leagueMultiplier * trustDiscount);
}

/**
 * Check if fighter can retire
 */
export function canRetire(gold: number, fighter: Fighter, league: string): boolean {
  const cost = getRetirementCost(fighter, league);
  return gold >= cost && fighter.wins >= 3; // Must have at least 3 wins
}
