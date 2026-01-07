/**
 * ItemsData - Expanded items with rarities, sets, and trinkets
 */

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'trinket' | 'consumable';

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  price: number;
  sellPrice: number;
  
  // Stats
  stats?: Record<string, number>;
  effect?: string;
  effectValue?: number;
  
  // Set bonus
  setId?: string;
  
  // Consumable specific
  uses?: number;
}

export interface ItemSet {
  id: string;
  name: string;
  pieces: string[];  // Item IDs
  bonuses: SetBonus[];
}

export interface SetBonus {
  piecesRequired: number;
  effect: string;
  description: string;
}

// Expanded weapons (30+)
export const WEAPONS: GameItem[] = [
  // Common Weapons
  { id: 'rusty_sword', name: 'Rusty Sword', description: 'Dull but functional', type: 'weapon', rarity: 'common', icon: '🗡️', price: 30, sellPrice: 10, stats: { attack: 3 } },
  { id: 'wooden_club', name: 'Wooden Club', description: 'Simple bludgeon', type: 'weapon', rarity: 'common', icon: '🏏', price: 25, sellPrice: 8, stats: { attack: 4, accuracy: -5 } },
  { id: 'iron_dagger', name: 'Iron Dagger', description: 'Quick and precise', type: 'weapon', rarity: 'common', icon: '🔪', price: 35, sellPrice: 12, stats: { attack: 2, speed: 2, critChance: 3 } },
  { id: 'crude_axe', name: 'Crude Axe', description: 'Chopping power', type: 'weapon', rarity: 'common', icon: '🪓', price: 40, sellPrice: 13, stats: { attack: 5, accuracy: -3 } },
  { id: 'short_spear', name: 'Short Spear', description: 'Reach advantage', type: 'weapon', rarity: 'common', icon: '🔱', price: 38, sellPrice: 12, stats: { attack: 3, accuracy: 5 } },
  { id: 'spiked_knuckles', name: 'Spiked Knuckles', description: 'For close work', type: 'weapon', rarity: 'common', icon: '🥊', price: 32, sellPrice: 10, stats: { attack: 2, speed: 3 } },
  
  // Uncommon Weapons
  { id: 'soldiers_blade', name: 'Soldier\'s Blade', description: 'Military standard', type: 'weapon', rarity: 'uncommon', icon: '⚔️', price: 80, sellPrice: 25, stats: { attack: 6, accuracy: 5 } },
  { id: 'gladius', name: 'Gladius', description: 'Classic arena weapon', type: 'weapon', rarity: 'uncommon', icon: '🗡️', price: 85, sellPrice: 28, stats: { attack: 5, accuracy: 8, speed: 1 } },
  { id: 'war_hammer', name: 'War Hammer', description: 'Armor crusher', type: 'weapon', rarity: 'uncommon', icon: '🔨', price: 90, sellPrice: 30, stats: { attack: 8, accuracy: -5 }, effect: 'ignore_armor_20' },
  { id: 'twin_daggers', name: 'Twin Daggers', description: 'Fast and deadly', type: 'weapon', rarity: 'uncommon', icon: '🗡️', price: 95, sellPrice: 32, stats: { attack: 4, speed: 4, critChance: 8 } },
  { id: 'barbed_flail', name: 'Barbed Flail', description: 'Bleeds enemies', type: 'weapon', rarity: 'uncommon', icon: '⛓️', price: 100, sellPrice: 33, stats: { attack: 6, accuracy: -3 }, effect: 'bleed_on_hit', effectValue: 15 },
  { id: 'curved_saber', name: 'Curved Saber', description: 'Flowing strikes', type: 'weapon', rarity: 'uncommon', icon: '⚔️', price: 88, sellPrice: 29, stats: { attack: 5, speed: 3, critDamage: 10 } },
  { id: 'spiked_mace', name: 'Spiked Mace', description: 'Brutal impacts', type: 'weapon', rarity: 'uncommon', icon: '🔨', price: 92, sellPrice: 30, stats: { attack: 7, critChance: 5 }, effect: 'stun_chance', effectValue: 10 },
  
  // Rare Weapons  
  { id: 'champions_sword', name: 'Champion\'s Sword', description: 'Victory incarnate', type: 'weapon', rarity: 'rare', icon: '🗡️', price: 180, sellPrice: 60, stats: { attack: 9, accuracy: 8, critChance: 5 }, effect: 'hype_bonus', effectValue: 15 },
  { id: 'blood_drinker', name: 'Blood Drinker', description: 'Heals on crits', type: 'weapon', rarity: 'rare', icon: '🩸', price: 200, sellPrice: 66, stats: { attack: 7, critChance: 10 }, effect: 'crit_heal', effectValue: 15 },
  { id: 'executioner_axe', name: 'Executioner', description: 'Ends the weak', type: 'weapon', rarity: 'rare', icon: '🪓', price: 220, sellPrice: 73, stats: { attack: 12, accuracy: -8 }, effect: 'execute_bonus', effectValue: 40 },
  { id: 'viper_fang', name: 'Viper\'s Fang', description: 'Poisoned edge', type: 'weapon', rarity: 'rare', icon: '🐍', price: 190, sellPrice: 63, stats: { attack: 6, accuracy: 10, speed: 2 }, effect: 'poison_on_hit', effectValue: 3 },
  { id: 'thunder_maul', name: 'Thunder Maul', description: 'Shakes the earth', type: 'weapon', rarity: 'rare', icon: '⚡', price: 210, sellPrice: 70, stats: { attack: 11, accuracy: -5 }, effect: 'aoe_damage', effectValue: 20 },
  { id: 'shadow_blade', name: 'Shadow Blade', description: 'Strike unseen', type: 'weapon', rarity: 'rare', icon: '🌑', price: 195, sellPrice: 65, stats: { attack: 7, critChance: 12, critDamage: 20 }, effect: 'guaranteed_crit_from_stealth' },
  { id: 'blessed_mace', name: 'Blessed Mace', description: 'Holy weapon', type: 'weapon', rarity: 'rare', icon: '✝️', price: 185, sellPrice: 61, stats: { attack: 8, accuracy: 5 }, effect: 'bonus_vs_undead', effectValue: 50 },
  
  // Epic Weapons
  { id: 'dragonbone_blade', name: 'Dragonbone Blade', description: 'From the old world', type: 'weapon', rarity: 'epic', icon: '🐉', price: 350, sellPrice: 116, stats: { attack: 12, accuracy: 10, critChance: 8 }, effect: 'fire_damage', effectValue: 5 },
  { id: 'soul_render', name: 'Soul Render', description: 'Tears the spirit', type: 'weapon', rarity: 'epic', icon: '👻', price: 380, sellPrice: 126, stats: { attack: 11, critDamage: 40 }, effect: 'lifesteal', effectValue: 15 },
  { id: 'titans_fist', name: 'Titan\'s Fist', description: 'Giant strength', type: 'weapon', rarity: 'epic', icon: '👊', price: 400, sellPrice: 133, stats: { attack: 15, accuracy: -10, speed: -2 }, effect: 'knockback' },
  { id: 'whispering_death', name: 'Whispering Death', description: 'Silent killer', type: 'weapon', rarity: 'epic', icon: '🌫️', price: 370, sellPrice: 123, stats: { attack: 9, speed: 5, critChance: 15 }, effect: 'instant_kill_chance', effectValue: 3 },
  
  // Legendary Weapons
  { id: 'crown_slayer', name: 'Crown Slayer', description: 'King killer', type: 'weapon', rarity: 'legendary', icon: '👑', price: 600, sellPrice: 200, stats: { attack: 14, accuracy: 12, critChance: 10, critDamage: 30 }, effect: 'champion_slayer', effectValue: 75 },
  { id: 'soulreaper', name: 'Soulreaper', description: 'Steals life force', type: 'weapon', rarity: 'legendary', icon: '💀', price: 550, sellPrice: 183, stats: { attack: 12, critChance: 15 }, effect: 'kill_heal_full' },
  { id: 'worldbreaker', name: 'Worldbreaker', description: 'Legendary hammer', type: 'weapon', rarity: 'legendary', icon: '🌍', price: 650, sellPrice: 216, stats: { attack: 20, accuracy: -15 }, effect: 'guaranteed_crit_heavy' },
  { id: 'infinity_edge', name: 'Infinity Edge', description: 'No limits', type: 'weapon', rarity: 'legendary', icon: '♾️', price: 700, sellPrice: 233, stats: { attack: 10, critChance: 20, critDamage: 50 }, effect: 'crit_chain' }
];

