/**
 * UIHelper - Common UI components and utilities
 */

import Phaser from 'phaser';

interface ButtonOptions {
  width?: number;
  height?: number;
  fontSize?: string;
  primary?: boolean;
}

interface ButtonVisualPalette {
  fillTop: number;
  fillBottom: number;
  strokeOuter: number;
  strokeInner: number;
  text: string;
  glow: number;
}

export class UIHelper {
  /**
   * Create a styled button
   */
  static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: ButtonOptions = {}
  ): Phaser.GameObjects.Container {
    const {
      width = 180,
      height = 45,
      fontSize = '14px',
      primary = false
    } = options;
    
    const container = scene.add.container(x, y);
    container.setSize(width, height);

    const basePalette = this.getButtonPalette(primary, false);
    const hoverPalette = this.getButtonPalette(primary, true);

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, 10);
    container.add(shadow);

    const glow = scene.add.graphics();
    glow.fillStyle(basePalette.glow, 0.14);
    glow.fillRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 12);
    glow.setAlpha(0);
    container.add(glow);
    
    // Background
    const bg = scene.add.graphics();
    this.drawButtonState(bg, width, height, basePalette);
    container.add(bg);

    const sheen = scene.add.graphics();
    sheen.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.08, 0.08, 0, 0);
    sheen.fillRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, Math.max(8, height * 0.42), 8);
    container.add(sheen);
    
    // Text
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: fontSize,
      color: basePalette.text,
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    container.add(label);
    
    // Interactive
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    bg.on('pointerover', () => {
      this.drawButtonState(bg, width, height, hoverPalette);
      label.setColor(hoverPalette.text);

      scene.tweens.add({
        targets: glow,
        alpha: 1,
        duration: 130,
        ease: 'Sine.easeOut'
      });

      scene.tweens.add({
        targets: container,
        y: y - 2,
        duration: 130,
        ease: 'Sine.easeOut'
      });
    });
    
    bg.on('pointerout', () => {
      this.drawButtonState(bg, width, height, basePalette);
      label.setColor(basePalette.text);

      scene.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 130,
        ease: 'Sine.easeOut'
      });

      scene.tweens.add({
        targets: container,
        y,
        duration: 130,
        ease: 'Sine.easeOut'
      });
    });
    
    bg.on('pointerdown', () => {
      // Quick press animation
      scene.tweens.add({
        targets: container,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 50,
        yoyo: true,
        onComplete: onClick
      });
    });
    
    return container;
  }

  /**
   * Show a notification toast
   */
  static showNotification(
    scene: Phaser.Scene,
    message: string,
    duration: number = 2000
  ): Phaser.GameObjects.Container {
    const { width, height } = scene.cameras.main;
    
    const container = scene.add.container(width / 2, 100);
    container.setDepth(1000);
    
    // Background
    const padding = 20;
    const textObj = scene.add.text(0, 0, message, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    const bgWidth = textObj.width + padding * 2;
    const bgHeight = textObj.height + padding;
    
    const bg = scene.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.95);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 8);
    bg.lineStyle(2, 0xc9a959, 0.5);
    bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 8);
    
    container.add(bg);
    container.add(textObj);
    
    // Animate in
    container.setAlpha(0);
    container.y = 80;
    
    scene.tweens.add({
      targets: container,
      alpha: 1,
      y: 100,
      duration: 200,
      ease: 'Back.out'
    });
    
    // Animate out after duration
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({
        targets: container,
        alpha: 0,
        y: 80,
        duration: 200,
        onComplete: () => container.destroy()
      });
    });
    
    return container;
  }

  /**
   * Show a confirmation dialog
   */
  static showConfirmDialog(
    scene: Phaser.Scene,
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmText: string = 'CONFIRM'
  ): Phaser.GameObjects.Container {
    const { width, height } = scene.cameras.main;
    
    const container = scene.add.container(width / 2, height / 2);
    container.setDepth(1000);
    
    // Backdrop
    const backdrop = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    backdrop.setInteractive();
    container.add(backdrop);
    
    // Dialog box
    const dialogWidth = 320;
    const dialogHeight = 280;
    
    const dialog = scene.add.graphics();
    dialog.fillStyle(0x1a1410, 1);
    dialog.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
    dialog.lineStyle(3, 0xc9a959, 1);
    dialog.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 12);
    container.add(dialog);
    
    // Title
    const titleText = scene.add.text(0, -dialogHeight / 2 + 30, title, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c9a959'
    }).setOrigin(0.5);
    container.add(titleText);
    
    // Message
    const messageText = scene.add.text(0, -20, message, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      wordWrap: { width: dialogWidth - 40 },
      align: 'center'
    }).setOrigin(0.5);
    container.add(messageText);
    
    // Cancel button
    const cancelBtn = this.createButton(
      scene,
      -70,
      dialogHeight / 2 - 50,
      'CANCEL',
      () => {
        container.destroy();
        onCancel();
      },
      { width: 100, height: 40, fontSize: '12px' }
    );
    container.add(cancelBtn);
    
    // Confirm button
    const confirmBtn = this.createButton(
      scene,
      70,
      dialogHeight / 2 - 50,
      confirmText,
      () => {
        container.destroy();
        onConfirm();
      },
      { width: 100, height: 40, fontSize: '12px', primary: true }
    );
    container.add(confirmBtn);
    
    // Animate in
    container.setScale(0.8);
    container.setAlpha(0);
    
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.out'
    });
    
    return container;
  }

  /**
   * Create a progress bar
   */
  static createProgressBar(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maxValue: number,
    color: number = 0xc9a959
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    
    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(1, 2, width, height, height / 3);
    bg.fillStyle(0x2a1f1a, 0.95);
    bg.fillRoundedRect(0, 0, width, height, height / 4);
    bg.lineStyle(1, 0x8b7355, 0.5);
    bg.strokeRoundedRect(0, 0, width, height, height / 4);
    container.add(bg);
    
    // Fill
    const fill = scene.add.graphics();
    const fillWidth = (value / maxValue) * (width - 4);
    fill.fillGradientStyle(
      Phaser.Display.Color.ValueToColor(color).brighten(15).color,
      Phaser.Display.Color.ValueToColor(color).brighten(15).color,
      color,
      color,
      1,
      1,
      1,
      1
    );
    fill.fillRoundedRect(2, 2, Math.max(0, fillWidth), height - 4, (height - 4) / 4);
    fill.fillStyle(0xffffff, 0.1);
    fill.fillRoundedRect(2, 2, Math.max(0, fillWidth), Math.max(2, (height - 4) * 0.4), (height - 4) / 4);
    container.add(fill);
    
    return container;
  }

  /**
   * Create a panel background
   */
  static createPanel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Graphics {
    const panel = scene.add.graphics();
    
    // Main fill
    panel.fillStyle(0x000000, 0.3);
    panel.fillRoundedRect(x + 3, y + 5, width, height, 10);

    panel.fillGradientStyle(0x31241c, 0x31241c, 0x1f1712, 0x1f1712, 0.95, 0.95, 0.95, 0.95);
    panel.fillRoundedRect(x, y, width, height, 10);
    
    // Border
    panel.lineStyle(2, 0x7a613f, 0.95);
    panel.strokeRoundedRect(x, y, width, height, 10);
    
    // Inner border (decorative)
    panel.lineStyle(1, 0xa58554, 0.25);
    panel.strokeRoundedRect(x + 5, y + 5, width - 10, height - 10, 8);

    panel.lineStyle(1, 0x000000, 0.35);
    panel.strokeRoundedRect(x + 1, y + 1, width - 2, height - 2, 10);
    
    return panel;
  }

  /**
   * Create a decorative divider
   */
  static createDivider(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number
  ): Phaser.GameObjects.Graphics {
    const divider = scene.add.graphics();
    
    divider.lineStyle(1, 0x5a4a3a, 0.5);
    divider.moveTo(x - width / 2, y);
    divider.lineTo(x + width / 2, y);
    divider.strokePath();
    
    // Center dot
    divider.fillStyle(0xc9a959, 0.5);
    divider.fillCircle(x, y, 3);
    
    return divider;
  }

  private static getButtonPalette(primary: boolean, hovered: boolean): ButtonVisualPalette {
    if (primary) {
      return hovered
        ? {
          fillTop: 0x6d5433,
          fillBottom: 0x4d3820,
          strokeOuter: 0xe6c574,
          strokeInner: 0xb88940,
          text: '#f2d895',
          glow: 0xdcb162
        }
        : {
          fillTop: 0x5a4329,
          fillBottom: 0x3f2d1c,
          strokeOuter: 0xc9a959,
          strokeInner: 0x8b6b34,
          text: '#d4b978',
          glow: 0xc9a959
        };
    }

    return hovered
      ? {
        fillTop: 0x46362d,
        fillBottom: 0x2f241e,
        strokeOuter: 0xbaa067,
        strokeInner: 0x7b6444,
        text: '#c9a959',
        glow: 0x9a7a4f
      }
      : {
        fillTop: 0x3b2f29,
        fillBottom: 0x291f1b,
        strokeOuter: 0x6f5a46,
        strokeInner: 0x45352a,
        text: '#9d8464',
        glow: 0x68533d
      };
  }

  private static drawButtonState(
    bg: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    palette: ButtonVisualPalette
  ): void {
    bg.clear();
    bg.fillGradientStyle(
      palette.fillTop,
      palette.fillTop,
      palette.fillBottom,
      palette.fillBottom,
      1,
      1,
      1,
      1
    );
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(2, palette.strokeOuter, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(1, palette.strokeInner, 0.9);
    bg.strokeRoundedRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4, 7);
  }
}
