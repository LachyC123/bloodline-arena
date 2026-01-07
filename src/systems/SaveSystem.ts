/**
 * SaveSystem - Handles all game persistence via localStorage
 * Includes autosave, run data, meta progression, settings, and migration
 */

import { Fighter, FighterStatus } from './FighterSystem';
import { LegendEntry } from './LegacySystem';
import { WrittenLetter } from '../data/LettersData';
import { Relic } from '../data/RelicsData';

// Current save version - increment when adding breaking changes
const SAVE_VERSION = 2;

// Save data structure
export interface GameSettings {
  reduceMotion: boolean;
  screenShake: boolean;
  bloodFX: boolean;
  grainFX: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  showTimingRing: boolean;
  autoSave: boolean;
}

export interface RunState {
  seed: number;
  week: number;
  league: 'bronze' | 'silver' | 'gold' | 'champion';
  fightsInLeague: number;
  fightsToNextLeague: number;
  gold: number;
  fame: number;
  fighter: Fighter | null;
  archetypeId: string;
  promise: string | null;
  rivalId: string | null;
  friendId: string | null;
  completedVignettes: string[];
  lettersWritten: WrittenLetter[];
  lastCampAction: string | null;
  inProgress: boolean;
  
  // New: Relics for this run
  relics: string[];  // Relic IDs
  relicPityCounter: number;
  
  // New: Run modifiers (daily oath)
  activeModifiers: string[];
  
  // New: Milestone tracking
  fightsSinceRelic: number;
  consecutiveWins: number;
  
  // Debt system (from patron letters)
  debt: number;
  debtFightsRemaining: number;
}

export interface MetaProgression {
  promoterXP: number;
  promoterLevel: number;
  bloodlinePoints: number;
  letterStamps: number;  // New: Meta currency from letters
  unlockedPerks: string[];
  unlockedArchetypes: string[];  // New: Unlocked character classes
  hallOfLegends: LegendEntry[];
  heirlooms: HeirloomItem[];
  totalRuns: number;
  totalWins: number;
  totalDeaths: number;
  ghostMoments: GhostMoment[];
  
  // New: Lifetime stats for unlocks
  lifetimeStats: LifetimeStats;
  
  // New: Letter milestones
  letterCounts: Record<string, number>;  // Letter type -> count
  unlockedLetterRewards: string[];
  
  // New: Stamp shop purchases
  purchasedStampRewards: string[];
}

export interface LifetimeStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalPerfectParries: number;
  totalItemsUsed: number;
  totalGoldEarned: number;
  totalFameEarned: number;
  highestStreak: number;
  championsDefeated: number;
  rivalsDefeated: number;
  fightsWithNoDamage: number;
  bleedDeaths: number;
  maxSingleDamage: number;
}

export interface HeirloomItem {
  id: string;
  name: string;
  description: string;
  fromFighter: string;
  effect: string;
  recovered: boolean;
}

export interface GhostMoment {
  fighterId: string;
  fighterName: string;
  nickname: string;
  type: 'crowd_chant' | 'item_drop' | 'statue' | 'story';
  triggered: boolean;
}

export interface SaveData {
  version: number;
  settings: GameSettings;
  run: RunState;
  meta: MetaProgression;
  lastSaved: number;
}

const SAVE_KEY = 'bloodline_arena_save';

// Default values
const DEFAULT_SETTINGS: GameSettings = {
  reduceMotion: false,
  screenShake: true,
  bloodFX: true,
  grainFX: true,
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  showDamageNumbers: true,
  showTimingRing: true,
  autoSave: true
};

const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalPerfectParries: 0,
  totalItemsUsed: 0,
  totalGoldEarned: 0,
  totalFameEarned: 0,
  highestStreak: 0,
  championsDefeated: 0,
  rivalsDefeated: 0,
  fightsWithNoDamage: 0,
  bleedDeaths: 0,
  maxSingleDamage: 0
};

