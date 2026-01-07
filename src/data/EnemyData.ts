/**
 * EnemyData - Enemy archetypes and names
 */

import { EnemyArchetype, EnemyAIType } from '../systems/EnemySystem';

// Enemy names
export const ENEMY_NAMES = [
  { first: 'Brutus', last: 'Ironjaw' },
  { first: 'Gaius', last: 'Bloodhand' },
  { first: 'Marcus', last: 'the Cruel' },
  { first: 'Varro', last: 'Steelarm' },
  { first: 'Crixus', last: 'the Shadow' },
  { first: 'Spartus', last: 'Bonecrusher' },
  { first: 'Drago', last: 'the Silent' },
  { first: 'Thorin', last: 'Skullsplitter' },
  { first: 'Ragnar', last: 'the Red' },
  { first: 'Ulric', last: 'Deathbringer' },
  { first: 'Kira', last: 'Swiftblade' },
  { first: 'Valeria', last: 'the Viper' },
  { first: 'Helena', last: 'Ironmaiden' },
  { first: 'Freya', last: 'Frostbite' },
  { first: 'Sigrid', last: 'the Storm' },
  { first: 'Malik', last: 'the Merciless' },
  { first: 'Cyrus', last: 'Sandstorm' },
  { first: 'Ajax', last: 'the Giant' },
  { first: 'Nero', last: 'Blackheart' },
  { first: 'Lucius', last: 'Goldmask' },
  { first: 'Gorm', last: 'the Grim' },
  { first: 'Fenris', last: 'Wolfjaw' },
  { first: 'Balthus', last: 'the Beast' },
  { first: 'Corvus', last: 'Ravenwing' }
];

// Enemy archetypes
export const ENEMY_ARCHETYPES: EnemyArchetype[] = [
  {
    id: 'brute',
    name: 'Brute Force',
    title: 'The Brute',
    aiType: 'brutal',
    statMultipliers: {
      maxHP: 1.2,
      attack: 1.3,
      defense: 0.9,
      speed: 0.8
    },
    specialAbility: 'Heavy blows deal +20% damage',
    flavorText: 'Raw strength and aggression. No finesse, just power.',
    taunts: [
      "I'll crush your skull!",
      "Weakling! Face a real warrior!",
      "Your bones will crack like twigs!",
      "This ends now!"
    ]
  },
  {
    id: 'duelist',
    name: 'Precise Strikes',
    title: 'The Duelist',
    aiType: 'tactical',
    statMultipliers: {
      attack: 1.0,
      defense: 1.0,
      speed: 1.2,
      accuracy: 1.15
    },
    specialAbility: '+15% critical chance',
    flavorText: 'Elegant and deadly. Every move calculated.',
    taunts: [
      "You fight like a farmer.",
      "Too slow. Much too slow.",
      "I've faced better.",
      "Shall we dance?"
    ]
  },
  {
    id: 'tank',
    name: 'Iron Wall',
    title: 'The Wall',
    aiType: 'defensive',
    statMultipliers: {
      maxHP: 1.4,
      defense: 1.4,
      attack: 0.8,
      speed: 0.7
    },
    specialAbility: '+30% block effectiveness',
    flavorText: 'Immovable and patient. Waits for you to tire.',
    taunts: [
      "Your attacks mean nothing.",
      "I could do this all day.",
      "Tired yet?",
      "I am the wall."
    ]
  },
  {
    id: 'assassin',
    name: 'Shadow Strike',
    title: 'The Assassin',
    aiType: 'trickster',
    statMultipliers: {
      maxHP: 0.8,
      attack: 1.1,
      speed: 1.4,
      evasion: 1.3
    },
    specialAbility: '+25% dodge chance',
    flavorText: 'Fast and elusive. Strikes from unexpected angles.',
    taunts: [
      "You can't hit what you can't see.",
      "Too predictable.",
      "Catch me if you can.",
      "Already behind you."
    ]
  },
  {
    id: 'berserker',
    name: 'Blood Rage',
    title: 'The Berserker',
    aiType: 'berserker',
    statMultipliers: {
      maxHP: 1.1,
      attack: 1.2,
      defense: 0.7,
      maxStamina: 1.2
    },
    specialAbility: '+30% damage when below 50% HP',
    flavorText: 'Grows more dangerous as the fight progresses.',
    taunts: [
      "BLOOD! MORE BLOOD!",
      "PAIN MAKES ME STRONGER!",
      "RAAAAAAGH!",
      "I CANNOT BE STOPPED!"
    ]
  },
  {
    id: 'veteran',
    name: 'Battle Wisdom',
    title: 'The Veteran',
    aiType: 'balanced',
    statMultipliers: {
      maxHP: 1.1,
      attack: 1.1,
      defense: 1.1,
      accuracy: 1.1
    },
    specialAbility: 'No weaknesses',
    flavorText: 'Years of experience. Knows every trick in the book.',
    taunts: [
      "I've seen it all before.",
      "Youth and enthusiasm, meet old age and treachery.",
      "Still learning, I see.",
      "Not bad. But not good enough."
    ]
  },
  {
    id: 'showman',
    name: 'Crowd Favorite',
    title: 'The Showman',
    aiType: 'aggressive',
    statMultipliers: {
      maxHP: 1.0,
      attack: 1.15,
      speed: 1.1
    },
    specialAbility: '+50% crowd hype gain',
    flavorText: 'Fights for glory and applause.',
    taunts: [
      "Watch closely, crowd!",
      "Let me show you how it's done!",
      "Are you not entertained?!",
      "Remember this moment!"
    ]
  },
  {
    id: 'executioner',
    name: 'Final Blow',
    title: 'The Executioner',
    aiType: 'brutal',
    statMultipliers: {
      maxHP: 1.15,
      attack: 1.25,
      accuracy: 1.1,
      speed: 0.9
    },
    specialAbility: '+50% damage to enemies below 25% HP',
    flavorText: 'Specializes in finishing wounded opponents.',
    taunts: [
      "Your end approaches.",
      "I smell your fear.",
      "Time to finish this.",
      "Accept your fate."
    ]
  }
];

