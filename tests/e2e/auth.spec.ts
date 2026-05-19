import { test, expect } from '@playwright/test';

// Este test NO usa storageState (verifica el login desde cero)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticación del panel admin', () => {

  test('Login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/correo/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('Login con contraseña incorrecta muestra error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/correo/i).fill('admin@petitsalon.cl');
    await page.getByLabel(/contraseña/i).fill('contraseña-incorrecta');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test('Acceder a /admin sin sesión redirige al login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Acceder a /admin/citas sin sesión redirige al login', async ({ page }) => {
    await page.goto('/admin/citas');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

});
