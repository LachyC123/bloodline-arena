# Bloodline Arena

A gritty medieval gladiator roguelite with true permadeath and deep character attachment systems. Built with Phaser 3 and TypeScript.

![Bloodline Arena](public/assets/icons/icon.svg)

## 🎮 Game Overview

**Bloodline Arena** is a Swords & Sandals–inspired browser game where you recruit fighters, manage them between bouts, build emotional bonds, and enter turn-based arena duels. When your fighter dies, they are gone forever—but their legacy continues through bloodline perks, a hall of legends, and recovered heirlooms.

### Features

- **True Permadeath**: When your fighter falls, they're gone forever
- **Deep Character Attachment**: Names, backstories, keepsakes, trust meters, and personal evolution
- **Turn-Based Combat**: Target zones, stamina management, perfect parries, and crowd hype
- **Meta Progression**: Bloodline perks, promoter reputation, and legacy systems
- **Gritty Medieval Aesthetic**: Painterly ink-wash visuals with woodcut influences
- **Mobile-First Design**: Optimized for iPhone and touch controls
- **Offline-Ready**: All assets bundled locally, no CDN dependencies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bloodline-arena.git
cd bloodline-arena

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open automatically at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## 📱 Mobile Installation (Add to Home Screen)

### iPhone / iOS Safari

1. Open the game in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Bloodline Arena" and tap "Add"

The game will now appear as a full-screen app on your home screen.

### Android / Chrome

1. Open the game in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Confirm the installation

## 🌐 GitHub Pages Deployment

This project is configured to deploy to GitHub Pages at `/<repo>/` (e.g., `/bloodline-arena/`).

### Automatic Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Manual Deployment

```bash
# Install gh-pages if not already installed
npm install -g gh-pages

# Build and deploy
npm run build
npx gh-pages -d dist
```

Then enable GitHub Pages in your repository settings, pointing to the `gh-pages` branch.

### Custom Domain Configuration

To use a custom domain instead of `username.github.io/bloodline-arena/`:

1. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/', // Change from '/bloodline-arena/'
     // ...rest of config
   });
   ```

2. Add a `CNAME` file to the `public/` folder with your domain:
   ```
   yourdomain.com
   ```

3. Configure DNS with your domain provider

### Root Domain (username.github.io)

If deploying to your root GitHub Pages site:

1. Rename the repository to `username.github.io`
2. Update `vite.config.ts`:
   ```typescript
   base: '/',
   ```

## 🎯 Game Controls

### Mobile (Touch)
- **Tap**: Select options, execute actions
- **Tap zones**: Target head/body/legs in combat
- **Hold**: Confirm dangerous actions

### Desktop (Keyboard)
- **1-6**: Combat actions (Light, Heavy, Guard, Dodge, Special, Item)
- **Q/W/E**: Target zones (Head/Body/Legs)
- **Enter**: Confirm selections
- **Escape**: Back/Cancel

## 🏗️ Project Structure

```
bloodline-arena/
├── src/
│   ├── main.ts              # Entry point
│   ├── scenes/              # Phaser scenes
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── RecruitScene.ts
│   │   ├── PromiseScene.ts
│   │   ├── CampScene.ts
│   │   ├── ShopScene.ts
│   │   ├── FightScene.ts
│   │   ├── ResultsScene.ts
│   │   ├── DeathScene.ts
│   │   ├── HallOfLegendsScene.ts
│   │   ├── BloodlinePerksScene.ts
│   │   ├── SettingsScene.ts
│   │   └── VignetteScene.ts
│   ├── systems/             # Game systems
│   │   ├── SaveSystem.ts
│   │   ├── RNGSystem.ts
│   │   ├── FighterSystem.ts
│   │   ├── CombatSystem.ts
│   │   ├── EnemySystem.ts
│   │   └── LegacySystem.ts
│   ├── data/                # Game data
│   │   ├── FighterData.ts
│   │   ├── CombatData.ts
│   │   ├── EnemyData.ts
│   │   └── VignettesData.ts
│   └── ui/                  # UI components
│       ├── UIHelper.ts
│       ├── PortraitRenderer.ts
│       └── AssetGenerator.ts
├── public/
│   ├── manifest.json        # PWA manifest
│   └── assets/
│       └── icons/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📊 Game Data

All game content is data-driven and can be customized:

- **Traits**: `src/data/FighterData.ts` - 12+ signature traits, positive traits, and flaws
- **Items**: `src/data/CombatData.ts` - Weapons, armor, and consumables
- **Enemies**: `src/data/EnemyData.ts` - 8 enemy archetypes with unique AI
- **Vignettes**: `src/data/VignettesData.ts` - 20+ narrative encounters
- **Names**: `src/data/FighterData.ts` - 30+ nicknames and name components

## ⚙️ Settings

Accessible from the main menu:

- **Reduce Motion**: Minimizes particles and animations
- **Screen Shake**: Toggle combat impact effects
- **Blood Effects**: Toggle blood particles (tasteful)
- **Grain/Ink FX**: Toggle atmospheric overlays
- **Sound**: Master audio toggle (audio coming soon)
- **Reset Save**: Complete data wipe (hold to confirm)

## 🔧 Development

### Adding New Content

1. **New Trait**: Add to `TRAITS_DATA` in `src/data/FighterData.ts`
2. **New Enemy**: Add archetype to `ENEMY_ARCHETYPES` in `src/data/EnemyData.ts`
3. **New Vignette**: Add to `VIGNETTES_DATA` in `src/data/VignettesData.ts`
4. **New Item**: Add to `WEAPONS_DATA`, `ARMOR_DATA`, or `COMBAT_ITEMS` in `src/data/CombatData.ts`

### Modifying Combat

The combat system is in `src/systems/CombatSystem.ts`:
- `ACTION_CONFIG`: Stamina costs, damage multipliers
- `ZONE_MODIFIERS`: Head/body/legs effects
- `executeAction()`: Main combat logic

### Customizing Visuals

All assets are procedurally generated in `src/ui/AssetGenerator.ts`. Modify:
- `generateParchmentOverlay()`: Background textures
- `generateVignette()`: Edge darkening
- Portrait rendering in `src/ui/PortraitRenderer.ts`

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- **Engine**: [Phaser 3](https://phaser.io/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Inspiration**: Swords & Sandals series

---

*Blood. Honor. Legacy.*
