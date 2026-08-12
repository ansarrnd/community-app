# Detox Evaluation (Expo 51 + Expo Router)

This document records a structured evaluation of [Detox](https://wix.github.io/Detox/) for native E2E on **community-app**, and why **Maestro remains the recommended path** for this repository today.

## Current stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 51, React Native 0.74 |
| Navigation | Expo Router (file-based tabs) |
| Lists | FlashList |
| Existing native UI automation | Maestro flows in `.maestro/ios` and `.maestro/android` |
| Web E2E | Playwright on `expo export --platform web` |

## Evaluation criteria

| Criterion | Detox | Maestro (current) |
|-----------|-------|-------------------|
| Expo managed workflow fit | Requires dev client / prebuild; not zero-config | Works on built APK/IPA or simulator with YAML flows |
| CI on GitHub Actions (linux) | Android emulator possible; iOS needs macOS runner | iOS needs macOS; Android can run on linux with emulator |
| Expo Router deep links | Supported via `device.openURL({ url })` after native build | Supported via `openLink` / tab taps |
| FlashList / gesture sync | Mature gray-box sync APIs | Visual/text matching; less sync coupling |
| Maintenance cost | Jest-style tests + native build pipeline + detox config per platform | YAML flows + optional self-hosted Mac for iOS |
| RN New Architecture | Supported in recent Detox versions; verify per RN 0.74 | Generally agnostic |
| Team skill fit | JS test authors | YAML + optional shell for CI |

## Detox setup requirements (if adopted)

1. **Native build artifact** — `expo prebuild` + `expo run:ios` / `expo run:android`, or EAS build with `expo-dev-client`.
2. **Detox config** — `.detoxrc.js` with `ios.sim.debug` and `android.emu.debug` apps.
3. **Test binary path** — point Detox to `ios/build/...` or `android/app/build/...`.
4. **CI** — macOS job for iOS; Android emulator job with KVM on linux.
5. **Example smoke** — see `e2e/detox/smoke.e2e.js` (reference only; Detox not installed).

Estimated integration effort: **large** (native pipeline + CI runners), compared to **medium** for Maestro on an existing self-hosted Mac.

## Sample Detox smoke (reference)

```javascript
// e2e/detox/smoke.e2e.js — not wired in package.json until Detox is installed
describe('Community Connect native smoke', () => {
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
});
```

## Recommendation

| Verdict | Action |
|---------|--------|
| **Do not adopt Detox now** | Maestro + Playwright already cover smoke, screenshots, and tab navigation with lower setup cost on Expo managed workflow. |
| **Re-evaluate Detox if** | You move to bare workflow, need gray-box synchronization for complex gestures inside FlashList, or Maestro cannot stabilize critical flows. |
| **Short-term native CI** | Finish Maestro on self-hosted Mac (Phase 4 backlog P4-1) before investing in Detox. |

## Alternatives considered

- **Maestro** — ✅ already integrated; best fit for screenshot + tab flows.
- **Playwright web export** — ✅ fast PR feedback; not native fidelity.
- **Appium** — similar CI burden to Detox; no advantage for this app size.
- **Chromatic/Percy** — visual regression for web export; separate from native E2E.

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-12 | Detox deferred; Maestro + Playwright remain primary E2E stack. Kinship/theme consolidation reduces visual drift between modules. |
