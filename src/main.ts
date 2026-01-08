/**
 * Bloodline Arena - Main Entry Point
 * A gritty medieval gladiator roguelite with permadeath
 */

import Phaser from 'phaser';
import { errorOverlay } from './systems/ErrorOverlay';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { RecruitScene } from './scenes/RecruitScene';
import { PromiseScene } from './scenes/PromiseScene';
import { CampScene } from './scenes/CampScene';
import { ShopScene } from './scenes/ShopScene';
import { FightScene } from './scenes/FightScene';
import { ResultsScene } from './scenes/ResultsScene';
import { DeathScene } from './scenes/DeathScene';
import { HallOfLegendsScene } from './scenes/HallOfLegendsScene';
import { BloodlinePerksScene } from './scenes/BloodlinePerksScene';
import { SettingsScene } from './scenes/SettingsScene';
import { VignetteScene } from './scenes/VignetteScene';
import { LetterScene } from './scenes/LetterScene';
import { RelicChoiceScene } from './scenes/RelicChoiceScene';
import { TrainingScene } from './scenes/TrainingScene';
import { PrepareScene } from './scenes/PrepareScene';
import { CharacterSheetScene } from './scenes/CharacterSheetScene';
import { CustomizeScene } from './scenes/CustomizeScene';
import { DecreeDraftScene } from './scenes/DecreeDraftScene';
import { ForgeScene } from './scenes/ForgeScene';
import { WeaponMasteryScene } from './scenes/WeaponMasteryScene';
import { RunMapScene } from './scenes/RunMapScene';
import { CodexScene } from './scenes/CodexScene';
import { RunSummaryScene } from './scenes/RunSummaryScene';

// Calculate game dimensions for mobile-first design
const getGameConfig = (): Phaser.Types.Core.GameConfig => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;
  
  // Base dimensions (portrait-first for mobile)
  let width = 390;  // iPhone 14 width
  let height = 844; // iPhone 14 height
  
  // Adjust for desktop/landscape
  if (!isMobile && !isPortrait) {
    width = 600;
    height = 900;
  }
  
  return {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: width,
    height: height,
    backgroundColor: '#1a1410',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: 320,
        height: 480
      },
      max: {
        width: 600,
        height: 1200
      }
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: true
    },
    input: {
      activePointers: 3,
      touch: {
        capture: true
      }
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      RecruitScene,
      PromiseScene,
      CampScene,
      ShopScene,
      FightScene,
      ResultsScene,
      DeathScene,
      HallOfLegendsScene,
      BloodlinePerksScene,
      SettingsScene,
      VignetteScene,
      LetterScene,
      RelicChoiceScene,
      TrainingScene,
      PrepareScene,
      CharacterSheetScene,
      CustomizeScene,
      DecreeDraftScene,
      ForgeScene,
      WeaponMasteryScene,
      RunMapScene,
      CodexScene,
      RunSummaryScene
    ],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    }
  };
};

// Initialize the game
const config = getGameConfig();
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => {
  if (e.target instanceof HTMLCanvasElement) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.target instanceof HTMLCanvasElement) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Debug info in development
if (import.meta.env?.DEV) {
  console.log('Bloodline Arena - Development Mode');
  console.log('Game Config:', config);
}

// Error overlay is automatically initialized on import
console.log('[Main] Error overlay initialized');

// Add global scene transition logging
game.events.on('prestep', () => {
  // Scene manager events for debugging
});

// Log scene changes
const originalStart = Phaser.Scenes.ScenePlugin.prototype.start;
Phaser.Scenes.ScenePlugin.prototype.start = function(key: string, data?: object) {
  const currentKey = this.scene?.scene?.key || 'unknown';
  console.log(`[Scene] Transition: ${currentKey} → ${key}`, data || '');
  return originalStart.call(this, key, data);
};

// Catch Phaser loader errors globally
game.events.on('loaderror', (file: Phaser.Loader.File) => {
  const url = typeof file.src === 'string' ? file.src : String(file.src ?? file.url ?? 'unknown');
  errorOverlay.addLoaderError(file.key, url);
});
