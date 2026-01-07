/**
 * CampScene - Main hub between fights
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, healInjuries, restoreFighter, getVoiceLine } from '../systems/FighterSystem';
import { getGhostMoment, getGhostMomentText } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';

export class CampScene extends Phaser.Scene {
  private fighter!: Fighter;
  private gold!: number;
  private week!: number;
  private league!: string;
  
  constructor() {
    super({ key: 'CampScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.fighter = run.fighter;
    this.gold = run.gold;
    this.week = run.week;
    this.league = run.league;
    
    this.createBackground();
    this.createHeader();
    this.createFighterPanel();
    this.createActionButtons();
    this.createProgressBar();
    
    // Check for ghost moments
    this.checkGhostMoments();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.08);
      overlay.setDisplaySize(width, height);
    }
    
    // Camp atmosphere
    this.add.text(width / 2, height - 20, '🔥 Camp', {
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    // Week display
    this.add.text(20, 20, `Week ${this.week + 1}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    });
    
    // League display
    const leagueColors: Record<string, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      champion: '#ff4500'
    };
    this.add.text(20, 42, `${this.league.toUpperCase()} LEAGUE`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: leagueColors[this.league] || '#8b7355'
    });
    
    // Gold display
    this.add.text(width - 20, 20, `💰 ${this.gold}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    // Fame display
    this.add.text(width - 20, 42, `⭐ ${run.fame}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(1, 0);
  }

  private createFighterPanel(): void {
    const { width } = this.cameras.main;
    const panelY = 80;
    
    // Fighter portrait
    const portrait = PortraitRenderer.renderPortrait(this, this.fighter.portrait, width / 2, panelY + 60, 100);
    
    // Injury indicator on portrait
    if (this.fighter.injuries.length > 0) {
      const injuryBadge = this.add.text(width / 2 + 45, panelY + 15, '🩹', {
        fontSize: '20px'
      });
    }
    
    // Fighter name
    this.add.text(width / 2, panelY + 120, this.fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Status
    const statusColor = this.fighter.status === 'healthy' ? '#6b8e23' : 
                        this.fighter.status === 'injured' ? '#daa520' : '#8b0000';
    this.add.text(width / 2, panelY + 142, this.fighter.status.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: statusColor
    }).setOrigin(0.5);
    
    // Stats bar
    const stats = this.fighter.currentStats;
    const statsY = panelY + 165;
    
    // HP bar
    this.createStatBar(width / 2, statsY, 'HP', stats.currentHP, stats.maxHP, 0x8b0000);
    
    // Stamina bar
    this.createStatBar(width / 2, statsY + 25, 'STA', stats.currentStamina, stats.maxStamina, 0x228b22);
    
    // Trust meter
    const trustY = statsY + 55;
    this.add.text(width / 2 - 80, trustY, 'Trust:', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    });
    
    const trustBar = this.add.graphics();
    trustBar.fillStyle(0x2a1f1a, 1);
    trustBar.fillRoundedRect(width / 2 - 30, trustY - 2, 100, 14, 4);
    trustBar.fillStyle(0x4169e1, 1);
    trustBar.fillRoundedRect(width / 2 - 30, trustY - 2, this.fighter.trust, 14, 4);
    
    this.add.text(width / 2 + 75, trustY, this.fighter.trustLevel, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    });
    
    // Keepsake display
    const keepsakeY = trustY + 30;
    this.add.text(width / 2, keepsakeY, `📿 ${this.fighter.keepsake.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Signature trait
    this.add.text(width / 2, keepsakeY + 20, `✨ ${this.fighter.signatureTrait.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    
    // Voice line based on situation
    const voiceLine = this.getContextualVoiceLine();
    if (voiceLine) {
      this.add.text(width / 2, keepsakeY + 50, voiceLine, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#8b7355',
        fontStyle: 'italic',
        wordWrap: { width: 280 },
        align: 'center'
      }).setOrigin(0.5);
    }
  }

  private createStatBar(x: number, y: number, label: string, current: number, max: number, color: number): void {
    const barWidth = 160;
    const barHeight = 16;
    
    this.add.text(x - barWidth / 2 - 35, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    });
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x - barWidth / 2, y - 2, barWidth, barHeight, 4);
    
    const fill = this.add.graphics();
    fill.fillStyle(color, 1);
    fill.fillRoundedRect(x - barWidth / 2, y - 2, (current / max) * barWidth, barHeight, 4);
    
    this.add.text(x, y + 5, `${current}/${max}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  private createActionButtons(): void {
    const { width, height } = this.cameras.main;
    const startY = 420;
    const spacing = 55;
    
    // Train button
    UIHelper.createButton(this, width / 2, startY, '⚔️ TRAIN', () => this.doTrain(), {
      width: 200, height: 45
    });
    
    // Shop button
    UIHelper.createButton(this, width / 2, startY + spacing, '🛒 SHOP', () => this.goToShop(), {
      width: 200, height: 45
    });
    
    // Rest button
    UIHelper.createButton(this, width / 2, startY + spacing * 2, '🛏️ REST', () => this.doRest(), {
      width: 200, height: 45
    });
    
    // Write letter button
    UIHelper.createButton(this, width / 2, startY + spacing * 3, '✉️ WRITE LETTER', () => this.writeLetter(), {
      width: 200, height: 45
    });
    
    // Fight button (primary action)
    UIHelper.createButton(this, width / 2, startY + spacing * 4 + 15, '🗡️ ENTER ARENA', () => this.enterArena(), {
      width: 220, height: 55, primary: true
    });
  }

  private createProgressBar(): void {
    const { width, height } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    const progressY = height - 50;
    const barWidth = width - 60;
    
    // Progress label
    this.add.text(30, progressY - 15, `${run.fightsInLeague}/${run.fightsToNextLeague} to next league`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a'
    });
    
    // Progress bar
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(30, progressY, barWidth, 10, 3);
    
    const fill = this.add.graphics();
    fill.fillStyle(0xc9a959, 1);
    fill.fillRoundedRect(30, progressY, (run.fightsInLeague / run.fightsToNextLeague) * barWidth, 10, 3);
  }

  private getContextualVoiceLine(): string {
    if (this.fighter.injuries.length > 0) {
      return getVoiceLine(this.fighter, 'taking_damage');
    }
    if (this.fighter.trust < 30) {
      return getVoiceLine(this.fighter, 'idle');
    }
    return getVoiceLine(this.fighter, 'rest');
  }

  private doTrain(): void {
    // Improve stats slightly
    this.fighter.currentStats.attack += 1;
    this.fighter.currentStats.accuracy += 2;
    addTrust(this.fighter, 2);
    
    this.week++;
    SaveSystem.updateRun({ 
      fighter: this.fighter, 
      week: this.week,
      lastCampAction: 'train'
    });
    
    UIHelper.showNotification(this, 'Training complete! +1 ATK, +2 ACC');
    this.refreshScene();
  }

  private goToShop(): void {
    SaveSystem.updateRun({ lastCampAction: 'shop' });
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ShopScene');
    });
  }

  private doRest(): void {
    // Restore HP and Stamina
    restoreFighter(this.fighter);
    healInjuries(this.fighter, 1);
    addTrust(this.fighter, 5);
    
    this.week++;
    SaveSystem.updateRun({ 
      fighter: this.fighter, 
      week: this.week,
      lastCampAction: 'rest'
    });
    
    UIHelper.showNotification(this, 'Rested well! HP and Stamina restored, +5 Trust');
    this.refreshScene();
  }

  private writeLetter(): void {
    SaveSystem.updateRun({ lastCampAction: 'letter' });
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('VignetteScene', { type: 'letter' });
    });
  }

  private enterArena(): void {
    // Restore fighter for combat
    restoreFighter(this.fighter);
    SaveSystem.updateRun({ 
      fighter: this.fighter,
      lastCampAction: 'fight'
    });
    
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('FightScene');
    });
  }

  private checkGhostMoments(): void {
    const ghost = getGhostMoment('camp');
    if (ghost) {
      const text = getGhostMomentText(ghost);
      this.time.delayedCall(1000, () => {
        UIHelper.showNotification(this, text, 4000);
      });
    }
  }

  private refreshScene(): void {
    this.cameras.main.fadeOut(150);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart();
    });
  }
}
