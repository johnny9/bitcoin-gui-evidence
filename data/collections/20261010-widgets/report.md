# Qt Widgets evidence capture pass — October 10, 2026

61 real application screenshots add visual proof for 58 of the 69 Qt Widgets criteria that previously had no matching capture. Eleven still have no suitable screenshot. The 44 latest checks pass: 43 criterion assertions and one fixture check. These results strengthen the reference evidence for agreeing GUI-QML acceptance criteria; they do not automatically accept a feature or change GUI-QML parity, evidence, scope, or personal reviews.

[Coverage before and after, including all remaining gaps](coverage.json) · [Latest targeted assertions with actual and expected values](logs/checks.json) · [Raw capture timestamps and hashes](media/widgets/captures.json) · [Validation record](validation.json)

## Provenance and scope

- Unchanged Qt Widgets executable from `bitcoin-core/gui` revision `f739c7876b81304bdc72e7eaa307702da269ac31`; host source checkout rechecked clean. Qt 6.4.2, Linux X11/Xvfb `:98`, Openbox, trayer, synthetic regtest wallets. All payment values and keys belong to disposable fixtures.
- Executable SHA-256: `45f42bea79e43dcba84cf4dd22b51585a293c4ee7f65250da23d024aa53fdee4`. Existing external driver SHA-256: `55eb05e587d1d761b370bb8eb82b8b24e4447c027f01fd8a2c9eeda5a681584f`.
- The original executable's `-dirty` display label and unavailable container Git alternates are documented in the [original provenance](../../PROVENANCE.md). Source provenance relies on the clean pinned host checkout and exact executable hash, not that label.
- Screenshots are unmodified widget grabs or direct X11 window/desktop captures, not reconstructions. The [external driver](../../scripts/widgets_bridge.cpp) uses Qt test input and native X11 actions against real application behavior. This is an instrumented process, not an untouched production-package certification.
- Each criterion below identifies its own captures, scoped checks, source modules and limits. Related upstream tests remain on the feature pages; they were not all rerun. This is a staged exploratory capture session, not a fresh full-suite pass.
- Hardware devices, macOS, Windows, public-network synchronization, live block-explorer availability and all notification categories remain outside this pass. The five network-selection checks start offline. Chain download uses a local regtest peer.
- No application source or binary was modified. Native lint, clang-tidy and ASan/LSan/UBSan/integer-sanitizer CI were not run for this capture pass; their entry scripts are absent from the standalone website repository. No sanitizer or IPC-enabled lifecycle pass is claimed.

## Methods and reproduction

The [capture scenarios](scripts/capture_widgets.py), [Python driver](scripts/widgets_driver.py) and [launcher](scripts/launch.py) retain the actual automation. They use the existing `/work/widgets-build/bin/bitcoin-qt` and `/work/widgets_bridge_v2.so` in container image `pr915-review-qt:20260923`, with `/work/reruns/20261010-widgets` as a disposable working directory. The original evidence pack describes build configuration and bridge compilation. The container was returned to its original stopped state after capture.

This is a staged session: scripts require their documented preceding fixtures and are not an unattended one-command suite. Start the desktop with `python3 scripts/launch.py desktop`; start the GUI with a distinct session name using `launch.py`; invoke one scenario at a time with `python3 scripts/capture_widgets.py <scenario>`. Command records in `logs/*.command.json` retain launch arguments. Prepare descriptor imports headlessly before loading their wallets in the GUI. Use only disposable regtest datadirs; never point these fixtures at a real wallet.

- [Watch-only setup](scripts/prepare.py), [legacy fixture](scripts/prepare_legacy.py), [multisig and longer-chain fixture](scripts/prepare_extra.py): synthetic setup through local RPC. The retained v28 daemon creates the legacy backup; its binary provenance remains in the original pack. Private wallet files and descriptors are not published.
- `wallet_basics`, `wallet_open`, `migrate_legacy`, `migrate_finish`, `watch_receive`, `input_warnings`, `change_warning`, `recent_history`: wallet and validation workflows.
- `psbt_watchonly`, `refresh_psbt_review`, `multisig_signing`, `no_wallet_psbt`: GUI unsigned creation, clipboard/file round trip, one then two signatures, and wallet-free broadcast. The multisig input PSBT is prepared by RPC.
- `privacy_windows`, `restart_proof`, `reset_preferences`, `post_reset_minimized`: preferences and desktop session behavior across actual process restarts.
- `copy_banned_range`, `rescan_progress`, `external_uri`, `tooltip_guidance`, `drag_qr`, `desktop_files`, `explorer_configure`, `explorer_open`: actual clipboard, native input and external-application handoffs. The [independent Qt receiver/viewer](scripts/external_fixture.cpp) accepts real QR drag data, opens actual configuration/log files read-only, and records explorer URLs without making network requests. Its [desktop entry](scripts/widgets-evidence-viewer.desktop) and [MIME associations](scripts/mimeapps.list) are retained; it explicitly unsets the application's evidence-driver environment. [Handoff records](logs/external-opens.jsonl) and [QR reception](logs/qr-drop.json) are separate from the screenshots.
- [Network selection and shutdown](scripts/networks.py), [early startup dialogs](scripts/auxiliary.py), [initialization splash](scripts/startup_capture.py): offline startup variants and transient application windows.
- [Local peer transfer](scripts/transfer_monitor.py), followed by [monitor recovery](scripts/monitor_recovery.py): the second node downloads 15,120 blocks; after a live screenshot timeout its GUI is restarted. The GUI-exported monitoring wallet is restored through RPC fixture setup before loading it in that GUI.
- [Startup cancellation attempt](scripts/startup_cancel.py): retained as an unsuccessful attempt. It missed the splash; no criterion is promoted for startup cancellation.

