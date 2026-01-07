/**
 * SettingsScene - Game settings and options
 */

import Phaser from 'phaser';
import { SaveSystem, GameSettings } from '../systems/SaveSystem';
import { UIHelper } from '../ui/UIHelper';

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private toggleButtons: Map<string, Phaser.GameObjects.Container> = new Map();
  
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    this.settings = SaveSystem.getSettings();
    
    this.createBackground();
    this.createHeader();
    this.createSettingsList();
    this.createResetButton();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 40, 'SETTINGS', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  private createSettingsList(): void {
    const { width } = this.cameras.main;
    const startY = 100;
    const spacing = 60;
    
    // Visual settings
    this.add.text(width / 2, startY, '─── VISUAL ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    this.createToggle('reduceMotion', 'Reduce Motion', 'Minimize animations and particles', startY + 40);
    this.createToggle('screenShake', 'Screen Shake', 'Enable impact screen shake', startY + 100);
    this.createToggle('bloodFX', 'Blood Effects', 'Show blood during combat', startY + 160);
    this.createToggle('grainFX', 'Grain/Ink FX', 'Atmospheric visual overlay', startY + 220);
    
    // Audio settings
    this.add.text(width / 2, startY + 290, '─── AUDIO ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    this.createToggle('soundEnabled', 'Sound Enabled', 'Enable all game audio', startY + 330);
    
    // Note about audio
    this.add.text(width / 2, startY + 390, '(Audio features coming soon)', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private createToggle(
    key: keyof GameSettings,
    label: string,
    description: string,
    y: number
  ): void {
    const { width } = this.cameras.main;
    
    // Label
    this.add.text(30, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#c9a959'
    });
    
    // Description
    this.add.text(30, y + 20, description, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    });
    
    // Toggle button
    const isOn = Boolean(this.settings[key]);
    const toggle = this.createToggleButton(width - 80, y + 10, isOn, (newValue) => {
      (this.settings as any)[key] = newValue;
      SaveSystem.updateSettings({ [key]: newValue });
    });
    
    this.toggleButtons.set(key, toggle);
  }

  private createToggleButton(
    x: number,
    y: number,
    initialState: boolean,
    onChange: (value: boolean) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    let isOn = initialState;
    
    const width = 60;
    const height = 28;
    
    // Track background
    const track = this.add.graphics();
    const updateTrack = () => {
      track.clear();
      track.fillStyle(isOn ? 0x2e8b57 : 0x3a2a1a, 1);
      track.fillRoundedRect(0, 0, width, height, height / 2);
      track.lineStyle(1, isOn ? 0x6b8e23 : 0x5a4a3a, 1);
      track.strokeRoundedRect(0, 0, width, height, height / 2);
    };
    updateTrack();
    container.add(track);
    
    // Knob
    const knobSize = height - 6;
    const knob = this.add.graphics();
    const updateKnob = () => {
      const knobX = isOn ? width - knobSize - 3 : 3;
      knob.clear();
      knob.fillStyle(isOn ? 0xffffff : 0x8b7355, 1);
      knob.fillCircle(knobX + knobSize / 2, height / 2, knobSize / 2);
    };
    updateKnob();
    container.add(knob);
    
    // Interactive
    track.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    track.on('pointerdown', () => {
      isOn = !isOn;
      updateTrack();
      updateKnob();
      onChange(isOn);
    });
    
    return container;
  }

  private createResetButton(): void {
    const { width, height } = this.cameras.main;
    
    // Warning text
    this.add.text(width / 2, height - 150, '─── DANGER ZONE ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b0000'
    }).setOrigin(0.5);
    
    // Reset button
    const resetBtn = UIHelper.createButton(
      this,
      width / 2,
      height - 110,
      '🗑️ RESET ALL DATA',
      () => this.showResetConfirmation(),
      { width: 200, height: 45 }
    );
    
    // Style it as dangerous
    const bg = resetBtn.first as Phaser.GameObjects.Graphics;
    bg.clear();
    bg.fillStyle(0x3a1a1a, 1);
    bg.fillRoundedRect(-100, -22.5, 200, 45, 8);
    bg.lineStyle(2, 0x8b0000, 1);
    bg.strokeRoundedRect(-100, -22.5, 200, 45, 8);
  }

  private showResetConfirmation(): void {
    UIHelper.showConfirmDialog(
      this,
      'Reset All Data?',
      'This will DELETE all save data including:\n• All fighters\n• Hall of Legends\n• Bloodline Perks\n• Settings\n\nThis CANNOT be undone!',
      () => this.performReset(),
      () => {},
      'HOLD TO CONFIRM'
    );
  }

  private performReset(): void {
    SaveSystem.resetAllData();
    UIHelper.showNotification(this, 'All data has been reset');
    
    // Return to fresh menu
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  private createBackButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(
      this,
      width / 2,
      height - 50,
      '← BACK TO MENU',
      () => this.returnToMenu(),
      { width: 180, height: 45 }
    );
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
