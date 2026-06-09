import { test, expect } from '@playwright/test';

// Helper to log in and navigate to activities
async function loginAndGoToActivities(page: Parameters<typeof test.fn>[0]) {
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill('demo@example.com');
  await page.getByLabel(/password/i).fill('DemoPass1');
  await page.click('#login-submit-btn');
  await page.waitForURL(/\/dashboard/);
  await page.goto('/activities');
  await page.waitForSelector('#log-activity-btn');
}

test.describe('Activity logging', () => {
  test('activities page loads with log form', async ({ page }) => {
    await loginAndGoToActivities(page);
    expect(await page.title()).toMatch(/EcoTrack/);
    await expect(page.getByRole('heading', { name: /activity log/i })).toBeVisible();
  });

  test('user can log a transport activity', async ({ page }) => {
    await loginAndGoToActivities(page);

    // Select transport (already selected by default)
    await page.getByLabel(/amount/i).fill('50');
    await page.click('#log-activity-btn');

    // Success message should appear
    await expect(page.getByRole('status')).toBeVisible();
  });

  test('shows error for empty amount', async ({ page }) => {
    await loginAndGoToActivities(page);
    await page.click('#log-activity-btn');
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('filter buttons change range', async ({ page }) => {
    await loginAndGoToActivities(page);
    const weekBtn = page.getByRole('button', { name: /week/i });
    await weekBtn.click();
    await expect(weekBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
