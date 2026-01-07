/**
 * RelicsData - Run-persistent powerful items (Brotato-style)
 */

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: RelicRarity;
  icon: string;
  
  // Visual effect in combat
  auraColor: string;
  particleType: 'sparkle' | 'flame' | 'shadow' | 'holy' | 'blood' | 'none';
  
  // Effects
  statModifiers?: Record<string, number>;
  passiveEffect?: string;
  triggerEffect?: RelicTrigger;
  
  // Flavor
  lore: string;
}

export interface RelicTrigger {
  condition: 'on_hit' | 'on_crit' | 'on_kill' | 'on_parry' | 'on_low_hp' | 
             'on_turn_start' | 'on_fight_start' | 'on_dodge';
  effect: string;
  value: number;
  chance?: number;  // 0-1, defaults to 1
}

export const RELICS_DATA: Relic[] = [
  // Common Relics
  {
    id: 'iron_ring',
    name: 'Iron Ring',
    description: '+5 Defense',
    rarity: 'common',
    icon: '💍',
    auraColor: '#808080',
    particleType: 'none',
    statModifiers: { defense: 5 },
    lore: 'Simple iron, but reassuring.'
  },
  {
    id: 'fighters_tooth',
    name: 'Fighter\'s Tooth',
    description: '+3 Attack',
    rarity: 'common',
    icon: '🦷',
    auraColor: '#f5f5dc',
    particleType: 'none',
    statModifiers: { attack: 3 },
    lore: 'A trophy from your first kill.'
  },
  {
    id: 'worn_boots',
    name: 'Worn Boots',
    description: '+2 Speed, +5 Evasion',
    rarity: 'common',
    icon: '👢',
    auraColor: '#8b4513',
    particleType: 'none',
    statModifiers: { speed: 2, evasion: 5 },
    lore: 'Comfortable and broken in.'
  },
  {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    description: '+10% Gold rewards',
    rarity: 'common',
    icon: '🪙',
    auraColor: '#ffd700',
    particleType: 'sparkle',
    passiveEffect: 'gold_bonus_10',
    lore: 'Tails you win.'
  },
  {
    id: 'bandolier',
    name: 'Bandolier',
    description: '+1 Item slot, items 10% more effective',
    rarity: 'common',
    icon: '🎒',
    auraColor: '#654321',
    particleType: 'none',
    passiveEffect: 'extra_item_slot',
    lore: 'Room for more tricks.'
  },
  {
    id: 'crowd_favor',
    name: 'Crowd\'s Favor',
    description: '+15% Hype gain',
    rarity: 'common',
    icon: '📣',
    auraColor: '#ffa500',
    particleType: 'sparkle',
    passiveEffect: 'hype_bonus_15',
    lore: 'They love you. For now.'
  },
  
  // Uncommon Relics
  {
    id: 'blood_amulet',
    name: 'Blood Amulet',
    description: 'Heal 5 HP on kill',
    rarity: 'uncommon',
    icon: '📿',
    auraColor: '#8b0000',
    particleType: 'blood',
    triggerEffect: {
      condition: 'on_kill',
      effect: 'heal',
      value: 5
    },
    lore: 'Drinks deep from the dying.'
  },
  {
    id: 'berserker_band',
    name: 'Berserker Band',
    description: '+20% damage when below 50% HP',
    rarity: 'uncommon',
    icon: '🔴',
    auraColor: '#ff4500',
    particleType: 'flame',
    triggerEffect: {
      condition: 'on_low_hp',
      effect: 'damage_boost',
      value: 20
    },
    lore: 'Pain is just weakness leaving.'
  },
  {
    id: 'focused_lens',
    name: 'Focused Lens',
    description: '+10 Accuracy, +5% Crit Chance',
    rarity: 'uncommon',
    icon: '🔍',
    auraColor: '#87ceeb',
    particleType: 'sparkle',
    statModifiers: { accuracy: 10, critChance: 5 },
    lore: 'See the gaps in their defense.'
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: '+15 Evasion, 20% chance to dodge on turn start',
    rarity: 'uncommon',
    icon: '🧥',
    auraColor: '#2f2f4f',
    particleType: 'shadow',
    statModifiers: { evasion: 15 },
    triggerEffect: {
      condition: 'on_turn_start',
      effect: 'auto_dodge',
      value: 1,
      chance: 0.2
    },
    lore: 'Become one with darkness.'
  },
  {
    id: 'wrath_stone',
    name: 'Wrath Stone',
    description: 'Gain +2 Focus per hit taken',
    rarity: 'uncommon',
    icon: '💎',
    auraColor: '#9932cc',
    particleType: 'sparkle',
    passiveEffect: 'focus_on_hit',
    lore: 'Channel your rage.'
  },
  {
    id: 'healers_charm',
    name: 'Healer\'s Charm',
    description: 'All healing +30%',
    rarity: 'uncommon',
    icon: '💚',
    auraColor: '#32cd32',
    particleType: 'holy',
    passiveEffect: 'healing_boost_30',
    lore: 'Blessed by temple healers.'
  },
  {
    id: 'warriors_belt',
    name: 'Warrior\'s Belt',
    description: '+20 Max Stamina, Stamina regen +20%',
    rarity: 'uncommon',
    icon: '🥋',
    auraColor: '#8b4513',
    particleType: 'none',
    statModifiers: { maxStamina: 20 },
    passiveEffect: 'stamina_regen_20',
    lore: 'Hold everything together.'
  },
  
  // Rare Relics
  {
    id: 'champions_medal',
    name: 'Champion\'s Medal',
    description: '+5 to all stats',
    rarity: 'rare',
    icon: '🏅',
    auraColor: '#ffd700',
    particleType: 'sparkle',
    statModifiers: { 
      attack: 5, defense: 5, speed: 5, accuracy: 5, 
      evasion: 5, maxHP: 10, maxStamina: 10 
    },
    lore: 'Earned by a true champion.'
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    description: 'Survive fatal blow once per fight with 20% HP',
    rarity: 'rare',
    icon: '🪶',
    auraColor: '#ff6347',
    particleType: 'flame',
    triggerEffect: {
      condition: 'on_low_hp',
      effect: 'death_save',
      value: 20
    },
    lore: 'Rise from the ashes.'
  },
  {
    id: 'vampiric_blade',
    name: 'Vampiric Essence',
    description: 'Heal 10% of damage dealt',
    rarity: 'rare',
    icon: '🩸',
    auraColor: '#8b0000',
    particleType: 'blood',
    triggerEffect: {
      condition: 'on_hit',
      effect: 'lifesteal',
      value: 10
    },
    lore: 'Your wounds feed on theirs.'
  },
  {
    id: 'executioners_eye',
    name: 'Executioner\'s Eye',
    description: '+50% damage to enemies below 30% HP',
    rarity: 'rare',
    icon: '👁️',
    auraColor: '#4b0082',
    particleType: 'shadow',
    triggerEffect: {
      condition: 'on_hit',
      effect: 'execute_bonus',
      value: 50
    },
    lore: 'See the moment of death.'
  },
  {
    id: 'mirror_shield',
    name: 'Mirror Shield',
    description: 'Perfect parries deal 150% counter damage',
    rarity: 'rare',
    icon: '🪞',
    auraColor: '#c0c0c0',
    particleType: 'sparkle',
    triggerEffect: {
      condition: 'on_parry',
      effect: 'counter_boost',
      value: 150
    },
    lore: 'Return their violence twofold.'
  },
  {
    id: 'crowd_roar',
    name: 'Crowd\'s Roar',
    description: 'At 80+ Hype, +30% damage and heal 5 HP per turn',
    rarity: 'rare',
    icon: '🎭',
    auraColor: '#ffd700',
    particleType: 'sparkle',
    passiveEffect: 'crowd_power',
    lore: 'Their cheers fuel your strength.'
  },
  {
    id: 'storm_caller',
    name: 'Storm Caller',
    description: 'Critical hits chain to deal 30% damage to all',
    rarity: 'rare',
    icon: '⚡',
    auraColor: '#1e90ff',
    particleType: 'sparkle',
    triggerEffect: {
      condition: 'on_crit',
      effect: 'chain_lightning',
      value: 30
    },
    lore: 'Call down the thunder.'
  },
  
  // Legendary Relics
  {
    id: 'crown_of_blood',
    name: 'Crown of Blood',
    description: 'Killing an enemy fully heals you and grants +5 permanent HP',
    rarity: 'legendary',
    icon: '👑',
    auraColor: '#8b0000',
    particleType: 'blood',
    triggerEffect: {
      condition: 'on_kill',
      effect: 'full_heal_plus',
      value: 5
    },
    lore: 'The arena throne, paid in blood.'
  },
  {
    id: 'gods_hand',
    name: 'God\'s Hand',
    description: 'Start every fight with full Focus. Special costs no Focus.',
    rarity: 'legendary',
    icon: '✋',
    auraColor: '#ffd700',
    particleType: 'holy',
    passiveEffect: 'unlimited_special',
    lore: 'Touched by the divine.'
  },
  {
    id: 'shadow_twin',
    name: 'Shadow Twin',
    description: '25% chance for attacks to hit twice',
    rarity: 'legendary',
    icon: '👥',
    auraColor: '#2f2f4f',
    particleType: 'shadow',
    triggerEffect: {
      condition: 'on_hit',
      effect: 'double_strike',
      value: 25,
      chance: 0.25
    },
    lore: 'Your shadow fights beside you.'
  },
  {
    id: 'immortal_will',
    name: 'Immortal Will',
    description: 'Cannot die while you have Stamina. Damage drains Stamina instead.',
    rarity: 'legendary',
    icon: '💀',
    auraColor: '#4b0082',
    particleType: 'shadow',
    passiveEffect: 'stamina_as_hp',
    lore: 'Death cannot claim the determined.'
  },
  {
    id: 'arena_heart',
    name: 'Heart of the Arena',
    description: 'Crowd Hype starts at 100 and never decreases. +50% all rewards.',
    rarity: 'legendary',
    icon: '❤️‍🔥',
    auraColor: '#ff4500',
    particleType: 'flame',
    passiveEffect: 'permanent_hype',
    lore: 'The arena itself fights for you.'
  }
];