The [raw bridge trace](logs/widgets-bridge.jsonl.gz) includes the actual requests/responses and capture events. Larger logs and failure widget trees use gzip; `gzip -dc <file.gz>` reads the original content. The latest checks file replaces earlier results with the same check ID; individual scenario logs and the raw trace preserve troubleshooting history. Asset and script hashes are recorded in [the collection manifest](result.json).

## Failed attempts and validation limits

This pass required harness corrections. Initial descriptor setup stalled in a loaded GUI and that disposable process was terminated (`initial.exit = -9`); setup then completed headlessly. A synchronous test-input command that opened a change-address modal timed out and its disconnected instrumented GUI later exited `-11` (`capture.exit`); native typing and explicit dialog handling then completed the scenario successfully. This remains a limitation of the instrumented session, not a demonstrated clean application run.

Other retries corrected a background-window button match, the migration-backup path assertion, and a clipboard read. An external viewer initially inherited the driver/socket and later kept inherited RPC listening descriptors open; the desktop fixture now unsets that environment and is explicitly terminated after use. One restart failed to bind its RPC port (`capture5.exit = 1`) before that cleanup. Native Alt+F4 cleanup left modifier keys held after a vanished-window error; keys were released and later cleanup stopped only the fixture process. No application implementation was changed to obtain a pass.

The local-peer download succeeded by RPC, but its first live GUI capture timed out. The final screenshots therefore show the independently restarted second node and restored monitoring wallet; they do not depict the download in progress. The startup-cancellation attempt also missed the transient splash. Its remaining GUI was closed through normal Exit after startup; the [cleanup log](logs/startup-cancel-cleanup.log) records shutdown, not successful startup cancellation.

The latest 44 checks pass (43 criterion assertions and one fixture check). All five offline network sessions and the final monitoring GUI exited 0; other successful staged GUI runs also have recorded exit files. The corrupt-settings Abort fixture intentionally exits 1 while preserving the file. GUI stderr is retained, including Qt environment warnings. These results do not establish a warning-free, uninstrumented, sanitizer or full upstream functional-suite pass.

## Remaining screenshot gaps

- **F08.S08 — Verify receiving addresses on a compatible signing device.** No compatible physical signing device was attached; on-device address verification remains unproven.
- **F15.S02 — Keep spending keys on the signing device.** No physical signing device was attached; a screenshot of a simulated signer would not prove key custody on a device.
- **F15.S03 — Generate receiving addresses and verify them on the device.** Receiving-address generation and verification on a physical signing device remain untested.
- **F15.S04 — Authorize outgoing payments using the device.** No physical device was available to demonstrate payment authorization.
- **F15.S05 — Continue a signing workflow when additional signatures are needed. Signing workflow.** Local multisig exchange is captured under F14, but it does not prove continuation through an external signing device.
- **F25.S03 — Receive informational, warning, and critical messages through desktop notifications.** The existing notification evidence does not demonstrate all informational, warning and critical desktop categories. This pass did not produce a new capture that establishes that scope.
- **F25.S05 — Avoid a flood of notifications while historical wallet activity is being loaded.** No controlled notification-service comparison during historical wallet loading was recorded. A silent desktop alone would not prove suppression.
- **F27.S04 — Request an orderly shutdown during startup.** The startup-cancellation attempt missed the short-lived splash screen. The remaining GUI was closed normally after startup; that is not proof of cancellation during initialization.
- **F27.S08 — Coordinate application shutdown with Windows session shutdown.** This pass ran on Linux X11. Windows session-shutdown coordination requires a dedicated Windows run.
- **F31.S03 — Adapt application visuals to the desktop appearance.** One Linux appearance was used. No controlled desktop-theme change was captured.
- **F31.S04 — Prevent macOS background throttling from slowing initial synchronization and reindexing.** This pass ran on Linux. macOS background-throttling behavior requires macOS runtime measurement.

## Criterion evidence

### F02 — Open, Switch, and Close Wallets

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).

[Original feature record and related upstream tests](../../features/02-open-switch-and-close-wallets.md)

#### F02.S01 — Open existing wallets.

October 10 capture pass: The GUI reopens the previously closed wallet.

Captures:

- [File menu offers opening an existing wallet.](media/widgets/open-wallet-menu.png)
- [Open Wallet lists the closed Recipient wallet for reopening.](media/widgets/open-existing-wallet.png)
- [Previously closed wallet is open again and active.](media/widgets/reopened-wallet.png)

Targeted checks in [checks.json](logs/checks.json): `reopen-existing-wallet`.

#### F02.S04 — Close individual wallets or all wallets.

October 10 capture pass: GUI closes the selected wallet while other wallets remain loaded. After the GUI closes all wallets, node RPC still responds.

Captures:

- [Closing the selected wallet requires confirmation.](media/widgets/close-wallet-confirmation.png)
- [Close all loaded wallets while keeping the node running.](media/widgets/close-all-wallets.png)

Targeted checks in [checks.json](logs/checks.json): `close-selected-wallet`, `node-without-wallets`.

### F03 — Back Up and Restore Wallet

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/walletcontroller.cpp).

[Original feature record and related upstream tests](../../features/03-back-up-and-restore-wallet.md)

#### F03.S04 — Recover and update a legacy wallet backup.

October 10 capture pass: GUI restores a legacy backup and converts it into a loaded SQLite descriptor wallet.

Captures:

