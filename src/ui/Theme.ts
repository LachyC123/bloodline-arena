/**
 * Theme - Consistent UI styling throughout the game
 * Defines colors, fonts, spacing, and common UI elements
 */

// ========== COLORS ==========
export const COLORS = {
  // Primary palette
  primary: 0xc9a959,       // Gold accent
  primaryLight: 0xdab96a,
  primaryDark: 0xa88833,
  
  // Background tones
  bgDark: 0x1a1410,
  bgMedium: 0x2a1f1a,
  bgLight: 0x3a2a20,
  bgPanel: 0x241a15,
  
  // Text colors (hex strings for Phaser Text)
  textGold: '#c9a959',
  textLight: '#d4c4a4',
  textMedium: '#8b7355',
  textDark: '#5a4a3a',
  textMuted: '#4a3a2a',
  
  // Status colors
  success: '#6b8e23',
  warning: '#daa520',
  danger: '#cd5c5c',
  error: '#8b0000',
  info: '#4682b4',
  
  // Rarity colors
  common: 0x8b8b8b,
  uncommon: 0x2e8b57,
  rare: 0x4169e1,
  epic: 0x9932cc,
  legendary: 0xffd700,
  
  // Combat colors
  playerHP: 0x6b8e23,
  enemyHP: 0xcd5c5c,
  stamina: 0x4682b4,
  focus: 0x9932cc,
  damage: 0xff4444,
  heal: 0x44ff44,
  crit: 0xff8800,
  block: 0x4488ff,
  dodge: 0x88ff88
};

// Color strings for CSS/text
export const COLOR_STRINGS = {
  primary: '#c9a959',
  success: '#6b8e23',
  warning: '#daa520',
  danger: '#cd5c5c',
  error: '#8b0000',
  common: '#8b8b8b',
  uncommon: '#2e8b57',
  rare: '#4169e1',
  epic: '#9932cc',
  legendary: '#ffd700'
};

// ========== TYPOGRAPHY ==========
export const FONTS = {
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    color: COLORS.textGold,
    stroke: '#000000',
    strokeThickness: 3
  },
  heading: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: COLORS.textGold,
    stroke: '#000000',
    strokeThickness: 2
  },
  subheading: {
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    color: COLORS.textLight
  },
  body: {
    fontFamily: 'Georgia, serif',
    fontSize: '12px',
    color: COLORS.textMedium
  },
  small: {
    fontFamily: 'Georgia, serif',
    fontSize: '10px',
    color: COLORS.textDark
  },
  tiny: {
    fontFamily: 'Georgia, serif',
    fontSize: '9px',
    color: COLORS.textMuted
  },
  button: {
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    color: COLORS.textGold
  },
  stat: {
    fontFamily: 'Georgia, serif',
    fontSize: '11px',
    color: COLORS.textMedium
  },
  damage: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: '#ff4444',
    stroke: '#000000',
    strokeThickness: 2
  },
  critDamage: {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    color: '#ff8800',
    stroke: '#000000',
    strokeThickness: 3
  }
};

// ========== SPACING ==========
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

// ========== SIZING ==========
export const SIZES = {
  // Buttons
  buttonMinWidth: 100,
  buttonMinHeight: 48,
  buttonRadius: 8,
  
  // Panels
  panelRadius: 10,
  panelBorder: 2,
  
  // Cards
  cardRadius: 8,
  cardBorder: 1,
  
  // Touch targets
  minTouchTarget: 48,
  preferredTouchTarget: 56,
  
  // Icons
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32
};

// ========== HELPER FUNCTIONS ==========

/**
 * Draw a themed panel background
 */
export function drawPanel(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: number;
    alpha?: number;
    stroke?: number;
    strokeAlpha?: number;
    radius?: number;
  } = {}
): void {
  const {
    fill = COLORS.bgPanel,
    alpha = 0.95,
    stroke = COLORS.primary,
    strokeAlpha = 0.5,
    radius = SIZES.panelRadius
  } = options;
  
  graphics.fillStyle(fill, alpha);
  graphics.fillRoundedRect(x, y, width, height, radius);
  graphics.lineStyle(SIZES.panelBorder, stroke, strokeAlpha);
  graphics.strokeRoundedRect(x, y, width, height, radius);
}

/**
 * Draw a themed button background
 */