// Expanded armor (30+)
export const ARMOR: GameItem[] = [
  // Common Armor
  { id: 'cloth_tunic', name: 'Cloth Tunic', description: 'Better than nothing', type: 'armor', rarity: 'common', icon: '👕', price: 20, sellPrice: 6, stats: { defense: 2 } },
  { id: 'leather_vest', name: 'Leather Vest', description: 'Basic protection', type: 'armor', rarity: 'common', icon: '🦺', price: 35, sellPrice: 11, stats: { defense: 4 } },
  { id: 'padded_gambeson', name: 'Padded Gambeson', description: 'Quilted armor', type: 'armor', rarity: 'common', icon: '🧥', price: 40, sellPrice: 13, stats: { defense: 5, maxHP: 5 } },
  { id: 'studded_leather', name: 'Studded Leather', description: 'Reinforced hide', type: 'armor', rarity: 'common', icon: '🦺', price: 50, sellPrice: 16, stats: { defense: 6, speed: -1 } },
  { id: 'wooden_shield', name: 'Wooden Shield', description: 'Block incoming', type: 'armor', rarity: 'common', icon: '🛡️', price: 30, sellPrice: 10, stats: { defense: 3 }, effect: 'block_bonus', effectValue: 10 },
  
  // Uncommon Armor
  { id: 'chainmail', name: 'Chainmail Shirt', description: 'Linked rings', type: 'armor', rarity: 'uncommon', icon: '⛓️', price: 100, sellPrice: 33, stats: { defense: 9, speed: -2, maxHP: 5 } },
  { id: 'gladiator_harness', name: 'Gladiator Harness', description: 'Arena style', type: 'armor', rarity: 'uncommon', icon: '🎭', price: 110, sellPrice: 36, stats: { defense: 7, maxHP: 15 }, effect: 'hype_bonus', effectValue: 10 },
  { id: 'scale_mail', name: 'Scale Mail', description: 'Overlapping scales', type: 'armor', rarity: 'uncommon', icon: '🐟', price: 120, sellPrice: 40, stats: { defense: 10, speed: -3 } },
  { id: 'brigandine', name: 'Brigandine', description: 'Plates in leather', type: 'armor', rarity: 'uncommon', icon: '🧥', price: 115, sellPrice: 38, stats: { defense: 8, maxHP: 10 } },
  { id: 'iron_shield', name: 'Iron Shield', description: 'Solid defense', type: 'armor', rarity: 'uncommon', icon: '🛡️', price: 90, sellPrice: 30, stats: { defense: 6 }, effect: 'block_bonus', effectValue: 20 },
  { id: 'fur_cloak', name: 'Fur Cloak', description: 'Warmth and protection', type: 'armor', rarity: 'uncommon', icon: '🧣', price: 80, sellPrice: 26, stats: { defense: 5, maxHP: 10, maxStamina: 10 } },
  
  // Rare Armor
  { id: 'champions_plate', name: 'Champion\'s Plate', description: 'Arena legend', type: 'armor', rarity: 'rare', icon: '🏆', price: 250, sellPrice: 83, stats: { defense: 13, maxHP: 20 }, effect: 'trust_bonus', effectValue: 10 },
  { id: 'shadow_leather', name: 'Shadow Leather', description: 'Dark and supple', type: 'armor', rarity: 'rare', icon: '🌑', price: 230, sellPrice: 76, stats: { defense: 9, evasion: 12, speed: 2 } },
  { id: 'berserker_hide', name: 'Berserker Hide', description: 'Battle blessed', type: 'armor', rarity: 'rare', icon: '🐻', price: 240, sellPrice: 80, stats: { defense: 8, maxHP: 25 }, effect: 'damage_when_hurt', effectValue: 20 },
  { id: 'mirror_plate', name: 'Mirror Plate', description: 'Reflects light', type: 'armor', rarity: 'rare', icon: '🪞', price: 260, sellPrice: 86, stats: { defense: 11, maxHP: 15 }, effect: 'reflect_damage', effectValue: 10 },
  { id: 'thorned_mail', name: 'Thorned Mail', description: 'Hurts attackers', type: 'armor', rarity: 'rare', icon: '🌹', price: 245, sellPrice: 81, stats: { defense: 10 }, effect: 'thorns', effectValue: 5 },
  { id: 'holy_vestments', name: 'Holy Vestments', description: 'Divine protection', type: 'armor', rarity: 'rare', icon: '✝️', price: 235, sellPrice: 78, stats: { defense: 8, maxHP: 10 }, effect: 'heal_per_turn', effectValue: 3 },
  
  // Epic Armor
  { id: 'dragon_scale', name: 'Dragon Scale', description: 'Impenetrable', type: 'armor', rarity: 'epic', icon: '🐉', price: 400, sellPrice: 133, stats: { defense: 16, maxHP: 30, speed: -3 }, effect: 'fire_resist', effectValue: 50 },
  { id: 'void_plate', name: 'Void Plate', description: 'Absorbs damage', type: 'armor', rarity: 'epic', icon: '🕳️', price: 420, sellPrice: 140, stats: { defense: 14, maxHP: 25 }, effect: 'damage_absorb', effectValue: 15 },
  { id: 'living_armor', name: 'Living Armor', description: 'Self-repairing', type: 'armor', rarity: 'epic', icon: '🦠', price: 450, sellPrice: 150, stats: { defense: 12, maxHP: 20 }, effect: 'regen', effectValue: 5 },
  
  // Legendary Armor
  { id: 'immortal_aegis', name: 'Immortal Aegis', description: 'Cheats death', type: 'armor', rarity: 'legendary', icon: '⚱️', price: 600, sellPrice: 200, stats: { defense: 18, maxHP: 40 }, effect: 'death_save' },
  { id: 'bloodline_armor', name: 'Bloodline Armor', description: 'Family heirloom', type: 'armor', rarity: 'legendary', icon: '🩸', price: 580, sellPrice: 193, stats: { defense: 15, maxHP: 35, maxStamina: 20 }, effect: 'bloodline_bonus', effectValue: 2 },
  { id: 'godplate', name: 'Godplate', description: 'Divine crafted', type: 'armor', rarity: 'legendary', icon: '☀️', price: 700, sellPrice: 233, stats: { defense: 20, maxHP: 50, speed: -4 }, effect: 'invulnerable_start', effectValue: 2 }
];

