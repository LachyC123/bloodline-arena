import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages deployment at /<repo>/
  // Change to '/' for custom domain or username.github.io root
  base: '/bloodline-arena/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'public/assets'),
      '@data': resolve(__dirname, 'src/data'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@ui': resolve(__dirname, 'src/ui')
    }
  },
  
  server: {
    port: 3000,
    open: true
  },
  
  preview: {
    port: 4173
  }
});
