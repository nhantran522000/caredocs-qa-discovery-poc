import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Residents Register', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/residents.html`);
  });

  test('Residents page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Residents|Bramblewood/);
    await expect(page.getByText('BramblewoodCare')).toBeVisible();
  });

  test('Main navigation is present', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
