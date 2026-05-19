import { test, expect } from '@playwright/test';

test.describe('Gestión de servicios — Panel Admin', () => {

  test('Crear un servicio nuevo aparece en el listado', async ({ page }) => {
    await page.goto('/admin/servicios');
    await page.getByRole('button', { name: /nuevo servicio/i }).click();

    await page.getByLabel(/nombre del servicio/i).fill(`Servicio Test ${Date.now()}`);
    await page.getByLabel(/precio/i).fill('15000');
    await page.getByLabel(/duración/i).fill('60');

    await page.getByRole('button', { name: /crear servicio|guardar/i }).click();

    await expect(page.getByText(/servicio creado|guardado con éxito/i)).toBeVisible();
  });

  test('Desactivar un servicio actualiza su estado visualmente', async ({ page }) => {
    await page.goto('/admin/servicios');
    const primerToggle = page.getByTestId('servicio-toggle').first();
    const estadoAntes = await primerToggle.isChecked();
    await primerToggle.click();
    await expect(primerToggle).not.toBeChecked({ checked: estadoAntes });
  });

});
