/**
 * Layout - Responsive UI layout system for mobile-first design
 * Handles safe areas, scaling, anchoring, and touch-friendly sizing
 */

import Phaser from 'phaser';

// Minimum touch target size (Apple HIG recommends 44pt)
export const MIN_TOUCH_SIZE = 52;
export const TOUCH_PADDING = 8;

// Safe area padding for notches/home indicators
export interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get safe area padding for mobile devices
 */
export function getSafeArea(): SafeArea {
  // Default safe area for iPhone-like devices
  const isIPhone = /iPhone/.test(navigator.userAgent);
  const hasNotch = window.innerHeight > 800 && isIPhone;
  
  return {
    top: hasNotch ? 44 : 20,
    bottom: hasNotch ? 34 : 10,
    left: 16,
    right: 16
  };
}

/**
 * Calculate UI scale based on viewport
 */
export function getUIScale(scene: Phaser.Scene): number {
  const { width, height } = scene.cameras.main;
  const baseWidth = 390; // iPhone 14 reference
  const baseHeight = 844;
  
  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;
  
  // Use the smaller scale to ensure everything fits
  return Math.min(scaleX, scaleY, 1.2);
}

/**
 * Get usable content area after safe zones
 */
export function getContentArea(scene: Phaser.Scene): { x: number; y: number; width: number; height: number } {
  const { width, height } = scene.cameras.main;
  const safe = getSafeArea();
  
  return {
    x: safe.left,
    y: safe.top,
    width: width - safe.left - safe.right,
    height: height - safe.top - safe.bottom
  };
}

/**
 * Anchor position helpers
 */
export function anchorTop(scene: Phaser.Scene, offset: number = 0): number {
  return getSafeArea().top + offset;
}

export function anchorBottom(scene: Phaser.Scene, offset: number = 0): number {
  return scene.cameras.main.height - getSafeArea().bottom - offset;
}

export function anchorLeft(scene: Phaser.Scene, offset: number = 0): number {
  return getSafeArea().left + offset;
}

export function anchorRight(scene: Phaser.Scene, offset: number = 0): number {
  return scene.cameras.main.width - getSafeArea().right - offset;
}

export function centerX(scene: Phaser.Scene): number {
  return scene.cameras.main.width / 2;
}

export function centerY(scene: Phaser.Scene): number {
  return scene.cameras.main.height / 2;
}

/**
 * UILayoutRoot - Container with safe area padding and debug overlay
 */
export class UILayoutRoot extends Phaser.GameObjects.Container {
  private debugMode = false;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private contentArea: { x: number; y: number; width: number; height: number };

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    this.contentArea = getContentArea(scene);
    
    // Set up resize handler
    scene.scale.on('resize', this.handleResize, this);
  }

  private handleResize(): void {
    this.contentArea = getContentArea(this.scene);
    this.updateDebugOverlay();
  }

  /**
   * Toggle debug overlay showing touch areas
   */
  toggleDebug(): void {
    this.debugMode = !this.debugMode;
    this.updateDebugOverlay();
  }

  private updateDebugOverlay(): void {
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = undefined;
    }

    if (!this.debugMode) return;

    this.debugGraphics = this.scene.add.graphics();
    this.debugGraphics.setDepth(9999);
    
    const { width, height } = this.scene.cameras.main;
    const safe = getSafeArea();

    // Draw safe area bounds
    this.debugGraphics.lineStyle(2, 0x00ff00, 0.5);
    this.debugGraphics.strokeRect(
      safe.left, safe.top,
      width - safe.left - safe.right,
      height - safe.top - safe.bottom
    );

    // Draw interactive element bounds
    this.debugGraphics.lineStyle(1, 0xff0000, 0.8);
    this.each((child: Phaser.GameObjects.GameObject) => {
      this.drawInteractiveBounds(child);
    });
  }

  private drawInteractiveBounds(obj: Phaser.GameObjects.GameObject): void {
    if (!this.debugGraphics) return;

    if (obj instanceof Phaser.GameObjects.Container) {
      obj.each((child: Phaser.GameObjects.GameObject) => {
        this.drawInteractiveBounds(child);
      });
    }

    if ('input' in obj && (obj as any).input?.enabled) {
      const bounds = (obj as any).getBounds?.();
      if (bounds) {
        this.debugGraphics!.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    }
  }

  getContentArea() {
    return { ...this.contentArea };
  }

  destroy(fromScene?: boolean): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.debugGraphics?.destroy();
    super.destroy(fromScene);
  }
}

/**
 * VStack - Vertical stack layout container
 */
