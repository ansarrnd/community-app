# UI Screenshots

Visual reference captures for the Community Connect app on iOS and Android.

## Folder layout

```
docs/screenshots/
├── ios/           # iPhone-sized captures (simulator or Playwright iPhone viewport)
├── android/       # Pixel-sized captures (emulator or Playwright Pixel viewport)
├── README.md      # This file
```

Each folder uses the same screen names for easy comparison:

| File | Screen |
|------|--------|
| `01-explore.png` | Explore / Home (category pills + event list) |
| `02-create.png` | Create Event (category segments + form) |
| `03-profile.png` | Profile (theme picker + role cards) |

## Recommended workflow

### Option A — Native (best fidelity)

Use [Maestro](https://maestro.mobile.dev/) on a running simulator/emulator:

```bash
# Start the app (Metro + simulator)
npm start
# In another terminal — iOS Simulator
npm run screenshots:native:ios
# Android Emulator
npm run screenshots:native:android
```

Requires Maestro CLI (`brew install maestro` on macOS).

### Option B — Automated viewport captures (CI / no simulator)

Uses Playwright with device viewports after a web export. Good for PR diffs and quick regression checks; not identical to native but matches layout and theme tokens.

```bash
npm run build:web
npm run screenshots
# or individually:
npm run screenshots:ios
npm run screenshots:android
```

Outputs land in `docs/screenshots/ios/` and `docs/screenshots/android/`.

### Option C — Manual

Run on device/simulator and save screenshots into the matching folder using the naming convention above.

## Updating screenshots

1. After UI/theme changes, re-run the capture command for the platforms you care about.
2. For the GitHub Actions pixelmatch job, **commit PNGs captured on `ubuntu-latest`** (download the `ui-screenshots` artifact from a CI run). Local captures will not match CI fonts/rasterization.
3. Prefer native (Option A) before release; use Option B for day-to-day PR checks.

## CI

The `Viewport screenshots · pixelmatch` job captures candidates on the GitHub runner and compares them to `docs/screenshots/{ios,android}/`. Compare allows up to 10k differing pixels to absorb font antialiasing and late-loading Unsplash images.
