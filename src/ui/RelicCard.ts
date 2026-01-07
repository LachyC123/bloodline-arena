/**
 * RelicCard - Shiny relic selection card (Brotato-style)
 * Features dramatic reveal animations and rarity effects
 */

import Phaser from 'phaser';
import { Relic, RelicRarity } from '../data/RelicsData';

export class RelicCard extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private glowLayer!: Phaser.GameObjects.Graphics;
  private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private relic: Relic;
  private callback: () => void;
  private revealed = false;

  static readonly WIDTH = 180;
  static readonly HEIGHT = 240;

  private static readonly RARITY_COLORS: Record<RelicRarity, number> = {
    common: 0x808080,
    uncommon: 0x1eff00,
    rare: 0x0070dd,
    legendary: 0xff8000
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    relic: Relic,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.relic = relic;
    this.callback = onClick;

    this.createCard();
    
    scene.add.existing(this);
  }

  private createCard(): void {
    const w = RelicCard.WIDTH;
    const h = RelicCard.HEIGHT;
    const color = RelicCard.RARITY_COLORS[this.relic.rarity];

    // Animated glow background
    this.glowLayer = this.scene.add.graphics();
    this.add(this.glowLayer);
    this.animateGlow(color);

    // Main background
    this.bg = this.scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    // Rarity banner
    const banner = this.scene.add.graphics();
    banner.fillStyle(color, 0.8);
    banner.fillRect(-w/2, -h/2, w, 30);
    this.add(banner);

    // Rarity text
    const rarityText = this.scene.add.text(0, -h/2 + 15,
      this.relic.rarity.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(rarityText);

    // Icon
    const icon = this.scene.add.text(0, -35, this.relic.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.add(icon);

    // Aura effect around icon
    this.createAuraEffect(color);

    // Name
    const name = this.scene.add.text(0, 15, this.relic.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959',
      fontStyle: 'bold',
      wordWrap: { width: w - 20 },
      align: 'center'
    }).setOrigin(0.5);
    this.add(name);

    // Description
    const desc = this.scene.add.text(0, 50, this.relic.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#ffffff',
      wordWrap: { width: w - 30 },
      align: 'center'
    }).setOrigin(0.5, 0);
    this.add(desc);

    // Lore text
    const lore = this.scene.add.text(0, h/2 - 30, `"${this.relic.lore}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#8b7355',
      fontStyle: 'italic',
      wordWrap: { width: w - 20 },
      align: 'center'
    }).setOrigin(0.5);
    this.add(lore);

    // Setup interaction
    this.setupInteraction();
  }

  private drawBackground(hover: boolean): void {
    const w = RelicCard.WIDTH;
    const h = RelicCard.HEIGHT;
    const color = RelicCard.RARITY_COLORS[this.relic.rarity];

    this.bg.clear();

    // Shadow
    this.bg.fillStyle(0x000000, 0.4);
    this.bg.fillRoundedRect(-w/2 + 4, -h/2 + 4, w, h, 12);

    // Main card
    const fillColor = hover ? 0x3a3a3a : 0x2a2a2a;
    this.bg.fillStyle(fillColor, 0.95);
    this.bg.fillRoundedRect(-w/2, -h/2, w, h, 12);

    // Border
    this.bg.lineStyle(hover ? 4 : 3, color, 1);
    this.bg.strokeRoundedRect(-w/2, -h/2, w, h, 12);

    // Inner decoration
    this.bg.lineStyle(1, color, 0.3);
    this.bg.strokeRoundedRect(-w/2 + 8, -h/2 + 8, w - 16, h - 16, 8);
  }

  private animateGlow(color: number): void {
    const w = RelicCard.WIDTH;
    const h = RelicCard.HEIGHT;

    const drawGlow = (alpha: number) => {
      this.glowLayer.clear();
      this.glowLayer.fillStyle(color, alpha * 0.3);
      this.glowLayer.fillRoundedRect(-w/2 - 10, -h/2 - 10, w + 20, h + 20, 15);
    };

    // Pulsing glow
    let glowAlpha = 0.5;
    this.scene.tweens.add({
      targets: { alpha: 0.5 },
      alpha: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const val = tween.getValue();
        if (typeof val === 'number') {
          drawGlow(val);
        }
      }
    });

    drawGlow(0.5);
  }

  private createAuraEffect(color: number): void {
    // Rotating particles around icon
    const particles = this.scene.add.graphics();
    this.add(particles);

    let angle = 0;
    this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        particles.clear();
        for (let i = 0; i < 6; i++) {
          const a = angle + (i * Math.PI / 3);
          const x = Math.cos(a) * 40;
          const y = Math.sin(a) * 40 - 35;
          particles.fillStyle(color, 0.5 - i * 0.08);
          particles.fillCircle(x, y, 3 - i * 0.3);
        }
        angle += 0.05;
      },
      loop: true
    });
  }

  private setupInteraction(): void {
    const w = RelicCard.WIDTH;
    const h = RelicCard.HEIGHT;

    const hitArea = new Phaser.Geom.Rectangle(-w/2, -h/2, w, h);
    this.setSize(w, h);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', () => {
      this.drawBackground(true);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        y: this.y - 10,
        duration: 150,
        ease: 'Back.out'
      });
    });

    this.on('pointerout', () => {
      this.drawBackground(false);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        y: this.y + 10,
        duration: 150
      });
    });

    this.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50
      });
    });

    this.on('pointerup', () => {
      this.selectAnimation();
    });
  }

  private selectAnimation(): void {
    const color = RelicCard.RARITY_COLORS[this.relic.rarity];

    // Explosion of particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;
      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 4);
      this.add(particle);

      this.scene.tweens.add({
        targets: particle,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Quad.out',
        onComplete: () => particle.destroy()
      });
    }

    // Card zoom and fade
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Quad.in',
      onComplete: () => {
        this.callback();
      }
    });
  }

  /**
   * Dramatic reveal animation (card flip)
   */
  reveal(): Promise<void> {
    return new Promise(resolve => {
      if (this.revealed) {
        resolve();
        return;
      }

      // Start hidden (back of card)
      this.setScale(1, 0);
      
      // Flip with dramatic timing
      this.scene.tweens.add({
        targets: this,
        scaleY: 1,
        duration: 400,
        ease: 'Back.out',
        delay: Math.random() * 200,
        onComplete: () => {
          this.revealed = true;
          this.playRevealEffect();
          resolve();
        }
      });
    });
  }

  private playRevealEffect(): void {
    const color = RelicCard.RARITY_COLORS[this.relic.rarity];

    // Flash
    const flash = this.scene.add.graphics();
    flash.fillStyle(color, 0.5);
    flash.fillRoundedRect(
      -RelicCard.WIDTH/2, -RelicCard.HEIGHT/2,
      RelicCard.WIDTH, RelicCard.HEIGHT, 12
    );
    this.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // Screen shake for legendary
    if (this.relic.rarity === 'legendary') {
      this.scene.cameras.main.shake(200, 0.01);
    }
  }
}
