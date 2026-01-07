/**
 * CampScene - Main hub with animated diorama and interactive action cards
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, healInjuries, restoreFighter, getVoiceLine } from '../systems/FighterSystem';
import { getGhostMoment, getGhostMomentText } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';
import { ActionCard, ActionCardConfig } from '../ui/ActionCard';

export class CampScene extends Phaser.Scene {
  private fighter!: Fighter;
  private gold!: number;
  private week!: number;
  private league!: string;
  
  // Diorama elements
  private fighterSprite?: Phaser.GameObjects.Container;
  private campfireGlow?: Phaser.GameObjects.Graphics;
  private bannerCloth?: Phaser.GameObjects.Graphics;
  
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
    this.createCampDiorama();
    this.createHeader();
    this.createFighterDisplay();
    this.createActionCards();
    this.createProgressBar();
    
    // Check for ghost moments
    this.checkGhostMoments();
    
    // Check for relic opportunity
    this.checkRelicOpportunity();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Night sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0812, 0x0a0812, 0x1a1820, 0x1a1820);
    bg.fillRect(0, 0, width, height);
    
    // Stars
    for (let i = 0; i < 30; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Math.random() * 0.5 + 0.2);
      star.fillCircle(Math.random() * width, Math.random() * height * 0.4, 1);
      
      // Twinkle
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 0.8 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Ground
    bg.fillStyle(0x2a2520, 1);
    bg.fillRect(0, height * 0.65, width, height * 0.35);
    
    // Distant mountains silhouette
    bg.fillStyle(0x1a1515, 1);
    bg.beginPath();
    bg.moveTo(0, height * 0.5);
    bg.lineTo(80, height * 0.35);
    bg.lineTo(150, height * 0.45);
    bg.lineTo(250, height * 0.3);
    bg.lineTo(320, height * 0.42);
    bg.lineTo(width, height * 0.38);
    bg.lineTo(width, height * 0.65);
    bg.lineTo(0, height * 0.65);
    bg.closePath();
    bg.fillPath();
  }

  private createCampDiorama(): void {
    const { width, height } = this.cameras.main;
    
    // Tent
    const tent = this.add.graphics();
    tent.fillStyle(0x4a3a2a, 1);
    tent.beginPath();
    tent.moveTo(width * 0.15, height * 0.65);
    tent.lineTo(width * 0.25, height * 0.45);
    tent.lineTo(width * 0.35, height * 0.65);
    tent.closePath();
    tent.fillPath();
    tent.lineStyle(2, 0x3a2a1a, 1);
    tent.strokePath();
    
    // Tent opening
    tent.fillStyle(0x1a1410, 1);
    tent.fillTriangle(
      width * 0.22, height * 0.65,
      width * 0.25, height * 0.52,
      width * 0.28, height * 0.65
    );
    
    // Campfire (base)
    const fireBase = this.add.graphics();
    fireBase.fillStyle(0x3a2a1a, 1);
    fireBase.fillEllipse(width * 0.55, height * 0.68, 40, 15);
    
    // Campfire glow
    this.campfireGlow = this.add.graphics();
    this.animateCampfire();
    
    // Banner/flag
    this.createAnimatedBanner(width * 0.75, height * 0.35);
    
    // Smoke particles
    this.createSmokeEffect(width * 0.55, height * 0.58);
    
    // Crates and supplies
    this.add.graphics()
      .fillStyle(0x5a4a3a, 1)
      .fillRect(width * 0.8, height * 0.58, 30, 25)
      .fillRect(width * 0.82, height * 0.53, 25, 20);
    
    // Weapon rack silhouette
    const rack = this.add.graphics();
    rack.lineStyle(3, 0x3a2a1a, 1);
    rack.moveTo(width * 0.1, height * 0.65);
    rack.lineTo(width * 0.1, height * 0.5);
    rack.moveTo(width * 0.08, height * 0.52);
    rack.lineTo(width * 0.12, height * 0.52);
    rack.strokePath();
  }

  private animateCampfire(): void {
    const { width, height } = this.cameras.main;
    const centerX = width * 0.55;
    const centerY = height * 0.62;
    
    // Pulsing fire glow
    const drawFire = (intensity: number) => {
      this.campfireGlow?.clear();
      
      // Outer glow
      this.campfireGlow?.fillStyle(0xff6600, 0.1 * intensity);
      this.campfireGlow?.fillCircle(centerX, centerY, 60 * intensity);
      
      // Middle glow
      this.campfireGlow?.fillStyle(0xff9900, 0.15 * intensity);
      this.campfireGlow?.fillCircle(centerX, centerY, 40 * intensity);
      
      // Core
      this.campfireGlow?.fillStyle(0xffcc00, 0.3 * intensity);
      this.campfireGlow?.fillCircle(centerX, centerY - 5, 15);
    };
    
    this.tweens.add({
      targets: { intensity: 1 },
      intensity: 1.2,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const val = tween.getValue();
        if (typeof val === 'number') {
          drawFire(val);
        }
      }
    });
    
    drawFire(1);
  }

  private createAnimatedBanner(x: number, y: number): void {
    // Pole
    const pole = this.add.graphics();
    pole.fillStyle(0x4a3a2a, 1);
    pole.fillRect(x - 3, y, 6, 150);
    
    // Banner cloth (animated)
    this.bannerCloth = this.add.graphics();
    
    const drawBanner = (wave: number) => {
      this.bannerCloth?.clear();
      this.bannerCloth?.fillStyle(0x8b0000, 1);
      
      this.bannerCloth?.beginPath();
      this.bannerCloth?.moveTo(x + 3, y + 10);
      
      // Wavy edge
      for (let i = 0; i < 60; i += 10) {
        const waveOffset = Math.sin((i + wave) * 0.1) * 5;
        this.bannerCloth?.lineTo(x + 50 + waveOffset, y + 10 + i);
      }
      
      this.bannerCloth?.lineTo(x + 45, y + 70);
      this.bannerCloth?.lineTo(x + 3, y + 70);
      this.bannerCloth?.closePath();
      this.bannerCloth?.fillPath();
      
      // Banner symbol
      this.bannerCloth?.fillStyle(0xc9a959, 1);
      this.bannerCloth?.fillCircle(x + 25, y + 40, 8);
    };
    
    this.tweens.add({
      targets: { wave: 0 },
      wave: 100,
      duration: 3000,
      repeat: -1,
      onUpdate: (tween) => {
        const val = tween.getValue();
        if (typeof val === 'number') {
          drawBanner(val);
        }
      }
    });
    
    drawBanner(0);
  }

  private createSmokeEffect(x: number, y: number): void {
    // Simple smoke particles
    this.time.addEvent({
      delay: 300,
      callback: () => {
        const smoke = this.add.graphics();
        smoke.fillStyle(0x888888, 0.3);
        smoke.fillCircle(0, 0, 5 + Math.random() * 5);
        smoke.setPosition(x + (Math.random() - 0.5) * 20, y);
        
        this.tweens.add({
          targets: smoke,
          y: y - 80,
          alpha: 0,
          scale: 2,
          duration: 2000,
          ease: 'Quad.out',
          onComplete: () => smoke.destroy()
        });
      },
      loop: true
    });
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
    
    // Relics display
    if (run.relics.length > 0) {
      this.add.text(width - 20, 62, `🔮 ${run.relics.length} Relics`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#9932cc'
      }).setOrigin(1, 0);
    }
  }

  private createFighterDisplay(): void {
    const { width, height } = this.cameras.main;
    
    // Fighter container (clickable)
    this.fighterSprite = this.add.container(width * 0.55, height * 0.45);
    
    // Portrait
    const portrait = PortraitRenderer.renderPortrait(
      this, this.fighter.portrait, 0, 0, 70
    );
    this.fighterSprite.add(portrait);
    
    // Injury indicator
    if (this.fighter.injuries.length > 0) {
      const injuryBadge = this.add.text(35, -35, '🩹', { fontSize: '16px' });
      this.fighterSprite.add(injuryBadge);
    }
    
    // Fighter reaction animation based on status
    this.animateFighter();
    
    // Name below
    this.add.text(width * 0.55, height * 0.55, this.fighter.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Status
    const statusColor = this.fighter.status === 'healthy' ? '#6b8e23' :
                        this.fighter.status === 'injured' ? '#daa520' : '#8b0000';
    this.add.text(width * 0.55, height * 0.58, this.fighter.status.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: statusColor
    }).setOrigin(0.5);
    
    // Voice line bubble
    const voiceLine = this.getContextualVoiceLine();
    if (voiceLine) {
      this.createSpeechBubble(width * 0.55, height * 0.35, voiceLine);
    }
    
    // Make fighter clickable for character sheet
    this.fighterSprite.setSize(80, 80);
    this.fighterSprite.setInteractive();
    this.fighterSprite.on('pointerdown', () => this.showCharacterSheet());
  }

  private animateFighter(): void {
    if (!this.fighterSprite) return;
    
    // Different animations based on state
    if (this.fighter.injuries.length > 0) {
      // Injured: slight limp/sway
      this.tweens.add({
        targets: this.fighterSprite,
        x: this.fighterSprite.x - 3,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (this.fighter.trust >= 70) {
      // High trust: confident stance
      this.tweens.add({
        targets: this.fighterSprite,
        y: this.fighterSprite.y - 3,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Default idle
      this.tweens.add({
        targets: this.fighterSprite,
        scaleX: 1.02,
        scaleY: 0.98,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createSpeechBubble(x: number, y: number, text: string): void {
    const bubble = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.9);
    bg.fillRoundedRect(-80, -25, 160, 40, 8);
    bg.lineStyle(1, 0xc9a959, 0.5);
    bg.strokeRoundedRect(-80, -25, 160, 40, 8);
    
    // Speech bubble tail
    bg.fillStyle(0x2a1f1a, 0.9);
    bg.fillTriangle(0, 15, -10, 25, 10, 25);
    
    const textObj = this.add.text(0, -5, `"${text}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      fontStyle: 'italic',
      wordWrap: { width: 150 },
      align: 'center'
    }).setOrigin(0.5);
    
    bubble.add([bg, textObj]);
    
    // Fade in
    bubble.setAlpha(0);
    this.tweens.add({
      targets: bubble,
      alpha: 1,
      duration: 500,
      delay: 500
    });
  }

  private createActionCards(): void {
    const { width, height } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    // Action cards grid
    const cardConfigs: ActionCardConfig[] = [
      {
        id: 'train',
        title: 'TRAIN',
        subtitle: 'Improve your skills',
        icon: '⚔️',
        benefit: '+ATK +ACC',
        description: 'Spend time honing combat skills. Gain +1 Attack and +2 Accuracy.'
      },
      {
        id: 'shop',
        title: 'SHOP',
        subtitle: 'Buy equipment',
        icon: '🛒',
        description: 'Browse weapons, armor, and supplies at the market.'
      },
      {
        id: 'rest',
        title: 'REST',
        subtitle: 'Recover strength',
        icon: '🛏️',
        benefit: '+HP +Trust',
        description: 'Rest and recover. Restore HP/Stamina, heal injuries, gain Trust.'
      },
      {
        id: 'letter',
        title: 'WRITE LETTER',
        subtitle: 'Send correspondence',
        icon: '✉️',
        benefit: 'Unique rewards',
        highlighted: true,
        description: 'Write to family, patrons, or rivals. Letters provide valuable bonuses!'
      }
    ];
    
    const startX = width * 0.25;
    const startY = height * 0.72;
    const cols = 2;
    const spacing = 170;
    
    cardConfigs.forEach((config, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacing;
      const y = startY + row * 75;
      
      new ActionCard(this, x, y, config, () => this.handleAction(config.id));
    });
    
    // Fight button (special, always visible)
    UIHelper.createButton(this, width / 2, height - 45,
      '🗡️ ENTER ARENA', () => this.enterArena(),
      { width: 200, height: 50, primary: true }
    );
  }

  private handleAction(actionId: string): void {
    switch (actionId) {
      case 'train':
        this.doTrain();
        break;
      case 'shop':
        this.goToShop();
        break;
      case 'rest':
        this.doRest();
        break;
      case 'letter':
        this.writeLetter();
        break;
    }
  }

  private createProgressBar(): void {
    const { width, height } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    const progressY = height - 95;
    const barWidth = width - 60;
    
    // Progress label
    this.add.text(30, progressY - 12,
      `${run.fightsInLeague}/${run.fightsToNextLeague} to next league`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a'
    });
    
    // Progress bar
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(30, progressY, barWidth, 8, 3);
    
    const fill = this.add.graphics();
    fill.fillStyle(0xc9a959, 1);
    fill.fillRoundedRect(30, progressY,
      (run.fightsInLeague / run.fightsToNextLeague) * barWidth, 8, 3);
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

  private showCharacterSheet(): void {
    // TODO: Implement character sheet panel slide-in
    UIHelper.showNotification(this, 'Character sheet coming soon!', 2000);
  }

  private doTrain(): void {
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
    restoreFighter(this.fighter);
    healInjuries(this.fighter, 1);
    addTrust(this.fighter, 5);
    
    this.week++;
    SaveSystem.updateRun({
      fighter: this.fighter,
      week: this.week,
      lastCampAction: 'rest'
    });
    
    UIHelper.showNotification(this, 'Rested well! +5 Trust, HP restored');
    this.refreshScene();
  }

  private writeLetter(): void {
    SaveSystem.updateRun({ lastCampAction: 'letter' });
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LetterScene');
    });
  }

  private enterArena(): void {
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

  private checkRelicOpportunity(): void {
    const run = SaveSystem.getRun();
    // Offer relic every 3 fights
    if (run.fightsSinceRelic >= 3 && run.consecutiveWins >= 2) {
      this.time.delayedCall(1500, () => {
        UIHelper.showConfirmDialog(this,
          'Relic Opportunity!',
          'A mysterious merchant offers you a choice of relics...',
          () => {
            this.scene.start('RelicChoiceScene');
          },
          () => {
            SaveSystem.updateRun({ fightsSinceRelic: 0 });
          },
          'VIEW RELICS'
        );
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
