import {defineConfig} from 'vite';
import path from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/dye/playground/' : '/',
  resolve: {
    alias: {
      'dye-engine': path.resolve(__dirname, '../../packages/engine/src/main.ts'),
      'dye-canvas': path.resolve(__dirname, '../../packages/canvas/src/main.ts'),
      'dye-svg': path.resolve(__dirname, '../../packages/svg/src/main.ts'),
      'dye-shape': path.resolve(__dirname, '../../packages/shape/src/main.ts'),
      'dye-path': path.resolve(__dirname, '../../packages/path/src/main.ts'),
      'dye-bounding': path.resolve(__dirname, '../../packages/bounding/src/main.ts'),
      'dye-ease': path.resolve(__dirname, '../../packages/ease/src/main.ts'),
      'dye-curve': path.resolve(__dirname, '../../packages/curve/src/main.ts'),
      'dye-interpolate': path.resolve(__dirname, '../../packages/interpolate/src/main.ts'),
      'dye-core': path.resolve(__dirname, '../../packages/core/src/main.ts'),
      'dye-gradient': path.resolve(__dirname, '../../packages/gradient/src/main.ts'),
      'dye-dom': path.resolve(__dirname, '../../packages/dom/src/main.ts'),
    },
  },
  server: {
    port: 5174,
  },
});
