/**
 * CombatData - Injuries, items, and combat-related content
 */

import { Injury } from '../systems/FighterSystem';

// Injury templates
export const INJURIES_DATA: Omit<Injury, 'id'>[] = [
  // Minor injuries (1-2 weeks to heal)
  {
    name: 'Bruised Ribs',
    location: 'body',
    severity: 'minor',
    effect: 'Hurts to breathe deeply',
    statPenalty: { maxStamina: -5 },
    healTime: 1,
    scarChance: 0
  },
  {
    name: 'Split Lip',
    location: 'head',
    severity: 'minor',
    effect: 'Looks worse than it is',
    statPenalty: {},
    healTime: 1,
    scarChance: 0.1
  },
  {
    name: 'Twisted Ankle',
    location: 'legs',
    severity: 'minor',
    effect: 'Movement slightly impaired',
    statPenalty: { speed: -1, evasion: -3 },
    healTime: 1,
    scarChance: 0
  },
  {
    name: 'Black Eye',
    location: 'head',
    severity: 'minor',
    effect: 'Vision slightly impaired',
    statPenalty: { accuracy: -5 },
    healTime: 1,
    scarChance: 0
  },
  {
    name: 'Strained Shoulder',
    location: 'body',
    severity: 'minor',
    effect: 'Arm feels weak',
    statPenalty: { attack: -2 },
    healTime: 2,
    scarChance: 0
  },
  
  // Moderate injuries (2-3 weeks to heal)
  {
    name: 'Deep Cut',
    location: 'body',
    severity: 'moderate',
    effect: 'Bleeding wound',
    statPenalty: { maxHP: -10, defense: -2 },
    healTime: 2,
    scarChance: 0.3
  },
  {
    name: 'Fractured Jaw',
    location: 'head',
    severity: 'moderate',
    effect: 'Speaking and eating is painful',
    statPenalty: { maxStamina: -8 },
    healTime: 3,
    scarChance: 0.2
  },
  {
    name: 'Torn Muscle',
    location: 'legs',
    severity: 'moderate',
    effect: 'Mobility severely limited',
    statPenalty: { speed: -3, evasion: -8 },
    healTime: 3,
    scarChance: 0
  },
  {
    name: 'Cracked Ribs',
    location: 'body',
    severity: 'moderate',
    effect: 'Every breath hurts',
    statPenalty: { maxStamina: -12, defense: -3 },
    healTime: 3,
    scarChance: 0
  },
  {
    name: 'Gashed Thigh',
    location: 'legs',
    severity: 'moderate',
    effect: 'Deep wound, heavy bleeding',
    statPenalty: { maxHP: -8, speed: -2 },
    healTime: 2,
    scarChance: 0.4
  },
  {
    name: 'Concussion',
    location: 'head',
    severity: 'moderate',
    effect: 'Head trauma, dizziness',
    statPenalty: { accuracy: -10, maxFocus: -10 },
    healTime: 2,
    scarChance: 0
  },
  
  // Severe injuries (4-5 weeks to heal)
  {
    name: 'Broken Arm',
    location: 'body',
    severity: 'severe',
    effect: 'Cannot use dominant arm properly',
    statPenalty: { attack: -8, accuracy: -15 },
    healTime: 4,
    scarChance: 0.1
  },
  {
    name: 'Shattered Knee',
    location: 'legs',
    severity: 'severe',
    effect: 'May never fight the same',
    statPenalty: { speed: -5, evasion: -15 },
    healTime: 5,
    scarChance: 0.2
  },
  {
    name: 'Skull Fracture',
    location: 'head',
    severity: 'severe',
    effect: 'Life-threatening head trauma',
    statPenalty: { maxHP: -20, maxFocus: -15 },
    healTime: 5,
    scarChance: 0.5
  },
  {
    name: 'Punctured Lung',
    location: 'body',
    severity: 'severe',
    effect: 'Breathing is agony',
    statPenalty: { maxStamina: -25, maxHP: -15 },
    healTime: 5,
    scarChance: 0.3
  },
  {
    name: 'Severed Tendon',
    location: 'legs',
    severity: 'severe',
    effect: 'Leg barely functional',
    statPenalty: { speed: -8, evasion: -20, attack: -3 },
    healTime: 5,
    scarChance: 0.4
  },
  {
    name: 'Facial Disfigurement',
    location: 'head',
    severity: 'severe',
    effect: 'Scarred for life',
    statPenalty: {},
    healTime: 4,
    scarChance: 1.0
  }
];

// Combat items
export interface CombatItem {
  id: string;
  name: string;
  description: string;
  type: 'healing' | 'buff' | 'utility';
  effect: string;
  value: number;
  uses: number;
  price: number;
}

