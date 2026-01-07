/**
 * CampScene - Main hub with responsive layout and interactive action cards
 * Fixed for mobile with proper touch targets and no overlap
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, healInjuries, restoreFighter, getVoiceLine } from '../systems/FighterSystem';
import { getGhostMoment, getGhostMomentText } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';
import { 
  TouchButton, 
  VStack, 
  getSafeArea, 
  getContentArea, 
  anchorTop, 
  anchorBottom, 
  centerX,
  MIN_TOUCH_SIZE
} from '../ui/Layout';

export class CampScene extends Phaser.Scene {
  private fighter!: Fighter;
  private gold!: number;
  private week!: number;
  private league!: string;
  
  // Diorama elements
  private fighterSprite?: Phaser.GameObjects.Container;
  private campfireGlow?: Phaser.GameObjects.Graphics;
  
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
    this.createFighterDisplay();
    this.createActionButtons();
    this.createBottomBar();
    
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
    for (let i = 0; i < 20; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Math.random() * 0.4 + 0.1);
      star.fillCircle(Math.random() * width, Math.random() * height * 0.35, 1);
      
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.6 },
        duration: 1500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Ground
    bg.fillStyle(0x2a2520, 1);
    bg.fillRect(0, height * 0.6, width, height * 0.4);
    
    // Distant mountains
    bg.fillStyle(0x1a1515, 1);
    bg.beginPath();
    bg.moveTo(0, height * 0.45);
    bg.lineTo(width * 0.2, height * 0.32);
    bg.lineTo(width * 0.4, height * 0.42);
    bg.lineTo(width * 0.65, height * 0.28);
    bg.lineTo(width * 0.85, height * 0.38);
    bg.lineTo(width, height * 0.35);
    bg.lineTo(width, height * 0.6);
    bg.lineTo(0, height * 0.6);
    bg.closePath();
    bg.fillPath();
    
    // Campfire effect
    this.createCampfire(width * 0.5, height * 0.55);
  }
  
  private createCampfire(x: number, y: number): void {
    // Fire base
    const fireBase = this.add.graphics();
    fireBase.fillStyle(0x3a2a1a, 1);
    fireBase.fillEllipse(x, y + 15, 35, 12);
    
    // Animated fire glow
    this.campfireGlow = this.add.graphics();
    
    const drawFire = (intensity: number) => {
      if (!this.campfireGlow) return;
      this.campfireGlow.clear();
      
      this.campfireGlow.fillStyle(0xff6600, 0.08 * intensity);
      this.campfireGlow.fillCircle(x, y - 5, 50 * intensity);
      
      this.campfireGlow.fillStyle(0xff9900, 0.12 * intensity);
      this.campfireGlow.fillCircle(x, y - 5, 30 * intensity);
      
      this.campfireGlow.fillStyle(0xffcc00, 0.25);
      this.campfireGlow.fillCircle(x, y - 8, 12);
    };
    
    this.tweens.add({
      targets: { i: 1 },
      i: 1.15,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const val = tween.getValue();
        if (typeof val === 'number') drawFire(val);
      }
    });
    
    drawFire(1);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const headerY = safe.top + 15;
    
    // Week and league (left)
    this.add.text(safe.left, headerY, `Week ${this.week + 1}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    });
    
    const leagueColors: Record<string, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      champion: '#ff4500'
    };
    this.add.text(safe.left, headerY + 18, this.league.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: leagueColors[this.league] || '#8b7355'
    });
    
    // Gold and resources (right)
    const run = SaveSystem.getRun();
    
    this.add.text(width - safe.right, headerY, `💰 ${this.gold}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    this.add.text(width - safe.right, headerY + 18, `⭐ ${run.fame}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(1, 0);
    
    // Fatigue indicator
    const fatigue = SaveSystem.getFatigue();
    if (fatigue > 0) {
      const fatigueColor = fatigue > 70 ? '#8b0000' : fatigue > 40 ? '#daa520' : '#8b7355';
      this.add.text(width - safe.right, headerY + 35, `⚡ ${fatigue}%`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: fatigueColor
      }).setOrigin(1, 0);
    }
    
    // Relics count
    if (run.relics.length > 0) {
      this.add.text(width / 2, headerY, `🔮 ${run.relics.length}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#9932cc'
      }).setOrigin(0.5, 0);
    }
  }

  private createFighterDisplay(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    // Fighter container
    const fighterY = height * 0.35;
    this.fighterSprite = this.add.container(width * 0.5, fighterY);
    
    // Portrait - sized appropriately for screen
    const portraitSize = Math.min(80, width * 0.2);
    const portrait = PortraitRenderer.renderPortrait(
      this, this.fighter.portrait, 0, 0, portraitSize
    );
    this.fighterSprite.add(portrait);
    
    // Injury indicator
    if (this.fighter.injuries.length > 0) {
      const badge = this.add.text(portraitSize / 2 + 5, -portraitSize / 2, '🩹', { 
        fontSize: '14px' 
      });
      this.fighterSprite.add(badge);
    }
    
    // Idle animation
    this.tweens.add({
      targets: this.fighterSprite,
      y: fighterY - 3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Fighter name below portrait
    this.add.text(width * 0.5, fighterY + portraitSize / 2 + 15, this.fighter.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Status indicator
    const statusColors: Record<string, string> = {
      healthy: '#6b8e23',
      injured: '#daa520',
      critical: '#8b0000'
    };
    this.add.text(width * 0.5, fighterY + portraitSize / 2 + 32, this.fighter.status.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: statusColors[this.fighter.status] || '#8b7355'
    }).setOrigin(0.5);
    
    // Voice line bubble
    const voiceLine = this.getContextualVoiceLine();
    if (voiceLine) {
      this.createSpeechBubble(width * 0.5, fighterY - portraitSize / 2 - 30, voiceLine);
    }
    
    // Make fighter clickable for character info
    this.fighterSprite.setSize(portraitSize + 20, portraitSize + 20);
    this.fighterSprite.setInteractive();
    this.fighterSprite.on('pointerdown', () => this.showCharacterInfo());
  }
  
  private createSpeechBubble(x: number, y: number, text: string): void {
    const maxWidth = Math.min(180, this.cameras.main.width - 40);
    
    const bubble = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.9);
    bg.fillRoundedRect(-maxWidth / 2, -20, maxWidth, 35, 6);
    bg.lineStyle(1, 0xc9a959, 0.4);
    bg.strokeRoundedRect(-maxWidth / 2, -20, maxWidth, 35, 6);
    
    // Tail
    bg.fillStyle(0x2a1f1a, 0.9);
    bg.fillTriangle(-5, 15, 5, 15, 0, 25);
    
    const textObj = this.add.text(0, -3, `"${text}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      fontStyle: 'italic',
      wordWrap: { width: maxWidth - 20 },
      align: 'center'
    }).setOrigin(0.5);
    
    bubble.add([bg, textObj]);
    
    // Fade in
    bubble.setAlpha(0);
    this.tweens.add({
      targets: bubble,
      alpha: 1,
      duration: 400,
      delay: 300
    });
  }

  private createActionButtons(): void {
    const { width, height } = this.cameras.main;
    const content = getContentArea(this);
    
    // Calculate button layout
    const buttonWidth = Math.min(160, (content.width - 20) / 2);
    const buttonHeight = Math.max(MIN_TOUCH_SIZE, 58);
    const spacing = 10;
    
    const startY = height * 0.55;
    const leftX = content.x + buttonWidth / 2 + 5;
    const rightX = content.x + content.width - buttonWidth / 2 - 5;
    
    const run = SaveSystem.getRun();
    const fatigue = SaveSystem.getFatigue();
    const canTrain = fatigue < 100;
    
    // TRAIN button
    this.createActionButton(
      leftX, startY,
      buttonWidth, buttonHeight,
      '⚔️', 'TRAIN',
      'Build your skills',
      () => this.goToTraining(),
      canTrain
    );
    
    // SHOP button
    this.createActionButton(
      rightX, startY,
      buttonWidth, buttonHeight,
      '🛒', 'SHOP',
      `${this.gold} gold`,
      () => this.goToShop(),
      true
    );
    
    // REST button
    this.createActionButton(
      leftX, startY + buttonHeight + spacing,
      buttonWidth, buttonHeight,
      '🛏️', 'REST',
      '-40 fatigue, +HP',
      () => this.doRest(),
      fatigue > 0 || this.fighter.injuries.length > 0 || this.fighter.currentStats.currentHP < this.fighter.currentStats.maxHP
    );
    
    // LETTER button
    const seals = SaveSystem.getSeals();
    this.createActionButton(
      rightX, startY + buttonHeight + spacing,
      buttonWidth, buttonHeight,
      '✉️', 'WRITE',
      seals > 0 ? `${seals} seals` : 'Gain seals',
      () => this.writeLetter(),
      true,
      true  // highlighted
    );
  }
  
  private createActionButton(
    x: number, y: number,
    w: number, h: number,
    icon: string, title: string, subtitle: string,
    onClick: () => void,
    enabled: boolean = true,
    highlighted: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    const fillColor = highlighted ? 0x3a2a2a : 0x2a1f1a;
    const strokeColor = enabled ? (highlighted ? 0xc9a959 : 0x5a4a3a) : 0x3a2a1a;
    
    bg.fillStyle(fillColor, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, strokeColor, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    container.add(bg);
    
    // Icon
    const iconText = this.add.text(-w / 2 + 12, -5, icon, {
      fontSize: '22px'
    }).setOrigin(0, 0.5);
    container.add(iconText);
    
    // Title
    const titleText = this.add.text(-w / 2 + 42, -10, title, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: enabled ? (highlighted ? '#c9a959' : '#c9a959') : '#5a4a3a'
    });
    container.add(titleText);
    
    // Subtitle
    const subText = this.add.text(-w / 2 + 42, 6, subtitle, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: enabled ? '#8b7355' : '#4a3a2a'
    });
    container.add(subText);
    
    if (enabled) {
      container.setSize(w, h);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
        Phaser.Geom.Rectangle.Contains
      );
      
      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x3a2f2a, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, 0xc9a959, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      });
      
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(fillColor, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, strokeColor, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      });
      
      container.on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 50,
          yoyo: true,
          onComplete: onClick
        });
      });
    } else {
      container.setAlpha(0.6);
    }
    
    return container;
  }
  
  private createBottomBar(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const run = SaveSystem.getRun();
    
    // Progress bar area
    const barY = anchorBottom(this, 85);
    const barWidth = width - safe.left - safe.right;
    
    // Progress label
    this.add.text(safe.left, barY - 15, 
      `${run.fightsInLeague}/${run.fightsToNextLeague} to next league`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a'
    });
    
    // Progress bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2a1f1a, 1);
    barBg.fillRoundedRect(safe.left, barY, barWidth, 8, 3);
    
    const barFill = this.add.graphics();
    barFill.fillStyle(0xc9a959, 1);
    barFill.fillRoundedRect(safe.left, barY, 
      barWidth * (run.fightsInLeague / run.fightsToNextLeague), 8, 3);
    
    // FIGHT button - centered and prominent
    new TouchButton(
      this,
      width / 2,
      anchorBottom(this, 35),
      '🗡️ ENTER ARENA',
      () => this.enterArena(),
      { width: Math.min(220, width - 80), height: 52, fontSize: 15, primary: true }
    );
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

  private showCharacterInfo(): void {
    UIHelper.showNotification(this, 
      `${this.fighter.fullName}\nTrust: ${this.fighter.trust}% | Wins: ${this.fighter.wins}`, 
      3000
    );
  }

  private goToTraining(): void {
    SaveSystem.updateRun({ lastCampAction: 'train' });
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TrainingScene');
    });
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
    
    // Reduce fatigue
    SaveSystem.reduceFatigue(40);
    
    // Clear sparring injuries
    SaveSystem.clearSparringInjuries();
    
    SaveSystem.updateRun({
      fighter: this.fighter,
      week: this.week + 1,
      lastCampAction: 'rest'
    });
    
    UIHelper.showNotification(this, '💤 Rested! HP restored, -40 fatigue, +5 Trust');
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
