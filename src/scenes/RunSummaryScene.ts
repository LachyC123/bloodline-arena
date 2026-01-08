/**
 * RunSummaryScene - End-of-run summary card
 * Shows stats, achievements, and allows starting new run
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { calculatePower } from '../systems/PowerScore';
import { getItemName } from '../systems/InventorySystem';
import { getDecreeById } from '../data/decrees';
import { getSignatureById, getSignatureLevel } from '../data/signatures';
import { UIHelper } from '../ui/UIHelper';

interface RunSummaryData {
  won: boolean;
  leagueReached: string;
  peakPower: number;
  fightsWon: number;
  fightsTotal: number;
  goldEarned: number;
  contractsCompleted: number;
  signatureLevel: number;
  causeOfDeath?: string;
  equippedGear: string[];
  activeDecrees: string[];
  buildTitle: string;
}

export class RunSummaryScene extends Phaser.Scene {
  private summaryData!: RunSummaryData;
  
  constructor() {
    super({ key: 'RunSummaryScene' });
  }
  
  init(data: { won: boolean; causeOfDeath?: string }): void {
    const run = SaveSystem.getRun();
    const fighter = run.fighter;
    
    // Generate summary from run state
    this.summaryData = {
      won: data.won,
      leagueReached: run.league,
      peakPower: fighter ? calculatePower(fighter, run.inventory || [], run.loadout).power : 0,
      fightsWon: run.week,
      fightsTotal: run.week + (data.won ? 0 : 1),
      goldEarned: run.gold,
      contractsCompleted: run.completedContracts?.length || 0,
      signatureLevel: run.signatureLevel || 1,
      causeOfDeath: data.causeOfDeath,
      equippedGear: this.getEquippedGearNames(run),
      activeDecrees: run.activeDecreeIds || [],
      buildTitle: this.generateBuildTitle(run)
    };
  }
  
  create(): void {
    this.createBackground();
    this.createSummaryCard();
    this.createButtons();
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      this.summaryData.won ? 0x1a2a1a : 0x2a1a1a,
      this.summaryData.won ? 0x1a2a1a : 0x2a1a1a,
      this.summaryData.won ? 0x2a3a2a : 0x3a2a2a,
      this.summaryData.won ? 0x2a3a2a : 0x3a2a2a
    );
    bg.fillRect(0, 0, width, height);
  }
  
  private createSummaryCard(): void {
    const { width, height } = this.cameras.main;
    const data = this.summaryData;
    
    // Title
    const titleText = data.won ? '🏆 VICTORY 🏆' : '💀 FALLEN 💀';
    const titleColor = data.won ? '#ffd700' : '#8b0000';
    
    this.add.text(width / 2, 40, titleText, {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Build title
    this.add.text(width / 2, 75, `"${data.buildTitle}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Main stats card
    const cardX = 20;
    const cardY = 100;
    const cardW = width - 40;
    const cardH = height - 220;
    
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x1a1410, 0.9);
    cardBg.fillRoundedRect(cardX, cardY, cardW, cardH, 10);
    cardBg.lineStyle(2, data.won ? 0x4a6a4a : 0x6a4a4a, 1);
    cardBg.strokeRoundedRect(cardX, cardY, cardW, cardH, 10);
    
    let y = cardY + 20;
    const leftX = cardX + 20;
    const rightX = cardX + cardW - 20;
    
    // League reached
    const leagueIcons: Record<string, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      champion: '👑'
    };
    
    this.add.text(leftX, y, 'League Reached:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    
    this.add.text(rightX, y, `${leagueIcons[data.leagueReached] || ''} ${data.leagueReached.toUpperCase()}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    y += 30;
    
    // Peak Power
    this.add.text(leftX, y, 'Peak Power:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    
    this.add.text(rightX, y, `⚡ ${data.peakPower}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#ffd700'
    }).setOrigin(1, 0);
    
    y += 30;
    
    // Fights
    this.add.text(leftX, y, 'Fights Won:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    
    this.add.text(rightX, y, `${data.fightsWon}/${data.fightsTotal}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    y += 30;
    
    // Contracts
    this.add.text(leftX, y, 'Contracts Completed:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    
    this.add.text(rightX, y, `${data.contractsCompleted}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    y += 30;
    
    // Gold
    this.add.text(leftX, y, 'Gold Earned:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    
    this.add.text(rightX, y, `💰 ${data.goldEarned}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#ffd700'
    }).setOrigin(1, 0);
    
    y += 40;
    
    // Equipped gear
    this.add.text(leftX, y, 'Final Loadout:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    });
    
    y += 20;
    
    data.equippedGear.slice(0, 3).forEach(gear => {
      this.add.text(leftX + 10, y, `• ${gear}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355'
      });
      y += 16;
    });
    
    y += 10;
    
    // Active decrees
    if (data.activeDecrees.length > 0) {
      this.add.text(leftX, y, 'Active Decrees:', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#c9a959'
      });
      
      y += 20;
      
      data.activeDecrees.forEach(decreeId => {
        const decree = getDecreeById(decreeId);
        if (decree) {
          this.add.text(leftX + 10, y, `${decree.icon} ${decree.name}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '10px',
            color: '#8b7355'
          });
          y += 16;
        }
      });
    }
    
    // Cause of death (if applicable)
    if (!data.won && data.causeOfDeath) {
      y = cardY + cardH - 40;
      
      this.add.text(width / 2, y, `Cause of Death: ${data.causeOfDeath}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#8b0000',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
  }
  
  private createButtons(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 80,
      '⚔️ NEW RUN',
      () => this.startNewRun(),
      { width: 200, height: 50, fontSize: '18px', primary: true }
    );
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 30,
      '← MAIN MENU',
      () => this.returnToMenu(),
      { width: 180, height: 40 }
    );
  }
  
  private startNewRun(): void {
    // Clear run data and start fresh
    SaveSystem.endRun(this.summaryData.won);
    
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RecruitScene');
    });
  }
  
  private returnToMenu(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
  
  private getEquippedGearNames(run: any): string[] {
    const names: string[] = [];
    const inventory = run.inventory || [];
    const loadout = run.loadout;
    
    if (loadout?.weaponId) {
      const weapon = inventory.find((i: any) => i.instanceId === loadout.weaponId);
      if (weapon) names.push(getItemName(weapon));
    }
    
    if (loadout?.armorId) {
      const armor = inventory.find((i: any) => i.instanceId === loadout.armorId);
      if (armor) names.push(getItemName(armor));
    }
    
    if (loadout?.helmetId) {
      const helmet = inventory.find((i: any) => i.instanceId === loadout.helmetId);
      if (helmet) names.push(getItemName(helmet));
    }
    
    return names;
  }
  
  private generateBuildTitle(run: any): string {
    const titles: string[] = [];
    
    // Based on league
    const leagueTitles: Record<string, string[]> = {
      bronze: ['Novice', 'Newcomer', 'Hopeful'],
      silver: ['Contender', 'Rising Star', 'Warrior'],
      gold: ['Champion', 'Legend', 'Master'],
      champion: ['Immortal', 'Godslayer', 'Undefeated']
    };
    
    const league = run.league || 'bronze';
    const leagueTitle = leagueTitles[league][Math.floor(Math.random() * leagueTitles[league].length)];
    
    // Based on fighting style (could analyze training/techniques)
    const styleTitles = ['Blade', 'Shield', 'Shadow', 'Storm', 'Iron', 'Blood'];
    const styleTitle = styleTitles[Math.floor(Math.random() * styleTitles.length)];
    
    return `The ${styleTitle} ${leagueTitle}`;
  }
}
