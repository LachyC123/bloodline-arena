/**
 * RelicChoiceScene - Brotato-style relic selection
 * Dramatic reveal of 3 relics to choose from
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { getRelicChoices, Relic } from '../data/RelicsData';
import { RelicCard } from '../ui/RelicCard';
import { UIHelper } from '../ui/UIHelper';

export class RelicChoiceScene extends Phaser.Scene {
  private relicChoices: Relic[] = [];
  private relicCards: RelicCard[] = [];
  private selectedRelic?: Relic;

  constructor() {
    super({ key: 'RelicChoiceScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    
    // Get 3 relic choices (excluding already owned)
    this.relicChoices = getRelicChoices(3, run.relics);
    
    this.createBackground();
    this.createHeader();
    this.revealRelics();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Mysterious dark background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0815, 0x0a0815, 0x1a1025, 0x1a1025);
    bg.fillRect(0, 0, width, height);
    
    // Mystical particles
    for (let i = 0; i < 50; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x9932cc, Math.random() * 0.3);
      particle.fillCircle(0, 0, 2);
      particle.setPosition(
        Math.random() * width,
        Math.random() * height
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
    
    // Vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.5);
    vignette.fillRect(0, 0, width, 60);
    vignette.fillRect(0, height - 60, width, 60);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    // Title with glow effect
    const title = this.add.text(width / 2, 50, 'CHOOSE A RELIC', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Pulsing glow
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.8 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    this.add.text(width / 2, 85, 'A mysterious power calls to you...', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private async revealRelics(): Promise<void> {
    const { width, height } = this.cameras.main;
    const spacing = 200;
    const startX = width / 2 - spacing;
    
    // Create cards (hidden)
    for (let i = 0; i < this.relicChoices.length; i++) {
      const relic = this.relicChoices[i];
      const x = startX + i * spacing;
      
      const card = new RelicCard(this, x, height / 2, relic, () => {
        this.selectRelic(relic, i);
      });
      
      card.setScale(1, 0); // Start hidden
      this.relicCards.push(card);
    }
    
    // Dramatic reveal sequence
    await this.playRevealSequence();
  }

  private async playRevealSequence(): Promise<void> {
    // Flash effect
    this.cameras.main.flash(200, 150, 100, 200);
    
    // Reveal cards one by one
    for (let i = 0; i < this.relicCards.length; i++) {
      await this.delay(300);
      await this.relicCards[i].reveal();
    }
    
    // Show skip button
    this.time.delayedCall(500, () => {
      this.createSkipButton();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  private createSkipButton(): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.createButton(this, width / 2, height - 50,
      'SKIP (No Relic)', () => this.skipRelic(),
      { width: 150, height: 40, fontSize: '11px' }
    );
  }

  private selectRelic(relic: Relic, index: number): void {
    if (this.selectedRelic) return;
    this.selectedRelic = relic;
    
    // Fade out unselected cards
    this.relicCards.forEach((card, i) => {
      if (i !== index) {
        this.tweens.add({
          targets: card,
          alpha: 0,
          y: card.y + 50,
          duration: 300
        });
      }
    });
    
    // Add relic to run
    SaveSystem.addRelic(relic.id);
    
    // Show acquisition effect
    this.time.delayedCall(500, () => {
      this.showAcquisitionEffect(relic);
    });
  }

  private showAcquisitionEffect(relic: Relic): void {
    const { width, height } = this.cameras.main;
    
    // Big icon in center
    const icon = this.add.text(width / 2, height / 2, relic.icon, {
      fontSize: '64px'
    }).setOrigin(0.5);
    
    icon.setScale(0);
    
    this.tweens.add({
      targets: icon,
      scale: 2,
      duration: 500,
      ease: 'Back.out'
    });
    
    // Relic name
    const name = this.add.text(width / 2, height / 2 + 80, relic.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    name.setAlpha(0);
    this.tweens.add({
      targets: name,
      alpha: 1,
      duration: 300,
      delay: 300
    });
    
    // Continue after delay
    this.time.delayedCall(1500, () => {
      this.returnToCamp();
    });
  }

  private skipRelic(): void {
    UIHelper.showConfirmDialog(this,
      'Skip Relic?',
      'Are you sure you want to pass on this opportunity?',
      () => this.returnToCamp(),
      () => {},
      'YES, SKIP'
    );
  }

  private returnToCamp(): void {
    // Reset pity counter on choice
    SaveSystem.updateRun({ fightsSinceRelic: 0 });
    
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
