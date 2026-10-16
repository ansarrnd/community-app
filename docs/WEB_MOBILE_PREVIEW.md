# Phone testing — free web preview

Open Community Connect on your phone’s browser. No App Store, Play Store, EAS, or paid host.

**Live URL (after Pages is enabled and this workflow has published once):**

https://ansarrnd.github.io/community-app/

## One-time GitHub setting

GitHub Pages is not on until you pick a publish source (this cannot be flipped from a pull request):

1. Open **Settings → Pages** on [ansarrnd/community-app](https://github.com/ansarrnd/community-app).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Merge this change to `main` (or run **Actions → Deploy web (GitHub Pages) → Run workflow**).
4. Wait for the green **Deploy web (GitHub Pages)** run.
5. On your phone, open https://ansarrnd.github.io/community-app/ (Safari or Chrome).

You can also **Add to Home Screen** for a full-screen icon.

## What you are testing

| Item | Value |
|------|--------|
| Target | Expo **web** export (same UI as the app, in the mobile browser) |
| Backend | **Mock** (in-memory). Refresh resets demo data. |
| Cost | $0 — GitHub Pages on this public repo |
| Demo roles | Profile tab → switch USER / MOD / ADMIN |

Mock demo users (same as local):

- `resident@demo.community` / `DemoPass123!`
- `mod@demo.community` / `DemoPass123!`
- `admin@demo.community` / `DemoPass123!`

This is **not** a native APK/IPA. Camera, WhatsApp share, and some native modules may differ from Expo Go. It is the right path for layout, navigation, and flows on a real phone without store review.

## Optional: Vercel (also free)

`vercel.json` + `npm run build` already produce a root-URL static site (no `/community-app` prefix). Import the GitHub repo at [vercel.com](https://vercel.com) if you want a `*.vercel.app` URL. Hobby is free; not required for phone testing.

Do **not** use Firebase Hosting / Cloud Functions for this preview — that path is billed on Blaze.

## Local check of the Pages bundle

```bash
npm run build:web:pages
mkdir -p /tmp/pages-preview/community-app
cp -R dist/. /tmp/pages-preview/community-app/
npx --yes serve /tmp/pages-preview -l 4173
# open http://127.0.0.1:4173/community-app/
```

GitHub Pages serves the `dist` folder at `/community-app/`, so asset URLs include that prefix. Serving `dist` from `/` will 404 the JS bundle.
