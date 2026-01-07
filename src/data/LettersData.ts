/**
 * LettersData - Redesigned letter system with real value
 * Letters are now a GREAT choice with unique upsides and fair risk/reward
 */

export type LetterType = 
  | 'home' 
  | 'patron' 
  | 'rival' 
  | 'chaplain' 
  | 'future_self';

export interface LetterTemplate {
  id: string;
  type: LetterType;
  name: string;
  icon: string;
  description: string;
  recipient: string;
  
  // Effects
  guaranteedEffects: LetterEffect[];
  positiveChance: number;  // 0-1
  positiveEffect: LetterEffect;
  negativeChance: number;  // 0-1
  negativeEffect: LetterEffect;
  
  // Generated letter content
  letterSnippets: string[];
  closingLines: string[];
  
  // Unlock rewards (for writing X letters of this type)
  milestoneRewards: LetterMilestone[];
}

export interface LetterEffect {
  type: 'trust' | 'gold' | 'hp' | 'stamina' | 'focus' | 'resolve' | 'hype' | 
        'injury_heal' | 'status_cure' | 'buff' | 'debt' | 'enemy_debuff' | 
        'letter_stamp' | 'keepsake_upgrade' | 'ability_unlock';
  value: number;
  description: string;
  duration?: number;  // Fights the effect lasts
}

export interface LetterMilestone {
  count: number;  // Letters of this type written
  reward: {
    type: 'keepsake_upgrade' | 'ability' | 'cosmetic' | 'perk_point' | 'archetype_hint';
    id: string;
    name: string;
    description: string;
  };
}

export interface WrittenLetter {
  id: string;
  type: LetterType;
  templateId: string;
  content: string;
  fighterName: string;
  fighterId: string;
  weekWritten: number;
  wasRead: boolean;  // For memorial
  effects: LetterEffect[];
  timestamp: number;
}

