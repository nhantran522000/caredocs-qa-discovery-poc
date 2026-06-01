import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Dashboard Homepage', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate via login for authenticated context
    await page.goto(`${BASE_URL}/index.html`);
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard\.html/);
  });

  test('Dashboard displays Activity Log in navigation', async ({ page }) => {
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Activity Log' })).toBeVisible();
  });

  test('Dashboard shows shift summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
    await expect(page.getByText(/residents under your care/)).toBeVisible();
    await expect(page.getByText(/Next medication round/)).toBeVisible();
  });

  test('Navigate to Activity Log from Dashboard', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Activity Log' }).click();
    await expect(page).toHaveURL(/.*activity-log\.html/);
    await expect(page.getByRole('heading', { name: 'Activity log' })).toBeVisible();
  });
});
