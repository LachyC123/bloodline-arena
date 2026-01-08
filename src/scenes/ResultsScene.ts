/**
 * ResultsScene - Post-fight results screen
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, Injury } from '../systems/FighterSystem';
import { UIHelper } from '../ui/UIHelper';
import { completeNode, cancelNode, getNodeById } from '../data/runMap';

interface ResultsData {
  won: boolean;
  rewards: { gold: number; fame: number; xp: number };
  injury: Injury | null;
  enemy: Fighter;
  nodeId?: string;  // The node that was fought
  encounterType?: 'fight' | 'elite' | 'champion' | 'rival';
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
    
    // Handle fight outcome for map progression
    this.resolveNodeOutcome();
    
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
  
  /**
   * Resolve the node outcome - ONLY here does a node get marked completed
   */
  private resolveNodeOutcome(): void {
    const run = SaveSystem.getRun();
    if (!run.runMap) {
      console.log('[Results] No run map, skipping node resolution');
      return;
    }
    
    // Get the node that was being attempted
    const nodeId = this.resultsData.nodeId || run.runMap.inProgressNodeId;
    
    if (!nodeId) {
      console.log('[Results] No node in progress, skipping node resolution');
      return;
    }
    
    console.log(`[Results] Resolving node ${nodeId}, won=${this.resultsData.won}`);
    
    if (this.resultsData.won) {
      // WIN: Mark node as completed and advance position
      completeNode(run.runMap, nodeId);
      console.log(`[Results] Node ${nodeId} marked as COMPLETED (victory)`);
      
      // Save the updated map state
      SaveSystem.updateRun({ runMap: run.runMap as any });
    } else {
      // LOSS: Cancel the in-progress node (will go to death scene anyway)
      cancelNode(run.runMap);
      console.log(`[Results] Node ${nodeId} cancelled (defeat)`);
      SaveSystem.updateRun({ runMap: run.runMap as any });
    }
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
  }

  private createResultsDisplay(): void {
    const { width } = this.cameras.main;
    
    // Victory/Defeat banner with animation
    const resultText = this.resultsData.won ? 'VICTORY!' : 'DEFEAT';
    const resultColor = this.resultsData.won ? '#c9a959' : '#8b0000';
    
    const banner = this.add.text(width / 2, 80, resultText, {
      fontFamily: 'Georgia, serif',
      fontSize: '40px',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);
    
    // Animate banner entrance
    banner.setScale(0);
    this.tweens.add({
      targets: banner,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Add victory crown/defeat skull
    if (this.resultsData.won) {
      const crown = this.add.text(width / 2, 35, '👑', {
        fontSize: '32px'
      }).setOrigin(0.5).setAlpha(0);
      
      this.tweens.add({
        targets: crown,
        alpha: 1,
        y: 40,
        duration: 300,
        delay: 300,
        ease: 'Back.easeOut'
      });
    } else {
      const skull = this.add.text(width / 2, 35, '💀', {
        fontSize: '32px'
      }).setOrigin(0.5).setAlpha(0);
      
      this.tweens.add({
        targets: skull,
        alpha: 1,
        y: 40,
        duration: 300,
        delay: 300
      });
    }
    
    // Enemy defeated
    if (this.resultsData.won) {
      const enemyText = this.add.text(width / 2, 130, `${this.resultsData.enemy.fullName} has fallen!`, {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: '#8b7355',
        fontStyle: 'italic'
      }).setOrigin(0.5).setAlpha(0);
      
      this.tweens.add({
        targets: enemyText,
        alpha: 1,
        duration: 300,
        delay: 500
      });
    }
    
    // Injury notification with warning style
    if (this.resultsData.injury) {
      const injuryContainer = this.add.container(width / 2, 175);
      
      // Background for injury
      const injuryBg = this.add.graphics();
      injuryBg.fillStyle(0x2a1a10, 0.8);
      injuryBg.fillRoundedRect(-120, -25, 240, 50, 8);
      injuryBg.lineStyle(2, 0x8b4513, 1);
      injuryBg.strokeRoundedRect(-120, -25, 240, 50, 8);
      injuryContainer.add(injuryBg);
      
      const injuryTitle = this.add.text(0, -10, `⚠️ ${this.resultsData.injury.name.toUpperCase()}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#cd5c5c'
      }).setOrigin(0.5);
      injuryContainer.add(injuryTitle);
      
      const injuryEffect = this.add.text(0, 10, this.resultsData.injury.effect, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355',
        wordWrap: { width: 200 }
      }).setOrigin(0.5);
      injuryContainer.add(injuryEffect);
      
      injuryContainer.setAlpha(0);
      this.tweens.add({
        targets: injuryContainer,
        alpha: 1,
        y: 170,
        duration: 300,
        delay: 700
      });
    }
  }

  private createRewardsDisplay(): void {
    const { width } = this.cameras.main;
    const startY = 230;
    
    // Section header with decorative line
    this.add.text(width / 2, startY, '═══ REWARDS ═══', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Gold with animated count-up
    const goldIcon = this.add.text(width / 2 - 70, startY + 45, '💰', {
      fontSize: '24px'
    }).setOrigin(0.5).setAlpha(0);
    
    const goldAmount = { value: 0 };
    const goldText = this.add.text(width / 2, startY + 45, '0 Gold', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#ffd700'
    }).setOrigin(0.5).setAlpha(0);
    
    // Fame
    const fameIcon = this.add.text(width / 2 - 60, startY + 90, '⭐', {
      fontSize: '20px'
    }).setOrigin(0.5).setAlpha(0);
    
    const fameText = this.add.text(width / 2, startY + 90, `+${this.resultsData.rewards.fame} Fame`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c0c0c0'
    }).setOrigin(0.5).setAlpha(0);
    
    // XP with progress feel
    const xpIcon = this.add.text(width / 2 - 55, startY + 130, '📈', {
      fontSize: '18px'
    }).setOrigin(0.5).setAlpha(0);
    
    const xpText = this.add.text(width / 2, startY + 130, `+${this.resultsData.rewards.xp} XP`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#8b7355'
    }).setOrigin(0.5).setAlpha(0);
    
    // Animate gold icon appearing with bounce
    this.tweens.add({
      targets: goldIcon,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 300,
      delay: 200,
      ease: 'Back.easeOut'
    });
    
    // Animate gold text appearing
    this.tweens.add({
      targets: goldText,
      alpha: 1,
      duration: 200,
      delay: 200
    });
    
    // Animated gold count-up
    this.tweens.add({
      targets: goldAmount,
      value: this.resultsData.rewards.gold,
      duration: 800,
      delay: 200,
      ease: 'Power1',
      onUpdate: () => {
        goldText.setText(`${Math.floor(goldAmount.value)} Gold`);
      },
      onComplete: () => {
        // Flash gold text on completion
        this.tweens.add({
          targets: goldText,
          scale: 1.2,
          duration: 100,
          yoyo: true
        });
      }
    });
    
    // Animate fame appearing
    this.tweens.add({
      targets: [fameIcon, fameText],
      alpha: 1,
      y: `-=10`,
      duration: 300,
      delay: 600,
      ease: 'Back.easeOut'
    });
    
    // Animate XP appearing
    this.tweens.add({
      targets: [xpIcon, xpText],
      alpha: 1,
      y: `-=10`,
      duration: 300,
      delay: 800,
      ease: 'Back.easeOut'
    });
    
    // Add sparkle effect on gold
    this.time.delayedCall(400, () => {
      this.createSparkle(width / 2 - 70, startY + 45);
    });
  }
  
  private createSparkle(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const sparkle = this.add.text(x, y, '✨', {
        fontSize: '12px'
      }).setOrigin(0.5);
      
      const angle = (Math.PI * 2 / 5) * i;
      const distance = 20 + Math.random() * 15;
      
      this.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
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
      // Return to run map after fight results
      this.scene.start('RunMapScene');
    });
  }
}
