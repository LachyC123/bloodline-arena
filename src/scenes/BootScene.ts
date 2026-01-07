/**
 * BootScene - Initial boot scene
 * First scene to run, initializes game state and transitions to PreloadScene
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  init(): void {
    console.log('[BootScene] Initializing...');
  }

  preload(): void {
    // No assets to load here - keep this scene minimal
    // All asset loading happens in PreloadScene
  }

  create(): void {
    console.log('[BootScene] Created - transitioning to PreloadScene');
    
    // Set up game registry for global state
    this.registry.set('initialized', true);
    this.registry.set('gameVersion', '1.0.0');
    
    // Immediately transition to preload scene
    // No delay needed since this is just initialization
    this.scene.start('PreloadScene');
  }
}
