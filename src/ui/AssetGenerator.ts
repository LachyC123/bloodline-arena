/**
 * AssetGenerator - Procedurally generates game assets
 * Creates textures at runtime so no external files are needed
 */

import Phaser from 'phaser';

export class AssetGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Generate all UI assets
   */
  generateUIAssets(): void {
    this.generateParchmentOverlay();
    this.generateVignette();
    this.generateParticle();
  }

  /**
   * Generate portrait-related assets
   */
  generatePortraitAssets(): void {
    // Portraits are rendered procedurally, no textures needed
  }

  /**
   * Generate arena backgrounds and overlays
   */
  generateArenaAssets(): void {
    this.generateArenaOverlay();
    this.generateCrowdSilhouette();
  }

  /**
   * Generate VFX textures
   */
  generateEffectAssets(): void {
    this.generateSpark();
    this.generateBloodDrop();
    this.generateDustPuff();
  }

  /**
   * Generate icon assets
   */
  generateIconAssets(): void {
    // Icons are rendered using emoji/text, no textures needed
  }

  private generateParchmentOverlay(): void {
    const size = 512;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Base parchment color with noise
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const noise = Math.random() * 0.1;
        const baseColor = Phaser.Display.Color.GetColor(
          Math.floor(180 + noise * 30),
          Math.floor(160 + noise * 30),
          Math.floor(120 + noise * 30)
        );
        graphics.fillStyle(baseColor, 0.02 + Math.random() * 0.03);
        graphics.fillRect(x, y, 4, 4);
      }
    }
    
    // Add some larger stains
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 20 + Math.random() * 40;
      graphics.fillStyle(0x8b7355, 0.02);
      graphics.fillCircle(x, y, radius);
    }
    
    graphics.generateTexture('parchment_overlay', size, size);
    graphics.destroy();
  }

  private generateVignette(): void {
    const size = 512;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Create radial gradient vignette
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.7;
    
    for (let r = maxRadius; r > 0; r -= 2) {
      const alpha = Math.pow(1 - r / maxRadius, 2) * 0.8;
      graphics.fillStyle(0x000000, alpha * 0.1);
      graphics.fillCircle(centerX, centerY, r);
    }
    
    // Stronger edges
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(0, 0, size, 30);
    graphics.fillRect(0, size - 30, size, 30);
    graphics.fillRect(0, 0, 30, size);
    graphics.fillRect(size - 30, 0, 30, size);
    
    graphics.generateTexture('vignette', size, size);
    graphics.destroy();
  }

  private generateParticle(): void {
    const size = 16;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Simple circular particle with gradient
    for (let r = size / 2; r > 0; r--) {
      const alpha = r / (size / 2);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(size / 2, size / 2, r);
    }
    
    graphics.generateTexture('particle', size, size);
    graphics.destroy();
  }

  private generateArenaOverlay(): void {
    const width = 512;
    const height = 512;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Dark atmospheric overlay
    graphics.fillGradientStyle(0x000000, 0x000000, 0x1a1410, 0x1a1410, 0.3);
    graphics.fillRect(0, 0, width, height);
    
    // Add some horizontal bands for depth
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i;
      graphics.fillStyle(0x000000, 0.05 + i * 0.02);
      graphics.fillRect(0, y, width, height / 10);
    }
    
    // Torch glow spots
    graphics.fillStyle(0xffa500, 0.03);
    graphics.fillCircle(50, 100, 80);
    graphics.fillCircle(width - 50, 100, 80);
    
    graphics.generateTexture('arena_overlay', width, height);
    graphics.destroy();
  }

  private generateCrowdSilhouette(): void {
    const width = 256;
    const height = 64;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Row of simple head silhouettes
    graphics.fillStyle(0x1a1410, 1);
    
    for (let x = 0; x < width; x += 20) {
      const headSize = 8 + Math.random() * 6;
      const headY = height - 20 + Math.random() * 10;
      
      // Head
      graphics.fillCircle(x + 10, headY, headSize);
      
      // Shoulders
      graphics.fillRect(x + 2, headY + headSize - 2, 16, 20);
    }
    
    graphics.generateTexture('crowd_silhouette', width, height);
    graphics.destroy();
  }

  private generateSpark(): void {
    const size = 8;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Bright yellow-orange spark
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(size / 2, size / 2, size / 4);
    graphics.fillStyle(0xffa500, 0.5);
    graphics.fillCircle(size / 2, size / 2, size / 2);
    
    graphics.generateTexture('spark', size, size);
    graphics.destroy();
  }

  private generateBloodDrop(): void {
    const size = 12;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Blood drop shape
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillCircle(size / 2, size / 2 + 2, size / 3);
    graphics.fillTriangle(
      size / 2, 0,
      size / 2 - size / 4, size / 2,
      size / 2 + size / 4, size / 2
    );
    
    graphics.generateTexture('blood_drop', size, size);
    graphics.destroy();
  }

  private generateDustPuff(): void {
    const size = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Multiple overlapping circles for dust effect
    for (let i = 0; i < 5; i++) {
      const x = size / 2 + (Math.random() - 0.5) * size * 0.4;
      const y = size / 2 + (Math.random() - 0.5) * size * 0.4;
      const radius = 4 + Math.random() * 6;
      graphics.fillStyle(0x8b7355, 0.2);
      graphics.fillCircle(x, y, radius);
    }
    
    graphics.generateTexture('dust_puff', size, size);
    graphics.destroy();
  }

  /**
   * Generate a simple icon texture
   */
  static generateIcon(
    scene: Phaser.Scene,
    name: string,
    drawFn: (graphics: Phaser.GameObjects.Graphics, size: number) => void,
    size: number = 32
  ): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    drawFn(graphics, size);
    graphics.generateTexture(name, size, size);
    graphics.destroy();
  }
}

