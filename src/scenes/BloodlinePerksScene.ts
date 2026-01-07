/**
 * BloodlinePerksScene - Permanent upgrade tree
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { BLOODLINE_PERKS, canPurchasePerk, purchasePerk, BloodlinePerk } from '../systems/LegacySystem';
import { UIHelper } from '../ui/UIHelper';

export class BloodlinePerksScene extends Phaser.Scene {
  private pointsText!: Phaser.GameObjects.Text;
  private selectedPerk: BloodlinePerk | null = null;
  private detailsContainer!: Phaser.GameObjects.Container;
  private perkContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  
  constructor() {
    super({ key: 'BloodlinePerksScene' });
  }

  create(): void {
    this.createBackground();
    this.createHeader();
    this.createPerkTree();
    this.createDetailsPanel();
    this.createBackButton();
    
    this.cameras.main.fadeIn(300);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1410, 0x1a1410, 0x2a1f1a, 0x2a1f1a);
    bg.fillRect(0, 0, width, height);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const meta = SaveSystem.getMeta();
    
    this.add.text(width / 2, 35, 'BLOODLINE PERKS', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c9a959',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 65, 'Permanent upgrades for future fighters', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#8b7355',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Points display
    this.pointsText = this.add.text(width / 2, 90, `⚡ ${meta.bloodlinePoints} Points Available`, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    // Promoter level
    this.add.text(width / 2, 110, `Promoter Level: ${meta.promoterLevel}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }).setOrigin(0.5);
  }

  private createPerkTree(): void {
    const { width } = this.cameras.main;
    const startY = 150;
    const tierSpacing = 160;
    
    // Group perks by tier
    const tier1 = BLOODLINE_PERKS.filter(p => p.tier === 1);
    const tier2 = BLOODLINE_PERKS.filter(p => p.tier === 2);
    const tier3 = BLOODLINE_PERKS.filter(p => p.tier === 3);
    
    // Tier 1
    this.add.text(width / 2, startY - 15, '─── TIER 1 ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    this.createPerkRow(tier1, startY, width);
    
    // Tier 2
    this.add.text(width / 2, startY + tierSpacing - 15, '─── TIER 2 ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    this.createPerkRow(tier2, startY + tierSpacing, width);
    
    // Tier 3
    this.add.text(width / 2, startY + tierSpacing * 2 - 15, '─── TIER 3 ───', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
    
    this.createPerkRow(tier3, startY + tierSpacing * 2, width);
  }

  private createPerkRow(perks: BloodlinePerk[], y: number, screenWidth: number): void {
    const perkSize = 60;
    const spacing = 75;
    const startX = screenWidth / 2 - ((perks.length - 1) * spacing) / 2;
    
    perks.forEach((perk, i) => {
      const x = startX + i * spacing;
      this.createPerkNode(perk, x, y, perkSize);
    });
  }

  private createPerkNode(perk: BloodlinePerk, x: number, y: number, size: number): void {
    const container = this.add.container(x, y);
    this.perkContainers.set(perk.id, container);
    
    const meta = SaveSystem.getMeta();
    const isOwned = meta.unlockedPerks.includes(perk.id);
    const { canPurchase, reason } = canPurchasePerk(perk.id);
    
    // Background
    const bg = this.add.graphics();
    const bgColor = isOwned ? 0x2a4a2a : canPurchase ? 0x2a2a3a : 0x2a1f1a;
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    
    const borderColor = isOwned ? 0x6b8e23 : canPurchase ? 0xc9a959 : 0x5a4a3a;
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    container.add(bg);
    
    // Tier indicator
    const tierIcon = perk.tier === 1 ? '●' : perk.tier === 2 ? '◆' : '★';
    const tierText = this.add.text(0, -size / 2 - 10, tierIcon, {
      fontSize: '12px',
      color: isOwned ? '#6b8e23' : '#5a4a3a'
    }).setOrigin(0.5);
    container.add(tierText);
    
    // Cost
    if (!isOwned) {
      const cost = this.add.text(0, 8, `${perk.cost}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: canPurchase ? '#ffd700' : '#5a4a3a'
      }).setOrigin(0.5);
      container.add(cost);
    } else {
      const check = this.add.text(0, 0, '✓', {
        fontSize: '24px',
        color: '#6b8e23'
      }).setOrigin(0.5);
      container.add(check);
    }
    
    // Name below
    const name = this.add.text(0, size / 2 + 10, perk.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: isOwned ? '#6b8e23' : '#8b7355',
      wordWrap: { width: 70 },
      align: 'center'
    }).setOrigin(0.5, 0);
    container.add(name);
    
    // Interactive
    bg.setInteractive(new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', () => this.selectPerk(perk));
    bg.on('pointerover', () => {
      if (!isOwned) {
        bg.clear();
        bg.fillStyle(bgColor + 0x111111, 1);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
        bg.lineStyle(2, 0xc9a959, 1);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
      }
    });
    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    });
  }

  private createDetailsPanel(): void {
    const { width, height } = this.cameras.main;
    
    this.detailsContainer = this.add.container(width / 2, 650);
    
    this.add.text(width / 2, 630, 'Select a perk to view details', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#5a4a3a'
    }).setOrigin(0.5);
  }

  private selectPerk(perk: BloodlinePerk): void {
    this.selectedPerk = perk;
    this.updateDetailsPanel();
  }

  private updateDetailsPanel(): void {
    if (!this.selectedPerk) return;
    
    const perk = this.selectedPerk;
    this.detailsContainer.removeAll(true);
    
    const meta = SaveSystem.getMeta();
    const isOwned = meta.unlockedPerks.includes(perk.id);
    const { canPurchase, reason } = canPurchasePerk(perk.id);
    
    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f1a, 0.95);
    bg.fillRoundedRect(-160, -70, 320, 140, 10);
    bg.lineStyle(2, 0x5a4a3a, 1);
    bg.strokeRoundedRect(-160, -70, 320, 140, 10);
    this.detailsContainer.add(bg);
    
    // Perk name
    const name = this.add.text(0, -55, perk.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c9a959'
    }).setOrigin(0.5);
    this.detailsContainer.add(name);
    
    // Description
    const desc = this.add.text(0, -30, perk.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355',
      wordWrap: { width: 280 },
      align: 'center'
    }).setOrigin(0.5);
    this.detailsContainer.add(desc);
    
    // Effect
    const effect = this.add.text(0, 0, `Effect: ${perk.effect}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#6b8e23'
    }).setOrigin(0.5);
    this.detailsContainer.add(effect);
    
    // Status
    if (isOwned) {
      const owned = this.add.text(0, 25, '✓ OWNED', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#6b8e23'
      }).setOrigin(0.5);
      this.detailsContainer.add(owned);
    } else if (canPurchase) {
      // Purchase button
      const buyBtn = UIHelper.createButton(
        this, 0, 40, `BUY (${perk.cost} pts)`,
        () => this.purchasePerk(perk),
        { width: 120, height: 35, fontSize: '12px', primary: true }
      );
      this.detailsContainer.add(buyBtn);
    } else {
      const locked = this.add.text(0, 25, `🔒 ${reason}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#8b4513'
      }).setOrigin(0.5);
      this.detailsContainer.add(locked);
    }
  }

  private purchasePerk(perk: BloodlinePerk): void {
    if (purchasePerk(perk.id)) {
      UIHelper.showNotification(this, `Unlocked: ${perk.name}!`);
      
      // Update points display
      const meta = SaveSystem.getMeta();
      this.pointsText.setText(`⚡ ${meta.bloodlinePoints} Points Available`);
      
      // Refresh the tree
      this.scene.restart();
    }
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
