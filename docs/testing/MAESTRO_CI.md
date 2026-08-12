# Maestro Native CI

Maestro flows live under `.maestro/` and run on **self-hosted macOS** runners (ARM64 recommended for iOS Simulator + Android emulator performance).

## GitHub Actions

Workflow: `.github/workflows/maestro-native.yml`

Register a self-hosted runner with labels:

- `self-hosted`
- `macOS`
- `ARM64`

Install on the runner:

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

## Local commands

```bash
npm run screenshots:native:ios
npm run screenshots:native:android
maestro test .maestro/ios/screenshots.yaml
```

## Emulator / simulator prerequisites

- iOS: Simulator booted with app installed (`expo run:ios` or EAS internal build)
- Android: ARM64 emulator with `com.community.connect` installed

Flows use `appId: com.community.connect` from `app.json`.
