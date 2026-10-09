# Test results

All results below are from this evidence collection on October 8, 2026. [Back to the evidence index](README.md).

## Existing automated suites

| Suite | Passed | Failed | Skipped | Result |
| --- | ---: | ---: | ---: | --- |
| qml-unit-tests | 766 | 0 | 0 | [Log](logs/qml-unit-tests.log), exit 0 |
| qml-quick-tests | 634 | 0 | 0 | [Log](logs/qml-quick-tests.log), exit 0 |
| widgets-qt-tests | 21 | 0 | 0 | [Log](logs/widgets-qt-tests.log), exit 0 |

QTest totals include initialization, cleanup, and data-driven cases; they are not counts of independent end-user capabilities. The Widgets suite contains AppTests, OptionTests, URITests, RPCNestedTests, WalletTests and AddressBookTests. The [individual QTest outcomes](test-results.json) preserve case names.

The first root run skipped a filesystem-permission unit test. The final non-root C++ run passed all 766 outcomes without skips. An initial functional wallet-load error test also failed under root; it passed as an ordinary user with the intended permission-denied fixture.

## GUI-QML functional scripts

| Script | Final result | Seconds | Captures |
| --- | --- | ---: | ---: |
| `qml_test_activity_filter_export` | [passed](logs/qml_test_activity_filter_export.log) | 22.47 | 30 |
| `qml_test_address_label_sync` | [passed](logs/qml_test_address_label_sync.log) | 11.19 | 14 |
| `qml_test_addresses` | [passed](logs/qml_test_addresses.log) | 15.95 | 22 |
| `qml_test_blockclock` | [passed](logs/qml_test_blockclock.log) | 2.37 | 2 |
| `qml_test_blocksonly_settings` | [passed](logs/qml_test_blocksonly_settings.log) | 2.77 | 3 |
| `qml_test_console` | [passed](logs/qml_test_console.log) | 8.58 | 14 |
| `qml_test_create_wallet_name` | [passed](logs/qml_test_create_wallet_name.log) | 11.79 | 16 |
| `qml_test_debug_log` | [passed](logs/qml_test_debug_log.log) | 8.23 | 12 |
| `qml_test_disablewallet_boot` | [passed](logs/qml_test_disablewallet_boot.log) | 19.56 | 29 |
| `qml_test_external_signer` | [passed](logs/qml_test_external_signer.log) | 28.02 | 25 |
| `qml_test_node_runtime_dialogs` | [passed](logs/qml_test_node_runtime_dialogs.log) | 3.92 | 5 |
| `qml_test_onboarding` | [passed](logs/qml_test_onboarding.log) | 10.44 | 13 |
| `qml_test_password_wallet` | [passed](logs/qml_test_password_wallet.log) | 64.95 | 30 |
| `qml_test_peers` | [passed](logs/qml_test_peers.log) | 33.39 | 53 |
| `qml_test_preinit_onboarding` | [passed](logs/qml_test_preinit_onboarding.log) | 68.71 | 100 |
| `qml_test_proxy` | [passed](logs/qml_test_proxy.log) | 11.19 | 19 |
| `qml_test_psbt` | [passed](logs/qml_test_psbt.log) | 16.75 | 16 |
| `qml_test_receive` | [passed](logs/qml_test_receive.log) | 43.06 | 63 |
| `qml_test_resetguisettings` | [passed](logs/qml_test_resetguisettings.log) | 30.53 | 42 |
| `qml_test_send_create` | [failed](logs/qml_test_send_create.log) | 10.19 | 10 |
| `qml_test_send_receive` | [passed](logs/qml_test_send_receive.log) | 39.65 | 23 |
| `qml_test_settings_display` | [passed](logs/qml_test_settings_display.log) | 20.96 | 40 |
| `qml_test_shutdown` | [passed](logs/qml_test_shutdown.log) | 13.64 | 1 |
| `qml_test_tray` | [passed](logs/qml_test_tray.log) | 5.98 | 11 |
| `qml_test_uri_argument_injection` | [passed](logs/qml_test_uri_argument_injection.log) | 1.67 | 0 |
| `qml_test_uri_import` | [passed](logs/qml_test_uri_import.log) | 9.24 | 16 |
| `qml_test_wallet_migration` | [passed](logs/qml_test_wallet_migration.log) | 11.29 | 8 |
| `qml_test_wallet_qt_compat` | [passed](logs/qml_test_wallet_qt_compat.log) | 12.09 | 12 |
| `qml_test_wallet_rbf` | [passed](logs/qml_test_wallet_rbf.log) | 9.34 | 7 |
| `qml_test_wallet_restore` | [passed](logs/qml_test_wallet_restore.log) | 15.45 | 10 |
| `qml_test_wallet_selector_load` | [passed](logs/qml_test_wallet_selector_load.log) | 23.16 | 14 |
| `qml_test_wallet_settings` | [passed](logs/qml_test_wallet_settings.log) | 48.62 | 32 |
| `qml_test_watchonly_wallet` | [passed](logs/qml_test_watchonly_wallet.log) | 21.46 | 17 |
| `qml_test_window_geometry` | [passed](logs/qml_test_window_geometry.log) | 1.62 | 0 |