- [Legacy backup restore explains descriptor conversion, the automatic backup, and separate watch-only wallets.](media/widgets/restore-migrate-legacy-confirmation.png)
- [Migration reports the converted wallet and the separated watch-only wallet.](media/widgets/legacy-migration-success.png)

Targeted checks in [checks.json](logs/checks.json): `legacy-restore-migrate`.

### F04 — Migrate Legacy Wallet

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/walletcontroller.cpp).

[Original feature record and related upstream tests](../../features/04-migrate-legacy-wallet.md)

#### F04.S01 — Update legacy wallets to the current wallet format.

October 10 capture pass: GUI restores a legacy backup and converts it into a loaded SQLite descriptor wallet.

Captures:

- [Legacy backup restore explains descriptor conversion, the automatic backup, and separate watch-only wallets.](media/widgets/restore-migrate-legacy-confirmation.png)
- [Migration reports the converted wallet and the separated watch-only wallet.](media/widgets/legacy-migration-success.png)

Targeted checks in [checks.json](logs/checks.json): `legacy-restore-migrate`.

#### F04.S02 — Preserve the original wallet with an automatic backup.

October 10 capture pass: GUI migration automatically retains a nonempty original-format backup.

Captures:

- [Legacy backup restore explains descriptor conversion, the automatic backup, and separate watch-only wallets.](media/widgets/restore-migrate-legacy-confirmation.png)
- [Migration reports the converted wallet and the separated watch-only wallet.](media/widgets/legacy-migration-success.png)

Targeted checks in [checks.json](logs/checks.json): `migration-backup`.

#### F04.S03 — Preserve wallet contents, including watch-only information.

October 10 capture pass: Original receiving labels and watch-only information survive migration. Limit: Checks cover receiving labels and watch-only addresses; not every historical transaction or script type.

Captures:

- [Legacy backup restore explains descriptor conversion, the automatic backup, and separate watch-only wallets.](media/widgets/restore-migrate-legacy-confirmation.png)
- [Migration reports the converted wallet and the separated watch-only wallet.](media/widgets/legacy-migration-success.png)
- [The migrated watch-only wallet retains its labeled receiving address.](media/widgets/migrated-watchonly-labels.png)

Targeted checks in [checks.json](logs/checks.json): `migration-contents`.

#### F04.S04 — Open migrated wallets immediately or later.

October 10 capture pass: Wallet is migrated on disk and remains unloaded. Previously deferred migrated wallet can later be opened through the GUI.

Captures:

- [Migration reports the converted wallet and the separated watch-only wallet.](media/widgets/legacy-migration-success.png)
- [Migration can finish without immediately loading the converted wallet.](media/widgets/migrate-without-opening.png)
- [Migration completed with loading disabled.](media/widgets/deferred-migration-success.png)
- [The previously deferred migrated wallet is now open.](media/widgets/deferred-wallet-opened.png)

Targeted checks in [checks.json](logs/checks.json): `deferred-migration-unloaded`, `open-deferred-migrated-wallet`.

### F05 — Export Watch-Only Wallet

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).

[Original feature record and related upstream tests](../../features/05-export-watch-only-wallet.md)

#### F05.S03 — Transfer wallet monitoring to another node.

October 10 capture pass: Separate node restores the GUI-exported wallet with public monitoring descriptors and no spending keys. Restore is RPC fixture setup. The independently restored watch-only wallet is loaded in the second GUI and has a rediscovered balance. Limit: Export uses the GUI; restoring the export on the second node is RPC fixture setup. The final screenshot shows the restored monitoring wallet.

Captures:

- [GUI displays the watch-only wallet restored from its export on a second node. Restore preparation used RPC.](media/widgets/watchonly-monitor-another-node.png)

Targeted checks in [checks.json](logs/checks.json): `exported-monitor-on-second-node`, `transferred-monitor-visible`.

### F06 — Encrypt Wallet and Manage Passphrase

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/askpassphrasedialog.cpp).

[Original feature record and related upstream tests](../../features/06-encrypt-wallet-and-manage-passphrase.md)

#### F06.S07 — Receive feedback on passphrase mismatches and common entry mistakes.

October 10 capture pass: Different repeated passphrases produce a visible validation error. Limit: Repeated-passphrase mismatch is covered; Caps Lock and other entry mistakes were not exercised.

Captures:

- [The application rejects mismatching repeated passphrases.](media/widgets/passphrase-mismatch-error.png)

Targeted checks in [checks.json](logs/checks.json): `passphrase-mismatch`.

### F07 — View Wallet Overview

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/overviewpage.cpp).

[Original feature record and related upstream tests](../../features/07-view-wallet-overview.md)

#### F07.S03 — Find a recent transaction in the full transaction history.

October 10 capture pass: Clicking a recent transaction opens the full history.

Captures:

- [A recent overview transaction is selected in the full transaction history.](media/widgets/recent-transaction-in-history.png)

Targeted checks in [checks.json](logs/checks.json): `recent-opens-history`.

#### F07.S04 — Know when wallet information may be out of date.

October 10 capture pass: Synchronization overlay explains that wallet information can be out of date. Synthetic regtest at genesis; not a mainnet IBD run. Wallet remains accessible while the status bar reports incomplete synchronization. Limit: Captured on isolated regtest with incomplete synchronization; full public-network initial synchronization was not run.

Captures:

- [Synchronization overlay explains that wallet information can be out of date. Synthetic regtest at genesis; not a mainnet IBD run.](media/widgets/sync-overlay-wallet-outdated.png)
- [Wallet remains accessible while the status bar reports incomplete synchronization.](media/widgets/sync-background-wallet-access.png)

