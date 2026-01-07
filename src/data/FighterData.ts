/**
 * FighterData - Names, backstories, keepsakes, traits, and voice lines
 */

// Names data
export const NAMES_DATA = {
  firstNames: [
    'Aldric', 'Bjorn', 'Cassius', 'Doran', 'Edric', 'Falco', 'Gareth', 'Harald',
    'Ivan', 'Jorik', 'Kael', 'Lothar', 'Milo', 'Nils', 'Osric', 'Pavel',
    'Quinn', 'Ragnar', 'Soren', 'Theron', 'Ulric', 'Viktor', 'Werner', 'Xander',
    'Yoren', 'Zephyr', 'Edda', 'Freya', 'Greta', 'Helga', 'Ingrid', 'Jutta',
    'Katla', 'Liv', 'Mira', 'Nessa', 'Olga', 'Petra', 'Runa', 'Sigrid',
    'Thora', 'Una', 'Vera', 'Wren', 'Ylva', 'Zara', 'Brynn', 'Astrid'
  ],
  
  lastNames: [
    'Ashford', 'Blackwood', 'Coldstream', 'Dunmore', 'Elderstone', 'Fairweather',
    'Grimshaw', 'Hartwell', 'Ironside', 'Jarvik', 'Korvin', 'Lockwood',
    'Moorland', 'Northcott', 'Oakhart', 'Pembrook', 'Queensbury', 'Ravencroft',
    'Stonebridge', 'Thornwood', 'Underhill', 'Varr', 'Windermere', 'Yarwood',
    'Brann', 'Voss', 'Krenn', 'Dahl', 'Falk', 'Griff'
  ],
  
  nicknames: [
    'Tin Smile', 'Left Hook', 'The Silent', 'Red Fist', 'Iron Jaw', 'The Gentle',
    'Blood Eye', 'One Shot', 'The Grim', 'Lucky', 'The Bear', 'Swift Blade',
    'The Butcher', 'Old Bones', 'The Crow', 'Steel Shin', 'Thunder', 'The Wall',
    'Widow Maker', 'The Ghost', 'Bone Breaker', 'The Hound', 'Scarface', 'The Ox',
    'Quickdraw', 'The Jackal', 'Stone Cold', 'Fury', 'The Serpent', 'Nightshade',
    'Pale Death', 'The Anvil', 'Copperhead', 'The Reaper', 'Mercy', 'Grudge'
  ]
};

// Backstory data
export const BACKSTORIES_DATA = {
  birthplaces: [
    'Nordheim', 'the Dustlands', 'Port Veras', 'the Iron Hills', 'Greymarsh',
    'Ashenvale', 'the Frozen Coast', 'Thornwick', 'the Capital', 'Saltmere',
    'the Border Wastes', 'Kingsridge', 'the Outer Reaches', 'Mirefall', 'Stonehaven'
  ],
  
  snippets: [
    'Born in {birthplace}, {age} winters have hardened this fighter. Sold into the arena to pay family debts.',
    'A former soldier from {birthplace}, discharged after {age} years. The arena is all that remains.',
    'Once a farmer\'s child in {birthplace}. At {age}, the crops failed, and fighting became the only trade.',
    'Raised in the slums of {birthplace}. At {age}, the arena offers a chance at something more than survival.',
    'A disgraced noble from {birthplace}, now {age} and fighting to reclaim lost honor.',
    'Born to arena champions in {birthplace}. At {age}, the bloodline demands its due.',
    'An orphan of {birthplace}\'s plague years. Now {age}, with nothing left to lose.',
    'A freed slave from {birthplace}, {age} years old. The arena is freedom, strange as it seems.',
    'A wanderer from {birthplace} who found purpose at {age}. The roar of crowds calls.',
    'Convicted of a crime in {birthplace} at a young age. Now {age}, fighting for redemption.',
    'A blacksmith\'s apprentice from {birthplace}, {age} years old. Strong arms, stronger will.',
    'Born during the siege of {birthplace}. {age} years of war made a natural fighter.'
  ]
};

