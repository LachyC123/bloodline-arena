/**
 * ErrorOverlay - Global error catching and display system
 * Shows errors on screen instead of black screens
 */

interface ErrorEntry {
  timestamp: number;
  type: 'error' | 'rejection' | 'loader' | 'scene';
  message: string;
  stack?: string;
}

class ErrorOverlayManager {
  private errors: ErrorEntry[] = [];
  private overlay: HTMLDivElement | null = null;
  private maxErrors = 10;
  private isVisible = false;
  
  constructor() {
    this.setupGlobalHandlers();
    this.createOverlay();
  }
  
  private setupGlobalHandlers(): void {
    // Catch uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.addError({
        type: 'error',
        message: String(message),
        stack: error?.stack || `at ${source}:${lineno}:${colno}`
      });
      return false; // Let other handlers run
    };
    
    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      this.addError({
        type: 'rejection',
        message: reason?.message || String(reason),
        stack: reason?.stack
      });
    };
    
    console.log('[ErrorOverlay] Global error handlers installed');
  }
  
  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'error-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(20, 10, 10, 0.95);
      color: #ff6666;
      font-family: monospace;
      font-size: 12px;
      padding: 20px;
      overflow: auto;
      z-index: 99999;
      display: none;
      pointer-events: auto;
    `;
    
    document.body.appendChild(this.overlay);
  }
  
  addError(entry: Omit<ErrorEntry, 'timestamp'>): void {
    const error: ErrorEntry = {
      ...entry,
      timestamp: Date.now()
    };
    
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }
    
    console.error(`[ErrorOverlay] ${entry.type}: ${entry.message}`);
    if (entry.stack) {
      console.error(entry.stack);
    }
    
    this.render();
    this.show();
  }
  
  addSceneError(sceneName: string, phase: string, error: Error | string): void {
    this.addError({
      type: 'scene',
      message: `Scene "${sceneName}" failed in ${phase}: ${error instanceof Error ? error.message : error}`,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
  
  addLoaderError(key: string, url: string): void {
    this.addError({
      type: 'loader',
      message: `Failed to load asset: ${key} from ${url}`
    });
  }
  
  private render(): void {
    if (!this.overlay) return;
    
    const html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h2 style="color: #ff4444; margin: 0;">⚠️ ERRORS (${this.errors.length})</h2>
        <div>
          <button id="error-overlay-hide" style="background: #333; color: #fff; border: 1px solid #666; padding: 8px 16px; margin-right: 8px; cursor: pointer;">Hide</button>
          <button id="error-overlay-clear" style="background: #333; color: #fff; border: 1px solid #666; padding: 8px 16px; margin-right: 8px; cursor: pointer;">Clear</button>
          <button id="error-overlay-reload" style="background: #444; color: #fff; border: 1px solid #888; padding: 8px 16px; cursor: pointer;">Reload Game</button>
        </div>
      </div>
      <div style="border-top: 1px solid #444; padding-top: 10px;">
        ${this.errors.map((e, i) => `
          <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,0,0,0.1); border-left: 3px solid ${this.getTypeColor(e.type)};">
            <div style="color: ${this.getTypeColor(e.type)}; font-weight: bold;">[${e.type.toUpperCase()}] ${new Date(e.timestamp).toLocaleTimeString()}</div>
            <div style="margin-top: 5px; word-break: break-all;">${this.escapeHtml(e.message)}</div>
            ${e.stack ? `<pre style="margin-top: 8px; font-size: 10px; color: #888; white-space: pre-wrap; word-break: break-all;">${this.escapeHtml(e.stack)}</pre>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 20px; color: #888; font-size: 10px;">
        Tip: Open browser console (F12) for full stack traces
      </div>
    `;
    
    this.overlay.innerHTML = html;
    
    // Attach event handlers
    document.getElementById('error-overlay-hide')?.addEventListener('click', () => this.hide());
    document.getElementById('error-overlay-clear')?.addEventListener('click', () => this.clear());
    document.getElementById('error-overlay-reload')?.addEventListener('click', () => window.location.reload());
  }
  
  private getTypeColor(type: ErrorEntry['type']): string {
    switch (type) {
      case 'error': return '#ff4444';
      case 'rejection': return '#ff8844';
      case 'loader': return '#ffaa44';
      case 'scene': return '#ff66aa';
      default: return '#ffffff';
    }
  }
  
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
  show(): void {
    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.isVisible = true;
    }
  }
  
  hide(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      this.isVisible = false;
    }
  }
  
  clear(): void {
    this.errors = [];
    this.render();
    this.hide();
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  getErrors(): ErrorEntry[] {
    return [...this.errors];
  }
}

// Singleton instance
export const errorOverlay = new ErrorOverlayManager();

/**
 * Safe scene wrapper - wraps create() to catch errors
 */
export function safeSceneCreate<T extends Phaser.Scene>(
  scene: T,
  createFn: () => void
): void {
  const sceneName = scene.scene.key;
  console.log(`[Scene] ${sceneName} create() START`);
  
  try {
    createFn();
    console.log(`[Scene] ${sceneName} create() END`);
  } catch (error) {
    console.error(`[Scene] ${sceneName} create() FAILED:`, error);
    errorOverlay.addSceneError(sceneName, 'create()', error as Error);
    
    // Try to show a fallback UI
    showSceneErrorFallback(scene, sceneName, error as Error);
  }
}

/**
 * Show fallback error UI in the scene
 */
function showSceneErrorFallback(scene: Phaser.Scene, sceneName: string, error: Error): void {
  try {
    const { width, height } = scene.cameras.main;
    
    // Clear any existing objects that might be causing issues
    scene.cameras.main.setAlpha(1);
    scene.cameras.main.resetFX();
    
    // Dark background
    const bg = scene.add.rectangle(width / 2, height / 2, width, height, 0x1a0a0a);
    bg.setDepth(9000);
    
    // Error title
    const title = scene.add.text(width / 2, height / 2 - 60, `⚠️ ${sceneName} Error`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#ff6666'
    }).setOrigin(0.5).setDepth(9001);
    
    // Error message
    const msg = scene.add.text(width / 2, height / 2, error.message || 'Unknown error', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cc8888',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5).setDepth(9001);
    
    // Return button
    const btnBg = scene.add.rectangle(width / 2, height / 2 + 80, 160, 44, 0x333333);
    btnBg.setStrokeStyle(2, 0x666666);
    btnBg.setDepth(9001);
    btnBg.setInteractive({ useHandCursor: true });
    
    const btnText = scene.add.text(width / 2, height / 2 + 80, 'Return to Menu', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(9002);
    
    btnBg.on('pointerdown', () => {
      scene.scene.start('MainMenuScene');
    });
    
  } catch (fallbackError) {
    console.error('[Scene] Fallback UI also failed:', fallbackError);
  }
}

/**
 * Scene transition logger
 */
export function logSceneTransition(fromScene: string, toScene: string, data?: Record<string, unknown>): void {
  console.log('═══════════════════════════════════════');
  console.log(`[TRANSITION] ${fromScene} → ${toScene}`);
  if (data) {
    console.log('[TRANSITION] Data:', JSON.stringify(data, null, 2));
  }
  console.log('═══════════════════════════════════════');
}