export const LETTER_TYPES: LetterTemplate[] = [
  // Letter Home - Comfort and Resolve
  {
    id: 'letter_home',
    type: 'home',
    name: 'Letter Home',
    icon: '🏠',
    description: 'Write to family or loved ones. Brings comfort and strengthens resolve.',
    recipient: 'your family',
    
    guaranteedEffects: [
      { type: 'trust', value: 10, description: '+10 Trust' },
      { type: 'resolve', value: 15, description: '+15 Resolve (reduces fear effects)' },
      { type: 'letter_stamp', value: 1, description: '+1 Letter Stamp' }
    ],
    
    positiveChance: 0.4,
    positiveEffect: { 
      type: 'hp', 
      value: 15, 
      description: 'The act of writing brings peace. +15 HP' 
    },
    
    negativeChance: 0.1,
    negativeEffect: { 
      type: 'trust', 
      value: -5, 
      description: 'Memories bring sadness. -5 Trust' 
    },
    
    letterSnippets: [
      'I hope this letter finds you well. The arena is harsh, but I think of you often.',
      'The crowd cheers, but it\'s your faces I see when I fight.',
      'They call me {nickname} now. I wonder if you\'d recognize me.',
      'I\'ve made friends here. And enemies. But I survive.',
      'The gold I\'ve sent should help with the farm. There will be more.',
      'I dream of home. Of the smell of bread. Of peace.',
      'Tell the children I\'m fighting for their future.',
      'I\'ve seen death here. It makes me appreciate life more.'
    ],
    closingLines: [
      'With love, {name}',
      'Until we meet again, {name}',
      'Your devoted {name}',
      'Forever yours, {name}'
    ],
    
    milestoneRewards: [
      {
        count: 3,
        reward: {
          type: 'ability',
          id: 'rally_cry',
          name: 'Rally Cry',
          description: 'Once per fight, read your letter to gain +20 Focus instantly'
        }
      },
      {
        count: 7,
        reward: {
          type: 'keepsake_upgrade',
          id: 'family_blessing',
          name: 'Family Blessing',
          description: 'Your keepsake now also grants +5% HP regeneration between fights'
        }
      },
      {
        count: 12,
        reward: {
          type: 'cosmetic',
          id: 'home_banner',
          name: 'Home Banner',
          description: 'A banner with your family crest flies in the arena'
        }
      }
    ]
  },
  
  // Letter to Patron - Money and Favors
  {
    id: 'letter_patron',
    type: 'patron',
    name: 'Letter to a Patron',
    icon: '💰',
    description: 'Request support from a wealthy sponsor. Risky but lucrative.',
    recipient: 'a wealthy patron',
    
    guaranteedEffects: [
      { type: 'gold', value: 30, description: '+30 Gold immediately' },
      { type: 'letter_stamp', value: 1, description: '+1 Letter Stamp' }
    ],
    
    positiveChance: 0.5,
    positiveEffect: { 
      type: 'gold', 
      value: 50, 
      description: 'Your patron sends extra! +50 Gold' 
    },
    
    negativeChance: 0.25,
    negativeEffect: { 
      type: 'debt', 
      value: 40, 
      description: 'You now owe them. Debt: 40 gold from next 2 victories' 
    },
    
    letterSnippets: [
      'Honorable Patron, your investment in me has not been misplaced.',
      'I write seeking your continued support in the arena.',
      'My victories bring glory to your name as well as mine.',
      'The crowds chant {nickname}. Soon they\'ll know who backs me.',
      'With better equipment, I could win you greater fame.',
      'I\'ve proven my worth. Now I ask for your faith.',
      'My enemies grow stronger. I need stronger steel to match.',
      'Every coin you invest returns tenfold in glory.'
    ],
    closingLines: [
      'Your humble servant, {name}',
      'In your debt, {name}',
      'Gratefully, {name}',
      'Your champion, {name}'
    ],
    
    milestoneRewards: [
      {
        count: 3,
        reward: {
          type: 'perk_point',
          id: 'patron_connection',
          name: 'Patron Connection',
          description: '+1 Bloodline Point and permanent 5% shop discount'
        }
      },
      {
        count: 7,
        reward: {
          type: 'ability',
          id: 'emergency_funds',
          name: 'Emergency Funds',
          description: 'Once per run, receive 100 gold in desperate times'
        }
      },
      {
        count: 12,
        reward: {
          type: 'cosmetic',
          id: 'patron_sigil',
          name: 'Patron\'s Sigil',
          description: 'A golden sigil marks your equipment'
        }
      }
    ]
  },
  
  // Letter to Rival - Mind Games
  {
    id: 'letter_rival',
    type: 'rival',
    name: 'Letter to a Rival',
    icon: '⚔️',
    description: 'Taunt your rival or attempt diplomacy. High risk, high reward.',
    recipient: 'your rival',
    
    guaranteedEffects: [
      { type: 'hype', value: 10, description: '+10 Crowd Hype (carries to next fight)' },
      { type: 'letter_stamp', value: 1, description: '+1 Letter Stamp' }
    ],
    
    positiveChance: 0.45,
    positiveEffect: { 
      type: 'enemy_debuff', 
      value: 15, 
      description: 'Your rival is rattled! -15% accuracy next encounter' 
    },
    
    negativeChance: 0.3,
    negativeEffect: { 
      type: 'buff', 
      value: -1, 
      description: 'They use your words against you. Rival gains +10% damage next fight' 
    },
    
    letterSnippets: [
      'I know you\'re watching. Good. Watch me win.',
      'We both know how this ends. In blood. Probably yours.',
      'Perhaps we are not so different, you and I.',
      'Your technique is good. But mine is better.',
      'I\'ve studied your fights. I see your weaknesses.',
      'The crowd will cheer when we finally meet.',
      'May the better fighter win. That would be me.',
      'You think you\'re special? I\'ve beaten better.'
    ],
    closingLines: [
      'See you in the sand, {name}',
      'Until we dance, {name}',
      'Your future conqueror, {name}',
      'With grudging respect, {name}'
    ],
    
    milestoneRewards: [
      {
        count: 3,
        reward: {
          type: 'ability',
          id: 'psychological_warfare',
          name: 'Psychological Warfare',
          description: 'Start fights against rivals with +15 Focus'
        }
      },
      {
        count: 7,
        reward: {
          type: 'perk_point',
          id: 'rival_hunter',
          name: 'Rival Hunter',
          description: '+25% gold and fame from defeating rivals'
        }
      },
      {
        count: 12,
        reward: {
          type: 'archetype_hint',
          id: 'duelist_unlock',
          name: 'Duelist\'s Path',
          description: 'Progress toward unlocking the Street Duelist archetype'
        }
      }
    ]
  },
  
  // Letter to Chaplain - Healing and Protection
  {
    id: 'letter_chaplain',
    type: 'chaplain',
    name: 'Letter to the Chaplain',
    icon: '✝️',
    description: 'Seek spiritual guidance and healing. Pure benefits but costly.',
    recipient: 'the arena chaplain',
    
    guaranteedEffects: [
      { type: 'hp', value: 20, description: '+20 HP healing' },
      { type: 'status_cure', value: 1, description: 'Cure Fear and Concussion' },
      { type: 'letter_stamp', value: 1, description: '+1 Letter Stamp' }
    ],
    
    positiveChance: 0.35,
    positiveEffect: { 
      type: 'injury_heal', 
      value: 1, 
      description: 'Blessed recovery! Heal 1 injury week' 
    },
    
    negativeChance: 0.2,
    negativeEffect: { 
      type: 'gold', 
      value: -25, 
      description: 'The chaplain requests a donation. -25 Gold' 
    },
    
    letterSnippets: [
      'Father, I seek your blessing before my next trial.',
      'I confess my sins and ask for absolution.',
      'The arena tests my faith. Help me stay true.',
      'I\'ve done terrible things. Can I still be forgiven?',
      'Pray for me, Father. The enemy is strong.',
      'I fight not for glory, but for those I love.',
      'Grant me your blessing, that I might survive.',
      'In this world of blood, I seek something pure.'
    ],
    closingLines: [
      'In faith, {name}',
      'Your humble penitent, {name}',
      'Seeking grace, {name}',
      'Bless me, {name}'
    ],
    
    milestoneRewards: [
      {
        count: 3,
        reward: {
          type: 'ability',
          id: 'divine_protection',
          name: 'Divine Protection',
          description: 'Once per fight, survive a killing blow with 1 HP'
        }
      },
      {
        count: 7,
        reward: {
          type: 'keepsake_upgrade',
          id: 'blessed_keepsake',
          name: 'Blessed Keepsake',
          description: 'Your keepsake now reduces injury severity by one tier'
        }
      },
      {
        count: 12,
        reward: {
          type: 'cosmetic',
          id: 'holy_symbol',
          name: 'Holy Symbol',
          description: 'A blessed symbol adorns your equipment'
        }
      }
    ]
  },
  
  // Letter to Future Self - Legacy Bonus
  {
    id: 'letter_future',
    type: 'future_self',
    name: 'Letter to Your Future Self',
    icon: '📜',
    description: 'Write wisdom for the next generation. Boosts legacy rewards.',
    recipient: 'your future self',
    
    guaranteedEffects: [
      { type: 'trust', value: 5, description: '+5 Trust (self-reflection)' },
      { type: 'letter_stamp', value: 2, description: '+2 Letter Stamps' }
    ],
    
    positiveChance: 0.6,
    positiveEffect: { 
      type: 'buff', 
      value: 1, 
      description: 'Clarity of purpose! +10% all rewards next fight' 
    },
    
    negativeChance: 0.05,
    negativeEffect: { 
      type: 'focus', 
      value: -10, 
      description: 'Dark thoughts intrude. -10 starting Focus next fight' 
    },
    
    letterSnippets: [
      'If you\'re reading this, I\'m gone. Learn from my mistakes.',
      'Remember: defense wins fights, offense wins crowds.',
      'Trust your instincts. They\'ve kept you alive this long.',
      'The rival to fear is the one you underestimate.',
      'Your keepsake is more than metal. It\'s who you are.',
      'Win or lose, fight with honor. That\'s what matters.',
      'I\'ve learned that trust is earned in blood, not words.',
      'The arena takes everything. Give it nothing but your best.'
    ],
    closingLines: [
      'From the past, {name}',
      'Learn and survive, {name}',
      'Your former self, {name}',
      'Remember me, {name}'
    ],
    
    milestoneRewards: [
      {
        count: 3,
        reward: {
          type: 'perk_point',
          id: 'legacy_wisdom',
          name: 'Legacy Wisdom',
          description: '+1 Bloodline Point and new recruits start with +5 in a random stat'
        }
      },
      {
        count: 7,
        reward: {
          type: 'ability',
          id: 'ghost_guidance',
          name: 'Ghost Guidance',
          description: 'Fallen fighters may appear as ghosts to give combat hints'
        }
      },
      {
        count: 12,
        reward: {
          type: 'cosmetic',
          id: 'memorial_wings',
          name: 'Memorial Wings',
          description: 'Spectral wings appear on your memorial portrait'
        }
      }
    ]
  }
];

