/**
 * CodexScene - View discovered enemies, affixes, decrees, etc.
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { 
  CodexCategory, 
  getCategoryIcon, 
  getCategoryName,
  getCodexProgress 
} from '../data/codex';
import { ENEMY_ARCHETYPES } from '../data/EnemyData';
import { ENEMY_MUTATORS } from '../data/enemyMutators';
import { ALL_PREFIXES } from '../data/affixes/prefixes';
import { ALL_SUFFIXES } from '../data/affixes/suffixes';
import { CURSES } from '../data/affixes/curses';
import { DECREES } from '../data/decrees';
import { BIOMES } from '../data/biomes';
import { SIGNATURE_MOVES } from '../data/signatures';
import { WEAPONS_DATA } from '../data/WeaponsData';
import { ARMOR_DATA } from '../data/ArmorData';
import { UIHelper } from '../ui/UIHelper';

interface CodexItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  discovered: boolean;
}

export class CodexScene extends Phaser.Scene {
  private selectedCategory: CodexCategory = 'enemies';
  private categoryButtons: Phaser.GameObjects.Container[] = [];
  private itemListContainer!: Phaser.GameObjects.Container;
  private detailPanel!: Phaser.GameObjects.Container;
  private selectedItem: CodexItem | null = null;
  
  constructor() {
    super({ key: 'CodexScene' });
  }
  
  create(): void {
    this.createBackground();
    this.createHeader();
    this.createCategoryTabs();
    this.createItemList();
    this.createDetailPanel();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
  }
  
  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 30, '📖 CODEX', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 55, 'Your collection of discoveries', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }
  
  private createCategoryTabs(): void {
    const { width } = this.cameras.main;
    const categories: CodexCategory[] = [
      'enemies', 'mutators', 'affixes', 'decrees', 
      'biomes', 'signatures', 'weapons', 'armor'
    ];
    
    const tabHeight = 30;
    const tabsPerRow = 4;
    const tabWidth = (width - 30) / tabsPerRow;
    const startY = 80;
    
    categories.forEach((cat, i) => {
      const row = Math.floor(i / tabsPerRow);
      const col = i % tabsPerRow;
      const x = 15 + col * tabWidth + tabWidth / 2;
      const y = startY + row * (tabHeight + 5);
      
      const isActive = cat === this.selectedCategory;
      const icon = getCategoryIcon(cat);
      
      const container = this.add.container(x, y);
      
      const bg = this.add.graphics();
      bg.fillStyle(isActive ? 0x4a3a2a : 0x2a1f1a, 1);
      bg.fillRoundedRect(-tabWidth / 2 + 2, -tabHeight / 2, tabWidth - 4, tabHeight, 4);
      if (isActive) {
        bg.lineStyle(2, 0xc9a959, 1);
        bg.strokeRoundedRect(-tabWidth / 2 + 2, -tabHeight / 2, tabWidth - 4, tabHeight, 4);
      }
      container.add(bg);
      
      const label = this.add.text(0, 0, `${icon}`, {
        fontSize: '14px'
      }).setOrigin(0.5);
      container.add(label);
      
      if (!isActive) {
        container.setSize(tabWidth - 4, tabHeight);
        container.setInteractive(
          new Phaser.Geom.Rectangle(-tabWidth / 2 + 2, -tabHeight / 2, tabWidth - 4, tabHeight),
          Phaser.Geom.Rectangle.Contains
        );
        
        container.on('pointerdown', () => {
          this.selectedCategory = cat;
          this.scene.restart();
        });
      }
      
      this.categoryButtons.push(container);
    });
  }
  
  private createItemList(): void {
    const { width, height } = this.cameras.main;
    
    if (this.itemListContainer) {
      this.itemListContainer.destroy();
    }
    
    this.itemListContainer = this.add.container(0, 0);
    
    const items = this.getItemsForCategory(this.selectedCategory);
    const discovered = this.getDiscoveredIds(this.selectedCategory);
    
    // Category header
    const catName = getCategoryName(this.selectedCategory);
    const progress = getCodexProgress(discovered, items.length);
    
    this.add.text(20, 145, `${catName} (${discovered.length}/${items.length})`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    });
    
    // Progress bar
    const barWidth = width - 40;
    const barHeight = 8;
    const barY = 168;
    
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2a1f1a, 1);
    barBg.fillRoundedRect(20, barY, barWidth, barHeight, 4);
    this.itemListContainer.add(barBg);
    
    const barFill = this.add.graphics();
    barFill.fillStyle(0xc9a959, 1);
    barFill.fillRoundedRect(20, barY, barWidth * (progress / 100), barHeight, 4);
    this.itemListContainer.add(barFill);
    
    // Item grid
    const startY = 190;
    const itemSize = 50;
    const itemsPerRow = Math.floor((width - 30) / (itemSize + 5));
    
    items.forEach((item, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = 20 + col * (itemSize + 5);
      const y = startY + row * (itemSize + 5);
      
      const isDiscovered = discovered.includes(item.id);
      this.createItemTile(item, x, y, itemSize, isDiscovered);
    });
  }
  
  private createItemTile(item: CodexItem, x: number, y: number, size: number, discovered: boolean): void {
    const container = this.add.container(x + size / 2, y + size / 2);
    this.itemListContainer.add(container);
    
    const bg = this.add.graphics();
    bg.fillStyle(discovered ? 0x3a3a2a : 0x1a1a1a, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 4);
    bg.lineStyle(1, discovered ? 0x5a4a3a : 0x2a2a2a, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 4);
    container.add(bg);
    
    if (discovered) {
      const icon = this.add.text(0, 0, item.icon, {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(icon);
      
      container.setSize(size, size);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
        Phaser.Geom.Rectangle.Contains
      );
      
      container.on('pointerdown', () => {
        this.selectItem({ ...item, discovered: true });
      });
    } else {
      const unknown = this.add.text(0, 0, '?', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#3a3a3a'
      }).setOrigin(0.5);
      container.add(unknown);
    }
  }
  
  private selectItem(item: CodexItem): void {
    this.selectedItem = item;
    this.updateDetailPanel();
  }
  
  private createDetailPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.detailPanel = this.add.container(0, 0);
    
    const panelY = height - 180;
    const panelH = 130;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.detailPanel.add(bg);
    
    const hint = this.add.text(width / 2, panelY + panelH / 2, 'Tap an entry to view details', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.detailPanel.add(hint);
  }
  
  private updateDetailPanel(): void {
    const { width, height } = this.cameras.main;
    const panelY = height - 180;
    const panelH = 130;
    
    this.detailPanel.destroy();
    this.detailPanel = this.add.container(0, 0);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.detailPanel.add(bg);
    
    if (!this.selectedItem) return;
    
    const item = this.selectedItem;
    
    // Icon and name
    const title = this.add.text(25, panelY + 15, `${item.icon} ${item.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    });
    this.detailPanel.add(title);
    
    // Description
    const desc = this.add.text(25, panelY + 45, item.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      wordWrap: { width: width - 60 }
    });
    this.detailPanel.add(desc);
  }
  
  private getItemsForCategory(category: CodexCategory): CodexItem[] {
    switch (category) {
      case 'enemies':
        return ENEMY_ARCHETYPES.map((e: any) => ({
          id: e.id,
          name: e.name,
          icon: e.icon || '👤',
          description: e.description || '',
          discovered: false
        }));
      case 'mutators':
        return ENEMY_MUTATORS.map(m => ({
          id: m.id,
          name: m.name,
          icon: m.icon,
          description: m.description,
          discovered: false
        }));
      case 'affixes':
        const allAffixes = [...ALL_PREFIXES, ...ALL_SUFFIXES, ...CURSES];
        return allAffixes.map(a => ({
          id: a.id,
          name: a.name,
          icon: '✨',
          description: a.description,
          discovered: false
        }));
      case 'decrees':
        return DECREES.map(d => ({
          id: d.id,
          name: d.name,
          icon: d.icon,
          description: d.description,
          discovered: false
        }));
      case 'biomes':
        return BIOMES.map(b => ({
          id: b.id,
          name: b.name,
          icon: b.icon,
          description: b.description,
          discovered: false
        }));
      case 'signatures':
        return SIGNATURE_MOVES.map(s => ({
          id: s.id,
          name: s.name,
          icon: s.icon,
          description: s.description,
          discovered: false
        }));
      case 'weapons':
        return WEAPONS_DATA.map(w => ({
          id: w.id,
          name: w.name,
          icon: w.icon || '⚔️',
          description: w.damageDescription || w.lore || '',
          discovered: false
        }));
      case 'armor':
        return ARMOR_DATA.map(a => ({
          id: a.id,
          name: a.name,
          icon: '🛡️',
          description: a.description || '',
          discovered: false
        }));
      default:
        return [];
    }
  }
  
  private getDiscoveredIds(category: CodexCategory): string[] {
    const meta = SaveSystem.getMeta();
    const run = SaveSystem.getRun();
    
    // Combine discoveries from meta and run
    switch (category) {
      case 'enemies':
        return run.seenEnemyClasses || [];
      case 'mutators':
        return run.seenMutatorIds || [];
      case 'affixes':
        return run.seenAffixIds || [];
      case 'decrees':
        return run.seenDecreeIds || [];
      case 'biomes':
        // Could track in meta
        return [];
      case 'signatures':
        // Could track in meta
        return run.signatureId ? [run.signatureId] : [];
      case 'weapons':
        // Track by owned items
        return run.inventory
          ?.filter(i => i.itemType === 'weapon')
          .map(i => i.itemId) || [];
      case 'armor':
        return run.inventory
          ?.filter(i => i.itemType === 'armor')
          .map(i => i.itemId) || [];
      default:
        return [];
    }
  }
  
  private createBackButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 35,
      '← BACK',
      () => this.returnToMenu(),
      { width: 150, height: 40 }
    );
  }
  
  private returnToMenu(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
