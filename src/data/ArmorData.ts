/**
 * ArmorData - Expanded armor with meaningful tradeoffs
 * 30+ armor pieces with distinct perks and penalties
 */

import { ItemRarity } from './WeaponsData';

export type ArmorSlot = 'body' | 'helmet' | 'shield';

export interface ArmorPerk {
  type: 'bleed_resist' | 'stun_resist' | 'crit_resist' | 'poison_resist' |
        'stamina_regen' | 'focus_boost' | 'momentum_boost' | 'first_strike_resist' |
        'counter_damage' | 'thorns' | 'hp_regen' | 'dodge_boost';
  value: number;
  description: string;
}

export interface ArmorData {
  id: string;
  name: string;
  slot: ArmorSlot;
  rarity: ItemRarity;
  icon: string;
  
  // Defense
  defense: number;
  
  // Trade-offs
  staminaRegenMod: number;   // Positive = bonus, negative = penalty
  dodgeMod: number;          // Dodge chance modifier
  speedMod: number;          // Turn order modifier
  
  // Perks
  perks: ArmorPerk[];
  
  // Description
  description: string;
  lore: string;
  
  // Economy
  price: number;
  sellPrice: number;
  leagueMin: 'bronze' | 'silver' | 'gold';
}

// Armor type descriptions
export const ARMOR_SLOT_INFO: Record<ArmorSlot, { name: string; icon: string; description: string }> = {
  body: {
    name: 'Body Armor',
    icon: '🛡️',
    description: 'Main protection for your torso.'
  },
  helmet: {
    name: 'Helmet',
    icon: '⛑️',
    description: 'Head protection, reduces crit and stun damage.'
  },
  shield: {
    name: 'Shield',
    icon: '🛡️',
    description: 'Active defense, improves guard effectiveness.'
  }
};

