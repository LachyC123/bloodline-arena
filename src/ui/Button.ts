/**
 * Button - Unified button component with reliable touch/click handling
 * Handles mobile touch, desktop clicks, debouncing, and visual feedback
 */

import Phaser from 'phaser';

export const BUTTON_MIN_TOUCH = 52;
export const BUTTON_DEBOUNCE_MS = 200;

// Debug mode flag
let debugInputEnabled = false;
const debugGraphicsMap = new Map<Phaser.Scene, Phaser.GameObjects.Graphics>();

export function setInputDebug(enabled: boolean): void {
  debugInputEnabled = enabled;
  console.log(`[Button] Input debug mode: ${enabled ? 'ON' : 'OFF'}`);
}

export function isInputDebugEnabled(): boolean {
  return debugInputEnabled;
}

export interface ButtonConfig {
  width?: number;
  height?: number;
  fontSize?: number;
  fontColor?: string;
  bgColor?: number;
  hoverColor?: number;
  strokeColor?: number;
  hoverStrokeColor?: number;
  primary?: boolean;
  disabled?: boolean;
  icon?: string;
}

const DEFAULT_CONFIG: Required<Omit<ButtonConfig, 'icon'>> & { icon?: string } = {
  width: 180,
  height: 52,
  fontSize: 14,
  fontColor: '#8b7355',
  bgColor: 0x2a1f1a,
  hoverColor: 0x3a2f2a,
  strokeColor: 0x5a4a3a,
  hoverStrokeColor: 0xc9a959,
  primary: false,
  disabled: false,
  icon: undefined
};

