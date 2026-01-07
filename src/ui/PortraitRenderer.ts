/**
 * PortraitRenderer - Renders layered fighter portraits
 */

import Phaser from 'phaser';
import { PortraitData } from '../systems/FighterSystem';

export class PortraitRenderer {
  /**
   * Render a full portrait
   */
  static renderPortrait(
    scene: Phaser.Scene,
    data: PortraitData,
    x: number,
    y: number,
    size: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // Frame/background
    const frame = scene.add.graphics();
    frame.fillStyle(0x1a1410, 1);
    frame.fillCircle(0, 0, size / 2 + 5);
    frame.lineStyle(3, 0x5a4a3a, 1);
    frame.strokeCircle(0, 0, size / 2 + 5);
    container.add(frame);
    
    // Base face (generated pattern based on index)
    const face = scene.add.graphics();
    face.fillStyle(Phaser.Display.Color.HexStringToColor(data.skinTone).color, 1);
    face.fillCircle(0, 0, size / 2 - 5);
    container.add(face);
    
    // Face features (simplified but distinctive)
    const features = scene.add.graphics();
    
    // Eyes
    const eyeY = -size * 0.08;
    const eyeSpacing = size * 0.15;
    features.fillStyle(0xffffff, 1);
    features.fillEllipse(-eyeSpacing, eyeY, size * 0.12, size * 0.08);
    features.fillEllipse(eyeSpacing, eyeY, size * 0.12, size * 0.08);
    
    // Pupils (vary by eye index)
    const pupilOffsets = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    const pupilOffset = pupilOffsets[data.eyeIndex % pupilOffsets.length];
    features.fillStyle(0x2a1a10, 1);
    features.fillCircle(-eyeSpacing + pupilOffset.x, eyeY + pupilOffset.y, size * 0.04);
    features.fillCircle(eyeSpacing + pupilOffset.x, eyeY + pupilOffset.y, size * 0.04);
    
    // Nose (simple line)
    features.lineStyle(2, Phaser.Display.Color.HexStringToColor(data.skinTone).darken(30).color, 0.5);
    features.moveTo(0, eyeY + size * 0.08);
    features.lineTo(0, eyeY + size * 0.18);
    features.strokePath();
    
    // Mouth (varies by base index)
    const mouthY = size * 0.18;
    const mouthStyles = [
      () => { // Neutral
        features.lineStyle(2, 0x8b4513, 0.8);
        features.moveTo(-size * 0.1, mouthY);
        features.lineTo(size * 0.1, mouthY);
        features.strokePath();
      },
      () => { // Slight smile
        features.lineStyle(2, 0x8b4513, 0.8);
        features.beginPath();
        features.arc(0, mouthY - size * 0.05, size * 0.1, 0.2, Math.PI - 0.2);
        features.strokePath();
      },
      () => { // Frown
        features.lineStyle(2, 0x8b4513, 0.8);
        features.beginPath();
        features.arc(0, mouthY + size * 0.1, size * 0.1, Math.PI + 0.2, -0.2);
        features.strokePath();
      },
      () => { // Open mouth
        features.fillStyle(0x3a1a10, 1);
        features.fillEllipse(0, mouthY, size * 0.1, size * 0.06);
      },
      () => { // Smirk
        features.lineStyle(2, 0x8b4513, 0.8);
        features.moveTo(-size * 0.08, mouthY);
        features.lineTo(size * 0.1, mouthY - size * 0.03);
        features.strokePath();
      },
      () => { // Grimace
        features.lineStyle(2, 0x8b4513, 0.8);
        features.moveTo(-size * 0.12, mouthY);
        features.lineTo(-size * 0.04, mouthY + 0.02);
        features.lineTo(size * 0.04, mouthY - 0.02);
        features.lineTo(size * 0.12, mouthY);
        features.strokePath();
      }
    ];
    mouthStyles[data.baseIndex % mouthStyles.length]();
    container.add(features);
    
    // Hair
    if (data.hairIndex > 0) {
      const hair = scene.add.graphics();
      hair.fillStyle(Phaser.Display.Color.HexStringToColor(data.hairColor).color, 1);
      
      const hairStyles = [
        () => {}, // Bald
        () => { // Short
          hair.fillEllipse(0, -size * 0.35, size * 0.45, size * 0.2);
        },
        () => { // Medium
          hair.fillEllipse(0, -size * 0.3, size * 0.5, size * 0.3);
          hair.fillRect(-size * 0.35, -size * 0.35, size * 0.1, size * 0.4);
          hair.fillRect(size * 0.25, -size * 0.35, size * 0.1, size * 0.4);
        },
        () => { // Long
          hair.fillEllipse(0, -size * 0.25, size * 0.55, size * 0.35);
          hair.fillRect(-size * 0.4, -size * 0.3, size * 0.15, size * 0.7);
          hair.fillRect(size * 0.25, -size * 0.3, size * 0.15, size * 0.7);
        },
        () => { // Mohawk
          hair.fillRect(-size * 0.08, -size * 0.5, size * 0.16, size * 0.3);
        },
        () => { // Spiky
          for (let i = -2; i <= 2; i++) {
            hair.fillTriangle(
              i * size * 0.1, -size * 0.25,
              i * size * 0.1 - size * 0.05, -size * 0.45 - Math.abs(i) * 0.03,
              i * size * 0.1 + size * 0.05, -size * 0.45
            );
          }
        },
        () => { // Ponytail
          hair.fillEllipse(0, -size * 0.35, size * 0.4, size * 0.2);
          hair.fillRect(size * 0.15, -size * 0.3, size * 0.08, size * 0.5);
        },
        () => { // Braids
          hair.fillRect(-size * 0.35, -size * 0.2, size * 0.1, size * 0.6);
          hair.fillRect(size * 0.25, -size * 0.2, size * 0.1, size * 0.6);
          hair.fillEllipse(0, -size * 0.3, size * 0.4, size * 0.2);
        }
      ];
      
      hairStyles[data.hairIndex % hairStyles.length]();
      container.add(hair);
    }
    
    // Beard
    if (data.beardIndex > 0) {
      const beard = scene.add.graphics();
      beard.fillStyle(Phaser.Display.Color.HexStringToColor(data.hairColor).color, 1);
      
      const beardStyles = [
        () => {}, // Clean
        () => { // Stubble
          beard.fillStyle(Phaser.Display.Color.HexStringToColor(data.hairColor).color, 0.3);
          beard.fillRect(-size * 0.2, size * 0.1, size * 0.4, size * 0.15);
        },
        () => { // Short beard
          beard.fillRect(-size * 0.2, size * 0.12, size * 0.4, size * 0.2);
        },
        () => { // Full beard
          beard.fillEllipse(0, size * 0.25, size * 0.35, size * 0.25);
        },
        () => { // Long beard
          beard.fillEllipse(0, size * 0.3, size * 0.3, size * 0.35);
        },
        () => { // Goatee
          beard.fillEllipse(0, size * 0.25, size * 0.12, size * 0.2);
        }
      ];
      
      beardStyles[data.beardIndex % beardStyles.length]();
      container.add(beard);
    }
    
    // Scars
    if (data.scarIndex > 0) {
      const scars = scene.add.graphics();
      scars.lineStyle(2, 0x8b4060, 0.6);
      
      const scarPatterns = [
        () => {},
        () => { // Eye scar
          scars.moveTo(-size * 0.3, -size * 0.2);
          scars.lineTo(-size * 0.05, size * 0.1);
          scars.strokePath();
        },
        () => { // Cheek scar
          scars.moveTo(size * 0.1, 0);
          scars.lineTo(size * 0.35, size * 0.1);
          scars.strokePath();
        },
        () => { // Forehead scar
          scars.moveTo(-size * 0.15, -size * 0.3);
          scars.lineTo(size * 0.2, -size * 0.25);
          scars.strokePath();
        },
        () => { // X scar
          scars.moveTo(-size * 0.15, -size * 0.1);
          scars.lineTo(size * 0.15, size * 0.15);
          scars.strokePath();
          scars.moveTo(size * 0.15, -size * 0.1);
          scars.lineTo(-size * 0.15, size * 0.15);
          scars.strokePath();
        },
        () => { // Multiple scars
          scars.moveTo(-size * 0.25, -size * 0.15);
          scars.lineTo(-size * 0.1, size * 0.05);
          scars.strokePath();
          scars.moveTo(size * 0.2, -size * 0.05);
          scars.lineTo(size * 0.3, size * 0.15);
          scars.strokePath();
        }
      ];
      
      scarPatterns[data.scarIndex % scarPatterns.length]();
      container.add(scars);
    }
    
    // War paint
    if (data.warpaintIndex > 0) {
      const paint = scene.add.graphics();
      paint.lineStyle(3, 0x2a2a2a, 0.7);
      
      const paintPatterns = [
        () => {},
        () => { // Eye stripes
          paint.moveTo(-size * 0.3, -size * 0.1);
          paint.lineTo(-size * 0.05, -size * 0.1);
          paint.strokePath();
          paint.moveTo(size * 0.05, -size * 0.1);
          paint.lineTo(size * 0.3, -size * 0.1);
          paint.strokePath();
        },
        () => { // Face stripe
          paint.moveTo(0, -size * 0.4);
          paint.lineTo(0, size * 0.3);
          paint.strokePath();
        },
        () => { // War marks
          paint.moveTo(-size * 0.3, -size * 0.2);
          paint.lineTo(-size * 0.15, -size * 0.15);
          paint.lineTo(-size * 0.3, -size * 0.1);
          paint.strokePath();
          paint.moveTo(size * 0.3, -size * 0.2);
          paint.lineTo(size * 0.15, -size * 0.15);
          paint.lineTo(size * 0.3, -size * 0.1);
          paint.strokePath();
        },
        () => { // Tribal
          paint.lineStyle(2, 0x8b0000, 0.6);
          paint.strokeCircle(-size * 0.2, size * 0.05, size * 0.08);
          paint.strokeCircle(size * 0.2, size * 0.05, size * 0.08);
        }
      ];
      
      paintPatterns[data.warpaintIndex % paintPatterns.length]();
      container.add(paint);
    }
    
    // Hood/Helm overlay
    if (data.hoodIndex > 0) {
      const hood = scene.add.graphics();
      hood.fillStyle(0x3a2a1a, 0.9);
      
      const hoodStyles = [
        () => {},
        () => { // Hood
          hood.fillEllipse(0, -size * 0.2, size * 0.6, size * 0.4);
          hood.fillStyle(0x1a1410, 1);
          hood.fillEllipse(0, 0, size * 0.4, size * 0.35);
        },
        () => { // Helm
          hood.fillStyle(0x5a5a5a, 1);
          hood.fillEllipse(0, -size * 0.15, size * 0.55, size * 0.4);
          hood.lineStyle(2, 0x3a3a3a, 1);
          hood.moveTo(0, -size * 0.4);
          hood.lineTo(0, size * 0.1);
          hood.strokePath();
        }
      ];
      
      hoodStyles[data.hoodIndex % hoodStyles.length]();
      container.add(hood);
    }
    
    // Injury overlays
    for (const injury of data.injuryOverlays) {
      const overlay = scene.add.graphics();
      
      if (injury.includes('head')) {
        overlay.fillStyle(0x8b0000, 0.3);
        overlay.fillCircle(-size * 0.15, -size * 0.15, size * 0.1);
      } else if (injury.includes('body')) {
        overlay.fillStyle(0x8b0000, 0.2);
        overlay.fillRect(-size * 0.2, size * 0.1, size * 0.4, size * 0.2);
      }
      
      container.add(overlay);
    }
    
    // Outer glow based on portrait lighting
    const glow = scene.add.graphics();
    glow.lineStyle(2, 0xc9a959, 0.2);
    glow.strokeCircle(0, 0, size / 2 + 8);
    container.add(glow);
    
    return container;
  }

  /**
   * Render a mini portrait (simplified)
   */
  static renderMiniPortrait(
    scene: Phaser.Scene,
    data: PortraitData,
    x: number,
    y: number,
    size: number
  ): Phaser.GameObjects.Container {
    // Use the same renderer but with smaller size
    return this.renderPortrait(scene, data, x, y, size);
  }
}
