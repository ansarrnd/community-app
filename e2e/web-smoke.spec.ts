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
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('#root').innerText();
    expect(bodyText).toMatch(/Host|Category|MARRIAGE|Event Title/i);
  });

  test('tab navigation reaches profile screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Profile', { exact: true }).click();
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('#root').innerText();
    expect(bodyText).toMatch(/Theme|Dark|Light|Resident|USER/i);
  });
});
