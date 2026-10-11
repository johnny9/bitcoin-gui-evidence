# Hardware and platform acceptance review

Assessed 2026-10-11 against GUI-QML `a91f4b4774f25de061fe1a7c132a91ddde117fca`.

For hardware and platform integrations, connected QML user functionality plus existing tests and integration hooks is sufficient for acceptance. Physical-device runs, every operating system, external-service runs and matching captures are not prerequisites. Missing user workflows and recorded failures remain gaps.

These are acceptance assessments using existing source and recorded test results. No new application test, physical-device run or operating-system run is claimed. Original runtime records and captures are unchanged. Saved reviewer decisions still take precedence.

The 11 reviewed criteria below now have sufficient proof for this review. Device address verification, desktop notification delivery, login startup, Windows session shutdown and macOS background-throttling protection still lack the required connected user functionality.

## F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

[Open criterion](#feature/F14?item=F14.S06)

The review page lets the user save a transaction for further signing. Model tests preserve an incomplete external-signer result and imported PSBT metadata; component tests expose the more-signatures-required state. These satisfy the signing-handoff outcome.

QML: [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml), [qml/components/ExternalSignerReviewActions.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/ExternalSignerReviewActions.qml).

Hooks: [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

Existing tests:

- [Incomplete signer result is saved](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_walletqmlmodel.cpp): [PASS   : WalletQmlModelTests::externalSignerApprovalKeepsIncompleteSignedPsbt()](gui-feature-evidence/logs/qml-unit-tests.log).
- [Imported PSBT metadata is preserved](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_walletqmlmodel.cpp): [PASS   : WalletQmlModelTests::saveCurrentTransactionAsPsbt_preservesImportedMetadata()](gui-feature-evidence/logs/qml-unit-tests.log).
- [Additional-signature state is presented](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_externalsignerreviewactions.qml): [PASS   : bitcoinqml_qmltests::ExternalSignerReviewActions::test_partial_success_shows_more_signatures_message()](gui-feature-evidence/logs/qml-quick-tests.log).

Scope: Assessment trusts the existing signer/model tests and QML save flow. No new multisigner-device exchange or matching partial-signature capture was collected; file export provides the handoff.

## F15.S01 — Connect a wallet to a compatible external signer.

[Open criterion](#feature/F15?item=F15.S01)

The user can configure compatible signer software, check for a device, and create a signer-backed wallet. The recorded functional test drives those QML controls and discovers the mock signer.

QML: [qml/pages/settings/ExternalSignerSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ExternalSignerSettingsPage.qml), [qml/pages/wallet/WalletCreationTypePage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/WalletCreationTypePage.qml).

Hooks: [qml/walletqmlcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/walletqmlcontroller.cpp).

Existing tests:

- [External signer functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py): [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).

Scope: The executable mock stands in for the compatible physical signer. Device-lab repetition is not required by this review standard.

## F15.S02 — Keep spending keys on the signing device.

[Open criterion](#feature/F15?item=F15.S02)

Signer-backed wallet creation disables local private keys, and the QML wallet settings omit local-key password controls. The recorded functional test checks private_keys_enabled is false; signing remains delegated to the external signer.

QML: [qml/pages/settings/WalletSectionPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/WalletSectionPage.qml), [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml).

Hooks: [qml/walletqmlcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/walletqmlcontroller.cpp), [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

Existing tests:

- [External signer functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py): [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).

Scope: This accepts the application key-separation workflow. It does not claim that a physical device or its firmware was examined.

## F15.S04 — Authorize outgoing payments using the device.

[Open criterion](#feature/F15?item=F15.S04)

The payment review offers device approval, a waiting state, errors/retry, and sending after approval. The mock-signer functional test exercises failure recovery, approval and broadcast through that QML flow.

QML: [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml), [qml/components/ExternalSignerReviewActions.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/ExternalSignerReviewActions.qml).

Hooks: [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

Existing tests:

- [External signer functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py): [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).
- [Approval waiting and completion](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_externalsignerreviewactions.qml): [PASS   : bitcoinqml_qmltests::ExternalSignerReviewActions::test_waiting_state_persists_until_mock_completes()](gui-feature-evidence/logs/qml-quick-tests.log).

Scope: Physical button presses are represented by the signer hook and tests, not a new hardware run.

## F16.S09 — Inspect transactions in external block explorers.

[Open criterion](#feature/F16?item=F16.S09)

Transaction details provide an explorer action whose URL is built by the tested options model and passed to Qt.openUrlExternally. The connected user action and browser handoff meet the outcome.

QML: [qml/pages/wallet/TransactionDetail.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/TransactionDetail.qml).

Hooks: [qml/models/options_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/options_model.cpp).

Existing tests:

- [Explorer URL construction](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp): [PASS   : OptionsModelTests::thirdPartyTransactionLinksParseValidUrls()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: The operating-system browser launcher and remote explorer are trusted integration boundaries; no external service or browser capture is required.

## F20.S07 — Use mainnet, testnet, testnet4, signet, or regtest. Network support.

[Open criterion](#feature/F20?item=F20.S07)

Startup selects the configured Core chain, supplies its chain model to QML, and exposes a network-aware wallet/node shell. Network-style tests cover mainnet, testnet, testnet4, signet and regtest; the existing application scenarios exercise regtest.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml), [qml/components/NetworkIndicator.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/NetworkIndicator.qml).

Hooks: [qml/bitcoin.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp), [qml/models/chainmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/chainmodel.cpp), [qml/networkstyle.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/networkstyle.cpp).

Existing tests:

- [Known network identities](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networkstyle.cpp): [PASS   : NetworkStyleTests::getTitleAddText_perNetwork()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: Core chain selection and the common QML integration are trusted. Downloading each public chain is not an acceptance requirement here.

## F21.S03 — Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support.

[Open criterion](#feature/F21?item=F21.S03)

The user can configure and validate a default SOCKS5 proxy and a separate Tor proxy. The QML settings page commits them to Core, and the functional test checks toggles, validation, cancellation and persisted proxy/onion settings.

QML: [qml/pages/settings/ConnectionSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ConnectionSettingsPage.qml), [qml/pages/settings/ProxySettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ProxySettingsPage.qml).

Hooks: [qml/models/core_settings_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/core_settings_model.cpp), [qml/core_settings.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/core_settings.cpp).

Existing tests:

- [Proxy settings functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_proxy.py): [All tests PASSED](gui-feature-evidence/logs/qml_test_proxy.log).

Scope: Core routing is trusted once the settings are connected. Live Tor/SOCKS service testing is not required for this QML acceptance assessment.

## F21.S04 — Automatically configure router access for incoming connections where supported.

[Open criterion](#feature/F21?item=F21.S04)

Connection settings expose automatic NAT-PMP port mapping. The setting reaches the node mapPort hook; the recorded model test verifies live enable/disable calls and persisted settings. This gives users the required router-mapping control.

QML: [qml/pages/settings/ConnectionSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ConnectionSettingsPage.qml).

Hooks: [qml/models/options_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/options_model.cpp), [qml/models/core_settings_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/core_settings_model.cpp).

Existing tests:

- [Live router-mapping setting](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp): [PASS   : OptionsModelTests::natpmpAppliesLiveWithoutRestartDirty()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: A physical router and a matching screenshot are not required. Actual mapping still depends on a compatible router and build.

## F24.S01 — Keep the application accessible while its main window is hidden.

[Open criterion](#feature/F24?item=F24.S01)

The QML window responds to tray Show/Hide and the macOS Dock reopen hook. The controller uses Qt system-tray integration on supported desktops. Existing functional/model tests and native Linux captures demonstrate hide/restore behavior.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml).

Hooks: [qml/models/desktoptrayiconcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktoptrayiconcontroller.cpp), [qml/models/macdockiconhandler.mm](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/macdockiconhandler.mm).

Existing tests:

- [Tray functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_tray.py): [All tests PASSED](gui-feature-evidence/logs/qml_test_tray.log).
- [Restore hidden-window geometry](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_desktoptrayiconcontroller.cpp): [PASS   : DesktopTrayIconControllerTests::showRestoresGeometryCapturedAtHide()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: Windows and macOS execution is not newly certified; their connected Qt/Dock hooks are sufficient for this review.

## F26.S03 — Keep the node running while the main window is hidden, minimized, or closed, where supported.

[Open criterion](#feature/F26?item=F26.S03)

Window settings let the user choose minimize-to-tray and minimize-on-close. MainWindow routes those actions to window visibility instead of shutdown, while tray/Dock hooks restore it. Functional/model tests and native Linux RPC checks support continued node operation.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml), [qml/pages/settings/WindowBehaviorSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/WindowBehaviorSettingsPage.qml).

Hooks: [qml/models/desktopwindowbehaviormodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktopwindowbehaviormodel.cpp), [qml/models/desktoptrayiconcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktoptrayiconcontroller.cpp), [qml/models/macdockiconhandler.mm](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/macdockiconhandler.mm).

Existing tests:

- [Tray functional flow](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_tray.py): [All tests PASSED](gui-feature-evidence/logs/qml_test_tray.log).
- [Close behavior follows user settings](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_desktopwindowbehaviormodel.cpp): [PASS   : DesktopWindowBehaviorModelTests::shouldMinimizeWindowOnClose_requiresDesktopAndMinimizeOnClose()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: The existing platform hooks are trusted. Additional operating-system screenshots are not acceptance prerequisites.

## F31.S02 — Identify the active Bitcoin network and distinguish instances using different networks.

[Open criterion](#feature/F31?item=F31.S02)

QML labels non-mainnet networks, and the shell uses network-specific application names, settings and tray/window identities. Network-style tests check the known chains and their title suffixes; the regtest identity is already captured.

QML: [qml/components/NetworkIndicator.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/NetworkIndicator.qml), [qml/pages/wallet/DesktopWallets.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/DesktopWallets.qml).

Hooks: [qml/bitcoin.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp), [qml/networkstyle.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/networkstyle.cpp), [qml/models/chainmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/chainmodel.cpp).

Existing tests:

- [Known network identities](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networkstyle.cpp): [PASS   : NetworkStyleTests::getTitleAddText_perNetwork()](gui-feature-evidence/logs/qml-unit-tests.log).

Scope: Simultaneous public-network instances are not newly run. The tested identities and connected QML display are sufficient for review.

[Review data and source hashes](hardware-platform-review.json)
