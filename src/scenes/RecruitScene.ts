/**
 * RecruitScene - Fighter recruitment screen
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { generateFighter, Fighter, calculateEffectiveStats } from '../systems/FighterSystem';
import { RNG } from '../systems/RNGSystem';
import { getBloodlineStatBonuses } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';
import { PortraitRenderer } from '../ui/PortraitRenderer';

export class RecruitScene extends Phaser.Scene {
  private candidates: Fighter[] = [];
  private selectedIndex: number = -1;
  private candidateContainers: Phaser.GameObjects.Container[] = [];
  private detailsContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'RecruitScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    RNG.init(run.seed);
    
    // Generate 3 candidates
    const meta = SaveSystem.getMeta();
    this.candidates = [
      generateFighter(meta.promoterLevel),
      generateFighter(meta.promoterLevel),
      generateFighter(meta.promoterLevel)
    ];
    
    // Apply bloodline bonuses
    const bloodlineBonus = getBloodlineStatBonuses();
    for (const fighter of this.candidates) {
      for (const [stat, value] of Object.entries(bloodlineBonus)) {
        if (typeof value === 'number' && stat in fighter.baseStats) {
          (fighter.baseStats as any)[stat] += value;
        }
      }
      fighter.currentStats = calculateEffectiveStats(fighter);
    }
    
    this.createBackground();
    this.createHeader();
    this.createCandidateCards();
    this.createDetailsPanel();
    this.createConfirmButton();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    // Parchment overlay
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.08);
      overlay.setDisplaySize(width, height);
    }
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 40, 'CHOOSE YOUR FIGHTER', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 70, 'Three souls await judgment. Only one will enter the arena.', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private createCandidateCards(): void {
    const { width } = this.cameras.main;
    const cardWidth = 110;
    const startX = width / 2 - cardWidth * 1.5;
    const y = 180;
    
    this.candidates.forEach((fighter, index) => {
      const container = this.createCandidateCard(fighter, startX + index * (cardWidth + 10), y, index);
      this.candidateContainers.push(container);
    });
  }

  private createCandidateCard(fighter: Fighter, x: number, y: number, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const cardWidth = 110;
    const cardHeight = 200;
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
    container.add(bg);
    
    // Portrait
    const portrait = PortraitRenderer.renderMiniPortrait(this, fighter.portrait, cardWidth / 2, 50, 60);
    container.add(portrait);
    
    // Name
    const name = this.add.text(cardWidth / 2, 95, fighter.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    container.add(name);
    
    // Nickname
    const nickname = this.add.text(cardWidth / 2, 112, `"${fighter.nickname}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    container.add(nickname);
    
    // Age
    const age = this.add.text(cardWidth / 2, 130, `Age ${fighter.age}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    container.add(age);
    
    // Signature trait (brief)
    const trait = this.add.text(cardWidth / 2, 155, fighter.signatureTrait.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    container.add(trait);
    
    // Flaw (brief)
    if (fighter.flaws.length > 0) {
      const flaw = this.add.text(cardWidth / 2, 175, fighter.flaws[0].name, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#8b4513'
      }).setOrigin(0.5);
      container.add(flaw);
    }
    
    // Interactive hit area
    const hitArea = this.add.rectangle(cardWidth / 2, cardHeight / 2, cardWidth, cardHeight, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      if (this.selectedIndex !== index) {
        bg.clear();
        bg.fillStyle(0x3a2f2a, 1);
        bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
        bg.lineStyle(2, 0x8b7355, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
      }
    });
    
    hitArea.on('pointerout', () => {
      if (this.selectedIndex !== index) {
        bg.clear();
        bg.fillStyle(0x2a1f1a, 1);
        bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 8);
        bg.lineStyle(2, 0x5a4a3a, 1);
        bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 8);
      }
    });
    
    hitArea.on('pointerdown', () => {
      this.selectCandidate(index);
    });
    
    return container;
  }

  private createDetailsPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.detailsContainer = this.add.container(width / 2, 400);
    
    // Placeholder text
    const placeholder = this.add.text(0, 0, 'Select a fighter to view details', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.detailsContainer.add(placeholder);
  }

  private updateDetailsPanel(fighter: Fighter): void {
    this.detailsContainer.removeAll(true);
    
    const startY = -100;
    
    // Full name
    const fullName = this.add.text(0, startY, fighter.fullName, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailsContainer.add(fullName);
    
    // Backstory
    const backstory = this.add.text(0, startY + 30, fighter.backstory, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      fontStyle: 'italic',
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);
    this.detailsContainer.add(backstory);
    
    // Stats
    const stats = fighter.currentStats;
    const statsText = `HP: ${stats.maxHP} | ATK: ${stats.attack} | DEF: ${stats.defense} | SPD: ${stats.speed}`;
    const statsDisplay = this.add.text(0, startY + 80, statsText, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailsContainer.add(statsDisplay);
    
    // Signature trait description
    const traitTitle = this.add.text(0, startY + 110, `Signature: ${fighter.signatureTrait.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    this.detailsContainer.add(traitTitle);
    
    const traitDesc = this.add.text(0, startY + 130, fighter.signatureTrait.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a',
      wordWrap: { width: 280 },
      align: 'center'
    }).setOrigin(0.5);
    this.detailsContainer.add(traitDesc);
    
    // Flaw
    if (fighter.flaws.length > 0) {
      const flawTitle = this.add.text(0, startY + 165, `Flaw: ${fighter.flaws[0].name}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#8b4513'
      }).setOrigin(0.5);
      this.detailsContainer.add(flawTitle);
      
      const flawDesc = this.add.text(0, startY + 183, fighter.flaws[0].description, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#5a4a3a'
      }).setOrigin(0.5);
      this.detailsContainer.add(flawDesc);
    }
    
    // Keepsake
    const keepsakeTitle = this.add.text(0, startY + 215, `Keepsake: ${fighter.keepsake.name}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailsContainer.add(keepsakeTitle);
    
    const keepsakeEffect = this.add.text(0, startY + 233, fighter.keepsake.effect, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    }).setOrigin(0.5);
    this.detailsContainer.add(keepsakeEffect);
  }

  private selectCandidate(index: number): void {
    // Deselect previous
    if (this.selectedIndex >= 0) {
      const prevContainer = this.candidateContainers[this.selectedIndex];
      const prevBg = prevContainer.first as Phaser.GameObjects.Graphics;
      prevBg.clear();
      prevBg.fillStyle(0x2a1f1a, 1);
      prevBg.fillRoundedRect(0, 0, 110, 200, 8);
      prevBg.lineStyle(2, 0x5a4a3a, 1);
      prevBg.strokeRoundedRect(0, 0, 110, 200, 8);
    }
    
    this.selectedIndex = index;
    
    // Highlight selected
    const container = this.candidateContainers[index];
    const bg = container.first as Phaser.GameObjects.Graphics;
    bg.clear();
    bg.fillStyle(0x3a2f2a, 1);
    bg.fillRoundedRect(0, 0, 110, 200, 8);
    bg.lineStyle(3, 0xc9a959, 1);
    bg.strokeRoundedRect(0, 0, 110, 200, 8);
    
    // Update details
    this.updateDetailsPanel(this.candidates[index]);
  }

  private createConfirmButton(): void {
    const { width, height } = this.cameras.main;
    
    const btn = UIHelper.createButton(
      this,
      width / 2,
      height - 60,
      'RECRUIT THIS FIGHTER',
      () => this.confirmSelection(),
      { width: 240, height: 50, primary: true }
    );
    
    // Initially disabled until selection
    btn.setAlpha(0.5);
    
    // Enable when selected
    this.events.on('update', () => {
      if (this.selectedIndex >= 0) {
        btn.setAlpha(1);
      }
    });
  }

  private confirmSelection(): void {
    if (this.selectedIndex < 0) return;
    
    const fighter = this.candidates[this.selectedIndex];
    
    // Save fighter to run
    const run = SaveSystem.getRun();
    run.fighter = fighter;
    SaveSystem.updateRun(run);
    
    // Transition to promise scene
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PromiseScene');
    });
  }
}