export const COMBAT_ITEMS: CombatItem[] = [
  {
    id: 'bandages',
    name: 'Crude Bandages',
    description: 'Dirty cloth strips. Better than nothing.',
    type: 'healing',
    effect: 'Restore 20 HP',
    value: 20,
    uses: 1,
    price: 15
  },
  {
    id: 'healing_salve',
    name: 'Healing Salve',
    description: 'A pungent green paste that numbs pain.',
    type: 'healing',
    effect: 'Restore 35 HP',
    value: 35,
    uses: 1,
    price: 30
  },
  {
    id: 'surgeons_kit',
    name: "Surgeon's Kit",
    description: 'Professional medical supplies.',
    type: 'healing',
    effect: 'Restore 50 HP, cure Bleed',
    value: 50,
    uses: 1,
    price: 60
  },
  {
    id: 'grit_salts',
    name: 'Grit Salts',
    description: 'Inhale for instant alertness. Burns like hell.',
    type: 'buff',
    effect: 'Restore 30 Stamina',
    value: 30,
    uses: 1,
    price: 25
  },
  {
    id: 'focus_tonic',
    name: 'Focus Tonic',
    description: 'A bitter brew that sharpens the mind.',
    type: 'buff',
    effect: 'Gain 20 Focus',
    value: 20,
    uses: 1,
    price: 35
  },
  {
    id: 'berserker_draught',
    name: 'Berserker Draught',
    description: 'Red liquid that tastes of iron. +5 Attack for 3 turns.',
    type: 'buff',
    effect: '+5 Attack (3 turns)',
    value: 5,
    uses: 1,
    price: 45
  },
  {
    id: 'iron_skin_oil',
    name: 'Iron-Skin Oil',
    description: 'Protective coating. +5 Defense for 3 turns.',
    type: 'buff',
    effect: '+5 Defense (3 turns)',
    value: 5,
    uses: 1,
    price: 45
  },
  {
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    description: 'Creates a concealing cloud. Guarantees dodge next attack.',
    type: 'utility',
    effect: 'Guaranteed dodge (1 attack)',
    value: 1,
    uses: 1,
    price: 50
  },
  {
    id: 'flash_powder',
    name: 'Flash Powder',
    description: 'Blinds the opponent. -20 Accuracy for 2 turns.',
    type: 'utility',
    effect: 'Enemy -20 Accuracy (2 turns)',
    value: 20,
    uses: 1,
    price: 40
  },
  {
    id: 'antivenom',
    name: 'Antivenom',
    description: 'Neutralizes poisons and clears the blood.',
    type: 'healing',
    effect: 'Cure Bleed and Poison',
    value: 0,
    uses: 1,
    price: 35
  }
];

// Weapon data
export interface WeaponData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  attackBonus: number;
  accuracyBonus: number;
  critBonus: number;
  effect?: string;
  price: number;
}

export const WEAPONS_DATA: WeaponData[] = [
  // Common weapons
  {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'A worn blade, but still sharp enough.',
    rarity: 'common',
    attackBonus: 2,
    accuracyBonus: 0,
    critBonus: 0,
    price: 30
  },
  {
    id: 'wooden_club',
    name: 'Wooden Club',
    description: 'Simple but effective.',
    rarity: 'common',
    attackBonus: 3,
    accuracyBonus: -5,
    critBonus: 0,
    price: 20
  },
  {
    id: 'fighting_knife',
    name: 'Fighting Knife',
    description: 'Quick and precise.',
    rarity: 'common',
    attackBonus: 1,
    accuracyBonus: 8,
    critBonus: 3,
    price: 35
  },
  {
    id: 'iron_mace',
    name: 'Iron Mace',
    description: 'Heavy and crushing.',
    rarity: 'common',
    attackBonus: 4,
    accuracyBonus: -3,
    critBonus: 0,
    price: 40
  },
  
  // Uncommon weapons
  {
    id: 'soldiers_blade',
    name: "Soldier's Blade",
    description: 'A proper military weapon.',
    rarity: 'uncommon',
    attackBonus: 5,
    accuracyBonus: 3,
    critBonus: 2,
    price: 80
  },
  {
    id: 'spiked_flail',
    name: 'Spiked Flail',
    description: 'Unpredictable and dangerous.',
    rarity: 'uncommon',
    attackBonus: 6,
    accuracyBonus: -5,
    critBonus: 5,
    price: 90
  },
  {
    id: 'gladius',
    name: 'Gladius',
    description: 'Classic arena weapon.',
    rarity: 'uncommon',
    attackBonus: 4,
    accuracyBonus: 5,
    critBonus: 3,
    price: 85
  },
  {
    id: 'war_axe',
    name: 'War Axe',
    description: 'Brutal chopping power.',
    rarity: 'uncommon',
    attackBonus: 7,
    accuracyBonus: -3,
    critBonus: 4,
    price: 95
  },
  
  // Rare weapons
  {
    id: 'champion_sword',
    name: "Champion's Sword",
    description: 'Wielded by a former champion.',
    rarity: 'rare',
    attackBonus: 8,
    accuracyBonus: 5,
    critBonus: 5,
    effect: '+10% Hype gain',
    price: 180
  },
  {
    id: 'blood_drinker',
    name: 'Blood Drinker',
    description: 'Heals on critical hits.',
    rarity: 'rare',
    attackBonus: 6,
    accuracyBonus: 3,
    critBonus: 8,
    effect: 'Crit heals 10 HP',
    price: 200
  },
  {
    id: 'executioner',
    name: 'The Executioner',
    description: 'Heavy two-handed blade.',
    rarity: 'rare',
    attackBonus: 12,
    accuracyBonus: -8,
    critBonus: 10,
    effect: '+30% damage to low HP enemies',
    price: 220
  },
  {
    id: 'viper_fang',
    name: 'Viper Fang',
    description: 'Poisoned edge.',
    rarity: 'rare',
    attackBonus: 5,
    accuracyBonus: 8,
    critBonus: 5,
    effect: 'Attacks apply Bleed',
    price: 190
  },
  
  // Legendary weapons
  {
    id: 'crown_slayer',
    name: 'Crown Slayer',
    description: 'The weapon of legends.',
    rarity: 'legendary',
    attackBonus: 12,
    accuracyBonus: 8,
    critBonus: 10,
    effect: '+50% damage to champions',
    price: 500
  },
  {
    id: 'soulreaper',
    name: 'Soulreaper',
    description: 'Said to steal the dying breath.',
    rarity: 'legendary',
    attackBonus: 10,
    accuracyBonus: 5,
    critBonus: 15,
    effect: 'Killing blows restore 25 HP',
    price: 450
  }
];

