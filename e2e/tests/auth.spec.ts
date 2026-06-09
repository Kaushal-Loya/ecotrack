import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123';

test.describe('Authentication flow', () => {
  test('user can register a new account', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/EcoTrack/);

    await page.fill('#:r0:-email', TEST_EMAIL);
    await page.fill('#:r0:-password', TEST_PASSWORD);
    await page.fill('#:r0:-confirm', TEST_PASSWORD);
    await page.click('#register-submit-btn');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Use locators instead of IDs for resilience
    await page.getByLabel(/email address/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('WrongPass1');
    await page.click('#login-submit-btn');

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    // Clear storage to simulate logged-out state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