const DEFAULT_RUN: RunState = {
  seed: 0,
  week: 0,
  league: 'bronze',
  fightsInLeague: 0,
  fightsToNextLeague: 3,
  gold: 50,
  fame: 0,
  fighter: null,
  archetypeId: 'gladiator',
  promise: null,
  rivalId: null,
  friendId: null,
  completedVignettes: [],
  lettersWritten: [],
  lastCampAction: null,
  inProgress: false,
  relics: [],
  relicPityCounter: 0,
  activeModifiers: [],
  fightsSinceRelic: 0,
  consecutiveWins: 0,
  debt: 0,
  debtFightsRemaining: 0
};

const DEFAULT_META: MetaProgression = {
  promoterXP: 0,
  promoterLevel: 1,
  bloodlinePoints: 0,
  letterStamps: 0,
  unlockedPerks: [],
  unlockedArchetypes: ['gladiator'],
  hallOfLegends: [],
  heirlooms: [],
  totalRuns: 0,
  totalWins: 0,
  totalDeaths: 0,
  ghostMoments: [],
  lifetimeStats: { ...DEFAULT_LIFETIME_STATS },
  letterCounts: {},
  unlockedLetterRewards: [],
  purchasedStampRewards: []
};

class SaveSystemClass {
  private data: SaveData;
  private autoSaveInterval: number | null = null;

  constructor() {
    this.data = this.getDefaultData();
  }

  private getDefaultData(): SaveData {
    return {
      version: SAVE_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      run: { ...DEFAULT_RUN },
      meta: { ...DEFAULT_META },
      lastSaved: Date.now()
    };
  }

  /**
   * Load save data from localStorage
   */
  load(): boolean {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SaveData;
        
        // Migrate if needed
        if (parsed.version !== SAVE_VERSION) {
          console.log(`Migrating save from v${parsed.version} to v${SAVE_VERSION}`);
          this.migrate(parsed);
        } else {
          this.data = this.mergeWithDefaults(parsed);
        }
        console.log('Save data loaded successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to load save data:', error);
    }
    
