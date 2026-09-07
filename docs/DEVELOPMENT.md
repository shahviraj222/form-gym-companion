# Development and build guide

## Prerequisites

- Node.js 20 or newer and npm for preview/tests.
- For the verified manual APK build: macOS, JDK 17 (`java`, `javac`, `jar`, `keytool` on PATH), Python 3, curl, unzip, and zip.
- Android Platform 35 and macOS Build Tools 35.0.0, downloaded with the script below.

## Fresh clone

```sh
git clone https://github.com/shahviraj222/form-gym-companion.git
cd form-gym-companion
npm ci
npx playwright install chromium
npm test
npm run preview
```

Open http://127.0.0.1:4173. This server binds only to localhost and is a development tool. In another terminal, run:

```sh
npm run test:ui
npm run gallery
```

Playwright is an exact-version development dependency in package.json/package-lock.json, not shipped in the APK. Screenshots are generated under ignored output/. FORM_PLAYWRIGHT can override the module path and FORM_CHROMIUM can select an existing Chromium executable; neither override is required in a normal clone.

## Build a personal APK on macOS

```sh
bash scripts/setup-android-sdk.sh
npm run build:apk
```

The setup script downloads Google's pinned archives and verifies their published SHA-1 checksums before extracting. The build script uses JDK 17 with Java 8 source/target compatibility, and produces output/FORM.apk. It also verifies the APK signature. SDK downloads and build intermediates are ignored by Git.

The archive layout is `.toolchain/sdk/android-35/android.jar` and `.toolchain/sdk/android-15/` for the pinned build-tools archive. The latter directory name comes from Google's archive and does not mean the project targets API 15. FORM_ANDROID_SDK may point to another directory with this same layout; it is not a general sdkmanager installation autodetector.

## Signing

The first manual build creates `.local-signing/form.keystore` with alias `form` and the standard development password `android`. This is a personal development key, not a production credential. It is never committed. Keep your own key to install later builds over your own previous builds.

Your newly generated key differs from the key used for repository release APKs. Android cannot update an installation across different signing certificates. Export records before any necessary uninstall; restore/import is not implemented.

## Gradle alternative

The included configuration pins AGP 8.7.3, compile/target SDK 35, min SDK 26, and Java 8 source compatibility. It is intended for JDK 17 with Gradle 8.9. There is no bundled Gradle wrapper; install/configure Gradle and an Android SDK separately if you want to use this path. The manual macOS build is the validated path; Gradle and non-macOS builds are not claimed as tested.

## Release maintenance

1. Update versionName/versionCode in both app/build.gradle and AndroidManifest.xml.
2. Run unit/UI tests and inspect screenshots.
3. Build with the same retained signing key.
4. Verify signature and package metadata, and compare the signer with the previous release.
5. Create a GitHub release with FORM.apk and its SHA-256 checksum.

CI runs unit/browser tests; it does not hold a signing key, publish releases, or assert physical-device compatibility.
