/**
 * DecreeDraftScene - Choose arena decrees for the run
 * Presents 3 options and lets player pick 1
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { 
  Decree, 
  getDecreeDraftOptions, 
  getDecreeById, 
  calculateTotalDifficulty,
  calculateDecreeRewardMultiplier
} from '../data/decrees';
import { UIHelper } from '../ui/UIHelper';
import { Button } from '../ui/Button';
import { COLORS, FONTS, SPACING, drawPanel } from '../ui/Theme';

export class DecreeDraftScene extends Phaser.Scene {
  private options: Decree[] = [];
  private selectedIndex: number = -1;
  private cardContainers: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'DecreeDraftScene' });
  }

  create(): void {
    const activeDecrees = SaveSystem.getActiveDecrees();
    
    // Get 3 random decrees that don't conflict with active ones
    this.options = getDecreeDraftOptions(activeDecrees, 3);
    
    this.createBackground();
    this.createHeader();
    this.createDecreeCards();
    this.createBottomUI();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark arena background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    // Decorative border
    bg.lineStyle(2, COLORS.primary, 0.3);
    bg.strokeRect(15, 15, width - 30, height - 30);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    // Title with wax seal icon
    this.add.text(width / 2, 40, '📜 ARENA DECREE', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: COLORS.textGold,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, 75, 'Choose a decree to modify your run', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: COLORS.textMedium,
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Show current active decrees count
    const activeCount = SaveSystem.getActiveDecrees().length;
    if (activeCount > 0) {
      this.add.text(width / 2, 100, `Active Decrees: ${activeCount}/3`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: COLORS.textDark
      }).setOrigin(0.5);
    }
  }

  private createDecreeCards(): void {
    const { width, height } = this.cameras.main;
    const cardWidth = Math.min(280, width - 40);
    const cardHeight = 160;
    const startY = 140;
    const spacing = cardHeight + 15;
    
    this.options.forEach((decree, index) => {
      const y = startY + index * spacing;
      const card = this.createDecreeCard(decree, width / 2, y, cardWidth, cardHeight, index);
      this.cardContainers.push(card);
    });
  }

  private createDecreeCard(
    decree: Decree,
    x: number,
    y: number,
    w: number,
    h: number,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background
    const bg = this.add.graphics();
    drawPanel(bg, -w / 2, 0, w, h, {
      fill: 0x241a15,
      stroke: COLORS.primary,
      strokeAlpha: 0.3
    });
    container.add(bg);
    
    // Icon
    const icon = this.add.text(-w / 2 + 20, 15, decree.icon, {
      fontSize: '28px'
    });
    container.add(icon);
    
    // Name
    const isNew = SaveSystem.isDecreeNew(decree.id);
    const nameText = isNew ? `${decree.name} ✨` : decree.name;
    const name = this.add.text(-w / 2 + 60, 15, nameText, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: COLORS.textGold
    });
    container.add(name);
    
    // Difficulty stars
    const difficultyStr = '⭐'.repeat(decree.difficultyValue);
    const difficulty = this.add.text(w / 2 - 20, 15, difficultyStr, {
      fontSize: '12px'
    }).setOrigin(1, 0);
    container.add(difficulty);
    
    // Description
    const desc = this.add.text(-w / 2 + 20, 50, decree.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: COLORS.textMedium,
      wordWrap: { width: w - 40 }
    });
    container.add(desc);
    
    // Reward preview
    const rewards = calculateDecreeRewardMultiplier([decree.id]);
    const rewardParts: string[] = [];
    if (rewards.goldMod > 0) rewardParts.push(`+${rewards.goldMod}% Gold`);
    if (rewards.lootRarityMod > 0) rewardParts.push(`+${rewards.lootRarityMod} Loot`);
    if (rewards.affixTierBoost > 0) rewardParts.push(`+${rewards.affixTierBoost} Affix`);
    
    if (rewardParts.length > 0) {
      const rewardText = this.add.text(-w / 2 + 20, h - 35, `Rewards: ${rewardParts.join(', ')}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#6b8e23'
      });
      container.add(rewardText);
    }
    
    // Selection highlight
    const highlight = this.add.graphics();
    highlight.setVisible(false);
    container.add(highlight);
    container.setData('highlight', highlight);
    container.setData('decree', decree);
    container.setData('index', index);
    
    // Make interactive
    const hitArea = this.add.rectangle(0, h / 2, w, h, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      bg.clear();
      drawPanel(bg, -w / 2, 0, w, h, {
        fill: 0x3a2a20,
        stroke: COLORS.primary,
        strokeAlpha: 0.6
      });
    });
    
    hitArea.on('pointerout', () => {
      if (this.selectedIndex !== index) {
        bg.clear();
        drawPanel(bg, -w / 2, 0, w, h, {
          fill: 0x241a15,
          stroke: COLORS.primary,
          strokeAlpha: 0.3
        });
      }
    });
    
    hitArea.on('pointerdown', () => {
      this.selectDecree(index);
    });
    
    return container;
  }

  private selectDecree(index: number): void {
    this.selectedIndex = index;
    
    // Update all card visuals
    this.cardContainers.forEach((card, i) => {
      const decree = card.getData('decree') as Decree;
      const bg = card.list[0] as Phaser.GameObjects.Graphics;
      const w = 280;
      const h = 160;
      
      bg.clear();
      if (i === index) {
        drawPanel(bg, -w / 2, 0, w, h, {
          fill: 0x4a3a2a,
          stroke: COLORS.primary,
          strokeAlpha: 1
        });
      } else {
        drawPanel(bg, -w / 2, 0, w, h, {
          fill: 0x241a15,
          stroke: COLORS.primary,
          strokeAlpha: 0.3
        });
      }
    });
  }

  private createBottomUI(): void {
    const { width, height } = this.cameras.main;
    
    // Confirm button
    const confirmBtn = new Button(
      this,
      width / 2,
      height - 80,
      'ACCEPT DECREE',
      () => this.confirmSelection(),
      { width: 180, height: 50, primary: true }
    );
    this.add.existing(confirmBtn);
    
    // Skip button (if allowed)
    const activeCount = SaveSystem.getActiveDecrees().length;
    if (activeCount === 0) {
      // First decree is mandatory, no skip
      this.add.text(width / 2, height - 40, 'You must choose at least one decree', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: COLORS.textDark,
        fontStyle: 'italic'
      }).setOrigin(0.5);
    } else {
      const skipBtn = new Button(
        this,
        width / 2,
        height - 30,
        'Skip (No additional decree)',
        () => this.skip(),
        { width: 200, height: 35 }
      );
      this.add.existing(skipBtn);
    }
  }

  private confirmSelection(): void {
    if (this.selectedIndex < 0) {
      UIHelper.showNotification(this, 'Select a decree first!');
      return;
    }
    
    const decree = this.options[this.selectedIndex];
    
    // Add decree to run
    SaveSystem.addDecree(decree.id);
    SaveSystem.completeDecreeDraft();
    
    // Show confirmation animation
    this.showConfirmAnimation(decree);
  }

  private showConfirmAnimation(decree: Decree): void {
    const { width, height } = this.cameras.main;
    
    // Wax seal stamp effect
    const seal = this.add.container(width / 2, height / 2);
    seal.setDepth(100);
    seal.setScale(0);
    
    const sealBg = this.add.graphics();
    sealBg.fillStyle(0x8b0000, 1);
    sealBg.fillCircle(0, 0, 60);
    sealBg.lineStyle(3, 0x5a0000, 1);
    sealBg.strokeCircle(0, 0, 60);
    seal.add(sealBg);
    
    const icon = this.add.text(0, -5, decree.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);
    seal.add(icon);
    
    const label = this.add.text(0, 30, 'SEALED', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#ffd700'
    }).setOrigin(0.5);
    seal.add(label);
    
    // Animate stamp
    this.tweens.add({
      targets: seal,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(800, () => {
          this.cameras.main.fadeOut(300);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('RunMapScene');
          });
        });
      }
    });
  }

  private skip(): void {
    SaveSystem.completeDecreeDraft();
    
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RunMapScene');
    });
  }
}
