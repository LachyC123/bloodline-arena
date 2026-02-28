/**
 * Biomes / Arenas - Environmental modifiers for fights
 * Each fight node has a biome that applies small rule twists
 */

export interface BiomeMod {
  stat: string;
  value: number;
  isPercent?: boolean;
  target: 'player' | 'enemy' | 'both';
  description: string;
}

export interface BiomeSpecialRule {
  type: 'combat' | 'reward' | 'passive';
  effect: string;
  value?: number;
}

export interface Biome {
  id: string;
  name: string;
  icon: string;
  description: string;
  ambience: string;  // Flavor text
  mods: BiomeMod[];
  specialRules: BiomeSpecialRule[];
  visualTheme: string;  // For styling
}

export const BIOMES: Biome[] = [
  {
    id: 'biome_standard_pit',
    name: 'The Pit',
    icon: '🏛️',
    description: 'A standard arena with no special rules',
    ambience: 'The roar of the crowd echoes off stone walls.',
    mods: [],
    specialRules: [],
    visualTheme: 'stone'
  },
  {
    id: 'biome_mud',
    name: 'Muddy Arena',
    icon: '🟤',
    description: 'Slippery footing reduces mobility',
    ambience: 'Rain has turned the arena floor to treacherous mud.',
    mods: [
      { stat: 'dodge', value: -0.10, isPercent: true, target: 'both', description: '-10% Dodge for all' },
      { stat: 'staminaRegen', value: -1, target: 'both', description: '-1 Stamina regen' }
    ],
    specialRules: [
      { type: 'passive', effect: 'Falls cause 5 damage when dodge fails', value: 5 }
    ],
    visualTheme: 'mud'
  },
  {
    id: 'biome_frozen',
    name: 'Frozen Courtyard',
    icon: '❄️',
    description: 'Ice reduces stamina recovery',
    ambience: 'Frost clings to every surface. Breath turns to mist.',
    mods: [
      { stat: 'staminaRegen', value: -2, target: 'both', description: '-2 Stamina regen' }
    ],
    specialRules: [
      { type: 'combat', effect: 'Bleed deals 50% less damage', value: -0.5 }
    ],
    visualTheme: 'ice'
  },
  {
    id: 'biome_chapel',
    name: 'Ruined Chapel',
    icon: '⛪',
    description: 'Sacred ground offers protection',
    ambience: 'Broken stained glass casts colored shadows.',
    mods: [
      { stat: 'defense', value: 3, target: 'both', description: '+3 Defense for all' }
    ],
    specialRules: [
      { type: 'passive', effect: 'Wounds are less likely (-10%)', value: -0.10 }
    ],
    visualTheme: 'chapel'
  },
  {
    id: 'biome_iron_cage',
    name: 'Iron Cage',
    icon: '⬛',
    description: 'No escape, no mercy',
    ambience: 'Iron bars surround you. The crowd demands blood.',
    mods: [
      { stat: 'damage', value: 0.10, isPercent: true, target: 'both', description: '+10% Damage for all' }
    ],
    specialRules: [
      { type: 'combat', effect: 'Cannot flee or dodge backwards', value: 0 },
      { type: 'reward', effect: '+20% gold on win', value: 0.20 }
    ],
    visualTheme: 'iron'
  },
  {
    id: 'biome_fire_pit',
    name: 'Fire Pit',
    icon: '🔥',
    description: 'Flames lick at the arena edges',
    ambience: 'Heat radiates from the burning coals surrounding the pit.',
    mods: [
      { stat: 'staminaRegen', value: -1, target: 'both', description: '-1 Stamina regen' }
    ],
    specialRules: [
      { type: 'combat', effect: 'Knocked down fighters take 3 fire damage', value: 3 },
      { type: 'passive', effect: 'Bleed causes +1 extra damage per tick', value: 1 }
    ],
    visualTheme: 'fire'
  },
  {
    id: 'biome_colosseum',
    name: 'Grand Colosseum',
    icon: '🏟️',
    description: 'The biggest stage. The crowd is watching.',
    ambience: 'Thousands watch. Every action earns cheers or jeers.',
    mods: [],
    specialRules: [
      { type: 'passive', effect: '+50% Hype gain from all sources', value: 0.50 },
      { type: 'reward', effect: '+25% Fame on win', value: 0.25 }
    ],
    visualTheme: 'grand'
  },
  {
    id: 'biome_dungeon',
    name: 'Prison Dungeon',
    icon: '⛓️',
    description: 'Dark and cramped. Fear is your enemy.',
    ambience: 'Chains rattle. The smell of rust and despair hangs heavy.',
    mods: [
      { stat: 'accuracy', value: -0.05, isPercent: true, target: 'both', description: '-5% Accuracy (darkness)' }
    ],
    specialRules: [
      { type: 'passive', effect: 'Enemy has +10% crit chance', value: 0.10 }
    ],
    visualTheme: 'dungeon'
  },
  {
    id: 'biome_garden',
    name: 'Nobleman\'s Garden',
    icon: '🌳',
    description: 'A genteel setting for violence',
    ambience: 'Roses bloom around the fighting circle. How civilized.',
    mods: [
      { stat: 'staminaRegen', value: 1, target: 'both', description: '+1 Stamina regen' }
    ],
    specialRules: [
      { type: 'reward', effect: '+10% gold but no Embers', value: 0.10 }
    ],
    visualTheme: 'garden'
  },
  {
    id: 'biome_blood_sand',
    name: 'Blood Sands',
    icon: '🏜️',
    description: 'The sand remembers every fallen warrior',
    ambience: 'The sand is stained red from countless battles.',
    mods: [
      { stat: 'bleedDamage', value: 0.25, isPercent: true, target: 'both', description: '+25% Bleed damage' }
    ],
    specialRules: [
      { type: 'passive', effect: 'Wounds heal 50% slower', value: -0.50 }
    ],
    visualTheme: 'desert'
  },
  {
    id: 'biome_flooded_forum',
    name: 'Flooded Forum',
    icon: '🌊',
    description: 'Waterlogged stone shifts footing and rewards precise strikes',
    ambience: 'Shallow water ripples across cracked marble while spectators chant from above.',
    mods: [
      { stat: 'accuracy', value: 0.08, isPercent: true, target: 'both', description: '+8% Accuracy for all' },
      { stat: 'speed', value: -2, target: 'both', description: '-2 Speed from heavy footing' }
    ],
    specialRules: [
      { type: 'combat', effect: 'Stuns last 1 extra turn in knee-deep water', value: 1 },
      { type: 'reward', effect: '+15% gold from spectacle bets', value: 0.15 }
    ],
    visualTheme: 'flooded'
  },
  {
    id: 'biome_obsidian_ring',
    name: 'Obsidian Ring',
    icon: '🖤',
    description: 'Heat and glassy shards punish reckless movement',
    ambience: 'Volcanic glass gleams beneath torchlight. Every step threatens a cut.',
    mods: [
      { stat: 'bleedDamage', value: 0.15, isPercent: true, target: 'both', description: '+15% Bleed damage' },
      { stat: 'dodge', value: -0.06, isPercent: true, target: 'both', description: '-6% Dodge (shard field)' }
    ],
    specialRules: [
      { type: 'passive', effect: 'Critical misses apply 1 bleed stack to attacker', value: 1 }
    ],
    visualTheme: 'obsidian'
  },
  {
    id: 'biome_whisper_catacombs',
    name: 'Whispering Catacombs',
    icon: '🕯️',
    description: 'Fear gnaws at unsteady minds under the crypt lights',
    ambience: 'Ancient bones line the walls, and murmurs seem to come from nowhere.',
    mods: [
      { stat: 'focus', value: -10, target: 'both', description: '-10 Starting Focus' },
      { stat: 'resolve', value: 10, target: 'player', description: '+10 Resolve for the prepared' }
    ],
    specialRules: [
      { type: 'combat', effect: 'First successful parry grants 15 focus', value: 15 }
    ],
    visualTheme: 'catacomb'
  },
  {
    id: 'biome_sunforge_stage',
    name: 'Sunforge Stage',
    icon: '☀️',
    description: 'Blazing lights empower aggression and drain patience',
    ambience: 'Polished brass mirrors sunlight into a searing halo around the arena.',
    mods: [
      { stat: 'damage', value: 0.12, isPercent: true, target: 'both', description: '+12% Damage for all' },
      { stat: 'staminaRegen', value: -1, target: 'both', description: '-1 Stamina regen (heat fatigue)' }
    ],
    specialRules: [
      { type: 'reward', effect: '+20% Fame on dramatic victories', value: 0.20 }
    ],
    visualTheme: 'sunforge'
  },
  {
    id: 'biome_hanging_bridge',
    name: 'Hanging Bridge Arena',
    icon: '🌉',
    description: 'Narrow footing magnifies tempo and punishes defense turtles',
    ambience: 'The fight takes place above a roaring ravine on chained planks.',
    mods: [
      { stat: 'speed', value: 3, target: 'both', description: '+3 Speed from constant repositioning' },
      { stat: 'defense', value: -2, target: 'both', description: '-2 Defense (limited guard angles)' }
    ],
    specialRules: [
      { type: 'combat', effect: 'Guard effectiveness reduced by 20%', value: -0.2 },
      { type: 'reward', effect: '+10% gold from hazard pay', value: 0.10 }
    ],
    visualTheme: 'bridge'
  }
];

