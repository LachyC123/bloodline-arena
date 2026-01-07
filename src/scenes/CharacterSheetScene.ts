/**
 * CharacterSheetScene - Detailed character stats view
 * Shows all fighter stats, derived values, injuries, techniques, and run history
 */

import Phaser from 'phaser';
import { SaveSystem, TrainingHistoryEntry, FightHistoryEntry } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { PortraitRenderer } from '../ui/PortraitRenderer';
import { 
  getSafeArea, 
  getContentArea, 
  anchorBottom, 
  MIN_TOUCH_SIZE,
  TouchButton
} from '../ui/Layout';
import { 
  calculateLoadoutStats, 
  getItemName 
} from '../systems/InventorySystem';
import { getTechnique, TECHNIQUES } from '../data/TrainingData';
import { STANCES, StanceType } from '../data/IntensityMechanics';

type StatsTab = 'stats' | 'techniques' | 'history';

export class CharacterSheetScene extends Phaser.Scene {
  private fighter!: Fighter;
  private currentTab: StatsTab = 'stats';
  
  constructor() {
    super({ key: 'CharacterSheetScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('CampScene');
      return;
    }
    
    this.fighter = run.fighter;
    
    this.createBackground();
    this.createHeader();
    this.createPortrait();
    this.createTabs();
    this.createContent();
    this.createBackButton();
    
    this.cameras.main.fadeIn(200);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1510, 0x1a1510, 0x0a0805, 0x0a0805);
    bg.fillRect(0, 0, width, height);
    
    // Decorative corners
    bg.lineStyle(1, 0x3a2a1a, 0.5);
    bg.strokeRect(10, 10, width - 20, height - 20);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    this.add.text(width / 2, safe.top + 15, 'CHARACTER SHEET', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
  }

  private createPortrait(): void {
    const safe = getSafeArea();
    const portraitSize = 70;
    const x = safe.left + portraitSize / 2 + 20;
    const y = safe.top + 70;
    
    // Portrait
    const portrait = PortraitRenderer.renderPortrait(
      this, this.fighter.portrait, x, y, portraitSize
    );
    
    // Fighter info
    this.add.text(x + portraitSize / 2 + 15, y - 20, this.fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    });
    
    this.add.text(x + portraitSize / 2 + 15, y, `"${this.fighter.nickname}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      fontStyle: 'italic'
    });
    
    const run = SaveSystem.getRun();
    this.add.text(x + portraitSize / 2 + 15, y + 18, 
      `${run.league.toUpperCase()} League | Week ${run.week + 1}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a'
    });
    