// Armor data
export interface ArmorData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  defenseBonus: number;
  hpBonus: number;
  speedPenalty: number;
  effect?: string;
  price: number;
}

export const ARMOR_DATA: ArmorData[] = [
  // Common armor
  {
    id: 'leather_vest',
    name: 'Leather Vest',
    description: 'Basic protection.',
    rarity: 'common',
    defenseBonus: 3,
    hpBonus: 0,
    speedPenalty: 0,
    price: 25
  },
  {
    id: 'padded_gambeson',
    name: 'Padded Gambeson',
    description: 'Quilted cloth armor.',
    rarity: 'common',
    defenseBonus: 4,
    hpBonus: 5,
    speedPenalty: 1,
    price: 35
  },
  {
    id: 'studded_leather',
    name: 'Studded Leather',
    description: 'Leather reinforced with metal studs.',
    rarity: 'common',
    defenseBonus: 5,
    hpBonus: 0,
    speedPenalty: 1,
    price: 45
  },
  
  // Uncommon armor
  {
    id: 'chainmail_shirt',
    name: 'Chainmail Shirt',
    description: 'Interlocked metal rings.',
    rarity: 'uncommon',
    defenseBonus: 8,
    hpBonus: 5,
    speedPenalty: 2,
    price: 100
  },
  {
    id: 'gladiator_harness',
    name: 'Gladiator Harness',
    description: 'Arena-style protective gear.',
    rarity: 'uncommon',
    defenseBonus: 6,
    hpBonus: 10,
    speedPenalty: 0,
    price: 110
  },
  {
    id: 'scale_mail',
    name: 'Scale Mail',
    description: 'Overlapping metal scales.',
    rarity: 'uncommon',
    defenseBonus: 9,
    hpBonus: 0,
    speedPenalty: 3,
    price: 120
  },
  
  // Rare armor
  {
    id: 'champion_plate',
    name: "Champion's Plate",
    description: 'Worn by arena legends.',
    rarity: 'rare',
    defenseBonus: 12,
    hpBonus: 15,
    speedPenalty: 2,
    effect: '+10 Trust with crowd',
    price: 250
  },
  {
    id: 'shadow_leather',
    name: 'Shadow Leather',
    description: 'Dark, supple armor.',
    rarity: 'rare',
    defenseBonus: 8,
    hpBonus: 5,
    speedPenalty: -1,
    effect: '+10 Evasion',
    price: 230
  },
  {
    id: 'berserker_hide',
    name: 'Berserker Hide',
    description: 'Blessed by battle priests.',
    rarity: 'rare',
    defenseBonus: 6,
    hpBonus: 20,
    speedPenalty: 0,
    effect: '+15% damage when injured',
    price: 240
  },
  
  // Legendary armor
  {
    id: 'immortal_aegis',
    name: 'Immortal Aegis',
    description: 'Said to have saved a hundred lives.',
    rarity: 'legendary',
    defenseBonus: 15,
    hpBonus: 25,
    speedPenalty: 2,
    effect: 'Survive fatal blow once per fight',
    price: 500
  },
  {
    id: 'bloodline_armor',
    name: 'Bloodline Armor',
    description: 'Passed through generations of champions.',
    rarity: 'legendary',
    defenseBonus: 12,
    hpBonus: 30,
    speedPenalty: 1,
    effect: '+2 Bloodline Points on victory',
    price: 480
  }
];
