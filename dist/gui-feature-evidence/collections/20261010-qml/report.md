# GUI-QML acceptance evidence — October 10, 2026

**35 of the 61 proof gaps are now closed; 26 remain.** The remaining set includes one real application failure: the database-cache editor rejects a valid 768 MiB allocation. The implementation assessment for F23.S01 changes from parity to partial. Proof does not silently accept that failure.

37 selected, unmodified application screenshots accompany 49 passing scoped checks and 1 failing check. 16 functional scripts pass and one fails. Eleven existing tests are rerun unchanged; six new acceptance scripts add desktop, shell, watch-only, migration, synchronization and cache-range coverage.

[Missing functional tests and required environments](missing-functional-tests.md) · [Checks with actual/expected values and test references](logs/checks.json) · [Latest script results](logs/runs.json) · [Before/after criterion records](coverage.json) · [Validation and provenance](validation.json)

## Reproduced failure: database cache range

Core accepts `-dbcache=768`. The GUI displays it when set by the command line, but entering `768` in the editable GUI leaves `7`. The validator derives its maximum from `MAX_COINS_DB_CACHE`, the 8 MiB coins-database sub-cache cap, instead of a total-cache range. The focused regression fails on the unchanged application; no application fix is included.

[Failing regression](scripts/qml_evidence_cache_limit.py) · [Raw failure log](logs/qml_evidence_cache_limit.log) · [GUI maximum](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/options_model.h#L218) · [Validator](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/DeveloperOptions.qml#L45) · [Core sub-cache constant](https://github.com/bitcoin/bitcoin/blob/dc282ff31d1cc97507530a541d9cec8a8f6a6ef4/src/kernel/caches.h#L20)

## Scope and reproduction

The application and binary are unchanged: GUI-QML `a91f4b4774f25de061fe1a7c132a91ddde117fca`, binary SHA-256 `a8215c7e45242fdf0e740339733696ec832e362f8306bfbe3bac95dd6bb4fb4c`. This pass uses Linux X11/Xvfb/Openbox, static Qt 6.8.3, software rendering, and isolated regtest wallets. [Original binary provenance](../../logs/qml-cached-build-provenance.json) remains available. The binary has IPC disabled and is not a sanitizer build. The reset-onboarding harness terminates its second pre-initialization process with SIGTERM (-15); other recorded application exits are 0. Existing Fontconfig/Qt deprecation warnings remain in stderr. Required lint, clang-tidy and ASan entry scripts are absent from both checkouts, so those checks are blocked. Physical signers, other desktop platforms, live Tor, physical router mapping and mainnet initial download are not certified.

Screenshots are original application renders, not mockups. RPC creates fixtures and independently checks outcomes. The existing automation bridge supplies file-dialog paths in PSBT/QR scenarios and injects the runtime-dialog message; these limits are explicit. The synchronization test transfers real blocks from a local peer through a rate-limited TCP relay. Full proof means a targeted check plus a matching capture within this scope; it does not certify every platform or variant.

The recorded runner expects the pinned source at `/work/qml-source`, an output directory in `EVIDENCE_OUTPUT`, and `PYTHONPATH` pointing at the pinned functional-test helpers. Set `BITCOIN_CORE_APP`, `BITCOIND`, `EVIDENCE_LEGACY_BITCOIND`, `DISPLAY`, `QML_TEST_QPA_PLATFORM=xcb`, and `QT_QUICK_BACKEND=software`. Start Xvfb and Openbox before running. `run_collection.py` accepts script names; `qml_evidence_cache_limit` is expected to fail until the application is fixed. All screenshots, manifests, script hashes and bridge logs for these runs are included. [Collector development notes](development-notes.md) retain setup failures and corrections.

## Evidence by feature group

## F02 — Open, Switch, and Close Wallets

[Pinned implementation modules and original tests](../../features/02-open-switch-and-close-wallets.md#modules)

### F02.S04 — Close individual wallets or all wallets.

**Full scoped proof.** Repeating the wallet close action closes every loaded wallet while the node continues. The node remains available after closing all wallets.

- `close-all-wallets` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).
- `node-after-close` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).

Captures: [All wallets closed while the node keeps running](media/qml/qml_evidence_shell/004-all-wallets-closed.png).

## F03 — Back Up and Restore Wallet

