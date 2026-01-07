/**
 * PreloadScene - Asset loading and generation
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { AssetGenerator } from '../ui/AssetGenerator';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingUI();
    this.generateAssets();
    this.setupLoadEvents();
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(centerX, centerY, width, height, 0x1a1410);

    // Title
    this.add.text(centerX, centerY - 100, 'BLOODLINE ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 60, 'Blood. Honor. Legacy.', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Loading bar background
    const barWidth = 300;
    const barHeight = 20;
    this.add.rectangle(centerX, centerY + 20, barWidth + 4, barHeight + 4, 0x5a4a3a);
    this.add.rectangle(centerX, centerY + 20, barWidth, barHeight, 0x2a1f1a);

    // Loading bar fill
    this.loadingBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 60, 'Generating assets...', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#8b7355'
    }).setOrigin(0.5);

    this.progressText = this.add.text(centerX, centerY + 80, '0%', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
  }

  private setupLoadEvents(): void {
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Ready!');
    });
  }

  private updateProgress(value: number): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    const barWidth = 300;
    const barHeight = 20;

    this.loadingBar.clear();
    this.loadingBar.fillGradientStyle(0x8b4513, 0x8b4513, 0xc9a959, 0xc9a959);
    this.loadingBar.fillRect(
      centerX - barWidth / 2,
      centerY + 20 - barHeight / 2,
      barWidth * value,
      barHeight
    );

    this.progressText.setText(`${Math.floor(value * 100)}%`);
  }

  private generateAssets(): void {
    const generator = new AssetGenerator(this);
    
    // Generate all game assets
    generator.generateUIAssets();
    generator.generatePortraitAssets();
    generator.generateArenaAssets();
    generator.generateEffectAssets();
    generator.generateIconAssets();
  }

  create(): void {
    // Initialize save system
    SaveSystem.load();
    SaveSystem.startAutoSave(30000);

    // Update HTML loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    // Fade transition to main menu
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
