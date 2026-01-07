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
    
    // Background
    const bg = scene.add.graphics();
    const fillColor = primary ? 0x4a3a2a : 0x2a1f1a;
    const strokeColor = primary ? 0xc9a959 : 0x5a4a3a;
    
    bg.fillStyle(fillColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(2, strokeColor, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);
    
    // Text
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: fontSize,
      color: primary ? '#c9a959' : '#8b7355'
    }).setOrigin(0.5);
    container.add(label);
    
    // Interactive
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(fillColor + 0x111111, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
      bg.lineStyle(2, 0xc9a959, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
      label.setColor('#c9a959');
    });
    
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(fillColor, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
      bg.lineStyle(2, strokeColor, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
      label.setColor(primary ? '#c9a959' : '#8b7355');
    });
    
    bg.on('pointerdown', () => {
      // Quick press animation
      scene.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
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
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, width, height, height / 4);
    container.add(bg);
    
    // Fill
    const fill = scene.add.graphics();
    const fillWidth = (value / maxValue) * (width - 4);
    fill.fillStyle(color, 1);
    fill.fillRoundedRect(2, 2, Math.max(0, fillWidth), height - 4, (height - 4) / 4);
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
    panel.fillStyle(0x2a1f1a, 0.95);
    panel.fillRoundedRect(x, y, width, height, 10);
    
    // Border
    panel.lineStyle(2, 0x5a4a3a, 1);
    panel.strokeRoundedRect(x, y, width, height, 10);
    
    // Inner border (decorative)
    panel.lineStyle(1, 0x3a2a1a, 0.5);
    panel.strokeRoundedRect(x + 5, y + 5, width - 10, height - 10, 8);
    
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
}
