import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Settings', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/settings.html`);
  });

  test('Settings page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Settings|Bramblewood/);
    await expect(page.getByText('BramblewoodCare')).toBeVisible();
  });

  test('Main navigation is present', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