[Pinned implementation modules and original tests](../../features/03-back-up-and-restore-wallet.md#modules)

### F03.S03 — Name a recovered wallet.

**Full scoped proof.** A backup is restored with its filename-derived wallet name and the resulting wallet is opened. Naming the file is the supported naming workflow.

- `existing-f03-s03` — passed; [qml_test_wallet_restore](scripts/qml_test_wallet_restore.py) · [log](logs/qml_test_wallet_restore.log).

Captures: [Recovered wallet named from its backup](media/qml/qml_test_wallet_restore/009-04-import-success-screen-displayed.png).

## F04 — Migrate Legacy Wallet

[Pinned implementation modules and original tests](../../features/04-migrate-legacy-wallet.md#modules)

### F04.S02 — Preserve the original wallet with an automatic backup.

**Full scoped proof.** GUI migration automatically preserves a nonempty original wallet backup. The screenshot shows the migrated wallet; backup-file creation is established by the filesystem assertion, not by pixels.

- `migration-backup` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).

Captures: [Migrated wallet retains its spending balance and history](media/qml/qml_evidence_migration/001-migrated-wallet-preserved-funds.png).

### F04.S03 — Preserve wallet contents, including watch-only information.

**Full scoped proof.** The receiving address and its label survive migration. The migrated spending wallet retains its confirmed balance. The migrated wallet retains the payment transaction. Watch-only address metadata survives in the migrated watch-only wallet. The migrated watch-only wallet retains its received funds. This fixture covers a funded legacy wallet, a labeled receiving address, a payment, and a separate migrated watch-only wallet.

- `migration-label` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).
- `migration-funds` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).
- `migration-history` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).
- `migration-watch-label` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).
- `migration-watch-funds` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).

Captures: [Migrated wallet retains its spending balance and history](media/qml/qml_evidence_migration/001-migrated-wallet-preserved-funds.png), [Migrated watch-only wallet retains its funds](media/qml/qml_evidence_migration/002-migrated-watch-only-funds.png).

### F04.S04 — Open migrated wallets immediately or later.

**Full scoped proof.** The migrated wallet is immediately available.

- `migration-auto-open` — passed; [qml_evidence_migration](scripts/qml_evidence_migration.py) · [log](logs/qml_evidence_migration.log).

Captures: [Migrated wallet retains its spending balance and history](media/qml/qml_evidence_migration/001-migrated-wallet-preserved-funds.png).

## F06 — Encrypt Wallet and Manage Passphrase

