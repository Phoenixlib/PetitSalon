import { test, expect } from '@playwright/test';

test.describe('GET /api/services', () => {

  test('Devuelve lista de servicios activos con el contrato correcto', async ({ request }) => {
    const response = await request.get('/api/services');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const json = await response.json();
    expect(Array.isArray(json)).toBeTruthy();
    expect(json.length).toBeGreaterThan(0);

    // Validar contrato del primer servicio
    const first = json[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('duration');
    expect(typeof first.price).toBe('number');
    expect(first.isActive).toBe(true); // Solo activos
  });

});
