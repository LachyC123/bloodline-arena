/**
 * CombatAnimator - Handles turn-based combat animations
 * Creates visible fighter sprites that move, attack, block, and react
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';

export type FighterPose = 
  | 'idle' 
  | 'attack_light' 
  | 'attack_heavy' 
  | 'block' 
  | 'dodge' 
  | 'hit' 
  | 'stagger'
  | 'victory' 
  | 'defeat';

export interface FighterSpriteConfig {
  fighter: Fighter;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;  // true for right-side fighter
}

/**
 * Animated fighter sprite using cutout animation
 * Body parts (torso, arms, legs, weapon) animate via rotations and tweens
 */
export class AnimatedFighter extends Phaser.GameObjects.Container {
  private config: FighterSpriteConfig;
  private currentPose: FighterPose = 'idle';
  
  // Body parts
  private torso!: Phaser.GameObjects.Graphics;
  private head!: Phaser.GameObjects.Graphics;
  private armFront!: Phaser.GameObjects.Graphics;
  private armBack!: Phaser.GameObjects.Graphics;
  private legFront!: Phaser.GameObjects.Graphics;
  private legBack!: Phaser.GameObjects.Graphics;
  private weapon!: Phaser.GameObjects.Graphics;
  private shield?: Phaser.GameObjects.Graphics;
  
  // Animation state
  private idleTween?: Phaser.Tweens.Tween;
  private baseY: number;
  
  // Colors based on fighter
  private skinColor: number;
  private armorColor: number;
  private weaponColor: number = 0x808080;
  
  constructor(scene: Phaser.Scene, config: FighterSpriteConfig) {
    super(scene, config.x, config.y);
    this.config = config;
    this.baseY = config.y;
    
    // Parse skin tone
    const skinTone = config.fighter.portrait.skinTone;
    this.skinColor = Phaser.Display.Color.HexStringToColor(skinTone).color;
    
    // Random armor color based on league/equipment
    const armorColors = [0x4a3a2a, 0x5a4a3a, 0x3a3a4a, 0x8b4513, 0x2f4f4f];
    this.armorColor = armorColors[Math.floor(Math.random() * armorColors.length)];
    
    this.createBodyParts();
    this.setScale(config.scale);
    if (config.flipX) {
      this.setScale(-config.scale, config.scale);
    }
    
    scene.add.existing(this);
    this.startIdleAnimation();
  }
  
