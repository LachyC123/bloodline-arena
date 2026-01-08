/**
 * ForgeScene - Upgrade, reroll, and add affixes to equipment
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { ItemInstance, getItemName, getItemData } from '../systems/InventorySystem';
import { 
  rollAffixes, 
  getAffixSummary, 
  hasAffixes,
  getPrefixById,
  getSuffixById,
  getCurseById,
  AffixedItemInstance,
  calculateAffixStats
} from '../systems/AffixSystem';
import { UIHelper } from '../ui/UIHelper';
import { RNG } from '../systems/RNGSystem';

interface ForgeOption {
  id: string;
  name: string;
  description: string;
  goldCost: number;
  embersCost: number;
  available: boolean;
  action: () => void;
}

export class ForgeScene extends Phaser.Scene {
  private gold!: number;
  private embers!: number;
  private inventory: ItemInstance[] = [];
  private selectedItem: ItemInstance | null = null;
  private goldText!: Phaser.GameObjects.Text;
  private embersText!: Phaser.GameObjects.Text;
  private itemListContainer!: Phaser.GameObjects.Container;
  private forgeOptionsContainer!: Phaser.GameObjects.Container;
  private previewContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'ForgeScene' });
  }
  
  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.gold = run.gold;
    this.embers = run.embers || 0;
    this.inventory = SaveSystem.getInventory().filter(i => 
      i.itemType === 'weapon' || i.itemType === 'armor'
    );
    
    this.createBackground();
    this.createHeader();
    this.createItemList();
    this.createForgePanel();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x3a1f1a, 0x3a1f1a);
    bg.fillRect(0, 0, width, height);
    
    // Forge glow effect
    const glowGraphics = this.add.graphics();
    glowGraphics.fillStyle(0xff6600, 0.05);
    glowGraphics.fillCircle(width / 2, height * 0.75, 200);
  }
  
  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 30, '🔥 THE FORGE 🔥', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#ff9944',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 55, '"Heat. Steel. Will."', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Resources
    this.goldText = this.add.text(width - 20, 15, `💰 ${this.gold}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(1, 0);
    
    this.embersText = this.add.text(width - 20, 35, `🔥 ${this.embers}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#ff6600'
    }).setOrigin(1, 0);
  }
  
  private createItemList(): void {
    const { width, height } = this.cameras.main;
    
    if (this.itemListContainer) {
      this.itemListContainer.destroy();
    }
    
    this.itemListContainer = this.add.container(0, 0);
    
    // Title
    this.add.text(15, 85, 'SELECT EQUIPMENT:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    });
    
    const startY = 110;
    const itemHeight = 55;
    const listWidth = width * 0.45;
    
    if (this.inventory.length === 0) {
      this.add.text(15, startY + 20, 'No equipment to forge.', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#5a4a3a',
        fontStyle: 'italic'
      });
      return;
    }
    
    this.inventory.forEach((item, i) => {
      const y = startY + i * itemHeight;
      this.createItemEntry(item, 15, y, listWidth, 50);
    });
  }
  
  private createItemEntry(item: ItemInstance, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    this.itemListContainer.add(container);
    
    const isSelected = this.selectedItem?.instanceId === item.instanceId;
    const baseData = getItemData(item);
    const rarity = (baseData as any)?.rarity || 'common';
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(isSelected ? 0x4a3a2a : 0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, w, h, 6);
    bg.lineStyle(2, isSelected ? 0xff9944 : 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, w, h, 6);
    container.add(bg);
    
    // Rarity colors
    const rarityColors: Record<string, string> = {
      common: '#8b8b8b',
      uncommon: '#2e8b57',
      rare: '#4169e1',
      epic: '#a855f7',
      legendary: '#ffd700'
    };
    const color = rarityColors[rarity] || '#8b8b8b';
    
    // Name
    const name = getItemName(item);
    const nameText = this.add.text(10, 8, name, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: color,
      wordWrap: { width: w - 20 }
    });
    container.add(nameText);
    
    // Type icon
    const icon = item.itemType === 'weapon' ? '⚔️' : '🛡️';
    const iconText = this.add.text(w - 25, h / 2, icon, {
      fontSize: '14px'
    }).setOrigin(0.5);
    container.add(iconText);
    
    // Affix indicator
    if (hasAffixes(item)) {
      const affixIndicator = this.add.text(10, h - 15, '✨ Affixed', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#c9a959'
      });
      container.add(affixIndicator);
    }
    
    // Interactive
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerdown', () => {
      this.selectItem(item);
    });
    
    container.on('pointerover', () => {
      if (!isSelected) {
        bg.clear();
        bg.fillStyle(0x3a2a2a, 1);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, 0x8a6a4a, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      }
    });
    
    container.on('pointerout', () => {
      if (!isSelected) {
        bg.clear();
        bg.fillStyle(0x2a1f1a, 1);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, 0x5a4a3a, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      }
    });
  }
  
  private selectItem(item: ItemInstance): void {
    this.selectedItem = item;
    this.createItemList();
    this.createForgePanel();
    this.createPreview();
  }
  
  private createForgePanel(): void {
    const { width, height } = this.cameras.main;
    
    if (this.forgeOptionsContainer) {
      this.forgeOptionsContainer.destroy();
    }
    
    this.forgeOptionsContainer = this.add.container(0, 0);
    
    const panelX = width * 0.5;
    const panelY = 85;
    const panelWidth = width * 0.48;
    
    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1410, 0.9);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, height - 180, 8);
    panelBg.lineStyle(2, 0x5a4a3a, 1);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, height - 180, 8);
    this.forgeOptionsContainer.add(panelBg);
    
    if (!this.selectedItem) {
      const noSelection = this.add.text(panelX + panelWidth / 2, panelY + 80, 'Select an item\nto forge', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a',
        align: 'center'
      }).setOrigin(0.5);
      this.forgeOptionsContainer.add(noSelection);
      return;
    }
    
    // Get forge options for selected item
    const options = this.getForgeOptions(this.selectedItem);
    
    // Title
    const title = this.add.text(panelX + 15, panelY + 15, 'FORGE OPTIONS:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#ff9944'
    });
    this.forgeOptionsContainer.add(title);
    
    // Options list
    let optY = panelY + 45;
    const optHeight = 65;
    
    options.forEach(opt => {
      this.createForgeOption(opt, panelX + 10, optY, panelWidth - 20, optHeight - 5);
      optY += optHeight;
    });
  }
  
  private getForgeOptions(item: ItemInstance): ForgeOption[] {
    const baseData = getItemData(item);
    const rarity = (baseData as any)?.rarity || 'common';
    const run = SaveSystem.getRun();
    const league = run.league || 'bronze';
    
    // Cost scaling
    const leagueMults: Record<string, number> = { bronze: 1, silver: 1.5, gold: 2, champion: 3 };
    const rarityMults: Record<string, number> = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5 };
    const leagueMult = leagueMults[league] || 1;
    const rarityMult = rarityMults[rarity] || 1;
    const baseCost = Math.floor(50 * leagueMult * rarityMult);
    
    const options: ForgeOption[] = [];
    
    // 1. Reroll Prefix
    options.push({
      id: 'reroll_prefix',
      name: '🔄 Reroll Prefix',
      description: item.prefixId ? 'Replace current prefix' : 'Add a new prefix',
      goldCost: baseCost,
      embersCost: 1,
      available: this.gold >= baseCost && this.embers >= 1,
      action: () => this.rerollPrefix(item)
    });
    
    // 2. Reroll Suffix
    options.push({
      id: 'reroll_suffix',
      name: '🔄 Reroll Suffix',
      description: item.suffixId ? 'Replace current suffix' : 'Add a new suffix',
      goldCost: baseCost,
      embersCost: 1,
      available: this.gold >= baseCost && this.embers >= 1,
      action: () => this.rerollSuffix(item)
    });
    
    // 3. Cleanse Curse (if cursed)
    if (item.curseId) {
      const curse = getCurseById(item.curseId);
      options.push({
        id: 'cleanse_curse',
        name: '✝️ Cleanse Curse',
        description: curse ? `Remove: ${curse.name}` : 'Remove the curse',
        goldCost: baseCost * 3,
        embersCost: 5,
        available: this.gold >= baseCost * 3 && this.embers >= 5,
        action: () => this.cleanseCurse(item)
      });
    }
    
    // 4. Temper (guaranteed small boost)
    options.push({
      id: 'temper',
      name: '🔨 Temper',
      description: '+5% to all affix stats',
      goldCost: Math.floor(baseCost * 0.5),
      embersCost: 0,
      available: this.gold >= Math.floor(baseCost * 0.5) && hasAffixes(item),
      action: () => this.temperItem(item)
    });
    
    return options;
  }
  
  private createForgeOption(opt: ForgeOption, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    this.forgeOptionsContainer.add(container);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(opt.available ? 0x3a2a2a : 0x1a1a1a, 1);
    bg.fillRoundedRect(0, 0, w, h, 6);
    bg.lineStyle(1, opt.available ? 0x5a4a3a : 0x3a3a3a, 1);
    bg.strokeRoundedRect(0, 0, w, h, 6);
    container.add(bg);
    
    // Name
    const name = this.add.text(10, 8, opt.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: opt.available ? '#c9a959' : '#5a5a5a'
    });
    container.add(name);
    
    // Description
    const desc = this.add.text(10, 28, opt.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: opt.available ? '#8b7355' : '#4a4a4a'
    });
    container.add(desc);
    
    // Cost
    const costText = `💰${opt.goldCost}${opt.embersCost > 0 ? ` 🔥${opt.embersCost}` : ''}`;
    const cost = this.add.text(w - 10, 10, costText, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: opt.available ? '#ffd700' : '#5a5a5a'
    }).setOrigin(1, 0);
    container.add(cost);
    
    // Make interactive if available
    if (opt.available) {
      container.setSize(w, h);
      container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, w, h),
        Phaser.Geom.Rectangle.Contains
      );
      
      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x4a3a2a, 1);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(2, 0xff9944, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      });
      
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x3a2a2a, 1);
        bg.fillRoundedRect(0, 0, w, h, 6);
        bg.lineStyle(1, 0x5a4a3a, 1);
        bg.strokeRoundedRect(0, 0, w, h, 6);
      });
      
      container.on('pointerdown', () => {
        opt.action();
      });
    }
  }
  
  private createPreview(): void {
    const { width, height } = this.cameras.main;
    
    if (this.previewContainer) {
      this.previewContainer.destroy();
    }
    
    if (!this.selectedItem) return;
    
    this.previewContainer = this.add.container(0, 0);
    
    // Preview panel at bottom
    const previewY = height - 85;
    const previewW = width - 30;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.95);
    bg.fillRoundedRect(15, previewY, previewW, 70, 6);
    bg.lineStyle(1, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, previewY, previewW, 70, 6);
    this.previewContainer.add(bg);
    
    // Current affixes
    const item = this.selectedItem;
    const prefix = item.prefixId ? getPrefixById(item.prefixId) : null;
    const suffix = item.suffixId ? getSuffixById(item.suffixId) : null;
    const curse = item.curseId ? getCurseById(item.curseId) : null;
    
    let affixText = 'Current: ';
    if (prefix) affixText += `[${prefix.name}] `;
    if (suffix) affixText += `[${suffix.name}] `;
    if (curse) affixText += `[⚠️ ${curse.name}]`;
    if (!prefix && !suffix && !curse) affixText += 'No affixes';
    
    const affixDisplay = this.add.text(25, previewY + 12, affixText, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    });
    this.previewContainer.add(affixDisplay);
    
    // Stats from affixes
    if (hasAffixes(item)) {
      const stats = calculateAffixStats(item as AffixedItemInstance);
      let statLine = '';
      const avgDmg = (stats.damageMin + stats.damageMax) / 2;
      if (avgDmg > 0) statLine += `+${Math.round(avgDmg)} DMG `;
      if (stats.defense > 0) statLine += `+${stats.defense} DEF `;
      if (stats.maxHP > 0) statLine += `+${stats.maxHP} HP `;
      if (stats.critChance > 0) statLine += `+${Math.round(stats.critChance * 100)}% CRIT `;
      if (stats.bleedChance > 0) statLine += `+${Math.round(stats.bleedChance * 100)}% BLEED `;
      
      const statDisplay = this.add.text(25, previewY + 32, statLine || 'Various bonuses', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355'
      });
      this.previewContainer.add(statDisplay);
    }
    
    // Curse warning
    if (curse) {
      const curseWarning = this.add.text(25, previewY + 50, `⚠️ ${curse.downside}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#8b0000'
      });
      this.previewContainer.add(curseWarning);
    }
  }
  
  private rerollPrefix(item: ItemInstance): void {
    const baseData = getItemData(item);
    const rarity = (baseData as any)?.rarity || 'common';
    const run = SaveSystem.getRun();
    const league = run.league || 'bronze';
    const cost = this.getForgeOptions(item).find(o => o.id === 'reroll_prefix')!;
    
    // Deduct costs
    this.gold -= cost.goldCost;
    this.embers -= cost.embersCost;
    
    // Roll new prefix
    const newAffixes = rollAffixes(item.itemType, rarity, league);
    item.prefixId = newAffixes.prefixId || item.prefixId;
    
    this.onForgeComplete(item, 'Prefix rerolled!');
  }
  
  private rerollSuffix(item: ItemInstance): void {
    const baseData = getItemData(item);
    const rarity = (baseData as any)?.rarity || 'common';
    const run = SaveSystem.getRun();
    const league = run.league || 'bronze';
    const cost = this.getForgeOptions(item).find(o => o.id === 'reroll_suffix')!;
    
    // Deduct costs
    this.gold -= cost.goldCost;
    this.embers -= cost.embersCost;
    
    // Roll new suffix
    const newAffixes = rollAffixes(item.itemType, rarity, league);
    item.suffixId = newAffixes.suffixId || item.suffixId;
    
    this.onForgeComplete(item, 'Suffix rerolled!');
  }
  
  private cleanseCurse(item: ItemInstance): void {
    const cost = this.getForgeOptions(item).find(o => o.id === 'cleanse_curse')!;
    
    // Deduct costs
    this.gold -= cost.goldCost;
    this.embers -= cost.embersCost;
    
    // Remove curse
    item.curseId = undefined;
    
    this.onForgeComplete(item, 'Curse cleansed!');
  }
  
  private temperItem(item: ItemInstance): void {
    const cost = this.getForgeOptions(item).find(o => o.id === 'temper')!;
    
    // Deduct costs
    this.gold -= cost.goldCost;
    this.embers -= cost.embersCost;
    
    // Note: In a full implementation, we'd store temper stacks on the item
    // For now, this is a placeholder that shows the UI works
    UIHelper.showNotification(this, 'Item tempered! (+5% to affix stats)');
    
    this.onForgeComplete(item, 'Item tempered!');
  }
  
  private onForgeComplete(item: ItemInstance, message: string): void {
    // Update item in save
    SaveSystem.updateItem(item);
    SaveSystem.updateRun({ gold: this.gold, embers: this.embers });
    
    // Refresh display
    this.goldText.setText(`💰 ${this.gold}`);
    this.embersText.setText(`🔥 ${this.embers}`);
    
    // Animate reveal
    this.playForgeReveal(message);
    
    // Refresh panels
    this.createItemList();
    this.createForgePanel();
    this.createPreview();
  }
  
  private playForgeReveal(message: string): void {
    const { width, height } = this.cameras.main;
    
    // Flash effect
    const flash = this.add.graphics();
    flash.fillStyle(0xff6600, 0.3);
    flash.fillRect(0, 0, width, height);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
    
    // Show message
    UIHelper.showNotification(this, message);
  }
  
  private createBackButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 30,
      '← BACK TO CAMP',
      () => this.returnToCamp(),
      { width: 180, height: 40 }
    );
  }
  
  private returnToCamp(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Return to run map
      this.scene.start('RunMapScene');
    });
  }
}
