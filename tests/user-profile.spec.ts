import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('User Profile', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/profile.html`);
  });

  test('Profile displays date of birth field', async ({ page }) => {
    await expect(page.getByText('Date of birth')).toBeVisible();
    await expect(page.getByText('14 March 1981')).toBeVisible();
  });

  test('Profile shows all user details', async ({ page }) => {
    await expect(page.getByText('Full name')).toBeVisible();
    await expect(page.getByText('Dana Whitmore')).toBeVisible();
    await expect(page.getByText('Email address')).toBeVisible();
    await expect(page.getByText('dana.whitmore@bramblewood.example')).toBeVisible();
    await expect(page.getByText('Date of birth')).toBeVisible();
    await expect(page.getByText('14 March 1981')).toBeVisible();
  });

  test('Date of birth is read-only', async ({ page }) => {
    const dobParagraph = page.locator('text=14 March 1981');
    await expect(dobParagraph).toBeVisible();
    // Verify it's a paragraph, not an input field
    const tagName = await dobParagraph.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('p');
  });

  test('Edit button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });
});
