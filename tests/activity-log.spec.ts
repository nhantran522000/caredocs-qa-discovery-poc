import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://nhantran522000.github.io/qa-discovery-poc';

test.describe('Activity Log', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/activity-log.html`);
  });

  test('View activity log entries', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Activity log' })).toBeVisible();
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    // Verify table headers
    await expect(table.getByRole('columnheader', { name: 'Time' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Action' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Resident' })).toBeVisible();
    // Verify sample entries exist
    await expect(table.getByRole('row').filter({ hasText: 'Medication administered' })).toBeVisible();
    await expect(table.getByRole('row').filter({ hasText: 'Handover note added' })).toBeVisible();
    await expect(table.getByRole('row').filter({ hasText: 'Care plan reviewed' })).toBeVisible();
  });

  test('Filter activity log by date range', async ({ page }) => {
    const dateFilter = page.getByRole('combobox', { name: 'Show entries from' });
    await expect(dateFilter).toBeVisible();
    await expect(dateFilter).toHaveValue('Today');
    // Test changing the filter
    await dateFilter.selectOption('This week');
    await expect(dateFilter).toHaveValue('This week');
    await dateFilter.selectOption('This month');
    await expect(dateFilter).toHaveValue('This month');
  });

  test('Activity log accessible from navigation', async ({ page }) => {
    // Start from dashboard
    await page.goto(`${BASE_URL}/dashboard.html`);
    const activityLogLink = page.getByRole('navigation').getByRole('link', { name: 'Activity Log' });
    await expect(activityLogLink).toBeVisible();
    await activityLogLink.click();
    await expect(page).toHaveURL(/.*activity-log\.html/);
    await expect(page.getByRole('heading', { name: 'Activity log' })).toBeVisible();
  });
});
