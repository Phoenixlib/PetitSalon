import { test, expect, devices } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('Landing desktop — apariencia sin cambios', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await expect(page).toHaveScreenshot('landing-desktop.png', {
    mask: [
      page.getByTestId('reviews-section'),   // reseñas dinámicas
      page.getByTestId('gallery-section'),   // fotos dinámicas
    ],
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});

test.use({ ...devices['iPhone 14'] });

test('Landing mobile — apariencia sin cambios', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await expect(page).toHaveScreenshot('landing-mobile.png', {
    mask: [
      page.getByTestId('reviews-section'),
      page.getByTestId('gallery-section'),
    ],
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
  });
});
