/**
 * PreloadScene - Robust asset loading with progress tracking
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
  
  // Indeterminate animation state
  private indeterminateProgress: number = 0;
  private lastRealProgress: number = 0;
  private lastProgressTime: number = 0;
  private indeterminateTimer?: Phaser.Time.TimerEvent;
  private loadComplete: boolean = false;
  private hasLoadErrors: boolean = false;
  
  // Bar dimensions
  private barWidth: number = 300;
  private barHeight: number = 20;
  private barX: number = 0;
  private barY: number = 0;
  
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(): void {
    // Reset state
    this.indeterminateProgress = 0;
    this.lastRealProgress = 0;
    this.lastProgressTime = Date.now();
    this.loadComplete = false;
    this.hasLoadErrors = false;
  }

  preload(): void {
    console.log('[PreloadScene] Starting preload...');
    
    // Create loading UI FIRST
    this.createLoadingUI();
    
    // Set up event listeners BEFORE queuing any assets
    this.setupLoadEvents();
    
    // Start indeterminate animation
    this.startIndeterminateAnimation();
    
    // Queue actual asset files for loading
    this.queueAssets();
    
    // Generate procedural assets (these don't trigger load events)
    this.generateProceduralAssets();
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Store bar position
    this.barX = centerX - this.barWidth / 2;
    this.barY = centerY + 20 - this.barHeight / 2;

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

    // Loading bar border/background
    this.loadingBarBg = this.add.graphics();
    this.loadingBarBg.fillStyle(0x5a4a3a, 1);
    this.loadingBarBg.fillRoundedRect(
      this.barX - 2,
      this.barY - 2,
      this.barWidth + 4,
      this.barHeight + 4,
      4
    );
    this.loadingBarBg.fillStyle(0x2a1f1a, 1);
    this.loadingBarBg.fillRoundedRect(
      this.barX,
      this.barY,
      this.barWidth,
      this.barHeight,
      3
    );

    // Loading bar fill (starts empty)
    this.loadingBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 60, 'Loading assets...', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#8b7355'
    }).setOrigin(0.5);

    // Progress percentage
    this.progressText = this.add.text(centerX, centerY + 80, '0%', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);

    // Error text (hidden initially)
    this.errorText = this.add.text(centerX, centerY + 110, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b4513'
    }).setOrigin(0.5);
  }

  private setupLoadEvents(): void {
    // Progress event - fires as files load
    this.load.on('progress', (value: number) => {
      console.log(`[PreloadScene] Load progress: ${Math.floor(value * 100)}%`);
      this.lastRealProgress = value;
      this.lastProgressTime = Date.now();
      this.updateProgressBar(value);
      this.updateHTMLLoadingBar(value);
    });

    // File complete event
    this.load.on('filecomplete', (key: string, type: string, data: any) => {
      console.log(`[PreloadScene] Loaded: ${type}/${key}`);
      this.loadingText.setText(`Loaded: ${key}`);
    });

    // Error event - fires if an asset fails to load
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`[PreloadScene] Failed to load: ${file.key} from ${file.url}`);
      this.hasLoadErrors = true;
      this.errorText.setText(`⚠️ Failed: ${file.key}`);
    });

    // Complete event - fires when all assets are loaded
    this.load.once('complete', () => {
      console.log('[PreloadScene] All assets loaded!');
      this.loadComplete = true;
      this.loadingText.setText('Ready!');
      this.updateProgressBar(1);
      this.updateHTMLLoadingBar(1);
      
      // Stop indeterminate animation
      if (this.indeterminateTimer) {
        this.indeterminateTimer.destroy();
      }
    });
  }

  private startIndeterminateAnimation(): void {
    // Subtle animation that moves the bar even if no progress events fire
    // This prevents a "dead" looking loading screen
    this.indeterminateTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (this.loadComplete) return;
        
        const timeSinceProgress = Date.now() - this.lastProgressTime;
        
        // If no progress for 500ms, slowly animate
        if (timeSinceProgress > 500) {
          // Slowly increase indeterminate progress, but cap at 92%
          const maxIndeterminate = 0.92;
          const increment = 0.002;
          
          this.indeterminateProgress = Math.min(
            this.indeterminateProgress + increment,
            maxIndeterminate
          );
          
          // Only update if indeterminate is ahead of real progress
          if (this.indeterminateProgress > this.lastRealProgress) {
            this.updateProgressBar(this.indeterminateProgress);
            this.updateHTMLLoadingBar(this.indeterminateProgress);
          }
        }
      },
      loop: true
    });
  }

  private updateProgressBar(value: number): void {
    if (!this.loadingBar) return;
    
    this.loadingBar.clear();
    
    if (value > 0) {
      // Gradient fill
      this.loadingBar.fillGradientStyle(0x8b4513, 0x8b4513, 0xc9a959, 0xc9a959);
      this.loadingBar.fillRoundedRect(
        this.barX + 2,
        this.barY + 2,
        Math.max(0, (this.barWidth - 4) * value),
        this.barHeight - 4,
        2
      );
    }

    const percent = Math.floor(value * 100);
    if (this.progressText) {
      this.progressText.setText(`${percent}%`);
    }
  }

  private updateHTMLLoadingBar(value: number): void {
    // Update the HTML loading bar too
    const htmlBar = document.getElementById('loading-bar');
    const htmlText = document.getElementById('loading-text');
    
    if (htmlBar) {
      htmlBar.style.width = `${value * 100}%`;
    }
    if (htmlText) {
      htmlText.textContent = `${Math.floor(value * 100)}%`;
    }
  }

  private queueAssets(): void {
    // Get base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || '/';
    
    console.log(`[PreloadScene] Base URL: ${baseUrl}`);
    
    // Queue UI assets
    this.load.svg('ui_panel', `${baseUrl}assets/ui/panel.svg`);
    this.load.svg('ui_button', `${baseUrl}assets/ui/button.svg`);
    this.load.svg('ui_frame', `${baseUrl}assets/ui/frame.svg`);
    
    // Queue overlay assets
    this.load.svg('overlay_vignette', `${baseUrl}assets/overlays/vignette.svg`);
    this.load.svg('overlay_grain', `${baseUrl}assets/overlays/grain.svg`);
    
    // Queue arena assets
    this.load.svg('arena_background', `${baseUrl}assets/arena/background.svg`);
    
    // Queue icon
    this.load.svg('icon_main', `${baseUrl}assets/icons/icon.svg`);
    
    console.log(`[PreloadScene] Queued ${this.load.totalToLoad} assets for loading`);
  }

  private generateProceduralAssets(): void {
    // These generate textures at runtime, don't trigger load events
    const generator = new AssetGenerator(this);
    
    generator.generateUIAssets();
    generator.generatePortraitAssets();
    generator.generateArenaAssets();
    generator.generateEffectAssets();
    generator.generateIconAssets();
  }

  create(): void {
    console.log('[PreloadScene] Create phase starting...');
    
    // Initialize save system
    SaveSystem.load();
    SaveSystem.startAutoSave(30000);

    // Hide HTML loading screen with smooth transition
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      // Remove from DOM after transition completes
      setTimeout(() => {
        loadingScreen.classList.add('removed');
      }, 300);
    }

    // Log any errors
    if (this.hasLoadErrors) {
      console.warn('[PreloadScene] Completed with errors - some assets may be missing');
    }

    // Small delay to show 100% before transitioning
    this.time.delayedCall(300, () => {
      // Fade transition to main menu
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('[PreloadScene] Transitioning to MainMenuScene');
        this.scene.start('MainMenuScene');
      });
    });
  }
}
