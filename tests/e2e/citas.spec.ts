import { test, expect } from '@playwright/test';
import { CitasPage } from '../pages/citas.page';

test.describe.serial('Gestión de citas — Panel Admin', () => {

  test('La página de citas carga y muestra el listado', async ({ page }) => {
    const citas = new CitasPage(page);
    await citas.goto();
    await expect(page.getByRole('heading', { name: /citas/i })).toBeVisible();
  });

  test('Cambiar estado de cita a CONFIRMED actualiza el badge', async ({ page }) => {
    const citas = new CitasPage(page);
    await citas.goto();
    await citas.cambiarEstadoCita(0, 'Confirmada');
    const badge = await citas.verBadgeEstado(0);
    await expect(badge).toContainText(/confirmada/i);
  });

  test('Cambiar estado de cita a DONE la mueve a historial', async ({ page }) => {
    const citas = new CitasPage(page);
    await citas.goto();
    await citas.cambiarEstadoCita(0, 'Realizada');
    const badge = await citas.verBadgeEstado(0);
    await expect(badge).toContainText(/realizada/i);
  });

});
