/**
 * RNGSystem - Deterministic seeded random number generator
 * Uses Mulberry32 algorithm for reproducible randomness
 */

export class SeededRNG {
  private seed: number;
  private initialSeed: number;

  constructor(seed?: number) {
    this.initialSeed = seed ?? Math.floor(Math.random() * 2147483647);
    this.seed = this.initialSeed;
  }

  /**
   * Reset to initial seed
   */
  reset(): void {
    this.seed = this.initialSeed;
  }

  /**
   * Set a new seed
   */
  setSeed(seed: number): void {
    this.initialSeed = seed;
    this.seed = seed;
  }

  /**
   * Get current seed
   */
  getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Mulberry32 algorithm - generates a number between 0 and 1
   */
  private mulberry32(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generate a random float between 0 (inclusive) and 1 (exclusive)
   */
  random(): number {
    return this.mulberry32();
  }

  /**
   * Generate a random integer between min (inclusive) and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min (inclusive) and max (exclusive)
   */
  randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Returns true with the given probability (0-1)
   */
  chance(probability: number): boolean {
    return this.random() < probability;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Pick multiple unique random elements from an array
   */
  pickMultiple<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error('Cannot pick more elements than array length');
    }
    
    const copy = [...array];
    const result: T[] = [];
    
    for (let i = 0; i < count; i++) {
      const index = this.randomInt(0, copy.length - 1);
      result.push(copy[index]);
      copy.splice(index, 1);
    }
    
    return result;
  }

  /**
   * Shuffle an array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Pick from weighted options
   * @param options Array of [item, weight] tuples
   */
  weightedPick<T>(options: [T, number][]): T {
    const totalWeight = options.reduce((sum, [, weight]) => sum + weight, 0);
    let random = this.random() * totalWeight;
    
    for (const [item, weight] of options) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }
    
    // Fallback to last item
    return options[options.length - 1][0];
  }

  /**
   * Generate a random name-safe ID
   */
  randomId(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[this.randomInt(0, chars.length - 1)];
    }
    return result;
  }

  /**
   * Roll dice notation (e.g., "2d6+3")
   */
  roll(notation: string): number {
    const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }
    
    const numDice = parseInt(match[1], 10);
    const dieSize = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    let total = modifier;
    for (let i = 0; i < numDice; i++) {
      total += this.randomInt(1, dieSize);
    }
    
    return total;
  }

  /**
   * Generate a bell curve distribution (sum of multiple rolls)
   */
  bellCurve(min: number, max: number, rolls: number = 3): number {
    let total = 0;
    for (let i = 0; i < rolls; i++) {
      total += this.randomFloat(min, max);
    }
    return total / rolls;
  }
}

// Global RNG instance for the current run
let globalRNG = new SeededRNG();

export const RNG = {
  /**
   * Initialize global RNG with a seed
   */
  init(seed?: number): void {
    globalRNG = new SeededRNG(seed);
  },

  /**
   * Get the current seed
   */
  getSeed(): number {
    return globalRNG.getSeed();
  },

  /**
   * Reset to initial seed
   */
  reset(): void {
    globalRNG.reset();
  },

  /**
   * Random float 0-1
   */
  random(): number {
    return globalRNG.random();
  },

  /**
   * Random integer between min and max (inclusive)
   */
  int(min: number, max: number): number {
    return globalRNG.randomInt(min, max);
  },

  /**
   * Random float between min and max
   */
  float(min: number, max: number): number {
    return globalRNG.randomFloat(min, max);
  },

  /**
   * True with given probability
   */
  chance(probability: number): boolean {
    return globalRNG.chance(probability);
  },

  /**
   * Pick random element
   */
  pick<T>(array: T[]): T {
    return globalRNG.pick(array);
  },

  /**
   * Pick multiple unique elements
   */
  pickMultiple<T>(array: T[], count: number): T[] {
    return globalRNG.pickMultiple(array, count);
  },

  /**
   * Shuffle array
   */
  shuffle<T>(array: T[]): T[] {
    return globalRNG.shuffle(array);
  },

  /**
   * Weighted random pick
   */
  weightedPick<T>(options: [T, number][]): T {
    return globalRNG.weightedPick(options);
  },

  /**
   * Generate random ID
   */
  id(length?: number): string {
    return globalRNG.randomId(length);
  },

  /**
   * Roll dice
   */
  roll(notation: string): number {
    return globalRNG.roll(notation);
  },

  /**
   * Bell curve distribution
   */
  bellCurve(min: number, max: number, rolls?: number): number {
    return globalRNG.bellCurve(min, max, rolls);
  },

  /**
   * Create independent RNG instance
   */
  create(seed?: number): SeededRNG {
    return new SeededRNG(seed);
  }
};