// Letter stamp rewards (meta currency)
export interface StampReward {
  cost: number;
  reward: {
    type: 'cosmetic' | 'perk' | 'archetype_progress' | 'starting_bonus';
    id: string;
    name: string;
    description: string;
  };
}

export const STAMP_REWARDS: StampReward[] = [
  {
    cost: 5,
    reward: {
      type: 'cosmetic',
      id: 'wax_seal_red',
      name: 'Red Wax Seal',
      description: 'A crimson seal adorns your letters'
    }
  },
  {
    cost: 10,
    reward: {
      type: 'perk',
      id: 'quick_writer',
      name: 'Quick Writer',
      description: 'Writing letters no longer costs a camp action'
    }
  },
  {
    cost: 15,
    reward: {
      type: 'cosmetic',
      id: 'wax_seal_gold',
      name: 'Gold Wax Seal',
      description: 'A golden seal marks your correspondence'
    }
  },
  {
    cost: 20,
    reward: {
      type: 'starting_bonus',
      id: 'correspondent',
      name: 'Correspondent',
      description: 'New fighters start with 1 letter already written'
    }
  },
  {
    cost: 30,
    reward: {
      type: 'perk',
      id: 'master_scribe',
      name: 'Master Scribe',
      description: 'Letters have +15% chance of positive effects'
    }
  },
  {
    cost: 50,
    reward: {
      type: 'archetype_progress',
      id: 'noble_unlock_hint',
      name: 'Noble Correspondence',
      description: 'Progress toward Disgraced Noble archetype'
    }
  }
];

/**
 * Generate letter content
 */
export function generateLetterContent(
  template: LetterTemplate,
  fighterName: string,
  nickname: string
): string {
  const snippet = template.letterSnippets[Math.floor(Math.random() * template.letterSnippets.length)];
  const closing = template.closingLines[Math.floor(Math.random() * template.closingLines.length)];
  
  return snippet
    .replace('{name}', fighterName)
    .replace('{nickname}', nickname)
    + '\n\n' 
    + closing
      .replace('{name}', fighterName);
}

/**
 * Calculate letter effects with RNG
 */
export function calculateLetterEffects(template: LetterTemplate): LetterEffect[] {
  const effects = [...template.guaranteedEffects];
  
  if (Math.random() < template.positiveChance) {
    effects.push(template.positiveEffect);
  }
  
  if (Math.random() < template.negativeChance) {
    effects.push(template.negativeEffect);
  }
  
  return effects;
}
