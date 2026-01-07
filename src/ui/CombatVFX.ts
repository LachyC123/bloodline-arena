/**
 * CombatVFX - Combat visual effects (particles, damage numbers, timing ring)
 * All effects are lightweight and toggleable via settings
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

export class CombatVFX {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show floating damage number
   */
  showDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false): void {
    const settings = SaveSystem.getSettings();
    if (!settings.showDamageNumbers) return;

    const color = isCrit ? '#ff4500' : '#ffffff';
    const fontSize = isCrit ? '24px' : '18px';

    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontFamily: 'Georgia, serif',
      fontSize: fontSize,
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: isCrit ? 'bold' : 'normal'
    }).setOrigin(0.5);

    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      scale: isCrit ? 1.5 : 1.2,
      duration: 800,
      ease: 'Quad.out',
      onComplete: () => text.destroy()
    });

    if (isCrit) {
      // Extra sparkle for crits
      this.createSparks(x, y, 0xffd700, 6);
    }
  }

  /**
   * Show healing number
   */
  showHealNumber(x: number, y: number, amount: number): void {
    const settings = SaveSystem.getSettings();
    if (!settings.showDamageNumbers) return;

    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#32cd32',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Quad.out',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Show status effect popup
   */
  showStatusEffect(x: number, y: number, status: string, isPositive: boolean): void {
    const icon = this.getStatusIcon(status);
    const color = isPositive ? '#6b8e23' : '#cd5c5c';

    const text = this.scene.add.text(x, y - 20, icon, {
      fontSize: '24px'
    }).setOrigin(0.5);

    const label = this.scene.add.text(x, y + 5, status.toUpperCase(), {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Float up and fade
    this.scene.tweens.add({
      targets: [text, label],
      y: '-=40',
      alpha: 0,
      duration: 1000,
      delay: 500,
      onComplete: () => {
        text.destroy();
        label.destroy();
      }
    });
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      bleed: '🩸',
      stun: '💫',
      cripple: '🦵',
      concuss: '🤕',
      fear: '😨',
      disarmed: '🤲',
      inspired: '✨',
      enraged: '😤'
    };
    return icons[status] || '❓';
  }

  /**
   * Create spark particles
   */
  createSparks(x: number, y: number, color: number = 0xffd700, count: number = 8): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) return;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const spark = this.scene.add.graphics();
      spark.fillStyle(color, 1);
      spark.fillCircle(0, 0, 3);
      spark.setPosition(x, y);

      const distance = 30 + Math.random() * 20;
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }

  /**
   * Create impact effect (blood/dust)
   */
  createImpact(x: number, y: number, type: 'blood' | 'dust' | 'spark' = 'dust'): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) return;
    if (type === 'blood' && !settings.bloodFX) return;

    const colors = {
      blood: 0x8b0000,
      dust: 0x8b7355,
      spark: 0xffd700
    };

    const color = colors[type];

    // Central burst
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, type === 'blood' ? 4 : 3);
      particle.setPosition(x, y);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + (type === 'blood' ? 20 : 0),
        alpha: 0,
        scale: type === 'blood' ? 0.5 : 0,
        duration: 400,
        ease: 'Quad.out',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Screen shake effect
   */
  screenShake(intensity: number = 0.01, duration: number = 200): void {
    const settings = SaveSystem.getSettings();
    if (!settings.screenShake) return;

    this.scene.cameras.main.shake(duration, intensity);
  }

  /**
   * Flash effect (for hits)
   */
  flashScreen(color: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 }, duration: number = 100): void {
    this.scene.cameras.main.flash(duration, color.r, color.g, color.b);
  }

  /**
   * Create timing ring for parry (mobile-friendly)
   */
  createTimingRing(
    x: number,
    y: number,
    duration: number = 800,
    onPerfectTiming: () => void,
    onMiss: () => void
  ): Phaser.GameObjects.Container {
    const settings = SaveSystem.getSettings();
    if (!settings.showTimingRing) {
      // Auto-miss if ring disabled
      this.scene.time.delayedCall(duration, onMiss);
      return this.scene.add.container(x, y);
    }

    const container = this.scene.add.container(x, y);

    // Outer ring (shrinking)
    const outerRing = this.scene.add.graphics();
    outerRing.lineStyle(4, 0xc9a959, 1);
    outerRing.strokeCircle(0, 0, 60);
    container.add(outerRing);

    // Target ring (static)
    const targetRing = this.scene.add.graphics();
    targetRing.lineStyle(3, 0x6b8e23, 1);
    targetRing.strokeCircle(0, 0, 25);
    container.add(targetRing);

    // Perfect zone indicator
    const perfectText = this.scene.add.text(0, -80, 'TAP!', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    container.add(perfectText);

    // Pulse the perfect text
    this.scene.tweens.add({
      targets: perfectText,
      scale: { from: 1, to: 1.2 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    // Shrink the outer ring
    let currentRadius = 60;
    const shrinkRate = 35 / (duration / 1000); // pixels per second

    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        currentRadius -= shrinkRate * 0.016;

        outerRing.clear();
        outerRing.lineStyle(4, 0xc9a959, 1);
        outerRing.strokeCircle(0, 0, Math.max(0, currentRadius));

        // Check if missed (ring too small)
        if (currentRadius <= 15) {
          updateEvent.destroy();
          this.scene.tweens.add({
            targets: container,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              container.destroy();
              onMiss();
            }
          });
        }
      },
      loop: true
    });

    // Make tappable
    const hitArea = this.scene.add.circle(0, 0, 80, 0x000000, 0);
    hitArea.setInteractive();
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      updateEvent.destroy();

      // Check timing
      const perfectZone = currentRadius >= 20 && currentRadius <= 35;

      if (perfectZone) {
        // Perfect parry!
        targetRing.clear();
        targetRing.lineStyle(5, 0x32cd32, 1);
        targetRing.strokeCircle(0, 0, 25);

        perfectText.setText('PERFECT!');
        perfectText.setColor('#32cd32');

        this.createSparks(x, y, 0x32cd32, 12);

        this.scene.tweens.add({
          targets: container,
          scale: 1.5,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            container.destroy();
            onPerfectTiming();
          }
        });
      } else {
        // Normal block
        targetRing.clear();
        targetRing.lineStyle(3, 0xdaa520, 1);
        targetRing.strokeCircle(0, 0, 25);

        perfectText.setText('BLOCKED');
        perfectText.setColor('#daa520');

        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            container.destroy();
            onMiss();
          }
        });
      }
    });

    return container;
  }

  /**
   * Fighter attack animation
   */
  animateAttack(
    fighter: Phaser.GameObjects.Container,
    direction: 'left' | 'right',
    onHit: () => void
  ): void {
    const settings = SaveSystem.getSettings();
    const moveDistance = settings.reduceMotion ? 10 : 30;
    const duration = settings.reduceMotion ? 100 : 200;

    const originalX = fighter.x;

    // Lunge forward
    this.scene.tweens.add({
      targets: fighter,
      x: direction === 'right' ? originalX + moveDistance : originalX - moveDistance,
      duration: duration,
      ease: 'Quad.out',
      onComplete: () => {
        onHit();

        // Return
        this.scene.tweens.add({
          targets: fighter,
          x: originalX,
          duration: duration,
          ease: 'Quad.in'
        });
      }
    });
  }

  /**
   * Fighter hit reaction
   */
  animateHitReaction(fighter: Phaser.GameObjects.Container): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) return;

    // Stagger back
    this.scene.tweens.add({
      targets: fighter,
      x: fighter.x - 10,
      duration: 50,
      yoyo: true,
      repeat: 1
    });

    // Flash red
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xff0000, 0.3);
    flash.fillRect(
      fighter.x - 50,
      fighter.y - 50,
      100,
      100
    );

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Fighter block animation
   */
  animateBlock(fighter: Phaser.GameObjects.Container): void {
    // Brief scale pulse
    this.scene.tweens.add({
      targets: fighter,
      scaleX: 0.9,
      scaleY: 1.1,
      duration: 100,
      yoyo: true
    });

    // Shield icon
    const shield = this.scene.add.text(fighter.x, fighter.y - 30, '🛡️', {
      fontSize: '24px'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: shield,
      y: fighter.y - 60,
      alpha: 0,
      duration: 500,
      onComplete: () => shield.destroy()
    });
  }

  /**
   * Fighter dodge animation
   */
  animateDodge(fighter: Phaser.GameObjects.Container, direction: 'left' | 'right'): void {
    const settings = SaveSystem.getSettings();
    const moveDistance = settings.reduceMotion ? 20 : 50;

    const originalX = fighter.x;

    this.scene.tweens.add({
      targets: fighter,
      x: direction === 'left' ? originalX - moveDistance : originalX + moveDistance,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      ease: 'Quad.out'
    });

    // After-image effect
    if (!settings.reduceMotion) {
      const afterImage = this.scene.add.graphics();
      afterImage.fillStyle(0xffffff, 0.3);
      afterImage.fillCircle(fighter.x, fighter.y, 30);

      this.scene.tweens.add({
        targets: afterImage,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => afterImage.destroy()
      });
    }
  }

  /**
   * Victory celebration effect
   */
  playVictoryEffect(x: number, y: number): void {
    const settings = SaveSystem.getSettings();

    // Gold coin burst
    for (let i = 0; i < 15; i++) {
      const coin = this.scene.add.text(x, y, '🪙', {
        fontSize: '20px'
      }).setOrigin(0.5);

      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;

      this.scene.tweens.add({
        targets: coin,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 50,
        rotation: Math.random() * 4,
        duration: 800,
        delay: i * 50,
        ease: 'Quad.out',
        onComplete: () => {
          this.scene.tweens.add({
            targets: coin,
            y: coin.y + 100,
            alpha: 0,
            duration: 400,
            onComplete: () => coin.destroy()
          });
        }
      });
    }

    // Victory banner
    const banner = this.scene.add.text(x, y - 100, '⚔️ VICTORY ⚔️', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    banner.setScale(0);
    this.scene.tweens.add({
      targets: banner,
      scale: 1,
      duration: 500,
      ease: 'Back.out'
    });

    if (!settings.reduceMotion) {
      this.createSparks(x, y - 100, 0xffd700, 20);
    }
  }

  /**
   * Defeat effect
   */
  playDefeatEffect(x: number, y: number): void {
    // Grayscale tint on camera
    // Note: Phaser 3 doesn't have built-in grayscale, so we fade to dark
    this.scene.cameras.main.fade(2000, 20, 10, 10);

    // Defeat text
    const text = this.scene.add.text(x, y - 80, 'DEFEATED', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#8b0000',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    text.setAlpha(0);
    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      duration: 1000
    });
  }

  /**
   * Weapon trail effect
   */
  createWeaponTrail(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: number = 0xc9a959
  ): void {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) return;

    const trail = this.scene.add.graphics();
    trail.lineStyle(3, color, 0.8);
    
    // Simple arc using lineTo points
    const steps = 8;
    const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 40;
    const controlY = Math.min(startY, endY) - 20;
    
    trail.beginPath();
    trail.moveTo(startX, startY);
    
    // Approximate bezier with line segments
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
      const y = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
      trail.lineTo(x, y);
    }
    trail.strokePath();

    // Fade out
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }
}