  private createBodyParts(): void {
    // Scale factors for body proportions
    const s = 1;
    
    // Back leg (behind torso)
    this.legBack = this.scene.add.graphics();
    this.legBack.fillStyle(this.armorColor, 1);
    this.legBack.fillRoundedRect(-8 * s, 0, 16 * s, 45 * s, 4);
    this.legBack.setPosition(-10 * s, 30 * s);
    this.add(this.legBack);
    
    // Back arm
    this.armBack = this.scene.add.graphics();
    this.armBack.fillStyle(this.skinColor, 1);
    this.armBack.fillRoundedRect(-6 * s, 0, 12 * s, 35 * s, 3);
    this.armBack.setPosition(-18 * s, -20 * s);
    this.add(this.armBack);
    
    // Torso
    this.torso = this.scene.add.graphics();
    this.torso.fillStyle(this.armorColor, 1);
    // Main body
    this.torso.fillRoundedRect(-20 * s, -30 * s, 40 * s, 60 * s, 6);
    // Chest plate detail
    this.torso.lineStyle(2, 0x3a2a1a, 0.5);
    this.torso.strokeRoundedRect(-18 * s, -28 * s, 36 * s, 30 * s, 4);
    // Belt
    this.torso.fillStyle(0x3a2a1a, 1);
    this.torso.fillRect(-22 * s, 20 * s, 44 * s, 8 * s);
    this.add(this.torso);
    
    // Front leg
    this.legFront = this.scene.add.graphics();
    this.legFront.fillStyle(this.armorColor, 1);
    this.legFront.fillRoundedRect(-8 * s, 0, 16 * s, 45 * s, 4);
    // Knee guard
    this.legFront.fillStyle(0x5a4a3a, 1);
    this.legFront.fillEllipse(0, 15 * s, 10 * s, 8 * s);
    this.legFront.setPosition(10 * s, 30 * s);
    this.add(this.legFront);
    
    // Head
    this.head = this.scene.add.graphics();
    // Neck
    this.head.fillStyle(this.skinColor, 1);
    this.head.fillRect(-8 * s, 15 * s, 16 * s, 15 * s);
    // Head shape
    this.head.fillStyle(this.skinColor, 1);
    this.head.fillEllipse(0, 0, 28 * s, 32 * s);
    // Eyes
    this.head.fillStyle(0xffffff, 1);
    this.head.fillEllipse(-7 * s, -3 * s, 6 * s, 4 * s);
    this.head.fillEllipse(7 * s, -3 * s, 6 * s, 4 * s);
    this.head.fillStyle(0x2a1a10, 1);
    this.head.fillCircle(-6 * s, -3 * s, 2 * s);
    this.head.fillCircle(8 * s, -3 * s, 2 * s);
    // Nose
    this.head.lineStyle(1, 0x8b5a3c, 0.5);
    this.head.lineBetween(0, -2 * s, 0, 5 * s);
    // Mouth
    this.head.lineStyle(2, 0x5a3a2a, 0.8);
    this.head.lineBetween(-5 * s, 10 * s, 5 * s, 10 * s);
    this.head.setPosition(0, -55 * s);
    this.add(this.head);
    
    // Weapon (sword)
    this.weapon = this.scene.add.graphics();
    // Handle
    this.weapon.fillStyle(0x3a2a1a, 1);
    this.weapon.fillRect(-3, 0, 6, 15);
    // Guard
    this.weapon.fillStyle(this.weaponColor, 1);
    this.weapon.fillRect(-10, -3, 20, 6);
    // Blade
    this.weapon.fillStyle(0xc0c0c0, 1);
    this.weapon.beginPath();
    this.weapon.moveTo(-4, -3);
    this.weapon.lineTo(4, -3);
    this.weapon.lineTo(2, -55);
    this.weapon.lineTo(0, -60);
    this.weapon.lineTo(-2, -55);
    this.weapon.closePath();
    this.weapon.fillPath();
    // Blade edge highlight
    this.weapon.lineStyle(1, 0xffffff, 0.5);
    this.weapon.lineBetween(0, -5, 0, -55);
    this.weapon.setPosition(25 * s, -15 * s);
    this.weapon.setRotation(-0.3);
    this.add(this.weapon);
    
    // Front arm (holding weapon)
    this.armFront = this.scene.add.graphics();
    this.armFront.fillStyle(this.skinColor, 1);
    this.armFront.fillRoundedRect(-6 * s, 0, 12 * s, 35 * s, 3);
    // Bracer
    this.armFront.fillStyle(0x4a3a2a, 1);
    this.armFront.fillRect(-7 * s, 20 * s, 14 * s, 12 * s);
    this.armFront.setPosition(18 * s, -20 * s);
    this.add(this.armFront);
    
    // Add shadow beneath
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 80 * s, 50 * s, 15 * s);
    this.add(shadow);
    this.sendToBack(shadow);
  }
  
  /**
   * Start idle breathing animation
   */
  startIdleAnimation(): void {
    this.stopCurrentAnimation();
    this.currentPose = 'idle';
    
    // Subtle breathing
    this.idleTween = this.scene.tweens.add({
      targets: this,
      y: this.baseY - 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Arm sway
    this.scene.tweens.add({
      targets: this.armFront,
      rotation: -0.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Weapon ready position
    this.scene.tweens.add({
      targets: this.weapon,
      rotation: -0.35,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Stop current animation
   */
  stopCurrentAnimation(): void {
    this.idleTween?.stop();
    this.scene.tweens.killTweensOf(this.armFront);
    this.scene.tweens.killTweensOf(this.weapon);
    this.scene.tweens.killTweensOf(this.head);
    this.scene.tweens.killTweensOf(this);
  }
  
  /**
   * Play light attack animation
   */
  async playLightAttack(onHit: () => void): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'attack_light';
    
    const direction = this.config.flipX ? -1 : 1;
    const startX = this.x;
    
    return new Promise(resolve => {
      // Step forward
      this.scene.tweens.add({
        targets: this,
        x: startX + 40 * direction,
        duration: 150,
        ease: 'Quad.out',
        onComplete: () => {
          // Quick slash
          this.scene.tweens.add({
            targets: this.weapon,
            rotation: 1.5 * direction,
            duration: 100,
            ease: 'Quad.out',
            onComplete: () => {
              onHit();
              
              // Return weapon
              this.scene.tweens.add({
                targets: this.weapon,
                rotation: -0.3,
                duration: 200,
                ease: 'Quad.out'
              });
              
              // Step back
              this.scene.tweens.add({
                targets: this,
                x: startX,
                duration: 200,
                ease: 'Quad.in',
                onComplete: () => {
                  this.startIdleAnimation();
                  resolve();
                }
              });
            }
          });
        }
      });
      
      // Arm follows weapon
      this.scene.tweens.add({
        targets: this.armFront,
        rotation: 0.8,
        duration: 250,
        yoyo: true,
        ease: 'Quad.inOut'
      });
    });
  }
  
  /**
   * Play heavy attack animation
   */
  async playHeavyAttack(onHit: () => void): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'attack_heavy';
    
    const direction = this.config.flipX ? -1 : 1;
    const startX = this.x;
    
    return new Promise(resolve => {
      // Wind up
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: -2,
        duration: 300,
        ease: 'Quad.out',
        onComplete: () => {
          // Step forward
          this.scene.tweens.add({
            targets: this,
            x: startX + 60 * direction,
            duration: 150,
            ease: 'Quad.out'
          });
          
          // Powerful swing
          this.scene.tweens.add({
            targets: this.weapon,
            rotation: 2.5 * direction,
            duration: 150,
            ease: 'Quad.in',
            onComplete: () => {
              // Screen shake if enabled
              const settings = SaveSystem.getSettings();
              if (settings.screenShake) {
                this.scene.cameras.main.shake(100, 0.01);
              }
              
              onHit();
              
              // Recovery
              this.scene.tweens.add({
                targets: this.weapon,
                rotation: -0.3,
                duration: 400,
                ease: 'Quad.out'
              });
              
              this.scene.tweens.add({
                targets: this,
                x: startX,
                duration: 350,
                ease: 'Quad.in',
                onComplete: () => {
                  this.startIdleAnimation();
                  resolve();
                }
              });
            }
          });
        }
      });
      
      // Body leans into swing
      this.scene.tweens.add({
        targets: this.torso,
        rotation: 0.2 * direction,
        duration: 500,
        yoyo: true,
        ease: 'Quad.inOut'
      });
    });
  }
  
  /**
   * Play block/guard animation
   */
  async playBlock(): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'block';
    
    return new Promise(resolve => {
      // Raise weapon defensively
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: -1.5,
        y: this.weapon.y - 20,
        duration: 150,
        ease: 'Quad.out'
      });
      
      // Crouch slightly
      this.scene.tweens.add({
        targets: this,
        y: this.baseY + 10,
        duration: 150,
        ease: 'Quad.out',
        onComplete: () => {
          // Hold block
          this.scene.time.delayedCall(500, () => {
            // Return to idle
            this.scene.tweens.add({
              targets: this.weapon,
              rotation: -0.3,
              y: this.weapon.y + 20,
              duration: 200,
              ease: 'Quad.out'
            });
            
            this.scene.tweens.add({
              targets: this,
              y: this.baseY,
              duration: 200,
              ease: 'Quad.out',
              onComplete: () => {
                this.startIdleAnimation();
                resolve();
              }
            });
          });
        }
      });
    });
  }
  
  /**
   * Play dodge animation
   */
  async playDodge(): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'dodge';
    
    const direction = this.config.flipX ? 1 : -1;  // Dodge away
    const startX = this.x;
    
    return new Promise(resolve => {
      // Quick sidestep
      this.scene.tweens.add({
        targets: this,
        x: startX + 50 * direction,
        y: this.baseY - 15,
        duration: 150,
        ease: 'Quad.out',
        onComplete: () => {
          // Return
          this.scene.tweens.add({
            targets: this,
            x: startX,
            y: this.baseY,
            duration: 200,
            ease: 'Quad.in',
            onComplete: () => {
              this.startIdleAnimation();
              resolve();
            }
          });
        }
      });
      
      // Lean into dodge
      this.scene.tweens.add({
        targets: this.torso,
        rotation: 0.3 * direction,
        duration: 200,
        yoyo: true,
        ease: 'Quad.out'
      });
    });
  }
  
  /**
   * Play hit reaction animation
   */
  async playHit(damage: number): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'hit';
    
    const direction = this.config.flipX ? 1 : -1;
    const startX = this.x;
    const intensity = Math.min(damage / 30, 1);  // Scale by damage
    
    return new Promise(resolve => {
      // Knockback
      this.scene.tweens.add({
        targets: this,
        x: startX + 25 * direction * intensity,
        duration: 100,
        ease: 'Quad.out',
        onComplete: () => {
          // Recovery
          this.scene.tweens.add({
            targets: this,
            x: startX,
            duration: 300,
            ease: 'Quad.out',
            onComplete: () => {
              this.startIdleAnimation();
              resolve();
            }
          });
        }
      });
      
      // Head snaps back
      this.scene.tweens.add({
        targets: this.head,
        rotation: 0.2 * direction,
        duration: 100,
        yoyo: true,
        ease: 'Quad.out'
      });
      
      // Flash red
      this.scene.tweens.add({
        targets: this.torso,
        alpha: 0.5,
        duration: 50,
        yoyo: true,
        repeat: 2
      });
    });
  }
  
  /**
   * Play stagger animation (heavy hit)
   */
  async playStagger(): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'stagger';
    
    const direction = this.config.flipX ? 1 : -1;
    const startX = this.x;
    
    return new Promise(resolve => {
      // Big knockback
      this.scene.tweens.add({
        targets: this,
        x: startX + 50 * direction,
        y: this.baseY + 20,
        duration: 200,
        ease: 'Quad.out'
      });
      
      // Stumble
      this.scene.tweens.add({
        targets: this.torso,
        rotation: 0.4 * direction,
        duration: 200,
        ease: 'Quad.out',
        onComplete: () => {
          // Recover
          this.scene.tweens.add({
            targets: this,
            x: startX,
            y: this.baseY,
            duration: 500,
            ease: 'Quad.out'
          });
          
          this.scene.tweens.add({
            targets: this.torso,
            rotation: 0,
            duration: 500,
            ease: 'Quad.out',
            onComplete: () => {
              this.startIdleAnimation();
              resolve();
            }
          });
        }
      });
      
      // Drop weapon angle
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: 1,
        duration: 300,
        yoyo: true,
        ease: 'Quad.out'
      });
    });
  }
  
  /**
   * Play victory animation
   */
  async playVictory(): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'victory';
    
    return new Promise(resolve => {
      // Raise weapon triumphantly
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: -2,
        y: this.weapon.y - 30,
        duration: 500,
        ease: 'Back.out'
      });
      
      // Stand tall
      this.scene.tweens.add({
        targets: this,
        y: this.baseY - 15,
        duration: 500,
        ease: 'Back.out',
        onComplete: () => resolve()
      });
      
      // Arm raised
      this.scene.tweens.add({
        targets: this.armFront,
        rotation: -1.2,
        duration: 500,
        ease: 'Back.out'
      });
    });
  }
  
  /**
   * Play defeat animation
   */
  async playDefeat(): Promise<void> {
    this.stopCurrentAnimation();
    this.currentPose = 'defeat';
    
    return new Promise(resolve => {
      // Collapse
      this.scene.tweens.add({
        targets: this,
        y: this.baseY + 60,
        duration: 800,
        ease: 'Bounce.out'
      });
      
      // Fall over
      this.scene.tweens.add({
        targets: this.torso,
        rotation: 1.2,
        duration: 600,
        ease: 'Quad.out'
      });
      
      // Head slumps
      this.scene.tweens.add({
        targets: this.head,
        rotation: 0.8,
        y: this.head.y + 30,
        duration: 700,
        ease: 'Quad.out'
      });
      
      // Drop weapon
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: 2,
        x: this.weapon.x + 40,
        y: this.weapon.y + 80,
        duration: 500,
        ease: 'Quad.out',
        onComplete: () => resolve()
      });
    });
  }
  
  /**
   * Set guarding stance
   */
  setGuardStance(guarding: boolean): void {
    if (guarding) {
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: -1.2,
        duration: 200,
        ease: 'Quad.out'
      });
    } else {
      this.scene.tweens.add({
        targets: this.weapon,
        rotation: -0.3,
        duration: 200,
        ease: 'Quad.out'
      });
    }
  }
  
  /**
   * Get current pose
   */
  getPose(): FighterPose {
    return this.currentPose;
  }
}

