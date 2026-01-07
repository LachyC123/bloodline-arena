/**
 * HallOfLegendsScene - View fallen and retired fighters
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { LegendEntry } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';

export class HallOfLegendsScene extends Phaser.Scene {
  private legends: LegendEntry[] = [];
  private scrollOffset: number = 0;
  private selectedLegend: LegendEntry | null = null;
  private detailsContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'HallOfLegendsScene' });
  }

  create(): void {
    this.legends = SaveSystem.getHallOfLegends();
    
    this.createBackground();
    this.createHeader();
    this.createLegendList();
    this.createDetailsPanel();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0806, 0x0a0806, 0x1a1410, 0x1a1410);
    bg.fillRect(0, 0, width, height);
    
    // Atmospheric overlay
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.05);
      overlay.setDisplaySize(width, height);
    }
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 35, 'HALL OF LEGENDS', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 65, 'Those who fought and fell...', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Stats
    const dead = this.legends.filter(l => l.status === 'dead').length;
    const retired = this.legends.filter(l => l.status === 'retired').length;
    const champions = this.legends.filter(l => l.status === 'champion').length;
    
    this.add.text(width / 2, 85, `☠️ ${dead}  |  🏛️ ${retired}  |  🏆 ${champions}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
  }

  private createLegendList(): void {
    const { width, height } = this.cameras.main;
    
    if (this.legends.length === 0) {
      this.add.text(width / 2, 200, 'No legends yet...\n\nYour fighters will be remembered here.', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5a4a3a',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }
    
    const startY = 110;
    const cardHeight = 70;
    const cardWidth = width - 40;
    
    // Sort by date (most recent first)
    const sorted = [...this.legends].sort((a, b) => b.dateAdded - a.dateAdded);
    
    sorted.slice(0, 5).forEach((legend, i) => {
      this.createLegendCard(legend, 20, startY + i * (cardHeight + 10), cardWidth, cardHeight);
    });
    
    if (sorted.length > 5) {
      this.add.text(width / 2, startY + 5 * (cardHeight + 10) + 10, `...and ${sorted.length - 5} more`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
    }
  }

  private createLegendCard(legend: LegendEntry, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    const statusColor = legend.status === 'champion' ? 0x2a2a10 : 
                        legend.status === 'retired' ? 0x1a2a1a : 0x2a1a1a;
    bg.fillStyle(statusColor, 1);
    bg.fillRoundedRect(0, 0, w, h, 8);
    bg.lineStyle(1, 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, w, h, 8);
    container.add(bg);
    
    // Mini portrait
    const portrait = PortraitRenderer.renderMiniPortrait(this, legend.fighter.portrait, 35, h / 2, 40);
    container.add(portrait);
    
    // Name and nickname
    const name = this.add.text(70, 12, legend.fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c9a959'
    });
    container.add(name);
    
    // Status icon
    const statusIcon = legend.status === 'champion' ? '🏆' : 
                       legend.status === 'retired' ? '🏛️' : '☠️';
    const statusText = this.add.text(w - 15, 12, statusIcon, {
      fontSize: '16px'
    }).setOrigin(1, 0);
    container.add(statusText);
    
    // Stats line
    const statsLine = `${legend.leagueReached.toUpperCase()} | ${legend.wins} wins | ${legend.weeksSurvived} weeks`;
    const stats = this.add.text(70, 32, statsLine, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    });
    container.add(stats);
    
    // Cause/reason
    const reason = legend.status === 'dead' ? legend.causeOfDeath?.substring(0, 40) + '...' :
                   legend.status === 'retired' ? 'Retired with honor' : 'Became Champion!';
    const reasonText = this.add.text(70, 48, reason || '', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    });
    container.add(reasonText);
    
    // Make interactive
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', () => this.showDetails(legend));
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(statusColor + 0x111111, 1);
      bg.fillRoundedRect(0, 0, w, h, 8);
      bg.lineStyle(2, 0xc9a959, 1);
      bg.strokeRoundedRect(0, 0, w, h, 8);
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(statusColor, 1);
      bg.fillRoundedRect(0, 0, w, h, 8);
      bg.lineStyle(1, 0x5a4a3a, 1);
      bg.strokeRoundedRect(0, 0, w, h, 8);
    });
  }

  private createDetailsPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.detailsContainer = this.add.container(width / 2, 550);
    this.detailsContainer.setVisible(false);
    
    // Background panel
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1410, 0.95);
    panelBg.fillRoundedRect(-160, -100, 320, 200, 10);
    panelBg.lineStyle(2, 0xc9a959, 1);
    panelBg.strokeRoundedRect(-160, -100, 320, 200, 10);
    this.detailsContainer.add(panelBg);
  }

  private showDetails(legend: LegendEntry): void {
    this.selectedLegend = legend;
    this.detailsContainer.removeAll(true);
    
    // Rebuild details
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1410, 0.95);
    panelBg.fillRoundedRect(-160, -100, 320, 200, 10);
    panelBg.lineStyle(2, 0xc9a959, 1);
    panelBg.strokeRoundedRect(-160, -100, 320, 200, 10);
    this.detailsContainer.add(panelBg);
    
    // Name
    const name = this.add.text(0, -85, legend.fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailsContainer.add(name);
    
    // Signature trait
    const trait = this.add.text(0, -65, `✨ ${legend.fighter.signatureTrait}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    this.detailsContainer.add(trait);
    
    // Best win
    if (legend.bestWin) {
      const bestWin = this.add.text(0, -45, `Best Victory: ${legend.bestWin}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355'
      }).setOrigin(0.5);
      this.detailsContainer.add(bestWin);
    }
    
    // Letters written
    if (legend.lettersWritten.length > 0) {
      const letters = this.add.text(0, -25, `📜 ${legend.lettersWritten.length} letters written`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b7355'
      }).setOrigin(0.5);
      this.detailsContainer.add(letters);
    }
    
    // Player note
    if (legend.playerNote) {
      const note = this.add.text(0, 10, `"${legend.playerNote}"`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#c9a959',
        fontStyle: 'italic',
        wordWrap: { width: 280 },
        align: 'center'
      }).setOrigin(0.5);
      this.detailsContainer.add(note);
    }
    
    // Close button
    const closeBtn = UIHelper.createButton(
      this, 0, 70, 'CLOSE',
      () => this.detailsContainer.setVisible(false),
      { width: 80, height: 30, fontSize: '11px' }
    );
    this.detailsContainer.add(closeBtn);
    
    this.detailsContainer.setVisible(true);
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
