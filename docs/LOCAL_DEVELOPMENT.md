# Run Community Connect locally

This guide runs the app on **Android** or **web** against the local Firebase Auth and Firestore emulators. The emulators keep data on your machine; this setup does not connect to or deploy to a cloud Firebase project.

## Prerequisites

- Node.js and npm
- Java, required by the Firebase emulators
- Android Studio with Android SDK and Platform Tools (`adb`) to run Android
- An Android emulator or a USB-connected Android device with USB debugging enabled

Check that the tools are available:

```bash
node --version
npm --version
java -version
adb devices
```

Install project dependencies from the repository root:

```bash
npm ci
```

## Configure the local backend

Copy the example environment file:

```bash
cp .env.example .env.local
```

In `.env.local`, set these values:

```dotenv
EXPO_PUBLIC_BACKEND_PROVIDER=firebase
EXPO_PUBLIC_USE_EMULATORS=true
```

The remaining Firebase client variables can stay blank for emulator development; the app has local demo configuration defaults. Do not put production credentials or secrets in `EXPO_PUBLIC_*` variables because Expo includes them in the client bundle.

## Start and seed the emulators

Use separate terminals from the repository root:

**Terminal 1 — start Firebase emulators:**

```bash
npm run emulators
```

Keep this running. The emulator UI is at <http://127.0.0.1:4000>; Auth uses port `9099` and Firestore uses port `8080`.

**Terminal 2 — seed demo accounts and events:**

```bash
npm run seed:emulators
```

This seeds the local Auth and Firestore emulators. You can rerun it if you need to restore demo data.

## Run on Android

Start the Android emulator or connect and authorize your device, then confirm it appears in:

```bash
adb devices
```

The app's emulator configuration connects to `127.0.0.1`. Forward the Firebase ports from the Android device/emulator back to the computer so that address reaches the host:

```bash
adb reverse tcp:8080 tcp:8080
adb reverse tcp:9099 tcp:9099
adb reverse tcp:5001 tcp:5001
```

Run the native Android app:

```bash
npm run android
```

The first run builds and installs the Android app; subsequent runs use the installed app and Expo development server. Keep the emulator and device connected, and repeat the `adb reverse` commands after reconnecting or restarting the device. If multiple Android devices are connected, select the target in Expo or disconnect the extra device before running the command.

## Run on web

In another terminal, start the Expo web development server:

```bash
npm run web:firebase
```

Open the URL printed by Expo (typically <http://localhost:8081>). Since the browser and Firebase emulators run on the same computer, the app can reach the emulator addresses directly.

## Demo sign-in

Use one of the seeded accounts; all have password `DemoPass123!`:

| Role | Email |
|------|-------|
| Resident | `resident@demo.community` |
| Moderator | `mod@demo.community` |
| Admin | `admin@demo.community` |

## Troubleshooting

- **App shows mock data:** confirm `.env.local` contains `EXPO_PUBLIC_BACKEND_PROVIDER=firebase` and `EXPO_PUBLIC_USE_EMULATORS=true`, then stop and restart Expo so it reloads the environment.
- **Android cannot reach Firebase:** check `adb devices`, rerun all three `adb reverse` commands for the active device, and confirm the emulator process is still running.
- **No demo login or events:** run `npm run seed:emulators` while the Auth and Firestore emulators are running.
- **Emulator ports are already in use:** stop the process using the configured ports (`8080`, `9099`, `5001`, or `4000`) before starting the emulators again.
- **Android build fails:** verify Android Studio's SDK and Java/Gradle setup, then rerun `npm run android` and use the first Gradle error to identify any missing local SDK component.

## Use the mock backend instead

For UI work that does not need Firebase, leave `EXPO_PUBLIC_BACKEND_PROVIDER` unset (or set it to `mock`) and set `EXPO_PUBLIC_USE_EMULATORS=false`. Then start Android with `npm run android` or web with `npm run web`. The mock repositories provide in-memory demo data and do not require the emulator process or seed command.
