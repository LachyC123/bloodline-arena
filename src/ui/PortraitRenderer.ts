/**
 * PortraitRenderer - Renders more realistic layered fighter portraits
 * Improved with better proportions, shading, and detail
 */

import Phaser from 'phaser';
import { PortraitData } from '../systems/FighterSystem';

export class PortraitRenderer {
  /**
   * Render a full portrait with improved realism
   */
  static renderPortrait(
    scene: Phaser.Scene,
    data: PortraitData,
    x: number,
    y: number,
    size: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const scale = size / 80; // Base size is 80
    
    // Frame/background with gradient
    const frame = scene.add.graphics();
    frame.fillStyle(0x1a1410, 1);
    frame.fillCircle(0, 0, (size / 2 + 5) * 1.1);
    
    // Inner darker circle for depth
    frame.fillStyle(0x0a0805, 1);
    frame.fillCircle(0, 0, size / 2);
    
    // Golden border
    frame.lineStyle(3, 0x5a4a3a, 1);
    frame.strokeCircle(0, 0, (size / 2 + 5) * 1.1);
    container.add(frame);
    
    // Neck/shoulders silhouette (below face)
    const neck = scene.add.graphics();
    const skinColor = Phaser.Display.Color.HexStringToColor(data.skinTone).color;
    const shadowColor = Phaser.Display.Color.HexStringToColor(data.skinTone).darken(40).color;
    
    // Shoulders
    neck.fillStyle(shadowColor, 1);
    neck.fillEllipse(0, size * 0.42, size * 0.7, size * 0.25);
    // Neck
    neck.fillStyle(skinColor, 1);
    neck.fillRect(-size * 0.12, size * 0.2, size * 0.24, size * 0.25);
    container.add(neck);
    
    // Base face with more natural shape
    const face = scene.add.graphics();
    
    // Face shadow (jawline definition)
    face.fillStyle(shadowColor, 0.6);
    face.fillEllipse(0, size * 0.05, size * 0.44, size * 0.5);
    
    // Main face
    face.fillStyle(skinColor, 1);
    face.fillEllipse(0, 0, size * 0.42, size * 0.48);
    
    // Cheekbone highlights
    const highlightColor = Phaser.Display.Color.HexStringToColor(data.skinTone).lighten(15).color;
    face.fillStyle(highlightColor, 0.4);
    face.fillEllipse(-size * 0.12, -size * 0.02, size * 0.08, size * 0.1);
    face.fillEllipse(size * 0.12, -size * 0.02, size * 0.08, size * 0.1);
    
    // Nose bridge highlight
    face.fillStyle(highlightColor, 0.3);
    face.fillEllipse(0, -size * 0.05, size * 0.04, size * 0.12);
    
    container.add(face);
    
    // Eyes with more detail
    const eyes = scene.add.graphics();
    const eyeY = -size * 0.06;
    const eyeSpacing = size * 0.11;
    
    // Eye sockets (shadow)
    eyes.fillStyle(shadowColor, 0.4);
    eyes.fillEllipse(-eyeSpacing, eyeY, size * 0.1, size * 0.06);
    eyes.fillEllipse(eyeSpacing, eyeY, size * 0.1, size * 0.06);
    
    // Eye whites
    eyes.fillStyle(0xf5f5f0, 1);
    eyes.fillEllipse(-eyeSpacing, eyeY, size * 0.08, size * 0.045);
    eyes.fillEllipse(eyeSpacing, eyeY, size * 0.08, size * 0.045);
    
    // Iris color variations
    const irisColors = [0x4a3520, 0x2a4a40, 0x3a3a50, 0x5a4020, 0x2a3a2a];
    const irisColor = irisColors[data.eyeIndex % irisColors.length];
    
    // Eye variations (gaze direction)
    const gazeOffsets = [
      { x: 0, y: 0 },     // forward
      { x: 1, y: 0 },     // slight right
      { x: -1, y: 0 },    // slight left
      { x: 0, y: -0.5 },  // up
      { x: 0.5, y: 0.5 }  // down-right
    ];
    const gaze = gazeOffsets[data.eyeIndex % gazeOffsets.length];
    
    // Irises
    eyes.fillStyle(irisColor, 1);
    eyes.fillCircle(-eyeSpacing + gaze.x, eyeY + gaze.y, size * 0.03);
    eyes.fillCircle(eyeSpacing + gaze.x, eyeY + gaze.y, size * 0.03);
    
    // Pupils
    eyes.fillStyle(0x0a0a0a, 1);
    eyes.fillCircle(-eyeSpacing + gaze.x, eyeY + gaze.y, size * 0.015);
    eyes.fillCircle(eyeSpacing + gaze.x, eyeY + gaze.y, size * 0.015);
    
    // Eye highlights
    eyes.fillStyle(0xffffff, 0.6);
    eyes.fillCircle(-eyeSpacing - size * 0.01 + gaze.x, eyeY - size * 0.01, size * 0.008);
    eyes.fillCircle(eyeSpacing - size * 0.01 + gaze.x, eyeY - size * 0.01, size * 0.008);
    
    // Eyebrows
    const browColor = Phaser.Display.Color.HexStringToColor(data.hairColor).darken(20).color;
    eyes.lineStyle(2 * scale, browColor, 0.9);
    
    const browStyles = [
      () => { // Neutral
        eyes.moveTo(-eyeSpacing - size * 0.05, eyeY - size * 0.06);
        eyes.lineTo(-eyeSpacing + size * 0.04, eyeY - size * 0.055);
        eyes.moveTo(eyeSpacing - size * 0.04, eyeY - size * 0.055);
        eyes.lineTo(eyeSpacing + size * 0.05, eyeY - size * 0.06);
      },
      () => { // Furrowed
        eyes.moveTo(-eyeSpacing - size * 0.05, eyeY - size * 0.05);
        eyes.lineTo(-eyeSpacing + size * 0.04, eyeY - size * 0.07);
        eyes.moveTo(eyeSpacing - size * 0.04, eyeY - size * 0.07);
        eyes.lineTo(eyeSpacing + size * 0.05, eyeY - size * 0.05);
      },
      () => { // Raised
        eyes.moveTo(-eyeSpacing - size * 0.05, eyeY - size * 0.07);
        eyes.lineTo(-eyeSpacing + size * 0.04, eyeY - size * 0.06);
        eyes.moveTo(eyeSpacing - size * 0.04, eyeY - size * 0.06);
        eyes.lineTo(eyeSpacing + size * 0.05, eyeY - size * 0.07);
      }
    ];
    browStyles[data.baseIndex % browStyles.length]();
    eyes.strokePath();
    
    container.add(eyes);
    
    // Nose with shading
    const nose = scene.add.graphics();
    const noseY = size * 0.02;
    
    // Nose shadow
    nose.fillStyle(shadowColor, 0.3);
    nose.fillEllipse(size * 0.02, noseY + size * 0.05, size * 0.05, size * 0.08);
    
    // Nose bridge line
    nose.lineStyle(1.5 * scale, shadowColor, 0.4);
    nose.moveTo(0, eyeY + size * 0.06);
    nose.lineTo(0, noseY + size * 0.03);
    nose.strokePath();
    
    // Nostril hints
    nose.fillStyle(shadowColor, 0.5);
    nose.fillCircle(-size * 0.025, noseY + size * 0.07, size * 0.015);
    nose.fillCircle(size * 0.025, noseY + size * 0.07, size * 0.015);
    
    container.add(nose);
    
    // Mouth with variations
    const mouth = scene.add.graphics();
    const mouthY = size * 0.14;
    const lipColor = Phaser.Display.Color.HexStringToColor(data.skinTone).darken(25).color;
    
    const mouthStyles = [
      () => { // Neutral closed
        mouth.lineStyle(2 * scale, lipColor, 0.8);
        mouth.moveTo(-size * 0.06, mouthY);
        mouth.lineTo(size * 0.06, mouthY);
        mouth.strokePath();
        // Upper lip hint
        mouth.fillStyle(shadowColor, 0.2);
        mouth.fillEllipse(0, mouthY - size * 0.01, size * 0.06, size * 0.015);
      },
      () => { // Slight smile
        mouth.lineStyle(2 * scale, lipColor, 0.8);
        mouth.beginPath();
        mouth.arc(0, mouthY - size * 0.03, size * 0.06, 0.3, Math.PI - 0.3);
        mouth.strokePath();
      },
      () => { // Frown
        mouth.lineStyle(2 * scale, lipColor, 0.8);
        mouth.beginPath();
        mouth.arc(0, mouthY + size * 0.05, size * 0.06, Math.PI + 0.3, -0.3);
        mouth.strokePath();
      },
      () => { // Grimace/teeth
        mouth.fillStyle(0x1a1210, 1);
        mouth.fillRect(-size * 0.05, mouthY - size * 0.01, size * 0.1, size * 0.03);
        mouth.fillStyle(0xf0ebe0, 0.8);
        mouth.fillRect(-size * 0.04, mouthY - size * 0.008, size * 0.08, size * 0.015);
        mouth.lineStyle(1.5 * scale, lipColor, 0.8);
        mouth.strokeRect(-size * 0.05, mouthY - size * 0.01, size * 0.1, size * 0.03);
      },
      () => { // Smirk
        mouth.lineStyle(2 * scale, lipColor, 0.8);
        mouth.moveTo(-size * 0.06, mouthY + size * 0.01);
        mouth.lineTo(size * 0.02, mouthY - size * 0.01);
        mouth.lineTo(size * 0.06, mouthY - size * 0.02);
        mouth.strokePath();
      }
    ];
    mouthStyles[data.baseIndex % mouthStyles.length]();
    container.add(mouth);
    
    // Jaw/chin definition
    const jaw = scene.add.graphics();
    jaw.lineStyle(1 * scale, shadowColor, 0.3);
    jaw.moveTo(-size * 0.18, size * 0.08);
    jaw.lineTo(-size * 0.08, size * 0.22);
    jaw.lineTo(0, size * 0.24);
    jaw.lineTo(size * 0.08, size * 0.22);
    jaw.lineTo(size * 0.18, size * 0.08);
    jaw.strokePath();
    container.add(jaw);
    
    // Hair with texture
    if (data.hairIndex > 0) {
      const hair = scene.add.graphics();
      const hairColor = Phaser.Display.Color.HexStringToColor(data.hairColor).color;
      const hairHighlight = Phaser.Display.Color.HexStringToColor(data.hairColor).lighten(20).color;
      const hairShadow = Phaser.Display.Color.HexStringToColor(data.hairColor).darken(30).color;
      
      const hairStyles = [
        () => {}, // Bald
        () => { // Short cropped
          hair.fillStyle(hairColor, 1);
          hair.fillEllipse(0, -size * 0.22, size * 0.38, size * 0.18);
          // Texture lines
          hair.lineStyle(1, hairShadow, 0.3);
          for (let i = -3; i <= 3; i++) {
            hair.moveTo(i * size * 0.05, -size * 0.32);
            hair.lineTo(i * size * 0.06, -size * 0.18);
          }
          hair.strokePath();
        },
        () => { // Medium swept
          hair.fillStyle(hairColor, 1);
          hair.fillEllipse(0, -size * 0.2, size * 0.42, size * 0.22);
          // Side hair
          hair.fillRect(-size * 0.23, -size * 0.22, size * 0.08, size * 0.3);
          hair.fillRect(size * 0.15, -size * 0.22, size * 0.08, size * 0.3);
          // Highlights
          hair.fillStyle(hairHighlight, 0.3);
          hair.fillEllipse(-size * 0.08, -size * 0.28, size * 0.1, size * 0.06);
        },
        () => { // Long
          hair.fillStyle(hairColor, 1);
          hair.fillEllipse(0, -size * 0.18, size * 0.45, size * 0.25);
          hair.fillRect(-size * 0.28, -size * 0.2, size * 0.12, size * 0.5);
          hair.fillRect(size * 0.16, -size * 0.2, size * 0.12, size * 0.5);
          // Strand details
          hair.lineStyle(1, hairShadow, 0.4);
          hair.moveTo(-size * 0.22, -size * 0.1);
          hair.lineTo(-size * 0.24, size * 0.25);
          hair.moveTo(size * 0.22, -size * 0.1);
          hair.lineTo(size * 0.24, size * 0.25);
          hair.strokePath();
        },
        () => { // Mohawk
          hair.fillStyle(hairColor, 1);
          hair.beginPath();
          hair.moveTo(-size * 0.08, -size * 0.2);
          hair.lineTo(0, -size * 0.42);
          hair.lineTo(size * 0.08, -size * 0.2);
          hair.closePath();
          hair.fillPath();
          // Texture
          hair.lineStyle(1, hairHighlight, 0.3);
          hair.moveTo(0, -size * 0.4);
          hair.lineTo(0, -size * 0.22);
          hair.strokePath();
        },
        () => { // Slicked back
          hair.fillStyle(hairColor, 1);
          hair.fillEllipse(0, -size * 0.22, size * 0.4, size * 0.16);
          // Comb lines
          hair.lineStyle(1, hairShadow, 0.4);
          for (let i = -2; i <= 2; i++) {
            hair.moveTo(i * size * 0.06, -size * 0.3);
            hair.lineTo(i * size * 0.08 + size * 0.05, -size * 0.15);
          }
          hair.strokePath();
        },
        () => { // Receding
          hair.fillStyle(hairColor, 1);
          hair.fillRect(-size * 0.25, -size * 0.18, size * 0.1, size * 0.25);
          hair.fillRect(size * 0.15, -size * 0.18, size * 0.1, size * 0.25);
          hair.fillEllipse(0, -size * 0.2, size * 0.2, size * 0.08);
        },
        () => { // Tied back
          hair.fillStyle(hairColor, 1);
          hair.fillEllipse(0, -size * 0.22, size * 0.38, size * 0.15);
          // Hair tie
          hair.fillStyle(0x4a3a2a, 1);
          hair.fillRect(size * 0.15, -size * 0.22, size * 0.04, size * 0.08);
          // Tail hint
          hair.fillStyle(hairColor, 1);
          hair.fillRect(size * 0.18, -size * 0.2, size * 0.06, size * 0.15);
        }
      ];
      
      hairStyles[data.hairIndex % hairStyles.length]();
      container.add(hair);
    }
    
    // Beard with texture
    if (data.beardIndex > 0) {
      const beard = scene.add.graphics();
      const beardColor = Phaser.Display.Color.HexStringToColor(data.hairColor).color;
      const beardShadow = Phaser.Display.Color.HexStringToColor(data.hairColor).darken(20).color;
      
      const beardStyles = [
        () => {}, // Clean
        () => { // Stubble
          beard.fillStyle(beardColor, 0.3);
          for (let i = 0; i < 30; i++) {
            const bx = (Math.random() - 0.5) * size * 0.3;
            const by = size * 0.1 + Math.random() * size * 0.15;
            beard.fillRect(bx, by, 1, 2);
          }
        },
        () => { // Short beard
          beard.fillStyle(beardColor, 1);
          beard.fillEllipse(0, size * 0.18, size * 0.25, size * 0.12);
          beard.fillRect(-size * 0.16, mouthY - size * 0.02, size * 0.32, size * 0.1);
          // Texture
          beard.lineStyle(1, beardShadow, 0.3);
          for (let i = -2; i <= 2; i++) {
            beard.moveTo(i * size * 0.05, size * 0.12);
            beard.lineTo(i * size * 0.05, size * 0.25);
          }
          beard.strokePath();
        },
        () => { // Full beard
          beard.fillStyle(beardColor, 1);
          beard.fillEllipse(0, size * 0.2, size * 0.28, size * 0.18);
          // Mustache
          beard.fillEllipse(-size * 0.04, mouthY - size * 0.02, size * 0.06, size * 0.03);
          beard.fillEllipse(size * 0.04, mouthY - size * 0.02, size * 0.06, size * 0.03);
        },
        () => { // Long beard
          beard.fillStyle(beardColor, 1);
          beard.beginPath();
          beard.moveTo(-size * 0.2, size * 0.12);
          beard.lineTo(-size * 0.15, size * 0.35);
          beard.lineTo(0, size * 0.4);
          beard.lineTo(size * 0.15, size * 0.35);
          beard.lineTo(size * 0.2, size * 0.12);
          beard.closePath();
          beard.fillPath();
        },
        () => { // Goatee
          beard.fillStyle(beardColor, 1);
          beard.fillEllipse(0, size * 0.2, size * 0.1, size * 0.12);
          // Soul patch
          beard.fillRect(-size * 0.02, mouthY + size * 0.02, size * 0.04, size * 0.04);
        }
      ];
      
      beardStyles[data.beardIndex % beardStyles.length]();
      container.add(beard);
    }
    
    // Scars with better detail
    if (data.scarIndex > 0) {
      const scars = scene.add.graphics();
      const scarColor = 0x8b5a5a;
      const scarHighlight = 0xb08080;
      
      scars.lineStyle(2.5 * scale, scarColor, 0.7);
      
      const scarPatterns = [
        () => {},
        () => { // Eye scar
          scars.moveTo(-size * 0.2, -size * 0.15);
          scars.lineTo(-size * 0.05, size * 0.05);
          scars.strokePath();
          // Highlight edge
          scars.lineStyle(1 * scale, scarHighlight, 0.4);
          scars.moveTo(-size * 0.19, -size * 0.14);
          scars.lineTo(-size * 0.04, size * 0.04);
          scars.strokePath();
        },
        () => { // Cheek scar
          scars.moveTo(size * 0.08, -size * 0.02);
          scars.lineTo(size * 0.22, size * 0.08);
          scars.strokePath();
        },
        () => { // Forehead scar
          scars.moveTo(-size * 0.1, -size * 0.22);
          scars.lineTo(size * 0.12, -size * 0.18);
          scars.strokePath();
        },
        () => { // X scar on cheek
          scars.moveTo(-size * 0.1, 0);
          scars.lineTo(size * 0.02, size * 0.1);
          scars.strokePath();
          scars.moveTo(size * 0.02, 0);
          scars.lineTo(-size * 0.1, size * 0.1);
          scars.strokePath();
        },
        () => { // Multiple battle scars
          scars.moveTo(-size * 0.18, -size * 0.1);
          scars.lineTo(-size * 0.08, size * 0.02);
          scars.strokePath();
          scars.moveTo(size * 0.12, -size * 0.05);
          scars.lineTo(size * 0.2, size * 0.1);
          scars.strokePath();
          scars.moveTo(0, size * 0.18);
          scars.lineTo(size * 0.08, size * 0.22);
          scars.strokePath();
        }
      ];
      
      scarPatterns[data.scarIndex % scarPatterns.length]();
      container.add(scars);
    }
    
    // War paint
    if (data.warpaintIndex > 0) {
      const paint = scene.add.graphics();
      
      const paintPatterns = [
        () => {},
        () => { // Eye stripes
          paint.fillStyle(0x1a1a1a, 0.7);
          paint.fillRect(-size * 0.22, eyeY - size * 0.02, size * 0.14, size * 0.04);
          paint.fillRect(size * 0.08, eyeY - size * 0.02, size * 0.14, size * 0.04);
        },
        () => { // Center stripe
          paint.fillStyle(0x8b0000, 0.6);
          paint.fillRect(-size * 0.02, -size * 0.3, size * 0.04, size * 0.5);
        },
        () => { // Tribal marks
          paint.lineStyle(3 * scale, 0x1a1a1a, 0.7);
          paint.moveTo(-size * 0.2, -size * 0.12);
          paint.lineTo(-size * 0.12, -size * 0.08);
          paint.lineTo(-size * 0.2, -size * 0.04);
          paint.strokePath();
          paint.moveTo(size * 0.2, -size * 0.12);
          paint.lineTo(size * 0.12, -size * 0.08);
          paint.lineTo(size * 0.2, -size * 0.04);
          paint.strokePath();
        },
        () => { // Blood tears
          paint.fillStyle(0x8b0000, 0.6);
          paint.fillRect(-eyeSpacing - size * 0.01, eyeY + size * 0.04, size * 0.02, size * 0.12);
          paint.fillRect(eyeSpacing - size * 0.01, eyeY + size * 0.04, size * 0.02, size * 0.12);
        }
      ];
      
      paintPatterns[data.warpaintIndex % paintPatterns.length]();
      container.add(paint);
    }
    
    // Hood/Helm overlay
    if (data.hoodIndex > 0) {
      const hood = scene.add.graphics();
      
      const hoodStyles = [
        () => {},
        () => { // Hood
          hood.fillStyle(0x2a1f1a, 0.95);
          hood.beginPath();
          hood.moveTo(-size * 0.35, size * 0.1);
          hood.lineTo(-size * 0.32, -size * 0.25);
          // Approximate curve with arc
          hood.lineTo(-size * 0.15, -size * 0.38);
          hood.lineTo(0, -size * 0.42);
          hood.lineTo(size * 0.15, -size * 0.38);
          hood.lineTo(size * 0.32, -size * 0.25);
          hood.lineTo(size * 0.35, size * 0.1);
          hood.closePath();
          hood.fillPath();
          // Shadow inside
          hood.fillStyle(0x0a0805, 0.5);
          hood.fillEllipse(0, -size * 0.05, size * 0.28, size * 0.35);
        },
        () => { // Metal helm
          hood.fillStyle(0x5a5a5a, 1);
          hood.fillEllipse(0, -size * 0.12, size * 0.4, size * 0.32);
          // Nose guard
          hood.fillRect(-size * 0.02, -size * 0.25, size * 0.04, size * 0.2);
          // Eye slits
          hood.fillStyle(0x1a1a1a, 1);
          hood.fillRect(-size * 0.15, eyeY - size * 0.01, size * 0.08, size * 0.03);
          hood.fillRect(size * 0.07, eyeY - size * 0.01, size * 0.08, size * 0.03);
          // Metal shine
          hood.fillStyle(0x8a8a8a, 0.4);
          hood.fillEllipse(-size * 0.1, -size * 0.25, size * 0.08, size * 0.04);
        }
      ];
      
      hoodStyles[data.hoodIndex % hoodStyles.length]();
      container.add(hood);
    }
    
    // Injury overlays
    for (const injury of data.injuryOverlays) {
      const overlay = scene.add.graphics();
      
      if (injury.includes('head')) {
        // Bandage
        overlay.fillStyle(0xe8e0d0, 0.9);
        overlay.fillRect(-size * 0.2, -size * 0.28, size * 0.4, size * 0.06);
        // Blood stain
        overlay.fillStyle(0x8b0000, 0.4);
        overlay.fillCircle(-size * 0.05, -size * 0.25, size * 0.04);
      } else if (injury.includes('body')) {
        // Bruise
        overlay.fillStyle(0x4a3050, 0.3);
        overlay.fillEllipse(size * 0.1, size * 0.15, size * 0.08, size * 0.06);
      }
      
      container.add(overlay);
    }
    
    // Subtle animated glow for living portraits
    const glow = scene.add.graphics();
    glow.lineStyle(2, 0xc9a959, 0.15);
    glow.strokeCircle(0, 0, (size / 2 + 8) * 1.1);
    container.add(glow);
    
    // Add subtle breathing animation
    scene.tweens.add({
      targets: container,
      scaleX: 1.01,
      scaleY: 0.99,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }

  /**
   * Render a mini portrait (simplified for small sizes)
   */
  static renderMiniPortrait(
    scene: Phaser.Scene,
    data: PortraitData,
    x: number,
    y: number,
    size: number
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // Simple circular portrait
    const bg = scene.add.graphics();
    bg.fillStyle(0x1a1410, 1);
    bg.fillCircle(0, 0, size / 2 + 2);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeCircle(0, 0, size / 2 + 2);
    container.add(bg);
    
    // Face
    const skinColor = Phaser.Display.Color.HexStringToColor(data.skinTone).color;
    const face = scene.add.graphics();
    face.fillStyle(skinColor, 1);
    face.fillCircle(0, 0, size / 2 - 2);
    container.add(face);
    
    // Eyes (simplified)
    const eyes = scene.add.graphics();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-size * 0.15, -size * 0.08, size * 0.08);
    eyes.fillCircle(size * 0.15, -size * 0.08, size * 0.08);
    eyes.fillStyle(0x2a1a10, 1);
    eyes.fillCircle(-size * 0.15, -size * 0.08, size * 0.04);
    eyes.fillCircle(size * 0.15, -size * 0.08, size * 0.04);
    container.add(eyes);
    
    return container;
  }
}
