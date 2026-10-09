# GUI feature acceptance evidence

Evidence collected **October 8, 2026** for the [supported-feature comparison](../bitcoin-core-gui-supported-features.md). This pack contains **34 feature-group pages**, **203 criterion sections**, and **116 selected, original application screenshots**. Each criterion links visible evidence, implementation modules, relevant automated tests, and remaining limits.

**This is an evidence pack for review, not a declaration that every feature is complete.** All acceptance checkboxes remain unset. Some criteria have only source or related-test evidence; missing GUI workflows and untested variants are called out individually.

**Runtime finding:** 33 of 34 existing QML functional scripts passed. `qml_test_send_create` fails when returning to the first recipient and expecting its private note to remain intact. See [test results and reproduction](TEST-RESULTS.md). Independent multiple-recipient, fee and coin-control scenarios pass, so their evidence is retained separately.

[Builds, capture method and limitations](PROVENANCE.md) · [Full test results](TEST-RESULTS.md) · [Machine-readable coverage](coverage.json) · [Capture hashes](selected-captures.json) · [Evidence integrity checks](logs/evidence-validation.json)

## How to review

1. Open a feature group and compare the two applications’ captures. Open an image to inspect it at full size.
2. Read each subfeature’s stated assertion scope. A screenshot of a control does not prove clipboard contents, persistence, signing, or a successful operation.
3. Follow the modules and test logs when deciding acceptance. Record acceptance only for the behavior and variants the evidence supports.

## Feature groups

| Group | Criteria | Widgets captures | QML captures | Evidence page |
| --- | ---: | ---: | ---: | --- |
| F01 · Create Wallet | 6 | 4 | 3 | [Review](features/01-create-wallet.md) |
| F02 · Open, Switch, and Close Wallets | 4 | 1 | 2 | [Review](features/02-open-switch-and-close-wallets.md) |
| F03 · Back Up and Restore Wallet | 4 | 5 | 3 | [Review](features/03-back-up-and-restore-wallet.md) |
| F04 · Migrate Legacy Wallet | 4 | 0 | 2 | [Review](features/04-migrate-legacy-wallet.md) |
| F05 · Export Watch-Only Wallet | 4 | 2 | 0 | [Review](features/05-export-watch-only-wallet.md) |
| F06 · Encrypt Wallet and Manage Passphrase | 7 | 7 | 3 | [Review](features/06-encrypt-wallet-and-manage-passphrase.md) |
| F07 · View Wallet Overview | 5 | 3 | 1 | [Review](features/07-view-wallet-overview.md) |
| F08 · Receive Bitcoin / Request Payment | 9 | 3 | 3 | [Review](features/08-receive-bitcoin-request-payment.md) |
| F09 · Send Bitcoin | 9 | 3 | 6 | [Review](features/09-send-bitcoin.md) |
| F10 · Open Payment URI | 3 | 1 | 1 | [Review](features/10-open-payment-uri.md) |
| F11 · Choose Transaction Fee | 4 | 1 | 2 | [Review](features/11-choose-transaction-fee.md) |
| F12 · Select Coins / Coin Control | 9 | 2 | 3 | [Review](features/12-select-coins-coin-control.md) |
| F13 · Create and Export PSBT | 5 | 1 | 2 | [Review](features/13-create-and-export-psbt.md) |
| F14 · Import, Sign, and Broadcast PSBT | 8 | 3 | 4 | [Review](features/14-import-sign-and-broadcast-psbt.md) |
| F15 · Use Hardware Wallet / External Signer | 5 | 1 | 3 | [Review](features/15-use-hardware-wallet-external-signer.md) |
| F16 · Browse and Export Transaction History | 9 | 3 | 4 | [Review](features/16-browse-and-export-transaction-history.md) |
| F17 · Manage Unconfirmed Transactions | 5 | 3 | 1 | [Review](features/17-manage-unconfirmed-transactions.md) |
| F18 · Manage Address Book | 6 | 3 | 1 | [Review](features/18-manage-address-book.md) |
| F19 · Sign and Verify Messages | 3 | 3 | 2 | [Review](features/19-sign-and-verify-messages.md) |
| F20 · Set Up and Synchronize Node | 7 | 2 | 4 | [Review](features/20-set-up-and-synchronize-node.md) |
| F21 · Configure Network and Manage Peers | 9 | 3 | 4 | [Review](features/21-configure-network-and-manage-peers.md) |
| F22 · Inspect Node and Use RPC Console | 9 | 4 | 4 | [Review](features/22-inspect-node-and-use-rpc-console.md) |
| F23 · Configure Application Preferences | 12 | 4 | 2 | [Review](features/23-configure-application-preferences.md) |
| F24 · System Tray / macOS Dock | 5 | 3 | 3 | [Review](features/24-system-tray-macos-dock.md) |
| F25 · Desktop Notifications | 5 | 1 | 0 | [Review](features/25-desktop-notifications.md) |
| F26 · Manage Application Windows | 5 | 3 | 3 | [Review](features/26-manage-application-windows.md) |
| F27 · Start and Exit Application | 8 | 1 | 1 | [Review](features/27-start-and-exit-application.md) |
| F28 · Navigate the Application | 5 | 4 | 2 | [Review](features/28-navigate-the-application.md) |
| F29 · View Application Status | 6 | 6 | 3 | [Review](features/29-view-application-status.md) |
| F30 · Show Progress, Errors, and Confirmations | 7 | 2 | 2 | [Review](features/30-show-progress-errors-and-confirmations.md) |
| F31 · Desktop Integration and Application Help | 6 | 2 | 2 | [Review](features/31-desktop-integration-and-application-help.md) |
| F32 · Mask Wallet Values / Privacy Mode | 4 | 1 | 0 | [Review](features/32-mask-wallet-values-privacy-mode.md) |
| F33 · Run with Wallet Functionality Disabled | 3 | 3 | 3 | [Review](features/33-run-with-wallet-functionality-disabled.md) |
| F34 · Monitor and Cancel Wallet Rescans | 3 | 0 | 0 | [Review](features/34-monitor-and-cancel-wallet-rescans.md) |

Counts are capture references, not counts of accepted criteria. A capture may support more than one criterion or group. A zero means no suitable capture was collected; consult that page for the implementation gap or remaining test.

## Evidence boundaries

- Linux X11 virtual desktops and synthetic regtest wallets only. No mainnet funds or personal wallet data.
- Physical hardware-wallet approval, macOS Dock/App Nap, Windows session shutdown, router mapping, live Tor routing, and full mainnet synchronization remain outside this run.
- Several broad criteria contain multiple variants. The pages explicitly preserve gaps such as untested Widgets multisig exchange, legacy migration captures, and rescan progress/cancellation.
- QML watch-only export, desktop notifications and privacy mode remain implementation gaps.
- The binaries use different pinned Core revisions and Qt builds. This evidence compares user capabilities; it is not a claim of identical backend or rendering behavior.

## Collected material

- `features/`: acceptance pages, grouped at the same level as the original inventory.
- `media/`: original application-window and desktop screenshots, including raw checkpoints beyond the selected review set.
- `logs/`: test output, assertions, bridge traces, build logs and desktop notification delivery.
- `scripts/`: capture wrappers, independent scenarios, catalogue mappings and validators.
- `inventory.json`, `coverage.json`, `summary.json`, `selected-captures.json`, `test-results.json`: traceable records for later updates.
