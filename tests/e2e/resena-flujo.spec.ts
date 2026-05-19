import { test, expect } from '@playwright/test';

// Este test accede como cliente (sin auth admin)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Flujo de reseña por token', () => {

  test('Token válido muestra formulario de reseña', async ({ page }) => {
    // El token debe existir en la DB de test — seedear previamente
    const token = process.env.TEST_REVIEW_TOKEN!;
    await page.goto(`/resena/${token}`);
    await expect(page.getByRole('heading', { name: /¿cómo fue tu experiencia/i })).toBeVisible();
    await expect(page.getByRole('group', { name: /calificación/i })).toBeVisible();
  });

  test('Token inválido muestra error 404 o mensaje claro', async ({ page }) => {
    await page.goto('/resena/token-inexistente-abc123');
    // Espera: página de error o mensaje "reseña no encontrada"
    const body = page.locator('body');
    const hasError = await body.getByText(/no encontrad|no válid|expirad/i).isVisible().catch(() => false);
    const hasNotFound = page.url().includes('404') || await page.title().then(t => t.includes('404'));
    expect(hasError || hasNotFound).toBeTruthy();
  });

  test('Enviar reseña completa muestra confirmación', async ({ page }) => {
    const token = process.env.TEST_REVIEW_TOKEN!;
    await page.goto(`/resena/${token}`);

    // Seleccionar 5 estrellas
    await page.getByRole('radio', { name: /5 estrellas/i }).click();

    // Escribir texto
    await page.getByRole('textbox', { name: /comentario/i }).fill('Excelente servicio, muy profesional. 10/10');

    // Enviar
    await page.getByRole('button', { name: /enviar reseña/i }).click();

    // Verificar confirmación
    await expect(page.getByText(/gracias|confirmad/i)).toBeVisible();
  });

});