const PRIMARY_COLORS = {
  fontColor: '#c9a959',
  bgColor: 0x4a3a2a,
  hoverColor: 0x5a4a3a,
  strokeColor: 0xc9a959,
  hoverStrokeColor: 0xdab96a
};

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private iconText?: Phaser.GameObjects.Text;
  private hitArea: Phaser.GameObjects.Rectangle;
  
  private config: Required<Omit<ButtonConfig, 'icon'>> & { icon?: string };
  private callback: () => void;
  private lastTapTime = 0;
  private isPressed = false;
  private isHovered = false;
  private _disabled = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    config: ButtonConfig = {}
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // Merge config with primary colors if primary
    this.config = {
      ...DEFAULT_CONFIG,
      ...(config.primary ? PRIMARY_COLORS : {}),
      ...config
    };
    this.callback = onClick;
    this._disabled = this.config.disabled;

    // Ensure minimum touch size
    this.config.width = Math.max(this.config.width, BUTTON_MIN_TOUCH);
    this.config.height = Math.max(this.config.height, BUTTON_MIN_TOUCH);

    // Background
    this.bg = scene.add.graphics();
    this.add(this.bg);
    
    // Icon (optional)
    if (this.config.icon) {
      this.iconText = scene.add.text(
        -this.config.width / 2 + 25,
        0,
        this.config.icon,
        { fontSize: `${this.config.fontSize + 4}px` }
      ).setOrigin(0.5);
      this.add(this.iconText);
    }

    // Label
    const labelX = this.config.icon ? 10 : 0;
    this.labelText = scene.add.text(labelX, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: `${this.config.fontSize}px`,
      color: this.config.fontColor
    }).setOrigin(this.config.icon ? 0 : 0.5, 0.5);
    this.add(this.labelText);

    // Invisible hit area - larger than visuals for easy touch
    const hitWidth = this.config.width + 20;
    const hitHeight = this.config.height + 16;
    this.hitArea = scene.add.rectangle(0, 0, hitWidth, hitHeight, 0x000000, 0);
    this.add(this.hitArea);

    // Set interactive on the hit area, not the container
    this.hitArea.setInteractive({ useHandCursor: !this._disabled });

    // Draw initial state
    this.draw();

    // Setup input handlers
    this.setupInput();

    // Set depth to be above other elements
    this.setDepth(10);

    // Debug drawing
    if (debugInputEnabled) {
      this.drawDebugHitbox();
    }
  }

  private setupInput(): void {
    this.hitArea.on('pointerover', this.onPointerOver, this);
    this.hitArea.on('pointerout', this.onPointerOut, this);
    this.hitArea.on('pointerdown', this.onPointerDown, this);
    this.hitArea.on('pointerup', this.onPointerUp, this);
    
    // Handle pointer leaving while pressed
    this.hitArea.on('pointerupoutside', () => {
      this.isPressed = false;
      this.draw();
    });
  }

  private onPointerOver(): void {
    if (this._disabled) return;
    this.isHovered = true;
    this.draw();
    
    if (debugInputEnabled) {
      console.log(`[Button] pointerover: "${this.labelText.text}"`);
    }
  }

  private onPointerOut(): void {
    if (this._disabled) return;
    this.isHovered = false;
    this.isPressed = false;
    this.draw();
    
    if (debugInputEnabled) {
      console.log(`[Button] pointerout: "${this.labelText.text}"`);
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this._disabled) return;
    
    this.isPressed = true;
    this.draw();
    
    // Visual feedback
    this.setScale(0.95);
    
    if (debugInputEnabled) {
      console.log(`[Button] pointerdown: "${this.labelText.text}" at (${pointer.x.toFixed(0)}, ${pointer.y.toFixed(0)})`);
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this._disabled) return;
    
    // Reset scale
    this.setScale(1);
    
    const wasPressed = this.isPressed;
    this.isPressed = false;
    this.draw();
    
    if (!wasPressed) return;
    
    // Debounce check
    const now = Date.now();
    if (now - this.lastTapTime < BUTTON_DEBOUNCE_MS) {
      if (debugInputEnabled) {
        console.log(`[Button] debounced: "${this.labelText.text}"`);
      }
      return;
    }
    this.lastTapTime = now;
    
    if (debugInputEnabled) {
      console.log(`[Button] pointerup (executing callback): "${this.labelText.text}"`);
    }
    
    // Execute callback directly (no tween delay)
    try {
      this.callback();
    } catch (e) {
      console.error(`[Button] Callback error for "${this.labelText.text}":`, e);
    }
  }

  private draw(): void {
    this.bg.clear();
    
    const w = this.config.width;
    const h = this.config.height;
    
    let bgColor = this.config.bgColor;
    let strokeColor = this.config.strokeColor;
    
    if (this._disabled) {
      bgColor = 0x1a1510;
      strokeColor = 0x3a2a1a;
    } else if (this.isPressed) {
      bgColor = this.config.hoverColor - 0x101010;
      strokeColor = this.config.hoverStrokeColor;
    } else if (this.isHovered) {
      bgColor = this.config.hoverColor;
      strokeColor = this.config.hoverStrokeColor;
    }
    
    this.bg.fillStyle(bgColor, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.bg.lineStyle(2, strokeColor, 1);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    
    // Update label color
    const labelColor = this._disabled ? '#4a3a2a' : 
                       (this.isHovered || this.config.primary ? '#c9a959' : this.config.fontColor);
    this.labelText.setColor(labelColor);
    
    // Update alpha
    this.setAlpha(this._disabled ? 0.6 : 1);
  }

  private drawDebugHitbox(): void {
    const scene = this.scene;
    
    // Get or create debug graphics for this scene
    let debugGfx = debugGraphicsMap.get(scene);
    if (!debugGfx) {
      debugGfx = scene.add.graphics();
      debugGfx.setDepth(9999);
      debugGraphicsMap.set(scene, debugGfx);
    }
    
    // Draw this button's hitbox
    const bounds = this.hitArea.getBounds();
    debugGfx.lineStyle(2, 0xff0000, 0.8);
    debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    // Draw smaller visual bounds
    debugGfx.lineStyle(1, 0x00ff00, 0.6);
    debugGfx.strokeRect(
      this.x - this.config.width / 2,
      this.y - this.config.height / 2,
      this.config.width,
      this.config.height
    );
  }

  // Public methods
  setText(text: string): this {
    this.labelText.setText(text);
    return this;
  }

  setIcon(icon: string): this {
    if (this.iconText) {
      this.iconText.setText(icon);
    }
    return this;
  }

  setDisabled(disabled: boolean): this {
    this._disabled = disabled;
    this.hitArea.input!.enabled = !disabled;
    if (disabled) {
      this.hitArea.disableInteractive();
    } else {
      this.hitArea.setInteractive({ useHandCursor: true });
    }
    this.draw();
    return this;
  }

  isDisabled(): boolean {
    return this._disabled;
  }

  setCallback(callback: () => void): this {
    this.callback = callback;
    return this;
  }

  destroy(fromScene?: boolean): void {
    this.hitArea.off('pointerover', this.onPointerOver, this);
    this.hitArea.off('pointerout', this.onPointerOut, this);
    this.hitArea.off('pointerdown', this.onPointerDown, this);
    this.hitArea.off('pointerup', this.onPointerUp, this);
    super.destroy(fromScene);
  }
}