    // Use defaults if no save or error
    this.data = this.getDefaultData();
    return false;
  }

  /**
   * Merge saved data with defaults (handles missing fields)
   */
  private mergeWithDefaults(saved: Partial<SaveData>): SaveData {
    return {
      version: SAVE_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...saved.settings },
      run: { 
        ...DEFAULT_RUN, 
        ...saved.run,
        // Ensure arrays exist
        relics: saved.run?.relics || [],
        lettersWritten: saved.run?.lettersWritten || [],
        activeModifiers: saved.run?.activeModifiers || []
      },
      meta: { 
        ...DEFAULT_META, 
        ...saved.meta,
        // Ensure nested objects exist
        lifetimeStats: { ...DEFAULT_LIFETIME_STATS, ...saved.meta?.lifetimeStats },
        letterCounts: saved.meta?.letterCounts || {},
        unlockedArchetypes: saved.meta?.unlockedArchetypes || ['gladiator']
      },
      lastSaved: saved.lastSaved || Date.now()
    };
  }

  /**
   * Handle save data migration between versions
   */
  private migrate(oldData: SaveData): void {
    let data = oldData;
    
    // Version 1 -> 2: Add new systems
    if (data.version === 1) {
      console.log('Migrating v1 -> v2: Adding relics, archetypes, letters');
      
      // Add run fields
      data.run = {
        ...DEFAULT_RUN,
        ...data.run,
        relics: [],
        relicPityCounter: 0,
        activeModifiers: [],
        fightsSinceRelic: 0,
        consecutiveWins: 0,
        debt: 0,
        debtFightsRemaining: 0,
        archetypeId: 'gladiator',
        lettersWritten: []
      };
      
      // Add meta fields
      data.meta = {
        ...DEFAULT_META,
        ...data.meta,
        letterStamps: 0,
        unlockedArchetypes: ['gladiator'],
        lifetimeStats: { ...DEFAULT_LIFETIME_STATS },
        letterCounts: {},
        unlockedLetterRewards: [],
        purchasedStampRewards: []
      };
      
      // Preserve existing letters if they were strings
      if (Array.isArray(data.run.lettersWritten)) {
        const oldLetters = data.run.lettersWritten as unknown as string[];
        if (oldLetters.length > 0 && typeof oldLetters[0] === 'string') {
          data.run.lettersWritten = [];
        }
      }
      
      data.version = 2;
    }
    
    // Apply merged defaults and save
    this.data = this.mergeWithDefaults(data);
    this.data.version = SAVE_VERSION;
    this.save();
  }

  /**
   * Save all data to localStorage
   */
  save(): boolean {
    try {
      this.data.lastSaved = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Start autosave interval
   */
  startAutoSave(intervalMs: number = 30000): void {
    this.stopAutoSave();
    if (this.data.settings.autoSave) {
      this.autoSaveInterval = window.setInterval(() => {
        this.save();
      }, intervalMs);
    }
  }

  /**
   * Stop autosave interval
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval !== null) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Settings accessors
  getSettings(): GameSettings {
    return { ...this.data.settings };
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }

  // Run state accessors
  getRun(): RunState {
    return { ...this.data.run };
  }

  updateRun(run: Partial<RunState>): void {
    this.data.run = { ...this.data.run, ...run };
    this.save();
  }

  hasActiveRun(): boolean {
    return this.data.run.inProgress && this.data.run.fighter !== null;
  }

  startNewRun(seed?: number, archetypeId: string = 'gladiator'): void {
    this.data.run = {
      ...DEFAULT_RUN,
      seed: seed ?? Math.floor(Math.random() * 2147483647),
      archetypeId,
      inProgress: true
    };
    this.data.meta.totalRuns++;
    this.save();
  }

  endRun(won: boolean): void {
    if (won) {
      this.data.meta.totalWins++;
    } else {
      this.data.meta.totalDeaths++;
    }
    
    // Update highest streak
    if (this.data.run.consecutiveWins > this.data.meta.lifetimeStats.highestStreak) {
      this.data.meta.lifetimeStats.highestStreak = this.data.run.consecutiveWins;
    }
    
    this.data.run.inProgress = false;
    this.save();
  }

  // Meta progression accessors
  getMeta(): MetaProgression {
    return { ...this.data.meta };
  }

  updateMeta(meta: Partial<MetaProgression>): void {
    this.data.meta = { ...this.data.meta, ...meta };
    this.save();
  }

  // Lifetime stats
  updateLifetimeStat(stat: keyof LifetimeStats, value: number): void {
    this.data.meta.lifetimeStats[stat] += value;
    this.save();
  }

  getLifetimeStats(): LifetimeStats {
    return { ...this.data.meta.lifetimeStats };
  }

  addPromoterXP(amount: number): void {
    this.data.meta.promoterXP += amount;
    const newLevel = Math.floor(this.data.meta.promoterXP / 100) + 1;
    if (newLevel > this.data.meta.promoterLevel) {
      this.data.meta.promoterLevel = newLevel;
      this.data.meta.bloodlinePoints += newLevel;
    }
    this.save();
  }

  addBloodlinePoints(amount: number): void {
    this.data.meta.bloodlinePoints += amount;
    this.save();
  }

  spendBloodlinePoints(amount: number): boolean {
    if (this.data.meta.bloodlinePoints >= amount) {
      this.data.meta.bloodlinePoints -= amount;
      this.save();
      return true;
    }
    return false;
  }

  // Letter stamps
  addLetterStamps(amount: number): void {
    this.data.meta.letterStamps += amount;
    this.save();
  }

  spendLetterStamps(amount: number): boolean {
    if (this.data.meta.letterStamps >= amount) {
      this.data.meta.letterStamps -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getLetterStamps(): number {
    return this.data.meta.letterStamps;
  }

  // Letter tracking
  incrementLetterCount(letterType: string): void {
    this.data.meta.letterCounts[letterType] = 
      (this.data.meta.letterCounts[letterType] || 0) + 1;
    this.save();
  }

  getLetterCount(letterType: string): number {
    return this.data.meta.letterCounts[letterType] || 0;
  }

  unlockLetterReward(rewardId: string): void {
    if (!this.data.meta.unlockedLetterRewards.includes(rewardId)) {
      this.data.meta.unlockedLetterRewards.push(rewardId);
      this.save();
    }
  }

  hasLetterReward(rewardId: string): boolean {
    return this.data.meta.unlockedLetterRewards.includes(rewardId);
  }

  // Relics
  addRelic(relicId: string): void {
    if (!this.data.run.relics.includes(relicId)) {
      this.data.run.relics.push(relicId);
      this.data.run.fightsSinceRelic = 0;
      this.data.run.relicPityCounter = 0;
      this.save();
    }
  }

  getRelics(): string[] {
    return [...this.data.run.relics];
  }

  incrementRelicPity(): void {
    this.data.run.relicPityCounter++;
    this.data.run.fightsSinceRelic++;
    this.save();
  }

  // Archetypes
  unlockArchetype(archetypeId: string): void {
    if (!this.data.meta.unlockedArchetypes.includes(archetypeId)) {
      this.data.meta.unlockedArchetypes.push(archetypeId);
      this.save();
    }
  }

  isArchetypeUnlocked(archetypeId: string): boolean {
    return this.data.meta.unlockedArchetypes.includes(archetypeId);
  }

  getUnlockedArchetypes(): string[] {
    return [...this.data.meta.unlockedArchetypes];
  }

  unlockPerk(perkId: string): void {
    if (!this.data.meta.unlockedPerks.includes(perkId)) {
      this.data.meta.unlockedPerks.push(perkId);
      this.save();
    }
  }

  hasPerk(perkId: string): boolean {
    return this.data.meta.unlockedPerks.includes(perkId);
  }

  addToHallOfLegends(entry: LegendEntry): void {
    this.data.meta.hallOfLegends.push(entry);
    this.save();
  }

  getHallOfLegends(): LegendEntry[] {
    return [...this.data.meta.hallOfLegends];
  }

  addHeirloom(item: HeirloomItem): void {
    this.data.meta.heirlooms.push(item);
    this.save();
  }

  getHeirlooms(): HeirloomItem[] {
    return [...this.data.meta.heirlooms];
  }

  addGhostMoment(moment: GhostMoment): void {
    this.data.meta.ghostMoments.push(moment);
    this.save();
  }

  getUntriggeredGhostMoments(): GhostMoment[] {
    return this.data.meta.ghostMoments.filter(m => !m.triggered);
  }

  triggerGhostMoment(fighterId: string, type: string): void {
    const moment = this.data.meta.ghostMoments.find(
      m => m.fighterId === fighterId && m.type === type && !m.triggered
    );
    if (moment) {
      moment.triggered = true;
      this.save();
    }
  }

  // Debt management
  addDebt(amount: number, fights: number): void {
    this.data.run.debt += amount;
    this.data.run.debtFightsRemaining = Math.max(
      this.data.run.debtFightsRemaining,
      fights
    );
    this.save();
  }

  collectDebt(): number {
    if (this.data.run.debt > 0 && this.data.run.debtFightsRemaining > 0) {
      const collection = Math.ceil(this.data.run.debt / this.data.run.debtFightsRemaining);
      this.data.run.debt -= collection;
      this.data.run.debtFightsRemaining--;
      this.save();
      return collection;
    }
    return 0;
  }

  /**
   * Complete save reset (with confirmation)
   */
  resetAllData(): void {
    this.data = this.getDefaultData();
    this.save();
    console.log('All save data has been reset');
  }

  /**
   * Export save data as JSON string
   */
  exportSave(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import save data from JSON string
   */
  importSave(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as SaveData;
      // Migrate if needed
      if (imported.version !== SAVE_VERSION) {
        this.migrate(imported);
      } else {
        this.data = this.mergeWithDefaults(imported);
      }
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  /**
   * Get save version for debugging
   */
  getSaveVersion(): number {
    return this.data.version;
  }
}

// Export singleton instance
export const SaveSystem = new SaveSystemClass();
