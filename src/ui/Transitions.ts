/**
 * Transitions - Scene transition effects
 * Provides smooth, thematic transitions between scenes
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { COLORS } from './Theme';

export type TransitionType = 'fade' | 'wipe' | 'ink' | 'stamp';

/**
 * Create a transition effect when changing scenes
 */
export function createTransitionOut(
  scene: Phaser.Scene,
  type: TransitionType = 'fade',
  duration: number = 300
): Promise<void> {
  const settings = SaveSystem.getSettings();
  
  // Use simple fade if reduce motion is enabled
  if (settings.reduceMotion) {
    return simpleFadeOut(scene, duration);
  }
  
  switch (type) {
    case 'wipe':
      return wipeTransitionOut(scene, duration);
    case 'ink':
      return inkTransitionOut(scene, duration);
    case 'stamp':
      return stampTransitionOut(scene, duration);
    default:
      return simpleFadeOut(scene, duration);
  }
}

/**
 * Create a transition effect when entering a scene
 */
export function createTransitionIn(
  scene: Phaser.Scene,
  type: TransitionType = 'fade',
  duration: number = 300
): Promise<void> {
  const settings = SaveSystem.getSettings();
  
  if (settings.reduceMotion) {
    scene.cameras.main.fadeIn(duration);
    return new Promise(resolve => {
      scene.time.delayedCall(duration, resolve);
    });
  }
  
  switch (type) {
    case 'wipe':
      return wipeTransitionIn(scene, duration);
    case 'ink':
      return inkTransitionIn(scene, duration);
    case 'stamp':
      return stampTransitionIn(scene, duration);
    default:
      scene.cameras.main.fadeIn(duration);
      return new Promise(resolve => {
        scene.time.delayedCall(duration, resolve);
      });
  }
}

// ========== SIMPLE FADE ==========

function simpleFadeOut(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    scene.cameras.main.fadeOut(duration);
    scene.cameras.main.once('camerafadeoutcomplete', resolve);
  });
}

// ========== WIPE TRANSITION ==========

function wipeTransitionOut(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    
    const wipe = scene.add.graphics();
    wipe.fillStyle(COLORS.bgDark, 1);
    wipe.setDepth(1000);
    
    const mask = scene.add.graphics();
    mask.fillRect(-width, 0, width, height);
    
    scene.tweens.add({
      targets: mask,
      x: width,
      duration,
      ease: 'Quad.inOut',
      onUpdate: () => {
        wipe.clear();
        wipe.fillStyle(COLORS.bgDark, 1);
        wipe.fillRect(0, 0, mask.x + width, height);
      },
      onComplete: () => {
        wipe.destroy();
        mask.destroy();
        resolve();
      }
    });
  });
}

function wipeTransitionIn(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    
    const wipe = scene.add.graphics();
    wipe.fillStyle(COLORS.bgDark, 1);
    wipe.fillRect(0, 0, width, height);
    wipe.setDepth(1000);
    
    scene.tweens.add({
      targets: wipe,
      x: -width,
      duration,
      ease: 'Quad.inOut',
      onComplete: () => {
        wipe.destroy();
        resolve();
      }
    });
  });
}

// ========== INK SPLASH TRANSITION ==========

function inkTransitionOut(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    const container = scene.add.container(0, 0);
    container.setDepth(1000);
    
    // Create multiple ink splotches
    const numSplotches = 8;
    const splotches: Phaser.GameObjects.Graphics[] = [];
    
    for (let i = 0; i < numSplotches; i++) {
      const splotch = scene.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      splotch.fillStyle(COLORS.bgDark, 1);
      splotch.fillCircle(x, y, 0);
      splotches.push(splotch);
      container.add(splotch);
    }
    
    // Animate splotches expanding
    scene.tweens.add({
      targets: { r: 0 },
      r: Math.max(width, height),
      duration,
      ease: 'Quad.in',
      onUpdate: (tween) => {
        const radius = tween.getValue() as number;
        splotches.forEach((splotch, i) => {
          splotch.clear();
          splotch.fillStyle(COLORS.bgDark, 1);
          const x = (i / numSplotches) * width + (Math.random() - 0.5) * 50;
          const y = (Math.floor(i / 2) / 4) * height + (Math.random() - 0.5) * 50;
          splotch.fillCircle(x, y, radius * (0.8 + Math.random() * 0.4));
        });
      },
      onComplete: () => {
        container.destroy();
        resolve();
      }
    });
  });
}

function inkTransitionIn(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    
    // Start with full coverage
    const cover = scene.add.graphics();
    cover.fillStyle(COLORS.bgDark, 1);
    cover.fillRect(0, 0, width, height);
    cover.setDepth(1000);
    
    // Fade out with dissolve effect
    scene.tweens.add({
      targets: cover,
      alpha: 0,
      duration,
      ease: 'Quad.out',
      onComplete: () => {
        cover.destroy();
        resolve();
      }
    });
  });
}

// ========== STAMP TRANSITION ==========

function stampTransitionOut(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    
    // Create wax seal stamp effect
    const container = scene.add.container(width / 2, height / 2);
    container.setDepth(1000);
    container.setScale(0);
    
    // Seal background
    const seal = scene.add.graphics();
    seal.fillStyle(0x8b0000, 1);
    seal.fillCircle(0, 0, 80);
    seal.lineStyle(4, 0x5a0000, 1);
    seal.strokeCircle(0, 0, 80);
    container.add(seal);
    
    // Seal emblem (simple sword)
    const emblem = scene.add.text(0, 0, '⚔️', {
      fontSize: '48px'
    }).setOrigin(0.5);
    container.add(emblem);
    
    // Fade background
    const bg = scene.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark, 0);
    bg.setDepth(999);
    
    scene.tweens.add({
      targets: bg,
      alpha: 1,
      duration: duration * 0.6
    });
    
    scene.tweens.add({
      targets: container,
      scale: 1,
      duration: duration * 0.4,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.time.delayedCall(duration * 0.3, () => {
          container.destroy();
          bg.destroy();
          resolve();
        });
      }
    });
  });
}

function stampTransitionIn(scene: Phaser.Scene, duration: number): Promise<void> {
  return new Promise(resolve => {
    const { width, height } = scene.cameras.main;
    
    // Stamp shrinks and fades
    const container = scene.add.container(width / 2, height / 2);
    container.setDepth(1000);
    
    const seal = scene.add.graphics();
    seal.fillStyle(0x8b0000, 1);
    seal.fillCircle(0, 0, 80);
    container.add(seal);
    
    const emblem = scene.add.text(0, 0, '⚔️', {
      fontSize: '48px'
    }).setOrigin(0.5);
    container.add(emblem);
    
    const bg = scene.add.rectangle(width / 2, height / 2, width, height, COLORS.bgDark, 1);
    bg.setDepth(999);
    
    scene.tweens.add({
      targets: bg,
      alpha: 0,
      duration: duration * 0.6,
      delay: duration * 0.2
    });
    
    scene.tweens.add({
      targets: container,
      scale: 0,
      alpha: 0,
      duration: duration * 0.4,
      delay: duration * 0.1,
      ease: 'Back.easeIn',
      onComplete: () => {
        container.destroy();
        bg.destroy();
        resolve();
      }
    });
  });
}

/**
 * Helper to transition between scenes with effect
 */
export async function transitionToScene(
  currentScene: Phaser.Scene,
  targetScene: string,
  transitionType: TransitionType = 'fade',
  duration: number = 300
): Promise<void> {
  await createTransitionOut(currentScene, transitionType, duration);
  currentScene.scene.start(targetScene);
}
