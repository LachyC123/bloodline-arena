/**
 * CustomizeScene - Fighter customization screen
 * Allows players to customize cosmetics, combat philosophy, background, and starting technique
 */

import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Fighter, calculateEffectiveStats } from '../systems/FighterSystem';
import { Button } from '../ui/Button';
import { PortraitRenderer } from '../ui/PortraitRenderer';
import { getSafeArea, getContentArea, anchorBottom } from '../ui/Layout';
import { calculatePower, formatPower, getPowerAssessment } from '../systems/PowerScore';
import { DEFAULT_LOADOUT_STATS } from '../systems/InventorySystem';
import {
  COMBAT_PHILOSOPHIES,
  BACKGROUNDS,
  STARTING_TECHNIQUES,
  SKIN_TONES,
  HAIR_COLORS,
  ACCENT_COLORS,
  PORTRAIT_PART_COUNTS,
  CombatPhilosophy,
  Background,
  StartingTechnique,
  calculateCustomizationDeltas,
  randomizeCosmetics
} from '../data/CustomizationData';

type CustomizeTab = 'cosmetics' | 'build';

export class CustomizeScene extends Phaser.Scene {
  private fighter!: Fighter;
  private currentTab: CustomizeTab = 'cosmetics';
  
  // Selected options
  private selectedPhilosophy: string | null = null;
  private selectedBackground: string | null = null;
  private selectedTechnique: string | null = null;
  
  // Cosmetic state
  private cosmetics = {
    firstName: '',
    lastName: '',
    nickname: '',
    faceIndex: 0,
    eyeIndex: 0,
    hairIndex: 0,
    beardIndex: 0,
    scarIndex: 0,
    warpaintIndex: 0,
    hoodIndex: 0,
    skinTone: '#d4a574',
    hairColor: '#3d2314',
    eyeColor: '#5a4a3a',
    accentColor: '#8b0000'
  };
  
