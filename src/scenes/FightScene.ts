/**
 * FightScene - Turn-based combat
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
import { PortraitRenderer } from '../ui/PortraitRenderer';

export class FightScene extends Phaser.Scene {
  private combatState!: CombatState;
  private player!: Fighter;
  private enemy!: Fighter;
  private selectedAction: CombatAction | null = null;
  private selectedZone: TargetZone = 'body';
  
  // UI elements
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private enemyHealthBar!: Phaser.GameObjects.Graphics;
  private playerStaminaBar!: Phaser.GameObjects.Graphics;
  private playerFocusBar!: Phaser.GameObjects.Graphics;
  private combatLog!: Phaser.GameObjects.Text;
  private actionButtons!: Phaser.GameObjects.Container;
  private zoneButtons!: Phaser.GameObjects.Container;
  private hypeBar!: Phaser.GameObjects.Graphics;
  
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
    
    this.createBackground();
    this.createArenaView();
    this.createCombatUI();
    this.createActionPanel();
    
    // Show enemy taunt
    const taunt = getEnemyTaunt(this.enemy);
    this.showCombatMessage(taunt, 2000);
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Arena gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2a1f1a, 0x2a1f1a, 0x1a1410, 0x1a1410);
    bg.fillRect(0, 0, width, height);
    
    // Arena floor (sand)
    bg.fillStyle(0x3a2f1a, 1);
    bg.fillRect(0, height * 0.5, width, height * 0.5);
    
    // Add atmospheric overlay
    if (this.textures.exists('arena_overlay')) {
      const overlay = this.add.image(width / 2, height / 2, 'arena_overlay');
      overlay.setAlpha(0.3);
      overlay.setDisplaySize(width, height);
    }
    
    // Vignette for dramatic effect
    if (this.textures.exists('vignette')) {
      const vignette = this.add.image(width / 2, height / 2, 'vignette');
      vignette.setDisplaySize(width, height);
      vignette.setAlpha(0.6);
    }
  }

  private createArenaView(): void {
    const { width, height } = this.cameras.main;
    
    // Player portrait (left side)
    const playerPortrait = PortraitRenderer.renderPortrait(
      this, 
      this.player.portrait, 
      80, 
      200, 
      80
    );
    
    // Player name
    this.add.text(80, 250, this.player.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Enemy portrait (right side)
    const enemyPortrait = PortraitRenderer.renderPortrait(
      this, 
      this.enemy.portrait, 
      width - 80, 
      200, 
      80
    );
    
    // Enemy name
    this.add.text(width - 80, 250, this.enemy.firstName, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#8b4513'
    }).setOrigin(0.5);
    
    this.add.text(width - 80, 268, `"${this.enemy.nickname}"`, {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#5a4a3a',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // VS indicator
    this.add.text(width / 2, 200, 'VS', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#8b0000',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  private createCombatUI(): void {
    const { width, height } = this.cameras.main;
    
    // Round indicator
    this.add.text(width / 2, 30, `ROUND ${this.combatState.round}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    
    // Player health bar
    this.createHealthBar(30, 60, 150, 20, true);
    
    // Player stamina bar
    this.createStaminaBar(30, 85, 120, 12);
    
    // Player focus bar
    this.createFocusBar(30, 102, 100, 10);
    
    // Enemy health bar
    this.createHealthBar(width - 180, 60, 150, 20, false);
    
    // Crowd hype meter
    this.createHypeBar(width / 2 - 75, 55, 150, 12);
    
    // Combat log
    this.combatLog = this.add.text(width / 2, 310, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959',
      wordWrap: { width: 300 },
      align: 'center'
    }).setOrigin(0.5);
  }

  private createHealthBar(x: number, y: number, w: number, h: number, isPlayer: boolean): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 4);
    bg.lineStyle(1, 0x5a4a3a, 1);
    bg.strokeRoundedRect(x, y, w, h, 4);
    
    const bar = this.add.graphics();
    if (isPlayer) {
      this.playerHealthBar = bar;
    } else {
      this.enemyHealthBar = bar;
    }
    
    this.updateHealthBar(bar, x, y, w, h, isPlayer);
    
    const label = this.add.text(x, y - 15, isPlayer ? 'HP' : 'Enemy HP', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#8b7355'
    });
  }

  private updateHealthBar(bar: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, isPlayer: boolean): void {
    const state = isPlayer ? this.combatState.player : this.combatState.enemy;
    const percentage = state.currentHP / state.fighter.currentStats.maxHP;
    
    bar.clear();
    const color = percentage > 0.5 ? 0x228b22 : percentage > 0.25 ? 0xdaa520 : 0x8b0000;
    bar.fillStyle(color, 1);
    bar.fillRoundedRect(x + 2, y + 2, (w - 4) * Math.max(0, percentage), h - 4, 3);
  }

  private createStaminaBar(x: number, y: number, w: number, h: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 3);
    
    this.playerStaminaBar = this.add.graphics();
    this.updateStaminaBar(x, y, w, h);
    
    this.add.text(x, y - 12, 'STA', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#8b7355'
    });
  }

  private updateStaminaBar(x: number, y: number, w: number, h: number): void {
    const percentage = this.combatState.player.currentStamina / this.player.currentStats.maxStamina;
    
    this.playerStaminaBar.clear();
    this.playerStaminaBar.fillStyle(0x4682b4, 1);
    this.playerStaminaBar.fillRoundedRect(x + 1, y + 1, (w - 2) * Math.max(0, percentage), h - 2, 2);
  }

  private createFocusBar(x: number, y: number, w: number, h: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 3);
    
    this.playerFocusBar = this.add.graphics();
    this.updateFocusBar(x, y, w, h);
    
    this.add.text(x, y - 12, 'FOCUS', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#8b7355'
    });
  }

  private updateFocusBar(x: number, y: number, w: number, h: number): void {
    const percentage = this.combatState.player.currentFocus / this.player.currentStats.maxFocus;
    
    this.playerFocusBar.clear();
    this.playerFocusBar.fillStyle(0x9932cc, 1);
    this.playerFocusBar.fillRoundedRect(x + 1, y + 1, (w - 2) * Math.max(0, percentage), h - 2, 2);
  }

  private createHypeBar(x: number, y: number, w: number, h: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 1);
    bg.fillRoundedRect(x, y, w, h, 3);
    
    this.hypeBar = this.add.graphics();
    this.updateHypeBar(x, y, w, h);
    
    this.add.text(x + w / 2, y - 12, 'CROWD HYPE', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#8b7355'
    }).setOrigin(0.5);
  }

  private updateHypeBar(x: number, y: number, w: number, h: number): void {
    const percentage = this.combatState.crowdHype / 100;
    
    this.hypeBar.clear();
    this.hypeBar.fillStyle(0xffd700, 1);
    this.hypeBar.fillRoundedRect(x + 1, y + 1, (w - 2) * percentage, h - 2, 2);
  }

  private createActionPanel(): void {
    const { width, height } = this.cameras.main;
    
    // Zone selection buttons
    this.zoneButtons = this.add.container(width / 2, 370);
    this.createZoneButtons();
    
    // Action buttons
    this.actionButtons = this.add.container(width / 2, 520);
    this.createActionButtons();
  }

  private createZoneButtons(): void {
    const zones: TargetZone[] = ['head', 'body', 'legs'];
    const labels = { head: '🎯 HEAD', body: '🎯 BODY', legs: '🎯 LEGS' };
    const spacing = 95;
    
    zones.forEach((zone, i) => {
      const x = (i - 1) * spacing;
      const btn = UIHelper.createButton(
        this, x, 0, labels[zone],
        () => this.selectZone(zone),
        { width: 85, height: 35, fontSize: '11px' }
      );
      btn.setData('zone', zone);
      this.zoneButtons.add(btn);
    });
    
    // Highlight default zone
    this.highlightZone('body');
  }

  private selectZone(zone: TargetZone): void {
    this.selectedZone = zone;
    this.highlightZone(zone);
  }

  private highlightZone(zone: TargetZone): void {
    this.zoneButtons.each((child: Phaser.GameObjects.GameObject) => {
      const container = child as Phaser.GameObjects.Container;
      const bg = container.first as Phaser.GameObjects.Graphics;
      const isSelected = container.getData('zone') === zone;
      
      bg?.clear();
      bg?.fillStyle(isSelected ? 0x5a4a3a : 0x2a1f1a, 1);
      bg?.fillRoundedRect(-42.5, -17.5, 85, 35, 6);
      bg?.lineStyle(2, isSelected ? 0xc9a959 : 0x5a4a3a, 1);
      bg?.strokeRoundedRect(-42.5, -17.5, 85, 35, 6);
    });
  }

  private createActionButtons(): void {
    const buttonData: { action: CombatAction; label: string; stamina: number }[] = [
      { action: 'light_attack', label: '⚔️ LIGHT', stamina: 10 },
      { action: 'heavy_attack', label: '💥 HEAVY', stamina: 25 },
      { action: 'guard', label: '🛡️ GUARD', stamina: 5 },
      { action: 'dodge', label: '💨 DODGE', stamina: 15 },
      { action: 'special', label: '✨ SPECIAL', stamina: 20 },
      { action: 'item', label: '🧪 ITEM', stamina: 0 }
    ];
    
    const cols = 3;
    const btnWidth = 100;
    const btnHeight = 50;
    const spacingX = 110;
    const spacingY = 60;
    
    buttonData.forEach((data, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - 1) * spacingX;
      const y = row * spacingY;
      
      const btn = UIHelper.createButton(
        this, x, y, data.label,
        () => this.performAction(data.action),
        { width: btnWidth, height: btnHeight, fontSize: '12px' }
      );
      this.actionButtons.add(btn);
    });
  }

  private performAction(action: CombatAction): void {
    if (this.combatState.turn !== 'player' || this.combatState.phase === 'end') return;
    
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
      this.showCombatMessage('Not enough stamina!', 1000);
      return;
    }
    
    // Check focus for special
    if (action === 'special' && this.combatState.player.currentFocus < 30) {
      this.showCombatMessage('Not enough focus!', 1000);
      return;
    }
    
    // Execute player action
    const result = executeAction(this.combatState, 'player', action, this.selectedZone);
    this.showCombatMessage(result.message, 1500);
    this.updateAllBars();
    
    // Check for combat end
    if (this.combatState.winner) {
      this.endCombat();
      return;
    }
    
    // Disable input during enemy turn
    this.disableInput();
    
    // Enemy turn after delay
    this.time.delayedCall(1500, () => {
      this.performEnemyTurn();
    });
  }

  private performEnemyTurn(): void {
    if (this.combatState.winner) return;
    
    nextTurn(this.combatState);
    
    // Get AI decision
    const aiType = (this.enemy.signatureTrait.id || 'balanced') as EnemyAIType;
    const { action, targetZone } = getAIAction(this.combatState, aiType);
    
    // Execute enemy action
    const result = executeAction(this.combatState, 'enemy', action, targetZone);
    this.showCombatMessage(result.message, 1500);
    this.updateAllBars();
    
    // Screen shake on heavy hits
    if (result.damage > 20) {
      this.shakeScreen();
    }
    
    // Check for combat end
    if (this.combatState.winner) {
      this.endCombat();
      return;
    }
    
    // Back to player turn
    this.time.delayedCall(1500, () => {
      nextTurn(this.combatState);
      this.updateRoundDisplay();
      this.enableInput();
    });
  }

  private updateAllBars(): void {
    const { width } = this.cameras.main;
    
    this.updateHealthBar(this.playerHealthBar, 30, 60, 150, 20, true);
    this.updateHealthBar(this.enemyHealthBar, width - 180, 60, 150, 20, false);
    this.updateStaminaBar(30, 85, 120, 12);
    this.updateFocusBar(30, 102, 100, 10);
    this.updateHypeBar(width / 2 - 75, 55, 150, 12);
  }

  private updateRoundDisplay(): void {
    // Update round text - would need to store reference to update
  }

  private showCombatMessage(message: string, duration: number): void {
    this.combatLog.setText(message);
    
    // Flash effect
    this.tweens.add({
      targets: this.combatLog,
      alpha: { from: 1, to: 0.7 },
      duration: 100,
      yoyo: true
    });
  }

  private shakeScreen(): void {
    const settings = SaveSystem.getSettings();
    if (!settings.screenShake) return;
    
    this.cameras.main.shake(200, 0.01);
  }

  private disableInput(): void {
    this.actionButtons.setAlpha(0.5);
    this.zoneButtons.setAlpha(0.5);
  }

  private enableInput(): void {
    this.actionButtons.setAlpha(1);
    this.zoneButtons.setAlpha(1);
  }

  private endCombat(): void {
    this.disableInput();
    
    const won = this.combatState.winner === 'player';
    const run = SaveSystem.getRun();
    
    if (won) {
      // Update fighter stats
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
      
      // Save and transition
      SaveSystem.updateRun({
        fighter: this.player,
        gold: run.gold + rewards.gold,
        fame: run.fame + rewards.fame,
        fightsInLeague: run.fightsInLeague + 1
      });
      
      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(300);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('ResultsScene', { 
            won: true, 
            rewards,
            injury,
            enemy: this.enemy
          });
        });
      });
    } else {
      // Player died
      this.player.status = 'dead';
      this.player.causeOfDeath = generateCauseOfDeath(
        { damage: this.combatState.lastAction?.damage || 0, location: this.selectedZone, weaponType: 'blade' },
        this.combatState.round,
        this.enemy.fullName
      );
      this.player.lastWords = getLastWords(this.player);
      this.player.killedBy = this.enemy.fullName;
      
      SaveSystem.updateRun({ fighter: this.player });
      SaveSystem.endRun(false);
      
      // Show last words if any
      if (this.player.lastWords) {
        this.showCombatMessage(this.player.lastWords, 3000);
      }
      
      this.time.delayedCall(3000, () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('DeathScene');
        });
      });
    }
  }
}