[Pinned implementation modules and original tests](../../features/06-encrypt-wallet-and-manage-passphrase.md#modules)

### F06.S01 — Protect stored spending keys with passphrase encryption.

**Full scoped proof.** The GUI-created encrypted wallet is locked, remains locked after restart, and requires its passphrase for spending.

- `existing-f06-s01` — passed; [qml_test_password_wallet](scripts/qml_test_password_wallet.py) · [log](logs/qml_test_password_wallet.log).

Captures: [Encrypted wallet remains locked after restart](media/qml/qml_test_password_wallet/005-05-wallet-restarted-locked.png).

## F07 — View Wallet Overview

[Pinned implementation modules and original tests](../../features/07-view-wallet-overview.md#modules)

### F07.S01 — View available, pending, immature mining, and total balances.

**Evidence still partial.** Balance and pending activity are present; the complete available/pending/immature/total breakdown is missing.

**Still needed:** Create available, pending and immature funds, then assert the displayed balances and pending activity agree with RPC before and after confirmation.

### F07.S02 — Review recent wallet activity.

**Full scoped proof.** Activity shows the payment request and mined transaction as two distinct records.

- `existing-f07-s02` — passed; [qml_test_activity_filter_export](scripts/qml_test_activity_filter_export.py) · [log](logs/qml_test_activity_filter_export.log).

Captures: [Recent wallet activity](media/qml/qml_test_activity_filter_export/006-06-activity-shows-payment-request-and-mined-rows.png).

### F07.S03 — Find a recent transaction in the full transaction history.

**Full scoped proof.** A transaction is opened from the unified activity history and its displayed amount is checked against the selected record.

- `existing-f07-s03` — passed; [qml_test_activity_filter_export](scripts/qml_test_activity_filter_export.py) · [log](logs/qml_test_activity_filter_export.log).

Captures: [Transaction found in the activity history](media/qml/qml_test_activity_filter_export/030-30-activity-details-amount-uses-selected-display-unit.png).

### F07.S04 — Know when wallet information may be out of date.

**Full scoped proof.** This run displays “Syncing wallet activity…” while wallet history is not yet populated. The functional test checks the empty/loading-state guidance.

- `existing-f07-s04` — passed; [qml_test_activity_filter_export](scripts/qml_test_activity_filter_export.py) · [log](logs/qml_test_activity_filter_export.log).

Captures: [Wallet history is still synchronizing](media/qml/qml_test_activity_filter_export/002-02-source-empty-activity-state-shown-syncing-wallet-activity.png).

## F08 — Receive Bitcoin / Request Payment

[Pinned implementation modules and original tests](../../features/08-receive-bitcoin-request-payment.md#modules)

### F08.S06 — Share QR images with other applications using drag and drop.

**Full scoped proof.** QR sharing is demonstrated through the supported copy/save actions. Saving produces a PNG file whose signature is checked. Drag-and-drop export remains absent.

- `existing-f08-s06` — passed; [qml_test_receive](scripts/qml_test_receive.py) · [log](logs/qml_test_receive.log).

Captures: [QR image sharing through copy and save](media/qml/qml_test_receive/024-receive-menu.png).

## F09 — Send Bitcoin

[Pinned implementation modules and original tests](../../features/09-send-bitcoin.md#modules)

### F09.S02 — Enter or paste a recipient address, or use a saved address.

**Full scoped proof.** Entering a recipient preserves the complete address. A saved-recipient picker remains absent; the accepted outcome is specifying the payment destination.

- `enter-payment-address` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Payment recipient entered](media/qml/qml_evidence_desktop/005-recipient-entered.png).

### F09.S07 — Sign payments with local spending keys or a compatible external signer.

**Evidence still partial.** Local signing and a mock external signer are exercised; physical hardware is not. Local and mock-signer transactions reach broadcast.

**Still needed:** Repeat the payment with a compatible physical signer: approve on the device, verify the destination and fee, broadcast, and check the wallet holds no spending keys.

### F09.S08 — Prepare a payment from a watch-only wallet for signing elsewhere.

**Full scoped proof.** The GUI saves an unsigned PSBT with the requested recipient and amount. Preparing the payment does not introduce local spending keys. The export still requires external signatures. The separate signing wallet can finish the exported transaction.

- `watch-only-export` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `watch-only-no-keys` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `watch-only-unsigned` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `external-handoff` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).

Captures: [Unsigned watch-only payment exported for another signer](media/qml/qml_evidence_watchonly/003-watch-only-unsigned-payment-exported.png).

## F10 — Open Payment URI

[Pinned implementation modules and original tests](../../features/10-open-payment-uri.md#modules)

### F10.S03 — Handle payment requests from other applications, including while Bitcoin Core is already running.

**Full scoped proof.** The running application accepts an explicit payment-request import and populates the payment. This proves the accepted transfer outcome; automatic OS URI delivery remains absent.

- `existing-f10-s03` — passed; [qml_test_uri_import](scripts/qml_test_uri_import.py) · [log](logs/qml_test_uri_import.log).

Captures: [Payment request imported into the running application](media/qml/qml_test_uri_import/006-click-senduriimportapplybutton.png).

## F11 — Choose Transaction Fee

[Pinned implementation modules and original tests](../../features/11-choose-transaction-fee.md#modules)

### F11.S04 — Know when a fee estimate is unavailable.

**Full scoped proof.** An empty payment has no fee estimate and explains the missing recipient.

- `fee-unavailable` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Unavailable fee estimate is clearly shown](media/qml/qml_evidence_desktop/004-fee-estimate-unavailable.png).

## F12 — Select Coins / Coin Control

[Pinned implementation modules and original tests](../../features/12-select-coins-coin-control.md#modules)

### F12.S04 — Compare coins by amount, address, label, age, and confirmations.

**Evidence still partial.** Amounts, addresses, labels, age, sorting and grouping are supported; confirmation counts are missing.

**Still needed:** Create coins with distinct amounts, labels, ages and confirmations; verify the supported comparison fields, grouping and sorting against listunspent. Document that confirmation counts are not displayed.

## F13 — Create and Export PSBT

[Pinned implementation modules and original tests](../../features/13-create-and-export-psbt.md#modules)

### F13.S05 — Copy an unsigned PSBT to the clipboard or save it to a file for signing elsewhere.

**Full scoped proof.** The GUI saves an unsigned PSBT with the requested recipient and amount. The export still requires external signatures. The separate signing wallet can finish the exported transaction. File export fulfills signing handoff; clipboard export remains absent. The save path is supplied through the existing test bridge hook.

- `watch-only-export` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `watch-only-unsigned` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `external-handoff` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).

Captures: [Unsigned watch-only payment exported for another signer](media/qml/qml_evidence_watchonly/003-watch-only-unsigned-payment-exported.png).

## F14 — Import, Sign, and Broadcast PSBT

[Pinned implementation modules and original tests](../../features/14-import-sign-and-broadcast-psbt.md#modules)

### F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

**Evidence still partial.** File saving is available, including incomplete external-signer results; clipboard export is missing.

**Still needed:** Export a transaction after one signer, assert the signature survives the GUI handoff, then have a second signer complete it.

## F15 — Use Hardware Wallet / External Signer

[Pinned implementation modules and original tests](../../features/15-use-hardware-wallet-external-signer.md#modules)

### F15.S01 — Connect a wallet to a compatible external signer.

**Evidence still partial.** An executable mock signer is exercised; no physical device.

**Still needed:** Enumerate and connect a real compatible signer; validate identity and wallet descriptors.

### F15.S02 — Keep spending keys on the signing device.

**Evidence still partial.** Test signer holds the keys externally; physical device custody is not certified.

**Still needed:** Verify key custody on a real device while the connected wallet exposes only public descriptors.

### F15.S04 — Authorize outgoing payments using the device.

**Evidence still partial.** Mock signer approval, errors and broadcast are tested; physical approval is untested.

**Still needed:** Approve and reject payments on a real device; compare its recipient/fee confirmation and the broadcast transaction.

### F15.S05 — Continue a signing workflow when additional signatures are needed. Signing workflow.

**Evidence still partial.** An incomplete mock external-signer result can be saved; broad multisigner exchange is not exercised. No matching screenshot collected.

**Still needed:** Save an incomplete signing result and resume it with another signer without losing signatures or changing outputs.

## F16 — Browse and Export Transaction History

[Pinned implementation modules and original tests](../../features/16-browse-and-export-transaction-history.md#modules)

### F16.S03 — Search by address, transaction ID, or label, and sort transaction history.

**Full scoped proof.** Address and label searches plus date/type/amount filters locate activity. Configurable sorting remains absent; the accepted outcome is finding transactions.

- `existing-f16-s03` — passed; [qml_test_activity_filter_export](scripts/qml_test_activity_filter_export.py) · [log](logs/qml_test_activity_filter_export.log).

Captures: [Locate wallet activity by label](media/qml/qml_test_activity_filter_export/014-14-search-by-request-label-applied.png).

### F16.S09 — Inspect transactions in external block explorers.

**Evidence still partial.** Explorer URI construction is tested; opening a third-party browser/service was not exercised. No matching screenshot collected.

**Still needed:** Configure a controlled explorer URL, open a real transaction, confirm the outgoing URL contains its exact transaction ID, and observe browser delivery.

## F18 — Manage Address Book

[Pinned implementation modules and original tests](../../features/18-manage-address-book.md#modules)

### F18.S05 — Copy saved addresses and labels to the clipboard.

**Evidence still partial.** Address copying is supported; separate label-copy coverage needs verification.

**Still needed:** Copy a saved address and an editable saved label through the GUI; assert both clipboard values exactly match the records.

## F20 — Set Up and Synchronize Node

[Pinned implementation modules and original tests](../../features/20-set-up-and-synchronize-node.md#modules)

### F20.S03 — Assess available storage, expected requirements, and the effect of pruning on wallet recovery.

**Evidence still partial.** Storage and pruning information is shown; wallet-recovery consequences are not explained.

**Still needed:** Exercise sufficient and insufficient free space and pruning choices; assert displayed requirements and the accepted storage selection. Recovery guidance remains a documented UI difference.

### F20.S04 — Download and validate the blockchain.

**Full scoped proof.** The GUI node downloads and validates the same chain tip as its peer. A real peer supplied 2,200 blocks over a rate-limited loopback connection. This is regtest, not a full mainnet initial download.

- `download-and-validate` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).

Captures: [GUI node reaches the peer’s validated chain tip](media/qml/qml_evidence_sync/003-real-peer-sync-complete.png).

### F20.S05 — Monitor synchronization progress and how far the node is behind.

**Full scoped proof.** The GUI shows synchronization while its real node remains behind its peer. The GUI node downloads and validates the same chain tip as its peer.

- `real-sync-in-progress` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).
- `download-and-validate` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).

Captures: [Live peer synchronization in progress](media/qml/qml_evidence_sync/001-live-regtest-sync-progress.png), [GUI node reaches the peer’s validated chain tip](media/qml/qml_evidence_sync/003-real-peer-sync-complete.png).

### F20.S07 — Use mainnet, testnet, testnet4, signet, or regtest. Network support.

**Evidence still partial.** Regtest is executed; other chains are source/configuration evidence only. No matching screenshot collected.

**Still needed:** Launch isolated offline profiles for mainnet, testnet, testnet4, signet and regtest; assert the active chain and GUI identity for each.

## F21 — Configure Network and Manage Peers

[Pinned implementation modules and original tests](../../features/21-configure-network-and-manage-peers.md#modules)

### F21.S01 — Enable or pause peer-to-peer networking.

**Full scoped proof.** Pausing from the node view disables Core peer networking. Resuming from the node view enables Core peer networking.

- `pause-network` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `resume-network` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Peer networking paused by the GUI](media/qml/qml_evidence_desktop/008-network-paused.png).

### F21.S03 — Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support.

**Evidence still partial.** Proxy settings and validation are tested; live Tor/SOCKS routing is not.

**Still needed:** Use controlled SOCKS5 and Tor routes, verify connections reach the configured proxy, and prove no unintended direct connection bypasses it.

### F21.S04 — Automatically configure router access for incoming connections where supported.

**Evidence still partial.** Configuration exists; physical-router mapping is untested. No matching screenshot collected.

**Still needed:** Enable mapping against a controlled gateway; verify the resulting mapping and its removal/renewal. A settings toggle alone does not prove router behavior.

## F22 — Inspect Node and Use RPC Console

[Pinned implementation modules and original tests](../../features/22-inspect-node-and-use-rpc-console.md#modules)

### F22.S03 — Focus traffic monitoring on a chosen time period or begin a fresh observation.

**Evidence still partial.** Traffic periods are selectable; resetting traffic history is missing.

**Still needed:** Produce deterministic traffic, select different observation periods, and verify displayed samples and totals follow the selected period.

### F22.S09 — Use RPC for descriptor import, multisig setup, wallet rescans, and combining PSBTs.

**Evidence still partial.** RPC is available; this collection does not execute every advanced command listed.

**Still needed:** Run descriptor import, multisig setup and PSBT combination through the GUI console and validate resulting wallet/PSBT state. Rescan is covered by the new watch-only test.

## F23 — Configure Application Preferences

[Pinned implementation modules and original tests](../../features/23-configure-application-preferences.md#modules)

### F23.S01 — Allocate memory and processing resources for block validation.

**Failure reproduced.** A new functional regression fails: Core starts with -dbcache=768, but entering 768 in the GUI leaves 7. The GUI maximum is derived from the 8 MiB coins-database sub-cache constant, rather than the total database-cache range. Small allocations and script-thread settings pass; this criterion remains unaccepted.

- `core-accepts-768` — passed; [qml_evidence_cache_limit](scripts/qml_evidence_cache_limit.py) · [log](logs/qml_evidence_cache_limit.log).
- `gui-accepts-768` — failed; [qml_evidence_cache_limit](scripts/qml_evidence_cache_limit.py) · [log](logs/qml_evidence_cache_limit.log).
- `resource-preferences` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `resources-restored` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Resource preferences and restart guidance](media/qml/qml_evidence_desktop/010-resource-settings-restart-guidance.png), [Small resource allocations retained after restart](media/qml/qml_evidence_desktop/013-resource-settings-after-restart.png), [Core accepts a 768 MiB cache allocation](media/qml/qml_evidence_cache_limit/001-valid-core-cache-allocation.png), [GUI incorrectly rejects that allocation and leaves 7](media/qml/qml_evidence_cache_limit/002-gui-rejects-valid-cache-allocation.png).

**Still needed:** Fix the GUI total-cache range, then make the new 768 MiB regression pass. Add boundary cases and assert persistence after restart.

### F23.S02 — Allow external tools to communicate with the node through RPC.

**Full scoped proof.** The displayed RPC server is enabled and serves a real external client.

- `rpc-server` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [RPC server configured and serving a client](media/qml/qml_evidence_desktop/009-rpc-server-configured.png).

### F23.S10 — Manage advanced application configuration.

**Full scoped proof.** The configuration-file value is shown when no command-line or GUI override is present.

- `configuration-precedence` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Configuration value used when overrides are absent](media/qml/qml_evidence_desktop/015-configuration-file-setting-precedence.png).

### F23.S11 — Understand which settings take precedence and which changes require a restart.

**Full scoped proof.** Command-line settings override configuration and GUI settings and disable editing. A persisted GUI override takes precedence over the configuration file. The configuration-file value is shown when no command-line or GUI override is present.

- `command-line-precedence` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `gui-over-config` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `configuration-precedence` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Resource preferences and restart guidance](media/qml/qml_evidence_desktop/010-resource-settings-restart-guidance.png), [Command-line setting overrides the GUI](media/qml/qml_evidence_desktop/014-command-line-setting-precedence.png), [Configuration value used when overrides are absent](media/qml/qml_evidence_desktop/015-configuration-file-setting-precedence.png).

### F23.S12 — Restore default preferences while retaining a backup of previous settings.

**Evidence still partial.** A fresh functional rerun restores connection/proxy defaults through startup reset. No functional assertion yet checks that the previous settings file was retained as a recoverable backup.


Captures: [Reset returns connection preferences to defaults](media/qml/qml_test_resetguisettings/040-wait-for-page-proxysettingsrow.png).

**Still needed:** Seed nondefault preferences, reset through the supported startup flow, and assert a nonempty backup retains the original settings and can be read back.

## F24 — System Tray / macOS Dock

[Pinned implementation modules and original tests](../../features/24-system-tray-macos-dock.md#modules)

### F24.S01 — Keep the application accessible while its main window is hidden.

**Evidence still partial.** Native Linux tray Hide/Show passed; macOS Dock and Windows remain untested. Linux tray hides the QML window while RPC still responds. passed. Linux tray restores the QML window. passed.

**Still needed:** Repeat native hide/restore on Windows and macOS; assert the process and node remain alive while the window is hidden.

### F24.S02 — Control application visibility without interrupting the node.

**Evidence still partial.** Native Linux Hide/Show preserves a responding node; other desktop implementations remain untested. Linux tray hides the QML window while RPC still responds. passed. Linux tray restores the QML window. passed.

**Still needed:** Exercise visibility transitions on Windows/macOS and assert node RPC remains responsive. Linux native Hide/Show already has proof.

### F24.S03 — Quickly access payments, message signing and verification, settings, and diagnostics.

**Evidence still partial.** Keyboard navigation reaches payments and diagnostics in the main window. The original native Linux tray proof establishes Hide/Show separately. A combined tray-restore-and-actions scenario is still missing.


Captures: [Node diagnostics and guidance while a wallet is loaded](media/qml/qml_evidence_desktop/007-diagnostics-with-wallet.png).

**Still needed:** After native tray/Dock restoration, reach payment, message signing/verification, settings and diagnostics while preserving the selected wallet.

## F25 — Desktop Notifications

[Pinned implementation modules and original tests](../../features/25-desktop-notifications.md#modules)

### F25.S04 — Receive critical error messages when desktop notifications are unavailable.

**Full scoped proof.** The live QML error dialog displays the supplied critical error and the expected acknowledgement button without desktop notifications. The message is injected through the test bridge; no database corruption is induced.

- `existing-f25-s04` — passed; [qml_test_node_runtime_dialogs](scripts/qml_test_node_runtime_dialogs.py) · [log](logs/qml_test_node_runtime_dialogs.log).

Captures: [Critical error delivered inside the application](media/qml/qml_test_node_runtime_dialogs/001-database-read-error.png).

## F26 — Manage Application Windows

[Pinned implementation modules and original tests](../../features/26-manage-application-windows.md#modules)

### F26.S01 — Arrange, hide, and restore application windows.

**Full scoped proof.** Minimizing the GUI leaves the node responding. The desktop restores the minimized application window.

- `window-minimize` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).
- `window-restore` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).

Captures: [Application window restored through the desktop](media/qml/qml_evidence_shell/003-window-restored-from-desktop.png).

### F26.S02 — Remember the main window placement between sessions.

**Full scoped proof.** The real window position and size survive an application restart.

- `window-placement-restored` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Window placement restored after restart](media/qml/qml_evidence_desktop/012-window-placement-restored.png).

### F26.S04 — Use diagnostics alongside wallet activity.

**Full scoped proof.** Node diagnostics execute while the same wallet remains loaded. Diagnostics and wallet activity use different views of the same window, without simultaneous side-by-side display.

- `wallet-diagnostics` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Node diagnostics and guidance while a wallet is loaded](media/qml/qml_evidence_desktop/007-diagnostics-with-wallet.png).

## F27 — Start and Exit Application

[Pinned implementation modules and original tests](../../features/27-start-and-exit-application.md#modules)

### F27.S03 — Monitor initialization progress.

**Evidence still partial.** Pre-init and node startup states are captured. No matching screenshot collected.

**Still needed:** Use a sufficiently long real initialization/reindex fixture, assert progress updates remain visible, and capture a stable initialization frame.

### F27.S04 — Request an orderly shutdown during startup.

**Evidence still partial.** Initialization shutdown is tested with IPC disabled; IPC-enabled process lifecycle is outside this build. Cancellation during initialization is exercised. No matching screenshot collected.

**Still needed:** Run initialization cancellation with IPC enabled; assert GUI and child-node exit status and inspect both stderr streams under the required sanitizer configuration.

## F28 — Navigate the Application

[Pinned implementation modules and original tests](../../features/28-navigate-the-application.md#modules)

### F28.S03 — Access address records and node diagnostics.

**Full scoped proof.** Wallet settings opens the address records. Node diagnostics execute while the same wallet remains loaded.

- `open-address-records` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `wallet-diagnostics` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Address records reached from wallet settings](media/qml/qml_evidence_desktop/006-address-records.png), [Node diagnostics and guidance while a wallet is loaded](media/qml/qml_evidence_desktop/007-diagnostics-with-wallet.png).

### F28.S04 — Reach common wallet and application tasks quickly.

**Full scoped proof.** Keyboard shortcut reaches sendPage Keyboard shortcut reaches requestPaymentPage Keyboard shortcut reaches activityPage

- `shortcut-ctrl+2` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `shortcut-ctrl+3` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `shortcut-ctrl+1` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Send reached with its keyboard shortcut](media/qml/qml_evidence_desktop/001-keyboard-sendpage.png), [Receive reached with its keyboard shortcut](media/qml/qml_evidence_desktop/002-keyboard-requestpaymentpage.png).

### F28.S05 — Use keyboard shortcuts for navigation and common actions.

**Full scoped proof.** Keyboard shortcut reaches sendPage Keyboard shortcut reaches requestPaymentPage Keyboard shortcut reaches activityPage

- `shortcut-ctrl+2` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `shortcut-ctrl+3` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).
- `shortcut-ctrl+1` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Send reached with its keyboard shortcut](media/qml/qml_evidence_desktop/001-keyboard-sendpage.png), [Receive reached with its keyboard shortcut](media/qml/qml_evidence_desktop/002-keyboard-requestpaymentpage.png).

## F29 — View Application Status

[Pinned implementation modules and original tests](../../features/29-view-application-status.md#modules)

### F29.S02 — Understand synchronization progress and whether wallet information is current.

**Full scoped proof.** The GUI shows synchronization while its real node remains behind its peer. The GUI node downloads and validates the same chain tip as its peer.

- `real-sync-in-progress` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).
- `download-and-validate` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).

Captures: [Live peer synchronization in progress](media/qml/qml_evidence_sync/001-live-regtest-sync-progress.png), [GUI node reaches the peer’s validated chain tip](media/qml/qml_evidence_sync/003-real-peer-sync-complete.png).

### F29.S06 — Understand available actions through contextual guidance.

**Full scoped proof.** The console explains history navigation and how to discover available commands.

- `contextual-guidance` — passed; [qml_evidence_desktop](scripts/qml_evidence_desktop.py) · [log](logs/qml_evidence_desktop.log).

Captures: [Node diagnostics and guidance while a wallet is loaded](media/qml/qml_evidence_desktop/007-diagnostics-with-wallet.png).

## F30 — Show Progress, Errors, and Confirmations

[Pinned implementation modules and original tests](../../features/30-show-progress-errors-and-confirmations.md#modules)

### F30.S06 — Assess synchronization progress, processing rate, and estimated remaining work.

**Evidence still partial.** Real peer synchronization is now captured, including the initial “Estimating” state. A settled ETA and its behavior under changing throughput are not yet exercised.

- `real-sync-in-progress` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).

Captures: [Live peer synchronization in progress](media/qml/qml_evidence_sync/001-live-regtest-sync-progress.png).

**Still needed:** Extend the controlled peer transfer until a settled ETA appears; assert progress advances and the estimate responds sensibly to throughput changes.

### F30.S07 — Monitor background synchronization while retaining access to the application.

**Full scoped proof.** The wallet remains navigable while the connected node is still syncing.

- `wallet-access-during-sync` — passed; [qml_evidence_sync](scripts/qml_evidence_sync.py) · [log](logs/qml_evidence_sync.log).

Captures: [Wallet navigation remains available during synchronization](media/qml/qml_evidence_sync/002-wallet-accessible-during-sync.png).

## F31 — Desktop Integration and Application Help

[Pinned implementation modules and original tests](../../features/31-desktop-integration-and-application-help.md#modules)

### F31.S01 — Open Bitcoin payment requests from other applications or by drag and drop.

**Full scoped proof.** The running application accepts an explicit payment-request import and populates the payment. This proves the accepted transfer outcome; automatic OS URI delivery remains absent.

- `existing-f10-s03` — passed; [qml_test_uri_import](scripts/qml_test_uri_import.py) · [log](logs/qml_test_uri_import.log).

Captures: [Payment request imported into the running application](media/qml/qml_test_uri_import/006-click-senduriimportapplybutton.png).

### F31.S02 — Distinguish application instances using different Bitcoin networks.

**Evidence still partial.** Regtest identity is captured; other network identities have source/component coverage. No matching screenshot collected.

**Still needed:** Capture the identity shown by each of the five supported networks, including simultaneous distinct profiles.

### F31.S03 — Adapt application visuals to the desktop appearance.

**Full scoped proof.** The light appearance can be selected from the GUI. The dark appearance can be selected from the GUI. Manual theme choice is the accepted outcome; automatic desktop-theme following remains absent.

- `appearance-light` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).
- `appearance-dark` — passed; [qml_evidence_shell](scripts/qml_evidence_shell.py) · [log](logs/qml_evidence_shell.log).

Captures: [Manual light appearance](media/qml/qml_evidence_shell/001-manual-light-appearance.png), [Manual dark appearance](media/qml/qml_evidence_shell/002-manual-dark-appearance.png).

### F31.S05 — Use external block explorers to inspect transactions.

**Evidence still partial.** Explorer URL generation has tests; browser launch remains manual. No matching screenshot collected.

**Still needed:** Assert a configured explorer action delivers the selected transaction ID to a controlled browser target. Current evidence checks URL construction only.

## F34 — Monitor and Cancel Wallet Rescans

[Pinned implementation modules and original tests](../../features/34-monitor-and-cancel-wallet-rescans.md#modules)

### F34.S01 — Rediscover wallet activity from blockchain history.

**Full scoped proof.** Removing historical wallet records leaves the monitoring wallet empty before rescan. A rescan initiated in the GUI recovers the historical wallet funds.

- `rescan-fixture` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).
- `console-rescan` — passed; [qml_evidence_watchonly](scripts/qml_evidence_watchonly.py) · [log](logs/qml_evidence_watchonly.log).

Captures: [Console rescan recovers historical wallet funds](media/qml/qml_evidence_watchonly/001-console-rescan-recovers-history.png), [Recovered activity in a watch-only wallet](media/qml/qml_evidence_watchonly/002-watch-only-recovered-activity.png).