// Keepsakes data
export const KEEPSAKES_DATA = [
  {
    id: 'mothers_coin',
    name: "Mother's Coin",
    backstory: 'A worn copper coin, pressed into small hands on the day of departure. "For luck," she said.',
    effect: '+5 starting Focus',
    statBonus: { maxFocus: 5 },
    upgradeEffect: '+10 starting Focus, +5% gold gain'
  },
  {
    id: 'broken_whistle',
    name: 'Broken Whistle',
    backstory: 'Once called the family dog. Now only a memory of simpler times rattles inside.',
    effect: '+5 max Stamina',
    statBonus: { maxStamina: 5 },
    upgradeEffect: '+10 max Stamina'
  },
  {
    id: 'old_ribbon',
    name: 'Old Ribbon',
    backstory: 'Faded blue, from someone who promised to wait. They probably moved on.',
    effect: '+1 Trust per camp rest',
    statBonus: {},
    upgradeEffect: '+2 Trust per rest, reduced injury severity'
  },
  {
    id: 'clay_figurine',
    name: 'Clay Figurine',
    backstory: 'A child\'s crude sculpture of a warrior. Made with love, if not skill.',
    effect: '+5% crowd hype gain',
    statBonus: {},
    upgradeEffect: '+15% crowd hype gain'
  },
  {
    id: 'tooth_necklace',
    name: 'Tooth Necklace',
    backstory: 'A beast\'s fang from a hunt that almost ended everything. A reminder of survival.',
    effect: '+3 Attack',
    statBonus: { attack: 3 },
    upgradeEffect: '+5 Attack, +5% crit chance'
  },
  {
    id: 'prayer_beads',
    name: 'Prayer Beads',
    backstory: 'Worn smooth by generations of whispered hopes. The gods may be listening.',
    effect: '+8 max HP',
    statBonus: { maxHP: 8 },
    upgradeEffect: '+15 max HP'
  },
  {
    id: 'lucky_dice',
    name: 'Lucky Dice',
    backstory: 'Won these from a dying man. He said they always rolled true. Hasn\'t failed yet.',
    effect: '+5% critical chance',
    statBonus: { critChance: 5 },
    upgradeEffect: '+10% critical chance'
  },
  {
    id: 'faded_letter',
    name: 'Faded Letter',
    backstory: 'The ink has run, the words nearly lost. But the feeling remains.',
    effect: 'Start with 10 extra Trust',
    statBonus: {},
    upgradeEffect: 'Start with 25 extra Trust'
  },
  {
    id: 'iron_ring',
    name: 'Iron Ring',
    backstory: 'A wedding band? A slave\'s mark? Both have the same weight now.',
    effect: '+3 Defense',
    statBonus: { defense: 3 },
    upgradeEffect: '+5 Defense, reduced bleed duration'
  },
  {
    id: 'dried_flower',
    name: 'Dried Flower',
    backstory: 'Picked the morning of recruitment. Already dead, but still beautiful.',
    effect: 'Injuries heal 1 week faster',
    statBonus: {},
    upgradeEffect: 'Injuries heal 2 weeks faster, +10 HP when resting'
  }
];