// Relic pool by rarity
export const RELIC_POOLS: Record<RelicRarity, string[]> = {
  common: RELICS_DATA.filter(r => r.rarity === 'common').map(r => r.id),
  uncommon: RELICS_DATA.filter(r => r.rarity === 'uncommon').map(r => r.id),
  rare: RELICS_DATA.filter(r => r.rarity === 'rare').map(r => r.id),
  legendary: RELICS_DATA.filter(r => r.rarity === 'legendary').map(r => r.id)
};

// Rarity weights (pity system can modify these)
export const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 35,
  rare: 12,
  legendary: 3
};

/**
 * Roll for relic rarity
 */
export function rollRelicRarity(pityCounter: number = 0): RelicRarity {
  // Pity increases rare/legendary chances
  const weights = { ...RARITY_WEIGHTS };
  weights.legendary += Math.floor(pityCounter / 3);
  weights.rare += Math.floor(pityCounter / 2);
  
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return rarity as RelicRarity;
  }
  
  return 'common';
}

/**
 * Get random relics for selection
 */
export function getRelicChoices(count: number = 3, excludeIds: string[] = []): Relic[] {
  const available = RELICS_DATA.filter(r => !excludeIds.includes(r.id));
  const choices: Relic[] = [];
  
  for (let i = 0; i < count && available.length > 0; i++) {
    const rarity = rollRelicRarity();
    const pool = available.filter(r => r.rarity === rarity);
    
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      choices.push(pool[idx]);
      const mainIdx = available.findIndex(r => r.id === pool[idx].id);
      available.splice(mainIdx, 1);
    } else {
      // Fallback to any rarity
      const idx = Math.floor(Math.random() * available.length);
      choices.push(available[idx]);
      available.splice(idx, 1);
    }
  }
  
  return choices;
}

/**
 * Get relic by ID
 */
export function getRelicById(id: string): Relic | undefined {
  return RELICS_DATA.find(r => r.id === id);
}
