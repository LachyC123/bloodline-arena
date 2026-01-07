/**
 * LetterScene - Interactive letter writing with real value
 * Features quill animation, wax seal, and meaningful rewards
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter } from '../systems/FighterSystem';
import { 
  LETTER_TYPES, 
  LetterTemplate, 
  generateLetterContent,
  calculateLetterEffects,
  WrittenLetter,
  LetterEffect
} from '../data/LettersData';
import { UIHelper } from '../ui/UIHelper';
import { ChoiceCard, ChoiceEffect } from '../ui/ChoiceCard';

export class LetterScene extends Phaser.Scene {
  private fighter!: Fighter;
  private selectedTemplate?: LetterTemplate;
  private letterContent?: string;
  private effects: LetterEffect[] = [];
  private phase: 'select' | 'write' | 'seal' | 'result' = 'select';
  
  private quillSprite?: Phaser.GameObjects.Graphics;
  private parchmentGroup?: Phaser.GameObjects.Container;
  private letterTextObj?: Phaser.GameObjects.Text;
  private waxSeal?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'LetterScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.fighter = run.fighter;
    this.phase = 'select';
    
    this.createBackground();
    this.showLetterTypeSelection();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark ambient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x0f0a05, 0x0f0a05);
    bg.fillRect(0, 0, width, height);
    
    // Candlelight flicker (subtle)
    const light = this.add.graphics();
    light.fillStyle(0xffa500, 0.1);
    light.fillCircle(width * 0.8, height * 0.2, 100);
    
    this.tweens.add({
      targets: light,
      alpha: { from: 0.1, to: 0.15 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });
    
    // Title
    this.add.text(width / 2, 40, 'WRITE A LETTER', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 65, 'Choose your words carefully...', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Back button
    UIHelper.createButton(this, 50, 35, '← BACK', () => this.goBack(), {
      width: 80, height: 35, fontSize: '11px'
    });
  }

  private showLetterTypeSelection(): void {
    const { width, height } = this.cameras.main;
    
    const container = this.add.container(0, 0);
    container.setData('phase', 'select');
    
    const startY = 120;
    const spacing = 100;
    
    LETTER_TYPES.forEach((template, index) => {
      const y = startY + (index * spacing);
      
      // Create choice card for each letter type
      const effects: ChoiceEffect[] = template.guaranteedEffects.map(e => ({
        type: e.type,
        value: e.value,
        isPositive: e.value > 0 || ['letter_stamp', 'status_cure', 'injury_heal'].includes(e.type),
        description: e.description
      }));
      
      // Add chance indicators
      if (template.positiveChance > 0) {
        effects.push({
          type: 'chance',
          value: Math.round(template.positiveChance * 100),
          isPositive: true,
          description: `${Math.round(template.positiveChance * 100)}%: ${template.positiveEffect.description}`
        });
      }
      
      const card = new ChoiceCard(this, width / 2, y, {
        id: template.id,
        text: `${template.icon} ${template.name}`,
        effects: effects.slice(0, 3),
        riskLevel: template.negativeChance > 0.2 ? 'risky' : 'safe',
        icon: template.icon
      }, () => this.selectLetterType(template));
      
      // Add description tooltip
      const desc = this.add.text(width / 2, y + 55, template.description, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#6a5a4a',
        align: 'center'
      }).setOrigin(0.5);
      
      container.add(card);
      container.add(desc);
    });
    
    // Seals and stamps display
    const seals = SaveSystem.getSeals();
    const stamps = SaveSystem.getLetterStamps();
    
    this.add.text(width - 20, height - 50, `🔵 Seals: ${seals}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#4682b4'
    }).setOrigin(1, 0.5);
    
    this.add.text(width - 20, height - 30, `📜 Stamps: ${stamps}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(1, 0.5);
  }

  private selectLetterType(template: LetterTemplate): void {
    this.selectedTemplate = template;
    this.phase = 'write';
    
    // Generate letter content and effects
    this.letterContent = generateLetterContent(
      template,
      this.fighter.firstName,
      this.fighter.nickname
    );
    this.effects = calculateLetterEffects(template);
    
    // Clear previous UI
    this.children.each((child: Phaser.GameObjects.GameObject) => {
      if (child.getData('phase') === 'select') {
        child.destroy();
      }
    });
    
    this.showWritingPhase();
  }

  private showWritingPhase(): void {
    const { width, height } = this.cameras.main;
    
    // Parchment
    this.parchmentGroup = this.add.container(width / 2, height / 2 - 50);
    
    const parchment = this.add.graphics();
    parchment.fillStyle(0xd4c4a0, 1);
    parchment.fillRoundedRect(-160, -180, 320, 360, 5);
    // Parchment edges
    parchment.lineStyle(2, 0x8b7355, 1);
    parchment.strokeRoundedRect(-160, -180, 320, 360, 5);
    // Age stains
    parchment.fillStyle(0xc9b896, 0.5);
    parchment.fillCircle(-100, -100, 30);
    parchment.fillCircle(80, 50, 25);
    
    this.parchmentGroup.add(parchment);
    
    // Letter header
    const header = this.add.text(0, -150, `To ${this.selectedTemplate?.recipient}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#3a2a1a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.parchmentGroup.add(header);
    
    // Letter text (animated typing)
    this.letterTextObj = this.add.text(0, -50, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#2a1a0a',
      wordWrap: { width: 280 },
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    this.parchmentGroup.add(this.letterTextObj);
    
    // Animate typing
    this.typewriterEffect(this.letterContent || '', () => {
      this.showSealButton();
    });
    
    // Quill animation
    this.createQuill();
  }

  private createQuill(): void {
    // Simple quill representation
    this.quillSprite = this.add.graphics();
    this.quillSprite.fillStyle(0x4a3a2a, 1);
    this.quillSprite.fillTriangle(0, 0, -5, 30, 5, 30);
    this.quillSprite.fillStyle(0xf5f5dc, 1);
    this.quillSprite.fillTriangle(-2, 30, 2, 30, 0, 80);
    
    // Position near text
    const { width, height } = this.cameras.main;
    this.quillSprite.setPosition(width / 2 + 100, height / 2 - 100);
    
    // Writing motion
    this.tweens.add({
      targets: this.quillSprite,
      x: { from: width/2 + 80, to: width/2 + 120 },
      y: { from: height/2 - 120, to: height/2 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private typewriterEffect(text: string, onComplete: () => void): void {
    let currentIndex = 0;
    const fullText = text;
    
    this.time.addEvent({
      delay: 30,
      callback: () => {
        currentIndex++;
        this.letterTextObj?.setText(fullText.substring(0, currentIndex));
        
        if (currentIndex >= fullText.length) {
          onComplete();
        }
      },
      repeat: fullText.length - 1
    });
  }

  private showSealButton(): void {
    const { width, height } = this.cameras.main;
    
    // Remove quill
    this.quillSprite?.destroy();
    
    // Signature
    const signature = this.add.text(width/2, height/2 + 80, 
      `— ${this.fighter.firstName}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#2a1a0a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.parchmentGroup?.add(signature);
    
    // Seal button
    const sealBtn = UIHelper.createButton(
      this, width/2, height - 80,
      '🔴 SEAL WITH WAX',
      () => this.sealLetter(),
      { width: 180, height: 50, primary: true }
    );
  }

  private sealLetter(): void {
    this.phase = 'seal';
    
    const { width, height } = this.cameras.main;
    
    // Wax seal animation
    this.waxSeal = this.add.container(width/2, height/2 + 130);
    
    // Dripping wax effect
    const waxDrip = this.add.graphics();
    waxDrip.fillStyle(0x8b0000, 1);
    waxDrip.fillCircle(0, 0, 0);
    this.waxSeal.add(waxDrip);
    
    // Animate wax spreading
    this.tweens.add({
      targets: { radius: 0 },
      radius: 25,
      duration: 500,
      ease: 'Quad.out',
      onUpdate: (tween) => {
        const r = tween.getValue();
        if (typeof r === 'number') {
          waxDrip.clear();
          waxDrip.fillStyle(0x8b0000, 1);
          waxDrip.fillCircle(0, 0, r);
        }
      },
      onComplete: () => {
        // Stamp impression
        this.stampSeal();
      }
    });
  }

  private stampSeal(): void {
    // Flash effect
    this.cameras.main.flash(100, 255, 200, 200);
    
    // Seal stamp
    const stamp = this.add.text(0, 0, '⚔️', {
      fontSize: '20px'
    }).setOrigin(0.5);
    this.waxSeal?.add(stamp);
    
    // Stamp animation
    stamp.setScale(2);
    stamp.setAlpha(0);
    
    this.tweens.add({
      targets: stamp,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.out',
      onComplete: () => {
        this.time.delayedCall(500, () => this.showResults());
      }
    });
  }

  private showResults(): void {
    this.phase = 'result';
    
    const { width, height } = this.cameras.main;
    
    // Fade out letter
    this.tweens.add({
      targets: [this.parchmentGroup, this.waxSeal],
      alpha: 0,
      y: '+=50',
      duration: 500
    });
    
    // Show results panel
    this.time.delayedCall(600, () => {
      this.displayEffects();
      this.applyEffects();
    });
  }

  private displayEffects(): void {
    const { width, height } = this.cameras.main;
    
    // Results header
    this.add.text(width/2, 100, 'LETTER SENT', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Effects list
    let y = 160;
    this.effects.forEach((effect, i) => {
      this.time.delayedCall(i * 200, () => {
        const isPositive = effect.value > 0 || 
          ['letter_stamp', 'status_cure', 'injury_heal', 'resolve', 'buff'].includes(effect.type);
        
        const icon = isPositive ? '✓' : '✗';
        const color = isPositive ? '#6b8e23' : '#cd5c5c';
        
        const effectText = this.add.text(width/2, y, 
          `${icon} ${effect.description}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: color
        }).setOrigin(0.5);
        
        // Fade in
        effectText.setAlpha(0);
        this.tweens.add({
          targets: effectText,
          alpha: 1,
          x: width/2,
          duration: 300,
          ease: 'Back.out'
        });
        
        y += 35;
      });
    });
    
    // Continue button (after all effects shown)
    this.time.delayedCall(this.effects.length * 200 + 500, () => {
      UIHelper.createButton(this, width/2, height - 80, 'CONTINUE', () => {
        this.goBack();
      }, { width: 160, height: 50, primary: true });
    });
  }

  private applyEffects(): void {
    const run = SaveSystem.getRun();
    let goldChange = 0;
    let trustChange = 0;
    
    this.effects.forEach(effect => {
      switch (effect.type) {
        case 'trust':
          trustChange += effect.value;
          break;
        case 'gold':
          goldChange += effect.value;
          break;
        case 'hp':
          if (this.fighter.currentStats) {
            this.fighter.currentStats.currentHP = Math.min(
              this.fighter.currentStats.maxHP,
              this.fighter.currentStats.currentHP + effect.value
            );
          }
          break;
        case 'letter_stamp':
          // Letter stamps are meta currency
          SaveSystem.addLetterStamps(effect.value);
          // Also add seals (run-specific currency)
          SaveSystem.addSeals(effect.value);
          break;
        case 'debt':
          SaveSystem.addDebt(Math.abs(effect.value), 2);
          break;
        case 'resolve':
          // Resolve reduces fatigue
          SaveSystem.reduceFatigue(15);
          break;
        // Add more effect handlers as needed
      }
    });
    
    // Writing letters also reduces some fatigue (calming activity)
    SaveSystem.reduceFatigue(15);
    
    // Apply trust
    if (trustChange !== 0) {
      this.fighter.trust = Math.max(0, Math.min(100, this.fighter.trust + trustChange));
    }
    
    // Create written letter record
    const writtenLetter: WrittenLetter = {
      id: `letter_${Date.now()}`,
      type: this.selectedTemplate!.type,
      templateId: this.selectedTemplate!.id,
      content: this.letterContent || '',
      fighterName: this.fighter.fullName,
      fighterId: this.fighter.id,
      weekWritten: run.week,
      wasRead: false,
      effects: this.effects,
      timestamp: Date.now()
    };
    
    // Update save
    const letters = [...run.lettersWritten, writtenLetter];
    SaveSystem.updateRun({
      fighter: this.fighter,
      gold: run.gold + goldChange,
      lettersWritten: letters,
      lastCampAction: 'letter'
    });
    
    // Track letter type for milestones
    SaveSystem.incrementLetterCount(this.selectedTemplate!.type);
    
    // Check for milestone rewards
    this.checkMilestones();
  }

  private checkMilestones(): void {
    if (!this.selectedTemplate) return;
    
    const count = SaveSystem.getLetterCount(this.selectedTemplate.type);
    
    for (const milestone of this.selectedTemplate.milestoneRewards) {
      if (count >= milestone.count && 
          !SaveSystem.hasLetterReward(milestone.reward.id)) {
        // Unlock reward!
        SaveSystem.unlockLetterReward(milestone.reward.id);
        
        // Show notification
        this.time.delayedCall(1000, () => {
          UIHelper.showNotification(this,
            `🎉 UNLOCKED: ${milestone.reward.name}!`, 3000);
        });
      }
    }
  }

  private goBack(): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CampScene');
    });
  }
}
