/**
 * Transitions - Scene transition effects
 * Parchment wipes, ink splashes, wax stamps
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

export type TransitionType = 'fade' | 'wipe' | 'ink_splash' | 'wax_stamp' | 'slide';

export class Transitions {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Play transition effect and call callback when done
   */
  async playTransition(
    type: TransitionType,
    direction: 'in' | 'out',
    duration: number = 500
  ): Promise<void> {
    const settings = SaveSystem.getSettings();
    
    // Use simple fade if reduce motion is on
    if (settings.reduceMotion && type !== 'fade') {
      type = 'fade';
    }

    switch (type) {
      case 'fade':
        return this.fadeTransition(direction, duration);
      case 'wipe':
        return this.wipeTransition(direction, duration);
      case 'ink_splash':
        return this.inkSplashTransition(direction, duration);
      case 'wax_stamp':
        return this.waxStampTransition(direction, duration);
      case 'slide':
        return this.slideTransition(direction, duration);
    }
  }

  private fadeTransition(direction: 'in' | 'out', duration: number): Promise<void> {
    return new Promise(resolve => {
      if (direction === 'out') {
        this.scene.cameras.main.fadeOut(duration, 26, 20, 16);
        this.scene.cameras.main.once('camerafadeoutcomplete', resolve);
      } else {
        this.scene.cameras.main.fadeIn(duration, 26, 20, 16);
        this.scene.cameras.main.once('camerafadeincomplete', resolve);
      }
    });
  }

  private wipeTransition(direction: 'in' | 'out', duration: number): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      
      const wipe = this.scene.add.graphics();
      wipe.setDepth(9999);
      
      // Parchment texture color
      wipe.fillStyle(0x2a1f1a, 1);
      
      if (direction === 'out') {
        // Wipe from left to right
        wipe.fillRect(0, 0, 0, height);
        
        this.scene.tweens.add({
          targets: { progress: 0 },
          progress: 1,
          duration: duration,
          ease: 'Quad.inOut',
          onUpdate: (tween) => {
            const p = tween.getValue();
            if (typeof p === 'number') {
              wipe.clear();
              wipe.fillStyle(0x2a1f1a, 1);
              wipe.fillRect(0, 0, width * p, height);
            }
          },
          onComplete: () => resolve()
        });
      } else {
        // Full coverage then wipe away
        wipe.fillRect(0, 0, width, height);
        
        this.scene.tweens.add({
          targets: { progress: 0 },
          progress: 1,
          duration: duration,
          ease: 'Quad.inOut',
          onUpdate: (tween) => {
            const p = tween.getValue();
            if (typeof p === 'number') {
              wipe.clear();
              wipe.fillStyle(0x2a1f1a, 1);
              wipe.fillRect(width * p, 0, width * (1 - p), height);
            }
          },
          onComplete: () => {
            wipe.destroy();
            resolve();
          }
        });
      }
    });
  }

  private inkSplashTransition(direction: 'in' | 'out', duration: number): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      const cx = width / 2;
      const cy = height / 2;
      
      const ink = this.scene.add.graphics();
      ink.setDepth(9999);
      
      if (direction === 'out') {
        // Expanding ink blot
        this.scene.tweens.add({
          targets: { radius: 0 },
          radius: Math.max(width, height),
          duration: duration,
          ease: 'Quad.out',
          onUpdate: (tween) => {
            const r = tween.getValue();
            if (typeof r === 'number') {
              ink.clear();
              ink.fillStyle(0x1a1410, 1);
              ink.fillCircle(cx, cy, r);
              
              // Add some splatter
              for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = r * 0.8;
                ink.fillCircle(
                  cx + Math.cos(angle) * dist,
                  cy + Math.sin(angle) * dist,
                  r * 0.2
                );
              }
            }
          },
          onComplete: () => resolve()
        });
      } else {
        // Start with full coverage, shrink
        const maxRadius = Math.max(width, height);
        ink.fillStyle(0x1a1410, 1);
        ink.fillCircle(cx, cy, maxRadius);
        
        // Create reveal mask effect
        this.scene.tweens.add({
          targets: ink,
          alpha: 0,
          duration: duration,
          ease: 'Quad.in',
          onComplete: () => {
            ink.destroy();
            resolve();
          }
        });
      }
    });
  }

  private waxStampTransition(direction: 'in' | 'out', duration: number): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      const cx = width / 2;
      const cy = height / 2;
      
      if (direction === 'out') {
        // Wax seal covering screen
        const wax = this.scene.add.graphics();
        wax.setDepth(9999);
        
        this.scene.tweens.add({
          targets: { radius: 0 },
          radius: Math.max(width, height),
          duration: duration * 0.6,
          ease: 'Quad.out',
          onUpdate: (tween) => {
            const r = tween.getValue();
            if (typeof r === 'number') {
              wax.clear();
              wax.fillStyle(0x8b0000, 1);
              wax.fillCircle(cx, cy, r);
            }
          },
          onComplete: () => {
            // Stamp impression
            const stamp = this.scene.add.text(cx, cy, '⚔️', {
              fontSize: '48px'
            }).setOrigin(0.5).setDepth(10000);
            
            stamp.setScale(3);
            stamp.setAlpha(0);
            
            this.scene.tweens.add({
              targets: stamp,
              scale: 1,
              alpha: 1,
              duration: duration * 0.4,
              ease: 'Back.out',
              onComplete: () => resolve()
            });
          }
        });
      } else {
        // Wax seal cracking and falling away
        const wax = this.scene.add.graphics();
        wax.setDepth(9999);
        wax.fillStyle(0x8b0000, 1);
        wax.fillCircle(cx, cy, Math.max(width, height));
        
        const stamp = this.scene.add.text(cx, cy, '⚔️', {
          fontSize: '48px'
        }).setOrigin(0.5).setDepth(10000);
        
        // Crack effect - pieces falling
        this.scene.tweens.add({
          targets: [wax, stamp],
          alpha: 0,
          y: '+=100',
          duration: duration,
          ease: 'Quad.in',
          onComplete: () => {
            wax.destroy();
            stamp.destroy();
            resolve();
          }
        });
      }
    });
  }

  private slideTransition(direction: 'in' | 'out', duration: number): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      
      const panel = this.scene.add.graphics();
      panel.setDepth(9999);
      panel.fillStyle(0x2a1f1a, 1);
      
      if (direction === 'out') {
        panel.fillRect(width, 0, width, height);
        
        this.scene.tweens.add({
          targets: panel,
          x: -width,
          duration: duration,
          ease: 'Quad.inOut',
          onComplete: () => resolve()
        });
      } else {
        panel.fillRect(0, 0, width, height);
        
        this.scene.tweens.add({
          targets: panel,
          x: width,
          duration: duration,
          ease: 'Quad.inOut',
          onComplete: () => {
            panel.destroy();
            resolve();
          }
        });
      }
    });
  }

  /**
   * Quick flash for impacts
   */
  impactFlash(color: number = 0xffffff, intensity: number = 0.5): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) return;
    
    const { width, height } = this.scene.cameras.main;
    
    const flash = this.scene.add.graphics();
    flash.setDepth(9998);
    flash.fillStyle(color, intensity);
    flash.fillRect(0, 0, width, height);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Vignette pulse effect
   */
  vignettePulse(color: number = 0x8b0000, duration: number = 500): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion || !settings.grainFX) return;
    
    const { width, height } = this.scene.cameras.main;
    
    const vignette = this.scene.add.graphics();
    vignette.setDepth(9997);
    
    // Create radial gradient effect with multiple rings
    for (let i = 0; i < 5; i++) {
      const alpha = 0.3 - i * 0.06;
      const radius = Math.max(width, height) * (0.5 + i * 0.1);
      vignette.fillStyle(color, alpha);
      vignette.fillCircle(width / 2, height / 2, radius);
    }
    
    vignette.setAlpha(0);
    
    this.scene.tweens.add({
      targets: vignette,
      alpha: 1,
      duration: duration / 2,
      yoyo: true,
      onComplete: () => vignette.destroy()
    });
  }
}

/**
 * Static helper for quick transitions
 */
export async function transitionTo(
  currentScene: Phaser.Scene,
  targetScene: string,
  data?: object,
  type: TransitionType = 'fade'
): Promise<void> {
  const transitions = new Transitions(currentScene);
  await transitions.playTransition(type, 'out', 400);
  currentScene.scene.start(targetScene, data);
}
