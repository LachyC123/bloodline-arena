/**
 * ActionCard - Animated interactive card for camp actions
 * Replaces text-only buttons with illustrated action cards
 */

import Phaser from 'phaser';

export interface ActionCardConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description?: string;
  cost?: { type: 'gold' | 'stamina' | 'hp'; value: number };
  benefit?: string;
  disabled?: boolean;
  disabledReason?: string;
  highlighted?: boolean;
}

export class ActionCard extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private iconText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private costText?: Phaser.GameObjects.Text;
  private config: ActionCardConfig;
  private isPressed = false;
  private isHovered = false;
  private callback: () => void;
  
  static readonly WIDTH = 160;
  static readonly HEIGHT = 140;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ActionCardConfig,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.config = config;
    this.callback = onClick;
    
    this.createCard();
    this.setupInteraction();
    
    scene.add.existing(this);
  }

  private createCard(): void {
    const w = ActionCard.WIDTH;
    const h = ActionCard.HEIGHT;
    
    // Background
    this.bg = this.scene.add.graphics();
    this.drawBackground(false, false);
    this.add(this.bg);
    
    // Icon (large, centered top)
    this.iconText = this.scene.add.text(0, -35, this.config.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);
    this.add(this.iconText);
    
    // Title
    this.titleText = this.scene.add.text(0, 10, this.config.title, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: this.config.disabled ? '#5a4a3a' : '#c9a959',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(this.titleText);
    
    // Subtitle
    this.subtitleText = this.scene.add.text(0, 28, this.config.subtitle, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.add(this.subtitleText);
    
    // Cost/benefit preview
    if (this.config.cost) {
      const costIcon = this.config.cost.type === 'gold' ? '💰' : 
                       this.config.cost.type === 'stamina' ? '⚡' : '❤️';
      this.costText = this.scene.add.text(0, 50, 
        `${costIcon} ${this.config.cost.value}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#aa6666'
      }).setOrigin(0.5);
      this.add(this.costText);
    } else if (this.config.benefit) {
      this.costText = this.scene.add.text(0, 50, this.config.benefit, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#6b8e23'
      }).setOrigin(0.5);
      this.add(this.costText);
    }
    
    // Disabled overlay
    if (this.config.disabled) {
      this.setAlpha(0.6);
    }
    
    // Highlight glow for special actions
    if (this.config.highlighted) {
      this.addHighlightEffect();
    }
  }

  private drawBackground(hover: boolean, pressed: boolean): void {
    const w = ActionCard.WIDTH;
    const h = ActionCard.HEIGHT;
    
    this.bg.clear();
    
    // Outer shadow
    if (!this.config.disabled) {
      this.bg.fillStyle(0x000000, 0.3);
      this.bg.fillRoundedRect(-w/2 + 3, -h/2 + 3, w, h, 10);
    }
    
    // Main card
    const fillColor = pressed ? 0x4a3a2a : hover ? 0x3a2f1f : 0x2a1f1a;
    this.bg.fillStyle(fillColor, 0.95);
    this.bg.fillRoundedRect(-w/2, -h/2, w, h, 10);
    
    // Border
    const borderColor = this.config.highlighted ? 0xffd700 : 
                        hover ? 0xc9a959 : 0x5a4a3a;
    this.bg.lineStyle(hover ? 3 : 2, borderColor, 1);
    this.bg.strokeRoundedRect(-w/2, -h/2, w, h, 10);
    
    // Inner decorative line
    this.bg.lineStyle(1, 0x3a2a1a, 0.5);
    this.bg.strokeRoundedRect(-w/2 + 5, -h/2 + 5, w - 10, h - 10, 8);
    
    // Parchment texture effect (simple lines)
    this.bg.lineStyle(1, 0x1a1410, 0.1);
    for (let i = 0; i < 5; i++) {
      const y = -h/2 + 20 + i * 25;
      this.bg.moveTo(-w/2 + 10, y);
      this.bg.lineTo(w/2 - 10, y);
    }
    this.bg.strokePath();
  }

  private addHighlightEffect(): void {
    // Pulsing glow for highlighted cards
    this.scene.tweens.add({
      targets: this.bg,
      alpha: { from: 1, to: 0.8 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private setupInteraction(): void {
    if (this.config.disabled) return;
    
    const hitArea = new Phaser.Geom.Rectangle(
      -ActionCard.WIDTH/2, -ActionCard.HEIGHT/2,
      ActionCard.WIDTH, ActionCard.HEIGHT
    );
    
    this.setSize(ActionCard.WIDTH, ActionCard.HEIGHT);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    this.on('pointerover', this.onHover, this);
    this.on('pointerout', this.onOut, this);
    this.on('pointerdown', this.onDown, this);
    this.on('pointerup', this.onUp, this);
  }

  private onHover(): void {
    if (this.config.disabled) return;
    this.isHovered = true;
    this.drawBackground(true, false);
    
    // Subtle scale up
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Back.out'
    });
    
    // Show tooltip if there's a description
    if (this.config.description) {
      this.showTooltip();
    }
  }

  private onOut(): void {
    this.isHovered = false;
    this.isPressed = false;
    this.drawBackground(false, false);
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100
    });
    
    this.hideTooltip();
  }

  private onDown(): void {
    if (this.config.disabled) return;
    this.isPressed = true;
    this.drawBackground(true, true);
    
    // Ink ripple effect
    this.createRippleEffect();
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50
    });
  }

  private onUp(): void {
    if (this.config.disabled || !this.isPressed) return;
    this.isPressed = false;
    
    this.scene.tweens.add({
      targets: this,
      scaleX: this.isHovered ? 1.05 : 1,
      scaleY: this.isHovered ? 1.05 : 1,
      duration: 50,
      onComplete: () => {
        if (!this.config.disabled) {
          this.callback();
        }
      }
    });
    
    this.drawBackground(this.isHovered, false);
  }

  private createRippleEffect(): void {
    const ripple = this.scene.add.graphics();
    ripple.fillStyle(0xc9a959, 0.3);
    ripple.fillCircle(0, 0, 10);
    this.add(ripple);
    
    this.scene.tweens.add({
      targets: ripple,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 400,
      ease: 'Quad.out',
      onComplete: () => ripple.destroy()
    });
  }

  private tooltipContainer?: Phaser.GameObjects.Container;

  private showTooltip(): void {
    if (!this.config.description || this.tooltipContainer) return;
    
    this.tooltipContainer = this.scene.add.container(0, -ActionCard.HEIGHT/2 - 40);
    
    const text = this.scene.add.text(0, 0, this.config.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959',
      wordWrap: { width: 150 },
      align: 'center'
    }).setOrigin(0.5);
    
    const padding = 10;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(
      -text.width/2 - padding,
      -text.height/2 - padding,
      text.width + padding * 2,
      text.height + padding * 2,
      6
    );
    bg.lineStyle(1, 0xc9a959, 0.5);
    bg.strokeRoundedRect(
      -text.width/2 - padding,
      -text.height/2 - padding,
      text.width + padding * 2,
      text.height + padding * 2,
      6
    );
    
    this.tooltipContainer.add([bg, text]);
    this.add(this.tooltipContainer);
    
    this.tooltipContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.tooltipContainer,
      alpha: 1,
      y: -ActionCard.HEIGHT/2 - 50,
      duration: 150
    });
  }

  private hideTooltip(): void {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = undefined;
    }
  }

  setDisabled(disabled: boolean, reason?: string): void {
    this.config.disabled = disabled;
    this.config.disabledReason = reason;
    this.setAlpha(disabled ? 0.6 : 1);
    this.drawBackground(false, false);
    
    if (disabled) {
      this.disableInteractive();
    } else {
      this.setupInteraction();
    }
  }

  updateConfig(config: Partial<ActionCardConfig>): void {
    Object.assign(this.config, config);
    this.titleText.setText(this.config.title);
    this.subtitleText.setText(this.config.subtitle);
    this.iconText.setText(this.config.icon);
    this.drawBackground(false, false);
  }
}
