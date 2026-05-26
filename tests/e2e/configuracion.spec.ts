import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Configuración - Cambio de contraseña', () => {
  test('Flujo completo de cambio de contraseña y restauración', async ({ page }) => {
    // 1. Iniciar sesión
    await page.goto('/admin/login');
    await page.getByLabel(/correo/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/admin$/);

    // 2. Navegar a Configuración
    await page.getByRole('link', { name: /configuración/i }).click();
    await expect(page).toHaveURL(/\/admin\/configuracion$/);
    await expect(page.getByRole('heading', { name: /configuración/i })).toBeVisible();

    // 3. Intentar cambio con contraseña actual incorrecta
    await page.getByLabel(/contraseña actual/i).fill('incorrecta');
    await page.getByLabel(/nueva contraseña/i).fill('nueva1234');
    await page.getByLabel(/confirmar nueva contraseña/i).fill('nueva1234');
    await page.getByRole('button', { name: /actualizar contraseña/i }).click();
    await expect(page.getByRole('alert')).toContainText(/incorrecta/i);

    // 4. Cambiar contraseña con valores correctos
    const originalPassword = process.env.TEST_ADMIN_PASSWORD!;
    const newPassword = 'adminnewpassword123';
    
    await page.getByLabel(/contraseña actual/i).fill(originalPassword);
    await page.getByLabel(/nueva contraseña/i).fill(newPassword);
    await page.getByLabel(/confirmar nueva contraseña/i).fill(newPassword);
    await page.getByRole('button', { name: /actualizar contraseña/i }).click();
    await expect(page.locator('text=Contraseña actualizada exitosamente')).toBeVisible();

    // 5. Cerrar sesión
    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    // 6. Intentar iniciar sesión con la contraseña anterior (debería fallar)
    await page.getByLabel(/correo/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(originalPassword);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    // 7. Iniciar sesión con la nueva contraseña (debería funcionar)
    await page.getByLabel(/correo/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(newPassword);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/admin$/);

    // 8. Restaurar la contraseña original para dejar el entorno limpio
    await page.getByRole('link', { name: /configuración/i }).click();
    await page.getByLabel(/contraseña actual/i).fill(newPassword);
    await page.getByLabel(/nueva contraseña/i).fill(originalPassword);
    await page.getByLabel(/confirmar nueva contraseña/i).fill(originalPassword);
    await page.getByRole('button', { name: /actualizar contraseña/i }).click();
    await expect(page.locator('text=Contraseña actualizada exitosamente')).toBeVisible();
  });
});
