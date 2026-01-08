/**
 * RunMapScene - Visual branching path map for roguelite progression
 * Fixed: Uses proper hit rectangles for reliable touch/click detection
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
import { Button, setInputDebug } from '../ui/Button';
import { startPrepareScene, startCombat } from '../systems/CombatEntry';
import { logSceneTransition } from '../systems/ErrorOverlay';

export class RunMapScene extends Phaser.Scene {
  private runMap!: RunMap;
  private selectedNodeId: string | null = null;
  private infoPanel!: Phaser.GameObjects.Container;
  private nodeHitAreas: Phaser.GameObjects.Rectangle[] = [];
  private debugMode: boolean = false;
  
  constructor() {
    super({ key: 'RunMapScene' });
  }
  
  create(): void {
    const run = SaveSystem.getRun();
    this.debugMode = SaveSystem.getSettings().debugMode || false;
    
    // Enable input debug if in debug mode
    if (this.debugMode) {
      setInputDebug(true);
    }
    
    // Ensure input is fully enabled and not blocked
    this.input.enabled = true;
    this.input.keyboard?.enabled && (this.input.keyboard.enabled = true);
    
    // Ensure camera is fully visible (in case of prior fade)
    this.cameras.main.setAlpha(1);
    this.cameras.main.resetFX();
    
    // Get or generate map
    if (run.runMap) {
      this.runMap = run.runMap as RunMap;
    } else {
      this.runMap = generateRunMap(run.league, run.seed);
      SaveSystem.updateRun({ runMap: this.runMap as any });
    }
    
    // Clear any previous state
    this.selectedNodeId = null;
    this.nodeHitAreas = [];
    
    this.createBackground();
    this.createHeader();
    this.drawConnections();
    this.drawNodes();
    this.createInfoPanel();
    this.createBottomUI();
    
    // Debug logging
    if (this.debugMode) {
      console.log('[RunMap] Scene created');
      console.log('[RunMap] Input enabled:', this.input.enabled);
      console.log('[RunMap] Nodes:', this.runMap.nodes.length);
      console.log('[RunMap] Current node ID:', this.runMap.currentNodeId);
      console.log('[RunMap] Start node IDs:', this.runMap.startNodeIds);
      const accessible = getAccessibleNodes(this.runMap);
      console.log('[RunMap] Accessible nodes:', accessible.map(n => `${n.id}(${n.type})`).join(', '));
      console.log('[RunMap] Node hit areas created:', this.nodeHitAreas.length);
    }
    
    // Additional: Log any pointer events on the scene (dev debug)
    if (this.debugMode) {
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        console.log(`[RunMap] Scene pointerdown at (${pointer.x.toFixed(0)}, ${pointer.y.toFixed(0)})`);
        const objects = this.input.hitTestPointer(pointer);
        console.log('[RunMap] Objects under pointer:', objects.length);
        objects.forEach((obj, i) => {
          const nodeId = obj.getData?.('nodeId');
          console.log(`  ${i}: ${obj.constructor.name}${nodeId ? ` nodeId=${nodeId}` : ''}`);
        });
      });
    }
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(0);
    
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
    }).setOrigin(0.5).setDepth(10);
    
    // Progress
    const completed = this.runMap.nodes.filter(n => n.completed).length;
    const total = this.runMap.nodes.length;
    
    this.add.text(width / 2, 55, `Progress: ${completed}/${total}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(0.5).setDepth(10);
  }
  
  private drawConnections(): void {
    const { width, height } = this.cameras.main;
    const mapTop = 80;
    const mapBottom = height - 200;
    const mapHeight = mapBottom - mapTop;
    
    const maxRow = Math.max(...this.runMap.nodes.map(n => n.y));
    if (maxRow === 0) return;
    
    const lines = this.add.graphics();
    lines.setDepth(1);
    
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
    if (maxRow === 0) return;
    
    const nodeSize = 56; // Larger for better touch targets
    
    this.runMap.nodes.forEach(node => {
      const x = 40 + node.x * (width - 80);
      const y = mapBottom - (node.y / maxRow) * mapHeight;
      
      this.createNodeVisual(node, x, y, nodeSize);
    });
  }
  
  private createNodeVisual(node: MapNode, x: number, y: number, size: number): void {
    const config = NODE_CONFIGS[node.type];
    const isAccessible = this.isNodeAccessible(node.id);
    const isCurrent = this.runMap.currentNodeId === node.id;
    const isSelected = this.selectedNodeId === node.id;
    
    // Determine colors
    let bgColor = 0x2a1f1a;  // Default locked
    let borderColor = 0x5a4a3a;
    
    if (node.completed) {
      bgColor = 0x1a3a1a;  // Green - completed
      borderColor = 0x3a6a3a;
    } else if (isSelected) {
      bgColor = 0x4a4a2a;  // Selected
      borderColor = 0xffd700;
    } else if (isAccessible) {
      bgColor = 0x3a3a2a;  // Yellow tint - accessible
      borderColor = 0xc9a959;
    } else if (isCurrent) {
      bgColor = 0x4a3a2a;
      borderColor = 0xffd700;
    }
    
    // Draw background circle (visual only, not interactive)
    const bg = this.add.graphics();
    bg.setDepth(5);
    bg.fillStyle(bgColor, 1);
    bg.fillCircle(x, y, size / 2);
    bg.lineStyle(3, borderColor, 1);
    bg.strokeCircle(x, y, size / 2);
    
    // Store reference for updates
    (node as any)._bg = bg;
    (node as any)._bgColor = bgColor;
    (node as any)._borderColor = borderColor;
    
    // Icon
    const icon = this.add.text(x, y, config.icon, {
      fontSize: '20px'
    }).setOrigin(0.5).setDepth(6);
    
    // Completed checkmark
    if (node.completed) {
      this.add.text(x + size / 2 - 8, y - size / 2 + 8, '✓', {
        fontSize: '14px',
        color: '#4a8a4a'
      }).setOrigin(0.5).setDepth(7);
    }
    
    // Current indicator pulse
    if (isCurrent) {
      const pulse = this.add.graphics();
      pulse.setDepth(4);
      pulse.lineStyle(2, 0xffd700, 0.5);
      pulse.strokeCircle(x, y, size / 2 + 5);
      
      this.tweens.add({
        targets: pulse,
        alpha: { from: 1, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Create SEPARATE hit rectangle for interaction (NOT inside container)
    if (isAccessible && !node.completed) {
      const hitRect = this.add.rectangle(x, y, size + 10, size + 10, 0x000000, 0);
      hitRect.setDepth(100); // Above everything for clicks
      hitRect.setInteractive({ useHandCursor: true });
      hitRect.setData('nodeId', node.id);
      
      // Debug: show hit area
      if (this.debugMode) {
        hitRect.setFillStyle(0xff0000, 0.2);
      }
      
      hitRect.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x4a4a3a, 1);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, 0xffd700, 1);
        bg.strokeCircle(x, y, size / 2);
        
        // Scale up slightly
        this.tweens.add({
          targets: [bg, icon],
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100
        });
      });
      
      hitRect.on('pointerout', () => {
        const currentSelected = this.selectedNodeId === node.id;
        bg.clear();
        bg.fillStyle(currentSelected ? 0x4a4a2a : bgColor, 1);
        bg.fillCircle(x, y, size / 2);
        bg.lineStyle(3, currentSelected ? 0xffd700 : borderColor, 1);
        bg.strokeCircle(x, y, size / 2);
        
        // Scale back
        this.tweens.add({
          targets: [bg, icon],
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      });
      
      hitRect.on('pointerdown', () => {
        if (this.debugMode) {
          console.log('[RunMap] Node clicked:', node.id, node.type);
        }
        this.selectNode(node.id);
      });
      
      this.nodeHitAreas.push(hitRect);
    }
  }
  
  private isNodeAccessible(nodeId: string): boolean {
    const accessible = getAccessibleNodes(this.runMap);
    return accessible.some(n => n.id === nodeId);
  }
  
  private selectNode(nodeId: string): void {
    if (this.debugMode) {
      console.log('[RunMap] selectNode called:', nodeId);
    }
    
    this.selectedNodeId = nodeId;
    this.updateInfoPanel();
  }
  
  private createInfoPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.infoPanel = this.add.container(0, 0);
    // Set depth below node hit areas but above background
    this.infoPanel.setDepth(20);
    
    const panelY = height - 190;
    const panelH = 100;
    
    // Panel background - NOT interactive to avoid blocking
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.infoPanel.add(bg);
    
    const hint = this.add.text(width / 2, panelY + panelH / 2, 'Tap a node to select', {
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
    // Set depth below node hit areas (100) but above map visuals
    this.infoPanel.setDepth(20);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(15, panelY, width - 30, panelH, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(15, panelY, width - 30, panelH, 8);
    this.infoPanel.add(bg);
    
    if (!this.selectedNodeId) {
      const hint = this.add.text(width / 2, panelY + panelH / 2, 'Tap a node to select', {
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
    
    // Travel button using Button component - ensure it's above info panel
    const travelBtn = new Button(this, width - 80, panelY + panelH / 2, 'TRAVEL', () => {
      if (this.debugMode) {
        console.log('[RunMap] Travel button clicked for node:', node.id);
      }
      this.travelToNode(node);
    }, { width: 100, height: 40, fontSize: 14, primary: true });
    travelBtn.setDepth(30); // Above info panel
  }
  
  private travelToNode(node: MapNode): void {
    logSceneTransition('RunMapScene', node.type, { nodeId: node.id, nodeType: node.type });
    
    if (this.debugMode) {
      console.log('[RunMap] Traveling to node:', node.id, node.type);
    }
    
    // Complete the node (mark as current destination)
    completeNode(this.runMap, node.id);
    SaveSystem.updateRun({ runMap: this.runMap as any });
    
    // Route to appropriate scene based on node type
    switch (node.type) {
      case 'fight':
      case 'elite':
        // Use hardened combat entry
        startPrepareScene(this, { 
          nodeId: node.id, 
          nodeType: node.type,
          isElite: node.type === 'elite'
        });
        break;
      case 'champion':
        startPrepareScene(this, { 
          nodeId: node.id, 
          nodeType: 'champion',
          isChampion: true 
        });
        break;
      case 'rival':
        startPrepareScene(this, { 
          nodeId: node.id, 
          nodeType: 'rival'
        });
        break;
      case 'shop':
        this.safeTransition('ShopScene');
        break;
      case 'forge':
        this.safeTransition('ForgeScene');
        break;
      case 'clinic':
        this.safeTransition('CampScene');
        break;
      case 'event':
        this.safeTransition('VignetteScene');
        break;
      case 'camp':
        this.safeTransition('CampScene');
        break;
      default:
        this.safeTransition('CampScene');
    }
  }
  
  /**
   * Safe scene transition with timeout fallback
   */
  private safeTransition(sceneName: string): void {
    logSceneTransition('RunMapScene', sceneName);
    
    this.cameras.main.fadeOut(300);
    
    let transitioned = false;
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (!transitioned) {
        transitioned = true;
        this.scene.start(sceneName);
      }
    });
    
    // Failsafe: if fade doesn't complete in 2s, force transition
    this.time.delayedCall(2000, () => {
      if (!transitioned && this.scene.isActive('RunMapScene')) {
        console.warn('[RunMap] Fade timeout, forcing transition to', sceneName);
        transitioned = true;
        this.scene.start(sceneName);
      }
    });
  }
  
  private createBottomUI(): void {
    const { width, height } = this.cameras.main;
    
    // Use Button component for reliable interaction
    const campBtn = new Button(this, width / 2, height - 40, '🏕️ CAMP', () => {
      if (this.debugMode) {
        console.log('[RunMap] Camp button clicked');
      }
      this.returnToCamp();
    }, { width: 140, height: 45 });
    campBtn.setDepth(200); // Above everything
    
    // Dev-only: Quick test buttons
    if (this.debugMode) {
      // Test combat directly
      const testCombatBtn = new Button(this, 50, height - 40, '⚔️', () => {
        this.testNavigation();
      }, { width: 50, height: 35, fontSize: 14 });
      testCombatBtn.setDepth(200);
      
      // Test prepare flow
      const testPrepBtn = new Button(this, width - 50, height - 40, '🛡️', () => {
        this.testPrepare();
      }, { width: 50, height: 35, fontSize: 14 });
      testPrepBtn.setDepth(200);
    }
  }
  
  private testNavigation(): void {
    console.log('[RunMap] TEST: Starting direct combat test');
    
    // Try to start combat directly (bypassing node selection)
    const success = startCombat(this, {
      nodeType: 'fight',
      isElite: false,
      isChampion: false
    });
    
    if (!success) {
      console.error('[RunMap] TEST: Combat start failed - check error overlay');
    }
  }
  
  private testPrepare(): void {
    console.log('[RunMap] TEST: Starting PrepareScene test');
    
    // Find first accessible fight node
    const accessible = getAccessibleNodes(this.runMap);
    const fightNode = accessible.find(n => n.type === 'fight' || n.type === 'elite');
    
    if (fightNode) {
      console.log('[RunMap] TEST: Found fight node:', fightNode.id);
      this.travelToNode(fightNode);
    } else if (accessible.length > 0) {
      console.log('[RunMap] TEST: Navigating to first accessible node:', accessible[0].id);
      this.travelToNode(accessible[0]);
    } else {
      console.log('[RunMap] TEST: No accessible nodes! Creating test fight...');
      startPrepareScene(this, { nodeType: 'fight' });
    }
  }
  
  private returnToCamp(): void {
    this.cameras.main.fadeOut(200);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