    // Record
    this.add.text(x + portraitSize / 2 + 15, y + 35, 
      `Wins: ${this.fighter.wins} | Streak: ${run.consecutiveWins}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#6b8e23'
    });
  }

  private createTabs(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const tabY = safe.top + 125;
    
    const tabs: { id: StatsTab; label: string }[] = [
      { id: 'stats', label: 'Stats' },
      { id: 'techniques', label: 'Techniques' },
      { id: 'history', label: 'History' }
    ];
    
    const tabWidth = (width - safe.left - safe.right) / tabs.length;
    
    tabs.forEach((tab, i) => {
      const x = safe.left + tabWidth * i + tabWidth / 2;
      const isActive = tab.id === this.currentTab;
      
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x3a2a1a : 0x1a1510, 1);
      tabBg.fillRect(safe.left + tabWidth * i, tabY, tabWidth, 30);
      if (isActive) {
        tabBg.lineStyle(2, 0xc9a959, 1);
        tabBg.strokeRect(safe.left + tabWidth * i, tabY, tabWidth, 30);
      }
      
      this.add.text(x, tabY + 15, tab.label, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: isActive ? '#c9a959' : '#5a4a3a'
      }).setOrigin(0.5);
      
      const hitArea = this.add.rectangle(x, tabY + 15, tabWidth, 30);
      hitArea.setInteractive();
      hitArea.on('pointerdown', () => {
        this.currentTab = tab.id;
        this.scene.restart();
      });
    });
  }

  private createContent(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const contentY = safe.top + 165;
    const contentHeight = height - contentY - 80;
    
    switch (this.currentTab) {
      case 'stats':
        this.createStatsContent(safe.left + 10, contentY, width - safe.left - safe.right - 20, contentHeight);
        break;
      case 'techniques':
        this.createTechniquesContent(safe.left + 10, contentY, width - safe.left - safe.right - 20, contentHeight);
        break;
      case 'history':
        this.createHistoryContent(safe.left + 10, contentY, width - safe.left - safe.right - 20, contentHeight);
        break;
    }
  }

  private createStatsContent(x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.6);
    bg.fillRoundedRect(0, 0, w, h, 5);
    container.add(bg);
    
    const run = SaveSystem.getRun();
    const inventory = SaveSystem.getInventory();
    const loadout = SaveSystem.getLoadout();
    const loadoutStats = calculateLoadoutStats(inventory, loadout);
    
    let yPos = 15;
    const lineHeight = 18;
    const col1 = 15;
    const col2 = w / 2 + 10;
    
    const addHeader = (text: string) => {
      container.add(this.add.text(col1, yPos, text, {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
      }));
      yPos += lineHeight + 5;
    };
    
    const addStat = (label: string, value: string | number, column: number = col1, color: string = '#8b7355') => {
      container.add(this.add.text(column, yPos, `${label}: ${value}`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color
      }));
    };
    
    const addStatRow = (left: { label: string; value: string | number }, right?: { label: string; value: string | number }) => {
      addStat(left.label, left.value, col1);
      if (right) addStat(right.label, right.value, col2);
      yPos += lineHeight;
    };
    
    // Core Stats section
    addHeader('📊 CORE STATS');
    
    const stats = this.fighter.currentStats;
    const baseStats = this.fighter.baseStats;
    
    addStatRow(
      { label: 'HP', value: `${stats.currentHP}/${stats.maxHP}` },
      { label: 'Stamina', value: `${stats.currentStamina}/${stats.maxStamina}` }
    );
    addStatRow(
      { label: 'Focus', value: `${stats.maxFocus}` },
      { label: 'Speed', value: `${stats.speed}` }
    );
    
    yPos += 5;
    addHeader('⚔️ OFFENSE');
    
    addStatRow(
      { label: 'Attack', value: `${stats.attack}` },
      { label: 'Weapon DMG', value: `${loadoutStats.damageMin}-${loadoutStats.damageMax}` }
    );
    addStatRow(
      { label: 'Accuracy', value: `${stats.accuracy}%` },
      { label: 'Crit Chance', value: `${stats.critChance}%` }
    );
    addStatRow(
      { label: 'Crit Damage', value: `${stats.critDamage}%` }
    );
    
    yPos += 5;
    addHeader('🛡️ DEFENSE');
    
    addStatRow(
      { label: 'Defense', value: `${stats.defense + loadoutStats.totalDefense}` },
      { label: 'Dodge', value: `${loadoutStats.dodgeMod >= 0 ? '+' : ''}${loadoutStats.dodgeMod}%` }
    );
    
    if (loadoutStats.bleedResist > 0 || loadoutStats.stunResist > 0) {
      addStatRow(
        { label: 'Bleed Resist', value: `${loadoutStats.bleedResist}%` },
        { label: 'Stun Resist', value: `${loadoutStats.stunResist}%` }
      );
    }
    
    // Status
    yPos += 5;
    addHeader('📋 STATUS');
    
    const fatigue = SaveSystem.getFatigue();
    const fatigueColor = fatigue > 70 ? '#8b0000' : fatigue > 40 ? '#daa520' : '#6b8e23';
    container.add(this.add.text(col1, yPos, `Fatigue: ${fatigue}%`, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: fatigueColor
    }));
    
    container.add(this.add.text(col2, yPos, `Trust: ${this.fighter.trust}%`, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: this.fighter.trust > 70 ? '#6b8e23' : '#8b7355'
    }));
    yPos += lineHeight;
    
    // Injuries
    if (this.fighter.injuries.length > 0) {
      yPos += 5;
      addHeader('🩹 INJURIES');
      this.fighter.injuries.forEach(injury => {
        container.add(this.add.text(col1, yPos, `• ${injury.name}`, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#8b0000'
        }));
        yPos += lineHeight;
      });
    }
    
    // Stance
    yPos += 5;
    const currentStance = SaveSystem.getStance();
    const stance = STANCES[currentStance];
    container.add(this.add.text(col1, yPos, `Current Stance: ${stance.icon} ${stance.name}`, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c9a959'
    }));
  }

  private createTechniquesContent(x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.6);
    bg.fillRoundedRect(0, 0, w, h, 5);
    container.add(bg);
    
    const techniques = SaveSystem.getTechniques();
    const techniqueIds = Object.keys(techniques);
    
    let yPos = 15;
    
    container.add(this.add.text(w / 2, yPos, 'LEARNED TECHNIQUES', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
    }).setOrigin(0.5, 0));
    yPos += 30;
    
    if (techniqueIds.length === 0) {
      container.add(this.add.text(w / 2, yPos + 30, 'No techniques learned yet.\nTrain to unlock techniques!', {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#5a4a3a', align: 'center'
      }).setOrigin(0.5, 0));
    } else {
      techniqueIds.forEach(techId => {
        const level = techniques[techId];
        const tech = getTechnique(techId);
        if (!tech) return;
        
        // Technique card
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x2a1f1a, 1);
        cardBg.fillRoundedRect(10, yPos, w - 20, 55, 5);
        cardBg.lineStyle(1, 0x5a4a3a, 1);
        cardBg.strokeRoundedRect(10, yPos, w - 20, 55, 5);
        container.add(cardBg);
        
        // Icon and name
        container.add(this.add.text(25, yPos + 10, `${tech.icon} ${tech.name}`, {
          fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
        }));
        
        // Level
        container.add(this.add.text(w - 25, yPos + 10, `Lv.${level}/${tech.maxLevel}`, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#6b8e23'
        }).setOrigin(1, 0));
        
        // Description
        container.add(this.add.text(25, yPos + 30, tech.description, {
          fontFamily: 'Georgia, serif', fontSize: '9px', color: '#5a4a3a',
          wordWrap: { width: w - 50 }
        }));
        
        yPos += 65;
      });
    }
    
    // Show available techniques to unlock
    yPos += 20;
    container.add(this.add.text(15, yPos, 'Available to Learn:', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#8b7355'
    }));
    yPos += 20;
    
    const unlearned = TECHNIQUES.filter(t => !techniques[t.id]);
    unlearned.slice(0, 3).forEach(tech => {
      container.add(this.add.text(25, yPos, `${tech.icon} ${tech.name} - Train to unlock`, {
        fontFamily: 'Georgia, serif', fontSize: '9px', color: '#4a3a2a'
      }));
      yPos += 16;
    });
  }

  private createHistoryContent(x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.6);
    bg.fillRoundedRect(0, 0, w, h, 5);
    container.add(bg);
    
    let yPos = 15;
    
    // Last fight result
    const lastFight = SaveSystem.getLastFightResult();
    container.add(this.add.text(w / 2, yPos, 'LAST FIGHT', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
    }).setOrigin(0.5, 0));
    yPos += 25;
    
    if (lastFight) {
      const resultColor = lastFight.result === 'win' ? '#6b8e23' : '#8b0000';
      container.add(this.add.text(15, yPos, `vs ${lastFight.enemyName} (${lastFight.enemyClass})`, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8b7355'
      }));
      yPos += 18;
      
      container.add(this.add.text(15, yPos, lastFight.result.toUpperCase(), {
        fontFamily: 'Georgia, serif', fontSize: '14px', color: resultColor
      }));
      yPos += 20;
      
      container.add(this.add.text(15, yPos, `Damage Dealt: ${lastFight.damageDealt} | Taken: ${lastFight.damageTaken}`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
      }));
      yPos += 18;
      
      if (lastFight.result === 'win') {
        container.add(this.add.text(15, yPos, `Earned: ${lastFight.goldEarned}💰 ${lastFight.fameEarned}⭐`, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c9a959'
        }));
        yPos += 18;
      }
    } else {
      container.add(this.add.text(w / 2, yPos, 'No fights yet', {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
      }).setOrigin(0.5, 0));
      yPos += 25;
    }
    
    // Last training
    yPos += 15;
    container.add(this.add.text(w / 2, yPos, 'LAST TRAINING', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
    }).setOrigin(0.5, 0));
    yPos += 25;
    
    const lastTraining = SaveSystem.getLastTraining();
    if (lastTraining) {
      container.add(this.add.text(15, yPos, lastTraining.programName, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8b7355'
      }));
      yPos += 20;
      
      // Stat changes
      const changes = Object.entries(lastTraining.statChanges);
      changes.forEach(([stat, value]) => {
        const color = value > 0 ? '#6b8e23' : '#8b0000';
        const sign = value > 0 ? '+' : '';
        container.add(this.add.text(25, yPos, `${stat}: ${sign}${value}`, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color
        }));
        yPos += 16;
      });
      
      if (lastTraining.techniqueUnlocked) {
        container.add(this.add.text(15, yPos, `Technique: ${lastTraining.techniqueUnlocked} (Lv.${lastTraining.techniqueLevel})`, {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c9a959'
        }));
        yPos += 18;
      }
    } else {
      container.add(this.add.text(w / 2, yPos, 'No training yet', {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
      }).setOrigin(0.5, 0));
    }
    
    // Training history
    yPos += 20;
    const trainingHistory = SaveSystem.getTrainingHistory();
    if (trainingHistory.length > 1) {
      container.add(this.add.text(15, yPos, 'Previous Sessions:', {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
      }));
      yPos += 18;
      
      trainingHistory.slice(-3).reverse().forEach(entry => {
        if (entry === lastTraining) return;
        container.add(this.add.text(25, yPos, `• ${entry.programName}`, {
          fontFamily: 'Georgia, serif', fontSize: '9px', color: '#4a3a2a'
        }));
        yPos += 14;
      });
    }
  }

  private createBackButton(): void {
    const { width } = this.cameras.main;
    
    new TouchButton(
      this,
      width / 2,
      anchorBottom(this, 35),
      '← BACK TO CAMP',
      () => {
        this.cameras.main.fadeOut(200);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CampScene');
        });
      },
      { width: 180, height: 44, fontSize: 13 }
    );
  }
}
