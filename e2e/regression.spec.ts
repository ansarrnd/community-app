import { test, expect } from '@playwright/test';

const APP_BOOT_TIMEOUT = 20000;

test.beforeEach(async ({ page }) => {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
});

test.describe('Community Connect web regression', () => {
  test('event detail loads and RSVP attending chip is interactive', async ({ page }) => {
    await page.goto('/e/evt-1');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });
    await expect(page.getByText(/Grand Royal Wedding/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
    await expect(page.getByText(/Attending \(\d+\)/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
    await page.getByText(/Attending \(\d+\)/i).first().click();
    await expect(page.getByText(/Attending \(\d+\)/i).first()).toBeVisible();
  });

  test('admin can open moderation queue and approve a pending event', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Moderation', { exact: true }).click();
    await expect(page.getByText(/Community Moderation Hub/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
    await expect(page.getByText(/Youth Sports/i).first()).toBeVisible({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Approve & Publish', { exact: true }).first().click();
    await expect(page.getByText(/Queue Clean|no pending events/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('profile role switch to USER hides moderation tab', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Profile', { exact: true }).click();
    await expect(page.getByText('Theme Preference').first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });

    await page.getByText('Resident (USER)', { exact: true }).click();
    await page.getByText('Explore', { exact: true }).click();
    await expect(page.getByText('Moderation', { exact: true })).toHaveCount(0, {
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('create event form submits as resident and returns to explore', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Profile', { exact: true }).click();
    await page.getByText('Resident (USER)', { exact: true }).click();

    await page.getByText('Create', { exact: true }).click();
    await expect(page.getByText(/Host a Community Event/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });

    await page.getByTestId('input-event-title').fill('Automated E2E Blood Drive');
    await page.getByTestId('input-event-venue').fill('Community Hall Main Room');
    await page.getByTestId('input-event-details').fill(
      'Automated regression test event with enough description text.'
    );

    await page.getByTestId('btn-submit-event').click();
    await expect(page.getByText(/Upcoming Community Events|All Events/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
  });

  test('theme toggle to light keeps explore feed readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty({ timeout: APP_BOOT_TIMEOUT });

    await page.getByText('Profile', { exact: true }).click();
    await page.getByText('Light', { exact: true }).click();

    await page.getByText('Explore', { exact: true }).click();
    await expect(page.getByText(/Upcoming Community Events|All Events/i).first()).toBeVisible({
      timeout: APP_BOOT_TIMEOUT,
    });
    await expect(page.getByRole('search')).toBeVisible({ timeout: APP_BOOT_TIMEOUT });
  });
});
