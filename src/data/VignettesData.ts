/**
 * VignettesData - Camp vignette scenes with choices
 */

export interface VignetteChoice {
  id: string;
  text: string;
  effects: {
    trust?: number;
    gold?: number;
    fame?: number;
    hp?: number;
    stamina?: number;
    injury?: 'minor' | 'moderate' | null;
    injuryHeal?: number;
    buff?: string;
    reputation?: number;
  };
  resultText: string;
}

export interface Vignette {
  id: string;
  title: string;
  description: string;
  choices: VignetteChoice[];
  category: 'camp' | 'offer' | 'letter' | 'event';
  requirements?: {
    minWeek?: number;
    minTrust?: number;
    maxTrust?: number;
    hasInjury?: boolean;
  };
}

export const VIGNETTES_DATA: Vignette[] = [
  // Camp vignettes
  {
    id: 'sleepless_night',
    title: 'Sleepless Night',
    description: 'Your fighter tosses and turns, haunted by memories. You hear muttering in the dark.',
    category: 'camp',
    choices: [
      {
        id: 'comfort',
        text: 'Sit with them, offer comfort',
        effects: { trust: 8, stamina: -10 },
        resultText: 'You stay up talking until dawn. The bond strengthens, but rest was lost.'
      },
      {
        id: 'leave',
        text: 'Let them work through it alone',
        effects: { trust: -3 },
        resultText: 'Sometimes people need space. Whether this was the right call remains to be seen.'
      },
      {
        id: 'drink',
        text: 'Share a drink to ease the mind',
        effects: { trust: 5, hp: -5 },
        resultText: 'The drink helps, but the hangover tomorrow won\'t be pleasant.'
      }
    ]
  },
  {
    id: 'old_friend',
    title: 'An Old Friend',
    description: 'Someone from your fighter\'s past appears at the camp. Their expression is unreadable.',
    category: 'camp',
    choices: [
      {
        id: 'welcome',
        text: 'Welcome them warmly',
        effects: { trust: 5, gold: -15 },
        resultText: 'You provide food and drink. The visitor leaves with a smile and a lighter purse for you.'
      },
      {
        id: 'suspicious',
        text: 'Keep them at arm\'s length',
        effects: { trust: -2 },
        resultText: 'The visitor leaves, disappointed. Your fighter seems conflicted.'
      },
      {
        id: 'private',
        text: 'Give them privacy to talk',
        effects: { trust: 3 },
        resultText: 'Whatever was said stays between them. Your fighter seems... different after.'
      }
    ]
  },
  {
    id: 'rival_encounter',
    title: 'Rival\'s Shadow',
    description: 'Your fighter\'s rival has been seen nearby, watching your training sessions.',
    category: 'camp',
    choices: [
      {
        id: 'confront',
        text: 'Confront them directly',
        effects: { trust: 3, fame: 5 },
        resultText: 'A tense exchange of words. The crowd nearby takes notice. Good for reputation.'
      },
      {
        id: 'ignore',
        text: 'Ignore them completely',
        effects: { trust: -2 },
        resultText: 'Your fighter seems disappointed you didn\'t stand up for them.'
      },
      {
        id: 'wave',
        text: 'Wave mockingly',
        effects: { fame: 3 },
        resultText: 'A small psychological victory. The rival stalks off, fuming.'
      }
    ]
  },
  {
    id: 'injured_rest',
    title: 'The Weight of Wounds',
    description: 'Your fighter\'s injuries are clearly bothering them. They wince with every movement.',
    category: 'camp',
    requirements: { hasInjury: true },
    choices: [
      {
        id: 'force_rest',
        text: 'Insist on complete rest',
        effects: { trust: 5, injuryHeal: 1 },
        resultText: 'A day of nothing but rest and recovery. The wounds begin to close.'
      },
      {
        id: 'push_through',
        text: 'Tell them to push through',
        effects: { trust: -5, stamina: 10 },
        resultText: 'They train through the pain. Tougher, but at what cost?'
      },
      {
        id: 'healer',
        text: 'Pay for a healer visit',
        effects: { gold: -30, trust: 3, injuryHeal: 1 },
        resultText: 'Professional care makes a difference. Money well spent.'
      }
    ]
  },
  {
    id: 'crowd_recognition',
    title: 'Famous Face',
    description: 'People in the market are pointing and whispering. Your fighter has been recognized.',
    category: 'camp',
    requirements: { minWeek: 3 },
    choices: [
      {
        id: 'acknowledge',
        text: 'Wave to the crowd',
        effects: { fame: 8, trust: 2 },
        resultText: 'The crowd cheers! Your fighter beams with pride.'
      },
      {
        id: 'humble',
        text: 'Stay humble, keep walking',
        effects: { trust: 5 },
        resultText: 'A quiet moment of recognition. Character matters more than fame.'
      },
      {
        id: 'showoff',
        text: 'Put on a show',
        effects: { fame: 15, stamina: -15, trust: -3 },
        resultText: 'A dazzling display! But the exertion takes its toll, and your fighter seems annoyed.'
      }
    ]
  },
  {
    id: 'nightmare',
    title: 'Dark Dreams',
    description: 'Your fighter wakes screaming from a nightmare about dying in the arena.',
    category: 'camp',
    choices: [
      {
        id: 'promise',
        text: '"I won\'t let that happen."',
        effects: { trust: 10 },
        resultText: 'Your words carry weight. The promise hangs in the air between you.'
      },
      {
        id: 'realistic',
        text: '"It\'s a real risk. We both know that."',
        effects: { trust: 2 },
        resultText: 'Honesty is respected, if not comforting.'
      },
      {
        id: 'dismiss',
        text: '"Just a dream. Go back to sleep."',
        effects: { trust: -5 },
        resultText: 'Your fighter rolls over, alone with their fears.'
      }
    ]
  },
  
  // Risky offer vignettes
  {
    id: 'shady_surgeon',
    title: 'The Surgeon\'s Offer',
    description: 'A hooded figure approaches with a leather bag of tools. "I can fix those injuries... permanently. For a price."',
    category: 'offer',
    requirements: { hasInjury: true },
    choices: [
      {
        id: 'accept',
        text: 'Accept the surgery',
        effects: { gold: -50, injuryHeal: 3, injury: 'minor', trust: -5 },
        resultText: 'The surgery is painful and the methods questionable, but the wounds heal faster. Something feels... different.'
      },
      {
        id: 'refuse',
        text: 'Refuse firmly',
        effects: { trust: 5 },
        resultText: 'Your fighter relaxes visibly. "Thank you for not selling me to butchers."'
      },
      {
        id: 'bargain',
        text: 'Negotiate a better price',
        effects: { gold: -25, injuryHeal: 2, trust: -3 },
        resultText: 'A lesser procedure at a lesser price. The results are... acceptable.'
      }
    ]
  },
  {
    id: 'cursed_weapon',
    title: 'The Black Blade',
    description: 'A merchant offers a blade that seems to drink in the light. "Powerful. Deadly. But demanding."',
    category: 'offer',
    choices: [
      {
        id: 'accept',
        text: 'Take the blade',
        effects: { gold: -40, hp: -10, buff: 'cursed_weapon' },
        resultText: 'The blade feels wrong in the hand, but the power is undeniable.'
      },
      {
        id: 'refuse',
        text: 'Walk away',
        effects: { trust: 3 },
        resultText: '"Wise choice," your fighter murmurs. Some things aren\'t worth the cost.'
      },
      {
        id: 'examine',
        text: 'Examine it closely first',
        effects: { gold: -10 },
        resultText: 'You pay for an appraisal. The blade is powerful but cursed. Knowledge gained.'
      }
    ]
  },
  {
    id: 'sponsor_deal',
    title: 'The Sponsor',
    description: 'A wealthy patron offers gold in exchange for... loyalty. Their smile doesn\'t reach their eyes.',
    category: 'offer',
    requirements: { minWeek: 2 },
    choices: [
      {
        id: 'accept',
        text: 'Accept the sponsorship',
        effects: { gold: 100, reputation: -5, trust: -10 },
        resultText: 'The gold flows freely, but strings are attached. Your fighter looks at you differently now.'
      },
      {
        id: 'refuse',
        text: 'Decline politely',
        effects: { trust: 8 },
        resultText: '"We don\'t need their kind," your fighter says with relief.'
      },
      {
        id: 'negotiate',
        text: 'Counter-offer with terms',
        effects: { gold: 50, reputation: -2, trust: -3 },
        resultText: 'A compromise is reached. Less gold, fewer strings.'
      }
    ]
  },
  {
    id: 'poison_offer',
    title: 'Unfair Advantage',
    description: 'A quiet voice in the dark offers a vial. "Coat your blade. They\'ll never know."',
    category: 'offer',
    choices: [
      {
        id: 'accept',
        text: 'Take the poison',
        effects: { gold: -30, trust: -15, buff: 'poison_blade' },
        resultText: 'Your fighter\'s face hardens. Honor is a luxury, after all.'
      },
      {
        id: 'refuse_loudly',
        text: 'Refuse and report them',
        effects: { trust: 10, fame: 5 },
        resultText: 'Word spreads of your honor. Your fighter stands taller.'
      },
      {
        id: 'refuse_quietly',
        text: 'Just say no',
        effects: { trust: 5 },
        resultText: 'The figure melts into shadows. Some offers are better forgotten.'
      }
    ]
  },
  
  // Letter vignettes
  {
    id: 'letter_home',
    title: 'A Letter Home',
    description: 'Your fighter sits with quill and parchment, struggling to find words.',
    category: 'letter',
    choices: [
      {
        id: 'help',
        text: 'Help them write',
        effects: { trust: 8 },
        resultText: 'Together you craft a message of hope and determination. The letter is finished.'
      },
      {
        id: 'private',
        text: 'Give them privacy',
        effects: { trust: 3 },
        resultText: 'Some words are too personal to share. The letter is sealed in silence.'
      },
      {
        id: 'discourage',
        text: 'Suggest they focus on training instead',
        effects: { trust: -8, stamina: 10 },
        resultText: 'The parchment is put away. Your fighter trains harder, but something is lost.'
      }
    ]
  },
  {
    id: 'letter_response',
    title: 'News From Home',
    description: 'A letter arrives for your fighter. Their hands tremble as they read.',
    category: 'letter',
    choices: [
      {
        id: 'ask',
        text: 'Ask what it says',
        effects: { trust: 5 },
        resultText: 'They share the news. Family is well. A weight lifts from their shoulders.'
      },
      {
        id: 'space',
        text: 'Give them time alone',
        effects: { trust: 3 },
        resultText: 'When they emerge, their eyes are red but their resolve is firm.'
      },
      {
        id: 'practical',
        text: 'Remind them we have work to do',
        effects: { trust: -5 },
        resultText: 'The letter is folded away. Duty calls, but at what cost?'
      }
    ]
  },
  {
    id: 'write_legacy',
    title: 'Words for the Future',
    description: 'Your fighter wants to write something to be read if they don\'t survive.',
    category: 'letter',
    choices: [
      {
        id: 'support',
        text: 'Help them prepare this',
        effects: { trust: 12 },
        resultText: 'A sobering task, but important. The letter is sealed and stored safely.'
      },
      {
        id: 'optimistic',
        text: '"You\'ll deliver it yourself."',
        effects: { trust: 5 },
        resultText: 'Your confidence is infectious. They smile, but keep writing anyway.'
      },
      {
        id: 'avoid',
        text: 'Change the subject',
        effects: { trust: -3 },
        resultText: 'The topic is dropped, but the unwritten words hang between you.'
      }
    ]
  },
  
  // Random events
  {
    id: 'stray_dog',
    title: 'The Stray',
    description: 'A scrawny dog has been following your fighter around camp.',
    category: 'event',
    choices: [
      {
        id: 'adopt',
        text: 'Keep the dog',
        effects: { trust: 8, gold: -10 },
        resultText: 'Your fighter names it immediately. Loyalty comes in many forms.'
      },
      {
        id: 'feed',
        text: 'Feed it and send it away',
        effects: { trust: 2, gold: -5 },
        resultText: 'A small kindness. The dog looks back once before leaving.'
      },
      {
        id: 'ignore',
        text: 'Ignore it',
        effects: { trust: -2 },
        resultText: 'The dog eventually leaves. Your fighter watches it go with sad eyes.'
      }
    ]
  },
  {
    id: 'gambler',
    title: 'Double or Nothing',
    description: 'Your fighter found a dice game in the back alleys.',
    category: 'event',
    requirements: { minTrust: 30 },
    choices: [
      {
        id: 'allow',
        text: 'Let them gamble',
        effects: { gold: 30, trust: 5 },
        resultText: 'Lady luck smiles! Your fighter returns with a grin and coin.'
      },
      {
        id: 'forbid',
        text: 'Forbid it',
        effects: { trust: -8 },
        resultText: 'They obey, but resentment simmers. You\'re not their parent.'
      },
      {
        id: 'join',
        text: 'Join the game',
        effects: { gold: -20, trust: 10 },
        resultText: 'You lose some coin but gain a memory. Worth every copper.'
      }
    ]
  },
  {
    id: 'arena_tour',
    title: 'Sacred Ground',
    description: 'An opportunity to visit the Grand Arena at night, when it\'s empty.',
    category: 'event',
    choices: [
      {
        id: 'go',
        text: 'Go together',
        effects: { trust: 10, fame: 3 },
        resultText: 'Standing on the sand, imagining the crowds. A moment of shared dreams.'
      },
      {
        id: 'train',
        text: 'Use the time to train instead',
        effects: { stamina: 15, trust: -2 },
        resultText: 'Practical, but something magical is missed.'
      },
      {
        id: 'alone',
        text: 'Send them alone',
        effects: { trust: 5 },
        resultText: 'Some experiences are personal. They return with fire in their eyes.'
      }
    ]
  },
  {
    id: 'bad_food',
    title: 'Spoiled Supplies',
    description: 'Your food stores have gone bad. Someone needs to deal with this.',
    category: 'event',
    choices: [
      {
        id: 'buy_new',
        text: 'Buy fresh supplies',
        effects: { gold: -25, trust: 3 },
        resultText: 'New supplies secured. Your fighter appreciates proper meals.'
      },
      {
        id: 'make_do',
        text: 'Make do with what\'s edible',
        effects: { hp: -10, trust: -3 },
        resultText: 'A rough few days. Stomachs suffer, but coin is saved.'
      },
      {
        id: 'hunt',
        text: 'Go hunting for fresh meat',
        effects: { stamina: -10, trust: 5 },
        resultText: 'A successful hunt! Fresh meat and bonding time.'
      }
    ]
  },
  {
    id: 'festival',
    title: 'Festival Night',
    description: 'The town is celebrating. Music and laughter fill the streets.',
    category: 'event',
    choices: [
      {
        id: 'celebrate',
        text: 'Join the celebration',
        effects: { gold: -15, trust: 8, stamina: -10 },
        resultText: 'A night of joy and revelry. Some things matter more than training.'
      },
      {
        id: 'observe',
        text: 'Watch from the edge',
        effects: { trust: 3 },
        resultText: 'You share quiet observations about the crowd. A different kind of bonding.'
      },
      {
        id: 'train',
        text: 'Use the empty training grounds',
        effects: { stamina: 15, trust: -5 },
        resultText: 'Productive, but your fighter keeps glancing toward the music.'
      }
    ]
  }
];