export const ARMOR_DATA: ArmorData[] = [
  // ========== BODY ARMOR - LIGHT ==========
  {
    id: 'tattered_tunic',
    name: 'Tattered Tunic',
    slot: 'body',
    rarity: 'common',
    icon: '👕',
    defense: 2,
    staminaRegenMod: 2,
    dodgeMod: 5,
    speedMod: 1,
    perks: [],
    description: 'Light and unrestricting but offers little protection.',
    lore: 'Better than nothing.',
    price: 20,
    sellPrice: 7,
    leagueMin: 'bronze'
  },
  {
    id: 'padded_vest',
    name: 'Padded Vest',
    slot: 'body',
    rarity: 'common',
    icon: '👕',
    defense: 4,
    staminaRegenMod: 1,
    dodgeMod: 3,
    speedMod: 0,
    perks: [
      { type: 'bleed_resist', value: 15, description: '15% bleed resistance' }
    ],
    description: 'Layered cloth provides some cushioning.',
    lore: 'Absorbs some impact.',
    price: 40,
    sellPrice: 14,
    leagueMin: 'bronze'
  },
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    slot: 'body',
    rarity: 'common',
    icon: '🦺',
    defense: 6,
    staminaRegenMod: 0,
    dodgeMod: 2,
    speedMod: 0,
    perks: [
      { type: 'bleed_resist', value: 20, description: '20% bleed resistance' }
    ],
    description: 'Standard gladiator protection. Balanced.',
    lore: 'Arena standard issue.',
    price: 60,
    sellPrice: 20,
    leagueMin: 'bronze'
  },
  {
    id: 'hardened_leather',
    name: 'Hardened Leather',
    slot: 'body',
    rarity: 'uncommon',
    icon: '🦺',
    defense: 9,
    staminaRegenMod: 0,
    dodgeMod: 0,
    speedMod: 0,
    perks: [
      { type: 'bleed_resist', value: 30, description: '30% bleed resistance' },
      { type: 'crit_resist', value: 10, description: '10% crit damage reduction' }
    ],
    description: 'Boiled and treated leather provides solid protection.',
    lore: 'Proven in countless fights.',
    price: 100,
    sellPrice: 35,
    leagueMin: 'bronze'
  },
  {
    id: 'gladiator_harness',
    name: 'Gladiator\'s Harness',
    slot: 'body',
    rarity: 'uncommon',
    icon: '🦺',
    defense: 8,
    staminaRegenMod: 2,
    dodgeMod: 5,
    speedMod: 1,
    perks: [
      { type: 'momentum_boost', value: 20, description: '+20% momentum gain' },
      { type: 'dodge_boost', value: 5, description: '+5% dodge chance' }
    ],
    description: 'Flashy straps that please the crowd.',
    lore: 'Style over substance.',
    price: 130,
    sellPrice: 45,
    leagueMin: 'bronze'
  },

  // ========== BODY ARMOR - MEDIUM ==========
  {
    id: 'chainmail',
    name: 'Chainmail',
    slot: 'body',
    rarity: 'uncommon',
    icon: '⛓️',
    defense: 12,
    staminaRegenMod: -2,
    dodgeMod: -5,
    speedMod: -1,
    perks: [
      { type: 'bleed_resist', value: 50, description: '50% bleed resistance' }
    ],
    description: 'Interlocked rings stop slashing attacks.',
    lore: 'The rattling of metal.',
    price: 150,
    sellPrice: 50,
    leagueMin: 'bronze'
  },
  {
    id: 'reinforced_chain',
    name: 'Reinforced Chainmail',
    slot: 'body',
    rarity: 'rare',
    icon: '⛓️',
    defense: 15,
    staminaRegenMod: -1,
    dodgeMod: -3,
    speedMod: -1,
    perks: [
      { type: 'bleed_resist', value: 65, description: '65% bleed resistance' },
      { type: 'crit_resist', value: 15, description: '15% crit damage reduction' }
    ],
    description: 'Double-woven rings with leather backing.',
    lore: 'Heavy but reliable.',
    price: 220,
    sellPrice: 75,
    leagueMin: 'silver'
  },
  {
    id: 'scale_mail',
    name: 'Scale Mail',
    slot: 'body',
    rarity: 'rare',
    icon: '🐉',
    defense: 14,
    staminaRegenMod: -2,
    dodgeMod: -4,
    speedMod: 0,
    perks: [
      { type: 'bleed_resist', value: 40, description: '40% bleed resistance' },
      { type: 'poison_resist', value: 30, description: '30% poison resistance' }
    ],
    description: 'Overlapping metal scales like a serpent.',
    lore: 'Flexible yet strong.',
    price: 200,
    sellPrice: 68,
    leagueMin: 'silver'
  },

  // ========== BODY ARMOR - HEAVY ==========
  {
    id: 'brigandine',
    name: 'Brigandine',
    slot: 'body',
    rarity: 'rare',
    icon: '🛡️',
    defense: 18,
    staminaRegenMod: -3,
    dodgeMod: -8,
    speedMod: -2,
    perks: [
      { type: 'bleed_resist', value: 60, description: '60% bleed resistance' },
      { type: 'stun_resist', value: 20, description: '20% stun resistance' }
    ],
    description: 'Metal plates riveted inside heavy cloth.',
    lore: 'A soldier\'s choice.',
    price: 280,
    sellPrice: 95,
    leagueMin: 'silver'
  },
  {
    id: 'half_plate',
    name: 'Half Plate',
    slot: 'body',
    rarity: 'epic',
    icon: '🛡️',
    defense: 22,
    staminaRegenMod: -4,
    dodgeMod: -10,
    speedMod: -2,
    perks: [
      { type: 'bleed_resist', value: 70, description: '70% bleed resistance' },
      { type: 'crit_resist', value: 25, description: '25% crit damage reduction' },
      { type: 'stun_resist', value: 25, description: '25% stun resistance' }
    ],
    description: 'Solid plates protecting vital areas.',
    lore: 'Knight\'s armor, arena-modified.',
    price: 400,
    sellPrice: 135,
    leagueMin: 'silver'
  },
  {
    id: 'full_plate',
    name: 'Full Plate Armor',
    slot: 'body',
    rarity: 'epic',
    icon: '🛡️',
    defense: 28,
    staminaRegenMod: -6,
    dodgeMod: -15,
    speedMod: -3,
    perks: [
      { type: 'bleed_resist', value: 80, description: '80% bleed resistance' },
      { type: 'crit_resist', value: 35, description: '35% crit damage reduction' },
      { type: 'stun_resist', value: 35, description: '35% stun resistance' },
      { type: 'first_strike_resist', value: 50, description: '50% first strike resistance' }
    ],
    description: 'Complete metal encasement. Maximum protection.',
    lore: 'A walking fortress.',
    price: 600,
    sellPrice: 200,
    leagueMin: 'gold'
  },
  {
    id: 'champions_plate',
    name: 'Champion\'s Plate',
    slot: 'body',
    rarity: 'legendary',
    icon: '🛡️',
    defense: 32,
    staminaRegenMod: -4,
    dodgeMod: -10,
    speedMod: -2,
    perks: [
      { type: 'bleed_resist', value: 85, description: '85% bleed resistance' },
      { type: 'crit_resist', value: 40, description: '40% crit damage reduction' },
      { type: 'stun_resist', value: 40, description: '40% stun resistance' },
      { type: 'hp_regen', value: 2, description: 'Regenerate 2 HP per turn' }
    ],
    description: 'Masterwork plate worn by arena legends.',
    lore: 'Forged by the greatest smith.',
    price: 950,
    sellPrice: 320,
    leagueMin: 'gold'
  },

  // ========== SPECIAL BODY ARMOR ==========
  {
    id: 'berserker_furs',
    name: 'Berserker\'s Furs',
    slot: 'body',
    rarity: 'rare',
    icon: '🐻',
    defense: 10,
    staminaRegenMod: 3,
    dodgeMod: 0,
    speedMod: 1,
    perks: [
      { type: 'momentum_boost', value: 40, description: '+40% momentum gain' },
      { type: 'thorns', value: 3, description: 'Deal 3 damage when hit' }
    ],
    description: 'Savage furs that fuel rage.',
    lore: 'From the northern wastes.',
    price: 250,
    sellPrice: 85,
    leagueMin: 'silver'
  },
  {
    id: 'assassin_cloak',
    name: 'Assassin\'s Cloak',
    slot: 'body',
    rarity: 'epic',
    icon: '🧥',
    defense: 6,
    staminaRegenMod: 4,
    dodgeMod: 15,
    speedMod: 3,
    perks: [
      { type: 'dodge_boost', value: 15, description: '+15% dodge chance' },
      { type: 'crit_resist', value: 20, description: '20% crit damage reduction' },
      { type: 'counter_damage', value: 25, description: '+25% counter damage' }
    ],
    description: 'Light as shadow, fast as death.',
    lore: 'Worn by the unseen.',
    price: 450,
    sellPrice: 150,
    leagueMin: 'silver'
  },

  // ========== HELMETS ==========
  {
    id: 'leather_cap',
    name: 'Leather Cap',
    slot: 'helmet',
    rarity: 'common',
    icon: '🎩',
    defense: 2,
    staminaRegenMod: 0,
    dodgeMod: 0,
    speedMod: 0,
    perks: [
      { type: 'stun_resist', value: 10, description: '10% stun resistance' }
    ],
    description: 'Basic head protection.',
    lore: 'Better than bare.',
    price: 25,
    sellPrice: 8,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_helm',
    name: 'Iron Helm',
    slot: 'helmet',
    rarity: 'uncommon',
    icon: '⛑️',
    defense: 4,
    staminaRegenMod: -1,
    dodgeMod: -2,
    speedMod: 0,
    perks: [
      { type: 'stun_resist', value: 25, description: '25% stun resistance' },
      { type: 'crit_resist', value: 10, description: '10% crit damage reduction' }
    ],
    description: 'Solid iron protection for the skull.',
    lore: 'Standard military issue.',
    price: 80,
    sellPrice: 28,
    leagueMin: 'bronze'
  },
  {
    id: 'gladiator_helm',
    name: 'Gladiator\'s Helm',
    slot: 'helmet',
    rarity: 'rare',
    icon: '⛑️',
    defense: 6,
    staminaRegenMod: 0,
    dodgeMod: -3,
    speedMod: 0,
    perks: [
      { type: 'stun_resist', value: 35, description: '35% stun resistance' },
      { type: 'crit_resist', value: 20, description: '20% crit damage reduction' },
      { type: 'momentum_boost', value: 15, description: 'Crowd loves the look' }
    ],
    description: 'Iconic arena headgear with face guard.',
    lore: 'Intimidating and protective.',
    price: 180,
    sellPrice: 60,
    leagueMin: 'silver'
  },
  {
    id: 'greathelm',
    name: 'Greathelm',
    slot: 'helmet',
    rarity: 'epic',
    icon: '⛑️',
    defense: 10,
    staminaRegenMod: -2,
    dodgeMod: -5,
    speedMod: -1,
    perks: [
      { type: 'stun_resist', value: 50, description: '50% stun resistance' },
      { type: 'crit_resist', value: 35, description: '35% crit damage reduction' },
      { type: 'bleed_resist', value: 25, description: '25% bleed resistance' }
    ],
    description: 'Full head enclosure. Maximum protection.',
    lore: 'The bucket helm.',
    price: 320,
    sellPrice: 108,
    leagueMin: 'gold'
  },

  // ========== SHIELDS ==========
  {
    id: 'wooden_buckler',
    name: 'Wooden Buckler',
    slot: 'shield',
    rarity: 'common',
    icon: '🛡️',
    defense: 3,
    staminaRegenMod: -1,
    dodgeMod: 0,
    speedMod: 0,
    perks: [],
    description: 'Small shield for deflecting blows.',
    lore: 'Light and maneuverable.',
    price: 30,
    sellPrice: 10,
    leagueMin: 'bronze'
  },
  {
    id: 'iron_shield',
    name: 'Iron Round Shield',
    slot: 'shield',
    rarity: 'uncommon',
    icon: '🛡️',
    defense: 6,
    staminaRegenMod: -2,
    dodgeMod: -3,
    speedMod: -1,
    perks: [
      { type: 'stun_resist', value: 15, description: '15% stun resistance' }
    ],
    description: 'Standard combat shield.',
    lore: 'Dented from use.',
    price: 90,
    sellPrice: 30,
    leagueMin: 'bronze'
  },
  {
    id: 'kite_shield',
    name: 'Kite Shield',
    slot: 'shield',
    rarity: 'rare',
    icon: '🛡️',
    defense: 10,
    staminaRegenMod: -3,
    dodgeMod: -5,
    speedMod: -1,
    perks: [
      { type: 'bleed_resist', value: 25, description: '25% bleed resistance' },
      { type: 'first_strike_resist', value: 30, description: '30% first strike resistance' }
    ],
    description: 'Large teardrop shield covering the body.',
    lore: 'A knight\'s companion.',
    price: 200,
    sellPrice: 68,
    leagueMin: 'silver'
  },
  {
    id: 'tower_shield',
    name: 'Tower Shield',
    slot: 'shield',
    rarity: 'epic',
    icon: '🛡️',
    defense: 15,
    staminaRegenMod: -5,
    dodgeMod: -10,
    speedMod: -2,
    perks: [
      { type: 'bleed_resist', value: 40, description: '40% bleed resistance' },
      { type: 'stun_resist', value: 30, description: '30% stun resistance' },
      { type: 'first_strike_resist', value: 50, description: '50% first strike resistance' }
    ],
    description: 'Massive shield that covers the entire body.',
    lore: 'A mobile wall.',
    price: 380,
    sellPrice: 128,
    leagueMin: 'gold'
  },
  {
    id: 'spiked_shield',
    name: 'Spiked Shield',
    slot: 'shield',
    rarity: 'rare',
    icon: '🛡️',
    defense: 7,
    staminaRegenMod: -2,
    dodgeMod: -2,
    speedMod: 0,
    perks: [
      { type: 'thorns', value: 5, description: 'Deal 5 damage when blocking' },
      { type: 'counter_damage', value: 20, description: '+20% counter damage' }
    ],
    description: 'Shield with offensive capability.',
    lore: 'Defense is also attack.',
    price: 220,
    sellPrice: 75,
    leagueMin: 'silver'
  }
];