/**
 * Clear debug graphics for a scene
 */
export function clearDebugGraphics(scene: Phaser.Scene): void {
  const gfx = debugGraphicsMap.get(scene);
  if (gfx) {
    gfx.destroy();
    debugGraphicsMap.delete(scene);
  }
}

/**
 * Log the top-most interactive object under a pointer
 */
export function logTopInteractiveAt(scene: Phaser.Scene, x: number, y: number): void {
  const objects = scene.input.hitTestPointer(scene.input.activePointer);
  console.log(`[Debug] Objects at (${x.toFixed(0)}, ${y.toFixed(0)}):`);
  objects.forEach((obj, i) => {
    const name = (obj as any).name || obj.constructor.name || 'unknown';
    const type = obj.type || 'unknown';
    console.log(`  ${i}: ${name} (${type})`);
  });
}

/**
 * IconButton - Compact button with just an icon
 */
export class IconButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private iconText: Phaser.GameObjects.Text;
  private hitArea: Phaser.GameObjects.Rectangle;
  private callback: () => void;
  private lastTapTime = 0;
  private size: number;
  private _disabled = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    icon: string,
    onClick: () => void,
    size: number = 44
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    
    this.callback = onClick;
    this.size = Math.max(size, BUTTON_MIN_TOUCH);

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.iconText = scene.add.text(0, 0, icon, {
      fontSize: `${Math.floor(this.size * 0.5)}px`
    }).setOrigin(0.5);
    this.add(this.iconText);

    const hitSize = this.size + 12;
    this.hitArea = scene.add.rectangle(0, 0, hitSize, hitSize, 0x000000, 0);
    this.hitArea.setInteractive({ useHandCursor: true });
    this.add(this.hitArea);

    this.draw(false);
    this.setupInput();
    this.setDepth(10);
  }

  private setupInput(): void {
    this.hitArea.on('pointerover', () => this.draw(true));
    this.hitArea.on('pointerout', () => this.draw(false));
    this.hitArea.on('pointerdown', () => this.setScale(0.9));
    this.hitArea.on('pointerup', () => {
      this.setScale(1);
      
      const now = Date.now();
      if (now - this.lastTapTime < BUTTON_DEBOUNCE_MS) return;
      this.lastTapTime = now;
      
      if (!this._disabled) {
        this.callback();
      }
    });
  }

  private draw(hover: boolean): void {
    this.bg.clear();
    
    const color = hover ? 0x3a2f2a : 0x2a1f1a;
    const stroke = hover ? 0xc9a959 : 0x5a4a3a;
    
    this.bg.fillStyle(color, 1);
    this.bg.fillCircle(0, 0, this.size / 2);
    this.bg.lineStyle(2, stroke, 1);
    this.bg.strokeCircle(0, 0, this.size / 2);
  }

  setIcon(icon: string): this {
    this.iconText.setText(icon);
    return this;
  }

  setDisabled(disabled: boolean): this {
    this._disabled = disabled;
    this.setAlpha(disabled ? 0.5 : 1);
    return this;
  }
}
