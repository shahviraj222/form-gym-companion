# Testing and known limitations

## Automated checks

`npm test` runs 19 checks: 11 workout/calendar checks, 6 nutrition checks, and 2 illustration/asset checks.

`npm run test:ui` exercises the browser preview with Playwright: workout progression, all 21 Monday rounds, timer/rest/guide pausing, explicit resume, local persistence, a generated audio fixture, playing-song updates, nutrition validation, meal add/edit/repeat/remove, old manual totals, water undo, history, food filters and narrow layouts.

`npm run gallery` renders all 46 full/compact SVGs, checks SVG parsing, and creates contact sheets for manual inspection. Reference screenshots under docs/screenshots use synthetic test entries, not real personal records.

## What packaging verification establishes

The Java code compiles; the APK contains current assets, DEX and resources; zip alignment and signature verification pass. It does not establish that every Android runtime behavior works on a physical device.

## Manual Android checklist still pending

- Install/update the APK on Samsung S23+ and confirm data preservation.
- Import multiple local MP3s; restart the app and verify retained permission.
- Check pause/resume, track completion and rapid skipping.
- Interrupt with another audio app, disconnect headphones, lock/unlock, and background/foreground.
- Force-stop and kill the app process during work/rest; inspect restored state.
- Test display insets, rotation, keyboard, large font sizes, and accessibility navigation.
- Test missing audio files and low-storage failures.

## Engineering limitations

- One JSON snapshot in SharedPreferences is simple, but rewrites growing history and lacks a structured save acknowledgement to JavaScript.
- Wall-clock duration measurement can be affected by clock changes; a monotonic clock is planned.
- Phase guards are not full command idempotency for rapid repeated no-rest completion.
- Generic state JSON is not fully schema-validated on startup; migrations are currently simple field-presence logic.
- The UI module is large and uses HTML string rendering; a larger project should split it and introduce static types.
- Export is available; restore, cloud sync, automatic step tracking and background music are not.
- Declared Android minimum is not a claim of successful tests on every Android/WebView version.