The final functional manifest has 33 passes and one failure, with no silently accepted fixture skips. [`qml_test_wallet_qt_compat`](logs/qml_test_wallet_qt_compat.log) was run with `BITCOIN_QT_COMPAT` pointing to the pinned Widgets build in this comparison. Although the script’s default lookup says “31.0”, this is **not** a Bitcoin Core 31.0 release-binary certification. Legacy migration/restore uses an official checksummed Bitcoin Core 28.0 fixture.

## Unresolved failure

`qml_test_send_create` fails at its assertion that `sendNoteInput` still contains `My private note` after editing the first recipient again. This reproduced with the capture wrapper in both initial and non-root runs. The assertion is in [qml_test_send_create.py at the tested revision](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_send_create.py#L59).

```bash
# Inside the documented evidence container/mounts:
DISPLAY=:94 BITCOIN_CORE_APP=/validation/build/bin/bitcoin-core-app \
BITCOIND=/tools/bitcoind TMPDIR=/work/tmp \
python3 /evidence/scripts/qml_capture_test.py \
  /work/qml-source/test/functional/qml_test_send_create.py
```

No product fix or assertion suppression was applied. The failure does not by itself establish the root cause. [The independent scenario](scripts/qml_additional.py) covers multi-recipient/custom-fee setup and coin selection/locking without passing through that failed note-restoration step.

## Capture-driver adjustments

The original onboarding scripts click the cover button before its delayed footer becomes enabled. The capture wrapper now waits for that real enabled state; the application and upstream assertions are unchanged. Both onboarding scripts then passed. It also allows a rendered frame after transitions before capturing.

The external Widgets driver was brought up against actual control names and the current RPC schema. Setup issues included checkbox hit regions, URI address case, rich-text success messages, active-wallet selection, and PSBT v2 decoding. Final mapped assertions were rerun after correcting those expectations/selectors. Raw bridge traces include setup and repeat attempts; only the final assertions below are counted.

## Additional live assertions

| Application | Scenario | Passed | Failed | Evidence |
| --- | --- | ---: | ---: | --- |
| Widgets | GUI controls plus RPC/file/clipboard checks | 39 | 0 | [Log](logs/widgets-bridge.jsonl), [assertions](logs/widgets-checks.json) |
| QML | Independent wallet/coin controls | 6 | 0 | [Log](logs/qml-additional.log), [assertions](logs/qml-additional-checks.json) |
| QML | Native Linux tray and exit | 3 | 0 | [Log](logs/qml-native-shell.log), [assertions](logs/qml-native-shell-checks.json) |

Widgets native tray Exit and wallet-disabled shutdown returned exit 0. QML native tray Quit returned exit 0. The [notification daemon log](logs/widgets-notifications.log) independently records the incoming notification’s application name, amount, wallet and label.

## Coverage not claimed

This is release-build functional evidence. No production checkout was edited. Repository lint, clang-tidy, ASan/LSan/UBSan, TSan/MSan, ancestor-commit validation, and IPC-enabled `interface_gui.py` were not run for this documentation/capture task. These logs do not establish those CI passes. Both application builds have IPC disabled. The scripts and generated evidence are checked separately for syntax, links, criterion completeness, image integrity and capture hashes. See [evidence integrity results](logs/evidence-validation.json).
