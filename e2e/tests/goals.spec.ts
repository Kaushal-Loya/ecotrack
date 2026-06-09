import { test, expect } from '@playwright/test';

// Helper to log in as demo user
async function loginAsDemo(page: Parameters<typeof test.fn>[0]) {
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill('demo@example.com');
  await page.getByLabel(/password/i).fill('DemoPass1');
  await page.click('#login-submit-btn');
  await page.waitForURL(/\/dashboard/);
}

test.describe('Goals flow', () => {
  test('goals page loads with empty state', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/goals');
    await expect(page.getByRole('heading', { name: /goals/i })).toBeVisible();
  });

  test('user can create a new goal', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/goals');

    // Open form
    await page.click('#create-goal-btn');

    // Fill form using label selectors
    await page.getByLabel(/goal title/i).fill('Reduce energy usage');
    await page.getByLabel(/baseline/i).fill('5000');
    await page.getByLabel(/^Target/).fill('4000');
    await page.getByLabel(/deadline/i).fill('2025-12-31');

    // Submit
    await page.click('button[type="submit"]');

    // Should show the new goal
    await expect(page.getByText('Reduce energy usage')).toBeVisible({ timeout: 5000 });
  });

  test('shows validation error for invalid goal input', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/goals');
    await page.click('#create-goal-btn');

    // Submit with empty fields
    await page.click('button[type="submit"]');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
