import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // Setup global: hace login UNA vez antes de todos los tests de admin
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts/,
    },
    // Tests E2E del panel admin (requieren auth)
    {
      name: 'admin-e2e',
      testMatch: /e2e\/.+\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: path.resolve(__dirname, '.auth/admin.json'),
      },
    },
    // Tests de API (sin UI)
    {
      name: 'api',
      testMatch: /api\/.+\.spec\.ts/,
    },
    // Tests visuales (desktop)
    {
      name: 'visual-desktop',
      testMatch: /visual\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests visuales (mobile)
    {
      name: 'visual-mobile',
      testMatch: /visual\/.+\.spec\.ts/,
      use: { ...devices['iPhone 14'] },
    },
    // Tests de accesibilidad (A11y)
    {
      name: 'a11y',
      testMatch: /a11y\/.+\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