// Traits data
export const TRAITS_DATA = {
  signature: [
    {
      id: 'tin_smile',
      name: 'Tin Smile',
      description: 'Cannot be intimidated. Fear effects have no power here.',
      type: 'positive' as const,
      effect: 'Immune to Fear',
      evolutionNames: ['Tin Smile', 'Iron Grin', 'Steel Sneer']
    },
    {
      id: 'gentle_giant',
      name: 'Gentle Giant',
      description: 'The crowd loves a merciful warrior. Showing mercy grants bonus hype.',
      type: 'positive' as const,
      effect: '+20 Hype on merciful actions',
      evolutionNames: ['Gentle Giant', 'Noble Warrior', 'The Beloved']
    },
    {
      id: 'vengeful',
      name: 'Vengeful',
      description: 'Pain fuels rage. Damage taken increases attack power temporarily.',
      type: 'positive' as const,
      effect: '+2 Attack per 10% HP lost',
      evolutionNames: ['Vengeful', 'Wrathful', 'Avatar of Vengeance']
    },
    {
      id: 'crowd_pleaser',
      name: 'Crowd Pleaser',
      description: 'Fighting is an art. Style matters as much as substance.',
      type: 'positive' as const,
      effect: '+50% Hype gain',
      evolutionNames: ['Crowd Pleaser', 'Fan Favorite', 'Legend of the Arena']
    },
    {
      id: 'survivors_instinct',
      name: "Survivor's Instinct",
      description: 'Near-death awakens hidden reserves. Low health grants bonuses.',
      type: 'positive' as const,
      effect: '+20% Evasion below 25% HP',
      evolutionNames: ["Survivor's Instinct", 'Death Defier', 'Unkillable']
    },
    {
      id: 'quick_study',
      name: 'Quick Study',
      description: 'Learns from every blow. Accuracy improves throughout the fight.',
      type: 'positive' as const,
      effect: '+3% Accuracy per round',
      evolutionNames: ['Quick Study', 'Adaptable', 'Master Tactician']
    },
    {
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: 'Abandon defense for overwhelming offense.',
      type: 'positive' as const,
      effect: '+30% damage, -15% defense',
      evolutionNames: ['Berserker Rage', 'Blood Frenzy', 'Unstoppable Force']
    },
    {
      id: 'iron_defense',
      name: 'Iron Defense',
      description: 'An immovable object. Blocking is second nature.',
      type: 'positive' as const,
      effect: '+25% block effectiveness',
      evolutionNames: ['Iron Defense', 'Stone Wall', 'Impenetrable']
    },
    {
      id: 'opportunist',
      name: 'Opportunist',
      description: 'Strikes when the enemy falters. Bonus damage to stunned enemies.',
      type: 'positive' as const,
      effect: '+40% damage to debuffed enemies',
      evolutionNames: ['Opportunist', 'Exploiter', 'Weakness Hunter']
    },
    {
      id: 'last_stand',
      name: 'Last Stand',
      description: 'Refuses to fall. Once per fight, survive a killing blow at 1 HP.',
      type: 'positive' as const,
      effect: 'Survive fatal (1x per fight)',
      evolutionNames: ['Last Stand', 'Deathless', 'The Immortal']
    },
    {
      id: 'patient_fighter',
      name: 'Patient Fighter',
      description: 'Conserves energy. Stamina regenerates faster.',
      type: 'positive' as const,
      effect: '+50% Stamina regen',
      evolutionNames: ['Patient Fighter', 'Enduring', 'Tireless']
    },
    {
      id: 'intimidating_presence',
      name: 'Intimidating Presence',
      description: 'Enemies falter before the fight begins.',
      type: 'positive' as const,
      effect: 'Enemies start with -10 Accuracy',
      evolutionNames: ['Intimidating Presence', 'Terrifying Aura', 'Walking Nightmare']
    }
  ],
  
  positive: [
    {
      id: 'strong_arm',
      name: 'Strong Arm',
      description: 'Natural strength grants bonus damage.',
      type: 'positive' as const,
      effect: '+3 Attack',
      statModifier: { attack: 3 }
    },
    {
      id: 'thick_skin',
      name: 'Thick Skin',
      description: 'Hardened by years of punishment.',
      type: 'positive' as const,
      effect: '+5 Defense',
      statModifier: { defense: 5 }
    },
    {
      id: 'light_feet',
      name: 'Light Feet',
      description: 'Quick and agile in the arena.',
      type: 'positive' as const,
      effect: '+8 Evasion',
      statModifier: { evasion: 8 }
    },
    {
      id: 'keen_eyes',
      name: 'Keen Eyes',
      description: 'Rarely misses a strike.',
      type: 'positive' as const,
      effect: '+10 Accuracy',
      statModifier: { accuracy: 10 }
    },
    {
      id: 'endless_stamina',
      name: 'Endless Stamina',
      description: 'Can fight all day without tiring.',
      type: 'positive' as const,
      effect: '+15 Max Stamina',
      statModifier: { maxStamina: 15 }
    },
    {
      id: 'born_fighter',
      name: 'Born Fighter',
      description: 'Combat comes naturally.',
      type: 'positive' as const,
      effect: '+10 Max HP, +2 Attack',
      statModifier: { maxHP: 10, attack: 2 }
    },
    {
      id: 'focused_mind',
      name: 'Focused Mind',
      description: 'Clarity in chaos.',
      type: 'positive' as const,
      effect: '+10 Max Focus',
      statModifier: { maxFocus: 10 }
    },
    {
      id: 'quick_reflexes',
      name: 'Quick Reflexes',
      description: 'Reacts before thinking.',
      type: 'positive' as const,
      effect: '+3 Speed',
      statModifier: { speed: 3 }
    }
  ],
  
  negative: [
    {
      id: 'old_injury',
      name: 'Old Injury',
      description: 'An old wound that never quite healed.',
      type: 'negative' as const,
      effect: '-10 Max HP',
      statModifier: { maxHP: -10 }
    },
    {
      id: 'poor_eyesight',
      name: 'Poor Eyesight',
      description: 'Struggles to land precise hits.',
      type: 'negative' as const,
      effect: '-8 Accuracy',
      statModifier: { accuracy: -8 }
    },
    {
      id: 'glass_jaw',
      name: 'Glass Jaw',
      description: 'One good hit to the head, and it\'s over.',
      type: 'negative' as const,
      effect: '+50% damage from head hits',
      statModifier: {}
    },
    {
      id: 'brittle_bones',
      name: 'Brittle Bones',
      description: 'Injuries are more severe.',
      type: 'negative' as const,
      effect: '+1 week injury heal time',
      statModifier: {}
    },
    {
      id: 'slow_starter',
      name: 'Slow Starter',
      description: 'Takes time to warm up.',
      type: 'negative' as const,
      effect: '-20% damage rounds 1-2',
      statModifier: {}
    },
    {
      id: 'arrogant',
      name: 'Arrogant',
      description: 'Overconfidence leads to mistakes.',
      type: 'negative' as const,
      effect: '-5 Evasion when HP > 70%',
      statModifier: {}
    },
    {
      id: 'nervous',
      name: 'Nervous',
      description: 'Crowds make mistakes more likely.',
      type: 'negative' as const,
      effect: '-5 Accuracy at high Hype',
      statModifier: {}
    },
    {
      id: 'weak_constitution',
      name: 'Weak Constitution',
      description: 'Tires quickly in prolonged fights.',
      type: 'negative' as const,
      effect: '-10 Max Stamina',
      statModifier: { maxStamina: -10 }
    },
    {
      id: 'scarred_lungs',
      name: 'Scarred Lungs',
      description: 'Breathes heavy, moves slow.',
      type: 'negative' as const,
      effect: '-2 Speed',
      statModifier: { speed: -2 }
    },
    {
      id: 'cowardly',
      name: 'Cowardly',
      description: 'Fear takes hold too easily.',
      type: 'negative' as const,
      effect: '+20% Fear effect duration',
      statModifier: {}
    },
    {
      id: 'reckless',
      name: 'Reckless',
      description: 'Attacks without thinking.',
      type: 'negative' as const,
      effect: '-5 Defense',
      statModifier: { defense: -5 }
    },
    {
      id: 'bad_knee',
      name: 'Bad Knee',
      description: 'An old injury that flares up.',
      type: 'negative' as const,
      effect: '+30% damage from leg hits',
      statModifier: {}
    }
  ]
};

