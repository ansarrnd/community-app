/**
 * Reference Detox smoke spec — not executed until Detox is added to devDependencies.
 * See docs/testing/DETOX_EVALUATION.md for adoption criteria.
 */
describe('Community Connect native smoke (Detox reference)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows Explore tab', async () => {
    await expect(element(by.text('Explore'))).toBeVisible();
  });

  it('navigates to Create tab', async () => {
    await element(by.text('Create')).tap();
    await expect(element(by.text('Host a Community Event'))).toBeVisible();
  });

  it('navigates to Profile tab', async () => {
    await element(by.text('Profile')).tap();
    await expect(element(by.text('Theme Preference'))).toBeVisible();
  });
});
