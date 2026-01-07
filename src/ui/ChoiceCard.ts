/**
 * ChoiceCard - Animated choice card for vignettes and decisions
 * Features mini scene art, preview of effects, and smooth interactions
 */

import Phaser from 'phaser';

export interface ChoiceEffect {
  type: string;
  value: number;
  isPositive: boolean;
  description: string;
}

export interface ChoiceCardConfig {
  id: string;
  text: string;
  effects: ChoiceEffect[];
  riskLevel?: 'safe' | 'risky' | 'dangerous';
  icon?: string;
}

export class ChoiceCard extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private textObj!: Phaser.GameObjects.Text;
  private effectsContainer!: Phaser.GameObjects.Container;
  private riskIndicator?: Phaser.GameObjects.Text;
  private config: ChoiceCardConfig;
  private callback: () => void;
  private isHovered = false;

  static readonly WIDTH = 280;
  static readonly HEIGHT = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ChoiceCardConfig,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.config = config;
    this.callback = onClick;

    this.createCard();
    this.setupInteraction();
    
    // Entry animation
    this.setScale(0.8);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.out'
    });

    scene.add.existing(this);
  }

  private createCard(): void {
    const w = ChoiceCard.WIDTH;
    const h = ChoiceCard.HEIGHT;

    // Background
    this.bg = this.scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    // Icon if provided
    let textX = -w/2 + 15;
    if (this.config.icon) {
      const icon = this.scene.add.text(-w/2 + 25, 0, this.config.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);
      this.add(icon);
      textX += 35;
    }

    // Choice text
    this.textObj = this.scene.add.text(textX, -15, this.config.text, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c9a959',
      wordWrap: { width: w - 80 }
    }).setOrigin(0, 0.5);
    this.add(this.textObj);

    // Effects preview
    this.effectsContainer = this.scene.add.container(-w/2 + 15, 20);
    this.createEffectsPreviews();
    this.add(this.effectsContainer);

    // Risk indicator
    if (this.config.riskLevel && this.config.riskLevel !== 'safe') {
      this.createRiskIndicator();
    }
  }

  private drawBackground(hover: boolean): void {
    const w = ChoiceCard.WIDTH;
    const h = ChoiceCard.HEIGHT;

    this.bg.clear();

    // Shadow
    this.bg.fillStyle(0x000000, 0.2);
    this.bg.fillRoundedRect(-w/2 + 2, -h/2 + 2, w, h, 8);

    // Main background
    const riskColors = {
      safe: 0x2a3a2a,
      risky: 0x3a3a2a,
      dangerous: 0x3a2a2a
    };
    const baseColor = riskColors[this.config.riskLevel || 'safe'];
    const fillColor = hover ? baseColor + 0x111111 : baseColor;
    
    this.bg.fillStyle(fillColor, 0.95);
    this.bg.fillRoundedRect(-w/2, -h/2, w, h, 8);

    // Border
    const borderColors = {
      safe: 0x6b8e23,
      risky: 0xdaa520,
      dangerous: 0xcd5c5c
    };
    const borderColor = hover ? 0xc9a959 : borderColors[this.config.riskLevel || 'safe'];
    this.bg.lineStyle(hover ? 2 : 1, borderColor, 1);
    this.bg.strokeRoundedRect(-w/2, -h/2, w, h, 8);

    // Left accent bar
    this.bg.fillStyle(borderColor, 0.5);
    this.bg.fillRect(-w/2, -h/2 + 5, 4, h - 10);
  }

  private createEffectsPreviews(): void {
    let xOffset = 0;
    
    this.config.effects.slice(0, 3).forEach(effect => {
      const icon = effect.isPositive ? '▲' : '▼';
      const color = effect.isPositive ? '#6b8e23' : '#cd5c5c';
      
      const text = this.scene.add.text(xOffset, 0, 
        `${icon} ${effect.description}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: color
      });
      
      this.effectsContainer.add(text);
      xOffset += text.width + 15;
    });
  }

  private createRiskIndicator(): void {
    const riskText = {
      risky: '⚠️ RISKY',
      dangerous: '☠️ DANGEROUS'
    };
    
    const colors = {
      risky: '#daa520',
      dangerous: '#cd5c5c'
    };

    this.riskIndicator = this.scene.add.text(
      ChoiceCard.WIDTH/2 - 10, 
      -ChoiceCard.HEIGHT/2 + 10,
      riskText[this.config.riskLevel as 'risky' | 'dangerous'],
      {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: colors[this.config.riskLevel as 'risky' | 'dangerous']
      }
    ).setOrigin(1, 0);
    this.add(this.riskIndicator);
  }

  private setupInteraction(): void {
    const hitArea = new Phaser.Geom.Rectangle(
      -ChoiceCard.WIDTH/2, -ChoiceCard.HEIGHT/2,
      ChoiceCard.WIDTH, ChoiceCard.HEIGHT
    );

    this.setSize(ChoiceCard.WIDTH, ChoiceCard.HEIGHT);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', () => {
      this.isHovered = true;
      this.drawBackground(true);
      this.scene.tweens.add({
        targets: this,
        x: this.x + 5,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 100
      });
    });

    this.on('pointerout', () => {
      this.isHovered = false;
      this.drawBackground(false);
      this.scene.tweens.add({
        targets: this,
        x: this.x - 5,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    this.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.98,
        scaleY: 0.98,
        duration: 50
      });
    });

    this.on('pointerup', () => {
      // Selection animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        alpha: 0,
        duration: 200,
        ease: 'Quad.in',
        onComplete: () => {
          this.callback();
        }
      });
    });
  }

  /**
   * Animate selection of this card (for external triggering)
   */
  select(): void {
    this.emit('pointerup');
  }

  /**
   * Fade out without callback (for non-selected cards)
   */
  fadeOut(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 20,
      duration: 200,
      onComplete: () => this.destroy()
    });
  }
}
