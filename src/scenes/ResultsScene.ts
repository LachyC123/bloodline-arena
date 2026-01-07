/**
 * ResultsScene - Post-fight results screen
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, Injury } from '../systems/FighterSystem';
import { UIHelper } from '../ui/UIHelper';

interface ResultsData {
  won: boolean;
  rewards: { gold: number; fame: number; xp: number };
  injury: Injury | null;
  enemy: Fighter;
}

export class ResultsScene extends Phaser.Scene {
  private resultsData!: ResultsData;
  
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data: ResultsData): void {
    this.resultsData = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    this.createBackground();
    this.createResultsDisplay();
    this.createRewardsDisplay();
    this.createContinueButton();
    
    // Add trust for winning
    if (this.resultsData.won) {
      const run = SaveSystem.getRun();
      if (run.fighter) {
        addTrust(run.fighter, 5);
        SaveSystem.updateRun({ fighter: run.fighter });
      }
    }
    
    // Check for league advancement
    this.checkLeagueAdvancement();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
  }

  private createResultsDisplay(): void {
    const { width } = this.cameras.main;
    
    // Victory/Defeat banner
    const resultText = this.resultsData.won ? 'VICTORY!' : 'DEFEAT';
    const resultColor = this.resultsData.won ? '#c9a959' : '#8b0000';
    
    this.add.text(width / 2, 80, resultText, {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Enemy defeated
    if (this.resultsData.won) {
      this.add.text(width / 2, 130, `${this.resultsData.enemy.fullName} has fallen!`, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#8b7355',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
    
    // Injury notification
    if (this.resultsData.injury) {
      this.add.text(width / 2, 160, `⚠️ INJURY: ${this.resultsData.injury.name}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#8b4513'
      }).setOrigin(0.5);
      
      this.add.text(width / 2, 180, this.resultsData.injury.effect, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
    }
  }

  private createRewardsDisplay(): void {
    const { width } = this.cameras.main;
    const startY = 230;
    
    this.add.text(width / 2, startY, '═══ REWARDS ═══', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Gold
    const goldText = this.add.text(width / 2, startY + 40, `💰 ${this.resultsData.rewards.gold} Gold`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // Fame
    const fameText = this.add.text(width / 2, startY + 70, `⭐ ${this.resultsData.rewards.fame} Fame`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c0c0c0'
    }).setOrigin(0.5);
    
    // XP
    const xpText = this.add.text(width / 2, startY + 100, `📈 ${this.resultsData.rewards.xp} XP`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#8b7355'
    }).setOrigin(0.5);
    
    // Animate rewards appearing
    [goldText, fameText, xpText].forEach((text, i) => {
      text.setAlpha(0);
      this.tweens.add({
        targets: text,
        alpha: 1,
        y: text.y - 10,
        duration: 300,
        delay: 200 + i * 200,
        ease: 'Back.out'
      });
    });
  }

  private checkLeagueAdvancement(): void {
    const run = SaveSystem.getRun();
    const { width } = this.cameras.main;
    
    if (run.fightsInLeague >= run.fightsToNextLeague) {
      const nextLeague: Record<string, string> = {
        bronze: 'silver',
        silver: 'gold',
        gold: 'champion'
      };
      
      const newLeague = nextLeague[run.league];
      if (newLeague) {
        // Show league advancement
        this.time.delayedCall(1000, () => {
          const advanceText = this.add.text(width / 2, 400, `🏆 ADVANCED TO ${newLeague.toUpperCase()} LEAGUE!`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5).setAlpha(0);
          
          this.tweens.add({
            targets: advanceText,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.out'
          });
        });
        
        SaveSystem.updateRun({
          league: newLeague as any,
          fightsInLeague: 0,
          fightsToNextLeague: newLeague === 'champion' ? 1 : 3
        });
        
        // Add bloodline points for advancement
        SaveSystem.addBloodlinePoints(5);
        SaveSystem.addPromoterXP(25);
      }
    }
  }

  private createContinueButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 80,
      'CONTINUE',
      () => this.continue(),
      { width: 200, height: 50, primary: true }
    );
  }

  private continue(): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
