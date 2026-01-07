/**
 * PrepareScene - Pre-fight equipment and loadout management
 * Select weapons, armor, trinkets, and consumables before entering the arena
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { UIHelper } from '../ui/UIHelper';
import { 
  getSafeArea, 
  getContentArea, 
  anchorBottom, 
  MIN_TOUCH_SIZE 
} from '../ui/Layout';
import { 
  ItemInstance, 
  Loadout, 
  getItemData, 
  getItemName, 
  getItemIcon, 
  getItemRarity, 
  calculateLoadoutStats, 
  LoadoutStats,
  RARITY_COLORS,
  RARITY_NAMES
} from '../systems/InventorySystem';
import { WeaponData, WEAPON_TYPE_INFO } from '../data/WeaponsData';
import { ArmorData, ARMOR_SLOT_INFO } from '../data/ArmorData';
import { getEnemyClass, EnemyClass } from '../data/EnemyClassData';

type InventoryTab = 'weapons' | 'armor' | 'trinkets' | 'consumables';

export class PrepareScene extends Phaser.Scene {
  private fighter!: Fighter;
  private inventory!: ItemInstance[];
  private loadout!: Loadout;
  private enemyClass?: EnemyClass;
  
  private currentTab: InventoryTab = 'weapons';
  private scrollY: number = 0;
  private maxScroll: number = 0;
  
  private itemListContainer?: Phaser.GameObjects.Container;
  private statsPanel?: Phaser.GameObjects.Container;
  private loadoutDisplay?: Phaser.GameObjects.Container;
  private selectedItem?: ItemInstance;
  
  constructor() {
    super({ key: 'PrepareScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('CampScene');
      return;
    }
    
    this.fighter = run.fighter;
    this.inventory = SaveSystem.getInventory();
    this.loadout = SaveSystem.getLoadout();
    
    // Get enemy class if available from registry
    const enemyClassId = this.registry.get('enemyClassId');
    if (enemyClassId) {
      this.enemyClass = getEnemyClass(enemyClassId);
    }
    
    this.createBackground();
    this.createHeader();
    this.createTabs();
    this.createItemList();
    this.createStatsPanel();
    this.createLoadoutDisplay();
    this.createBottomButtons();
    this.createEnemyPreview();
    
    this.cameras.main.fadeIn(200);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1510, 0x1a1510, 0x0a0805, 0x0a0805);
    bg.fillRect(0, 0, width, height);
    
    // Decorative border
    bg.lineStyle(2, 0x3a2a1a, 1);
    bg.strokeRect(5, 5, width - 10, height - 10);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    this.add.text(width / 2, safe.top + 20, 'PREPARE FOR BATTLE', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, safe.top + 42, 'Choose your equipment', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(0.5);
  }

  private createTabs(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const tabY = safe.top + 70;
    
    const tabs: { id: InventoryTab; label: string; icon: string }[] = [
      { id: 'weapons', label: 'Weapons', icon: '⚔️' },
      { id: 'armor', label: 'Armor', icon: '🛡️' },
      { id: 'trinkets', label: 'Trinkets', icon: '💎' },
      { id: 'consumables', label: 'Items', icon: '🧪' }
    ];
    
    const tabWidth = (width - safe.left - safe.right) / tabs.length;
    
    tabs.forEach((tab, i) => {
      const x = safe.left + tabWidth * i + tabWidth / 2;
      const isActive = tab.id === this.currentTab;
      
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x3a2a1a : 0x1a1510, 1);
      tabBg.fillRect(safe.left + tabWidth * i, tabY, tabWidth, 35);
      if (isActive) {
        tabBg.lineStyle(2, 0xc9a959, 1);
        tabBg.strokeRect(safe.left + tabWidth * i, tabY, tabWidth, 35);
      }
      
      this.add.text(x, tabY + 17, `${tab.icon} ${tab.label}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: isActive ? '#c9a959' : '#5a4a3a'
      }).setOrigin(0.5);
      
      // Make interactive
      const hitArea = this.add.rectangle(x, tabY + 17, tabWidth, 35);
      hitArea.setInteractive();
      hitArea.on('pointerdown', () => {
        this.currentTab = tab.id;
        this.scrollY = 0;
        this.refreshItemList();
        this.scene.restart();
      });
    });
  }

  private createItemList(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const listX = safe.left + 10;
    const listY = safe.top + 115;
    const listWidth = width * 0.55 - safe.left;
    const listHeight = height * 0.5;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.8);
    bg.fillRoundedRect(listX - 5, listY - 5, listWidth + 10, listHeight + 10, 5);
    bg.lineStyle(1, 0x3a2a1a, 1);
    bg.strokeRoundedRect(listX - 5, listY - 5, listWidth + 10, listHeight + 10, 5);
    
    this.itemListContainer = this.add.container(listX, listY);
    
    // Filter items by current tab
    const filteredItems = this.getFilteredItems();
    
    // Create item cards
    const cardHeight = 60;
    const cardSpacing = 8;
    let y = 0;
    
    filteredItems.forEach((item) => {
      const card = this.createItemCard(item, 0, y, listWidth, cardHeight);
      this.itemListContainer!.add(card);
      y += cardHeight + cardSpacing;
    });
    
    this.maxScroll = Math.max(0, y - listHeight);
    
    // Enable scrolling
    if (this.maxScroll > 0) {
      const scrollZone = this.add.zone(listX + listWidth / 2, listY + listHeight / 2, listWidth, listHeight);
      scrollZone.setInteractive();
      
      this.input.on('wheel', (pointer: Phaser.Input.Pointer, _go: unknown, _dx: number, dy: number) => {
        if (scrollZone.getBounds().contains(pointer.x, pointer.y)) {
          this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll);
          this.itemListContainer!.y = listY - this.scrollY;
        }
      });
      
      // Touch drag scrolling
      let lastY = 0;
      scrollZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        lastY = pointer.y;
      });
      
      scrollZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) {
          const deltaY = lastY - pointer.y;
          this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, this.maxScroll);
          this.itemListContainer!.y = listY - this.scrollY;
          lastY = pointer.y;
        }
      });
    }
    
    if (filteredItems.length === 0) {
      const emptyText = this.add.text(listWidth / 2, listHeight / 2, 'No items in this category', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
      this.itemListContainer.add(emptyText);
    }
  }

  private getFilteredItems(): ItemInstance[] {
    switch (this.currentTab) {
      case 'weapons':
        return this.inventory.filter(i => i.itemType === 'weapon');
      case 'armor':
        return this.inventory.filter(i => i.itemType === 'armor');
      case 'trinkets':
        return this.inventory.filter(i => i.itemType === 'trinket');
      case 'consumables':
        return this.inventory.filter(i => i.itemType === 'consumable');
      default:
        return [];
    }
  }

  private createItemCard(item: ItemInstance, x: number, y: number, w: number, h: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const data = getItemData(item);
    const rarity = getItemRarity(item);
    const isEquipped = this.isItemEquipped(item);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(isEquipped ? 0x2a3a2a : 0x1a1510, 1);
    bg.fillRoundedRect(0, 0, w, h, 5);
    bg.lineStyle(2, RARITY_COLORS[rarity] || 0x3a2a1a, isEquipped ? 1 : 0.5);
    bg.strokeRoundedRect(0, 0, w, h, 5);
    container.add(bg);
    
    // Icon
    this.add.text(12, h / 2, getItemIcon(item), {
      fontSize: '22px'
    }).setOrigin(0, 0.5);
    container.add(container.last as Phaser.GameObjects.Text);
    
    // Name
    this.add.text(45, 12, getItemName(item), {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    });
    container.add(container.last as Phaser.GameObjects.Text);
    
    // Rarity badge
    this.add.text(w - 10, 12, RARITY_NAMES[rarity], {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: `#${RARITY_COLORS[rarity].toString(16).padStart(6, '0')}`
    }).setOrigin(1, 0);
    container.add(container.last as Phaser.GameObjects.Text);
    
    // Stats preview
    let statsText = '';
    if (item.itemType === 'weapon' && data) {
      const weapon = data as WeaponData;
      statsText = `${weapon.damageMin}-${weapon.damageMax} DMG`;
      if (weapon.effects.length > 0) {
        statsText += ` | ${weapon.effects[0].description}`;
      }
    } else if (item.itemType === 'armor' && data) {
      const armor = data as ArmorData;
      statsText = `${armor.defense} DEF`;
      if (armor.perks.length > 0) {
        statsText += ` | ${armor.perks[0].description}`;
      }
    } else if (item.itemType === 'consumable') {
      statsText = `x${item.quantity}`;
    }
    
    this.add.text(45, h - 18, statsText, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#5a4a3a',
      wordWrap: { width: w - 60 }
    });
    container.add(container.last as Phaser.GameObjects.Text);
    
    // Equipped indicator
    if (isEquipped) {
      this.add.text(w - 10, h - 18, '✓ EQUIPPED', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#6b8e23'
      }).setOrigin(1, 0);
      container.add(container.last as Phaser.GameObjects.Text);
    }
    
    // Make interactive
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a2520, 1);
      bg.fillRoundedRect(0, 0, w, h, 5);
      bg.lineStyle(2, RARITY_COLORS[rarity] || 0x3a2a1a, 1);
      bg.strokeRoundedRect(0, 0, w, h, 5);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(isEquipped ? 0x2a3a2a : 0x1a1510, 1);
      bg.fillRoundedRect(0, 0, w, h, 5);
      bg.lineStyle(2, RARITY_COLORS[rarity] || 0x3a2a1a, isEquipped ? 1 : 0.5);
      bg.strokeRoundedRect(0, 0, w, h, 5);
    });
    
    container.on('pointerdown', () => {
      this.selectItem(item);
    });
    
    return container;
  }

  private isItemEquipped(item: ItemInstance): boolean {
    const loadout = this.loadout;
    return (
      loadout.weaponId === item.instanceId ||
      loadout.armorId === item.instanceId ||
      loadout.helmetId === item.instanceId ||
      loadout.shieldId === item.instanceId ||
      loadout.trinket1Id === item.instanceId ||
      loadout.trinket2Id === item.instanceId ||
      loadout.consumable1Id === item.instanceId ||
      loadout.consumable2Id === item.instanceId
    );
  }

  private selectItem(item: ItemInstance): void {
    this.selectedItem = item;
    this.showItemDetails(item);
  }

  private showItemDetails(item: ItemInstance): void {
    const { width, height } = this.cameras.main;
    const data = getItemData(item);
    if (!data) return;
    
    // Create modal overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    
    const modalW = Math.min(300, width - 40);
    const modalH = 350;
    const modalX = width / 2 - modalW / 2;
    const modalY = height / 2 - modalH / 2;
    
    const modal = this.add.container(modalX, modalY);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(0, 0, modalW, modalH, 10);
    bg.lineStyle(2, RARITY_COLORS[getItemRarity(item)], 1);
    bg.strokeRoundedRect(0, 0, modalW, modalH, 10);
    modal.add(bg);
    
    // Header
    modal.add(this.add.text(modalW / 2, 20, `${getItemIcon(item)} ${getItemName(item)}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5));
    
    modal.add(this.add.text(modalW / 2, 40, RARITY_NAMES[getItemRarity(item)], {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: `#${RARITY_COLORS[getItemRarity(item)].toString(16).padStart(6, '0')}`
    }).setOrigin(0.5));
    
    // Stats
    let yPos = 70;
    
    if (item.itemType === 'weapon') {
      const weapon = data as WeaponData;
      modal.add(this.add.text(20, yPos, `Damage: ${weapon.damageMin}-${weapon.damageMax}`, {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8b7355'
      }));
      yPos += 20;
      modal.add(this.add.text(20, yPos, `Light Cost: ${weapon.lightStaminaCost} | Heavy: ${weapon.heavyStaminaCost}`, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#5a4a3a'
      }));
      yPos += 20;
      
      if (weapon.effects.length > 0) {
        modal.add(this.add.text(20, yPos, 'Effects:', {
          fontFamily: 'Georgia, serif', fontSize: '11px', color: '#c9a959'
        }));
        yPos += 18;
        weapon.effects.forEach(e => {
          modal.add(this.add.text(30, yPos, `• ${e.description}`, {
            fontFamily: 'Georgia, serif', fontSize: '10px', color: '#6b8e23'
          }));
          yPos += 16;
        });
      }
      
      yPos += 10;
      modal.add(this.add.text(20, yPos, weapon.damageDescription, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a',
        wordWrap: { width: modalW - 40 }
      }));
      yPos += 30;
      
      modal.add(this.add.text(20, yPos, `"${weapon.lore}"`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#4a3a2a', fontStyle: 'italic',
        wordWrap: { width: modalW - 40 }
      }));
    } else if (item.itemType === 'armor') {
      const armor = data as ArmorData;
      modal.add(this.add.text(20, yPos, `Defense: ${armor.defense}`, {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8b7355'
      }));
      yPos += 20;
      
      const mods = [];
      if (armor.staminaRegenMod !== 0) mods.push(`Stamina: ${armor.staminaRegenMod > 0 ? '+' : ''}${armor.staminaRegenMod}`);
      if (armor.dodgeMod !== 0) mods.push(`Dodge: ${armor.dodgeMod > 0 ? '+' : ''}${armor.dodgeMod}%`);
      if (armor.speedMod !== 0) mods.push(`Speed: ${armor.speedMod > 0 ? '+' : ''}${armor.speedMod}`);
      
      if (mods.length > 0) {
        modal.add(this.add.text(20, yPos, mods.join(' | '), {
          fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
        }));
        yPos += 20;
      }
      
      if (armor.perks.length > 0) {
        modal.add(this.add.text(20, yPos, 'Perks:', {
          fontFamily: 'Georgia, serif', fontSize: '11px', color: '#c9a959'
        }));
        yPos += 18;
        armor.perks.forEach(p => {
          modal.add(this.add.text(30, yPos, `• ${p.description}`, {
            fontFamily: 'Georgia, serif', fontSize: '10px', color: '#6b8e23'
          }));
          yPos += 16;
        });
      }
      
      yPos += 10;
      modal.add(this.add.text(20, yPos, `"${armor.lore}"`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#4a3a2a', fontStyle: 'italic',
        wordWrap: { width: modalW - 40 }
      }));
    }
    
    // Equip/Unequip button
    const isEquipped = this.isItemEquipped(item);
    const btnY = modalH - 50;
    
    const equipBtn = this.add.container(modalW / 2, btnY);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(isEquipped ? 0x5a2a1a : 0x2a4a2a, 1);
    btnBg.fillRoundedRect(-70, -20, 140, 40, 5);
    equipBtn.add(btnBg);
    equipBtn.add(this.add.text(0, 0, isEquipped ? 'UNEQUIP' : 'EQUIP', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c9a959'
    }).setOrigin(0.5));
    equipBtn.setSize(140, 40);
    equipBtn.setInteractive();
    equipBtn.on('pointerdown', () => {
      if (isEquipped) {
        this.unequipItem(item);
      } else {
        this.equipItem(item);
      }
      overlay.destroy();
      modal.destroy();
      this.scene.restart();
    });
    modal.add(equipBtn);
    
    // Close button
    const closeBtn = this.add.text(modalW - 15, 10, '✕', {
      fontSize: '18px', color: '#8b7355'
    }).setOrigin(1, 0);
    closeBtn.setInteractive();
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      modal.destroy();
    });
    modal.add(closeBtn);
    
    // Close on overlay click
    overlay.on('pointerdown', () => {
      overlay.destroy();
      modal.destroy();
    });
  }

  private equipItem(item: ItemInstance): void {
    switch (item.itemType) {
      case 'weapon':
        SaveSystem.equipItem(item.instanceId, 'weaponId');
        break;
      case 'armor':
        if (item.slot === 'body') {
          SaveSystem.equipItem(item.instanceId, 'armorId');
        } else if (item.slot === 'helmet') {
          SaveSystem.equipItem(item.instanceId, 'helmetId');
        } else if (item.slot === 'shield') {
          SaveSystem.equipItem(item.instanceId, 'shieldId');
        }
        break;
      case 'trinket':
        // Fill first empty slot
        if (!this.loadout.trinket1Id) {
          SaveSystem.equipItem(item.instanceId, 'trinket1Id');
        } else if (!this.loadout.trinket2Id) {
          SaveSystem.equipItem(item.instanceId, 'trinket2Id');
        } else {
          // Replace first
          SaveSystem.equipItem(item.instanceId, 'trinket1Id');
        }
        break;
      case 'consumable':
        if (!this.loadout.consumable1Id) {
          SaveSystem.equipItem(item.instanceId, 'consumable1Id');
        } else if (!this.loadout.consumable2Id) {
          SaveSystem.equipItem(item.instanceId, 'consumable2Id');
        } else {
          SaveSystem.equipItem(item.instanceId, 'consumable1Id');
        }
        break;
    }
    this.loadout = SaveSystem.getLoadout();
  }

  private unequipItem(item: ItemInstance): void {
    SaveSystem.unequipItem(item.instanceId);
    this.loadout = SaveSystem.getLoadout();
  }

  private createStatsPanel(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const panelX = width * 0.55 + 10;
    const panelY = safe.top + 115;
    const panelW = width - panelX - safe.right - 10;
    const panelH = height * 0.35;
    
    this.statsPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.8);
    bg.fillRoundedRect(0, 0, panelW, panelH, 5);
    bg.lineStyle(1, 0x3a2a1a, 1);
    bg.strokeRoundedRect(0, 0, panelW, panelH, 5);
    this.statsPanel.add(bg);
    
    // Title
    this.statsPanel.add(this.add.text(panelW / 2, 15, 'LOADOUT STATS', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#c9a959'
    }).setOrigin(0.5));
    
    // Calculate stats
    const stats = calculateLoadoutStats(this.inventory, this.loadout);
    
    let y = 35;
    const addStat = (label: string, value: string, color: string = '#8b7355') => {
      this.statsPanel!.add(this.add.text(10, y, label, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#5a4a3a'
      }));
      this.statsPanel!.add(this.add.text(panelW - 10, y, value, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color
      }).setOrigin(1, 0));
      y += 16;
    };
    
    addStat('Damage', `${stats.damageMin}-${stats.damageMax}`);
    addStat('Defense', `${stats.totalDefense}`);
    addStat('Accuracy', `${stats.accuracyMod >= 0 ? '+' : ''}${stats.accuracyMod}%`);
    addStat('Crit Chance', `${stats.critChanceMod >= 0 ? '+' : ''}${stats.critChanceMod}%`);
    addStat('Speed', `${stats.speedMod >= 0 ? '+' : ''}${stats.speedMod}`);
    addStat('Dodge', `${stats.dodgeMod >= 0 ? '+' : ''}${stats.dodgeMod}%`);
    
    if (stats.bleedResist > 0) addStat('Bleed Resist', `${stats.bleedResist}%`, '#6b8e23');
    if (stats.stunResist > 0) addStat('Stun Resist', `${stats.stunResist}%`, '#6b8e23');
    if (stats.poisonResist > 0) addStat('Poison Resist', `${stats.poisonResist}%`, '#6b8e23');
  }

  private createLoadoutDisplay(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const panelX = width * 0.55 + 10;
    const panelY = safe.top + 115 + height * 0.36;
    const panelW = width - panelX - safe.right - 10;
    const panelH = height * 0.14;
    
    this.loadoutDisplay = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.8);
    bg.fillRoundedRect(0, 0, panelW, panelH, 5);
    bg.lineStyle(1, 0x3a2a1a, 1);
    bg.strokeRoundedRect(0, 0, panelW, panelH, 5);
    this.loadoutDisplay.add(bg);
    
    // Title
    this.loadoutDisplay.add(this.add.text(panelW / 2, 12, 'EQUIPPED', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c9a959'
    }).setOrigin(0.5));
    
    // Equipped items icons
    const slots = [
      { id: this.loadout.weaponId, label: '⚔️' },
      { id: this.loadout.armorId, label: '🛡️' },
      { id: this.loadout.helmetId, label: '⛑️' },
      { id: this.loadout.trinket1Id, label: '💎' },
      { id: this.loadout.consumable1Id, label: '🧪' }
    ];
    
    const slotWidth = (panelW - 20) / slots.length;
    slots.forEach((slot, i) => {
      const x = 10 + slotWidth * i + slotWidth / 2;
      const y = panelH / 2 + 8;
      
      // Slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(slot.id ? 0x2a3a2a : 0x1a1510, 1);
      slotBg.fillRoundedRect(x - 18, y - 15, 36, 30, 3);
      slotBg.lineStyle(1, slot.id ? 0x6b8e23 : 0x3a2a1a, 1);
      slotBg.strokeRoundedRect(x - 18, y - 15, 36, 30, 3);
      this.loadoutDisplay!.add(slotBg);
      
      // Icon
      let icon = slot.label;
      if (slot.id) {
        const item = this.inventory.find(i => i.instanceId === slot.id);
        if (item) icon = getItemIcon(item);
      }
      this.loadoutDisplay!.add(this.add.text(x, y, icon, {
        fontSize: '16px'
      }).setOrigin(0.5));
    });
  }

  private createEnemyPreview(): void {
    if (!this.enemyClass) return;
    
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const previewY = height * 0.68;
    const previewW = width - safe.left - safe.right;
    
    // Enemy info box
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1a1a, 0.9);
    bg.fillRoundedRect(safe.left, previewY, previewW, 65, 5);
    bg.lineStyle(1, 0x8b0000, 0.5);
    bg.strokeRoundedRect(safe.left, previewY, previewW, 65, 5);
    
    this.add.text(safe.left + 15, previewY + 10, `${this.enemyClass.icon} FACING: ${this.enemyClass.name.toUpperCase()}`, {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9a959'
    });
    
    this.add.text(safe.left + 15, previewY + 28, this.enemyClass.title, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#8b7355'
    });
    
    // Weaknesses
    if (this.enemyClass.weaknesses.length > 0) {
      const weaknesses = this.enemyClass.weaknesses.map(w => w.type).join(', ');
      this.add.text(safe.left + 15, previewY + 45, `⚠️ Weak to: ${weaknesses}`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#6b8e23'
      });
    }
  }

  private createBottomButtons(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const btnY = anchorBottom(this, 40);
    
    // Back button
    const backBtn = this.add.container(safe.left + 70, btnY);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x3a2a1a, 1);
    backBg.fillRoundedRect(-60, -22, 120, 44, 5);
    backBtn.add(backBg);
    backBtn.add(this.add.text(0, 0, '← BACK', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#8b7355'
    }).setOrigin(0.5));
    backBtn.setSize(120, 44);
    backBtn.setInteractive();
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CampScene');
      });
    });
    
    // Fight button
    const fightBtn = this.add.container(width - safe.right - 90, btnY);
    const fightBg = this.add.graphics();
    fightBg.fillStyle(0x5a2a1a, 1);
    fightBg.fillRoundedRect(-80, -22, 160, 44, 5);
    fightBg.lineStyle(2, 0xc9a959, 1);
    fightBg.strokeRoundedRect(-80, -22, 160, 44, 5);
    fightBtn.add(fightBg);
    fightBtn.add(this.add.text(0, 0, '🗡️ ENTER ARENA', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c9a959'
    }).setOrigin(0.5));
    fightBtn.setSize(160, 44);
    fightBtn.setInteractive();
    fightBtn.on('pointerdown', () => {
      // Save loadout
      SaveSystem.setLoadout(this.loadout);
      
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('FightScene');
      });
    });
  }

  private refreshItemList(): void {
    if (this.itemListContainer) {
      this.itemListContainer.destroy();
    }
    this.createItemList();
  }
}