Visual proof only; no new targeted assertion for this exact criterion.

### F08 — Receive Bitcoin / Request Payment

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/receivecoinsdialog.cpp).

[Original feature record and related upstream tests](../../features/08-receive-bitcoin-request-payment.md)

#### F08.S06 — Share QR images with other applications using drag and drop.

October 10 capture pass: Actual drag-and-drop delivers an image to an independent Qt application. Limit: The receiver is a separate Qt test application accepting the actual dragged image. Other desktop applications were not tested.

Captures:

- [QR image dragged from Bitcoin Core into an independent image-receiver test application.](media/widgets/qr-drag-delivered.png)

Targeted checks in [checks.json](logs/checks.json): `qr-drag-to-external-app`.

#### F08.S08 — Verify receiving addresses on a compatible signing device.

No new matching capture. No compatible physical signing device was attached; on-device address verification remains unproven.

#### F08.S09 — Generate receiving addresses for a configured watch-only wallet.

October 10 capture pass: Watch-only wallet generates a receive address from imported public descriptors.

Captures:

- [Receiving address generated from a configured wallet with private keys disabled.](media/widgets/watchonly-receiving-address.png)

Targeted checks in [checks.json](logs/checks.json): `watchonly-receive`.

### F09 — Send Bitcoin

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/sendcoinsdialog.cpp).

[Original feature record and related upstream tests](../../features/09-send-bitcoin.md)

#### F09.S07 — Sign payments with local spending keys or a compatible external signer.

October 10 capture pass: A wallet with the matching local key signs the watch-only proposal and exports a finalizable PSBT. Limit: Local spending keys are covered; a physical external signer was not used.

Captures:

- [Matching local wallet signs the imported single-signature PSBT and copies it for further transfer.](media/widgets/signed-psbt-export.png)

Targeted checks in [checks.json](logs/checks.json): `sign-watchonly-proposal`.

#### F09.S08 — Prepare a payment from a watch-only wallet for signing elsewhere.

October 10 capture pass: Watch-only GUI produces a decodable PSBT in the clipboard without signatures.

Captures:

- [Configured watch-only wallet prepares a payment without spending keys.](media/widgets/watchonly-prepare-payment.png)
- [Watch-only single-signature transaction review offers unsigned creation after the review countdown.](media/widgets/watchonly-unsigned-review.png)

Targeted checks in [checks.json](logs/checks.json): `watchonly-unsigned-psbt`.

### F10 — Open Payment URI

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/paymentserver.cpp).

[Original feature record and related upstream tests](../../features/10-open-payment-uri.md)

#### F10.S03 — Handle payment requests from other applications, including while Bitcoin Core is already running.

October 10 capture pass: A second process passes its payment URI to the already-running GUI. Limit: A second Bitcoin process hands a URI to the running GUI. OS URL registration and dragging URIs were not tested.

Captures:

- [Payment URI launched from another process populates the running wallet send form. Linux process handoff; OS association and URI dragging are not covered.](media/widgets/external-payment-uri-received.png)

Targeted checks in [checks.json](logs/checks.json): `running-uri-handoff`.

### F12 — Select Coins / Coin Control

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/coincontroldialog.cpp).

[Original feature record and related upstream tests](../../features/12-select-coins-coin-control.md)

#### F12.S09 — Receive a warning when a change destination is not recognized as spendable by the wallet.

October 10 capture pass: Application requires confirmation for a change destination outside the selected wallet.

Captures:

- [A destination outside this wallet triggers an explicit warning before using it for change.](media/widgets/unknown-change-confirmation.png)

Targeted checks in [checks.json](logs/checks.json): `unknown-change-confirmation`.

### F13 — Create and Export PSBT

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/sendcoinsdialog.cpp).

[Original feature record and related upstream tests](../../features/13-create-and-export-psbt.md)

#### F13.S02 — Create transactions from watch-only wallets or wallets containing spending keys.

October 10 capture pass: Watch-only GUI produces a decodable PSBT in the clipboard without signatures. Limit: This pass covers a configured watch-only wallet; the original targeted assertion covers a spending wallet.

Captures:

- [Configured watch-only wallet prepares a payment without spending keys.](media/widgets/watchonly-prepare-payment.png)
- [Watch-only single-signature transaction review offers unsigned creation after the review countdown.](media/widgets/watchonly-unsigned-review.png)

Targeted checks in [checks.json](logs/checks.json): `watchonly-unsigned-psbt`.

#### F13.S03 — Use single-signature or previously configured multisig wallets.

October 10 capture pass: Watch-only GUI produces a decodable PSBT in the clipboard without signatures. Limit: GUI transaction creation is single-signature. The multisig PSBT used below was prepared by RPC, so it does not prove GUI multisig creation.

Captures:

- [Watch-only single-signature transaction review offers unsigned creation after the review countdown.](media/widgets/watchonly-unsigned-review.png)

Targeted checks in [checks.json](logs/checks.json): `watchonly-unsigned-psbt`.

#### F13.S05 — Copy an unsigned PSBT to the clipboard or save it to a file for signing elsewhere.

October 10 capture pass: Watch-only GUI produces a decodable PSBT in the clipboard without signatures. Saved PSBT matches the clipboard transaction.

Captures:

- [The unsigned transaction has been copied to the clipboard and can be saved.](media/widgets/unsigned-psbt-clipboard.png)
- [Save the unsigned PSBT for offline signing.](media/widgets/unsigned-psbt-save.png)

Targeted checks in [checks.json](logs/checks.json): `watchonly-unsigned-psbt`, `psbt-file-roundtrip`.

