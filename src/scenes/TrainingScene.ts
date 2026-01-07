/**
 * TrainingScene - Visual training with real strategic choices
 * Programs provide immediate stats + unlock techniques that change combat
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, addTrust } from '../systems/FighterSystem';
import { UIHelper } from '../ui/UIHelper';
import { TouchButton, anchorTop, anchorBottom, centerX, getContentArea, getSafeArea } from '../ui/Layout';
import { 
  TRAINING_PROGRAMS, 
  TrainingProgram, 
  getTechnique, 
  getTechniqueEffect,
  rollSparringInjury 
} from '../data/TrainingData';

export class TrainingScene extends Phaser.Scene {
  private fighter!: Fighter;
  private selectedProgram: TrainingProgram | null = null;
  private trainingDummy?: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'TrainingScene' });
  }
  
  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('CampScene');
      return;
    }
    
    this.fighter = run.fighter;
    
    this.createBackground();
    this.createHeader();
    this.createTrainingDummy();
    this.createProgramCards();
    this.createFatigueDisplay();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }
  
  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Training yard background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2a2520, 0x2a2520, 0x1a1510, 0x1a1510);
    bg.fillRect(0, 0, width, height);
    
    // Wooden floor
    bg.fillStyle(0x3a2a1a, 1);
    bg.fillRect(0, height * 0.5, width, height * 0.5);
    
    // Floor planks
    bg.lineStyle(1, 0x2a1a0a, 0.5);
    for (let i = 0; i < 10; i++) {
      const y = height * 0.5 + i * 30;
      bg.moveTo(0, y);
      bg.lineTo(width, y);
    }
    bg.strokePath();
    
    // Weapon rack on left
    this.drawWeaponRack(50, height * 0.35);
    
    // Torch sconces
    this.createTorch(40, height * 0.2);
    this.createTorch(width - 40, height * 0.2);
  }
  
  private drawWeaponRack(x: number, y: number): void {
    const rack = this.add.graphics();
    
    // Rack frame
    rack.fillStyle(0x3a2a1a, 1);
    rack.fillRect(x - 25, y, 50, 120);
    rack.lineStyle(2, 0x2a1a0a, 1);
    rack.strokeRect(x - 25, y, 50, 120);
    
    // Weapons
    rack.lineStyle(4, 0x808080, 1);
    rack.moveTo(x - 15, y + 20);
    rack.lineTo(x - 15, y + 100);
    rack.strokePath();
    
    rack.moveTo(x, y + 15);
    rack.lineTo(x, y + 105);
    rack.strokePath();
    
    rack.moveTo(x + 15, y + 25);
    rack.lineTo(x + 15, y + 95);
    rack.strokePath();
  }
  
  private createTorch(x: number, y: number): void {
    const torch = this.add.container(x, y);
    
    // Sconce
    const sconce = this.add.graphics();
    sconce.fillStyle(0x4a3a2a, 1);
    sconce.fillRect(-8, 0, 16, 25);
    torch.add(sconce);
    
    // Flame glow
    const glow = this.add.graphics();
    
    const drawFlame = (intensity: number) => {
      glow.clear();
      glow.fillStyle(0xff6600, 0.2 * intensity);
      glow.fillCircle(0, -10, 30 * intensity);
      glow.fillStyle(0xffaa00, 0.3 * intensity);
      glow.fillCircle(0, -10, 15);
    };
    
    this.tweens.add({
      targets: { i: 1 },
      i: 1.3,
      duration: 200,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const val = tween.getValue();
        if (typeof val === 'number') drawFlame(val);
      }
    });
    
    drawFlame(1);
    torch.add(glow);
  }
  
  private createHeader(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    this.add.text(width / 2, safe.top + 20, 'TRAINING YARD', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, safe.top + 48, 'Choose a training program', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355'
    }).setOrigin(0.5);
  }
  
  private createTrainingDummy(): void {
    const { width, height } = this.cameras.main;
    
    this.trainingDummy = this.add.container(width * 0.75, height * 0.38);
    
    // Post
    const post = this.add.graphics();
    post.fillStyle(0x3a2a1a, 1);
    post.fillRect(-8, 0, 16, 100);
    this.trainingDummy.add(post);
    
    // Dummy body
    const body = this.add.graphics();
    body.fillStyle(0x6a5a4a, 1);
    body.fillEllipse(0, -20, 50, 70);
    // Arms
    body.fillRect(-40, -30, 20, 10);
    body.fillRect(20, -30, 20, 10);
    // Head
    body.fillCircle(0, -65, 20);
    // Target marks
    body.lineStyle(2, 0x8b0000, 0.5);
    body.strokeCircle(0, -30, 15);
    body.strokeCircle(0, 10, 12);
    this.trainingDummy.add(body);
    
    // Idle sway
    this.tweens.add({
      targets: this.trainingDummy,
      rotation: 0.03,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private createProgramCards(): void {
    const { width, height } = this.cameras.main;
    const content = getContentArea(this);
    
    const cardWidth = Math.min(160, (content.width - 30) / 2);
    const cardHeight = 90;
    const cols = 2;
    const startX = content.x + cardWidth / 2 + 10;
    const startY = height * 0.52;
    const spacingX = cardWidth + 10;
    const spacingY = cardHeight + 10;
    
    const fatigue = SaveSystem.getFatigue();
    
    TRAINING_PROGRAMS.forEach((program, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      const canTrain = fatigue + program.fatigueCost <= 100;
      const currentLevel = SaveSystem.getTechniqueLevel(program.techniqueId);
      const technique = getTechnique(program.techniqueId);
      
      this.createProgramCard(x, y, cardWidth, cardHeight, program, canTrain, currentLevel, technique?.maxLevel || 3);
    });
  }
  
  private createProgramCard(
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    program: TrainingProgram,
    canTrain: boolean,
    currentLevel: number,
    maxLevel: number
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    const bgColor = canTrain ? 0x2a1f1a : 0x1a1510;
    bg.fillStyle(bgColor, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, canTrain ? 0x5a4a3a : 0x3a2a1a, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    card.add(bg);
    
    // Icon
    const icon = this.add.text(-w / 2 + 15, -h / 2 + 12, program.icon, {
      fontSize: '20px'
    });
    card.add(icon);
    
    // Name
    const name = this.add.text(-w / 2 + 40, -h / 2 + 10, program.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: canTrain ? '#c9a959' : '#5a4a3a'
    });
    card.add(name);
    
    // Technique level indicator
    const levelDots = this.add.text(w / 2 - 15, -h / 2 + 10, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#c9a959'
    }).setOrigin(1, 0);
    
    let dotText = '';
    for (let i = 0; i < maxLevel; i++) {
      dotText += i < currentLevel ? '●' : '○';
    }
    levelDots.setText(dotText);
    card.add(levelDots);
    
    // Stats preview
    const statsText = this.formatStatChanges(program.statChanges);
    const stats = this.add.text(0, -5, statsText, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      align: 'center'
    }).setOrigin(0.5);
    card.add(stats);
    
    // Fatigue cost
    const fatigueText = this.add.text(-w / 2 + 10, h / 2 - 22, `⚡${program.fatigueCost}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: canTrain ? '#daa520' : '#5a3a1a'
    });
    card.add(fatigueText);
    
    // Risk indicator
    if (program.injuryRisk > 0.1) {
      const risk = this.add.text(w / 2 - 10, h / 2 - 22, '⚠️', {
        fontSize: '10px'
      }).setOrigin(1, 0);
      card.add(risk);
    }
    
    // Interactive
    if (canTrain) {
      card.setSize(w, h);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
        Phaser.Geom.Rectangle.Contains
      );
      
      card.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x3a2f2a, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, 0xc9a959, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
        
        this.showProgramDetail(program, currentLevel);
      });
      
      card.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(bgColor, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, 0x5a4a3a, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
        
        this.hideProgramDetail();
      });
      
      card.on('pointerdown', () => {
        this.selectProgram(program);
      });
    } else {
      card.setAlpha(0.6);
    }
    
    return card;
  }
  
  private formatStatChanges(changes: TrainingProgram['statChanges']): string {
    const parts: string[] = [];
    
    if (changes.attack) parts.push(`${changes.attack > 0 ? '+' : ''}${changes.attack} ATK`);
    if (changes.defense) parts.push(`${changes.defense > 0 ? '+' : ''}${changes.defense} DEF`);
    if (changes.accuracy) parts.push(`${changes.accuracy > 0 ? '+' : ''}${changes.accuracy} ACC`);
    if (changes.dodge) parts.push(`${changes.dodge > 0 ? '+' : ''}${changes.dodge} DOD`);
    if (changes.speed) parts.push(`${changes.speed > 0 ? '+' : ''}${changes.speed} SPD`);
    if (changes.maxStamina) parts.push(`${changes.maxStamina > 0 ? '+' : ''}${changes.maxStamina} STA`);
    if (changes.maxHP) parts.push(`${changes.maxHP > 0 ? '+' : ''}${changes.maxHP} HP`);
    if (changes.maxFocus) parts.push(`${changes.maxFocus > 0 ? '+' : ''}${changes.maxFocus} FOC`);
    
    return parts.join(', ');
  }
  
  private detailPanel?: Phaser.GameObjects.Container;
  
  private showProgramDetail(program: TrainingProgram, currentLevel: number): void {
    this.hideProgramDetail();
    
    const { width, height } = this.cameras.main;
    const panelWidth = Math.min(280, width - 40);
    const panelHeight = 120;
    
    this.detailPanel = this.add.container(width / 2, height * 0.35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1410, 0.95);
    bg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 10);
    bg.lineStyle(2, 0xc9a959, 1);
    bg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 10);
    this.detailPanel.add(bg);
    
    // Title
    const title = this.add.text(0, -panelHeight / 2 + 15, program.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailPanel.add(title);
    
    // Description
    const desc = this.add.text(0, -15, program.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355',
      wordWrap: { width: panelWidth - 30 },
      align: 'center'
    }).setOrigin(0.5);
    this.detailPanel.add(desc);
    
    // Technique info
    const technique = getTechnique(program.techniqueId);
    if (technique) {
      const nextLevel = currentLevel + 1;
      const effect = getTechniqueEffect(program.techniqueId, nextLevel);
      
      let techText = `${technique.icon} ${technique.name}`;
      if (effect) {
        techText += ` (Lv.${nextLevel}): ${effect.description}`;
      } else if (currentLevel >= technique.maxLevel) {
        techText += ' (MAXED)';
      }
      
      const techInfo = this.add.text(0, panelHeight / 2 - 25, techText, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#6495ed',
        wordWrap: { width: panelWidth - 20 },
        align: 'center'
      }).setOrigin(0.5);
      this.detailPanel.add(techInfo);
    }
  }
  
  private hideProgramDetail(): void {
    this.detailPanel?.destroy();
    this.detailPanel = undefined;
  }
  
  private createFatigueDisplay(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    const fatigue = SaveSystem.getFatigue();
    
    // Fatigue label
    this.add.text(width / 2, safe.top + 72, 'FATIGUE', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    }).setOrigin(0.5);
    
    // Fatigue bar background
    const barWidth = 150;
    const barHeight = 12;
    const barX = width / 2 - barWidth / 2;
    const barY = safe.top + 85;
    
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2a1f1a, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    
    // Fatigue fill
    const fill = this.add.graphics();
    const fillColor = fatigue > 70 ? 0x8b0000 : fatigue > 40 ? 0xdaa520 : 0x228b22;
    fill.fillStyle(fillColor, 1);
    fill.fillRoundedRect(barX + 2, barY + 2, (barWidth - 4) * (fatigue / 100), barHeight - 4, 3);
    
    // Percentage
    this.add.text(width / 2 + barWidth / 2 + 10, barY + barHeight / 2, `${fatigue}%`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    }).setOrigin(0, 0.5);
    
    // Warning if high fatigue
    if (fatigue >= 80) {
      this.add.text(width / 2, barY + 20, '⚠️ High fatigue reduces stamina regen!', {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: '#daa520'
      }).setOrigin(0.5);
    }
  }
  
  private selectProgram(program: TrainingProgram): void {
    this.selectedProgram = program;
    
    // Animate dummy being hit
    if (this.trainingDummy) {
      this.tweens.add({
        targets: this.trainingDummy,
        rotation: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        ease: 'Quad.out'
      });
    }
    
    // Show confirmation
    this.showTrainingConfirmation(program);
  }
  
  private showTrainingConfirmation(program: TrainingProgram): void {
    const { width, height } = this.cameras.main;
    
    UIHelper.showConfirmDialog(
      this,
      `Train: ${program.name}?`,
      `${program.previewText}\n\nFatigue +${program.fatigueCost}%` + 
        (program.injuryRisk > 0.1 ? `\nInjury Risk: ${Math.round(program.injuryRisk * 100)}%` : ''),
      () => this.completeTraining(program),
      () => { this.selectedProgram = null; },
      'TRAIN'
    );
  }
  
  private completeTraining(program: TrainingProgram): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) return;
    
    // Apply stat changes
    for (const [stat, value] of Object.entries(program.statChanges)) {
      if (typeof value === 'number') {
        const key = stat as keyof typeof run.fighter.currentStats;
        if (typeof run.fighter.currentStats[key] === 'number') {
          (run.fighter.currentStats[key] as number) += value;
        }
      }
    }
    
    // Level up technique
    const currentLevel = SaveSystem.getTechniqueLevel(program.techniqueId);
    const technique = getTechnique(program.techniqueId);
    if (technique && currentLevel < technique.maxLevel) {
      SaveSystem.setTechniqueLevel(program.techniqueId, currentLevel + 1);
    }
    
    // Add fatigue
    SaveSystem.addFatigue(program.fatigueCost);
    
    // Check for sparring injury
    const injury = rollSparringInjury(program.injuryRisk);
    if (injury) {
      SaveSystem.addSparringInjury(injury.id);
      UIHelper.showNotification(this, `⚠️ ${injury.name}: ${injury.effect}`, 3000);
    }
    
    // Add trust
    addTrust(run.fighter, 3);
    
    // Update week and save
    SaveSystem.updateRun({
      fighter: run.fighter,
      week: run.week + 1,
      lastCampAction: 'train'
    });
    
    // Show training vignette text
    UIHelper.showNotification(this, program.trainingText, 2500);
    
    // Return to camp after delay
    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CampScene');
      });
    });
  }
  
  private createBackButton(): void {
    const safe = getSafeArea();
    
    new TouchButton(
      this,
      safe.left + 50,
      anchorBottom(this, 30),
      '← BACK',
      () => {
        this.cameras.main.fadeOut(200);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CampScene');
        });
      },
      { width: 90, height: 44, fontSize: 12 }
    );
  }
}
