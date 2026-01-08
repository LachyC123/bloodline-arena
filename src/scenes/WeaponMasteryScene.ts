/**
 * WeaponMasteryScene - View and unlock weapon skill tree nodes
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { 
  WEAPON_TREES,
  WeaponTree,
  SkillNode,
  getWeaponTree,
  canUnlockNode,
  getTotalSpentPoints,
  calculateTreeBonuses
} from '../data/weaponTrees';
import { getWeaponById } from '../data/WeaponsData';
import { UIHelper } from '../ui/UIHelper';

export class WeaponMasteryScene extends Phaser.Scene {
  private masteryPoints: number = 0;
  private currentWeaponType: string = 'sword';
  private unlockedNodes: string[] = [];
  private treeContainer!: Phaser.GameObjects.Container;
  private infoPanel!: Phaser.GameObjects.Container;
  private selectedNode: SkillNode | null = null;
  
  constructor() {
    super({ key: 'WeaponMasteryScene' });
  }
  
  create(): void {
    const run = SaveSystem.getRun();
    
    this.masteryPoints = run.masteryPoints || 0;
    
    // Detect current weapon type from equipped weapon
    const loadout = run.loadout;
    if (loadout?.weaponId) {
      const equippedWeapon = run.inventory.find(i => i.instanceId === loadout.weaponId);
      if (equippedWeapon) {
        const weaponData = getWeaponById(equippedWeapon.itemId);
        if (weaponData) {
          this.currentWeaponType = weaponData.type;
        }
      }
    }
    
    // Get unlocked nodes for current weapon
    this.unlockedNodes = run.weaponMastery?.[this.currentWeaponType] || [];
    
    this.createBackground();
    this.createHeader();
    this.createWeaponTabs();
    this.createTree();
    this.createInfoPanel();
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
    
    const tree = getWeaponTree(this.currentWeaponType);
    const title = tree ? `${tree.icon} ${tree.name}` : '⚔️ Weapon Mastery';
    
    this.add.text(width / 2, 30, title, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Mastery points display
    this.add.text(width - 20, 25, `🌟 ${this.masteryPoints}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(1, 0);
    
    this.add.text(width - 20, 45, 'Mastery Points', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    }).setOrigin(1, 0);
  }
  
  private createWeaponTabs(): void {
    const { width } = this.cameras.main;
    const tabY = 70;
    
    // Only show tabs for weapons we have trees for
    const availableTypes = WEAPON_TREES.map(t => t.weaponType);
    const tabWidth = Math.min(50, (width - 20) / availableTypes.length);
    const startX = width / 2 - (availableTypes.length * tabWidth) / 2 + tabWidth / 2;
    
    availableTypes.forEach((type, i) => {
      const tree = getWeaponTree(type);
      if (!tree) return;
      
      const x = startX + i * tabWidth;
      const isActive = type === this.currentWeaponType;
      
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x4a3a2a : 0x2a1f1a, 1);
      tabBg.fillRoundedRect(x - tabWidth / 2 + 2, tabY, tabWidth - 4, 35, 4);
      if (isActive) {
        tabBg.lineStyle(2, 0xc9a959, 1);
        tabBg.strokeRoundedRect(x - tabWidth / 2 + 2, tabY, tabWidth - 4, 35, 4);
      }
      
      const icon = this.add.text(x, tabY + 17, tree.icon, {
        fontSize: '18px'
      }).setOrigin(0.5);
      
      if (!isActive) {
        icon.setAlpha(0.6);
        const hitArea = this.add.rectangle(x, tabY + 17, tabWidth - 4, 35);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => {
          this.currentWeaponType = type;
          this.scene.restart();
        });
      }
    });
  }
  
  private createTree(): void {
    const { width, height } = this.cameras.main;
    
    if (this.treeContainer) {
      this.treeContainer.destroy();
    }
    
    this.treeContainer = this.add.container(0, 0);
    
    const tree = getWeaponTree(this.currentWeaponType);
    if (!tree) {
      this.add.text(width / 2, height / 2, 'No skill tree for this weapon', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
      return;
    }
    
    // Layout nodes by tier
    const treeTop = 120;
    const tierHeight = 120;
    const nodeSize = 50;
    
    // Group nodes by tier
    const tiers: Map<number, SkillNode[]> = new Map();
    tree.nodes.forEach(node => {
      if (!tiers.has(node.tier)) {
        tiers.set(node.tier, []);
      }
      tiers.get(node.tier)!.push(node);
    });
    
    // Draw connections first
    const nodePositions: Map<string, { x: number; y: number }> = new Map();
    
    // Calculate positions
    for (const [tier, nodes] of tiers) {
      const y = treeTop + (tier - 1) * tierHeight;
      const spacing = width / (nodes.length + 1);
      
      nodes.forEach((node, i) => {
        const x = spacing * (i + 1);
        nodePositions.set(node.id, { x, y });
      });
    }
    
    // Draw lines for requirements
    const lines = this.add.graphics();
    lines.lineStyle(2, 0x5a4a3a, 0.6);
    
    tree.nodes.forEach(node => {
      if (node.requires) {
        const nodePos = nodePositions.get(node.id);
        if (!nodePos) return;
        
        node.requires.forEach(reqId => {
          const reqPos = nodePositions.get(reqId);
          if (reqPos) {
            lines.beginPath();
            lines.moveTo(reqPos.x, reqPos.y + nodeSize / 2);
            lines.lineTo(nodePos.x, nodePos.y - nodeSize / 2);
            lines.strokePath();
          }
        });
      }
    });
    this.treeContainer.add(lines);
    
    // Draw nodes
    tree.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      this.createNode(node, pos.x, pos.y, nodeSize);
    });
  }
  
  private createNode(node: SkillNode, x: number, y: number, size: number): void {
    const isUnlocked = this.unlockedNodes.includes(node.id);
    const spentPoints = getTotalSpentPoints(this.currentWeaponType, this.unlockedNodes);
    const canUnlock = canUnlockNode(node, this.unlockedNodes, this.masteryPoints + spentPoints, spentPoints);
    
    const container = this.add.container(x, y);
    this.treeContainer.add(container);
    
    // Background
    const bg = this.add.graphics();
    
    let bgColor = 0x2a1f1a;  // Locked
    let borderColor = 0x5a4a3a;
    
    if (isUnlocked) {
      bgColor = 0x3a6a3a;  // Unlocked - green
      borderColor = 0x6a9a6a;
    } else if (canUnlock.canUnlock) {
      bgColor = 0x4a4a2a;  // Available - yellow tint
      borderColor = 0xc9a959;
    }
    
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    container.add(bg);
    
    // Icon
    const icon = this.add.text(0, -5, node.icon, {
      fontSize: '20px'
    }).setOrigin(0.5);
    container.add(icon);
    
    // Cost indicator
    if (!isUnlocked) {
      const costText = this.add.text(0, size / 2 - 12, `${node.cost}🌟`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: canUnlock.canUnlock ? '#ffd700' : '#5a4a3a'
      }).setOrigin(0.5);
      container.add(costText);
    }
    
    // Interactive
    container.setSize(size, size);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(isUnlocked ? 0x4a8a4a : 0x3a3a2a, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
      bg.lineStyle(3, 0xc9a959, 1);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    });
    
    container.on('pointerdown', () => {
      this.selectNode(node);
    });
  }
  
  private selectNode(node: SkillNode): void {
    this.selectedNode = node;
    this.createInfoPanel();
  }
  
  private createInfoPanel(): void {
    const { width, height } = this.cameras.main;
    
    if (this.infoPanel) {
      this.infoPanel.destroy();
    }
    
    this.infoPanel = this.add.container(0, 0);
    
    const panelY = height - 180;
    const panelH = 130;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.infoPanel.add(bg);
    
    if (!this.selectedNode) {
      const hint = this.add.text(width / 2, panelY + panelH / 2, 'Tap a node to view details', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      this.infoPanel.add(hint);
      return;
    }
    
    const node = this.selectedNode;
    const isUnlocked = this.unlockedNodes.includes(node.id);
    const spentPoints = getTotalSpentPoints(this.currentWeaponType, this.unlockedNodes);
    const canUnlock = canUnlockNode(node, this.unlockedNodes, this.masteryPoints + spentPoints, spentPoints);
    
    // Node name
    const name = this.add.text(25, panelY + 15, `${node.icon} ${node.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: isUnlocked ? '#6a9a6a' : '#c9a959'
    });
    this.infoPanel.add(name);
    
    // Description
    const desc = this.add.text(25, panelY + 40, node.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      wordWrap: { width: width - 70 }
    });
    this.infoPanel.add(desc);
    
    // Effects
    let effectY = panelY + 65;
    node.effects.forEach(effect => {
      const effectText = this.add.text(25, effectY, `• ${effect.description}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#c9a959'
      });
      this.infoPanel.add(effectText);
      effectY += 14;
    });
    
    // Unlock button or status
    if (isUnlocked) {
      const status = this.add.text(width - 25, panelY + 15, '✓ UNLOCKED', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#6a9a6a'
      }).setOrigin(1, 0);
      this.infoPanel.add(status);
    } else if (canUnlock.canUnlock) {
      const unlockBtn = UIHelper.createButton(
        this, width - 70, panelY + panelH - 30, `UNLOCK (${node.cost}🌟)`,
        () => this.unlockNode(node),
        { width: 110, height: 35, fontSize: '11px', primary: true }
      );
      this.infoPanel.add(unlockBtn);
    } else {
      const reason = this.add.text(width - 25, panelY + 15, canUnlock.reason || 'Locked', {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#8b0000'
      }).setOrigin(1, 0);
      this.infoPanel.add(reason);
    }
  }
  
  private unlockNode(node: SkillNode): void {
    if (this.masteryPoints < node.cost) {
      UIHelper.showNotification(this, 'Not enough Mastery Points!');
      return;
    }
    
    // Deduct points
    this.masteryPoints -= node.cost;
    
    // Add to unlocked nodes
    this.unlockedNodes.push(node.id);
    
    // Save
    const run = SaveSystem.getRun();
    const weaponMastery = { ...run.weaponMastery };
    weaponMastery[this.currentWeaponType] = [...this.unlockedNodes];
    
    SaveSystem.updateRun({
      masteryPoints: this.masteryPoints,
      weaponMastery
    });
    
    UIHelper.showNotification(this, `Unlocked: ${node.name}!`);
    
    // Refresh display
    this.scene.restart();
  }
  
  private createBackButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 35,
      '← BACK',
      () => this.returnToCamp(),
      { width: 150, height: 40 }
    );
  }
  
  private returnToCamp(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
