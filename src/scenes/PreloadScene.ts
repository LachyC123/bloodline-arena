/**
 * PreloadScene - Bulletproof loading with full diagnostics
 * GUARANTEES: Will NEVER hang indefinitely
 * - Shows exactly what's loading/failed
 * - 8-second hard timeout
 * - Retry/Continue buttons on failure
 * - Creates fallback textures for safe mode
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { AssetGenerator } from '../ui/AssetGenerator';
import { assetUrl } from '../utils/assetUrl';

interface LoaderDiagnostics {
  totalToLoad: number;
  totalComplete: number;
  totalFailed: number;
  lastFileKey: string;
  lastFileUrl: string;
  failedFiles: { key: string; url: string }[];
  startTime: number;
}

export class PreloadScene extends Phaser.Scene {
  // Diagnostics state
  private diag: LoaderDiagnostics = {
    totalToLoad: 0,
    totalComplete: 0,
    totalFailed: 0,
    lastFileKey: '',
    lastFileUrl: '',
    failedFiles: [],
    startTime: 0
  };
  
  // UI Elements
  private progressBar!: Phaser.GameObjects.Graphics;
  private diagText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private failedText!: Phaser.GameObjects.Text;
  private retryBtn!: Phaser.GameObjects.Container;
  private continueBtn!: Phaser.GameObjects.Container;
  
  // State flags
  private loadComplete = false;
  private timedOut = false;
  private transitionStarted = false;
  private timeoutTimer?: Phaser.Time.TimerEvent;
  
  // Config
  private readonly TIMEOUT_MS = 8000;
  private readonly BAR_WIDTH = 260;
  private readonly BAR_HEIGHT = 18;
  
  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(): void {
    // Reset all state
    this.diag = {
      totalToLoad: 0,
      totalComplete: 0,
      totalFailed: 0,
      lastFileKey: '',
      lastFileUrl: '',
      failedFiles: [],
      startTime: Date.now()
    };
    this.loadComplete = false;
    this.timedOut = false;
    this.transitionStarted = false;
    
    console.log('═══════════════════════════════════════');
    console.log('[PRELOAD] Scene initialized');
    console.log(`[PRELOAD] BASE_URL = "${import.meta.env.BASE_URL}"`);
    console.log('═══════════════════════════════════════');
  }

  preload(): void {
    // 1. Create diagnostic UI FIRST
    this.createDiagnosticUI();
    
    // 2. Set up loader events BEFORE queuing
    this.setupLoaderEvents();
    
    // 3. Start hard timeout
    this.startTimeout();
    
    // 4. Queue assets
    this.queueAssets();
    
    // 5. Generate procedural assets (no loader needed)
    this.generateProceduralAssets();
    
    // Update initial diagnostics
    this.diag.totalToLoad = this.load.totalToLoad;
    this.updateDiagnostics();
    
    console.log(`[PRELOAD] Queued ${this.diag.totalToLoad} files`);
  }

  private createDiagnosticUI(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, 0x1a1410);

    // Title
    this.add.text(cx, cy - 120, 'BLOODLINE ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(cx, cy - 90, 'Loading...', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Progress bar background
    const barX = cx - this.BAR_WIDTH / 2;
    const barY = cy - 30;
    
    const barBg = this.add.graphics();
    barBg.fillStyle(0x3a2a1a, 1);
    barBg.fillRoundedRect(barX - 2, barY - 2, this.BAR_WIDTH + 4, this.BAR_HEIGHT + 4, 4);
    barBg.fillStyle(0x1a1410, 1);
    barBg.fillRoundedRect(barX, barY, this.BAR_WIDTH, this.BAR_HEIGHT, 3);

    // Progress bar fill
    this.progressBar = this.add.graphics();

    // Status text (current file)
    this.statusText = this.add.text(cx, cy + 10, 'Initializing...', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(0.5);

    // Diagnostics panel
    this.diagText = this.add.text(cx, cy + 45, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#6a6a5a',
      align: 'center'
    }).setOrigin(0.5);

    // Failed files text (scrolling list)
    this.failedText = this.add.text(cx, cy + 90, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#aa6666',
      align: 'center',
      wordWrap: { width: width - 40 }
    }).setOrigin(0.5, 0);
  }

  private setupLoaderEvents(): void {
    // Progress event
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });

    // File started
    this.load.on('filestart', (file: Phaser.Loader.File) => {
      this.diag.lastFileKey = file.key;
      // file.src can be string or object, convert safely
      const src = typeof file.src === 'string' ? file.src : String(file.src ?? file.url ?? '(unknown)');
      this.diag.lastFileUrl = src;
      this.statusText.setText(`Loading: ${file.key}`);
      console.log(`[PRELOAD] Loading: ${file.key} -> ${src}`);
    });

    // File complete (success)
    this.load.on('filecomplete', (key: string) => {
      this.diag.totalComplete++;
      console.log(`[PRELOAD] ✓ Complete: ${key}`);
      this.updateDiagnostics();
    });

    // File error
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.diag.totalFailed++;
      // file.src can be string or object, convert safely
      const failedUrl = typeof file.src === 'string' ? file.src : String(file.src ?? file.url ?? '(unknown)');
      this.diag.failedFiles.push({ key: file.key, url: failedUrl });
      console.error(`[PRELOAD] ✗ FAILED: ${file.key} -> ${failedUrl}`);
      this.updateDiagnostics();
      this.updateFailedList();
      
      // Create fallback texture immediately
      this.createFallbackTexture(file.key);
    });

    // All loading complete
    this.load.once('complete', () => {
      this.loadComplete = true;
      console.log('[PRELOAD] ═══ LOADER COMPLETE ═══');
      console.log(`[PRELOAD] Success: ${this.diag.totalComplete}, Failed: ${this.diag.totalFailed}`);
      
      this.clearTimeout();
      
      if (this.diag.totalFailed > 0) {
        this.showErrorUI();
      } else {
        this.startTransition();
      }
    });
  }

  private startTimeout(): void {
    console.log(`[PRELOAD] Starting ${this.TIMEOUT_MS}ms timeout`);
    
    this.timeoutTimer = this.time.delayedCall(this.TIMEOUT_MS, () => {
      if (!this.loadComplete && !this.transitionStarted) {
        this.timedOut = true;
        console.error('[PRELOAD] ⚠ TIMEOUT - Loading took too long!');
        console.error('[PRELOAD] Pending files may have 404ed or stalled');
        this.showErrorUI();
      }
    });
  }

  private clearTimeout(): void {
    if (this.timeoutTimer) {
      this.timeoutTimer.destroy();
      this.timeoutTimer = undefined;
    }
  }

  private queueAssets(): void {
    // Queue core assets using assetUrl helper
    const assets = [
      { key: 'ui_panel', path: 'assets/ui/panel.svg' },
      { key: 'ui_button', path: 'assets/ui/button.svg' },
      { key: 'ui_frame', path: 'assets/ui/frame.svg' },
      { key: 'overlay_vignette', path: 'assets/overlays/vignette.svg' },
      { key: 'overlay_grain', path: 'assets/overlays/grain.svg' },
      { key: 'arena_bg', path: 'assets/arena/background.svg' },
      { key: 'icon_main', path: 'assets/icons/icon.svg' },
    ];

    assets.forEach(({ key, path }) => {
      const url = assetUrl(path);
      console.log(`[PRELOAD] Queue: ${key} -> ${url}`);
      this.load.svg(key, url);
    });
  }

  private generateProceduralAssets(): void {
    try {
      const generator = new AssetGenerator(this);
      generator.generateUIAssets();
      generator.generatePortraitAssets();
      generator.generateArenaAssets();
      generator.generateEffectAssets();
      generator.generateIconAssets();
      console.log('[PRELOAD] Procedural assets generated');
    } catch (e) {
      console.error('[PRELOAD] Procedural asset error:', e);
    }
  }

  private updateProgressBar(value: number): void {
    if (!this.progressBar) return;
    
    const { width, height } = this.cameras.main;
    const barX = width / 2 - this.BAR_WIDTH / 2;
    const barY = height / 2 - 30;
    const fillW = Math.max(0, (this.BAR_WIDTH - 4) * value);
    
    this.progressBar.clear();
    if (fillW > 0) {
      this.progressBar.fillStyle(0xc9a959, 1);
      this.progressBar.fillRoundedRect(barX + 2, barY + 2, fillW, this.BAR_HEIGHT - 4, 2);
    }
  }

  private updateDiagnostics(): void {
    const elapsed = ((Date.now() - this.diag.startTime) / 1000).toFixed(1);
    const lines = [
      `Files: ${this.diag.totalComplete}/${this.diag.totalToLoad} loaded, ${this.diag.totalFailed} failed`,
      `Time: ${elapsed}s`,
      `Last: ${this.diag.lastFileKey || '(none)'}`
    ];
    this.diagText.setText(lines.join('\n'));
  }

  private updateFailedList(): void {
    if (this.diag.failedFiles.length === 0) {
      this.failedText.setText('');
      return;
    }
    
    const header = `⚠ FAILED FILES (${this.diag.failedFiles.length}):\n`;
    const list = this.diag.failedFiles
      .slice(-5) // Show last 5
      .map(f => `${f.key}: ${f.url}`)
      .join('\n');
    this.failedText.setText(header + list);
  }

  private createFallbackTexture(key: string): void {
    if (this.textures.exists(key)) return;
    
    // Create a simple fallback texture
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0x5a4a3a, 1);
    g.strokeRect(2, 2, 60, 60);
    // Add X to show it's a fallback
    g.lineStyle(1, 0x8b4513, 0.5);
    g.moveTo(8, 8);
    g.lineTo(56, 56);
    g.moveTo(56, 8);
    g.lineTo(8, 56);
    g.strokePath();
    g.generateTexture(key, 64, 64);
    g.destroy();
    
    console.log(`[PRELOAD] Created fallback texture: ${key}`);
  }

  private createAllFallbacks(): void {
    const essentialKeys = [
      'ui_panel', 'ui_button', 'ui_frame',
      'overlay_vignette', 'overlay_grain',
      'arena_bg', 'icon_main',
      'parchment_overlay', 'vignette', 'particle'
    ];
    essentialKeys.forEach(key => {
      if (!this.textures.exists(key)) {
        this.createFallbackTexture(key);
      }
    });
  }

  private showErrorUI(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    
    this.clearTimeout();
    
    // Update status
    const reason = this.timedOut ? 'TIMEOUT' : `${this.diag.totalFailed} file(s) failed`;
    this.statusText.setText(`Loading issue: ${reason}`);
    this.statusText.setColor('#cc8866');
    
    // Create fallbacks for safe mode
    this.createAllFallbacks();
    
    // Retry button
    this.retryBtn = this.createButton(cx, height / 2 + 150, 'Retry Loading', () => {
      console.log('[PRELOAD] User clicked Retry');
      this.scene.restart();
    });
    
    // Continue button
    this.continueBtn = this.createButton(cx, height / 2 + 195, 'Continue (Safe Mode)', () => {
      console.log('[PRELOAD] User clicked Continue (Safe Mode)');
      this.startTransition(true);
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x3a2a1a, 1);
    bg.fillRoundedRect(-90, -16, 180, 32, 6);
    bg.lineStyle(2, 0x8b7355, 1);
    bg.strokeRoundedRect(-90, -16, 180, 32, 6);
    
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    
    bg.setInteractive(new Phaser.Geom.Rectangle(-90, -16, 180, 32), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4a3a2a, 1);
      bg.fillRoundedRect(-90, -16, 180, 32, 6);
      bg.lineStyle(2, 0xc9a959, 1);
      bg.strokeRoundedRect(-90, -16, 180, 32, 6);
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3a2a1a, 1);
      bg.fillRoundedRect(-90, -16, 180, 32, 6);
      bg.lineStyle(2, 0x8b7355, 1);
      bg.strokeRoundedRect(-90, -16, 180, 32, 6);
    });
    
    return container;
  }

  private startTransition(safeMode: boolean = false): void {
    if (this.transitionStarted) return;
    this.transitionStarted = true;
    
    this.clearTimeout();
    
    // Hide error buttons if shown
    if (this.retryBtn) this.retryBtn.setVisible(false);
    if (this.continueBtn) this.continueBtn.setVisible(false);
    
    // Create all fallbacks if in safe mode
    if (safeMode) {
      this.createAllFallbacks();
    }
    
    // Initialize save system
    try {
      SaveSystem.load();
      SaveSystem.startAutoSave(30000);
    } catch (e) {
      console.warn('[PRELOAD] SaveSystem error:', e);
    }
    
    // Hide HTML loading screen
    const htmlLoader = document.getElementById('loading-screen');
    if (htmlLoader) {
      htmlLoader.style.opacity = '0';
      htmlLoader.style.pointerEvents = 'none';
    }
    
    // Show transition message
    this.statusText.setText('Loading complete, entering MainMenu...');
    this.statusText.setColor('#8b7355');
    this.updateProgressBar(1);
    
    console.log('═══════════════════════════════════════');
    console.log('[PRELOAD] Starting transition to MainMenuScene');
    console.log('═══════════════════════════════════════');
    
    // Transition after short delay
    this.time.delayedCall(400, () => {
      console.log('[PRELOAD] >>> this.scene.start("MainMenuScene")');
      this.scene.start('MainMenuScene');
    });
  }

  create(): void {
    // This runs after preload() finishes (whether loader completed or not)
    console.log('[PRELOAD] create() called');
    
    // If not already transitioning, start now
    if (!this.transitionStarted && this.loadComplete) {
      if (this.diag.totalFailed > 0) {
        this.showErrorUI();
      } else {
        this.startTransition();
      }
    }
  }

  update(): void {
    // Update elapsed time in diagnostics
    if (!this.transitionStarted) {
      this.updateDiagnostics();
    }
  }
}
