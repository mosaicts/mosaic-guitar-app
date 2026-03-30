/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import path from 'path';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [!process.env.VITEST && reactRouter(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: './test/setup.ts',
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, './test/e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app')
    }
  }
});
