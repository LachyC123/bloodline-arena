/**
 * FightScene - Turn-based combat with animated fighters
 * Features real attack/block/dodge animations and visual feedback
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, applyInjury, generateCauseOfDeath, getLastWords } from '../systems/FighterSystem';
import { 
  CombatState, 
  initCombat, 
  executeAction, 
  nextTurn, 
  CombatAction, 
  TargetZone,
  rollForInjury,
  calculateRewards
} from '../systems/CombatSystem';
import { generateEnemy, getAIAction, getEnemyTaunt, EnemyAIType } from '../systems/EnemySystem';
import { UIHelper } from '../ui/UIHelper';
import { AnimatedFighter, CombatVFXManager } from '../combat/CombatAnimator';
import { 
  TouchButton, 
  getSafeArea, 
  getContentArea, 
  anchorTop, 
  anchorBottom,
  MIN_TOUCH_SIZE 
} from '../ui/Layout';

export class FightScene extends Phaser.Scene {
  private combatState!: CombatState;
  private player!: Fighter;
  private enemy!: Fighter;
  private selectedAction: CombatAction | null = null;
  private selectedZone: TargetZone = 'body';
  
  // Animated fighters
  private playerSprite!: AnimatedFighter;
  private enemySprite!: AnimatedFighter;
  private vfx!: CombatVFXManager;
  
  // UI elements
  private playerHealthBar!: { bg: Phaser.GameObjects.Graphics; fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number };
  private enemyHealthBar!: { bg: Phaser.GameObjects.Graphics; fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number };
  private playerStaminaBar!: { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number };
  private playerFocusBar!: { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number };
  private combatLog!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private hypeBar!: { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number };
  
  // Action buttons
  private actionButtonsContainer!: Phaser.GameObjects.Container;
  private zoneButtons: Phaser.GameObjects.Container[] = [];
  private isInputEnabled = true;
  
  constructor() {
    super({ key: 'FightScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('MainMenuScene');
      return;
    }
    
    this.player = run.fighter;
    this.enemy = generateEnemy(run.league as any, run.week);
    this.combatState = initCombat(this.player, this.enemy);
    
    this.vfx = new CombatVFXManager(this);
    
    this.createBackground();
    this.createFighters();
    this.createCombatUI();
    this.createActionPanel();
    
    // Show enemy taunt
    const taunt = getEnemyTaunt(this.enemy);
    this.showCombatMessage(taunt);
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Arena gradient (warm sand tones)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x3a2a1a, 0x3a2a1a, 0x2a1f15, 0x2a1f15);
    bg.fillRect(0, 0, width, height);
    
    // Arena floor (sand)
    bg.fillStyle(0x4a3a20, 1);
    bg.fillRect(0, height * 0.55, width, height * 0.45);
    
    // Sand texture lines
    bg.lineStyle(1, 0x3a2a15, 0.3);
    for (let i = 0; i < 8; i++) {
      const y = height * 0.55 + i * 25;
      bg.moveTo(0, y + Math.random() * 10);
      bg.lineTo(width, y + Math.random() * 10);
    }
    bg.strokePath();
    
    // Arena wall silhouette
    bg.fillStyle(0x2a1a10, 0.6);
    bg.fillRect(0, height * 0.2, width, height * 0.15);
    
    // Crowd silhouettes
    for (let i = 0; i < 15; i++) {
      const cx = (i / 14) * width;
      const cy = height * 0.25 + Math.random() * 20;
      bg.fillStyle(0x1a1210, 0.8);
      bg.fillCircle(cx, cy, 8 + Math.random() * 5);
      bg.fillRect(cx - 5, cy, 10, 15);
    }
    
    // Vignette effect
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.4);
    vignette.fillRect(0, 0, width, height * 0.08);
    vignette.fillRect(0, height * 0.92, width, height * 0.08);
  }

  private createFighters(): void {
    const { width, height } = this.cameras.main;
    
    // Player on left
    this.playerSprite = new AnimatedFighter(this, {
      fighter: this.player,
      x: width * 0.25,
      y: height * 0.48,
      scale: 0.9,
      flipX: false
    });
    
    // Enemy on right
    this.enemySprite = new AnimatedFighter(this, {
      fighter: this.enemy,
      x: width * 0.75,
      y: height * 0.48,
      scale: 0.9,
      flipX: true
    });
  }

  private createCombatUI(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    // Round indicator
    this.roundText = this.add.text(width / 2, safe.top + 15, `ROUND ${this.combatState.round}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Player health bar (left)
    const pBarX = safe.left;
    const pBarY = safe.top + 40;
    const pBarW = Math.min(140, width * 0.35);
    const pBarH = 18;
    
    this.playerHealthBar = this.createHealthBar(pBarX, pBarY, pBarW, pBarH, true);
    
    // Player name
    this.add.text(pBarX, pBarY - 15, this.player.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    });
    
    // Player stamina bar
    this.playerStaminaBar = this.createResourceBar(pBarX, pBarY + 22, pBarW * 0.8, 10, 0x4682b4);
    this.add.text(pBarX, pBarY + 20, 'STA', {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: '#8b7355'
    });
    
    // Player focus bar
    this.playerFocusBar = this.createResourceBar(pBarX, pBarY + 36, pBarW * 0.6, 8, 0x9932cc);
    this.add.text(pBarX, pBarY + 35, 'FOC', {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: '#8b7355'
    });
    
    // Enemy health bar (right)
    const eBarW = Math.min(140, width * 0.35);
    const eBarX = width - safe.right - eBarW;
    const eBarY = safe.top + 40;
    
    this.enemyHealthBar = this.createHealthBar(eBarX, eBarY, eBarW, pBarH, false);
    
    // Enemy name
    this.add.text(eBarX + eBarW, eBarY - 15, this.enemy.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b4513'
    }).setOrigin(1, 0);
    
    this.add.text(eBarX + eBarW, eBarY + 5, `"${this.enemy.nickname}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(1, 0);
    
    // Crowd hype bar (center top)
    const hypeW = 120;
    this.hypeBar = this.createResourceBar(width / 2 - hypeW / 2, safe.top + 35, hypeW, 10, 0xffd700);
    this.add.text(width / 2, safe.top + 33, 'CROWD', {
      fontFamily: 'Georgia, serif',
      fontSize: '8px',
      color: '#8b7355'
    }).setOrigin(0.5, 0);
    
    // Combat log
    this.combatLog = this.add.text(width / 2, height * 0.38, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959',
      wordWrap: { width: width - 40 },
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(50);
    
    // Update all bars
    this.updateAllBars();
  }
  
  private createHealthBar(x: number, y: number, w: number, h: number, isPlayer: boolean): { bg: Phaser.GameObjects.Graphics; fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number } {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 4);
    bg.lineStyle(1, 0x5a4a3a, 1);
    bg.strokeRoundedRect(x, y, w, h, 4);
    
    const fill = this.add.graphics();
    
    return { bg, fill, x, y, w, h };
  }
  
  private createResourceBar(x: number, y: number, w: number, h: number, color: number): { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number } {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 3);
    
    const fill = this.add.graphics();
    fill.fillStyle(color, 1);
    fill.fillRoundedRect(x + 1, y + 1, w - 2, h - 2, 2);
    
    return { fill, x, y, w, h };
  }
  
  private updateHealthBar(bar: { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number }, current: number, max: number): void {
    const pct = Math.max(0, current / max);
    const color = pct > 0.5 ? 0x228b22 : pct > 0.25 ? 0xdaa520 : 0x8b0000;
    
    bar.fill.clear();
    bar.fill.fillStyle(color, 1);
    bar.fill.fillRoundedRect(bar.x + 2, bar.y + 2, (bar.w - 4) * pct, bar.h - 4, 3);
  }
  
  private updateResourceBar(bar: { fill: Phaser.GameObjects.Graphics; x: number; y: number; w: number; h: number }, pct: number, color: number): void {
    bar.fill.clear();
    bar.fill.fillStyle(color, 1);
    bar.fill.fillRoundedRect(bar.x + 1, bar.y + 1, (bar.w - 2) * Math.max(0, pct), bar.h - 2, 2);
  }
  
  private updateAllBars(): void {
    // Player health
    this.updateHealthBar(
      this.playerHealthBar, 
      this.combatState.player.currentHP, 
      this.player.currentStats.maxHP
    );
    
    // Enemy health
    this.updateHealthBar(
      this.enemyHealthBar, 
      this.combatState.enemy.currentHP, 
      this.enemy.currentStats.maxHP
    );
    
    // Stamina
    this.updateResourceBar(
      this.playerStaminaBar,
      this.combatState.player.currentStamina / this.player.currentStats.maxStamina,
      0x4682b4
    );
    
    // Focus
    this.updateResourceBar(
      this.playerFocusBar,
      this.combatState.player.currentFocus / this.player.currentStats.maxFocus,
      0x9932cc
    );
    
    // Hype
    this.updateResourceBar(
      this.hypeBar,
      this.combatState.crowdHype / 100,
      0xffd700
    );
  }

  private createActionPanel(): void {
    const { width, height } = this.cameras.main;
    const content = getContentArea(this);
    const safe = getSafeArea();
    
    // Zone selection buttons at top of action area
    const zoneY = height * 0.62;
    const zones: TargetZone[] = ['head', 'body', 'legs'];
    const zoneLabels = { head: '🎯 HEAD', body: '🎯 BODY', legs: '🎯 LEGS' };
    const zoneW = Math.min(85, (content.width - 20) / 3);
    
    zones.forEach((zone, i) => {
      const x = width / 2 + (i - 1) * (zoneW + 8);
      const btn = this.createZoneButton(x, zoneY, zoneW, 36, zoneLabels[zone], zone);
      this.zoneButtons.push(btn);
    });
    
    this.highlightZone('body');
    
    // Action buttons
    this.actionButtonsContainer = this.add.container(0, 0);
    
    const buttonData: { action: CombatAction; label: string; stamina: number; icon: string }[] = [
      { action: 'light_attack', label: 'LIGHT', stamina: 10, icon: '⚔️' },
      { action: 'heavy_attack', label: 'HEAVY', stamina: 25, icon: '💥' },
      { action: 'guard', label: 'GUARD', stamina: 5, icon: '🛡️' },
      { action: 'dodge', label: 'DODGE', stamina: 15, icon: '💨' },
      { action: 'special', label: 'SPECIAL', stamina: 20, icon: '✨' },
      { action: 'item', label: 'ITEM', stamina: 0, icon: '🧪' }
    ];
    
    const cols = 3;
    const btnW = Math.min(100, (content.width - 20) / cols);
    const btnH = Math.max(MIN_TOUCH_SIZE, 48);
    const spacingX = btnW + 8;
    const spacingY = btnH + 8;
    const startY = height * 0.72;
    
    buttonData.forEach((data, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = width / 2 + (col - 1) * spacingX;
      const y = startY + row * spacingY;
      
      this.createActionButton(x, y, btnW, btnH, data.icon, data.label, data.action, data.stamina);
    });
  }
  
  private createZoneButton(x: number, y: number, w: number, h: number, label: string, zone: TargetZone): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
    container.add(bg);
    
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    }).setOrigin(0.5);
    container.add(text);
    
    container.setData('zone', zone);
    container.setData('bg', bg);
    container.setData('text', text);
    
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerdown', () => {
      if (!this.isInputEnabled) return;
      this.selectedZone = zone;
      this.highlightZone(zone);
    });
    
    return container;
  }
  
  private highlightZone(activeZone: TargetZone): void {
    this.zoneButtons.forEach(btn => {
      const zone = btn.getData('zone') as TargetZone;
      const bg = btn.getData('bg') as Phaser.GameObjects.Graphics;
      const text = btn.getData('text') as Phaser.GameObjects.Text;
      const isActive = zone === activeZone;
      const w = btn.width;
      const h = btn.height;
      
      bg.clear();
      bg.fillStyle(isActive ? 0x3a2a2a : 0x2a1f1a, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      bg.lineStyle(2, isActive ? 0xc9a959 : 0x5a4a3a, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
      
      text.setColor(isActive ? '#c9a959' : '#8b7355');
    });
  }
  
  private createActionButton(x: number, y: number, w: number, h: number, icon: string, label: string, action: CombatAction, staminaCost: number): void {
    const container = this.add.container(x, y);
    this.actionButtonsContainer.add(container);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    container.add(bg);
    
    const iconText = this.add.text(-w / 2 + 10, 0, icon, {
      fontSize: '16px'
    }).setOrigin(0, 0.5);
    container.add(iconText);
    
    const labelText = this.add.text(-w / 2 + 32, -5, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    });
    container.add(labelText);
    
    const costText = this.add.text(-w / 2 + 32, 8, `${staminaCost} sta`, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#8b7355'
    });
    container.add(costText);
    
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );
    
    container.on('pointerover', () => {
      if (!this.isInputEnabled) return;
      bg.clear();
      bg.fillStyle(0x3a2f2a, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0xc9a959, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a1f1a, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0x5a4a3a, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    
    container.on('pointerdown', () => {
      if (!this.isInputEnabled) return;
      this.performAction(action);
    });
  }

  private async performAction(action: CombatAction): Promise<void> {
    if (!this.isInputEnabled || this.combatState.turn !== 'player' || this.combatState.phase === 'end') return;
    
    // Check stamina
    const staminaCosts: Record<CombatAction, number> = {
      light_attack: 10,
      heavy_attack: 25,
      guard: 5,
      dodge: 15,
      special: 20,
      item: 0
    };
    
    if (this.combatState.player.currentStamina < staminaCosts[action]) {
      this.showCombatMessage('Not enough stamina!');
      return;
    }
    
    if (action === 'special' && this.combatState.player.currentFocus < 30) {
      this.showCombatMessage('Not enough focus!');
      return;
    }
    
    this.disableInput();
    
    // Animate player action
    await this.animatePlayerAction(action);
    
    // Execute game logic
    const result = executeAction(this.combatState, 'player', action, this.selectedZone);
    
    // Show result
    this.showCombatMessage(result.message);
    
    // Show damage numbers
    if (result.damage > 0) {
      const { width, height } = this.cameras.main;
      this.vfx.showDamageNumber(width * 0.75, height * 0.4, result.damage, result.critical || false);
      this.vfx.createSparks(width * 0.75, height * 0.45);
      
      // Enemy hit reaction
      if (result.damage > 20) {
        await this.enemySprite.playStagger();
      } else {
        await this.enemySprite.playHit(result.damage);
      }
    } else if (action === 'guard' || action === 'dodge') {
      // No damage dealt, show status
      const { width, height } = this.cameras.main;
      this.vfx.showStatusEffect(width * 0.25, height * 0.35, action === 'guard' ? 'block' : 'dodge');
    }
    
    this.updateAllBars();
    
    // Check for combat end
    if (this.combatState.winner) {
      await this.endCombat();
      return;
    }
    
    // Enemy turn after delay
    await this.delay(800);
    await this.performEnemyTurn();
  }
  
  private async animatePlayerAction(action: CombatAction): Promise<void> {
    switch (action) {
      case 'light_attack':
        await this.playerSprite.playLightAttack(() => {
          const { width, height } = this.cameras.main;
          this.vfx.createWeaponTrail(width * 0.35, height * 0.4, width * 0.65, height * 0.45);
        });
        break;
      case 'heavy_attack':
        await this.playerSprite.playHeavyAttack(() => {
          const { width, height } = this.cameras.main;
          this.vfx.createWeaponTrail(width * 0.3, height * 0.3, width * 0.7, height * 0.5);
          this.vfx.screenFlash(0xffffff, 0.2);
        });
        break;
      case 'guard':
        this.playerSprite.setGuardStance(true);
        await this.playerSprite.playBlock();
        break;
      case 'dodge':
        await this.playerSprite.playDodge();
        break;
      case 'special':
        this.vfx.screenFlash(0xffd700, 0.3);
        await this.playerSprite.playHeavyAttack(() => {
          const { width, height } = this.cameras.main;
          this.vfx.createSparkle(width * 0.75, height * 0.4, 0xffd700);
        });
        break;
      default:
        await this.delay(300);
    }
  }

  private async performEnemyTurn(): Promise<void> {
    if (this.combatState.winner) return;
    
    nextTurn(this.combatState);
    this.roundText.setText(`ROUND ${this.combatState.round}`);
    
    // Get AI decision
    const aiType = (this.enemy.signatureTrait.id || 'balanced') as EnemyAIType;
    const { action, targetZone } = getAIAction(this.combatState, aiType);
    
    // Show enemy intent briefly
    const intentIcons: Record<CombatAction, string> = {
      light_attack: '⚔️',
      heavy_attack: '💥',
      guard: '🛡️',
      dodge: '💨',
      special: '✨',
      item: '🧪'
    };
    this.showCombatMessage(`Enemy prepares: ${intentIcons[action]}`);
    
    await this.delay(500);
    
    // Animate enemy action
    await this.animateEnemyAction(action);
    
    // Execute game logic
    const result = executeAction(this.combatState, 'enemy', action, targetZone);
    this.showCombatMessage(result.message);
    
    // Show effects
    if (result.damage > 0) {
      const { width, height } = this.cameras.main;
      this.vfx.showDamageNumber(width * 0.25, height * 0.4, result.damage, result.critical || false);
      this.vfx.createSparks(width * 0.25, height * 0.45);
      
      // Blood if enabled
      const settings = SaveSystem.getSettings();
      if (settings.bloodFX && result.damage > 15) {
        this.vfx.createBlood(width * 0.25, height * 0.45);
      }
      
      // Player hit reaction
      if (result.damage > 20) {
        this.shakeScreen();
        await this.playerSprite.playStagger();
      } else {
        await this.playerSprite.playHit(result.damage);
      }
    }
    
    this.updateAllBars();
    
    // Check for combat end
    if (this.combatState.winner) {
      await this.endCombat();
      return;
    }
    
    // Back to player turn
    await this.delay(500);
    nextTurn(this.combatState);
    this.enableInput();
  }
  
  private async animateEnemyAction(action: CombatAction): Promise<void> {
    switch (action) {
      case 'light_attack':
        await this.enemySprite.playLightAttack(() => {
          const { width, height } = this.cameras.main;
          this.vfx.createWeaponTrail(width * 0.65, height * 0.4, width * 0.35, height * 0.45);
        });
        break;
      case 'heavy_attack':
        await this.enemySprite.playHeavyAttack(() => {
          const { width, height } = this.cameras.main;
          this.vfx.createWeaponTrail(width * 0.7, height * 0.3, width * 0.3, height * 0.5);
        });
        break;
      case 'guard':
        this.enemySprite.setGuardStance(true);
        await this.enemySprite.playBlock();
        break;
      case 'dodge':
        await this.enemySprite.playDodge();
        break;
      default:
        await this.delay(300);
    }
  }

  private showCombatMessage(message: string): void {
    this.combatLog.setText(message);
    
    this.tweens.add({
      targets: this.combatLog,
      alpha: { from: 1, to: 0.8 },
      duration: 80,
      yoyo: true
    });
  }

  private shakeScreen(): void {
    const settings = SaveSystem.getSettings();
    if (!settings.screenShake) return;
    
    this.cameras.main.shake(150, 0.012);
  }

  private disableInput(): void {
    this.isInputEnabled = false;
    this.actionButtonsContainer.setAlpha(0.5);
    this.zoneButtons.forEach(btn => btn.setAlpha(0.5));
  }

  private enableInput(): void {
    this.isInputEnabled = true;
    this.actionButtonsContainer.setAlpha(1);
    this.zoneButtons.forEach(btn => btn.setAlpha(1));
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  private async endCombat(): Promise<void> {
    this.disableInput();
    
    const won = this.combatState.winner === 'player';
    const run = SaveSystem.getRun();
    
    if (won) {
      // Victory animation
      await this.playerSprite.playVictory();
      await this.enemySprite.playDefeat();
      
      this.vfx.screenFlash(0xffd700, 0.2);
      
      // Update stats
      this.player.wins++;
      this.player.totalDamageDealt += this.combatState.log
        .filter(l => l.actor === 'player')
        .reduce((sum, l) => sum + l.result.damage, 0);
      this.player.weeksSurvived = run.week + 1;
      
      // Check for injury
      const injury = rollForInjury(this.combatState.player, true);
      if (injury) {
        applyInjury(this.player, injury);
      }
      
      // Calculate rewards
      const rewards = calculateRewards(this.combatState, true, run.league);
      
      // Update consecutive wins and relic counter
      SaveSystem.updateRun({
        fighter: this.player,
        gold: run.gold + rewards.gold,
        fame: run.fame + rewards.fame,
        fightsInLeague: run.fightsInLeague + 1,
        consecutiveWins: run.consecutiveWins + 1,
        fightsSinceRelic: run.fightsSinceRelic + 1
      });
      
      await this.delay(1500);
      
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ResultsScene', { 
          won: true, 
          rewards,
          injury,
          enemy: this.enemy
        });
      });
    } else {
      // Defeat animation
      await this.playerSprite.playDefeat();
      await this.enemySprite.playVictory();
      
      this.vfx.screenFlash(0x8b0000, 0.3);
      
      // Player died
      this.player.status = 'dead';
      this.player.causeOfDeath = generateCauseOfDeath(
        { damage: this.combatState.lastAction?.damage || 0, location: this.selectedZone, weaponType: 'blade' },
        this.combatState.round,
        this.enemy.fullName
      );
      this.player.lastWords = getLastWords(this.player);
      this.player.killedBy = this.enemy.fullName;
      
      SaveSystem.updateRun({ 
        fighter: this.player,
        consecutiveWins: 0
      });
      SaveSystem.endRun(false);
      
      // Show last words
      if (this.player.lastWords) {
        this.showCombatMessage(`"${this.player.lastWords}"`);
        await this.delay(2500);
      }
      
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('DeathScene');
      });
    }
  }
}
