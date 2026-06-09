import { test, expect } from '@playwright/test';

test.describe('Insights page', () => {
  test('insights page loads and shows heading', async ({ page }) => {
    // Navigate without auth to test redirect
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('demo@example.com');
    await page.getByLabel(/password/i).fill('DemoPass1');
    await page.click('#login-submit-btn');
    await page.waitForURL(/\/dashboard/);

    await page.goto('/insights');
    await expect(page.getByRole('heading', { name: /insights/i })).toBeVisible();
  });

  test('further reading links are present and have noopener', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('demo@example.com');
    await page.getByLabel(/password/i).fill('DemoPass1');
    await page.click('#login-submit-btn');
    await page.waitForURL(/\/dashboard/);
    await page.goto('/insights');

    const links = page.getByRole('link', { name: /drawdown|world in data|un act/i });
    for (const link of await links.all()) {
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });
});
