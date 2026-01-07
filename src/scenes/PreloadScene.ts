/**
 * PreloadScene - Bulletproof asset loading that NEVER hangs
 * - Hard timeout ensures transition even if loading fails
 * - Creates fallback textures for missing assets
 * - Shows clear error messages with retry/continue options
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { AssetGenerator } from '../ui/AssetGenerator';

export class PreloadScene extends Phaser.Scene {
  // UI Elements
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private retryButton!: Phaser.GameObjects.Container;
  private continueButton!: Phaser.GameObjects.Container;
  
  // State
  private currentProgress: number = 0;
  private loadComplete: boolean = false;
  private hasErrors: boolean = false;
  private failedAssets: string[] = [];
  private transitionStarted: boolean = false;
  
  // Timeout
  private timeoutTimer?: Phaser.Time.TimerEvent;
  private readonly LOAD_TIMEOUT_MS = 8000;
  
  // Bar dimensions
  private barWidth: number = 280;
  private barHeight: number = 20;
  private centerX: number = 0;
  private centerY: number = 0;
  
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(): void {
    this.currentProgress = 0;
    this.loadComplete = false;
    this.hasErrors = false;
    this.failedAssets = [];
    this.transitionStarted = false;
    console.log('[Preload] === INIT ===');
  }

  preload(): void {
    console.log('[Preload] === PRELOAD START ===');
    
    const { width, height } = this.cameras.main;
    this.centerX = width / 2;
    this.centerY = height / 2;
    
    // 1. Create UI first
    this.createLoadingUI();
    
    // 2. Setup events BEFORE loading
    this.setupLoaderEvents();
    
    // 3. Start hard timeout - will force transition even if loading hangs
    this.startTimeout();
    
    // 4. Queue assets
    this.queueAssets();
    
    // 5. Generate procedural textures (no loading needed)
    this.generateProceduralAssets();
  }

  private createLoadingUI(): void {
    // Background
    this.add.rectangle(this.centerX, this.centerY, this.cameras.main.width, this.cameras.main.height, 0x1a1410);

    // Title
    this.add.text(this.centerX, this.centerY - 80, 'BLOODLINE ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(this.centerX, this.centerY - 45, 'Blood. Honor. Legacy.', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Loading bar background
    const barX = this.centerX - this.barWidth / 2;
    const barY = this.centerY + 10;
    
    const barBg = this.add.graphics();
    barBg.fillStyle(0x5a4a3a, 1);
    barBg.fillRoundedRect(barX - 3, barY - 3, this.barWidth + 6, this.barHeight + 6, 5);
    barBg.fillStyle(0x2a1f1a, 1);
    barBg.fillRoundedRect(barX, barY, this.barWidth, this.barHeight, 4);

    // Loading bar fill
    this.loadingBar = this.add.graphics();
    
    // Progress text
    this.progressText = this.add.text(this.centerX, barY + this.barHeight / 2, '0%', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Loading status text
    this.loadingText = this.add.text(this.centerX, this.centerY + 55, 'Loading...', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(0.5);

    // Error text (initially hidden)
    this.errorText = this.add.text(this.centerX, this.centerY + 80, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#cc6666',
      align: 'center'
    }).setOrigin(0.5);
  }

  private setupLoaderEvents(): void {
    // Progress
    this.load.on('progress', (value: number) => {
      this.currentProgress = value;
      this.updateProgressBar();
      console.log(`[Preload] Progress: ${Math.floor(value * 100)}%`);
    });

    // File loaded successfully
    this.load.on('filecomplete', (key: string) => {
      console.log(`[Preload] ✓ ${key}`);
      this.loadingText.setText(`Loaded: ${key}`);
    });

    // File failed to load
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`[Preload] ✗ FAILED: ${file.key} (${file.src})`);
      this.hasErrors = true;
      this.failedAssets.push(file.key);
      this.errorText.setText(`Failed: ${file.key}`);
      
      // Create fallback texture immediately
      this.createFallbackTexture(file.key);
    });

    // All files complete (success or fail)
    this.load.once('complete', () => {
      console.log('[Preload] === LOADER COMPLETE ===');
      this.loadComplete = true;
      this.currentProgress = 1;
      this.updateProgressBar();
      
      // Clear timeout since we completed normally
      if (this.timeoutTimer) {
        this.timeoutTimer.destroy();
      }
      
      if (this.failedAssets.length > 0) {
        this.showErrorUI();
      } else {
        this.startTransition();
      }
    });
  }

  private startTimeout(): void {
    console.log(`[Preload] Starting ${this.LOAD_TIMEOUT_MS}ms timeout`);
    
    this.timeoutTimer = this.time.delayedCall(this.LOAD_TIMEOUT_MS, () => {
      if (!this.loadComplete && !this.transitionStarted) {
        console.warn('[Preload] ⚠ TIMEOUT - forcing transition');
        this.loadingText.setText('Loading timed out');
        
        // Create fallbacks for any still-pending assets
        this.createAllFallbacks();
        
        // Show error UI with continue option
        this.showErrorUI();
      }
    });
  }

  private queueAssets(): void {
    const base = import.meta.env.BASE_URL || '/';
    console.log(`[Preload] Base URL: ${base}`);
    
    // Core assets - these are what we try to load
    const assets = [
      { key: 'ui_panel', path: `${base}assets/ui/panel.svg` },
      { key: 'ui_button', path: `${base}assets/ui/button.svg` },
      { key: 'ui_frame', path: `${base}assets/ui/frame.svg` },
      { key: 'overlay_vignette', path: `${base}assets/overlays/vignette.svg` },
      { key: 'overlay_grain', path: `${base}assets/overlays/grain.svg` },
      { key: 'arena_bg', path: `${base}assets/arena/background.svg` },
      { key: 'icon_main', path: `${base}assets/icons/icon.svg` },
    ];
    
    assets.forEach(a => {
      console.log(`[Preload] Queuing: ${a.key}`);
      this.load.svg(a.key, a.path);
    });
    
    console.log(`[Preload] Queued ${assets.length} assets`);
  }

  private generateProceduralAssets(): void {
    try {
      const generator = new AssetGenerator(this);
      generator.generateUIAssets();
      generator.generatePortraitAssets();
      generator.generateArenaAssets();
      generator.generateEffectAssets();
      generator.generateIconAssets();
      console.log('[Preload] Procedural assets generated');
    } catch (e) {
      console.error('[Preload] Error generating procedural assets:', e);
    }
  }

  private updateProgressBar(): void {
    if (!this.loadingBar) return;
    
    const barX = this.centerX - this.barWidth / 2;
    const barY = this.centerY + 10;
    const fillWidth = (this.barWidth - 4) * this.currentProgress;
    
    this.loadingBar.clear();
    if (fillWidth > 0) {
      this.loadingBar.fillStyle(0xc9a959, 1);
      this.loadingBar.fillRoundedRect(barX + 2, barY + 2, fillWidth, this.barHeight - 4, 3);
    }
    
    this.progressText.setText(`${Math.floor(this.currentProgress * 100)}%`);
  }

  private createFallbackTexture(key: string): void {
    // Create a simple colored rectangle as fallback
    if (this.textures.exists(key)) return;
    
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x3a2a1a, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(2, 0x5a4a3a, 1);
    graphics.strokeRect(1, 1, 62, 62);
    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
    
    console.log(`[Preload] Created fallback texture: ${key}`);
  }

  private createAllFallbacks(): void {
    // Create fallbacks for all expected assets
    const expectedKeys = [
      'ui_panel', 'ui_button', 'ui_frame',
      'overlay_vignette', 'overlay_grain',
      'arena_bg', 'icon_main'
    ];
    
    expectedKeys.forEach(key => {
      if (!this.textures.exists(key)) {
        this.createFallbackTexture(key);
      }
    });
  }

  private showErrorUI(): void {
    const errorCount = this.failedAssets.length;
    
    if (errorCount > 0) {
      this.errorText.setText(`${errorCount} asset(s) failed to load`);
    } else {
      this.errorText.setText('Loading issues detected');
    }
    
    // Create Continue button
    this.continueButton = this.createButton(
      this.centerX,
      this.centerY + 130,
      'Continue Anyway',
      () => this.startTransition()
    );
    
    // Create Retry button
    this.retryButton = this.createButton(
      this.centerX,
      this.centerY + 175,
      'Retry',
      () => this.retryLoading()
    );
    
    this.loadingText.setText('Some assets failed to load');
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x4a3a2a, 1);
    bg.fillRoundedRect(-80, -18, 160, 36, 6);
    bg.lineStyle(2, 0xc9a959, 1);
    bg.strokeRoundedRect(-80, -18, 160, 36, 6);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    
    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-80, -18, 160, 36);
    bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', callback);
    bg.on('pointerover', () => label.setColor('#ffffff'));
    bg.on('pointerout', () => label.setColor('#c9a959'));
    
    return container;
  }

  private retryLoading(): void {
    console.log('[Preload] Retrying...');
    this.scene.restart();
  }

  private startTransition(): void {
    if (this.transitionStarted) return;
    this.transitionStarted = true;
    
    console.log('[Preload] === STARTING TRANSITION ===');
    
    // Clear timeout
    if (this.timeoutTimer) {
      this.timeoutTimer.destroy();
    }
    
    // Hide buttons if shown
    if (this.retryButton) this.retryButton.setVisible(false);
    if (this.continueButton) this.continueButton.setVisible(false);
    
    // Initialize save system
    try {
      SaveSystem.load();
      SaveSystem.startAutoSave(30000);
    } catch (e) {
      console.error('[Preload] SaveSystem error:', e);
    }

    // Hide HTML loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.pointerEvents = 'none';
    }

    this.loadingText.setText('Starting game...');
    this.currentProgress = 1;
    this.updateProgressBar();

    // Transition with a simple delay (no fade dependency)
    this.time.delayedCall(300, () => {
      console.log('[Preload] >>> scene.start("MainMenuScene")');
      this.scene.start('MainMenuScene');
    });
  }

  // Fallback update loop to catch any edge cases
  update(time: number, delta: number): void {
    // Safety: if loadComplete but not transitioned after 2 seconds, force it
    if (this.loadComplete && !this.transitionStarted) {
      // This shouldn't happen, but just in case
      console.warn('[Preload] Safety transition triggered');
      this.startTransition();
    }
  }

  create(): void {
    // This runs after preload completes
    // Most logic is handled by loader events, but ensure transition starts
    console.log('[Preload] === CREATE ===');
    
    if (!this.transitionStarted && this.loadComplete) {
      if (this.failedAssets.length > 0) {
        this.showErrorUI();
      } else {
        this.startTransition();
      }
    }
  }
}
