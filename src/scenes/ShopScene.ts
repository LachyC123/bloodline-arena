/**
 * ShopScene - Buy items and equipment
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { WEAPONS_DATA as OLD_WEAPONS, ARMOR_DATA as OLD_ARMOR, COMBAT_ITEMS } from '../data/CombatData';
import { WEAPONS_DATA } from '../data/WeaponsData';
import { ARMOR_DATA } from '../data/ArmorData';
import { 
  createItemInstance, 
  createAffixedItemInstance, 
  ItemInstance, 
  getItemName,
  getItemData 
} from '../systems/InventorySystem';
import { getAffixSummary, hasAffixes } from '../systems/AffixSystem';
import { UIHelper } from '../ui/UIHelper';
import { RNG } from '../systems/RNGSystem';

export class ShopScene extends Phaser.Scene {
  private gold!: number;
  private fighter!: Fighter;
  private selectedCategory: 'weapons' | 'armor' | 'items' = 'items';
  private shopStock: ItemInstance[] = [];
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
    const run = SaveSystem.getRun();
    const league = run.league || 'bronze';
    const numWeapons = 3 + Math.floor(meta.promoterLevel / 2);
    const numArmor = 3 + Math.floor(meta.promoterLevel / 2);
    
    // Filter weapons/armor by league availability
    const leagueOrder = ['bronze', 'silver', 'gold'];
    const leagueIdx = leagueOrder.indexOf(league);
    
    this.shopStock = [];
    
    // Generate weapons as ItemInstances with affixes
    const availableWeapons = WEAPONS_DATA.filter(w => 
      leagueOrder.indexOf(w.leagueMin) <= leagueIdx
    );
    const weapons = RNG.shuffle([...availableWeapons]).slice(0, numWeapons);
    weapons.forEach(w => {
      // Create item instance with affixes rolled based on rarity and league
      const instance = createAffixedItemInstance(w.id, 'weapon', w.rarity, league);
      this.shopStock.push(instance);
    });
    
    // Generate armor as ItemInstances with affixes
    const availableArmor = ARMOR_DATA.filter(a => 
      leagueOrder.indexOf(a.leagueMin) <= leagueIdx
    );
    const armor = RNG.shuffle([...availableArmor]).slice(0, numArmor);
    armor.forEach(a => {
      const instance = createAffixedItemInstance(a.id, 'armor', a.rarity, league, a.slot);
      this.shopStock.push(instance);
    });
    
    // Consumables (no affixes)
    COMBAT_ITEMS.forEach(item => {
      const instance = createItemInstance(item.id, 'consumable', undefined, 1);
      this.shopStock.push(instance);
    });
    
    console.log('[Shop] Generated stock:', this.shopStock.length, 'items');
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
    
    // Filter stock by category
    const categoryItemTypes: Record<string, string[]> = {
      weapons: ['weapon'],
      armor: ['armor'],
      items: ['consumable', 'trinket']
    };
    const validTypes = categoryItemTypes[this.selectedCategory] || ['consumable'];
    const items = this.shopStock.filter(item => validTypes.includes(item.itemType));
    
    const startY = 150;
    const itemHeight = 90;
    
    items.forEach((item, i) => {
      const y = startY + i * itemHeight;
      this.createItemCard(item, 30, y, width - 60, 85);
    });
    
    if (items.length === 0) {
      this.add.text(width / 2, 250, 'No items available', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
    }
  }

  private createItemCard(instance: ItemInstance, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    this.itemsContainer.add(container);
    
    // Get base item data
    const baseData = getItemData(instance);
    if (!baseData) return;
    
    // Rarity from base item
    const rarity = (baseData as any).rarity || 'common';
    const price = (baseData as any).price || 50;
    
    // Background with rarity glow
    const bg = this.add.graphics();
    const rarityGlows: Record<string, number> = {
      common: 0x3a3a3a,
      uncommon: 0x1e5a3a,
      rare: 0x2a3a6a,
      epic: 0x5a2a6a,
      legendary: 0x6a5a1a
    };
    
    // Subtle glow if has affixes
    if (hasAffixes(instance)) {
      bg.fillStyle(rarityGlows[rarity] || 0x3a3a3a, 0.3);
      bg.fillRoundedRect(-2, -2, w + 4, h + 4, 10);
    }
    
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, w, h, 8);
    bg.lineStyle(2, rarityGlows[rarity] || 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, w, h, 8);
    container.add(bg);
    
    // Rarity color
    const rarityColors: Record<string, string> = {
      common: '#8b8b8b',
      uncommon: '#2e8b57',
      rare: '#4169e1',
      epic: '#a855f7',
      legendary: '#ffd700'
    };
    const rarityColor = rarityColors[rarity] || '#8b8b8b';
    
    // Item name (includes affixes)
    const fullName = getItemName(instance);
    const name = this.add.text(15, 10, fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: rarityColor,
      wordWrap: { width: w - 100 }
    });
    container.add(name);
    
    // Affix summary (if any)
    const affixSummary = getAffixSummary(instance);
    if (affixSummary.length > 0) {
      const summaryText = affixSummary.slice(0, 2).join(' • ');
      const affixLine = this.add.text(15, 32, summaryText, {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#c9a959',
        fontStyle: 'italic'
      });
      container.add(affixLine);
    }
    
    // Base stats
    let statsText = '';
    if (instance.itemType === 'weapon' && 'damageMin' in baseData) {
      const weapon = baseData as any;
      statsText = `⚔️ ${weapon.damageMin}-${weapon.damageMax}`;
    } else if (instance.itemType === 'armor' && 'defense' in baseData) {
      const armor = baseData as any;
      statsText = `🛡️ ${armor.defense}`;
    } else if ('effect' in baseData) {
      statsText = (baseData as any).effect;
    }
    
    const stats = this.add.text(15, hasAffixes(instance) ? 48 : 35, statsText, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    });
    container.add(stats);
    
    // Price
    const priceText = this.add.text(w - 15, 10, `💰 ${price}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: this.gold >= price ? '#ffd700' : '#8b0000'
    }).setOrigin(1, 0);
    container.add(priceText);
    
    // Buy button
    const canAfford = this.gold >= price;
    const buyBtn = UIHelper.createButton(
      this, w - 45, h - 22, 'BUY',
      () => this.buyShopItem(instance, price),
      { width: 60, height: 28, fontSize: '11px', primary: canAfford }
    );
    container.add(buyBtn);
    
    if (!canAfford) {
      buyBtn.setAlpha(0.5);
    }
  }

  private buyShopItem(instance: ItemInstance, price: number): void {
    if (this.gold < price) {
      UIHelper.showNotification(this, 'Not enough gold!');
      return;
    }
    
    const goldBefore = this.gold;
    
    // Deduct gold
    this.gold -= price;
    this.goldText.setText(`💰 ${this.gold}`);
    
    // Add the exact ItemInstance (with its affixes) to inventory
    SaveSystem.addItem(instance);
    console.log('[Shop] onPurchase:', instance.instanceId, instance.itemType, 'gold:', goldBefore, '->', this.gold);
    console.log('[Shop] Affixes:', instance.prefixId, instance.suffixId, instance.curseId);
    
    // Update gold in save
    SaveSystem.updateRun({ gold: this.gold });
    
    // Get display name
    const fullName = getItemName(instance);
    UIHelper.showNotification(this, `Purchased ${fullName}!`);
    
    // Remove from shop stock (can only buy once)
    const idx = this.shopStock.findIndex(i => i.instanceId === instance.instanceId);
    if (idx >= 0) {
      this.shopStock.splice(idx, 1);
    }
    
    // Log inventory state
    const inv = SaveSystem.getInventory();
    console.log('[Shop] Inventory after purchase:', inv.length, 'items');
    
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
      // Return to run map after shopping
      this.scene.start('RunMapScene');
    });
  }
}
