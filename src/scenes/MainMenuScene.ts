/**
 * MainMenuScene - Main menu with options
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { UIHelper } from '../ui/UIHelper';

export class MainMenuScene extends Phaser.Scene {
  private menuContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Create background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create menu buttons
    this.createMenu();
    
    // Create ambient effects
    this.createAmbientEffects();
    
    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Play ambient sound (if enabled)
    this.playAmbience();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    // Add parchment texture overlay
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.1);
      overlay.setDisplaySize(width, height);
    }
    
    // Add vignette
    if (this.textures.exists('vignette')) {
      const vignette = this.add.image(width / 2, height / 2, 'vignette');
      vignette.setDisplaySize(width, height);
      vignette.setAlpha(0.5);
    }
  }

  private createTitle(): void {
    const { width } = this.cameras.main;
    const centerX = width / 2;
    
    // Main title
    const title = this.add.text(centerX, 120, 'BLOODLINE', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(centerX, 175, 'ARENA', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#8b7355',
      stroke: '#000000',
      strokeThickness: 4,
      letterSpacing: 8
    }).setOrigin(0.5);
    
    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xc9a959, 0.5);
    line.moveTo(centerX - 100, 210);
    line.lineTo(centerX + 100, 210);
    line.strokePath();
    
    // Tagline
    this.add.text(centerX, 235, 'Blood. Honor. Legacy.', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private createMenu(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = 320;
    const spacing = 70;
    
    this.menuContainer = this.add.container(0, 0);
    
    const hasActiveRun = SaveSystem.hasActiveRun();
    
    // Continue button (if save exists)
    if (hasActiveRun) {
      const continueBtn = UIHelper.createButton(
        this,
        centerX,
        startY,
        'CONTINUE RUN',
        () => this.continueRun(),
        { width: 260, height: 55, primary: true }
      );
      this.menuContainer.add(continueBtn);
    }
    
    // New Run button
    const newRunY = hasActiveRun ? startY + spacing : startY;
    const newRunBtn = UIHelper.createButton(
      this,
      centerX,
      newRunY,
      hasActiveRun ? 'NEW RUN' : 'BEGIN YOUR LEGEND',
      () => this.startNewRun(),
      { width: 260, height: 55, primary: !hasActiveRun }
    );
    this.menuContainer.add(newRunBtn);
    
    // Hall of Legends
    const hallBtn = UIHelper.createButton(
      this,
      centerX,
      newRunY + spacing,
      'HALL OF LEGENDS',
      () => this.openHallOfLegends(),
      { width: 260, height: 55 }
    );
    this.menuContainer.add(hallBtn);
    
    // Bloodline Perks
    const perksBtn = UIHelper.createButton(
      this,
      centerX,
      newRunY + spacing * 2,
      'BLOODLINE PERKS',
      () => this.openBloodlinePerks(),
      { width: 260, height: 55 }
    );
    this.menuContainer.add(perksBtn);
    
    // Settings
    const settingsBtn = UIHelper.createButton(
      this,
      centerX,
      newRunY + spacing * 3,
      'SETTINGS',
      () => this.openSettings(),
      { width: 260, height: 55 }
    );
    this.menuContainer.add(settingsBtn);
    
    // Meta info at bottom
    const meta = SaveSystem.getMeta();
    const statsText = `Runs: ${meta.totalRuns} | Wins: ${meta.totalWins} | Deaths: ${meta.totalDeaths}`;
    this.add.text(centerX, height - 60, statsText, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    // Version
    this.add.text(centerX, height - 35, 'v1.0.0', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#3a3025'
    }).setOrigin(0.5);
  }

  private createAmbientEffects(): void {
    const { width, height } = this.cameras.main;
    const settings = SaveSystem.getSettings();
    
    if (settings.reduceMotion) return;
    
    // Floating dust particles (only if texture exists)
    if (this.textures.exists('particle')) {
      try {
        this.add.particles(0, 0, 'particle', {
          x: { min: 0, max: width },
          y: { min: 0, max: height },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.3, end: 0 },
          speed: { min: 10, max: 30 },
          angle: { min: -90, max: -90 },
          lifespan: 4000,
          frequency: 200,
          blendMode: 'ADD'
        });
      } catch (e) {
        console.warn('[MainMenu] Particle effect failed:', e);
      }
    }
    
    // Torch flicker effect (subtle brightness variation)
    this.tweens.add({
      targets: this.cameras.main,
      alpha: { from: 1, to: 0.95 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private playAmbience(): void {
    const settings = SaveSystem.getSettings();
    if (!settings.soundEnabled) return;
    
    // Would play ambient menu sound here
    // this.sound.play('menu_ambience', { loop: true, volume: settings.musicVolume });
  }

  private continueRun(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Resume at the run map (central hub)
      const run = SaveSystem.getRun();
      if (run.fighter) {
        // If we have a run map, go there; otherwise go to camp
        if (run.runMap) {
          this.scene.start('RunMapScene');
        } else {
          this.scene.start('CampScene');
        }
      } else {
        this.scene.start('CampScene');
      }
    });
  }

  private startNewRun(): void {
    const hasActiveRun = SaveSystem.hasActiveRun();
    
    if (hasActiveRun) {
      // Show confirmation dialog
      UIHelper.showConfirmDialog(
        this,
        'Abandon Current Run?',
        'Starting a new run will end your current fighter\'s journey. This cannot be undone.',
        () => {
          SaveSystem.endRun(false);
          this.beginNewRun();
        },
        () => {} // Cancel
      );
    } else {
      this.beginNewRun();
    }
  }

  private beginNewRun(): void {
    SaveSystem.startNewRun();
    
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RecruitScene');
    });
  }

  private openHallOfLegends(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('HallOfLegendsScene');
    });
  }

  private openBloodlinePerks(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BloodlinePerksScene');
    });
  }

  private openSettings(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('SettingsScene');
    });
  }
}
