# Install FORM on Android

## Download and install

1. A public APK release has not been uploaded yet. Follow the [build guide](DEVELOPMENT.md) to produce `output/FORM.apk`. The GitHub source ZIP is not the Android installer.
2. Download directly on your phone, or transfer the APK using USB or Quick Share.
3. Open **My Files → Downloads** on your Samsung S23+ and tap `FORM.apk`.
4. If prompted, allow **Install unknown apps** for the application opening the APK, then install. You can revoke that permission after installation.
5. Open **FORM** from your app drawer.

Android 8.0 / API 26 is the declared minimum. The application targets Android 15 / API 35. Native behavior still needs testing on real devices, including Samsung S23+. It is a personally signed build, not a Play Store release.

## First workout

The home screen selects today's local weekday. Tap **Start workout** to begin its routine. **My plan** previews the week. Tap an exercise or **How to** to see a diagram and setup instructions. Opening instructions during a workout pauses its timer and music.

Complete each set, take or skip rest, then explicitly start the next set. Timed holds stop at their target and wait for confirmation. Saturday is rest; Wednesday contains walking and stretching. Side planks guide both sides separately.

## Add your music

1. Choose **Add music → Add songs from your phone**.
2. Select one or more local audio files, such as MP3s.
3. Start a workout. A random track plays during exercise and pauses during rest.

The app retains permission to the selected files, rather than copying them. Moving, deleting, or revoking access to those files can require re-importing. No audio files are included in the repository or APK. Leaving the app or locking the screen pauses the session and music; background playback is not implemented.

## Nutrition

- Built-in options are vegetarian, with dairy included; no eggs, meat or fish. Tofu and protein powder are also excluded from the supplied food list.
- Enter calories and protein from your recipe or nutrition label. There are no automatic food estimates.
- Add, edit, remove, or repeat a meal. Quick water buttons support undo.
- Earlier manual totals remain included. An added meal is additional to those totals.
- Steps are manually entered; there is no Samsung Health integration.

## Updating

Install a newer release over the existing application without uninstalling it. Updates must have the same package name and signing certificate. The existing personal builds use the project's retained local signing key.

A self-built APK creates or uses your own local development key. It will not update an APK signed with somebody else's key. Do not uninstall your current app without first exporting any records you want to keep.

## Data and export

Data stays in application-private storage. Uninstalling, clearing app storage, or losing the phone can lose it. **Progress → Export data** or **Settings → Export my data** saves JSON containing your records. Export exists, but automatic restore/import and cloud sync do not yet exist.

## Troubleshooting

- **App not installed:** check whether an existing installation uses a different signing key, whether the APK downloaded completely, and whether device storage is available.
- **Installation blocked by Samsung security settings:** review the message and your device's installation policy; managed devices may prohibit sideloading.
- **Music unavailable:** reselect the local file and ensure another app is not holding audio focus.
- **Preview looks different:** the desktop browser uses browser storage/audio; the APK uses native Android storage/audio.
- **Broken or blank WebView UI:** check for Android System WebView updates, then reopen the app. Report the Android and WebView versions in an issue if it persists.
