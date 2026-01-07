/**
 * PreloadScene - Robust asset loading with progress tracking
 * Handles GitHub Pages base paths and provides visual feedback
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { AssetGenerator } from '../ui/AssetGenerator';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingBarBg!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private pulseGraphic!: Phaser.GameObjects.Graphics;
  
  // Progress tracking
  private currentProgress: number = 0;
  private targetProgress: number = 0;
  private loadComplete: boolean = false;
  private hasLoadErrors: boolean = false;
  private assetsQueued: number = 0;
  private assetsLoaded: number = 0;
  
  // Bar dimensions
  private barWidth: number = 280;
  private barHeight: number = 24;
  private barX: number = 0;
  private barY: number = 0;
  
  // Animation
  private pulsePhase: number = 0;
  
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(): void {
    // Reset all state
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.loadComplete = false;
    this.hasLoadErrors = false;
    this.assetsQueued = 0;
    this.assetsLoaded = 0;
    this.pulsePhase = 0;
    
    console.log('[PreloadScene] Initialized');
  }

  preload(): void {
    console.log('[PreloadScene] === PRELOAD START ===');
    
    // 1. Create loading UI FIRST (before anything else)
    this.createLoadingUI();
    
    // 2. Set up event listeners BEFORE queuing assets
    this.setupLoadEvents();
    
    // 3. Queue actual asset files
    this.queueAssets();
    
    // 4. Generate procedural textures (doesn't use loader)
    this.generateProceduralAssets();
    
    // 5. If no assets to load, mark as complete
    if (this.assetsQueued === 0) {
      console.log('[PreloadScene] No assets queued, completing immediately');
      this.targetProgress = 1;
      this.loadComplete = true;
    }
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Store bar position
    this.barX = centerX - this.barWidth / 2;
    this.barY = centerY + 30;

    // Dark background
    this.add.rectangle(centerX, centerY, width, height, 0x1a1410);

    // Title with shadow
    this.add.text(centerX + 2, centerY - 92, 'BLOODLINE ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.5);
    
    this.add.text(centerX, centerY - 94, 'BLOODLINE ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 55, 'Blood. Honor. Legacy.', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Loading bar container (outer border)
    this.loadingBarBg = this.add.graphics();
    this.loadingBarBg.fillStyle(0x5a4a3a, 1);
    this.loadingBarBg.fillRoundedRect(
      this.barX - 4,
      this.barY - 4,
      this.barWidth + 8,
      this.barHeight + 8,
      6
    );
    // Inner background
    this.loadingBarBg.fillStyle(0x1a1410, 1);
    this.loadingBarBg.fillRoundedRect(
      this.barX,
      this.barY,
      this.barWidth,
      this.barHeight,
      4
    );

    // Pulse effect graphic (for indeterminate state)
    this.pulseGraphic = this.add.graphics();
    
    // Loading bar fill
    this.loadingBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 70, 'Initializing...', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#8b7355'
    }).setOrigin(0.5);

    // Progress percentage
    this.progressText = this.add.text(centerX, centerY + 30 + this.barHeight / 2, '0%', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    }).setOrigin(0.5);

    // Error text (hidden initially)
    this.errorText = this.add.text(centerX, centerY + 95, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#aa4444'
    }).setOrigin(0.5);
    
    // Draw initial state
    this.updateProgressBar(0);
  }

  private setupLoadEvents(): void {
    // Progress event
    this.load.on('progress', (value: number) => {
      this.targetProgress = value;
      this.assetsLoaded = Math.floor(value * this.assetsQueued);
      console.log(`[PreloadScene] Progress: ${Math.floor(value * 100)}% (${this.assetsLoaded}/${this.assetsQueued})`);
    });

    // Individual file complete
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`[PreloadScene] ✓ Loaded: ${key} (${type})`);
      this.loadingText.setText(`Loaded: ${key}`);
    });

    // Error handling
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      const errorMsg = `✗ Failed: ${file.key}`;
      console.error(`[PreloadScene] ${errorMsg} - URL: ${file.src}`);
      this.hasLoadErrors = true;
      this.errorText.setText(`⚠ ${file.key} failed to load`);
    });

    // Complete event
    this.load.once('complete', () => {
      console.log('[PreloadScene] === LOAD COMPLETE ===');
      this.loadComplete = true;
      this.targetProgress = 1;
      this.loadingText.setText('Ready!');
    });
  }

  private queueAssets(): void {
    // Get base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || '/';
    console.log(`[PreloadScene] Base URL: "${baseUrl}"`);
    
    // Define assets to load
    const svgAssets = [
      { key: 'ui_panel', path: 'assets/ui/panel.svg' },
      { key: 'ui_button', path: 'assets/ui/button.svg' },
      { key: 'ui_frame', path: 'assets/ui/frame.svg' },
      { key: 'overlay_vignette', path: 'assets/overlays/vignette.svg' },
      { key: 'overlay_grain', path: 'assets/overlays/grain.svg' },
      { key: 'arena_background', path: 'assets/arena/background.svg' },
      { key: 'icon_main', path: 'assets/icons/icon.svg' },
    ];
    
    // Queue each asset
    svgAssets.forEach(asset => {
      const fullPath = `${baseUrl}${asset.path}`;
      console.log(`[PreloadScene] Queuing: ${asset.key} -> ${fullPath}`);
      this.load.svg(asset.key, fullPath);
    });
    
    this.assetsQueued = svgAssets.length;
    console.log(`[PreloadScene] Total assets queued: ${this.assetsQueued}`);
  }

  private generateProceduralAssets(): void {
    // Generate textures programmatically (no network requests)
    const generator = new AssetGenerator(this);
    generator.generateUIAssets();
    generator.generatePortraitAssets();
    generator.generateArenaAssets();
    generator.generateEffectAssets();
    generator.generateIconAssets();
    console.log('[PreloadScene] Procedural assets generated');
  }

  update(time: number, delta: number): void {
    // Smooth progress animation
    const smoothSpeed = 0.05;
    if (this.currentProgress < this.targetProgress) {
      this.currentProgress += (this.targetProgress - this.currentProgress) * smoothSpeed + 0.001;
      if (this.currentProgress > this.targetProgress) {
        this.currentProgress = this.targetProgress;
      }
    }
    
    // Indeterminate pulse animation when stuck
    this.pulsePhase += delta * 0.003;
    
    // If progress is stuck at 0 or very low, show indeterminate animation
    const showPulse = !this.loadComplete && this.currentProgress < 0.05;
    
    // Update visuals
    this.updateProgressBar(this.currentProgress);
    this.updatePulseEffect(showPulse);
    this.updateHTMLLoadingBar(this.currentProgress);
  }

  private updateProgressBar(value: number): void {
    if (!this.loadingBar) return;
    
    this.loadingBar.clear();
    
    const fillWidth = Math.max(0, (this.barWidth - 4) * Math.min(value, 1));
    
    if (fillWidth > 0) {
      // Gradient fill from dark to gold
      this.loadingBar.fillGradientStyle(
        0x8b4513, 0xc9a959,
        0x8b4513, 0xc9a959
      );
      this.loadingBar.fillRoundedRect(
        this.barX + 2,
        this.barY + 2,
        fillWidth,
        this.barHeight - 4,
        3
      );
      
      // Highlight on top
      this.loadingBar.fillStyle(0xffffff, 0.1);
      this.loadingBar.fillRoundedRect(
        this.barX + 2,
        this.barY + 2,
        fillWidth,
        (this.barHeight - 4) / 2,
        3
      );
    }

    // Update percentage text
    const percent = Math.floor(Math.min(value, 1) * 100);
    if (this.progressText) {
      this.progressText.setText(`${percent}%`);
    }
  }
  
  private updatePulseEffect(show: boolean): void {
    if (!this.pulseGraphic) return;
    
    this.pulseGraphic.clear();
    
    if (show) {
      // Animated pulse effect when loading is indeterminate
      const pulseWidth = 60;
      const pulseX = this.barX + 2 + (Math.sin(this.pulsePhase) * 0.5 + 0.5) * (this.barWidth - pulseWidth - 4);
      const alpha = 0.3 + Math.sin(this.pulsePhase * 2) * 0.2;
      
      this.pulseGraphic.fillStyle(0xc9a959, alpha);
      this.pulseGraphic.fillRoundedRect(
        pulseX,
        this.barY + 2,
        pulseWidth,
        this.barHeight - 4,
        3
      );
    }
  }

  private updateHTMLLoadingBar(value: number): void {
    // Sync with HTML loading bar if it exists
    const htmlBar = document.getElementById('loading-bar');
    const htmlText = document.getElementById('loading-text');
    
    if (htmlBar) {
      htmlBar.style.width = `${Math.min(value, 1) * 100}%`;
    }
    if (htmlText) {
      htmlText.textContent = `Loading... ${Math.floor(Math.min(value, 1) * 100)}%`;
    }
  }

  create(): void {
    console.log('[PreloadScene] === CREATE PHASE ===');
    
    // Initialize save system
    SaveSystem.load();
    SaveSystem.startAutoSave(30000);

    // Hide HTML loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }

    // Log any errors
    if (this.hasLoadErrors) {
      console.warn('[PreloadScene] ⚠ Completed with load errors');
    }

    // Ensure we show 100% before transitioning
    this.currentProgress = 1;
    this.updateProgressBar(1);
    this.loadingText.setText('Starting...');

    // Delay before transition
    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('[PreloadScene] Transitioning to MainMenuScene');
        this.scene.start('MainMenuScene');
      });
    });
  }
}