// Champion enemies (boss fights)
export const CHAMPION_ENEMIES = [
  {
    id: 'bronze_champion',
    name: 'Marcus the Merciless',
    title: 'Bronze Champion',
    league: 'bronze',
    aiType: 'aggressive' as EnemyAIType,
    statMultipliers: {
      maxHP: 1.5,
      attack: 1.4,
      defense: 1.2,
      speed: 1.1
    },
    specialAbility: 'Intimidating Presence: Your accuracy is reduced by 10%',
    flavorText: 'The reigning Bronze Champion. Fast, brutal, hungry.',
    taunts: [
      "Another challenger? How boring.",
      "You're not ready for this.",
      "I've killed a hundred like you.",
      "The crowd knows who wins here."
    ]
  },
  {
    id: 'silver_champion',
    name: 'Valeria the Viper',
    title: 'Silver Champion',
    league: 'silver',
    aiType: 'trickster' as EnemyAIType,
    statMultipliers: {
      maxHP: 1.6,
      attack: 1.5,
      defense: 1.3,
      speed: 1.3,
      evasion: 1.2
    },
    specialAbility: 'Venomous: All attacks have a chance to apply Bleed',
    flavorText: 'The Silver Champion. Quick as a snake, twice as deadly.',
    taunts: [
      "My fangs find every opening.",
      "You're already dead, you just don't know it.",
      "Fast. Faster. Fastest.",
      "The venom spreads."
    ]
  },
  {
    id: 'gold_champion',
    name: 'Brutus the Eternal',
    title: 'Gold Champion',
    league: 'gold',
    aiType: 'balanced' as EnemyAIType,
    statMultipliers: {
      maxHP: 2.0,
      attack: 1.8,
      defense: 1.6,
      speed: 1.2,
      maxStamina: 1.3
    },
    specialAbility: 'Undying: Survives one fatal blow at 1 HP',
    flavorText: 'The Gold Champion. Legend says he cannot be killed.',
    taunts: [
      "Many have tried. All have failed.",
      "I've held this title for ten years.",
      "Your bloodline ends here.",
      "Kneel before the champion."
    ]
  },
  {
    id: 'grand_champion',
    name: 'The Nameless One',
    title: 'Grand Champion',
    league: 'champion',
    aiType: 'tactical' as EnemyAIType,
    statMultipliers: {
      maxHP: 2.5,
      attack: 2.0,
      defense: 1.8,
      speed: 1.4,
      accuracy: 1.2,
      maxFocus: 1.5
    },
    specialAbility: 'Perfect Form: +20% to all stats in second phase',
    flavorText: 'The Grand Champion. No one knows their true name. No one has survived to tell.',
    taunts: [
      "...",
      "You are not ready.",
      "This is the end.",
      "There is no victory for you here."
    ]
  }
];

// Rival templates
export const RIVAL_TEMPLATES = [
  {
    personality: 'arrogant',
    greetings: [
      "Oh, it's you again. Still alive?",
      "Back for more humiliation?",
      "I almost forgot you existed."
    ],
    victories: [
      "As expected. Pathetic.",
      "Tell everyone who beat you.",
      "Same result, different day."
    ],
    defeats: [
      "This... changes nothing!",
      "You got lucky. Enjoy it.",
      "Next time will be different."
    ]
  },
  {
    personality: 'respectful',
    greetings: [
      "A worthy opponent. Good.",
      "May the best fighter win.",
      "I've been watching you improve."
    ],
    victories: [
      "A good fight. Train harder.",
      "You nearly had me.",
      "Until next time."
    ],
    defeats: [
      "Well fought. Truly.",
      "I underestimated you.",
      "The better fighter won today."
    ]
  },
  {
    personality: 'vengeful',
    greetings: [
      "I've been waiting for this.",
      "You'll pay for what you've done.",
      "Today, I take my revenge."
    ],
    victories: [
      "Justice is served!",
      "That's what you deserve!",
      "Remember this pain."
    ],
    defeats: [
      "This isn't over!",
      "I'll come back stronger!",
      "You haven't seen the last of me!"
    ]
  }
];