export class VStack extends Phaser.GameObjects.Container {
  private spacing: number;
  private alignment: 'left' | 'center' | 'right';
  private items: Phaser.GameObjects.GameObject[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spacing: number = 10,
    alignment: 'left' | 'center' | 'right' = 'center'
  ) {
    super(scene, x, y);
    this.spacing = spacing;
    this.alignment = alignment;
    scene.add.existing(this);
  }

  addItem(item: Phaser.GameObjects.GameObject): this {
    this.items.push(item);
    this.add(item);
    this.layout();
    return this;
  }

  removeItem(item: Phaser.GameObjects.GameObject): this {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      this.remove(item);
      this.layout();
    }
    return this;
  }

  private layout(): void {
    let currentY = 0;

    this.items.forEach(item => {
      const height = this.getItemHeight(item);
      
      // Set position based on alignment
      if ('setPosition' in item) {
        let xPos = 0;
        if (this.alignment === 'left') {
          xPos = 0;
        } else if (this.alignment === 'right') {
          xPos = 0; // Items should handle their own origin
        }
        (item as any).setPosition(xPos, currentY);
      }

      currentY += height + this.spacing;
    });
  }

  private getItemHeight(item: Phaser.GameObjects.GameObject): number {
    if ('height' in item) return (item as any).height || MIN_TOUCH_SIZE;
    if ('displayHeight' in item) return (item as any).displayHeight || MIN_TOUCH_SIZE;
    return MIN_TOUCH_SIZE;
  }

  setSpacing(spacing: number): this {
    this.spacing = spacing;
    this.layout();
    return this;
  }
}

/**
 * HStack - Horizontal stack layout container
 */
export class HStack extends Phaser.GameObjects.Container {
  private spacing: number;
  private items: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, spacing: number = 10) {
    super(scene, x, y);
    this.spacing = spacing;
    scene.add.existing(this);
  }

  addItem(item: Phaser.GameObjects.GameObject): this {
    this.items.push(item);
    this.add(item);
    this.layout();
    return this;
  }

  private layout(): void {
    let currentX = 0;
    const totalWidth = this.getTotalWidth();
    let startX = -totalWidth / 2;

    this.items.forEach(item => {
      const width = this.getItemWidth(item);
      
      if ('setPosition' in item) {
        (item as any).setPosition(startX + width / 2, 0);
      }

      startX += width + this.spacing;
    });
  }

  private getTotalWidth(): number {
    return this.items.reduce((total, item, i) => {
      return total + this.getItemWidth(item) + (i > 0 ? this.spacing : 0);
    }, 0);
  }

  private getItemWidth(item: Phaser.GameObjects.GameObject): number {
    if ('width' in item) return (item as any).width || MIN_TOUCH_SIZE;
    if ('displayWidth' in item) return (item as any).displayWidth || MIN_TOUCH_SIZE;
    return MIN_TOUCH_SIZE;
  }
}

/**
 * ScrollPanel - Scrollable content container for lists
 */
export class ScrollPanel extends Phaser.GameObjects.Container {
  private contentContainer: Phaser.GameObjects.Container;
  private maskGraphics: Phaser.GameObjects.Graphics;
  private panelWidth: number;
  private panelHeight: number;
  private contentHeight = 0;
  private scrollY = 0;
  private isDragging = false;
  private dragStartY = 0;
  private scrollStartY = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);
    this.panelWidth = width;
    this.panelHeight = height;
    scene.add.existing(this);

    // Create mask
    this.maskGraphics = scene.add.graphics();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(x, y, width, height);
    
    const mask = this.maskGraphics.createGeometryMask();

    // Content container
    this.contentContainer = scene.add.container(0, 0);
    this.contentContainer.setMask(mask);
    this.add(this.contentContainer);

    // Setup scroll interaction
    this.setupScrollInput();
  }

  private setupScrollInput(): void {
    // Create invisible hit area for scrolling
    const hitArea = this.scene.add.rectangle(
      this.panelWidth / 2, this.panelHeight / 2,
      this.panelWidth, this.panelHeight,
      0x000000, 0
    );
    hitArea.setInteractive();
    this.add(hitArea);

    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.scrollStartY = this.scrollY;
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      
      const deltaY = pointer.y - this.dragStartY;
      this.scrollTo(this.scrollStartY - deltaY);
    });

    this.scene.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  addContent(item: Phaser.GameObjects.GameObject, height: number): this {
    if ('setPosition' in item) {
      (item as any).setPosition(this.panelWidth / 2, this.contentHeight + height / 2);
    }
    this.contentContainer.add(item);
    this.contentHeight += height + 10;
    return this;
  }

  scrollTo(y: number): void {
    const maxScroll = Math.max(0, this.contentHeight - this.panelHeight);
    this.scrollY = Phaser.Math.Clamp(y, 0, maxScroll);
    this.contentContainer.y = -this.scrollY;
  }

  getScrollPosition(): number {
    return this.scrollY;
  }

  destroy(fromScene?: boolean): void {
    this.maskGraphics.destroy();
    super.destroy(fromScene);
  }
}