  // UI elements
  private portraitContainer?: Phaser.GameObjects.Container;
  private statsContainer?: Phaser.GameObjects.Container;
  private contentContainer?: Phaser.GameObjects.Container;
  private powerText?: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'CustomizeScene' });
  }

  create(): void {
    const run = SaveSystem.getRun();
    if (!run.fighter) {
      this.scene.start('RecruitScene');
      return;
    }
    
    this.fighter = run.fighter;
    
    // Load existing customization or initialize from fighter
    const existingCustomization = SaveSystem.getCustomization();
    this.selectedPhilosophy = existingCustomization.philosophyId;
    this.selectedBackground = existingCustomization.backgroundId;
    this.selectedTechnique = existingCustomization.startingTechniqueId;
    
    // Initialize cosmetics from fighter
    this.cosmetics = {
      firstName: existingCustomization.cosmetics.firstName || this.fighter.firstName,
      lastName: existingCustomization.cosmetics.lastName || this.fighter.lastName,
      nickname: existingCustomization.cosmetics.nickname || this.fighter.nickname,
      faceIndex: existingCustomization.cosmetics.faceIndex || this.fighter.portrait.baseIndex,
      eyeIndex: existingCustomization.cosmetics.eyeIndex || this.fighter.portrait.eyeIndex,
      hairIndex: existingCustomization.cosmetics.hairIndex || this.fighter.portrait.hairIndex,
      beardIndex: existingCustomization.cosmetics.beardIndex || this.fighter.portrait.beardIndex,
      scarIndex: existingCustomization.cosmetics.scarIndex || this.fighter.portrait.scarIndex,
      warpaintIndex: existingCustomization.cosmetics.warpaintIndex || 0,
      hoodIndex: existingCustomization.cosmetics.hoodIndex || 0,
      skinTone: existingCustomization.cosmetics.skinTone || this.fighter.portrait.skinTone,
      hairColor: existingCustomization.cosmetics.hairColor || this.fighter.portrait.hairColor,
      eyeColor: existingCustomization.cosmetics.eyeColor || '#5a4a3a',
      accentColor: existingCustomization.cosmetics.accentColor || '#8b0000'
    };
    
    this.createBackground();
    this.createHeader();
    this.createPortraitPreview();
    this.createTabs();
    this.createContent();
    this.createStatsPreview();
    this.createBottomButtons();
    
    this.cameras.main.fadeIn(200);
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1510, 0x1a1510, 0x0a0805, 0x0a0805);
    bg.fillRect(0, 0, width, height);
    
    bg.lineStyle(2, 0x3a2a1a, 1);
    bg.strokeRect(5, 5, width - 10, height - 10);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    this.add.text(width / 2, safe.top + 20, 'CUSTOMIZE FIGHTER', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#c9a959'
    }).setOrigin(0.5);
  }

  private createPortraitPreview(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    const portraitY = safe.top + 80;
    this.portraitContainer = this.add.container(width / 2, portraitY);
    
    this.updatePortraitPreview();
    
    // Name display
    this.add.text(width / 2, portraitY + 50, `${this.cosmetics.firstName} "${this.cosmetics.nickname}" ${this.cosmetics.lastName}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9a959'
    }).setOrigin(0.5);
  }

  private updatePortraitPreview(): void {
    if (!this.portraitContainer) return;
    
    this.portraitContainer.removeAll(true);
    
    // Create a temporary portrait data for preview
    const previewPortrait = {
      ...this.fighter.portrait,
      baseIndex: this.cosmetics.faceIndex,
      eyeIndex: this.cosmetics.eyeIndex,
      hairIndex: this.cosmetics.hairIndex,
      beardIndex: this.cosmetics.beardIndex,
      scarIndex: this.cosmetics.scarIndex,
      skinTone: this.cosmetics.skinTone,
      hairColor: this.cosmetics.hairColor
    };
    
    const portrait = PortraitRenderer.renderPortrait(this, previewPortrait, 0, 0, 70);
    this.portraitContainer.add(portrait);
    
    // Accent color indicator
    const accentBg = this.add.graphics();
    accentBg.fillStyle(parseInt(this.cosmetics.accentColor.replace('#', ''), 16), 1);
    accentBg.fillRoundedRect(-12, 40, 24, 8, 2);
    this.portraitContainer.add(accentBg);
  }

  private createTabs(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const tabY = safe.top + 140;
    
    const tabs: { id: CustomizeTab; label: string; icon: string }[] = [
      { id: 'cosmetics', label: 'Appearance', icon: '🎨' },
      { id: 'build', label: 'Build', icon: '⚔️' }
    ];
    
    const tabWidth = (width - safe.left - safe.right) / tabs.length;
    
    tabs.forEach((tab, i) => {
      const x = safe.left + tabWidth * i + tabWidth / 2;
      const isActive = tab.id === this.currentTab;
      
      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x3a2a1a : 0x1a1510, 1);
      tabBg.fillRect(safe.left + tabWidth * i, tabY, tabWidth, 35);
      if (isActive) {
        tabBg.lineStyle(2, 0xc9a959, 1);
        tabBg.strokeRect(safe.left + tabWidth * i, tabY, tabWidth, 35);
      }
      
      this.add.text(x, tabY + 17, `${tab.icon} ${tab.label}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: isActive ? '#c9a959' : '#5a4a3a'
      }).setOrigin(0.5);
      
      const hitArea = this.add.rectangle(x, tabY + 17, tabWidth, 35, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        if (this.currentTab !== tab.id) {
          this.currentTab = tab.id;
          this.scene.restart();
        }
      });
    });
  }

  private createContent(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const contentY = safe.top + 185;
    const contentH = height * 0.38;
    
    this.contentContainer = this.add.container(0, contentY);
    
    if (this.currentTab === 'cosmetics') {
      this.createCosmeticsContent(safe.left + 10, 0, width - safe.left - safe.right - 20, contentH);
    } else {
      this.createBuildContent(safe.left + 10, 0, width - safe.left - safe.right - 20, contentH);
    }
  }

  private createCosmeticsContent(x: number, y: number, w: number, h: number): void {
    // Scrollable container for cosmetic options
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.6);
    bg.fillRoundedRect(x, y, w, h, 5);
    this.contentContainer!.add(bg);
    
    let currentY = y + 15;
    const rowHeight = 45;
    
    // Portrait part selectors
    const partSelectors = [
      { label: 'Face', key: 'faceIndex', max: PORTRAIT_PART_COUNTS.face },
      { label: 'Eyes', key: 'eyeIndex', max: PORTRAIT_PART_COUNTS.eyes },
      { label: 'Hair', key: 'hairIndex', max: PORTRAIT_PART_COUNTS.hair },
      { label: 'Beard', key: 'beardIndex', max: PORTRAIT_PART_COUNTS.beard },
      { label: 'Scars', key: 'scarIndex', max: PORTRAIT_PART_COUNTS.scar }
    ];
    
    partSelectors.forEach((part) => {
      this.createPartSelector(x + 10, currentY, w - 20, part.label, part.key, part.max);
      currentY += rowHeight;
    });
    
    // Color selectors
    currentY += 10;
    this.createColorSelector(x + 10, currentY, 'Skin', 'skinTone', SKIN_TONES);
    currentY += rowHeight;
    this.createColorSelector(x + 10, currentY, 'Hair Color', 'hairColor', HAIR_COLORS);
    currentY += rowHeight;
    this.createColorSelector(x + 10, currentY, 'Banner', 'accentColor', ACCENT_COLORS);
    
    // Randomize button
    const randomBtn = new Button(this, x + w / 2, currentY + rowHeight + 20, '🎲 Randomize', () => {
      const random = randomizeCosmetics();
      this.cosmetics = { ...this.cosmetics, ...random };
      this.updatePortraitPreview();
      this.updateStatsPreview();
    }, { width: 140, height: 40 });
    this.contentContainer!.add(randomBtn);
  }

  private createPartSelector(x: number, y: number, w: number, label: string, key: string, max: number): void {
    const currentValue = (this.cosmetics as Record<string, number | string>)[key] as number;
    
    this.contentContainer!.add(this.add.text(x, y + 10, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }));
    
    // Left arrow
    const leftBtn = new Button(this, x + w - 90, y + 10, '◀', () => {
      (this.cosmetics as Record<string, number | string>)[key] = (currentValue - 1 + max) % max;
      this.updatePortraitPreview();
    }, { width: 36, height: 30 });
    this.contentContainer!.add(leftBtn);
    
    // Value display
    this.contentContainer!.add(this.add.text(x + w - 55, y + 10, `${currentValue + 1}/${max}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#c9a959'
    }).setOrigin(0.5, 0));
    
    // Right arrow
    const rightBtn = new Button(this, x + w - 20, y + 10, '▶', () => {
      (this.cosmetics as Record<string, number | string>)[key] = (currentValue + 1) % max;
      this.updatePortraitPreview();
    }, { width: 36, height: 30 });
    this.contentContainer!.add(rightBtn);
  }

  private createColorSelector(x: number, y: number, label: string, key: keyof typeof this.cosmetics, colors: string[]): void {
    const currentValue = this.cosmetics[key] as string;
    const currentIndex = colors.indexOf(currentValue);
    
    this.contentContainer!.add(this.add.text(x, y + 10, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#8b7355'
    }));
    
    // Color swatches
    const swatchSize = 22;
    const startX = x + 80;
    colors.slice(0, 6).forEach((color, i) => {
      const swatchX = startX + i * (swatchSize + 4);
      const isSelected = color === currentValue;
      
      const swatch = this.add.graphics();
      swatch.fillStyle(parseInt(color.replace('#', ''), 16), 1);
      swatch.fillRoundedRect(swatchX, y + 5, swatchSize, swatchSize, 3);
      if (isSelected) {
        swatch.lineStyle(2, 0xc9a959, 1);
        swatch.strokeRoundedRect(swatchX, y + 5, swatchSize, swatchSize, 3);
      }
      this.contentContainer!.add(swatch);
      
      const hitArea = this.add.rectangle(swatchX + swatchSize / 2, y + 5 + swatchSize / 2, swatchSize, swatchSize, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        (this.cosmetics as unknown as Record<string, string>)[key] = color;
        this.updatePortraitPreview();
        this.scene.restart();
      });
      this.contentContainer!.add(hitArea);
    });
  }

  private createBuildContent(x: number, y: number, w: number, h: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0805, 0.6);
    bg.fillRoundedRect(x, y, w, h, 5);
    this.contentContainer!.add(bg);
    
    let currentY = y + 10;
    
    // Combat Philosophy section
    this.contentContainer!.add(this.add.text(x + 10, currentY, 'COMBAT PHILOSOPHY', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#c9a959'
    }));
    currentY += 20;
    
    this.createOptionRow(x + 5, currentY, w - 10, COMBAT_PHILOSOPHIES, 'philosophy');
    currentY += 70;
    
    // Background section
    this.contentContainer!.add(this.add.text(x + 10, currentY, 'BACKGROUND', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#c9a959'
    }));
    currentY += 20;
    
    this.createOptionRow(x + 5, currentY, w - 10, BACKGROUNDS, 'background');
    currentY += 70;
    
    // Starting Technique section
    this.contentContainer!.add(this.add.text(x + 10, currentY, 'STARTING TECHNIQUE', {
      fontFamily: 'Georgia, serif',
      fontSize: '10px',
      color: '#c9a959'
    }));
    currentY += 20;
    
    this.createOptionRow(x + 5, currentY, w - 10, STARTING_TECHNIQUES, 'technique');
  }

  private createOptionRow(x: number, y: number, w: number, options: (CombatPhilosophy | Background | StartingTechnique)[], type: 'philosophy' | 'background' | 'technique'): void {
    const cardWidth = Math.min(70, (w - 20) / 4);
    const spacing = 5;
    let cardX = x + 10;
    
    options.slice(0, 4).forEach((option) => {
      const isSelected = (type === 'philosophy' && this.selectedPhilosophy === option.id) ||
                         (type === 'background' && this.selectedBackground === option.id) ||
                         (type === 'technique' && this.selectedTechnique === option.id);
      
      const card = this.add.container(cardX, y);
      
      // Card background
      const cardBg = this.add.graphics();
      cardBg.fillStyle(isSelected ? 0x2a4a2a : 0x1a1510, 1);
      cardBg.fillRoundedRect(0, 0, cardWidth, 55, 4);
      cardBg.lineStyle(isSelected ? 2 : 1, isSelected ? 0x6b8e23 : 0x3a2a1a, 1);
      cardBg.strokeRoundedRect(0, 0, cardWidth, 55, 4);
      card.add(cardBg);
      
      // Icon
      card.add(this.add.text(cardWidth / 2, 15, option.icon, {
        fontSize: '18px'
      }).setOrigin(0.5));
      
      // Name
      card.add(this.add.text(cardWidth / 2, 38, option.name.split(' ')[0], {
        fontFamily: 'Georgia, serif',
        fontSize: '9px',
        color: isSelected ? '#c9a959' : '#8b7355'
      }).setOrigin(0.5));
      
      // Hit area
      const hitArea = this.add.rectangle(cardWidth / 2, 27, cardWidth, 55, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        console.log(`[Customize] Option selected: type=${type}, id=${option.id}`);
        
        // Toggle selection
        if (type === 'philosophy') {
          this.selectedPhilosophy = this.selectedPhilosophy === option.id ? null : option.id;
          // Save immediately
          SaveSystem.setPhilosophy(this.selectedPhilosophy);
          console.log(`[Customize] Philosophy saved: ${this.selectedPhilosophy}`);
        } else if (type === 'background') {
          this.selectedBackground = this.selectedBackground === option.id ? null : option.id;
          // Save immediately
          SaveSystem.setBackground(this.selectedBackground);
          console.log(`[Customize] Background saved: ${this.selectedBackground}`);
        } else {
          this.selectedTechnique = this.selectedTechnique === option.id ? null : option.id;
          // Save immediately
          SaveSystem.setStartingTechnique(this.selectedTechnique);
          console.log(`[Customize] Technique saved: ${this.selectedTechnique}`);
        }
        
        // Apply changes to fighter and refresh UI
        SaveSystem.applyCustomizationToFighter();
        this.updateStatsPreview();
        this.scene.restart();
      });
      card.add(hitArea);
      
      this.contentContainer!.add(card);
      cardX += cardWidth + spacing;
    });
  }

  private createStatsPreview(): void {
    const { width, height } = this.cameras.main;
    const safe = getSafeArea();
    
    const panelY = height * 0.72;
    const panelH = 65;
    
    this.statsContainer = this.add.container(0, panelY);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 0.9);
    bg.fillRoundedRect(safe.left + 10, 0, width - safe.left - safe.right - 20, panelH, 5);
    bg.lineStyle(1, 0x3a2a1a, 1);
    bg.strokeRoundedRect(safe.left + 10, 0, width - safe.left - safe.right - 20, panelH, 5);
    this.statsContainer.add(bg);
    
    this.updateStatsPreview();
  }

  private updateStatsPreview(): void {
    if (!this.statsContainer) return;
    
    // Clear existing text (keep background)
    this.statsContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.destroy();
      }
    });
    
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    
    // Calculate stat deltas
    const deltas = calculateCustomizationDeltas(this.selectedPhilosophy, this.selectedBackground);
    
    // Power calculation
    const powerResult = calculatePower(this.fighter);
    const assessment = getPowerAssessment(powerResult);
    
    // Title
    this.statsContainer.add(this.add.text(safe.left + 20, 10, 'STAT CHANGES', {
      fontFamily: 'Georgia, serif',
      fontSize: '9px',
      color: '#c9a959'
    }));
    
    // Power display
    this.statsContainer.add(this.add.text(width - safe.right - 25, 10, `⚡ ${formatPower(powerResult.power)}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: assessment.color
    }).setOrigin(1, 0));
    
    // Stat delta display
    let deltaX = safe.left + 20;
    const deltaY = 30;
    
    const statLabels: Record<string, string> = {
      attack: 'ATK',
      defense: 'DEF',
      maxHP: 'HP',
      maxStamina: 'STA',
      critChance: 'CRIT',
      evasion: 'DODGE',
      accuracy: 'ACC',
      guard: 'GUARD'
    };
    
    Object.entries(deltas).forEach(([stat, value]) => {
      if (value === 0) return;
      
      const label = statLabels[stat] || stat.toUpperCase();
      const color = value > 0 ? '#6b8e23' : '#cd5c5c';
      const text = value > 0 ? `+${value}` : `${value}`;
      
      this.statsContainer!.add(this.add.text(deltaX, deltaY, `${label}: ${text}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color
      }));
      
      deltaX += 70;
    });
    
    if (Object.keys(deltas).length === 0) {
      this.statsContainer.add(this.add.text(safe.left + 20, deltaY, 'No stat changes selected', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        color: '#5a4a3a'
      }));
    }
    
    // Technique display
    if (this.selectedTechnique) {
      const tech = STARTING_TECHNIQUES.find(t => t.id === this.selectedTechnique);
      if (tech) {
        this.statsContainer.add(this.add.text(safe.left + 20, 48, `${tech.icon} ${tech.effect}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '9px',
          color: '#6b8e23'
        }));
      }
    }
  }

  private createBottomButtons(): void {
    const { width } = this.cameras.main;
    const safe = getSafeArea();
    const btnY = anchorBottom(this, 40);
    
    // Back button
    new Button(this, safe.left + 70, btnY, '← BACK', () => {
      this.cameras.main.fadeOut(200);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CampScene');
      });
    }, { width: 100, height: 44 });
    
    // Confirm button
    new Button(this, width - safe.right - 80, btnY, '✓ CONFIRM', () => {
      this.saveCustomization();
      this.cameras.main.fadeOut(200);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CampScene');
      });
    }, { width: 120, height: 44, primary: true });
  }

  private saveCustomization(): void {
    // Save all customization choices
    SaveSystem.setCustomization({
      philosophyId: this.selectedPhilosophy,
      backgroundId: this.selectedBackground,
      startingTechniqueId: this.selectedTechnique,
      cosmetics: this.cosmetics
    });
    
    // Apply customization to fighter
    SaveSystem.applyCustomizationToFighter();
    
    // If we have a starting technique, add it to techniques
    if (this.selectedTechnique) {
      const run = SaveSystem.getRun();
      run.techniques[this.selectedTechnique] = 1;
      SaveSystem.updateRun({ techniques: run.techniques });
    }
  }
}
