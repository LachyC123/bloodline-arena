/**
 * VignetteScene - Narrative choice encounters
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust, applyInjury, healInjuries } from '../systems/FighterSystem';
import { RNG } from '../systems/RNGSystem';
import { VIGNETTES_DATA, Vignette, VignetteChoice } from '../data/VignettesData';
import { UIHelper } from '../ui/UIHelper';

interface VignetteSceneData {
  type?: 'camp' | 'offer' | 'letter' | 'event';
  specificVignette?: string;
}

export class VignetteScene extends Phaser.Scene {
  private vignette!: Vignette;
  private fighter!: Fighter;
  private resultText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'VignetteScene' });
  }

  init(data: VignetteSceneData): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    this.fighter = run.fighter;
    
    // Select appropriate vignette
    if (data.specificVignette) {
      this.vignette = VIGNETTES_DATA.find(v => v.id === data.specificVignette)!;
    } else {
      this.vignette = this.selectRandomVignette(data.type || 'camp');
    }
  }

  private selectRandomVignette(type: string): Vignette {
    const run = SaveSystem.getRun();
    const completedIds = run.completedVignettes;
    
    // Filter by type and requirements
    const available = VIGNETTES_DATA.filter(v => {
      if (v.category !== type) return false;
      if (completedIds.includes(v.id)) return false;
      
      if (v.requirements) {
        if (v.requirements.minWeek && run.week < v.requirements.minWeek) return false;
        if (v.requirements.minTrust && this.fighter.trust < v.requirements.minTrust) return false;
        if (v.requirements.maxTrust && this.fighter.trust > v.requirements.maxTrust) return false;
        if (v.requirements.hasInjury && this.fighter.injuries.length === 0) return false;
      }
      
      return true;
    });
    
    if (available.length === 0) {
      // Fallback to any vignette of the type
      const fallback = VIGNETTES_DATA.filter(v => v.category === type);
      return RNG.pick(fallback);
    }
    
    return RNG.pick(available);
  }

  create(): void {
    this.createBackground();
    this.createVignetteContent();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
    
    if (this.textures.exists('parchment_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'parchment_overlay');
      overlay.setAlpha(0.1);
      overlay.setDisplaySize(width, height);
    }
  }

  private createVignetteContent(): void {
    const { width, height } = this.cameras.main;
    
    // Title
    this.add.text(width / 2, 50, this.vignette.title, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Category indicator
    const categoryIcons: Record<string, string> = {
      camp: '🏕️',
      offer: '💀',
      letter: '✉️',
      event: '❓'
    };
    this.add.text(width / 2, 80, categoryIcons[this.vignette.category] || '📜', {
      fontSize: '20px'
    }).setOrigin(0.5);
    
    // Description
    this.add.text(width / 2, 150, this.vignette.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959',
      wordWrap: { width: 320 },
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    
    // Choices
    const choiceStartY = 280;
    const choiceSpacing = 90;
    
    this.vignette.choices.forEach((choice, i) => {
      this.createChoiceButton(choice, width / 2, choiceStartY + i * choiceSpacing);
    });
    
    // Result text (initially hidden)
    this.resultText = this.add.text(width / 2, height - 150, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#8b7355',
      fontStyle: 'italic',
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);
  }

  private createChoiceButton(choice: VignetteChoice, x: number, y: number): void {
    const container = this.add.container(x, y);
    const buttonWidth = 320;
    const buttonHeight = 70;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    container.add(bg);
    
    // Choice text
    const text = this.add.text(0, -10, choice.text, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#c9a959',
      wordWrap: { width: buttonWidth - 30 },
      align: 'center'
    }).setOrigin(0.5);
    container.add(text);
    
    // Effect preview
    const effectParts: string[] = [];
    if (choice.effects.trust) {
      const sign = choice.effects.trust > 0 ? '+' : '';
      effectParts.push(`${sign}${choice.effects.trust} Trust`);
    }
    if (choice.effects.gold) {
      const sign = choice.effects.gold > 0 ? '+' : '';
      effectParts.push(`${sign}${choice.effects.gold} Gold`);
    }
    if (choice.effects.hp) {
      const sign = choice.effects.hp > 0 ? '+' : '';
      effectParts.push(`${sign}${choice.effects.hp} HP`);
    }
    if (choice.effects.injury) {
      effectParts.push(`Risk: ${choice.effects.injury} injury`);
    }
    if (choice.effects.injuryHeal) {
      effectParts.push(`Heal ${choice.effects.injuryHeal} week(s)`);
    }
    
    if (effectParts.length > 0) {
      const effectText = this.add.text(0, 18, effectParts.join(' | '), {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#6b8e23'
      }).setOrigin(0.5);
      container.add(effectText);
    }
    
    // Interactive
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a2f2a, 1);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0xc9a959, 1);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    });
    
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a1f1a, 1);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0x5a4a3a, 1);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
    });
    
    bg.on('pointerdown', () => {
      this.selectChoice(choice);
      container.setVisible(false);
    });
  }

  private selectChoice(choice: VignetteChoice): void {
    const run = SaveSystem.getRun();
    
    // Apply effects
    if (choice.effects.trust) {
      addTrust(this.fighter, choice.effects.trust);
    }
    if (choice.effects.gold) {
      run.gold += choice.effects.gold;
    }
    if (choice.effects.hp) {
      this.fighter.currentStats.currentHP = Math.max(1, 
        Math.min(this.fighter.currentStats.maxHP, this.fighter.currentStats.currentHP + choice.effects.hp)
      );
    }
    if (choice.effects.stamina) {
      this.fighter.currentStats.currentStamina = Math.max(0,
        Math.min(this.fighter.currentStats.maxStamina, this.fighter.currentStats.currentStamina + choice.effects.stamina)
      );
    }
    if (choice.effects.injuryHeal) {
      healInjuries(this.fighter, choice.effects.injuryHeal);
    }
    
    // Mark vignette as completed
    if (!run.completedVignettes.includes(this.vignette.id)) {
      run.completedVignettes.push(this.vignette.id);
    }
    
    // Handle letter writing specially
    if (this.vignette.category === 'letter') {
      const letterContent = `Week ${run.week + 1}: ${choice.resultText}`;
      this.fighter.lettersWritten.push(letterContent);
      run.lettersWritten.push(letterContent);
    }
    
    // Save
    SaveSystem.updateRun({
      fighter: this.fighter,
      gold: run.gold,
      completedVignettes: run.completedVignettes,
      lettersWritten: run.lettersWritten
    });
    
    // Show result
    this.showResult(choice.resultText);
  }

  private showResult(resultText: string): void {
    const { width, height } = this.cameras.main;
    
    // Fade out choices area
    this.tweens.add({
      targets: this.children.getAll().filter((c: any) => c.y > 200 && c.y < 600),
      alpha: 0,
      duration: 300
    });
    
    // Show result text
    this.resultText.setText(resultText);
    this.resultText.setAlpha(0);
    
    this.tweens.add({
      targets: this.resultText,
      alpha: 1,
      duration: 500,
      delay: 300
    });
    
    // Add continue button
    this.time.delayedCall(800, () => {
      UIHelper.createButton(
        this,
        width / 2,
        height - 70,
        'CONTINUE',
        () => this.returnToCamp(),
        { width: 180, height: 45, primary: true }
      );
    });
  }

  private returnToCamp(): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