export function drawButton(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  state: 'normal' | 'hover' | 'pressed' | 'disabled' = 'normal',
  primary: boolean = false
): void {
  let fill: number;
  let stroke: number;
  let alpha = 1;
  
  switch (state) {
    case 'hover':
      fill = primary ? 0x5a4a3a : 0x3a2f2a;
      stroke = COLORS.primary;
      break;
    case 'pressed':
      fill = primary ? 0x4a3a2a : 0x2a1f1a;
      stroke = COLORS.primary;
      break;
    case 'disabled':
      fill = 0x1a1510;
      stroke = 0x3a2a1a;
      alpha = 0.6;
      break;
    default:
      fill = primary ? 0x4a3a2a : 0x2a1f1a;
      stroke = primary ? COLORS.primary : 0x5a4a3a;
  }
  
  graphics.fillStyle(fill, alpha);
  graphics.fillRoundedRect(x, y, width, height, SIZES.buttonRadius);
  graphics.lineStyle(2, stroke, alpha);
  graphics.strokeRoundedRect(x, y, width, height, SIZES.buttonRadius);
}

/**
 * Draw a health/stamina bar
 */
export function drawBar(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  fillPercent: number,
  fillColor: number,
  bgColor: number = 0x2a1f1a
): void {
  // Background
  graphics.fillStyle(bgColor, 1);
  graphics.fillRoundedRect(x, y, width, height, height / 2);
  
  // Fill
  const fillWidth = Math.max(0, Math.min(1, fillPercent)) * width;
  if (fillWidth > 0) {
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(x, y, fillWidth, height, height / 2);
  }
  
  // Border
  graphics.lineStyle(1, 0x5a4a3a, 0.5);
  graphics.strokeRoundedRect(x, y, width, height, height / 2);
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): number {
  switch (rarity) {
    case 'legendary': return COLORS.legendary;
    case 'epic': return COLORS.epic;
    case 'rare': return COLORS.rare;
    case 'uncommon': return COLORS.uncommon;
    default: return COLORS.common;
  }
}

/**
 * Get rarity color string
 */
export function getRarityColorString(rarity: string): string {
  switch (rarity) {
    case 'legendary': return COLOR_STRINGS.legendary;
    case 'epic': return COLOR_STRINGS.epic;
    case 'rare': return COLOR_STRINGS.rare;
    case 'uncommon': return COLOR_STRINGS.uncommon;
    default: return COLOR_STRINGS.common;
  }
}

/**
 * Create standardized text style
 */
export function textStyle(
  type: keyof typeof FONTS,
  overrides: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    ...FONTS[type],
    ...overrides
  } as Phaser.Types.GameObjects.Text.TextStyle;
}

/**
 * Animate button press
 */
export function animateButtonPress(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite,
  callback: () => void
): void {
  scene.tweens.add({
    targets: target,
    scaleX: 0.92,
    scaleY: 0.92,
    duration: 60,
    yoyo: true,
    onComplete: callback
  });
}

/**
 * Create floating text animation
 */
export function createFloatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: Phaser.Types.GameObjects.Text.TextStyle,
  duration: number = 1000
): Phaser.GameObjects.Text {
  const textObj = scene.add.text(x, y, text, style)
    .setOrigin(0.5)
    .setDepth(1000);
  
  scene.tweens.add({
    targets: textObj,
    y: y - 40,
    alpha: 0,
    duration,
    ease: 'Power2',
    onComplete: () => textObj.destroy()
  });
  
  return textObj;
}

/**
 * Screen shake effect
 */
export function screenShake(
  scene: Phaser.Scene,
  intensity: number = 5,
  duration: number = 100
): void {
  const settings = scene.registry.get('settings');
  if (settings && !settings.screenShake) return;
  
  scene.cameras.main.shake(duration, intensity / 1000);
}

/**
 * Screen flash effect
 */
export function screenFlash(
  scene: Phaser.Scene,
  color: number = 0xffffff,
  alpha: number = 0.3,
  duration: number = 100
): void {
  const { width, height } = scene.cameras.main;
  
  const flash = scene.add.rectangle(width / 2, height / 2, width, height, color, alpha);
  flash.setDepth(999);
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration,
    onComplete: () => flash.destroy()
  });
}

/**
 * Hit stop effect (brief pause for impact)
 */
export function hitStop(scene: Phaser.Scene, duration: number = 80): Promise<void> {
  const settings = scene.registry.get('settings');
  if (settings && settings.reduceMotion) {
    return Promise.resolve();
  }
  
  return new Promise(resolve => {
    scene.time.delayedCall(duration, resolve);
  });
}
