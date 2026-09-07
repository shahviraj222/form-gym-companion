#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
SDK="${FORM_ANDROID_SDK:-$PWD/.toolchain/sdk}"
BT="$SDK/android-15"
PLATFORM="$SDK/android-35/android.jar"
if [[ ! -f "$PLATFORM" || ! -f "$BT/aapt2" ]]; then
  echo 'Missing SDK. See README.md for build setup.' >&2
  exit 1
fi
mkdir -p app/build/manual/classes app/build/manual/dex output .local-signing
chmod +x "$BT/aapt2" "$BT/zipalign" "$BT/apksigner" "$BT/d8"
"$BT/aapt2" compile --dir app/src/main/res -o app/build/manual/resources.zip
python3 - <<'PYMANIFEST'
from pathlib import Path
source = Path('app/src/main/AndroidManifest.xml').read_text()
Path('app/build/manual/AndroidManifest.xml').write_text(source.replace('<manifest ', '<manifest package="com.sixpack.trainer" ', 1))
PYMANIFEST
"$BT/aapt2" link -I "$PLATFORM" --manifest app/build/manual/AndroidManifest.xml -A app/src/main/assets -o app/build/manual/base.apk app/build/manual/resources.zip
javac -source 8 -target 8 -Xlint:-options -classpath "$PLATFORM" -d app/build/manual/classes app/src/main/java/com/sixpack/trainer/MainActivity.java
jar cf app/build/manual/classes.jar -C app/build/manual/classes .
"$BT/d8" --lib "$PLATFORM" --min-api 26 --output app/build/manual/dex app/build/manual/classes.jar
cp app/build/manual/base.apk app/build/manual/unsigned.apk
(cd app/build/manual/dex && zip -q -u ../unsigned.apk classes.dex)
"$BT/zipalign" -f -p 4 app/build/manual/unsigned.apk app/build/manual/aligned.apk
# A persistent local key keeps updates installable over this personal build.
if [[ ! -f .local-signing/form.keystore ]]; then
  keytool -genkeypair -keystore .local-signing/form.keystore -alias form -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=FORM Personal Build,O=Personal,C=IN'
fi
"$BT/apksigner" sign --ks .local-signing/form.keystore --ks-key-alias form --ks-pass pass:android --key-pass pass:android --out output/FORM.apk app/build/manual/aligned.apk
"$BT/apksigner" verify --verbose output/FORM.apk
"$BT/aapt2" dump badging output/FORM.apk | head -12
