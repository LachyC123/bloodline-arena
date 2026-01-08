/**
 * RunMapScene - Visual branching path map for roguelite progression
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { 
  RunMap, 
  MapNode, 
  NODE_CONFIGS, 
  generateRunMap, 
  getAccessibleNodes, 
  completeNode,
  getNodeById 
} from '../data/runMap';
import { UIHelper } from '../ui/UIHelper';

export class RunMapScene extends Phaser.Scene {
  private runMap!: RunMap;
  private nodeContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private selectedNodeId: string | null = null;
  private infoPanel!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'RunMapScene' });
  }
  
  create(): void {
    const run = SaveSystem.getRun();
    
    // Get or generate map
    if (run.runMap) {
      this.runMap = run.runMap as RunMap;
    } else {
      this.runMap = generateRunMap(run.league, run.seed);
      SaveSystem.updateRun({ runMap: this.runMap as any });
    }
    
    this.createBackground();
    this.createHeader();
    this.drawConnections();
    this.drawNodes();
    this.createInfoPanel();
    this.createBottomUI();
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    // Parchment texture effect
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 1 + Math.random() * 2;
      bg.fillStyle(0x3a2a1a, 0.1 + Math.random() * 0.1);
      bg.fillCircle(x, y, size);
    }
  }
  
  private createHeader(): void {
    const { width } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    const leagueNames: Record<string, string> = {
      bronze: 'Bronze League',
      silver: 'Silver League',
      gold: 'Gold League',
      champion: 'Championship'
    };
    
    this.add.text(width / 2, 30, `🗺️ ${leagueNames[run.league] || 'Arena'}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Progress
    const completed = this.runMap.nodes.filter(n => n.completed).length;
    const total = this.runMap.nodes.length;
    
    this.add.text(width / 2, 55, `Progress: ${completed}/${total}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(0.5);
  }
  
  private drawConnections(): void {
    const { width, height } = this.cameras.main;
    const mapTop = 80;
    const mapBottom = height - 200;
    const mapHeight = mapBottom - mapTop;
    
    const maxRow = Math.max(...this.runMap.nodes.map(n => n.y));
    
    const lines = this.add.graphics();
    
    this.runMap.nodes.forEach(node => {
      const fromX = 40 + node.x * (width - 80);
      const fromY = mapBottom - (node.y / maxRow) * mapHeight;
      
      node.connections.forEach(targetId => {
        const target = getNodeById(this.runMap, targetId);
        if (!target) return;
        
        const toX = 40 + target.x * (width - 80);
        const toY = mapBottom - (target.y / maxRow) * mapHeight;
        
        // Color based on accessibility
        const isAccessible = this.isNodeAccessible(targetId);
        const lineColor = node.completed ? (isAccessible ? 0xc9a959 : 0x5a4a3a) : 0x3a3a3a;
        
        lines.lineStyle(2, lineColor, 0.8);
        lines.beginPath();
        lines.moveTo(fromX, fromY);
        lines.lineTo(toX, toY);
        lines.strokePath();
      });
    });
  }
  
  private drawNodes(): void {
    const { width, height } = this.cameras.main;
    const mapTop = 80;
    const mapBottom = height - 200;
    const mapHeight = mapBottom - mapTop;
    
    const maxRow = Math.max(...this.runMap.nodes.map(n => n.y));
    const nodeSize = 40;
    
    this.runMap.nodes.forEach(node => {
      const x = 40 + node.x * (width - 80);
      const y = mapBottom - (node.y / maxRow) * mapHeight;
      
      this.createNodeVisual(node, x, y, nodeSize);
    });
  }
  
  private createNodeVisual(node: MapNode, x: number, y: number, size: number): void {
    const container = this.add.container(x, y);
    this.nodeContainers.set(node.id, container);
    
    const config = NODE_CONFIGS[node.type];
    const isAccessible = this.isNodeAccessible(node.id);
    const isCurrent = this.runMap.currentNodeId === node.id;
    
    // Background circle
    const bg = this.add.graphics();
    
    let bgColor = 0x2a1f1a;  // Default
    let borderColor = 0x5a4a3a;
    
    if (node.completed) {
      bgColor = 0x1a3a1a;  // Green - completed
      borderColor = 0x3a6a3a;
    } else if (isAccessible) {
      bgColor = 0x3a3a2a;  // Yellow tint - accessible
      borderColor = 0xc9a959;
    } else if (isCurrent) {
      bgColor = 0x4a3a2a;
      borderColor = 0xffd700;
    }
    
    bg.fillStyle(bgColor, 1);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(3, borderColor, 1);
    bg.strokeCircle(0, 0, size / 2);
    container.add(bg);
    
    // Icon
    const icon = this.add.text(0, 0, config.icon, {
      fontSize: '18px'
    }).setOrigin(0.5);
    container.add(icon);
    
    // Current indicator
    if (isCurrent) {
      const pulse = this.add.graphics();
      pulse.lineStyle(2, 0xffd700, 0.5);
      pulse.strokeCircle(0, 0, size / 2 + 5);
      container.add(pulse);
      
      this.tweens.add({
        targets: pulse,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Completed checkmark
    if (node.completed) {
      const check = this.add.text(size / 2 - 5, -size / 2 + 5, '✓', {
        fontSize: '12px',
        color: '#4a8a4a'
      }).setOrigin(0.5);
      container.add(check);
    }
    
    // Interactive for accessible nodes
    if (isAccessible && !node.completed) {
      container.setSize(size, size);
      container.setInteractive(
        new Phaser.Geom.Circle(0, 0, size / 2),
        Phaser.Geom.Circle.Contains
      );
      
      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x4a4a3a, 1);
        bg.fillCircle(0, 0, size / 2);
        bg.lineStyle(3, 0xffd700, 1);
        bg.strokeCircle(0, 0, size / 2);
      });
      
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(bgColor, 1);
        bg.fillCircle(0, 0, size / 2);
        bg.lineStyle(3, borderColor, 1);
        bg.strokeCircle(0, 0, size / 2);
      });
      
      container.on('pointerdown', () => {
        this.selectNode(node.id);
      });
    }
  }
  
  private isNodeAccessible(nodeId: string): boolean {
    const accessible = getAccessibleNodes(this.runMap);
    return accessible.some(n => n.id === nodeId);
  }
  
  private selectNode(nodeId: string): void {
    this.selectedNodeId = nodeId;
    this.updateInfoPanel();
  }
  
  private createInfoPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.infoPanel = this.add.container(0, 0);
    
    const panelY = height - 190;
    const panelH = 100;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.infoPanel.add(bg);
    
    const hint = this.add.text(width / 2, panelY + panelH / 2, 'Select a node to travel', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.infoPanel.add(hint);
  }
  
  private updateInfoPanel(): void {
    const { width, height } = this.cameras.main;
    const panelY = height - 190;
    const panelH = 100;
    
    // Clear and rebuild
    this.infoPanel.destroy();
    this.infoPanel = this.add.container(0, 0);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.infoPanel.add(bg);
    
    if (!this.selectedNodeId) {
      const hint = this.add.text(width / 2, panelY + panelH / 2, 'Select a node to travel', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      this.infoPanel.add(hint);
      return;
    }
    
    const node = getNodeById(this.runMap, this.selectedNodeId);
    if (!node) return;
    
    const config = NODE_CONFIGS[node.type];
    
    // Node info
    const title = this.add.text(25, panelY + 15, `${config.icon} ${config.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    });
    this.infoPanel.add(title);
    
    const desc = this.add.text(25, panelY + 40, config.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    });
    this.infoPanel.add(desc);
    
    // Travel button
    const travelBtn = UIHelper.createButton(
      this, width - 80, panelY + panelH / 2, 'TRAVEL',
      () => this.travelToNode(node),
      { width: 100, height: 40, fontSize: '14px', primary: true }
    );
    this.infoPanel.add(travelBtn);
  }
  
  private travelToNode(node: MapNode): void {
    // Complete the node (mark as current destination)
    completeNode(this.runMap, node.id);
    SaveSystem.updateRun({ runMap: this.runMap as any });
    
    // Route to appropriate scene based on node type
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      switch (node.type) {
        case 'fight':
        case 'elite':
          this.scene.start('PrepareScene', { nodeType: node.type });
          break;
        case 'champion':
          this.scene.start('PrepareScene', { nodeType: 'champion' });
          break;
        case 'rival':
          this.scene.start('PrepareScene', { nodeType: 'rival' });
          break;
        case 'shop':
          this.scene.start('ShopScene');
          break;
        case 'forge':
          this.scene.start('ForgeScene');
          break;
        case 'clinic':
          // Could be a dedicated clinic scene, for now use camp with healing
          this.scene.start('CampScene');
          break;
        case 'event':
          // Could be a dedicated event scene
          this.scene.start('VignetteScene');
          break;
        case 'camp':
          this.scene.start('CampScene');
          break;
        default:
          this.scene.start('CampScene');
      }
    });
  }
  
  private createBottomUI(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this, width / 2, height - 40, '← BACK TO CAMP',
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
