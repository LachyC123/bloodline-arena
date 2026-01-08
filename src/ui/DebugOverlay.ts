/**
 * DebugOverlay - Developer diagnostics panel
 * Toggle via Settings to see game state
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

export class DebugOverlay {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private textLines: Phaser.GameObjects.Text[] = [];
  private visible = false;
  private updateInterval?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  show(): void {
    if (this.container) return;
    
    const { width, height } = this.scene.cameras.main;
    
    this.container = this.scene.add.container(10, 10);
    this.container.setDepth(9999);
    this.container.setScrollFactor(0);
    
    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(0, 0, 200, 200, 5);
    this.container.add(bg);
    
    // Title
    const title = this.scene.add.text(5, 5, '🔧 DEBUG', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00ff00'
    });
    this.container.add(title);
    
    // Create text lines
    for (let i = 0; i < 12; i++) {
      const line = this.scene.add.text(5, 20 + i * 14, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#00ff00'
      });
      this.textLines.push(line);
      this.container.add(line);
    }
    
    this.update();
    
    // Update every 500ms
    this.updateInterval = this.scene.time.addEvent({
      delay: 500,
      callback: () => this.update(),
      loop: true
    });
    
    this.visible = true;
  }

  hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
    this.textLines = [];
    if (this.updateInterval) {
      this.updateInterval.destroy();
      this.updateInterval = undefined;
    }
    this.visible = false;
  }

  update(): void {
    if (!this.visible || this.textLines.length === 0) return;
    
    try {
      const run = SaveSystem.getRun();
      const inventory = SaveSystem.getInventory();
      const loadout = SaveSystem.getLoadout();
      
      const weapons = inventory.filter(i => i.itemType === 'weapon');
      const armor = inventory.filter(i => i.itemType === 'armor');
      const trinkets = inventory.filter(i => i.itemType === 'trinket');
      const consumables = inventory.filter(i => i.itemType === 'consumable');
      
      const sceneKey = this.scene.scene.key;
      
      // Get combat state if in fight
      let combatInfo = 'N/A';
      if (sceneKey === 'FightScene') {
        const fightScene = this.scene as any;
        if (fightScene.combatState) {
          const cs = fightScene.combatState;
          combatInfo = `T:${cs.turn} P:${cs.phase} R:${cs.round}`;
        }
        if (fightScene.isInputEnabled !== undefined) {
          combatInfo += ` In:${fightScene.isInputEnabled}`;
        }
      }
      
      this.textLines[0].setText(`Scene: ${sceneKey}`);
      this.textLines[1].setText(`Gold: ${run.gold}`);
      this.textLines[2].setText(`Inv Total: ${inventory.length}`);
      this.textLines[3].setText(`  Weapons: ${weapons.length}`);
      this.textLines[4].setText(`  Armor: ${armor.length}`);
      this.textLines[5].setText(`  Trinkets: ${trinkets.length}`);
      this.textLines[6].setText(`  Consumables: ${consumables.length}`);
      this.textLines[7].setText(`WeaponId: ${loadout.weaponId?.slice(0, 8) || 'none'}`);
      this.textLines[8].setText(`ArmorId: ${loadout.armorId?.slice(0, 8) || 'none'}`);
      this.textLines[9].setText(`Combat: ${combatInfo}`);
      this.textLines[10].setText(`Fighter: ${run.fighter?.firstName || 'none'}`);
      this.textLines[11].setText(`Week: ${run.week} League: ${run.league}`);
    } catch (e) {
      this.textLines[0].setText(`Error: ${e}`);
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.hide();
  }
}

// Global debug logging functions
export function logPurchase(itemId: string, itemType: string, goldBefore: number, goldAfter: number): void {
  console.log(`[DEBUG] Purchase: ${itemId} (${itemType}) | Gold: ${goldBefore} -> ${goldAfter}`);
}

export function logInventoryAdd(instanceId: string, itemId: string, itemType: string): void {
  console.log(`[DEBUG] Inventory Add: ${instanceId} = ${itemId} (${itemType})`);
  const inv = SaveSystem.getInventory();
  console.log(`[DEBUG] Inventory now has ${inv.length} items`);
}

export function logEquip(slot: string, instanceId: string | null): void {
  console.log(`[DEBUG] Equip: ${slot} = ${instanceId || 'none'}`);
}

export function logEnterPrepare(): void {
  const inv = SaveSystem.getInventory();
  const weapons = inv.filter(i => i.itemType === 'weapon');
  const armor = inv.filter(i => i.itemType === 'armor');
  console.log(`[DEBUG] Prepare Screen: ${inv.length} items (${weapons.length} weapons, ${armor.length} armor)`);
  weapons.forEach(w => console.log(`  - Weapon: ${w.itemId} (${w.instanceId})`));
  armor.forEach(a => console.log(`  - Armor: ${a.itemId} slot=${a.slot} (${a.instanceId})`));
}

export function logAttackPressed(turn: string, isInputEnabled: boolean, phase: string): void {
  console.log(`[DEBUG] Attack Pressed: turn=${turn} inputEnabled=${isInputEnabled} phase=${phase}`);
}
