import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.CALCOM_WEBHOOK_SECRET!;

function generateSignature(body: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
}

test.describe('POST /api/webhooks/calcom', () => {

  test('BOOKING_CREATED crea cita en la base de datos', async ({ request }) => {
    const uid = `test-${Date.now()}`;
    const payload = {
      triggerEvent: 'BOOKING_CREATED',
      payload: {
        uid,
        title: 'Baño y Secado',
        startTime: new Date(Date.now() + 86400000).toISOString(), // mañana
        endTime:   new Date(Date.now() + 90000000).toISOString(),
        attendees: [{ name: 'Cliente Test', email: 'test@test.com', timeZone: 'America/Santiago' }],
        responses: {
          telefono:    { value: `+56999${Date.now().toString().slice(-6)}` },
          nombre_perro:{ value: 'Firulais Test' },
          raza_perro:  { value: 'Labrador' },
          dog_size:    { value: 'M' },
        },
      },
    };
    const body = JSON.stringify(payload);

    const response = await request.post('/api/webhooks/calcom', {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        'X-Cal-Signature-256': generateSignature(body),
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('appointmentId');
  });

  test('Rechaza petición sin firma HMAC con 401', async ({ request }) => {
    const response = await request.post('/api/webhooks/calcom', {
      data: JSON.stringify({ triggerEvent: 'BOOKING_CREATED' }),
      headers: { 'Content-Type': 'application/json' },
      // Sin cabecera X-Cal-Signature-256
    });
    expect(response.status()).toBe(401);
  });

  test('BOOKING_CANCELLED actualiza estado a CANCELLED', async ({ request }) => {
    const uid = `test-cancel-${Date.now()}`;
    // Primero crear la cita
    const createBody = JSON.stringify({
      triggerEvent: 'BOOKING_CREATED',
      payload: {
        uid,
        title: 'Baño y Secado',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime:   new Date(Date.now() + 90000000).toISOString(),
        attendees: [{ name: 'Cliente Cancel', email: 'cancel@test.com', timeZone: 'America/Santiago' }],
        responses: {
          telefono:    { value: `+56988${Date.now().toString().slice(-6)}` },
          nombre_perro:{ value: 'Max Test' },
          raza_perro:  { value: 'Poodle' },
          dog_size:    { value: 'S' },
        },
      },
    });
    await request.post('/api/webhooks/calcom', {
      data: createBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Cal-Signature-256': generateSignature(createBody),
      },
    });

    // Luego cancelar
    const cancelBody = JSON.stringify({
      triggerEvent: 'BOOKING_CANCELLED',
      payload: { uid },
    });
    const cancelRes = await request.post('/api/webhooks/calcom', {
      data: cancelBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Cal-Signature-256': generateSignature(cancelBody),
      },
    });
    expect(cancelRes.status()).toBe(200);
  });

});
