/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    // vitestPreview()
  ],
  resolve: {
    conditions: ['node', 'import', 'module', 'browser', 'default'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.storybook/**',
      '**/*.stories.tsx',
      'src/__tests__/e2e/**', // E2E 테스트는 Playwright로만 실행
    ],
    coverage: {
      reportsDirectory: './.coverage',
      reporter: ['lcov', 'json', 'json-summary'],
    },
    // Storybook tests는 별도 프로젝트로 분리
    projects: [
      {
        extends: true,
        resolve: {
          conditions: ['node', 'import'],
          alias: {
            'msw/node': path.resolve(dirname, 'node_modules/msw/lib/node/index.mjs'),
          },
        },
        test: {
          name: 'unit-tests',
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/setupTests.ts',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.storybook/**',
            '**/*.stories.tsx',
            'src/__tests__/e2e/**', // E2E 테스트는 Playwright로만 실행
          ],
          server: {
            deps: {
              inline: ['msw'],
            },
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          include: ['**/*.stories.tsx'],
        },
      },
    ],
  },
});
