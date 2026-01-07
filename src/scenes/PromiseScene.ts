/**
 * PromiseScene - Promise selection at the start of a run
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { UIHelper } from '../ui/UIHelper';
import { PROMISES_DATA } from '../data/VignettesData';

export class PromiseScene extends Phaser.Scene {
  private selectedPromise: string | null = null;
  private promiseContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  
  constructor() {
    super({ key: 'PromiseScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const run = SaveSystem.getRun();
    
    this.createBackground();
    this.createHeader(run.fighter?.firstName || 'Fighter');
    this.createPromiseCards();
    this.createConfirmButton();
    
    this.cameras.main.fadeIn(300);
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

  private createHeader(fighterName: string): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 40, 'MAKE A PROMISE', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 70, `What will you promise ${fighterName}?`, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 90, 'This choice will define your journey together.', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
  }

  private createPromiseCards(): void {
    const { width } = this.cameras.main;
    const cardWidth = 320;
    const cardHeight = 100;
    const startY = 130;
    const spacing = 110;
    
    PROMISES_DATA.forEach((promise, index) => {
      const y = startY + index * spacing;
      const container = this.createPromiseCard(promise, width / 2 - cardWidth / 2, y, cardWidth, cardHeight);
      this.promiseContainers.set(promise.id, container);
    });
  }

  private createPromiseCard(
    promise: typeof PROMISES_DATA[0],
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, width, height, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, width, height, 8);
    container.add(bg);
    
    // Promise name
    const name = this.add.text(width / 2, 18, `"${promise.name}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#c9a959'
    }).setOrigin(0.5);
    container.add(name);
    
    // Description
    const desc = this.add.text(width / 2, 42, promise.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      wordWrap: { width: width - 30 },
      align: 'center'
    }).setOrigin(0.5);
    container.add(desc);
    
    // Effect
    const effect = this.add.text(width / 2, 75, promise.effect, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    container.add(effect);
    
    // Interactive hit area
    const hitArea = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      if (this.selectedPromise !== promise.id) {
        bg.clear();
        bg.fillStyle(0x3a2f2a, 1);
        bg.fillRoundedRect(0, 0, width, height, 8);
        bg.lineStyle(2, 0x8b7355, 1);
        bg.strokeRoundedRect(0, 0, width, height, 8);
      }
    });
    
    hitArea.on('pointerout', () => {
      if (this.selectedPromise !== promise.id) {
        bg.clear();
        bg.fillStyle(0x2a1f1a, 1);
        bg.fillRoundedRect(0, 0, width, height, 8);
        bg.lineStyle(2, 0x5a4a3a, 1);
        bg.strokeRoundedRect(0, 0, width, height, 8);
      }
    });
    
    hitArea.on('pointerdown', () => {
      this.selectPromise(promise.id, width, height);
    });
    
    return container;
  }

  private selectPromise(promiseId: string, cardWidth: number, cardHeight: number): void {
    // Deselect previous
    if (this.selectedPromise) {
      const prev = this.promiseContainers.get(this.selectedPromise);
      if (prev) {
        const bg = prev.first as Phaser.GameObjects.Graphics;
        bg.clear();
        bg.fillStyle(0x2a1f1a, 1);
        bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
        bg.lineStyle(2, 0x5a4a3a, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
      }
    }
    
    this.selectedPromise = promiseId;
    
    // Highlight selected
    const container = this.promiseContainers.get(promiseId);
    if (container) {
      const bg = container.first as Phaser.GameObjects.Graphics;
      bg.clear();
      bg.fillStyle(0x3a2f2a, 1);
      bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
      bg.lineStyle(3, 0xc9a959, 1);
      bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
    }
  }

  private createConfirmButton(): void {
    const { width, height } = this.cameras.main;
    
    const btn = UIHelper.createButton(
      this,
      width / 2,
      height - 60,
      'SEAL THIS PROMISE',
      () => this.confirmPromise(),
      { width: 220, height: 50, primary: true }
    );
    
    btn.setAlpha(0.5);
    
    this.events.on('update', () => {
      btn.setAlpha(this.selectedPromise ? 1 : 0.5);
    });
  }

  private confirmPromise(): void {
    if (!this.selectedPromise) return;
    
    // Save promise
    SaveSystem.updateRun({ promise: this.selectedPromise });
    
    // Dramatic transition
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    // Show promise sealed text briefly
    const { width, height } = this.cameras.main;
    const sealText = this.add.text(width / 2, height / 2, 'PROMISE SEALED', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: sealText,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        this.scene.start('CampScene');
      }
    });
  }
}