### F14 — Import, Sign, and Broadcast PSBT

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/psbtoperationsdialog.cpp).

[Original feature record and related upstream tests](../../features/14-import-sign-and-broadcast-psbt.md)

#### F14.S03 — Process single-signature and multisig transactions when the required keys and transaction information are available.

October 10 capture pass: A wallet with the matching local key signs the watch-only proposal and exports a finalizable PSBT. The first cosigner adds exactly one partial signature. First local cosigner signs and exports a PSBT that still needs the second signature. Passing the first signer PSBT to the second GUI wallet yields a complete transaction.

Captures:

- [Matching local wallet signs the imported single-signature PSBT and copies it for further transfer.](media/widgets/signed-psbt-export.png)
- [First cosigner has signed; the PSBT still requires another signer.](media/widgets/multisig-first-signature.png)
- [Second cosigner completes the 2-of-2 transaction; broadcast becomes available.](media/widgets/multisig-second-signature.png)

Targeted checks in [checks.json](logs/checks.json): `sign-watchonly-proposal`, `multisig-partial-signature-present`, `first-multisig-signature`, `second-multisig-signature`.

#### F14.S05 — Collect additional signatures by passing a transaction between signers.

October 10 capture pass: The first cosigner adds exactly one partial signature. First local cosigner signs and exports a PSBT that still needs the second signature. Passing the first signer PSBT to the second GUI wallet yields a complete transaction.

Captures:

- [First cosigner has signed; the PSBT still requires another signer.](media/widgets/multisig-first-signature.png)
- [Second cosigner completes the 2-of-2 transaction; broadcast becomes available.](media/widgets/multisig-second-signature.png)

Targeted checks in [checks.json](logs/checks.json): `multisig-partial-signature-present`, `first-multisig-signature`, `second-multisig-signature`.

#### F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

October 10 capture pass: A wallet with the matching local key signs the watch-only proposal and exports a finalizable PSBT. First local cosigner signs and exports a PSBT that still needs the second signature. Limit: The partially signed 2-of-2 PSBT is transferred through the clipboard. Saving a partially signed PSBT to a file was not checked.

Captures:

- [Matching local wallet signs the imported single-signature PSBT and copies it for further transfer.](media/widgets/signed-psbt-export.png)
- [First cosigner has signed; the PSBT still requires another signer.](media/widgets/multisig-first-signature.png)

Targeted checks in [checks.json](logs/checks.json): `sign-watchonly-proposal`, `first-multisig-signature`.

#### F14.S08 — Inspect transactions and broadcast fully signed transactions without opening a wallet.

October 10 capture pass: GUI broadcasts the fully signed multisig transaction with no loaded wallet.

Captures:

- [A fully signed transaction can be inspected with no wallet open.](media/widgets/wallet-free-psbt-review.png)
- [Successful transaction broadcast from the wallet-free PSBT dialog.](media/widgets/wallet-free-psbt-broadcast.png)

Targeted checks in [checks.json](logs/checks.json): `wallet-free-broadcast`.

### F15 — Use Hardware Wallet / External Signer

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/doc/external-signer.md).

[Original feature record and related upstream tests](../../features/15-use-hardware-wallet-external-signer.md)

#### F15.S02 — Keep spending keys on the signing device.

No new matching capture. No physical signing device was attached; a screenshot of a simulated signer would not prove key custody on a device.

#### F15.S03 — Generate receiving addresses and verify them on the device.

No new matching capture. Receiving-address generation and verification on a physical signing device remain untested.

#### F15.S04 — Authorize outgoing payments using the device.

No new matching capture. No physical device was available to demonstrate payment authorization.

#### F15.S05 — Continue a signing workflow when additional signatures are needed. Signing workflow.

No new matching capture. Local multisig exchange is captured under F14, but it does not prove continuation through an external signing device.

### F16 — Browse and Export Transaction History

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/transactionview.cpp).

[Original feature record and related upstream tests](../../features/16-browse-and-export-transaction-history.md)

#### F16.S09 — Inspect transactions in external block explorers.

October 10 capture pass: Explorer action substitutes the real selected transaction ID and dispatches it to the external handler. Limit: An independent recording handler receives the substituted transaction URL; it does not contact or validate a public block explorer.

Captures:

- [Transaction context menu includes the configured external explorer link. The endpoint is a recording test fixture.](media/widgets/external-explorer-menu.png)
- [The external URL handler receives the selected transaction ID. This recording fixture does not contact a public block explorer.](media/widgets/external-explorer-dispatch.png)

Targeted checks in [checks.json](logs/checks.json): `external-explorer-transaction-link`.

### F20 — Set Up and Synchronize Node

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/intro.cpp).

[Original feature record and related upstream tests](../../features/20-set-up-and-synchronize-node.md)

#### F20.S01 — Choose where node and wallet data are stored.

October 10 capture pass: First-run dialog offers the default or a custom data directory and explains disk space. Limit: The real chooser is shown and cancelled. This pass does not assert persistence of a newly chosen data directory.

Captures:

