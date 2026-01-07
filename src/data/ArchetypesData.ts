/**
 * ArchetypesData - Unlockable character archetypes/classes
 */

import { FighterStats, Trait } from '../systems/FighterSystem';

export interface CharacterArchetype {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  
  // Starting modifiers
  startingStatMods: Partial<FighterStats>;
  startingTrait: Trait;
  drawback: Trait;
  
  // Unique pools
  uniqueNicknames: string[];
  uniqueBackstories: string[];
  signatureTraitPool: string[];  // IDs of available signature traits
  
  // Unlock requirements
  unlockCondition: UnlockCondition;
  unlockProgress?: number;  // Current progress (0-1)
  unlocked: boolean;
}

export interface UnlockCondition {
  type: 'wins' | 'league' | 'deaths' | 'special' | 'retire' | 'stat';
  requirement: string;
  target: number;
  description: string;
}

export const ARCHETYPES_DATA: CharacterArchetype[] = [
  // Default (always unlocked)
  {
    id: 'gladiator',
    name: 'Gladiator',
    title: 'Arena Born',
    description: 'Balanced fighter trained in the pits. No special advantages, no weaknesses.',
    icon: '⚔️',
    startingStatMods: {},
    startingTrait: {
      id: 'arena_ready',
      name: 'Arena Ready',
      description: 'Trained from youth in the fighting pits.',
      type: 'neutral',
      effect: 'No starting bonuses or penalties'
    },
    drawback: {
      id: 'common_stock',
      name: 'Common Stock',
      description: 'Nothing special about your background.',
      type: 'neutral',
      effect: 'Standard progression'
    },
    uniqueNicknames: ['the Pit Dog', 'Sandwalker', 'Iron Will'],
    uniqueBackstories: ['Born in the slave pits, fighting is all you know.'],
    signatureTraitPool: ['berserker_rage', 'iron_skin', 'crowd_pleaser'],
    unlockCondition: {
      type: 'special',
      requirement: 'default',
      target: 0,
      description: 'Always available'
    },
    unlocked: true
  },
  
  // Sellsword
  {
    id: 'sellsword',
    name: 'Sellsword',
    title: 'Blade for Hire',
    description: 'Mercenary who fights for coin. High damage but slow to bond.',
    icon: '💰',
    startingStatMods: {
      attack: 4,
      critChance: 5
    },
    startingTrait: {
      id: 'mercenary_heart',
      name: 'Mercenary Heart',
      description: 'Fights for coin, not glory.',
      type: 'positive',
      effect: '+20% gold rewards'
    },
    drawback: {
      id: 'trust_issues',
      name: 'Trust Issues',
      description: 'Slow to open up to others.',
      type: 'negative',
      effect: '-50% Trust gain from all sources'
    },
    uniqueNicknames: ['Gold Blood', 'the Mercenary', 'Coin Counter'],
    uniqueBackstories: ['Wars made you rich. Peace made you desperate.'],
    signatureTraitPool: ['assassin_strike', 'dirty_fighter', 'survivor'],
    unlockCondition: {
      type: 'wins',
      requirement: 'total_wins',
      target: 10,
      description: 'Win 10 fights total'
    },
    unlocked: false
  },
  
  // Hedge Knight
  {
    id: 'hedge_knight',
    name: 'Hedge Knight',
    title: 'Wandering Warrior',
    description: 'Disgraced knight with heavy armor. Tough but slow.',
    icon: '🛡️',
    startingStatMods: {
      defense: 6,
      maxHP: 20,
      speed: -3,
      evasion: -5
    },
    startingTrait: {
      id: 'heavy_plate',
      name: 'Heavy Plate',
      description: 'Wears full armor into the arena.',
      type: 'positive',
      effect: 'Reduce all damage taken by 15%'
    },
    drawback: {
      id: 'slow_and_steady',
      name: 'Slow and Steady',
      description: 'Heavy armor limits mobility.',
      type: 'negative',
      effect: 'Always acts last, -20% dodge chance'
    },
    uniqueNicknames: ['the Iron Wall', 'Rust Knight', 'Shield Breaker'],
    uniqueBackstories: ['Stripped of title, you fight to reclaim honor.'],
    signatureTraitPool: ['shield_bash', 'iron_skin', 'last_stand'],
    unlockCondition: {
      type: 'league',
      requirement: 'reach_league',
      target: 2, // Silver
      description: 'Reach Silver League'
    },
    unlocked: false
  },
  
  // Monastic Bruiser
  {
    id: 'monk',
    name: 'Monastic Bruiser',
    title: 'Fist of Faith',
    description: 'Temple fighter with iron resolve. High stamina, poor gold gain.',
    icon: '🙏',
    startingStatMods: {
      maxStamina: 30,
      maxFocus: 20,
      attack: -2
    },
    startingTrait: {
      id: 'inner_peace',
      name: 'Inner Peace',
      description: 'Meditation keeps the mind sharp.',
      type: 'positive',
      effect: 'Stamina regenerates 50% faster'
    },
    drawback: {
      id: 'vow_of_poverty',
      name: 'Vow of Poverty',
      description: 'Material wealth means nothing.',
      type: 'negative',
      effect: '-40% gold rewards, cannot buy legendary items'
    },
    uniqueNicknames: ['Silent Fist', 'the Penitent', 'Temple Shadow'],
    uniqueBackstories: ['The monastery taught you peace. The arena teaches survival.'],
    signatureTraitPool: ['pressure_point', 'inner_fire', 'zen_focus'],
    unlockCondition: {
      type: 'stat',
      requirement: 'perfect_parries',
      target: 20,
      description: 'Perform 20 perfect parries (lifetime)'
    },
    unlocked: false
  },
  
  // Street Duelist
  {
    id: 'duelist',
    name: 'Street Duelist',
    title: 'Blade Dancer',
    description: 'Quick and precise. High dodge/parry but fragile.',
    icon: '🗡️',
    startingStatMods: {
      speed: 5,
      evasion: 10,
      accuracy: 8,
      maxHP: -20,
      defense: -3
    },
    startingTrait: {
      id: 'riposte_master',
      name: 'Riposte Master',
      description: 'Turn defense into offense.',
      type: 'positive',
      effect: 'Perfect parries deal 100% counter damage'
    },
    drawback: {
      id: 'glass_cannon',
      name: 'Glass Cannon',
      description: 'Built for speed, not endurance.',
      type: 'negative',
      effect: 'Take 25% more damage from all sources'
    },
    uniqueNicknames: ['Quicksilver', 'the Viper', 'Shadow Dance'],
    uniqueBackstories: ['Back alleys taught you that speed beats strength.'],
    signatureTraitPool: ['flurry', 'evasive_roll', 'precision_strike'],
    unlockCondition: {
      type: 'special',
      requirement: 'no_damage_fight',
      target: 1,
      description: 'Win a fight without taking damage'
    },
    unlocked: false
  },
  
  // Executioner
  {
    id: 'executioner',
    name: 'Executioner',
    title: 'Death\'s Hand',
    description: 'Former headsman. Terrifying but crowds hate you.',
    icon: '🪓',
    startingStatMods: {
      attack: 6,
      critDamage: 30
    },
    startingTrait: {
      id: 'death_sentence',
      name: 'Death Sentence',
      description: 'Your blade carries the weight of justice.',
      type: 'positive',
      effect: '+50% damage to enemies below 25% HP'
    },
    drawback: {
      id: 'feared_pariah',
      name: 'Feared Pariah',
      description: 'The crowd despises what you represent.',
      type: 'negative',
      effect: '-50% crowd hype gain, shops charge 20% more'
    },
    uniqueNicknames: ['Headsman', 'the Black Hood', 'Final Word'],
    uniqueBackstories: ['You ended lives by law. Now you do it for sport.'],
    signatureTraitPool: ['execution_strike', 'fear_aura', 'merciless'],
    unlockCondition: {
      type: 'deaths',
      requirement: 'bleed_deaths',
      target: 2,
      description: 'Die to Bleed status 2 times'
    },
    unlocked: false
  },
  
  // Apothecary's Ward
  {
    id: 'apothecary',
    name: 'Apothecary\'s Ward',
    title: 'Poison Blooded',
    description: 'Trained by healers. Potions stronger, wounds worse.',
    icon: '⚗️',
    startingStatMods: {
      maxHP: 10
    },
    startingTrait: {
      id: 'alchemical_blood',
      name: 'Alchemical Blood',
      description: 'Your body absorbs potions better.',
      type: 'positive',
      effect: 'All consumables 75% more effective'
    },
    drawback: {
      id: 'bleeder',
      name: 'Bleeder',
      description: 'Thin blood means wounds don\'t close.',
      type: 'negative',
      effect: 'Injuries take 50% longer to heal, Bleed deals double'
    },
    uniqueNicknames: ['Poison Kiss', 'the Bleeder', 'Vial Rat'],
    uniqueBackstories: ['They trained you to heal. You learned to harm.'],
    signatureTraitPool: ['toxic_blade', 'regeneration', 'chemical_rage'],
    unlockCondition: {
      type: 'stat',
      requirement: 'items_used',
      target: 50,
      description: 'Use 50 consumable items (lifetime)'
    },
    unlocked: false
  },
  
  // Disgraced Noble
  {
    id: 'noble',
    name: 'Disgraced Noble',
    title: 'Fallen Heir',
    description: 'Raised in luxury, fallen to the pits. High fame, fragile ego.',
    icon: '👑',
    startingStatMods: {
      accuracy: 5,
      maxFocus: 15
    },
    startingTrait: {
      id: 'noble_bearing',
      name: 'Noble Bearing',
      description: 'Even in rags, you command attention.',
      type: 'positive',
      effect: '+100% fame gain, start with 50 extra gold'
    },
    drawback: {
      id: 'fragile_ego',
      name: 'Fragile Ego',
      description: 'Defeat crushes your spirit.',
      type: 'negative',
      effect: 'Losing drops Trust by 20, injuries hurt twice as much'
    },
    uniqueNicknames: ['the Fallen', 'Silk Blood', 'Broken Crown'],
    uniqueBackstories: ['From castle to cage. From heir to slave.'],
    signatureTraitPool: ['noble_stance', 'rally_cry', 'desperate_gambit'],
    unlockCondition: {
      type: 'retire',
      requirement: 'retire_champion',
      target: 1,
      description: 'Retire a fighter as Champion'
    },
    unlocked: false
  },
  
  // Pit Beast
  {
    id: 'beast',
    name: 'Pit Beast',
    title: 'Savage Born',
    description: 'More animal than human. Raw power, no finesse.',
    icon: '🐺',
    startingStatMods: {
      attack: 8,
      maxHP: 30,
      accuracy: -15,
      evasion: -5
    },
    startingTrait: {
      id: 'feral_instinct',
      name: 'Feral Instinct',
      description: 'Fight on pure instinct.',
      type: 'positive',
      effect: 'Deal +30% damage when below 50% HP'
    },
    drawback: {
      id: 'untamed',
      name: 'Untamed',
      description: 'Cannot be controlled.',
      type: 'negative',
      effect: 'Cannot guard or use items, random target zones'
    },
    uniqueNicknames: ['the Beast', 'Wild One', 'Blood Maw'],
    uniqueBackstories: ['Raised by wolves. Or so they say.'],
    signatureTraitPool: ['frenzy', 'thick_hide', 'savage_roar'],
    unlockCondition: {
      type: 'stat',
      requirement: 'damage_dealt',
      target: 5000,
      description: 'Deal 5000 total damage (lifetime)'
    },
    unlocked: false
  },
  
  // Veteran
  {
    id: 'veteran',
    name: 'Arena Veteran',
    title: 'Old Blood',
    description: 'Survivor of a hundred fights. Experienced but aging.',
    icon: '🏛️',
    startingStatMods: {
      defense: 3,
      accuracy: 10,
      maxStamina: -10,
      speed: -2
    },
    startingTrait: {
      id: 'battle_wisdom',
      name: 'Battle Wisdom',
      description: 'Experience is the best teacher.',
      type: 'positive',
      effect: 'See enemy actions before they happen, +15% XP gain'
    },
    drawback: {
      id: 'old_wounds',
      name: 'Old Wounds',
      description: 'The body remembers every fight.',
      type: 'negative',
      effect: 'Start each fight with 1 random minor injury'
    },
    uniqueNicknames: ['Graybeard', 'the Survivor', 'Old Blood'],
    uniqueBackstories: ['They all said you were too old. Prove them wrong.'],
    signatureTraitPool: ['veteran_stance', 'reading_foe', 'one_last_fight'],
    unlockCondition: {
      type: 'wins',
      requirement: 'single_run_wins',
      target: 15,
      description: 'Win 15 fights in a single run'
    },
    unlocked: false
  }
];

/**
 * Get unlocked archetypes
 */
export function getUnlockedArchetypes(): CharacterArchetype[] {
  return ARCHETYPES_DATA.filter(a => a.unlocked);
}

/**
 * Check unlock progress for an archetype
 */
export function checkUnlockProgress(
  archetype: CharacterArchetype,
  stats: Record<string, number>
): number {
  const condition = archetype.unlockCondition;
  const current = stats[condition.requirement] || 0;
  return Math.min(1, current / condition.target);
}