// ===== HELPER FUNCTIONS =====

export function getBiomeById(id: string): Biome | undefined {
  return BIOMES.find(b => b.id === id);
}

export function getRandomBiome(excludeIds: string[] = []): Biome {
  const available = BIOMES.filter(b => !excludeIds.includes(b.id));
  if (available.length === 0) return BIOMES[0];
  return available[Math.floor(Math.random() * available.length)];
}

export function calculateBiomeMods(biome: Biome, isPlayer: boolean): Record<string, number> {
  const mods: Record<string, number> = {};
  
  for (const mod of biome.mods) {
    if (mod.target === 'both' || 
        (mod.target === 'player' && isPlayer) ||
        (mod.target === 'enemy' && !isPlayer)) {
      mods[mod.stat] = (mods[mod.stat] || 0) + mod.value;
    }
  }
  
  return mods;
}

export function getBiomeRewardMods(biome: Biome): { goldMod: number; fameMod: number; emberMod: number } {
  let goldMod = 0;
  let fameMod = 0;
  let emberMod = 0;
  
  for (const rule of biome.specialRules) {
    if (rule.type === 'reward') {
      if (rule.effect.includes('gold')) {
        goldMod += rule.value || 0;
      }
      if (rule.effect.includes('Fame')) {
        fameMod += rule.value || 0;
      }
      if (rule.effect.includes('no Embers')) {
        emberMod = -1;  // Disable ember drops
      }
    }
  }
  
  return { goldMod, fameMod, emberMod };
}
