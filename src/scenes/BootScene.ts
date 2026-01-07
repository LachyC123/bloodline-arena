/**
 * BootScene - Initial boot and loading screen
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load minimal assets needed for the preload screen
    // These are generated programmatically, no external files needed
  }

  create(): void {
    // Initialize systems
    console.log('BootScene: Initializing game systems');
    
    // Set up game registry for global state
    this.registry.set('initialized', true);
    
    // Transition to preload scene
    this.scene.start('PreloadScene');
  }
}
