/**
 * ShopScene - Buy items and equipment
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { WEAPONS_DATA, ARMOR_DATA, COMBAT_ITEMS } from '../data/CombatData';
import { UIHelper } from '../ui/UIHelper';
import { RNG } from '../systems/RNGSystem';

export class ShopScene extends Phaser.Scene {
  private gold!: number;
  private fighter!: Fighter;
  private selectedCategory: 'weapons' | 'armor' | 'items' = 'items';
  private shopInventory: Map<string, any[]> = new Map();
  private goldText!: Phaser.GameObjects.Text;
  private itemsContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.fighter = run.fighter;
    this.gold = run.gold;
    
    // Generate shop inventory
    this.generateShopInventory();
    
    this.createBackground();
    this.createHeader();
    this.createCategoryTabs();
    this.createItemList();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }

  private generateShopInventory(): void {
    const meta = SaveSystem.getMeta();
    const numWeapons = 3 + Math.floor(meta.promoterLevel / 2);
    const numArmor = 3 + Math.floor(meta.promoterLevel / 2);
    
    // Random weapons
    const weapons = RNG.shuffle([...WEAPONS_DATA]).slice(0, numWeapons);
    this.shopInventory.set('weapons', weapons);
    
    // Random armor
    const armor = RNG.shuffle([...ARMOR_DATA]).slice(0, numArmor);
    this.shopInventory.set('armor', armor);
    
    // All items always available
    this.shopInventory.set('items', [...COMBAT_ITEMS]);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.08);
      overlay.setDisplaySize(width, height);
    }
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 35, '🛒 MERCHANT', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 65, '"Best wares this side of the arena..."', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Gold display
    this.goldText = this.add.text(width - 20, 20, `💰 ${this.gold}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(1, 0);
  }

  private createCategoryTabs(): void {
    const { width } = this.cameras.main;
    const tabY = 100;
    const tabWidth = 100;
    const spacing = 110;
    const startX = width / 2 - spacing;
    
    const categories: { id: 'weapons' | 'armor' | 'items'; label: string }[] = [
      { id: 'items', label: '🧪 Items' },
      { id: 'weapons', label: '⚔️ Weapons' },
      { id: 'armor', label: '🛡️ Armor' }
    ];
    
    categories.forEach((cat, i) => {
      const x = startX + i * spacing;
      const btn = UIHelper.createButton(
        this, x, tabY, cat.label,
        () => this.selectCategory(cat.id),
        { width: tabWidth, height: 35, fontSize: '11px' }
      );
      btn.setData('category', cat.id);
    });
  }

  private selectCategory(category: 'weapons' | 'armor' | 'items'): void {
    this.selectedCategory = category;
    this.createItemList();
  }

  private createItemList(): void {
    const { width, height } = this.cameras.main;
    
    // Clear existing
    if (this.itemsContainer) {
      this.itemsContainer.destroy();
    }
    
    this.itemsContainer = this.add.container(0, 0);
    
    const items = this.shopInventory.get(this.selectedCategory) || [];
    const startY = 150;
    const itemHeight = 80;
    
    items.forEach((item, i) => {
      const y = startY + i * itemHeight;
      this.createItemCard(item, 30, y, width - 60, 70);
    });
    
    if (items.length === 0) {
      this.add.text(width / 2, 250, 'No items available', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
    }
  }

  private createItemCard(item: any, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    this.itemsContainer.add(container);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, w, h, 8);
    bg.lineStyle(1, 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, w, h, 8);
    container.add(bg);
    
    // Rarity color
    const rarityColors: Record<string, string> = {
      common: '#8b8b8b',
      uncommon: '#2e8b57',
      rare: '#4169e1',
      legendary: '#ffd700'
    };
    const rarityColor = rarityColors[item.rarity] || '#8b8b8b';
    
    // Item name
    const name = this.add.text(15, 12, item.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: rarityColor
    });
    container.add(name);
    
    // Description
    const desc = this.add.text(15, 32, item.description || item.effect, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      wordWrap: { width: w - 100 }
    });
    container.add(desc);
    
    // Price
    const price = this.add.text(w - 15, 12, `💰 ${item.price}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: this.gold >= item.price ? '#ffd700' : '#8b0000'
    }).setOrigin(1, 0);
    container.add(price);
    
    // Buy button
    const canAfford = this.gold >= item.price;
    const buyBtn = UIHelper.createButton(
      this, w - 45, h - 20, 'BUY',
      () => this.buyItem(item),
      { width: 60, height: 25, fontSize: '10px', primary: canAfford }
    );
    container.add(buyBtn);
    
    if (!canAfford) {
      buyBtn.setAlpha(0.5);
    }
  }

  private buyItem(item: any): void {
    if (this.gold < item.price) {
      UIHelper.showNotification(this, 'Not enough gold!');
      return;
    }
    
    // Deduct gold
    this.gold -= item.price;
    this.goldText.setText(`💰 ${this.gold}`);
    
    // Add to fighter inventory
    if (this.selectedCategory === 'items') {
      this.fighter.inventory.push({
        id: item.id,
        name: item.name,
        type: 'accessory',
        rarity: 'common',
        stats: {},
        description: item.description
      });
    } else if (this.selectedCategory === 'weapons') {
      this.fighter.equipment.weapon = {
        id: item.id,
        name: item.name,
        type: 'weapon',
        rarity: item.rarity,
        stats: { 
          attack: item.attackBonus,
          accuracy: item.accuracyBonus,
          critChance: item.critBonus
        },
        effect: item.effect,
        description: item.description
      };
    } else if (this.selectedCategory === 'armor') {
      this.fighter.equipment.armor = {
        id: item.id,
        name: item.name,
        type: 'armor',
        rarity: item.rarity,
        stats: {
          defense: item.defenseBonus,
          maxHP: item.hpBonus,
          speed: -item.speedPenalty
        },
        effect: item.effect,
        description: item.description
      };
    }
    
    // Save
    SaveSystem.updateRun({ fighter: this.fighter, gold: this.gold });
    
    UIHelper.showNotification(this, `Purchased ${item.name}!`);
    
    // Refresh list
    this.createItemList();
  }

  private createBackButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 50,
      '← BACK TO CAMP',
      () => this.returnToCamp(),
      { width: 180, height: 45 }
    );
  }

  private returnToCamp(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
