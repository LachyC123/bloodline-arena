/**
 * DeathScene - Memorial and death screen
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { addToHallOfLegends, LegendEntry } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';

export class DeathScene extends Phaser.Scene {
  private fighter!: Fighter;
  private legendEntry!: LegendEntry;
  private playerNote: string = '';
  
  constructor() {
    super({ key: 'DeathScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.fighter = run.fighter;
    
    // Add to Hall of Legends
    this.legendEntry = addToHallOfLegends(
      this.fighter,
      'dead',
      run.league as any,
      run.promise || 'none',
      false // Promise broken on death
    );
    
    this.createBackground();
    this.createMemorial();
    this.createNoteInput();
    this.createButtons();
    
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark somber background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0806, 0x0a0806, 0x1a1410, 0x1a1410);
    bg.fillRect(0, 0, width, height);
    
    // Vignette effect
    if (this.textures.exists('vignette')) {
      const vignette = this.add.image(width / 2, height / 2, 'vignette');
      vignette.setDisplaySize(width, height);
      vignette.setAlpha(0.8);
    }
  }

  private createMemorial(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // Memorial card background
    const cardWidth = 320;
    const cardHeight = 500;
    const cardX = centerX - cardWidth / 2;
    const cardY = 40;
    
    const card = this.add.graphics();
    card.fillStyle(0x1a1410, 0.9);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
    card.lineStyle(3, 0x5a4a3a, 1);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
    
    // Decorative border
    card.lineStyle(1, 0x3a2a1a, 0.5);
    card.strokeRoundedRect(cardX + 8, cardY + 8, cardWidth - 16, cardHeight - 16, 8);
    
    // "IN MEMORIAM" header
    this.add.text(centerX, cardY + 30, 'IN MEMORIAM', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c9a959',
      letterSpacing: 4
    }).setOrigin(0.5);
    
    // Portrait with frame
    const portraitY = cardY + 100;
    PortraitRenderer.renderPortrait(this, this.fighter.portrait, centerX, portraitY, 80);
    
    // Name
    this.add.text(centerX, portraitY + 60, this.fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Age and birthplace
    this.add.text(centerX, portraitY + 82, `${this.fighter.age} winters • ${this.fighter.birthplace}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(0.5);
    
    // Cause of death
    if (this.fighter.causeOfDeath) {
      this.add.text(centerX, portraitY + 115, this.fighter.causeOfDeath, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#8b4513',
        fontStyle: 'italic',
        wordWrap: { width: 280 },
        align: 'center'
      }).setOrigin(0.5);
    }
    
    // Last words
    if (this.fighter.lastWords) {
      this.add.text(centerX, portraitY + 160, `"${this.fighter.lastWords}"`, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#8b7355',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
    
    // Stats section
    const statsY = portraitY + 200;
    
    this.add.text(centerX, statsY, '─── LEGACY ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    const stats = [
      `Victories: ${this.fighter.wins}`,
      `Weeks Survived: ${this.fighter.weeksSurvived}`,
      `Signature Moves: ${this.fighter.signatureMoveUses}`,
      `Perfect Parries: ${this.fighter.perfectParries}`,
      `Closest Call: ${this.fighter.closestCall} HP`
    ];
    
    stats.forEach((stat, i) => {
      this.add.text(centerX, statsY + 25 + i * 18, stat, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#8b7355'
      }).setOrigin(0.5);
    });
    
    // Promise status
    const run = SaveSystem.getRun();
    const promiseY = statsY + 120;
    const promiseStatus = 'Promise Broken';
    
    this.add.text(centerX, promiseY, `⚔️ ${promiseStatus}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b4513'
    }).setOrigin(0.5);
    
    // Keepsake
    this.add.text(centerX, promiseY + 25, `📿 ${this.fighter.keepsake.name} - Recovered`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#6b8e23'
    }).setOrigin(0.5);
  }

  private createNoteInput(): void {
    const { width, height } = this.cameras.main;
    
    // Note prompt
    this.add.text(width / 2, 570, 'Leave a note for the fallen:', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(0.5);
    
    // Simple text input area (visual only - actual input via prompt)
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x2a1f1a, 1);
    inputBg.fillRoundedRect(width / 2 - 140, 585, 280, 60, 6);
    inputBg.lineStyle(1, 0x5a4a3a, 1);
    inputBg.strokeRoundedRect(width / 2 - 140, 585, 280, 60, 6);
    
    const noteText = this.add.text(width / 2, 615, 'Tap to add note...', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Make tappable
    inputBg.setInteractive(new Phaser.Geom.Rectangle(width / 2 - 140, 585, 280, 60), Phaser.Geom.Rectangle.Contains);
    inputBg.on('pointerdown', () => {
      const note = prompt('Write a note for the fallen:');
      if (note) {
        this.playerNote = note;
        this.legendEntry.playerNote = note;
        noteText.setText(note.substring(0, 40) + (note.length > 40 ? '...' : ''));
        noteText.setColor('#c9a959');
        noteText.setFontStyle('normal');
        
        // Update in save
        const hall = SaveSystem.getHallOfLegends();
        const entry = hall.find(e => e.id === this.legendEntry.id);
        if (entry) {
          entry.playerNote = note;
          SaveSystem.updateMeta({ hallOfLegends: hall });
        }
      }
    });
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    
    // Return to menu
    UIHelper.createButton(
      this,
      width / 2,
      height - 60,
      'RETURN TO MENU',
      () => this.returnToMenu(),
      { width: 200, height: 50, primary: true }
    );
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