- [First-run dialog offers the default or a custom data directory and explains disk space.](media/widgets/choose-data-directory.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F20.S04 — Download and validate the blockchain.

October 10 capture pass: The second GUI node downloads and validates the local peer chain to the same best block. Limit: A second node downloads and validates 15,120 blocks from a local regtest peer. The information screenshot was taken after restarting its GUI following a live-capture timeout; this is not mainnet IBD coverage.

Captures:

- [Information from the second node after its recorded download and validation of 15,120 local regtest blocks. GUI was restarted after the live-sync capture timed out.](media/widgets/downloaded-validated-regtest-chain.png)

Targeted checks in [checks.json](logs/checks.json): `local-peer-block-download`.

#### F20.S06 — Operate the node without an open wallet.

October 10 capture pass: After the GUI closes all wallets, node RPC still responds.

Captures:

- [Bitcoin Core remains running with no wallet open.](media/widgets/node-running-without-wallets.png)

Targeted checks in [checks.json](logs/checks.json): `node-without-wallets`.

#### F20.S07 — Use mainnet, testnet, testnet4, signet, or regtest. Network support.

October 10 capture pass: GUI starts on the selected network with peer activity disabled. Limit: All five networks start in isolated offline mode and report the requested chain. Public peer routing and full network synchronization were not exercised.

Captures:

- [Node information identifies main in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-main.png)
- [Node information identifies test in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-test.png)
- [Node information identifies testnet4 in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-testnet4.png)
- [Node information identifies signet in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-signet.png)
- [Node information identifies regtest in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-regtest.png)

Targeted checks in [checks.json](logs/checks.json): `network-main`, `network-test`, `network-testnet4`, `network-signet`, `network-regtest`.

### F21 — Configure Network and Manage Peers

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/rpcconsole.cpp).

[Original feature record and related upstream tests](../../features/21-configure-network-and-manage-peers.md)

#### F21.S09 — Copy banned addresses and network ranges to the clipboard.

October 10 capture pass: Copy IP/Netmask writes the selected banned range to the clipboard.

Captures:

- [Selected banned network range offers Copy IP/Netmask.](media/widgets/banned-range-context-menu.png)
- [Selected banned range after copying its IP/netmask.](media/widgets/banned-range-selected.png)

Targeted checks in [checks.json](logs/checks.json): `copy-banned-range`.

### F22 — Inspect Node and Use RPC Console

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/rpcconsole.cpp).

[Original feature record and related upstream tests](../../features/22-inspect-node-and-use-rpc-console.md)

#### F22.S04 — Inspect logs for troubleshooting.

October 10 capture pass: The GUI passes its regtest debug.log path to the external viewer.

Captures:

- [Bitcoin Core opens the actual debug log in the configured external document viewer.](media/widgets/debug-log-opened.png)

Targeted checks in [checks.json](logs/checks.json): `open-debug-log`.

#### F22.S09 — Use RPC for descriptor import, multisig setup, wallet rescans, and combining PSBTs.

October 10 capture pass: The in-app RPC console documents descriptor import, including rescanning. Visual evidence for RPC access and help; not proof of every advanced operation. Limit: The screenshot shows descriptor-import help in the live RPC console. It does not prove completion of every listed advanced RPC operation.

Captures:

- [The in-app RPC console documents descriptor import, including rescanning. Visual evidence for RPC access and help; not proof of every advanced operation.](media/widgets/console-import-descriptors-help.png)

Visual proof only; no new targeted assertion for this exact criterion.

### F23 — Configure Application Preferences

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/forms/optionsdialog.ui).

[Original feature record and related upstream tests](../../features/23-configure-application-preferences.md)

#### F23.S10 — Manage advanced application configuration.

October 10 capture pass: The GUI opens bitcoin.conf using the configured external application. Limit: The GUI opens its configuration file in an independent read-only test viewer. Editing and applying an advanced setting were not exercised.

Captures:

- [Configuration dialog explains that advanced file settings override GUI preferences.](media/widgets/advanced-configuration-prompt.png)
- [Application configuration is opened through the desktop file association. The test viewer is read-only; editing is not exercised.](media/widgets/advanced-configuration-opened.png)

Targeted checks in [checks.json](logs/checks.json): `open-configuration-file`.

#### F23.S12 — Restore default preferences while retaining a backup of previous settings.

October 10 capture pass: Reset preserves the former preferences in a backup and restores the advanced-control default. Limit: The previous preferences are backed up and the advanced-control default is checked after restart; not every preference is asserted.

Captures:

- [Reset confirmation identifies the settings backup and required shutdown.](media/widgets/reset-preferences-backup.png)
- [After reset and restart, advanced controls return to their default unchecked state.](media/widgets/preferences-restored-defaults.png)

Targeted checks in [checks.json](logs/checks.json): `preferences-reset-backed-up`.

### F25 — Desktop Notifications

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/notificator.cpp).

[Original feature record and related upstream tests](../../features/25-desktop-notifications.md)

#### F25.S03 — Receive informational, warning, and critical messages through desktop notifications.

No new matching capture. The existing notification evidence does not demonstrate all informational, warning and critical desktop categories. This pass did not produce a new capture that establishes that scope.

#### F25.S04 — Receive critical error messages when desktop notifications are unavailable.

October 10 capture pass: Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service. Limit: The critical startup dialog is captured with an unavailable D-Bus address. Other notification-backend failures were not exercised.

Captures:

- [Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service.](media/widgets/unreadable-settings-choices.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F25.S05 — Avoid a flood of notifications while historical wallet activity is being loaded.

No new matching capture. No controlled notification-service comparison during historical wallet loading was recorded. A silent desktop alone would not prove suppression.

### F26 — Manage Application Windows

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).

[Original feature record and related upstream tests](../../features/26-manage-application-windows.md)

#### F26.S01 — Arrange, hide, and restore application windows.

October 10 capture pass: Window arranged before restarting to verify saved placement. Limit: A positioned main window is visible; all hide/restore paths are not demonstrated by this frame.

Captures:

