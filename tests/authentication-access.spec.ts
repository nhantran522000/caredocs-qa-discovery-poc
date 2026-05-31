import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Authentication Access', () => {
  test('Login button is labeled Sign In', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('Login form has email and password fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('Login page displays BramblewoodCare brand', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByText('BramblewoodCare')).toBeVisible();
  });
});