// Voice lines by personality
export const VOICE_LINES_DATA: Record<string, Record<string, string[]>> = {
  stoic: {
    battle_start: [
      '"..."',
      '"Let\'s get this done."',
      '"Another day."'
    ],
    taking_damage: [
      '"Tch."',
      '"I\'ve had worse."',
      '"..."'
    ],
    dealing_damage: [
      '"..."',
      '"Down."',
      '"Fall."'
    ],
    low_health: [
      '"Not yet."',
      '"Still standing."',
      '"..."'
    ],
    victory: [
      '"It\'s done."',
      '"..."',
      '"Next."'
    ],
    defeat: [
      '"..."',
      '"So it ends."'
    ],
    rest: [
      '"A moment\'s peace."',
      '"..."'
    ],
    training: [
      '"Again."',
      '"..."'
    ],
    shop: [
      '"What do you have?"',
      '"..."'
    ],
    idle: [
      '"..."',
      '"Waiting."'
    ]
  },
  
  aggressive: {
    battle_start: [
      '"Blood! Blood! BLOOD!"',
      '"COME ON!"',
      '"I\'ll tear you apart!"'
    ],
    taking_damage: [
      '"Is that all?!"',
      '"MORE!"',
      '"HA! Again!"'
    ],
    dealing_damage: [
      '"YES!"',
      '"FEEL IT!"',
      '"DIE!"'
    ],
    low_health: [
      '"I\'m not done!"',
      '"NEVER!"',
      '"MORE BLOOD!"'
    ],
    victory: [
      '"WHO\'S NEXT?!"',
      '"WEAK!"',
      '"HA HA HA!"'
    ],
    defeat: [
      '"No... MORE!"',
      '"This isn\'t..."'
    ],
    rest: [
      '"Bah, wasting time."',
      '"When do we fight?"'
    ],
    training: [
      '"Hit me harder!"',
      '"AGAIN!"'
    ],
    shop: [
      '"Give me something deadly."',
      '"Sharper. Deadlier."'
    ],
    idle: [
      '"Where\'s the fight?"',
      '"Boring..."'
    ]
  },
  
  honorable: {
    battle_start: [
      '"May the best warrior win."',
      '"I fight with honor."',
      '"Ancestors, guide my blade."'
    ],
    taking_damage: [
      '"A fair blow."',
      '"Well struck."',
      '"Nngh... honorable."'
    ],
    dealing_damage: [
      '"Forgive me."',
      '"For glory!"',
      '"Stand down, with honor."'
    ],
    low_health: [
      '"I will not yield."',
      '"Honor demands I stand."',
      '"Not like this..."'
    ],
    victory: [
      '"A good fight. You have my respect."',
      '"The ancestors smile."',
      '"Glory earned."'
    ],
    defeat: [
      '"I die... with honor."',
      '"A worthy opponent."'
    ],
    rest: [
      '"I must center myself."',
      '"Quiet contemplation."'
    ],
    training: [
      '"Discipline makes the warrior."',
      '"Honor in preparation."'
    ],
    shop: [
      '"A fine blade for a fair price."',
      '"Quality, not trickery."'
    ],
    idle: [
      '"Patience is a virtue."',
      '"The fight will come."'
    ]
  },
  
  cunning: {
    battle_start: [
      '"I already know how this ends."',
      '"You\'ve already lost."',
      '"Interesting..."'
    ],
    taking_damage: [
      '"As expected."',
      '"I let you have that one."',
      '"Clever. But not clever enough."'
    ],
    dealing_damage: [
      '"Predictable."',
      '"Just as planned."',
      '"Too easy."'
    ],
    low_health: [
      '"All part of the plan."',
      '"You think you\'ve won?"',
      '"Not yet..."'
    ],
    victory: [
      '"Exactly as I foresaw."',
      '"Was there ever any doubt?"',
      '"Outplayed."'
    ],
    defeat: [
      '"Impossible... how did..."',
      '"I miscalculated."'
    ],
    rest: [
      '"Time to think."',
      '"Planning the next move."'
    ],
    training: [
      '"Mind over muscle."',
      '"Knowing the enemy."'
    ],
    shop: [
      '"What advantages can I gain?"',
      '"Everything has a use."'
    ],
    idle: [
      '"Observing. Always observing."',
      '"Everyone has a weakness."'
    ]
  },
  
  fearful: {
    battle_start: [
      '"Oh gods, oh gods..."',
      '"I don\'t want to do this."',
      '"Please... I just want to live."'
    ],
    taking_damage: [
      '"AHHH!"',
      '"No no no!"',
      '"Please stop!"'
    ],
    dealing_damage: [
      '"S-sorry!"',
      '"I had to!"',
      '"Please fall!"'
    ],
    low_health: [
      '"I don\'t want to die!"',
      '"Please, mercy!"',
      '"Gods save me!"'
    ],
    victory: [
      '"I... I did it?"',
      '"I\'m alive! I\'m alive!"',
      '"Thank the gods..."'
    ],
    defeat: [
      '"I knew it... I knew..."',
      '"Mother..."'
    ],
    rest: [
      '"Safe... for now."',
      '"Maybe I can run..."'
    ],
    training: [
      '"I\'ll try..."',
      '"Please don\'t hit too hard."'
    ],
    shop: [
      '"Something protective, please."',
      '"Anything to help me survive."'
    ],
    idle: [
      '"Why am I here?"',
      '"There has to be another way..."'
    ]
  },
  
  jovial: {
    battle_start: [
      '"Let\'s have some fun!"',
      '"Nice day for a fight, eh?"',
      '"May the best looking one win!"'
    ],
    taking_damage: [
      '"Ow! Good one!"',
      '"Ha! That tickled!"',
      '"Oh, you\'re serious!"'
    ],
    dealing_damage: [
      '"Haha! How about that?"',
      '"Didn\'t see that coming!"',
      '"Tag! You\'re it!"'
    ],
    low_health: [
      '"Getting interesting now!"',
      '"Ha... ha... okay, serious time."',
      '"You\'re making this dramatic!"'
    ],
    victory: [
      '"Good game! Drinks are on me!"',
      '"That was fun! Again sometime?"',
      '"Haha! What a rush!"'
    ],
    defeat: [
      '"Heh... well played..."',
      '"Guess the joke\'s on me..."'
    ],
    rest: [
      '"Time for ale and stories!"',
      '"Rest is good for the soul!"'
    ],
    training: [
      '"Let\'s make it a game!"',
      '"Winner buys the drinks!"'
    ],
    shop: [
      '"Got anything shiny?"',
      '"Ooh, what\'s this do?"'
    ],
    idle: [
      '"Anyone want to hear a joke?"',
      '"Bored bored bored..."'
    ]
  }
};