/**
 * Combat VFX Manager for impacts and effects
 */
export class CombatVFXManager {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Show damage number floating up
   */
  showDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false): void {
    const settings = SaveSystem.getSettings();
    if (!settings.showDamageNumbers) return;
    
    const color = isCrit ? '#ff4444' : '#ffffff';
    const fontSize = isCrit ? '28px' : '22px';
    
    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontFamily: 'Georgia, serif',
      fontSize,
      color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    if (isCrit) {
      // Crit sparkle
      this.createSparkle(x, y, 0xffff00);
    }
    
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.out',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Show heal number
   */
  showHealNumber(x: number, y: number, amount: number): void {
    const settings = SaveSystem.getSettings();
    if (!settings.showDamageNumbers) return;
    
    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Quad.out',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Create impact sparks
   */
  createSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const spark = this.scene.add.graphics();
      spark.fillStyle(0xffcc00, 1);
      spark.fillCircle(0, 0, 3);
      spark.setPosition(x, y);
      spark.setDepth(90);
      
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const distance = 30 + Math.random() * 30;
      
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 300,
        ease: 'Quad.out',
        onComplete: () => spark.destroy()
      });
    }
  }
  
  /**
   * Create blood spatter (if enabled)
   */
  createBlood(x: number, y: number): void {
    const settings = SaveSystem.getSettings();
    if (!settings.bloodFX) return;
    
    for (let i = 0; i < 5; i++) {
      const blood = this.scene.add.graphics();
      blood.fillStyle(0x8b0000, 1);
      blood.fillCircle(0, 0, 2 + Math.random() * 3);
      blood.setPosition(x, y);
      blood.setDepth(85);
      
      const angle = Math.random() * Math.PI - Math.PI / 2;
      const distance = 20 + Math.random() * 40;
      
      this.scene.tweens.add({
        targets: blood,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 30,
        alpha: 0.3,
        duration: 500,
        ease: 'Quad.out',
        onComplete: () => blood.destroy()
      });
    }
  }
  
  /**
   * Create sparkle effect
   */
  createSparkle(x: number, y: number, color: number = 0xffffff): void {
    for (let i = 0; i < 6; i++) {
      const sparkle = this.scene.add.graphics();
      sparkle.fillStyle(color, 1);
      // Draw a simple 4-point star shape
      sparkle.beginPath();
      sparkle.moveTo(0, -6);
      sparkle.lineTo(2, -2);
      sparkle.lineTo(6, 0);
      sparkle.lineTo(2, 2);
      sparkle.lineTo(0, 6);
      sparkle.lineTo(-2, 2);
      sparkle.lineTo(-6, 0);
      sparkle.lineTo(-2, -2);
      sparkle.closePath();
      sparkle.fillPath();
      sparkle.setPosition(x, y);
      sparkle.setDepth(95);
      
      const angle = (Math.PI * 2 / 6) * i;
      const distance = 25 + Math.random() * 15;
      
      this.scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        rotation: Math.PI,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.out',
        onComplete: () => sparkle.destroy()
      });
    }
  }
  
  /**
   * Show status effect icon
   */
  showStatusEffect(x: number, y: number, effect: string): void {
    const icons: Record<string, string> = {
      bleed: '🩸',
      stun: '💫',
      block: '🛡️',
      dodge: '💨',
      crit: '⚡',
      miss: '❌'
    };
    
    const icon = icons[effect] || '❓';
    const text = this.scene.add.text(x, y - 30, icon, {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(100);
    
    this.scene.tweens.add({
      targets: text,
      y: y - 70,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.out',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Screen flash effect
   */
  screenFlash(color: number = 0xffffff, alpha: number = 0.3): void {
    const { width, height } = this.scene.cameras.main;
    const flash = this.scene.add.rectangle(
      width / 2, height / 2, width, height, color, alpha
    ).setDepth(200);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }
  
  /**
   * Weapon trail effect
   */
  createWeaponTrail(startX: number, startY: number, endX: number, endY: number): void {
    const trail = this.scene.add.graphics();
    trail.lineStyle(4, 0xffffff, 0.6);
    
    // Draw arc
    trail.beginPath();
    trail.moveTo(startX, startY);
    
    const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 30;
    const midY = (startY + endY) / 2 - 20;
    
    // Simple curve approximation
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const t2 = t * t;
      const t1 = 1 - t;
      const t12 = t1 * t1;
      
      const x = t12 * startX + 2 * t1 * t * midX + t2 * endX;
      const y = t12 * startY + 2 * t1 * t * midY + t2 * endY;
      trail.lineTo(x, y);
    }
    trail.strokePath();
    trail.setDepth(80);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }
  
  /**
   * Show status effect with text label
   */
  showStatusPopup(x: number, y: number, text: string, color: string = '#ff4444'): void {
    const container = this.scene.add.container(x, y - 40);
    container.setDepth(150);
    
    // Background pill
    const bg = this.scene.add.graphics();
    const textWidth = text.length * 8 + 20;
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-textWidth / 2, -12, textWidth, 24, 12);
    container.add(bg);
    
    // Text
    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color,
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    container.add(label);
    
    // Animate
    container.setScale(0);
    this.scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
    
    this.scene.tweens.add({
      targets: container,
      y: y - 80,
      alpha: 0,
      duration: 1200,
      delay: 400,
      ease: 'Quad.out',
      onComplete: () => container.destroy()
    });
  }
  
  /**
   * Impact dust effect
   */
  createDust(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const dust = this.scene.add.graphics();
      dust.fillStyle(0x8b7355, 0.6);
      dust.fillCircle(0, 0, 4 + Math.random() * 4);
      dust.setPosition(x, y);
      dust.setDepth(70);
      
      const angle = Math.PI + (Math.random() - 0.5) * 1.2;
      const distance = 20 + Math.random() * 30;
      
      this.scene.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 10,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Quad.out',
        onComplete: () => dust.destroy()
      });
    }
  }
  
  /**
   * Show combo counter
   */
  showCombo(x: number, y: number, combo: number): void {
    if (combo < 2) return;
    
    const text = this.scene.add.text(x, y, `${combo}x COMBO!`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(110);
    
    text.setScale(0);
    this.scene.tweens.add({
      targets: text,
      scale: 1.2,
      duration: 150,
      yoyo: true,
      hold: 300,
      onComplete: () => {
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          y: y - 30,
          duration: 300,
          onComplete: () => text.destroy()
        });
      }
    });
  }
  
  /**
   * Camera shake
   */
  shakeCamera(intensity: number = 0.005, duration: number = 100): void {
    const settings = SaveSystem.getSettings();
    if (!settings.screenShake) return;
    
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  /**
   * Hit stop effect (brief pause)
   */
  hitStop(duration: number = 60): Promise<void> {
    const settings = SaveSystem.getSettings();
    if (settings.reduceMotion) {
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      this.scene.time.delayedCall(duration, resolve);
    });
  }
}