// Trinkets (15+)
export const TRINKETS: GameItem[] = [
  // Common
  { id: 'lucky_rabbit', name: 'Lucky Rabbit Foot', description: '+5% Crit', type: 'trinket', rarity: 'common', icon: '🐰', price: 40, sellPrice: 13, stats: { critChance: 5 } },
  { id: 'fighters_tooth', name: 'Fighter\'s Tooth', description: '+3 Attack', type: 'trinket', rarity: 'common', icon: '🦷', price: 45, sellPrice: 15, stats: { attack: 3 } },
  { id: 'silver_ring', name: 'Silver Ring', description: '+5 Defense', type: 'trinket', rarity: 'common', icon: '💍', price: 50, sellPrice: 16, stats: { defense: 5 } },
  
  // Uncommon
  { id: 'warriors_amulet', name: 'Warrior\'s Amulet', description: '+10 Max HP', type: 'trinket', rarity: 'uncommon', icon: '📿', price: 80, sellPrice: 26, stats: { maxHP: 10 } },
  { id: 'speed_boots', name: 'Speed Boots', description: '+3 Speed', type: 'trinket', rarity: 'uncommon', icon: '👢', price: 85, sellPrice: 28, stats: { speed: 3 } },
  { id: 'focus_gem', name: 'Focus Gem', description: '+15 Max Focus', type: 'trinket', rarity: 'uncommon', icon: '💎', price: 90, sellPrice: 30, stats: { maxFocus: 15 } },
  { id: 'crowd_charm', name: 'Crowd Charm', description: '+20% Hype gain', type: 'trinket', rarity: 'uncommon', icon: '🎪', price: 95, sellPrice: 31, effect: 'hype_bonus', effectValue: 20 },
  
  // Rare
  { id: 'vampiric_pendant', name: 'Vampiric Pendant', description: 'Lifesteal 5%', type: 'trinket', rarity: 'rare', icon: '🧛', price: 200, sellPrice: 66, effect: 'lifesteal', effectValue: 5 },
  { id: 'berserker_band', name: 'Berserker Band', description: '+25% dmg when low', type: 'trinket', rarity: 'rare', icon: '🔴', price: 220, sellPrice: 73, effect: 'damage_when_hurt', effectValue: 25 },
  { id: 'phoenix_feather', name: 'Phoenix Feather', description: 'Survive death once', type: 'trinket', rarity: 'rare', icon: '🪶', price: 250, sellPrice: 83, effect: 'death_save' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', description: '+20% Evasion', type: 'trinket', rarity: 'rare', icon: '🧥', price: 210, sellPrice: 70, stats: { evasion: 20 } },
  
  // Epic/Legendary
  { id: 'crown_jewel', name: 'Crown Jewel', description: 'All stats +5', type: 'trinket', rarity: 'epic', icon: '💠', price: 400, sellPrice: 133, stats: { attack: 5, defense: 5, speed: 5, accuracy: 5 } },
  { id: 'heart_arena', name: 'Heart of Arena', description: 'Double fame', type: 'trinket', rarity: 'legendary', icon: '❤️‍🔥', price: 500, sellPrice: 166, effect: 'fame_double' },
  { id: 'gods_eye', name: 'God\'s Eye', description: 'See enemy moves', type: 'trinket', rarity: 'legendary', icon: '👁️', price: 550, sellPrice: 183, effect: 'foresight' }
];

// Consumables (20+)
export const CONSUMABLES: GameItem[] = [
  // Healing
  { id: 'bandages', name: 'Crude Bandages', description: 'Heal 20 HP', type: 'consumable', rarity: 'common', icon: '🩹', price: 15, sellPrice: 5, effect: 'heal', effectValue: 20, uses: 1 },
  { id: 'healing_salve', name: 'Healing Salve', description: 'Heal 35 HP', type: 'consumable', rarity: 'common', icon: '🏺', price: 30, sellPrice: 10, effect: 'heal', effectValue: 35, uses: 1 },
  { id: 'health_potion', name: 'Health Potion', description: 'Heal 50 HP', type: 'consumable', rarity: 'uncommon', icon: '🧪', price: 50, sellPrice: 16, effect: 'heal', effectValue: 50, uses: 1 },
  { id: 'greater_health', name: 'Greater Health Potion', description: 'Heal 80 HP', type: 'consumable', rarity: 'rare', icon: '🧪', price: 100, sellPrice: 33, effect: 'heal', effectValue: 80, uses: 1 },
  { id: 'surgeons_kit', name: 'Surgeon\'s Kit', description: 'Full heal, cure bleed', type: 'consumable', rarity: 'rare', icon: '🩺', price: 150, sellPrice: 50, effect: 'full_heal_cure', uses: 1 },
  
  // Stamina
  { id: 'grit_salts', name: 'Grit Salts', description: '+30 Stamina', type: 'consumable', rarity: 'common', icon: '🧂', price: 20, sellPrice: 6, effect: 'stamina', effectValue: 30, uses: 1 },
  { id: 'energy_tonic', name: 'Energy Tonic', description: '+50 Stamina', type: 'consumable', rarity: 'uncommon', icon: '⚡', price: 40, sellPrice: 13, effect: 'stamina', effectValue: 50, uses: 1 },
  { id: 'adrenaline', name: 'Adrenaline Shot', description: 'Full Stamina', type: 'consumable', rarity: 'rare', icon: '💉', price: 80, sellPrice: 26, effect: 'full_stamina', uses: 1 },
  
  // Focus
  { id: 'focus_tea', name: 'Focus Tea', description: '+20 Focus', type: 'consumable', rarity: 'common', icon: '🍵', price: 25, sellPrice: 8, effect: 'focus', effectValue: 20, uses: 1 },
  { id: 'clarity_elixir', name: 'Clarity Elixir', description: '+40 Focus', type: 'consumable', rarity: 'uncommon', icon: '💧', price: 55, sellPrice: 18, effect: 'focus', effectValue: 40, uses: 1 },
  
  // Buffs
  { id: 'berserker_draught', name: 'Berserker Draught', description: '+8 Attack (3 turns)', type: 'consumable', rarity: 'uncommon', icon: '🍺', price: 60, sellPrice: 20, effect: 'buff_attack', effectValue: 8, uses: 1 },
  { id: 'iron_skin_oil', name: 'Iron-Skin Oil', description: '+8 Defense (3 turns)', type: 'consumable', rarity: 'uncommon', icon: '🛢️', price: 60, sellPrice: 20, effect: 'buff_defense', effectValue: 8, uses: 1 },
  { id: 'speed_draught', name: 'Speed Draught', description: '+5 Speed (3 turns)', type: 'consumable', rarity: 'uncommon', icon: '💨', price: 55, sellPrice: 18, effect: 'buff_speed', effectValue: 5, uses: 1 },
  { id: 'accuracy_tonic', name: 'Accuracy Tonic', description: '+15 Accuracy (3 turns)', type: 'consumable', rarity: 'uncommon', icon: '🎯', price: 50, sellPrice: 16, effect: 'buff_accuracy', effectValue: 15, uses: 1 },
  
  // Utility
  { id: 'smoke_bomb', name: 'Smoke Bomb', description: 'Guaranteed dodge', type: 'consumable', rarity: 'uncommon', icon: '💨', price: 50, sellPrice: 16, effect: 'guaranteed_dodge', uses: 1 },
  { id: 'flash_powder', name: 'Flash Powder', description: 'Enemy -20 Acc (2 turns)', type: 'consumable', rarity: 'uncommon', icon: '✨', price: 45, sellPrice: 15, effect: 'blind_enemy', effectValue: 20, uses: 1 },
  { id: 'antivenom', name: 'Antivenom', description: 'Cure poison/bleed', type: 'consumable', rarity: 'common', icon: '🐍', price: 35, sellPrice: 11, effect: 'cure_dot', uses: 1 },
  { id: 'rage_potion', name: 'Rage Potion', description: '+50% damage, -25% defense (fight)', type: 'consumable', rarity: 'rare', icon: '😤', price: 120, sellPrice: 40, effect: 'rage_mode', uses: 1 },
  
  // Special
  { id: 'elixir_life', name: 'Elixir of Life', description: 'Full heal, all buffs', type: 'consumable', rarity: 'legendary', icon: '✨', price: 300, sellPrice: 100, effect: 'elixir', uses: 1 }
];

// Item Sets
export const ITEM_SETS: ItemSet[] = [
  {
    id: 'rustborne',
    name: 'Rustborne Set',
    pieces: ['rusty_sword', 'studded_leather', 'fighters_tooth'],
    bonuses: [
      { piecesRequired: 2, effect: 'bleed_chance_10', description: '+10% Bleed chance on attacks' },
      { piecesRequired: 3, effect: 'hype_penalty_15', description: '-15% Crowd favor, but +20% damage' }
    ]
  },
  {
    id: 'champion',
    name: 'Champion\'s Regalia',
    pieces: ['champions_sword', 'champions_plate', 'crown_jewel'],
    bonuses: [
      { piecesRequired: 2, effect: 'fame_bonus_25', description: '+25% Fame gain' },
      { piecesRequired: 3, effect: 'crowd_power', description: 'At 50+ Hype, gain +10% all stats' }
    ]
  },
  {
    id: 'shadow',
    name: 'Shadow Walker Set',
    pieces: ['shadow_blade', 'shadow_leather', 'shadow_cloak'],
    bonuses: [
      { piecesRequired: 2, effect: 'evasion_15', description: '+15% Evasion' },
      { piecesRequired: 3, effect: 'stealth_strike', description: 'First attack each fight is guaranteed crit' }
    ]
  },
  {
    id: 'berserker',
    name: 'Berserker\'s Fury',
    pieces: ['barbed_flail', 'berserker_hide', 'berserker_band'],
    bonuses: [
      { piecesRequired: 2, effect: 'damage_when_hurt_15', description: '+15% damage when below 50% HP' },
      { piecesRequired: 3, effect: 'unstoppable', description: 'Cannot be stunned, attacks cannot be blocked' }
    ]
  },
  {
    id: 'holy',
    name: 'Divine Arsenal',
    pieces: ['blessed_mace', 'holy_vestments', 'phoenix_feather'],
    bonuses: [
      { piecesRequired: 2, effect: 'heal_boost_20', description: '+20% healing received' },
      { piecesRequired: 3, effect: 'divine_protection', description: 'Survive fatal blow with 25% HP (once per fight)' }
    ]
  }
];

// Helper functions
export function getItemById(id: string): GameItem | undefined {
  return [...WEAPONS, ...ARMOR, ...TRINKETS, ...CONSUMABLES].find(i => i.id === id);
}

export function getItemsByRarity(rarity: ItemRarity): GameItem[] {
  return [...WEAPONS, ...ARMOR, ...TRINKETS, ...CONSUMABLES].filter(i => i.rarity === rarity);
}

export function getSetBonus(equippedItems: string[]): SetBonus[] {
  const bonuses: SetBonus[] = [];
  
  for (const set of ITEM_SETS) {
    const matchingPieces = set.pieces.filter(p => equippedItems.includes(p)).length;
    for (const bonus of set.bonuses) {
      if (matchingPieces >= bonus.piecesRequired) {
        bonuses.push(bonus);
      }
    }
  }
  
  return bonuses;
}

export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    common: '#b0b0b0',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
  };
  return colors[rarity];
}
