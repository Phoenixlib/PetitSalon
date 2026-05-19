import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

test.use({ storageState: { cookies: [], origins: [] } });

function formatViolations(violations: Result[]): string {
  return violations.map(v =>
    `\n[${v.impact?.toUpperCase()}] ${v.id}\n` +
    `  Elementos: ${v.nodes.map(n => n.target.join(' > ')).join(' | ')}\n` +
    `  Doc: ${v.helpUrl}`
  ).join('\n');
}

test('Landing — sin violaciones WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(
    results.violations,
    `Violaciones:${formatViolations(results.violations)}`
  ).toHaveLength(0);
});

test('Formulario de reseña — accesibilidad completa', async ({ page }) => {
  const token = process.env.TEST_REVIEW_TOKEN!;
  await page.goto(`/resena/${token}`);
  await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(
    results.violations,
    `Violaciones:${formatViolations(results.violations)}`
  ).toHaveLength(0);
});
