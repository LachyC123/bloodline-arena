/**
 * SaveSystem - Handles all game persistence via localStorage
 * Includes autosave, run data, meta progression, and settings
 */

import { Fighter, FighterStatus } from './FighterSystem';
import { LegendEntry } from './LegacySystem';

// Save data structure
export interface GameSettings {
  reduceMotion: boolean;
  screenShake: boolean;
  bloodFX: boolean;
  grainFX: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
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
  promise: string | null;
  rivalId: string | null;
  friendId: string | null;
  completedVignettes: string[];
  lettersWritten: string[];
  lastCampAction: string | null;
  inProgress: boolean;
}

export interface MetaProgression {
  promoterXP: number;
  promoterLevel: number;
  bloodlinePoints: number;
  unlockedPerks: string[];
  hallOfLegends: LegendEntry[];
  heirlooms: HeirloomItem[];
  totalRuns: number;
  totalWins: number;
  totalDeaths: number;
  ghostMoments: GhostMoment[];
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
const SAVE_VERSION = 1;

// Default values
const DEFAULT_SETTINGS: GameSettings = {
  reduceMotion: false,
  screenShake: true,
  bloodFX: true,
  grainFX: true,
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8
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
  promise: null,
  rivalId: null,
  friendId: null,
  completedVignettes: [],
  lettersWritten: [],
  lastCampAction: null,
  inProgress: false
};

const DEFAULT_META: MetaProgression = {
  promoterXP: 0,
  promoterLevel: 1,
  bloodlinePoints: 0,
  unlockedPerks: [],
  hallOfLegends: [],
  heirlooms: [],
  totalRuns: 0,
  totalWins: 0,
  totalDeaths: 0,
  ghostMoments: []
};

class SaveSystemClass {
  private data: SaveData;
  private autoSaveInterval: number | null = null;

  constructor() {
    this.data = this.getDefaultData();
    this.load();
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
      run: { ...DEFAULT_RUN, ...saved.run },
      meta: { ...DEFAULT_META, ...saved.meta },
      lastSaved: saved.lastSaved || Date.now()
    };
  }

  /**
   * Handle save data migration between versions
   */
  private migrate(oldData: SaveData): void {
    console.log(`Migrating save from version ${oldData.version} to ${SAVE_VERSION}`);
    // Future migration logic would go here
    this.data = this.mergeWithDefaults(oldData);
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
      console.log('Game saved');
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
    this.autoSaveInterval = window.setInterval(() => {
      this.save();
    }, intervalMs);
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

  startNewRun(seed?: number): void {
    this.data.run = {
      ...DEFAULT_RUN,
      seed: seed ?? Math.floor(Math.random() * 2147483647),
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

  addPromoterXP(amount: number): void {
    this.data.meta.promoterXP += amount;
    // Level up every 100 XP
    const newLevel = Math.floor(this.data.meta.promoterXP / 100) + 1;
    if (newLevel > this.data.meta.promoterLevel) {
      this.data.meta.promoterLevel = newLevel;
      this.data.meta.bloodlinePoints += newLevel; // Bonus points on level up
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
      this.data = this.mergeWithDefaults(imported);
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}

// Export singleton instance
export const SaveSystem = new SaveSystemClass();
