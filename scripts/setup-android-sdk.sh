#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(uname -s)" != Darwin ]]; then
  echo 'This pinned manual toolchain supports macOS. See docs/DEVELOPMENT.md for the unvalidated Gradle alternative.' >&2
  exit 1
fi
mkdir -p .toolchain/downloads .toolchain/sdk
curl -fL https://dl.google.com/android/repository/platform-35_r02.zip -o .toolchain/downloads/platform.zip
curl -fL https://dl.google.com/android/repository/build-tools_r35_macosx.zip -o .toolchain/downloads/build-tools.zip
python3 - <<'PY'
import hashlib
from pathlib import Path
for filename, expected in [('platform.zip','0bb560a90a7a2cbd0dd8348224d518b638fe7949'),('build-tools.zip','93ab8ce91230e067b5add4bfa79919c52b27f072')]:
    actual=hashlib.sha1((Path('.toolchain/downloads')/filename).read_bytes()).hexdigest()
    if actual != expected:
        raise SystemExit('Checksum mismatch for '+filename)
print('Both Android archive checksums verified.')
PY
unzip -oq .toolchain/downloads/platform.zip -d .toolchain/sdk
unzip -oq .toolchain/downloads/build-tools.zip -d .toolchain/sdk
echo 'Android build dependencies are ready. Run npm run build:apk.'