- [Window arranged before restarting to verify saved placement.](media/widgets/window-position-before-restart.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F26.S02 — Remember the main window placement between sessions.

October 10 capture pass: Main window size and position survive a clean restart.

Captures:

- [Window arranged before restarting to verify saved placement.](media/widgets/window-position-before-restart.png)
- [Restored window placement and masked balances after restarting the application.](media/widgets/window-and-privacy-after-restart.png)

Targeted checks in [checks.json](logs/checks.json): `window-placement-restored`.

#### F26.S04 — Use diagnostics alongside wallet activity.

October 10 capture pass: Node diagnostics can remain open alongside the wallet. Independent node and wallet windows are open together.

Captures:

- [Node diagnostics can remain open alongside the wallet.](media/widgets/diagnostics-alongside-wallet.png)
- [Independent node and wallet windows are open together.](media/widgets/diagnostics-and-wallet-windows.png)

Visual proof only; no new targeted assertion for this exact criterion.

### F27 — Start and Exit Application

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoin.cpp).

[Original feature record and related upstream tests](../../features/27-start-and-exit-application.md)

#### F27.S02 — Start with the main window minimized.

October 10 capture pass: The -min startup option starts the main window minimized. Limit: The screenshot deliberately shows the desktop tray while the main window is minimized; the window state is asserted separately.

Captures:

- [Application starts minimized with node RPC running; its native tray menu remains available.](media/widgets/started-minimized.png)

Targeted checks in [checks.json](logs/checks.json): `start-minimized`.

#### F27.S03 — Monitor initialization progress.

October 10 capture pass: The real startup splash reports initialization progress.

Captures:

