/**
 * SaveSystem - Handles all game persistence via localStorage
 * Includes autosave, run data, meta progression, settings, and migration
 */

import { Fighter, FighterStatus } from './FighterSystem';
import { LegendEntry } from './LegacySystem';
import { WrittenLetter } from '../data/LettersData';
import { Relic } from '../data/RelicsData';
import { ItemInstance, Loadout, DEFAULT_LOADOUT, getStarterItems, getDefaultLoadout } from './InventorySystem';
import { StanceType } from '../data/IntensityMechanics';
import { Wound } from '../data/IntensityMechanics';
import { EnemyClassId } from '../data/EnemyClassData';

// Current save version - increment when adding breaking changes
const SAVE_VERSION = 7;

// Save data structure
// Training history entry for stat delta display
export interface TrainingHistoryEntry {
  programId: string;
  programName: string;
  timestamp: number;
  statChanges: Record<string, number>;
  techniqueUnlocked?: string;
  techniqueLevel?: number;
}

// Fight history entry
export interface FightHistoryEntry {
  enemyName: string;
  enemyClass: string;
  result: 'win' | 'loss';
  damageDealt: number;
  damageTaken: number;
  goldEarned: number;
  fameEarned: number;
  timestamp: number;
}

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
  debugMode: boolean;
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
  
  // Relics for this run
  relics: string[];  // Relic IDs
  relicPityCounter: number;
  
  // Run modifiers (daily oath) - legacy
  activeModifiers: string[];
  
  // Arena Decrees (v6) - stackable run modifiers
  activeDecreeIds: string[];
  decreeDraftCompleted: boolean;  // Has player done initial decree draft?
  seenDecreeIds: string[];  // Track which decrees player has seen (for "new" badge)
  
  // Seen affixes/mutators (v6) - for "new" badge
  seenAffixIds: string[];
  seenMutatorIds: string[];
  
  // Milestone tracking
  fightsSinceRelic: number;
  consecutiveWins: number;
  
  // Debt system (from patron letters)
  debt: number;
  debtFightsRemaining: number;
  
  // Training system
  fatigue: number;  // 0-100
  techniques: Record<string, number>;  // technique ID -> level
  sparringInjuries: string[];  // temporary training injuries
  
  // Seals (letter currency for this run)
  seals: number;
  savedLetters: string[];  // Letter IDs that can be read before fights
  
  // Embers (v7 - forge currency earned from fights)
  embers: number;
  
  // Weapon Mastery (v7)
  masteryPoints: number;  // Unspent mastery points
  weaponMastery: Record<string, string[]>;  // weaponType -> unlocked node IDs
  
  // Signature Move (v7)
  signatureId: string | null;
  signatureLevel: number;
  signatureXP: number;
  
  // Run Map (v7)
  runMap: any | null;  // RunMap type, using any to avoid circular imports
  
  // Contracts (v7)
  activeContracts: string[];  // Contract IDs for current fight
  completedContracts: string[];  // Contract IDs completed this run
  
  // Inventory system (v4)
  inventory: ItemInstance[];
  loadout: Loadout;
  
  // Intensity mechanics (v4)
  currentMomentum: number;
  currentStance: StanceType;
  activeWounds: Wound[];
  armorBreakStacks: number;
  adrenalineUsed: boolean;
  
  // Enemy tracking (v4)
  seenEnemyClasses: EnemyClassId[];
  
  // Training history for stat delta display
  trainingHistory: TrainingHistoryEntry[];
  lastFightResult: FightHistoryEntry | null;
  
  // Customization (v5)
  customization: {
    philosophyId: string | null;
    backgroundId: string | null;
    startingTechniqueId: string | null;
    cosmetics: {
      firstName: string;
      lastName: string;
      nickname: string;
      faceIndex: number;
      eyeIndex: number;
      hairIndex: number;
      beardIndex: number;
      scarIndex: number;
      warpaintIndex: number;
      hoodIndex: number;
      skinTone: string;
      hairColor: string;
      eyeColor: string;
      accentColor: string;
    };
  };
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
  autoSave: true,
  debugMode: false
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
  // v6 decree/affix/mutator tracking
  activeDecreeIds: [],
  decreeDraftCompleted: false,
  seenDecreeIds: [],
  seenAffixIds: [],
  seenMutatorIds: [],
  fightsSinceRelic: 0,
  consecutiveWins: 0,
  debt: 0,
  debtFightsRemaining: 0,
  fatigue: 0,
  techniques: {},
  sparringInjuries: [],
  seals: 0,
  savedLetters: [],
  embers: 0,  // v7 forge currency
  masteryPoints: 0,  // v7 weapon mastery
  weaponMastery: {},  // v7 unlocked skill nodes per weapon type
  signatureId: null,  // v7 signature move
  signatureLevel: 1,
  signatureXP: 0,
  runMap: null,  // v7 branching path
  activeContracts: [],  // v7 fight contracts
  completedContracts: [],  // v7 completed contracts
  // New v4 fields
  inventory: [],
  loadout: { ...DEFAULT_LOADOUT },
  currentMomentum: 0,
  currentStance: 'balanced',
  activeWounds: [],
  armorBreakStacks: 0,
  adrenalineUsed: false,
  seenEnemyClasses: [],
  trainingHistory: [],
  lastFightResult: null,
  // New v5 fields - customization
  customization: {
    philosophyId: null,
    backgroundId: null,
    startingTechniqueId: null,
    cosmetics: {
      firstName: '',
      lastName: '',
      nickname: '',
      faceIndex: 0,
      eyeIndex: 0,
      hairIndex: 0,
      beardIndex: 0,
      scarIndex: 0,
      warpaintIndex: 0,
      hoodIndex: 0,
      skinTone: '#d4a574',
      hairColor: '#3d2314',
      eyeColor: '#5a4a3a',
      accentColor: '#8b0000'
    }
  }
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
        activeModifiers: saved.run?.activeModifiers || [],
        sparringInjuries: saved.run?.sparringInjuries || [],
        savedLetters: saved.run?.savedLetters || [],
        inventory: saved.run?.inventory || [],
        activeWounds: saved.run?.activeWounds || [],
        seenEnemyClasses: saved.run?.seenEnemyClasses || [],
        trainingHistory: saved.run?.trainingHistory || [],
        // Ensure objects exist
        techniques: saved.run?.techniques || {},
        loadout: saved.run?.loadout || { ...DEFAULT_LOADOUT },
        // Ensure numbers exist
        fatigue: saved.run?.fatigue || 0,
        seals: saved.run?.seals || 0,
        currentMomentum: saved.run?.currentMomentum || 0,
        armorBreakStacks: saved.run?.armorBreakStacks || 0,
        // Ensure other types
        currentStance: saved.run?.currentStance || 'balanced',
        adrenalineUsed: saved.run?.adrenalineUsed || false,
        lastFightResult: saved.run?.lastFightResult || null
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
    
    // Version 2 -> 3: Add training system and seals
    if (data.version === 2) {
      console.log('Migrating v2 -> v3: Adding training system and seals');
      
      data.run = {
        ...data.run,
        fatigue: 0,
        techniques: {},
        sparringInjuries: [],
        seals: 0,
        savedLetters: []
      };
      
      data.version = 3;
    }
    
    // Version 3 -> 4: Add inventory, loadout, intensity mechanics
    if (data.version === 3) {
      console.log('Migrating v3 -> v4: Adding inventory, loadout, intensity mechanics');
      
      // Give starter items to existing runs
      const starterItems = data.run.inProgress ? getStarterItems() : [];
      const defaultLoadout = starterItems.length > 0 ? getDefaultLoadout(starterItems) : { ...DEFAULT_LOADOUT };
      
      data.run = {
        ...data.run,
        inventory: starterItems,
        loadout: defaultLoadout,
        currentMomentum: 0,
        currentStance: 'balanced' as StanceType,
        activeWounds: [],
        armorBreakStacks: 0,
        adrenalineUsed: false,
        seenEnemyClasses: [],
        trainingHistory: [],
        lastFightResult: null
      };
      
      data.version = 4;
    }
    
    // Version 4 -> 5: Add customization system
    if (data.version === 4) {
      console.log('Migrating v4 -> v5: Adding customization system');
      
      // Add default customization to existing runs
      data.run = {
        ...data.run,
        customization: {
          philosophyId: null,
          backgroundId: null,
          startingTechniqueId: null,
          cosmetics: {
            firstName: data.run.fighter?.firstName || '',
            lastName: data.run.fighter?.lastName || '',
            nickname: data.run.fighter?.nickname || '',
            faceIndex: data.run.fighter?.portrait?.baseIndex || 0,
            eyeIndex: data.run.fighter?.portrait?.eyeIndex || 0,
            hairIndex: data.run.fighter?.portrait?.hairIndex || 0,
            beardIndex: data.run.fighter?.portrait?.beardIndex || 0,
            scarIndex: data.run.fighter?.portrait?.scarIndex || 0,
            warpaintIndex: 0,
            hoodIndex: 0,
            skinTone: data.run.fighter?.portrait?.skinTone || '#d4a574',
            hairColor: data.run.fighter?.portrait?.hairColor || '#3d2314',
            eyeColor: '#5a4a3a',
            accentColor: '#8b0000'
          }
        }
      };
      
      data.version = 5;
    }
    
    // Version 5 -> 6: Add affixes, decrees, mutators tracking
    if (data.version === 5) {
      console.log('Migrating v5 -> v6: Adding affixes, decrees, mutators tracking');
      
      data.run = {
        ...data.run,
        activeDecreeIds: [],
        decreeDraftCompleted: false,
        seenDecreeIds: [],
        seenAffixIds: [],
        seenMutatorIds: []
      };
      
      data.version = 6;
    }
    
    // Version 6 -> 7: Add forge system, weapon mastery, signatures, run map, contracts
    if (data.version === 6) {
      console.log('Migrating v6 -> v7: Adding forge, mastery, signatures, run map, contracts');
      
      data.run = {
        ...data.run,
        embers: 0,
        masteryPoints: 0,
        weaponMastery: {},
        signatureId: null,
        signatureLevel: 1,
        signatureXP: 0,
        runMap: null,
        activeContracts: [],
        completedContracts: []
      };
      
      data.version = 7;
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
    const starterItems = getStarterItems();
    this.data.run = {
      ...DEFAULT_RUN,
      seed: seed ?? Math.floor(Math.random() * 2147483647),
      archetypeId,
      inProgress: true,
      inventory: starterItems,
      loadout: getDefaultLoadout(starterItems)
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

  // Training system helpers
  addFatigue(amount: number): void {
    this.data.run.fatigue = Math.min(100, Math.max(0, this.data.run.fatigue + amount));
    this.save();
  }

  reduceFatigue(amount: number): void {
    this.data.run.fatigue = Math.max(0, this.data.run.fatigue - amount);
    this.save();
  }

  getFatigue(): number {
    return this.data.run.fatigue;
  }

  setTechniqueLevel(techniqueId: string, level: number): void {
    this.data.run.techniques[techniqueId] = level;
    this.save();
  }

  getTechniqueLevel(techniqueId: string): number {
    return this.data.run.techniques[techniqueId] || 0;
  }

  getTechniques(): Record<string, number> {
    return { ...this.data.run.techniques };
  }

  addSparringInjury(injuryId: string): void {
    if (!this.data.run.sparringInjuries.includes(injuryId)) {
      this.data.run.sparringInjuries.push(injuryId);
      this.save();
    }
  }

  clearSparringInjuries(): void {
    this.data.run.sparringInjuries = [];
    this.save();
  }

  getSparringInjuries(): string[] {
    return [...this.data.run.sparringInjuries];
  }

  // Seals system
  addSeals(amount: number): void {
    this.data.run.seals += amount;
    this.save();
  }

  spendSeals(amount: number): boolean {
    if (this.data.run.seals >= amount) {
      this.data.run.seals -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getSeals(): number {
    return this.data.run.seals;
  }

  // Saved letters for pre-fight buffs
  saveLetter(letterId: string): void {
    if (!this.data.run.savedLetters.includes(letterId)) {
      this.data.run.savedLetters.push(letterId);
      this.save();
    }
  }

  useSavedLetter(letterId: string): boolean {
    const index = this.data.run.savedLetters.indexOf(letterId);
    if (index > -1) {
      this.data.run.savedLetters.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  getSavedLetters(): string[] {
    return [...this.data.run.savedLetters];
  }

  // Inventory system helpers
  getInventory(): ItemInstance[] {
    return [...this.data.run.inventory];
  }

  addItem(item: ItemInstance): void {
    // Check for stackable consumables
    if (item.itemType === 'consumable') {
      const existing = this.data.run.inventory.find(
        i => i.itemId === item.itemId && i.itemType === 'consumable'
      );
      if (existing) {
        existing.quantity += item.quantity;
        this.save();
        return;
      }
    }
    this.data.run.inventory.push(item);
    this.save();
  }

  removeItem(instanceId: string): boolean {
    const index = this.data.run.inventory.findIndex(i => i.instanceId === instanceId);
    if (index > -1) {
      this.data.run.inventory.splice(index, 1);
      // Also remove from loadout if equipped
      this.unequipItem(instanceId);
      this.save();
      return true;
    }
    return false;
  }

  updateItemQuantity(instanceId: string, quantity: number): void {
    const item = this.data.run.inventory.find(i => i.instanceId === instanceId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(instanceId);
      } else {
        this.save();
      }
    }
  }
  
  /**
   * Update an entire item (including affixes) by instanceId
   */
  updateItem(updatedItem: ItemInstance): void {
    const idx = this.data.run.inventory.findIndex(i => i.instanceId === updatedItem.instanceId);
    if (idx >= 0) {
      this.data.run.inventory[idx] = { ...updatedItem };
      this.save();
      console.log('[SaveSystem] Updated item:', updatedItem.instanceId);
    }
  }

  // Loadout helpers
  getLoadout(): Loadout {
    return { ...this.data.run.loadout };
  }

  equipItem(instanceId: string, slot: keyof Loadout): void {
    this.data.run.loadout[slot] = instanceId;
    this.save();
  }

  unequipItem(instanceId: string): void {
    const loadout = this.data.run.loadout;
    for (const slot of Object.keys(loadout) as (keyof Loadout)[]) {
      if (loadout[slot] === instanceId) {
        loadout[slot] = null;
      }
    }
    this.save();
  }

  setLoadout(loadout: Loadout): void {
    this.data.run.loadout = { ...loadout };
    this.save();
  }

  // Intensity mechanics helpers
  getMomentum(): number {
    return this.data.run.currentMomentum;
  }

  setMomentum(value: number): void {
    this.data.run.currentMomentum = Math.max(0, Math.min(100, value));
    this.save();
  }

  addMomentum(amount: number): void {
    this.setMomentum(this.data.run.currentMomentum + amount);
  }

  getStance(): StanceType {
    return this.data.run.currentStance;
  }

  setStance(stance: StanceType): void {
    this.data.run.currentStance = stance;
    this.save();
  }

  getWounds(): Wound[] {
    return [...this.data.run.activeWounds];
  }

  addWound(wound: Wound): void {
    this.data.run.activeWounds.push(wound);
    this.save();
  }

  clearWounds(): void {
    this.data.run.activeWounds = [];
    this.save();
  }

  getArmorBreakStacks(): number {
    return this.data.run.armorBreakStacks;
  }

  setArmorBreakStacks(stacks: number): void {
    this.data.run.armorBreakStacks = Math.max(0, Math.min(10, stacks));
    this.save();
  }

  isAdrenalineUsed(): boolean {
    return this.data.run.adrenalineUsed;
  }

  useAdrenaline(): void {
    this.data.run.adrenalineUsed = true;
    this.save();
  }

  resetAdrenaline(): void {
    this.data.run.adrenalineUsed = false;
    this.save();
  }

  // Enemy tracking
  markEnemyClassSeen(classId: EnemyClassId): void {
    if (!this.data.run.seenEnemyClasses.includes(classId)) {
      this.data.run.seenEnemyClasses.push(classId);
      this.save();
    }
  }

  hasSeenEnemyClass(classId: EnemyClassId): boolean {
    return this.data.run.seenEnemyClasses.includes(classId);
  }

  getSeenEnemyClasses(): EnemyClassId[] {
    return [...this.data.run.seenEnemyClasses];
  }

  // Training history
  addTrainingHistory(entry: TrainingHistoryEntry): void {
    this.data.run.trainingHistory.push(entry);
    // Keep only last 10 entries
    if (this.data.run.trainingHistory.length > 10) {
      this.data.run.trainingHistory.shift();
    }
    this.save();
  }

  getTrainingHistory(): TrainingHistoryEntry[] {
    return [...this.data.run.trainingHistory];
  }

  getLastTraining(): TrainingHistoryEntry | null {
    const history = this.data.run.trainingHistory;
    return history.length > 0 ? history[history.length - 1] : null;
  }

  // Fight history
  setLastFightResult(result: FightHistoryEntry): void {
    this.data.run.lastFightResult = result;
    this.save();
  }

  getLastFightResult(): FightHistoryEntry | null {
    return this.data.run.lastFightResult;
  }

  // Reset combat state for new fight
  resetCombatState(): void {
    this.data.run.currentMomentum = 0;
    this.data.run.armorBreakStacks = 0;
    this.data.run.activeWounds = [];
    this.data.run.adrenalineUsed = false;
    this.save();
  }

  // Initialize inventory for new run
  initializeStarterInventory(): void {
    const starterItems = getStarterItems();
    this.data.run.inventory = starterItems;
    this.data.run.loadout = getDefaultLoadout(starterItems);
    this.save();
  }

  // ========== CUSTOMIZATION ==========
  
  getCustomization(): RunState['customization'] {
    return { ...this.data.run.customization };
  }

  setCustomization(customization: Partial<RunState['customization']>): void {
    this.data.run.customization = {
      ...this.data.run.customization,
      ...customization,
      cosmetics: {
        ...this.data.run.customization.cosmetics,
        ...(customization.cosmetics || {})
      }
    };
    this.save();
  }

  setPhilosophy(philosophyId: string | null): void {
    this.data.run.customization.philosophyId = philosophyId;
    this.save();
  }

  setBackground(backgroundId: string | null): void {
    this.data.run.customization.backgroundId = backgroundId;
    this.save();
  }

  setStartingTechnique(techniqueId: string | null): void {
    this.data.run.customization.startingTechniqueId = techniqueId;
    this.save();
  }

  setCosmetics(cosmetics: Partial<RunState['customization']['cosmetics']>): void {
    this.data.run.customization.cosmetics = {
      ...this.data.run.customization.cosmetics,
      ...cosmetics
    };
    this.save();
  }

  getCosmetics(): RunState['customization']['cosmetics'] {
    return { ...this.data.run.customization.cosmetics };
  }

  // Apply customization to fighter on run start
  applyCustomizationToFighter(): void {
    const fighter = this.data.run.fighter;
    if (!fighter) return;

    const customization = this.data.run.customization;
    const cosmetics = customization.cosmetics;

    // Apply name changes
    if (cosmetics.firstName) fighter.firstName = cosmetics.firstName;
    if (cosmetics.lastName) fighter.lastName = cosmetics.lastName;
    if (cosmetics.nickname) fighter.nickname = cosmetics.nickname;
    fighter.fullName = `${fighter.firstName} ${fighter.lastName}`;

    // Apply portrait changes
    fighter.portrait = {
      ...fighter.portrait,
      baseIndex: cosmetics.faceIndex,
      eyeIndex: cosmetics.eyeIndex,
      hairIndex: cosmetics.hairIndex,
      beardIndex: cosmetics.beardIndex,
      scarIndex: cosmetics.scarIndex,
      skinTone: cosmetics.skinTone,
      hairColor: cosmetics.hairColor
    };

    this.save();
  }

  // ========== DECREES ==========
  
  getActiveDecrees(): string[] {
    return [...(this.data.run.activeDecreeIds || [])];
  }
  
  addDecree(decreeId: string): void {
    if (!this.data.run.activeDecreeIds) {
      this.data.run.activeDecreeIds = [];
    }
    if (!this.data.run.activeDecreeIds.includes(decreeId)) {
      this.data.run.activeDecreeIds.push(decreeId);
    }
    this.markDecreeSeen(decreeId);
    this.save();
  }
  
  removeDecree(decreeId: string): void {
    if (this.data.run.activeDecreeIds) {
      this.data.run.activeDecreeIds = this.data.run.activeDecreeIds.filter(id => id !== decreeId);
      this.save();
    }
  }
  
  isDecreeDraftCompleted(): boolean {
    return this.data.run.decreeDraftCompleted || false;
  }
  
  completeDecreeDraft(): void {
    this.data.run.decreeDraftCompleted = true;
    this.save();
  }
  
  markDecreeSeen(decreeId: string): void {
    if (!this.data.run.seenDecreeIds) {
      this.data.run.seenDecreeIds = [];
    }
    if (!this.data.run.seenDecreeIds.includes(decreeId)) {
      this.data.run.seenDecreeIds.push(decreeId);
    }
  }
  
  isDecreeNew(decreeId: string): boolean {
    return !(this.data.run.seenDecreeIds || []).includes(decreeId);
  }
  
  // ========== AFFIX/MUTATOR TRACKING ==========
  
  markAffixSeen(affixId: string): void {
    if (!this.data.run.seenAffixIds) {
      this.data.run.seenAffixIds = [];
    }
    if (!this.data.run.seenAffixIds.includes(affixId)) {
      this.data.run.seenAffixIds.push(affixId);
    }
  }
  
  isAffixNew(affixId: string): boolean {
    return !(this.data.run.seenAffixIds || []).includes(affixId);
  }
  
  markMutatorSeen(mutatorId: string): void {
    if (!this.data.run.seenMutatorIds) {
      this.data.run.seenMutatorIds = [];
    }
    if (!this.data.run.seenMutatorIds.includes(mutatorId)) {
      this.data.run.seenMutatorIds.push(mutatorId);
    }
  }
  
  isMutatorNew(mutatorId: string): boolean {
    return !(this.data.run.seenMutatorIds || []).includes(mutatorId);
  }
}

// Export singleton instance
export const SaveSystem = new SaveSystemClass();