/**
 * Icon drawing functions for common game icons
 */
export const IconDrawers = {
  sword: (graphics: Phaser.GameObjects.Graphics, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    
    // Blade
    graphics.fillStyle(0xc0c0c0, 1);
    graphics.fillRect(cx - 2, cy - size * 0.35, 4, size * 0.5);
    
    // Point
    graphics.fillTriangle(
      cx, cy - size * 0.4,
      cx - 3, cy - size * 0.35,
      cx + 3, cy - size * 0.35
    );
    
    // Guard
    graphics.fillStyle(0x8b7355, 1);
    graphics.fillRect(cx - size * 0.2, cy + size * 0.1, size * 0.4, 4);
    
    // Handle
    graphics.fillStyle(0x5a3a1a, 1);
    graphics.fillRect(cx - 2, cy + size * 0.15, 4, size * 0.2);
  },

  shield: (graphics: Phaser.GameObjects.Graphics, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    
    // Shield shape
    graphics.fillStyle(0x5a4a3a, 1);
    graphics.beginPath();
    graphics.moveTo(cx, cy - size * 0.35);
    graphics.lineTo(cx + size * 0.3, cy - size * 0.15);
    graphics.lineTo(cx + size * 0.25, cy + size * 0.25);
    graphics.lineTo(cx, cy + size * 0.35);
    graphics.lineTo(cx - size * 0.25, cy + size * 0.25);
    graphics.lineTo(cx - size * 0.3, cy - size * 0.15);
    graphics.closePath();
    graphics.fillPath();
    
    // Emblem
    graphics.fillStyle(0xc9a959, 1);
    graphics.fillCircle(cx, cy, size * 0.12);
  },

  coin: (graphics: Phaser.GameObjects.Graphics, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.35;
    
    // Coin
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(cx, cy, radius);
    
    // Inner detail
    graphics.lineStyle(2, 0xb8860b, 1);
    graphics.strokeCircle(cx, cy, radius * 0.7);
  },

  skull: (graphics: Phaser.GameObjects.Graphics, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    
    // Skull shape
    graphics.fillStyle(0xe0d8c8, 1);
    graphics.fillCircle(cx, cy - size * 0.1, size * 0.3);
    
    // Jaw
    graphics.fillRect(cx - size * 0.15, cy + size * 0.1, size * 0.3, size * 0.15);
    
    // Eyes
    graphics.fillStyle(0x2a1a10, 1);
    graphics.fillCircle(cx - size * 0.1, cy - size * 0.1, size * 0.08);
    graphics.fillCircle(cx + size * 0.1, cy - size * 0.1, size * 0.08);
    
    // Nose
    graphics.fillTriangle(
      cx, cy,
      cx - size * 0.04, cy + size * 0.08,
      cx + size * 0.04, cy + size * 0.08
    );
  },

  heart: (graphics: Phaser.GameObjects.Graphics, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillCircle(cx - size * 0.12, cy - size * 0.08, size * 0.18);
    graphics.fillCircle(cx + size * 0.12, cy - size * 0.08, size * 0.18);
    graphics.fillTriangle(
      cx - size * 0.28, cy,
      cx + size * 0.28, cy,
      cx, cy + size * 0.35
    );
  }
};
