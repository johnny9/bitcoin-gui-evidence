# Build and capture provenance

[Evidence index](README.md) · [Test results](TEST-RESULTS.md)

Collected October 8, 2026, on Linux x86-64 in an isolated Ubuntu 24.04 container. All wallets, passphrases, addresses and transactions are synthetic regtest fixtures. Original screenshots were captured from the running applications; none were generated, reconstructed or retouched.

## Source and binaries

| Application | Source used | Qt and build | Binary SHA-256 |
| --- | --- | --- | --- |
| Qt Widgets, `src/qt` | [`bitcoin-core/gui` `f739c7876b81304bdc72e7eaa307702da269ac31`](https://github.com/bitcoin-core/gui/commit/f739c7876b81304bdc72e7eaa307702da269ac31) | Qt 6.4.2 shared, GCC 13.3, Release; wallet, QR and external-signer support enabled; IPC disabled | `45f42bea79e43dcba84cf4dd22b51585a293c4ee7f65250da23d024aa53fdee4` |
| GUI-QML, `qt6` | [`a91f4b4774f25de061fe1a7c132a91ddde117fca`](https://github.com/bitcoin-core/gui-qml/commit/a91f4b4774f25de061fe1a7c132a91ddde117fca), with Core submodule `dc282ff31d1cc97507530a541d9cec8a8f6a6ef4` | Qt 6.8.3 static, GCC 13.3, Release; wallet, QR, external signer and test automation enabled; IPC disabled | `a8215c7e45242fdf0e740339733696ec832e362f8306bfbe3bac95dd6bb4fb4c` |

The Widgets executable was freshly built from a detached checkout at the pinned revision. [Configuration](logs/widgets-configure.log) and [build](logs/widgets-build.log) both completed successfully. Its source tree is `ecda48fc4564756b52d55eeb522577eaf75ec8f8`; the [host checkout audit](logs/source-verification.json) reports no tracked changes.

The captured executable displays `v32.99.0-f739c7876b81-dirty`, as recorded in its [generated build header](logs/widgets-build-info.h). The container build log includes a warning that a host Git object-alternate directory is unavailable in the container. A [later container Git check](logs/widgets-container-git-check.json) reproduced that warning but returned a clean diff. The original build-time reason for the nonzero dirty check was not isolated. The exact executable and label are preserved; source provenance relies on the pinned checkout audit and binary hashes rather than the displayed label.

The cached QML executable was built September 30 from `4527986d46e1a34710cb77e8d5ffac0a349745f9`. That commit and the pinned `qt6` merge commit have the **same Git tree**, `7d290492acfd2c25ca2b1d4dd6ed450cc7837405`. The executable’s SHA-256 was checked against its original build record before reuse. Its embedded version reflects that build. It was not rebuilt at the merge commit. The [original build provenance](logs/qml-cached-build-provenance.json) records the Qt depends recipe patches and dependencies; no application-logic patch was added for this collection.

[Binary records](binaries.json) include the test executables, fixture daemons and external Widgets driver. Source-module links throughout the feature pages are pinned. The two applications use different Core revisions, so this pack does not imply backend-version equivalence.

## Test environment

- Container image: `pr915-review-qt:20260923`, image ID `sha256:5101ac87837bc5cca898ebef392a903680f93d6133f6d31c8bb891f413baab29`.
- Capture container: `gui-feature-evidence-20261008`.
- Xvfb displays `:94` (QML) and `:95` (Widgets), each 1440×1080×24, with Openbox. Some application captures use a larger QML window requested by upstream tests; window-grab captures retain its full contents.
- `QT_QUICK_BACKEND=software`; application runs use the `xcb` platform. Unit/component suites use their supported `minimal` platform.
- Linux trays provided by `trayer`. The final Widgets notification run uses `dunst` on a private D-Bus socket, `/work/notifications-bus`. This is actual freedesktop notification delivery, independently recorded in [the notification-service log](logs/widgets-notifications.log).
- `FONTCONFIG_FILE=/etc/fonts/fonts.conf` and `FONTCONFIG_PATH=/etc/fonts` are set for the cached QML runtime. Its older depends Fontconfig emits compatibility warnings for some system configuration elements. QML also emits existing settings deprecation warnings. These are retained in [the shell application log](logs/qml-native-shell-app.log); an exit-0 result is not a warning-free claim.
- The final permission-sensitive wallet-load scenario and C++ unit suite ran as UID 1000. Initial root-run permission failures/skips and their successful reruns are explained in [test results](TEST-RESULTS.md); the other capture sessions include root runs.

## Fixtures

Wallets are created or configured through GUI controls and local RPC, then tested through the UI. RPC checks are used as independent oracles for wallet security, selected coins, mempool transactions, fee changes, and file transfer. Fixture setup through RPC is not counted as a graphical implementation of that setup.

Legacy restore/migration uses the official [Bitcoin Core 28.0 Linux archive](https://bitcoincore.org/bin/bitcoin-core-28.0/bitcoin-28.0-x86_64-linux-gnu.tar.gz). Its archive checksum is `7fe294b02b25b51acb8e8e0a0eb5af6bbafa7cd0c5b0e5fcbb61263104a82fbc`, checked against `SHA256SUMS` from the same official HTTPS release directory. [Download/check log](logs/legacy-fixture-download.log). This documents a checksum check, not an independent release-signature verification.

QML external-signer tests use the repository’s executable signer mock. They prove the application’s protocol and error handling against that fixture. No physical device, firmware, device display, or hardware key custody was tested.

## How captures were made

[The QML wrapper](scripts/qml_capture_test.py) runs the existing functional scripts with unchanged assertions. It records bridge requests/responses, redirects screenshots into this pack, waits for animated onboarding controls to become enabled, and allows popup/render transitions to settle. It uses the application’s existing test bridge and real `QQuickWindow` rendering. [The runner](scripts/run_qml_evidence.py) records exit status, timeout, skipped-fixture messages and capture counts.

[The external Widgets driver](scripts/widgets_bridge.cpp) is loaded with `LD_PRELOAD` into the unchanged, dynamically linked executable. It adds a local test socket for inspecting controls, sending Qt test input and taking actual widget grabs. It does not replace wallet/node behavior or rendering. [The Python scenarios](scripts/widgets_scenarios.py) also use actual X11 input for native menus, RPC assertions, clipboard reads and exported-file checks. This is an instrumented test process, not certification of an untouched production package.

Native tray and notification PNGs are direct X11 desktop captures using ImageMagick. They include the surrounding desktop intentionally. No crop, overlay, replacement text or image-generation tool was used. Temporary contact sheets were used only to inspect capture quality; originals remain in `media/`.

## Reproduction in this workspace

The source/build scratch directory is `.validation/gui-feature-evidence-20261008/`; the evidence directory is `gui-feature-evidence/`. Inside the documented container, they were mounted as `/work` and `/evidence`. The cached QML build directory `.validation/pr937-depends-perf-20260930/` was mounted read-only at `/validation`; its Core source was also mounted at `/work/qml-source/bitcoin`. The fixture daemon `.validation/pr937-review/build/bin/bitcoind` was mounted read-only at `/tools/bitcoind`.

The fresh Widgets build commands were:

```bash
cmake -S /work/widgets-source -B /work/widgets-build -G Ninja \
  -DBUILD_GUI=ON -DBUILD_TESTS=ON -DENABLE_IPC=OFF \
  -DCMAKE_BUILD_TYPE=Release
cmake --build /work/widgets-build -j3
```

Test commands:

```bash
/validation/build/bin/bitcoinqml_unit_tests -platform minimal
/validation/build/bin/bitcoinqml_qmltests -platform minimal
QT_QPA_PLATFORM=minimal /work/widgets-build/bin/test_bitcoin-qt

DISPLAY=:94 BITCOIN_CORE_APP=/validation/build/bin/bitcoin-core-app \
BITCOIND=/tools/bitcoind \
BITCOIND_LEGACY=/work/releases/bitcoin-28.0/bin/bitcoind \
BITCOIN_QT_COMPAT=/work/widgets-build/bin/bitcoin-qt \
python3 /evidence/scripts/run_qml_evidence.py
```

Run QML tests as the ordinary account and make the output/temp directories writable first. The native shell script additionally requires its Xvfb display, window manager and tray. Widgets scenarios are a staged capture session; inspect their fixture requirements before invoking individual functions. They are not a standalone upstream test suite. All scenario entry points and final assertions are retained in `scripts/` and `logs/`.

Regenerate the Markdown after reviewing capture mappings:

```bash
python3 gui-feature-evidence/scripts/build_pages.py
python3 gui-feature-evidence/scripts/build_index.py
python3 gui-feature-evidence/scripts/validate_evidence.py
```

Regeneration does not mark any criterion accepted. Future runs must update the pinned revisions, binary hashes, fixtures, capture mappings, test results and limitations together.

## Session cleanup

Both GUI applications exited successfully. The remaining regtest peer completed normal shutdown, and the [fixture cleanup record](logs/fixture-cleanup.json) reports no remaining application processes. The evidence container was then stopped; its files and the workspace build/capture artifacts were retained. [Container state](logs/container-final-state.json).