// Last words data
export const LAST_WORDS_DATA: string[] = [
  "Tell them... I tried.",
  "Don't sell my keepsake...",
  "Run... while you can...",
  "It was... worth it...",
  "Remember my name...",
  "The crowd... they loved me...",
  "One more fight... I could have...",
  "My keepsake... keep it safe...",
  "Honor... above all...",
  "No regrets...",
  "Tell them I fought well...",
  "Don't let them forget...",
  "The arena... was home...",
  "Bury me... in the sand...",
  "I chose this...",
  "Win for me...",
  "Avenge... if you can...",
  "Mother...",
  "The light... it's fading...",
  "I'm not afraid..."
];

// Promise data
export const PROMISES_DATA = [
  {
    id: 'survival',
    name: 'I\'ll get you out alive',
    description: 'Promise to prioritize survival. Earlier and cheaper retirement options.',
    effect: '-30% retirement cost, available after 3 wins',
    mechanicBonus: { retirementDiscount: 0.3, earlyRetirement: true }
  },
  {
    id: 'glory',
    name: 'We\'ll win the belt',
    description: 'Promise to fight for the championship. Greater rewards, harder path.',
    effect: '+20% gold/fame rewards, +10% enemy stats',
    mechanicBonus: { rewardBonus: 0.2, enemyStatBonus: 0.1 }
  },
  {
    id: 'honor',
    name: 'We fight with honor',
    description: 'Promise to fight fairly. Crowd loves you, fewer shady opportunities.',
    effect: '+30% crowd hype gain, no shady offers',
    mechanicBonus: { hypeBonus: 0.3, noShadyOffers: true }
  },
  {
    id: 'vengeance',
    name: 'We\'ll make them pay',
    description: 'Promise to defeat every rival. Bonus damage to rivals, they seek you out.',
    effect: '+25% damage to rivals, rivals appear more often',
    mechanicBonus: { rivalDamageBonus: 0.25, rivalFrequency: 2 }
  },
  {
    id: 'legacy',
    name: 'Your name will echo forever',
    description: 'Promise to build a legend. Extra bloodline points, more fame.',
    effect: '+50% fame gain, +1 bloodline point per league advanced',
    mechanicBonus: { fameBonus: 0.5, bloodlineBonus: 1 }
  }
];
