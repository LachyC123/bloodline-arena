/**
 * LootSystem - Generates loot drops after combat
 */

import { RNG } from './RNGSystem';
import { ItemInstance, generateRandomWeapon, generateRandomArmor, generateRandomTrinket, generateRandomConsumable } from './InventorySystem';

export interface LootContext {
  league: 'bronze' | 'silver' | 'gold';
  crowdHype: number;
  consecutiveWins: number;
}

export function generateLootDrops(context: LootContext): ItemInstance[] {
  const drops: ItemInstance[] = [];
  const hypeBonus = Math.min(0.35, context.crowdHype / 300);
  const baseDrops = 1 + (context.consecutiveWins >= 3 ? 1 : 0);

  for (let i = 0; i < baseDrops; i++) {
    drops.push(generateLootItem(context.league));
  }

  if (RNG.chance(0.25 + hypeBonus)) {
    drops.push(generateLootItem(context.league));
  }

  if (context.consecutiveWins >= 5 && RNG.chance(0.35)) {
    drops.push(generateLootItem(context.league));
  }

  return drops;
}

function generateLootItem(league: 'bronze' | 'silver' | 'gold'): ItemInstance {
  const category = RNG.weightedPick([
    ['weapon', 35],
    ['armor', 35],
    ['trinket', 15],
    ['consumable', 15]
  ] as const);

  switch (category) {
    case 'weapon':
      return generateRandomWeapon(league, true);
    case 'armor':
      return generateRandomArmor(league, undefined, true);
    case 'trinket':
      return generateRandomTrinket(league);
    case 'consumable':
      return generateRandomConsumable(league);
    default:
      return generateRandomWeapon(league, true);
  }
}