/**
 * TouchButton - Button with guaranteed minimum touch area
 */
export class TouchButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private visualWidth: number;
  private visualHeight: number;
  private touchWidth: number;
  private touchHeight: number;
  private callback: () => void;
  private isPrimary: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: {
      width?: number;
      height?: number;
      fontSize?: number;
      primary?: boolean;
    } = {}
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const {
      width = 180,
      height = 52,
      fontSize = 14,
      primary = false
    } = options;

    this.visualWidth = width;
    this.visualHeight = height;
    this.touchWidth = Math.max(width + TOUCH_PADDING * 2, MIN_TOUCH_SIZE);
    this.touchHeight = Math.max(height + TOUCH_PADDING * 2, MIN_TOUCH_SIZE);
    this.callback = onClick;
    this.isPrimary = primary;

    // Background
    this.bg = scene.add.graphics();
    this.drawBackground(false);
    this.add(this.bg);

    // Label
    this.label = scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: `${fontSize}px`,
      color: primary ? '#c9a959' : '#8b7355'
    }).setOrigin(0.5);
    this.add(this.label);

    // Extended hit area for better touch
    this.setSize(this.touchWidth, this.touchHeight);
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.touchWidth / 2,
        -this.touchHeight / 2,
        this.touchWidth,
        this.touchHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    this.setupInteraction();
  }

  private drawBackground(hover: boolean): void {
    this.bg.clear();
    
    const fillColor = hover 
      ? (this.isPrimary ? 0x5a4a3a : 0x3a2f2a)
      : (this.isPrimary ? 0x4a3a2a : 0x2a1f1a);
    const strokeColor = hover ? 0xc9a959 : (this.isPrimary ? 0xc9a959 : 0x5a4a3a);

    this.bg.fillStyle(fillColor, 1);
    this.bg.fillRoundedRect(
      -this.visualWidth / 2,
      -this.visualHeight / 2,
      this.visualWidth,
      this.visualHeight,
      8
    );
    this.bg.lineStyle(2, strokeColor, 1);
    this.bg.strokeRoundedRect(
      -this.visualWidth / 2,
      -this.visualHeight / 2,
      this.visualWidth,
      this.visualHeight,
      8
    );
  }

  private setupInteraction(): void {
    this.on('pointerover', () => {
      this.drawBackground(true);
      this.label.setColor('#c9a959');
    });

    this.on('pointerout', () => {
      this.drawBackground(false);
      this.label.setColor(this.isPrimary ? '#c9a959' : '#8b7355');
    });

    this.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50
      });
    });

    this.on('pointerup', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
        onComplete: () => this.callback()
      });
    });
  }

  setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.setAlpha(disabled ? 0.5 : 1);
    if (disabled) {
      this.disableInteractive();
    } else {
      this.setInteractive();
    }
    return this;
  }
}

/**
 * Create standard page header
 */
export function createPageHeader(
  scene: Phaser.Scene,
  title: string,
  onBack?: () => void
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, anchorTop(scene, 20));
  const cx = centerX(scene);

  // Title
  const titleText = scene.add.text(cx, 0, title, {
    fontFamily: 'Georgia, serif',
    fontSize: '22px',
    color: '#c9a959',
    stroke: '#000000',
    strokeThickness: 2
  }).setOrigin(0.5);
  container.add(titleText);

  // Back button
  if (onBack) {
    const backBtn = new TouchButton(scene, anchorLeft(scene, 40), 0, '←', onBack, {
      width: 50,
      height: 44,
      fontSize: 18
    });
    container.add(backBtn);
  }

  return container;
}

/**
 * Create bottom action bar
 */
export function createBottomBar(
  scene: Phaser.Scene,
  buttons: Array<{ text: string; onClick: () => void; primary?: boolean }>
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, anchorBottom(scene, 30));
  const cx = centerX(scene);
  const spacing = 10;
  const buttonWidth = (getContentArea(scene).width - spacing * (buttons.length - 1)) / buttons.length;

  buttons.forEach((btn, i) => {
    const x = anchorLeft(scene) + buttonWidth / 2 + i * (buttonWidth + spacing);
    const button = new TouchButton(scene, x, 0, btn.text, btn.onClick, {
      width: Math.min(buttonWidth, 200),
      height: 52,
      fontSize: 14,
      primary: btn.primary
    });
    container.add(button);
  });

  return container;
}
