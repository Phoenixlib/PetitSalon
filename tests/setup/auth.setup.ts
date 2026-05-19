import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/admin.json');

setup('Autenticar administradora', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel(/correo/i).fill(process.env.TEST_ADMIN_EMAIL!);
  await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.context().storageState({ path: authFile });
});
