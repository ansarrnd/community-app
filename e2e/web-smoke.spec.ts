import { test, expect } from '@playwright/test';

const APP_BOOT_TIMEOUT = 20000;

test.describe('Community Connect web smoke', () => {
  test('loads explore screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });
    await expect(page.getByText(/Upcoming Community Events|All Events|Weddings/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('tab navigation reaches create screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Create', { exact: true }).click();
    await expect(page.getByText(/Host a Community Event|Select Event Category/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('tab navigation reaches profile screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Profile', { exact: true }).click();
    await expect(page.getByText('Theme Preference').first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('category pill filters explore feed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    const feedHeader = page.getByText(/Upcoming Community Events|All Events/i).first();
    await expect(feedHeader).toBeVisible({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('💍 Weddings', { exact: true }).click();
    await expect(page.getByText(/MARRIAGE Events/i).first()).toBeVisible({ timeout: APP_BOOT_TIMEOUT });
  });

  test('search field accepts text and debounces explore filter', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    const search = page.getByRole('search');
    await expect(search).toBeVisible({ timeout: APP_BOOT_TIMEOUT });
    await search.fill('Town Hall');

    await page.waitForTimeout(400);

    await expect(page.getByText(/Town Hall/i).first()).toBeVisible({ timeout: APP_BOOT_TIMEOUT });
  });
});