// Helper functions
export function getArmorById(id: string): ArmorData | undefined {
  return ARMOR_DATA.find(a => a.id === id);
}

export function getArmorBySlot(slot: ArmorSlot): ArmorData[] {
  return ARMOR_DATA.filter(a => a.slot === slot);
}

export function getArmorByRarity(rarity: ItemRarity): ArmorData[] {
  return ARMOR_DATA.filter(a => a.rarity === rarity);
}

export function getArmorForLeague(league: 'bronze' | 'silver' | 'gold'): ArmorData[] {
  const leagueOrder = ['bronze', 'silver', 'gold'];
  const leagueIdx = leagueOrder.indexOf(league);
  return ARMOR_DATA.filter(a => leagueOrder.indexOf(a.leagueMin) <= leagueIdx);
}

export function getArmorPerkDescription(armor: ArmorData): string {
  if (armor.perks.length === 0) return 'No special perks';
  return armor.perks.map(p => p.description).join(', ');
}

export function calculateArmorStats(armor: ArmorData): string {
  const parts: string[] = [`${armor.defense} DEF`];
  if (armor.staminaRegenMod !== 0) {
    parts.push(`${armor.staminaRegenMod > 0 ? '+' : ''}${armor.staminaRegenMod} Stamina Regen`);
  }
  if (armor.dodgeMod !== 0) {
    parts.push(`${armor.dodgeMod > 0 ? '+' : ''}${armor.dodgeMod}% Dodge`);
  }
  if (armor.speedMod !== 0) {
    parts.push(`${armor.speedMod > 0 ? '+' : ''}${armor.speedMod} Speed`);
  }
  return parts.join(', ');
}
