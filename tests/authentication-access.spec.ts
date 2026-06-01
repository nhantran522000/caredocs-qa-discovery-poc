import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Authentication Access — Login', () => {

  test('Staff sees the login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('Login form has correct helper text', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByText('Use your staff email and password to continue.')).toBeVisible();
  });

  test('Login page displays the BramblewoodCare brand', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByText('BramblewoodCare')).toBeVisible();
  });

  test('Login button is labeled Sign In', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    const submitButton = page.getByRole('button', { name: 'Sign In' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Sign In');
  });

  test('Login with empty fields shows validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Check for validation feedback (browser native or custom)
    const emailField = page.getByRole('textbox', { name: 'Email address' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await expect(emailField).toHaveAttribute('required');
    await expect(passwordField).toHaveAttribute('required');
  });

  test('Successful login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard\.html/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
