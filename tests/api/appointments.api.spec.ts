import { test, expect } from '@playwright/test';

test.describe('GET /api/admin/appointments', () => {

  test('Sin autenticación devuelve 401', async ({ request }) => {
    const response = await request.get('/api/admin/appointments');
    expect(response.status()).toBe(401);
  });

});
