/**
 * ItemCard - Display card for items with rarity glow
 * Used in shop, inventory, and loot reveals
 */

import Phaser from 'phaser';
import { GameItem, ItemRarity, getRarityColor } from '../data/ItemsData';

export interface ItemCardConfig {
  item: GameItem;
  showPrice?: boolean;
  showSellPrice?: boolean;
  selectable?: boolean;
  selected?: boolean;
  equipped?: boolean;
  compact?: boolean;
}

export class ItemCard extends Phaser.GameObjects.Container {
  private bg!: Phaser.GameObjects.Graphics;
  private glowEffect?: Phaser.GameObjects.Graphics;
  private config: ItemCardConfig;
  private callback?: () => void;
  private isSelected = false;

  static readonly WIDTH = 140;
  static readonly HEIGHT = 160;
  static readonly COMPACT_HEIGHT = 60;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ItemCardConfig,
    onClick?: () => void
  ) {
    super(scene, x, y);
    this.config = config;
    this.callback = onClick;
    this.isSelected = config.selected || false;

    this.createCard();
    if (config.selectable) {
      this.setupInteraction();
    }

    scene.add.existing(this);
  }

  private createCard(): void {
    const compact = this.config.compact;
    const w = ItemCard.WIDTH;
    const h = compact ? ItemCard.COMPACT_HEIGHT : ItemCard.HEIGHT;
    const item = this.config.item;

    // Rarity glow (behind card)
    if (item.rarity !== 'common') {
      this.createRarityGlow(w, h);
    }

    // Background
    this.bg = this.scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    if (compact) {
      this.createCompactLayout();
    } else {
      this.createFullLayout();
    }

    // Equipped indicator
    if (this.config.equipped) {
      this.createEquippedBadge();
    }
  }

  private createRarityGlow(w: number, h: number): void {
    const color = Phaser.Display.Color.HexStringToColor(
      getRarityColor(this.config.item.rarity)
    ).color;

    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.fillStyle(color, 0.2);
    this.glowEffect.fillRoundedRect(-w/2 - 3, -h/2 - 3, w + 6, h + 6, 12);
    this.add(this.glowEffect);

    // Pulse animation for rare+
    if (['rare', 'epic', 'legendary'].includes(this.config.item.rarity)) {
      this.scene.tweens.add({
        targets: this.glowEffect,
        alpha: { from: 0.2, to: 0.5 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private drawBackground(hover: boolean): void {
    const compact = this.config.compact;
    const w = ItemCard.WIDTH;
    const h = compact ? ItemCard.COMPACT_HEIGHT : ItemCard.HEIGHT;
    const color = getRarityColor(this.config.item.rarity);

    this.bg.clear();

    // Shadow
    this.bg.fillStyle(0x000000, 0.3);
    this.bg.fillRoundedRect(-w/2 + 2, -h/2 + 2, w, h, 8);

    // Main background
    const fillColor = hover || this.isSelected ? 0x3a3020 : 0x2a2015;
    this.bg.fillStyle(fillColor, 0.95);
    this.bg.fillRoundedRect(-w/2, -h/2, w, h, 8);

    // Rarity border
    const borderAlpha = hover || this.isSelected ? 1 : 0.7;
    this.bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(color).color, borderAlpha);
    this.bg.strokeRoundedRect(-w/2, -h/2, w, h, 8);

    // Top rarity bar
    this.bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.3);
    this.bg.fillRect(-w/2, -h/2, w, 4);
  }

  private createFullLayout(): void {
    const item = this.config.item;
    const w = ItemCard.WIDTH;
    const h = ItemCard.HEIGHT;

    // Icon
    const icon = this.scene.add.text(0, -45, item.icon, {
      fontSize: '32px'
    }).setOrigin(0.5);
    this.add(icon);

    // Name
    const name = this.scene.add.text(0, -10, item.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: getRarityColor(item.rarity),
      align: 'center',
      wordWrap: { width: w - 20 }
    }).setOrigin(0.5);
    this.add(name);

    // Rarity label
    const rarityLabel = this.scene.add.text(0, 8, 
      item.rarity.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: getRarityColor(item.rarity)
    }).setOrigin(0.5);
    this.add(rarityLabel);

    // Stats preview
    let statsY = 25;
    if (item.stats) {
      const statsText = Object.entries(item.stats)
        .map(([k, v]) => `${k === 'attack' ? 'ATK' : k === 'defense' ? 'DEF' : k.toUpperCase()}: ${v > 0 ? '+' : ''}${v}`)
        .slice(0, 2)
        .join(' | ');
      
      const stats = this.scene.add.text(0, statsY, statsText, {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#8b7355'
      }).setOrigin(0.5);
      this.add(stats);
      statsY += 15;
    }

    // Effect
    if (item.effect) {
      const effect = this.scene.add.text(0, statsY, 
        `✨ ${item.effect}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#6b8e23',
        wordWrap: { width: w - 20 },
        align: 'center'
      }).setOrigin(0.5, 0);
      this.add(effect);
    }

    // Price
    if (this.config.showPrice) {
      const price = this.scene.add.text(0, h/2 - 18, 
        `💰 ${item.price}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#c9a959'
      }).setOrigin(0.5);
      this.add(price);
    } else if (this.config.showSellPrice) {
      const sellPrice = this.scene.add.text(0, h/2 - 18,
        `Sell: 💰 ${item.sellPrice}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355'
      }).setOrigin(0.5);
      this.add(sellPrice);
    }
  }

  private createCompactLayout(): void {
    const item = this.config.item;
    const w = ItemCard.WIDTH;
    const h = ItemCard.COMPACT_HEIGHT;

    // Icon (left)
    const icon = this.scene.add.text(-w/2 + 25, 0, item.icon, {
      fontSize: '24px'
    }).setOrigin(0.5);
    this.add(icon);

    // Name
    const name = this.scene.add.text(-w/2 + 50, -8, item.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: getRarityColor(item.rarity)
    }).setOrigin(0, 0.5);
    this.add(name);

    // Quick stat
    if (item.stats) {
      const mainStat = Object.entries(item.stats)[0];
      if (mainStat) {
        const statText = this.scene.add.text(-w/2 + 50, 10,
          `${mainStat[0]}: ${mainStat[1] > 0 ? '+' : ''}${mainStat[1]}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '9px',
          color: '#8b7355'
        }).setOrigin(0, 0.5);
        this.add(statText);
      }
    }

    // Price (right)
    if (this.config.showPrice) {
      const price = this.scene.add.text(w/2 - 10, 0,
        `💰${item.price}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#c9a959'
      }).setOrigin(1, 0.5);
      this.add(price);
    }
  }

  private createEquippedBadge(): void {
    const badge = this.scene.add.text(
      ItemCard.WIDTH/2 - 5, 
      -ItemCard.HEIGHT/2 + 5,
      'EQUIPPED', {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#6b8e23',
      padding: { x: 4, y: 2 }
    }).setOrigin(1, 0);
    this.add(badge);
  }

  private setupInteraction(): void {
    const compact = this.config.compact;
    const w = ItemCard.WIDTH;
    const h = compact ? ItemCard.COMPACT_HEIGHT : ItemCard.HEIGHT;

    const hitArea = new Phaser.Geom.Rectangle(-w/2, -h/2, w, h);
    this.setSize(w, h);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.on('pointerover', () => {
      this.drawBackground(true);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    this.on('pointerout', () => {
      if (!this.isSelected) {
        this.drawBackground(false);
      }
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100
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
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 50,
        onComplete: () => {
          if (this.callback) {
            this.callback();
          }
        }
      });
    });
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.drawBackground(false);
  }

  /**
   * Card flip reveal animation (for loot)
   */
  revealFlip(): Promise<void> {
    return new Promise(resolve => {
      // Start face-down
      this.setScale(1, 0);
      
      // Flip up
      this.scene.tweens.add({
        targets: this,
        scaleY: 1,
        duration: 300,
        ease: 'Back.out',
        onComplete: () => {
          // Sparkle effect for rare+
          if (['rare', 'epic', 'legendary'].includes(this.config.item.rarity)) {
            this.createSparkles();
          }
          resolve();
        }
      });
    });
  }

  private createSparkles(): void {
    const color = Phaser.Display.Color.HexStringToColor(
      getRarityColor(this.config.item.rarity)
    ).color;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(color, 1);
      sparkle.fillCircle(0, 0, 3);
      this.add(sparkle);

      this.scene.tweens.add({
        targets: sparkle,
        x: Math.cos(angle) * 50,
        y: Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Quad.out',
        onComplete: () => sparkle.destroy()
      });
    }
  }
}
