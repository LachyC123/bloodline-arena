/**
 * CampScene - Main hub with equipment, power rating, and responsive layout
 * Uses unified Button component for reliable touch handling
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, healInjuries, restoreFighter, getVoiceLine } from '../systems/FighterSystem';
import { getGhostMoment, getGhostMomentText } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';
import { Button, IconButton } from '../ui/Button';
import { getSafeArea, getContentArea, anchorBottom, MIN_TOUCH_SIZE } from '../ui/Layout';
import { calculatePower, formatPower, getTierColor, PowerResult, getPowerDelta, getPowerAssessment } from '../systems/PowerScore';
import { 
  getItemName, 
  getItemIcon, 
  getItemRarity, 
  getItemData,
  ItemInstance, 
  Loadout,
  RARITY_COLORS,
  calculateLoadoutStats
} from '../systems/InventorySystem';
import { WeaponData } from '../data/WeaponsData';
import { ArmorData } from '../data/ArmorData';

export class CampScene extends Phaser.Scene {
  private fighter!: Fighter;
  private gold!: number;
  private week!: number;
  private league!: string;
  private powerResult!: PowerResult;
  
  // UI elements
  private fighterSprite?: Phaser.GameObjects.Container;
  private campfireGlow?: Phaser.GameObjects.Graphics;
  private powerText?: Phaser.GameObjects.Text;
  private equipmentModal?: Phaser.GameObjects.Container;
  
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
    
    // Calculate power
    this.powerResult = calculatePower(this.fighter);
    
    this.createBackground();
    this.createHeader();
    this.createPowerDisplay();
    this.createFighterDisplay();
    this.createEquipmentPanel();
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
    const fireBase = this.add.graphics();
    fireBase.fillStyle(0x3a2a1a, 1);
    fireBase.fillEllipse(x, y + 15, 35, 12);
    
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
  }

  private createPowerDisplay(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    // Power rating - centered at top
    const powerY = safe.top + 50;
    
    // Background panel
    const assessment = getPowerAssessment(this.powerResult);
    
    const powerBg = this.add.graphics();
    powerBg.fillStyle(0x1a1510, 0.9);
    powerBg.fillRoundedRect(width / 2 - 70, powerY - 12, 140, 32, 6);
    powerBg.lineStyle(1, 0x5a4a3a, 0.8);
    powerBg.strokeRoundedRect(width / 2 - 70, powerY - 12, 140, 32, 6);
    
    // Power icon and value
    this.add.text(width / 2 - 55, powerY, '⚡', { fontSize: '16px' }).setOrigin(0, 0.5);
    
    this.powerText = this.add.text(width / 2 - 30, powerY - 2, `POWER: ${formatPower(this.powerResult.power)}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: assessment.color
    }).setOrigin(0, 0.5);
    
    this.add.text(width / 2 - 30, powerY + 12, assessment.label.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: assessment.color
    }).setOrigin(0, 0.5);
    
    // Make tappable for breakdown
    const hitArea = this.add.rectangle(width / 2, powerY, 120, 32, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.showPowerBreakdown());
  }

  private showPowerBreakdown(): void {
    const { width, height } = this.cameras.main;
    const breakdown = this.powerResult.breakdown;
    
    // Modal overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.setDepth(100);
    
    const modalW = Math.min(280, width - 40);
    const modalH = 320;
    const modalX = width / 2;
    const modalY = height / 2;
    
    const modal = this.add.container(modalX, modalY);
    modal.setDepth(101);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    bg.lineStyle(2, 0xc9a959, 1);
    bg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    modal.add(bg);
    
    // Title
    modal.add(this.add.text(0, -modalH / 2 + 25, 'POWER BREAKDOWN', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c9a959'
    }).setOrigin(0.5));
    
    const assessment = getPowerAssessment(this.powerResult);
    
    modal.add(this.add.text(0, -modalH / 2 + 45, `Total: ${formatPower(this.powerResult.power)}`, {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: assessment.color
    }).setOrigin(0.5));
    
    // Expected power comparison
    modal.add(this.add.text(0, -modalH / 2 + 65, `${assessment.label} · ${assessment.vsExpected}`, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: assessment.color
    }).setOrigin(0.5));
    
    // Category breakdown
    let y = -modalH / 2 + 80;
    const addLine = (label: string, value: number, color: string = '#8b7355') => {
      modal.add(this.add.text(-modalW / 2 + 20, y, label, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#5a4a3a'
      }));
      modal.add(this.add.text(modalW / 2 - 20, y, `+${value}`, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color
      }).setOrigin(1, 0));
      y += 22;
    };
    
    addLine('Base Stats', breakdown.baseStats, '#8b7355');
    addLine('Weapon', breakdown.weapon, '#cd5c5c');
    addLine('Armor', breakdown.armor, '#5f9ea0');
    addLine('Traits & Perks', breakdown.traits, '#daa520');
    addLine('Buffs', breakdown.buffs, '#6b8e23');
    if (breakdown.penalties > 0) {
      modal.add(this.add.text(-modalW / 2 + 20, y, 'Penalties', {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#5a4a3a'
      }));
      modal.add(this.add.text(modalW / 2 - 20, y, `-${breakdown.penalties}`, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8b0000'
      }).setOrigin(1, 0));
      y += 22;
    }
    
    // Divider
    y += 10;
    bg.lineStyle(1, 0x5a4a3a, 0.5);
    bg.moveTo(-modalW / 2 + 20, y);
    bg.lineTo(modalW / 2 - 20, y);
    bg.strokePath();
    y += 15;
    
    // Detailed breakdown
    modal.add(this.add.text(0, y, 'DETAILS', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#c9a959'
    }).setOrigin(0.5));
    y += 18;
    
    const details = breakdown.details;
    const col1X = -modalW / 2 + 25;
    const col2X = 10;
    
    const addDetailRow = (left: { label: string; value: number }, right: { label: string; value: number }) => {
      modal.add(this.add.text(col1X, y, `${left.label}: ${left.value}`, {
        fontFamily: 'Georgia, serif', fontSize: '9px', color: '#5a4a3a'
      }));
      modal.add(this.add.text(col2X, y, `${right.label}: ${right.value}`, {
        fontFamily: 'Georgia, serif', fontSize: '9px', color: '#5a4a3a'
      }));
      y += 16;
    };
    
    addDetailRow({ label: 'HP', value: details.hp }, { label: 'Damage', value: details.damage });
    addDetailRow({ label: 'Defense', value: details.defense }, { label: 'Stamina', value: details.stamina });
    addDetailRow({ label: 'Crit', value: details.crit }, { label: 'Dodge', value: details.dodge });
    addDetailRow({ label: 'Speed', value: details.speed }, { label: 'Special', value: details.special });
    
    // Close button
    const closeBtn = new Button(this, 0, modalH / 2 - 35, 'CLOSE', () => {
      overlay.destroy();
      modal.destroy();
    }, { width: 100, height: 40 });
    closeBtn.setDepth(102);
    modal.add(closeBtn);
    
    // Close on overlay tap
    overlay.on('pointerdown', () => {
      overlay.destroy();
      modal.destroy();
    });
  }

  private createFighterDisplay(): void {
    const { width, height } = this.cameras.main;
    
    const fighterY = height * 0.3;
    this.fighterSprite = this.add.container(width * 0.5, fighterY);
    
    const portraitSize = Math.min(70, width * 0.18);
    const portrait = PortraitRenderer.renderPortrait(
      this, this.fighter.portrait, 0, 0, portraitSize
    );
    this.fighterSprite.add(portrait);
    
    if (this.fighter.injuries.length > 0) {
      const badge = this.add.text(portraitSize / 2 + 5, -portraitSize / 2, '🩹', { fontSize: '14px' });
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
    
    // Fighter name
    this.add.text(width * 0.5, fighterY + portraitSize / 2 + 12, this.fighter.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Make clickable for character sheet
    const hitArea = this.add.rectangle(width * 0.5, fighterY, portraitSize + 30, portraitSize + 30, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.showCharacterInfo());
    
    // Customize button (small icon near portrait)
    const customizeBtn = new IconButton(this, width * 0.5 + portraitSize / 2 + 20, fighterY, '🎨', () => {
      this.goToCustomize();
    }, 36);
    customizeBtn.setDepth(5);
  }

  private createEquipmentPanel(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const panelY = height * 0.44;
    const panelWidth = Math.min(300, width - safe.left - safe.right - 20);
    const panelX = width / 2;
    
    const panel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 0.85);
    bg.fillRoundedRect(-panelWidth / 2, 0, panelWidth, 55, 6);
    bg.lineStyle(1, 0x3a2a1a, 1);
    bg.strokeRoundedRect(-panelWidth / 2, 0, panelWidth, 55, 6);
    panel.add(bg);
    
    // "EQUIPMENT" label
    panel.add(this.add.text(0, 8, 'EQUIPMENT', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#5a4a3a'
    }).setOrigin(0.5));
    
    // Equipment slots
    const inventory = SaveSystem.getInventory();
    const loadout = SaveSystem.getLoadout();
    
    const slots = [
      { id: loadout.weaponId, type: 'weapon', icon: '⚔️', label: 'Weapon' },
      { id: loadout.armorId, type: 'armor', icon: '🛡️', label: 'Armor' },
      { id: loadout.helmetId, type: 'helmet', icon: '⛑️', label: 'Helm' },
      { id: loadout.trinket1Id, type: 'trinket', icon: '💎', label: 'Trinket' }
    ];
    
    const slotWidth = 55;
    const slotSpacing = 8;
    const totalWidth = slots.length * slotWidth + (slots.length - 1) * slotSpacing;
    let slotX = -totalWidth / 2 + slotWidth / 2;
    
    slots.forEach((slot) => {
      const slotContainer = this.add.container(slotX, 35);
      
      // Slot background
      const slotBg = this.add.graphics();
      const hasItem = !!slot.id;
      slotBg.fillStyle(hasItem ? 0x2a3a2a : 0x2a1f1a, 1);
      slotBg.fillRoundedRect(-24, -14, 48, 28, 4);
      slotBg.lineStyle(1, hasItem ? 0x6b8e23 : 0x3a2a1a, 1);
      slotBg.strokeRoundedRect(-24, -14, 48, 28, 4);
      slotContainer.add(slotBg);
      
      // Item icon or placeholder
      let displayIcon = slot.icon;
      let displayText = 'Empty';
      
      if (slot.id) {
        const item = inventory.find(i => i.instanceId === slot.id);
        if (item) {
          displayIcon = getItemIcon(item);
          displayText = getItemName(item).split(' ')[0]; // First word
        }
      }
      
      slotContainer.add(this.add.text(0, -2, displayIcon, { fontSize: '18px' }).setOrigin(0.5));
      
      // Make tappable
      const hitArea = this.add.rectangle(0, 0, 50, 30, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => this.openEquipmentPicker(slot.type));
      slotContainer.add(hitArea);
      
      panel.add(slotContainer);
      slotX += slotWidth + slotSpacing;
    });
  }

  private openEquipmentPicker(slotType: string): void {
    const { width, height } = this.cameras.main;
    const inventory = SaveSystem.getInventory();
    const loadout = SaveSystem.getLoadout();
    
    // Filter inventory by slot type
    let filteredItems: ItemInstance[];
    switch (slotType) {
      case 'weapon':
        filteredItems = inventory.filter(i => i.itemType === 'weapon');
        break;
      case 'armor':
        filteredItems = inventory.filter(i => i.itemType === 'armor' && i.slot === 'body');
        break;
      case 'helmet':
        filteredItems = inventory.filter(i => i.itemType === 'armor' && i.slot === 'helmet');
        break;
      case 'trinket':
        filteredItems = inventory.filter(i => i.itemType === 'trinket');
        break;
      default:
        filteredItems = [];
    }
    
    // Sort by rarity
    const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    filteredItems.sort((a, b) => {
      return (rarityOrder[getItemRarity(a)] || 5) - (rarityOrder[getItemRarity(b)] || 5);
    });
    
    // Modal overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.setDepth(100);
    
    const modalW = Math.min(300, width - 30);
    const modalH = Math.min(450, height - 100);
    const modalX = width / 2;
    const modalY = height / 2;
    
    this.equipmentModal = this.add.container(modalX, modalY);
    this.equipmentModal.setDepth(101);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    bg.lineStyle(2, 0xc9a959, 1);
    bg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    this.equipmentModal.add(bg);
    
    // Title
    this.equipmentModal.add(this.add.text(0, -modalH / 2 + 20, `SELECT ${slotType.toUpperCase()}`, {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c9a959'
    }).setOrigin(0.5));
    
    // Item list
    const listStartY = -modalH / 2 + 50;
    const cardHeight = 65;
    const cardSpacing = 8;
    let cardY = listStartY;
    
    if (filteredItems.length === 0) {
      this.equipmentModal.add(this.add.text(0, 0, 'No items available', {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#5a4a3a'
      }).setOrigin(0.5));
    } else {
      filteredItems.slice(0, 5).forEach((item) => {
        const card = this.createEquipmentCard(item, modalW - 30, cardHeight, slotType, loadout, overlay);
        card.y = cardY + cardHeight / 2;
        this.equipmentModal!.add(card);
        cardY += cardHeight + cardSpacing;
      });
    }
    
    // Close button
    const closeBtn = new Button(this, 0, modalH / 2 - 35, 'CLOSE', () => {
      overlay.destroy();
      this.equipmentModal?.destroy();
      this.equipmentModal = undefined;
    }, { width: 100, height: 40 });
    closeBtn.setDepth(102);
    this.equipmentModal.add(closeBtn);
    
    // Close on overlay tap
    overlay.on('pointerdown', () => {
      overlay.destroy();
      this.equipmentModal?.destroy();
      this.equipmentModal = undefined;
    });
  }

  private createEquipmentCard(
    item: ItemInstance,
    w: number,
    h: number,
    slotType: string,
    loadout: Loadout,
    overlay: Phaser.GameObjects.Graphics
  ): Phaser.GameObjects.Container {
    const card = this.add.container(0, 0);
    const data = getItemData(item);
    const rarity = getItemRarity(item);
    
    // Check if equipped
    let isEquipped = false;
    switch (slotType) {
      case 'weapon': isEquipped = loadout.weaponId === item.instanceId; break;
      case 'armor': isEquipped = loadout.armorId === item.instanceId; break;
      case 'helmet': isEquipped = loadout.helmetId === item.instanceId; break;
      case 'trinket': isEquipped = loadout.trinket1Id === item.instanceId || loadout.trinket2Id === item.instanceId; break;
    }
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(isEquipped ? 0x2a4a2a : 0x2a1f1a, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(2, RARITY_COLORS[rarity] || 0x5a4a3a, isEquipped ? 1 : 0.6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    card.add(bg);
    
    // Icon
    card.add(this.add.text(-w / 2 + 20, 0, getItemIcon(item), { fontSize: '22px' }).setOrigin(0.5));
    
    // Name
    card.add(this.add.text(-w / 2 + 45, -h / 2 + 15, getItemName(item), {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#c9a959'
    }));
    
    // Stats
    let statsText = '';
    if (item.itemType === 'weapon' && data) {
      const weapon = data as WeaponData;
      statsText = `${weapon.damageMin}-${weapon.damageMax} DMG`;
    } else if (item.itemType === 'armor' && data) {
      const armor = data as ArmorData;
      statsText = `${armor.defense} DEF`;
    }
    
    card.add(this.add.text(-w / 2 + 45, -h / 2 + 32, statsText, {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#8b7355'
    }));
    
    // Equipped indicator or Equip button
    if (isEquipped) {
      card.add(this.add.text(w / 2 - 15, 0, '✓', {
        fontSize: '18px', color: '#6b8e23'
      }).setOrigin(1, 0.5));
    } else {
      // Power delta preview
      const currentPower = this.powerResult.power;
      // Calculate power with this item equipped
      const tempLoadout = { ...loadout };
      switch (slotType) {
        case 'weapon': tempLoadout.weaponId = item.instanceId; break;
        case 'armor': tempLoadout.armorId = item.instanceId; break;
        case 'helmet': tempLoadout.helmetId = item.instanceId; break;
        case 'trinket': tempLoadout.trinket1Id = item.instanceId; break;
      }
      const newPowerResult = calculatePower(this.fighter, SaveSystem.getInventory(), tempLoadout);
      const delta = getPowerDelta(currentPower, newPowerResult.power);
      
      card.add(this.add.text(w / 2 - 15, -5, delta.text, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: delta.color
      }).setOrigin(1, 0.5));
      
      card.add(this.add.text(w / 2 - 15, 10, 'PWR', {
        fontFamily: 'Georgia, serif', fontSize: '8px', color: '#5a4a3a'
      }).setOrigin(1, 0.5));
    }
    
    // Make tappable to equip
    const hitArea = this.add.rectangle(0, 0, w, h, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
      if (!isEquipped) {
        // Equip the item
        switch (slotType) {
          case 'weapon': SaveSystem.equipItem(item.instanceId, 'weaponId'); break;
          case 'armor': SaveSystem.equipItem(item.instanceId, 'armorId'); break;
          case 'helmet': SaveSystem.equipItem(item.instanceId, 'helmetId'); break;
          case 'trinket': 
            if (!loadout.trinket1Id) SaveSystem.equipItem(item.instanceId, 'trinket1Id');
            else SaveSystem.equipItem(item.instanceId, 'trinket2Id');
            break;
        }
        
        // Close modal and refresh
        overlay.destroy();
        this.equipmentModal?.destroy();
        this.equipmentModal = undefined;
        this.scene.restart();
      }
    });
    card.add(hitArea);
    
    return card;
  }

  private createActionButtons(): void {
    const { width, height } = this.cameras.main;
    const content = getContentArea(this);
    
    const buttonWidth = Math.min(150, (content.width - 20) / 2);
    const buttonHeight = Math.max(MIN_TOUCH_SIZE, 54);
    const spacing = 10;
    
    const startY = height * 0.57;
    const leftX = content.x + buttonWidth / 2 + 8;
    const rightX = content.x + content.width - buttonWidth / 2 - 8;
    
    const fatigue = SaveSystem.getFatigue();
    const canTrain = fatigue < 100;
    const seals = SaveSystem.getSeals();
    
    // TRAIN button
    new Button(this, leftX, startY, '⚔️ TRAIN', () => this.goToTraining(), {
      width: buttonWidth,
      height: buttonHeight,
      icon: '⚔️',
      disabled: !canTrain
    });
    
    // SHOP button
    new Button(this, rightX, startY, '🛒 SHOP', () => this.goToShop(), {
      width: buttonWidth,
      height: buttonHeight
    });
    
    // REST button
    const canRest = fatigue > 0 || this.fighter.injuries.length > 0 || 
                    this.fighter.currentStats.currentHP < this.fighter.currentStats.maxHP;
    new Button(this, leftX, startY + buttonHeight + spacing, '🛏️ REST', () => this.doRest(), {
      width: buttonWidth,
      height: buttonHeight,
      disabled: !canRest
    });
    
    // LETTER button
    new Button(this, rightX, startY + buttonHeight + spacing, '✉️ WRITE', () => this.writeLetter(), {
      width: buttonWidth,
      height: buttonHeight,
      primary: seals > 0
    });
  }
  
  private createBottomBar(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const run = SaveSystem.getRun();
    
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
    barFill.fillRoundedRect(safe.left, barY, barWidth * (run.fightsInLeague / run.fightsToNextLeague), 8, 3);
    
    // FIGHT button
    new Button(this, width / 2, anchorBottom(this, 35), '🗡️ ENTER ARENA', () => this.enterArena(), {
      width: Math.min(220, width - 80),
      height: 52,
      fontSize: 15,
      primary: true
    });
  }

  private showCharacterInfo(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CharacterSheetScene');
    });
  }

  private goToCustomize(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CustomizeScene');
    });
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
    SaveSystem.reduceFatigue(40);
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
      this.scene.start('PrepareScene');
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
          () => this.scene.start('RelicChoiceScene'),
          () => SaveSystem.updateRun({ fightsSinceRelic: 0 }),
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