- [The real startup splash reports initialization progress.](media/widgets/initialization-progress.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F27.S04 — Request an orderly shutdown during startup.

No new matching capture. The startup-cancellation attempt missed the short-lived splash screen. The remaining GUI was closed normally after startup; that is not proof of cancellation during initialization.

#### F27.S05 — Shut down the node cleanly.

October 10 capture pass: All five network GUI sessions exited cleanly through the Exit action.

Captures:

- [The real application shutdown window explains that shutdown is in progress.](media/widgets/shutdown-progress.png)

Targeted checks in [checks.json](logs/checks.json): `network-gui-clean-exits`.

#### F27.S06 — Know when shutdown is still in progress.

October 10 capture pass: The real application shutdown window explains that shutdown is in progress.

Captures:

- [The real application shutdown window explains that shutdown is in progress.](media/widgets/shutdown-progress.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F27.S07 — Recover unreadable settings or stop startup without changing them.

October 10 capture pass: Aborting startup leaves the invalid settings file byte-for-byte unchanged. Limit: Abort is exercised and preserves the invalid settings file byte-for-byte. Reset is visible, but recovery through that button was not exercised.

Captures:

- [Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service.](media/widgets/unreadable-settings-choices.png)
- [Expanded diagnostic details identify the settings parsing error.](media/widgets/unreadable-settings-details.png)

Targeted checks in [checks.json](logs/checks.json): `abort-preserves-settings`.

#### F27.S08 — Coordinate application shutdown with Windows session shutdown.

No new matching capture. This pass ran on Linux X11. Windows session-shutdown coordination requires a dedicated Windows run.

### F28 — Navigate the Application

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp#L253).

[Original feature record and related upstream tests](../../features/28-navigate-the-application.md)

#### F28.S05 — Use keyboard shortcuts for navigation and common actions.

October 10 capture pass: Alt+1 returns to the overview. Limit: Alt+1 navigation is checked; the complete shortcut set was not tested.

Captures:

- [Overview reached through the application keyboard shortcut.](media/widgets/keyboard-navigation-overview.png)

Targeted checks in [checks.json](logs/checks.json): `keyboard-overview`.

### F29 — View Application Status

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).

[Original feature record and related upstream tests](../../features/29-view-application-status.md)

#### F29.S06 — Understand available actions through contextual guidance.

October 10 capture pass: Hover guidance explains how subtracting fees changes the recipient amount.

Captures:

- [Hover guidance explains how subtracting fees changes the recipient amount.](media/widgets/send-contextual-guidance.png)

Visual proof only; no new targeted assertion for this exact criterion.

### F30 — Show Progress, Errors, and Confirmations

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp#L1286).

[Original feature record and related upstream tests](../../features/30-show-progress-errors-and-confirmations.md)

#### F30.S01 — Understand operation results, warnings, and errors.

October 10 capture pass: Different repeated passphrases produce a visible validation error. Limit: Passphrase mismatch and unreadable-settings errors are captured; this is not exhaustive coverage of every operation result.

Captures:

- [Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service.](media/widgets/unreadable-settings-choices.png)
- [The application rejects mismatching repeated passphrases.](media/widgets/passphrase-mismatch-error.png)

Targeted checks in [checks.json](logs/checks.json): `passphrase-mismatch`.

#### F30.S03 — Inspect additional diagnostic information when available.

October 10 capture pass: Expanded diagnostic details identify the settings parsing error.

Captures:

- [Expanded diagnostic details identify the settings parsing error.](media/widgets/unreadable-settings-details.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F30.S04 — Receive a prompt when an operation requires attention.

October 10 capture pass: Closing the selected wallet requires confirmation. Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service. A destination outside this wallet triggers an explicit warning before using it for change.

Captures:

- [Closing the selected wallet requires confirmation.](media/widgets/close-wallet-confirmation.png)
- [Unreadable settings trigger a critical dialog with Reset and Abort in a session without a notification service.](media/widgets/unreadable-settings-choices.png)
- [A destination outside this wallet triggers an explicit warning before using it for change.](media/widgets/unknown-change-confirmation.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F30.S05 — Track long-running operations.

October 10 capture pass: Actual wallet rescan progress over a 15,000-block regtest history.

Captures:

- [Actual wallet rescan progress over a 15,000-block regtest history.](media/widgets/rescan-progress.png)

Visual proof only; no new targeted assertion for this exact criterion.

#### F30.S07 — Monitor background synchronization while retaining access to the application.

October 10 capture pass: Synchronization overlay explains that wallet information can be out of date. Synthetic regtest at genesis; not a mainnet IBD run. Wallet remains accessible while the status bar reports incomplete synchronization. Limit: The overlay can be hidden while incomplete-sync status remains visible on isolated regtest.

Captures:

- [Synchronization overlay explains that wallet information can be out of date. Synthetic regtest at genesis; not a mainnet IBD run.](media/widgets/sync-overlay-wallet-outdated.png)
- [Wallet remains accessible while the status bar reports incomplete synchronization.](media/widgets/sync-background-wallet-access.png)

Visual proof only; no new targeted assertion for this exact criterion.

### F31 — Desktop Integration and Application Help

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).

[Original feature record and related upstream tests](../../features/31-desktop-integration-and-application-help.md)

#### F31.S01 — Open Bitcoin payment requests from other applications or by drag and drop.

October 10 capture pass: A second process passes its payment URI to the already-running GUI. Limit: Process-to-process URI handoff is checked. Desktop URL registration and URI drag and drop were not exercised.

Captures:

- [Payment URI launched from another process populates the running wallet send form. Linux process handoff; OS association and URI dragging are not covered.](media/widgets/external-payment-uri-received.png)

Targeted checks in [checks.json](logs/checks.json): `running-uri-handoff`.

#### F31.S02 — Distinguish application instances using different Bitcoin networks.

October 10 capture pass: GUI starts on the selected network with peer activity disabled. Limit: Distinct network names are captured in each instance; simultaneous multi-network desktop appearance was not tested.

Captures:

- [Node information identifies main in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-main.png)
- [Node information identifies test in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-test.png)
- [Node information identifies testnet4 in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-testnet4.png)
- [Node information identifies signet in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-signet.png)
- [Node information identifies regtest in an isolated offline startup. No public-chain download is claimed.](media/widgets/network-regtest.png)

Targeted checks in [checks.json](logs/checks.json): `network-main`, `network-test`, `network-testnet4`, `network-signet`, `network-regtest`.

#### F31.S03 — Adapt application visuals to the desktop appearance.

No new matching capture. One Linux appearance was used. No controlled desktop-theme change was captured.

#### F31.S04 — Prevent macOS background throttling from slowing initial synchronization and reindexing.

No new matching capture. This pass ran on Linux. macOS background-throttling behavior requires macOS runtime measurement.

#### F31.S05 — Use external block explorers to inspect transactions.

October 10 capture pass: Explorer action substitutes the real selected transaction ID and dispatches it to the external handler. Limit: The recording handler proves URL dispatch and transaction-ID substitution, not availability of a public block explorer.

Captures:

- [Transaction context menu includes the configured external explorer link. The endpoint is a recording test fixture.](media/widgets/external-explorer-menu.png)
- [The external URL handler receives the selected transaction ID. This recording fixture does not contact a public block explorer.](media/widgets/external-explorer-dispatch.png)

Targeted checks in [checks.json](logs/checks.json): `external-explorer-transaction-link`.

### F32 — Mask Wallet Values / Privacy Mode

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/overviewpage.cpp).

[Original feature record and related upstream tests](../../features/32-mask-wallet-values-privacy-mode.md)

#### F32.S03 — Apply the privacy preference across loaded wallets.

October 10 capture pass: The mask preference remains enabled after switching wallets.

Captures:

- [Values remain masked after switching to another loaded wallet.](media/widgets/privacy-watchonly-wallet.png)

Targeted checks in [checks.json](logs/checks.json): `privacy-across-wallets`.

#### F32.S04 — Remember the privacy preference between sessions.

October 10 capture pass: After restart the saved privacy preference still masks balances.

Captures:

- [Restored window placement and masked balances after restarting the application.](media/widgets/window-and-privacy-after-restart.png)

Targeted checks in [checks.json](logs/checks.json): `privacy-restored`.

### F34 — Monitor and Cancel Wallet Rescans

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/walletview.cpp).

[Original feature record and related upstream tests](../../features/34-monitor-and-cancel-wallet-rescans.md)

#### F34.S01 — Rediscover wallet activity from blockchain history.

October 10 capture pass: Rescan completes through the current chain tip. Limit: A real rescan completes through the current chain tip. The check does not compare every rediscovered transaction with an independent history oracle.

Captures:

- [Actual wallet rescan progress over a 15,000-block regtest history.](media/widgets/rescan-progress.png)

Targeted checks in [checks.json](logs/checks.json): `wallet-rescan-completed`.

#### F34.S02 — Monitor rescan progress.

October 10 capture pass: Rescan completes through the current chain tip. Limit: A real progress dialog is captured at 1% and completion is asserted separately; intermediate percentages were not exhaustively checked.

Captures:

- [Actual wallet rescan progress over a 15,000-block regtest history.](media/widgets/rescan-progress.png)

Targeted checks in [checks.json](logs/checks.json): `wallet-rescan-completed`.

#### F34.S03 — Request cancellation of an ongoing wallet rescan.

October 10 capture pass: GUI cancellation causes the in-progress rescan to return an abort result.

Captures:

- [The ongoing wallet rescan offers cancellation.](media/widgets/rescan-cancel-available.png)

Targeted checks in [checks.json](logs/checks.json): `wallet-rescan-cancelled`.
