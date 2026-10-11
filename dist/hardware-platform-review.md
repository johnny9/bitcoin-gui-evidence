# Acceptance review using existing tests

Assessed 2026-10-11 against GUI-QML `a91f4b4774f25de061fe1a7c132a91ddde117fca`.

Connected QML user functionality plus relevant existing unit, component or functional tests is sufficient for acceptance when their combined coverage demonstrates the main user outcome. Confirm the connection between the tested code and the visible workflow. Repeating every backend command, environment or variant through a new GUI run, and collecting a matching screenshot for transient states, are not prerequisites. Missing user functionality and recorded failures remain gaps.

These are acceptance assessments using existing source and recorded test results. No new application test, physical-device run or operating-system run is claimed. Original runtime records and captures are unchanged. Saved reviewer decisions still take precedence.

The 17 reviewed criteria below have sufficient proof for this review. Device address verification, desktop notification delivery, login startup, Windows session shutdown and macOS background-throttling protection still lack the required connected user functionality. F27.S03 also remains partial: the startup busy indicator does not expose Core initialization progress. The six additional assessments cover storage planning, synchronization estimates, traffic periods, advanced console commands, settings reset and cancellation during startup.

## F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

[Open criterion](#feature/F14?item=F14.S06)

The review page lets the user save a transaction for further signing. Model tests preserve an incomplete external-signer result and imported PSBT metadata; component tests expose the more-signatures-required state. These satisfy the signing-handoff outcome.

QML: [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml), [qml/components/ExternalSignerReviewActions.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/ExternalSignerReviewActions.qml).

Hooks: [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

What the tests prove:

- **Incomplete signer result is saved** — A simulated signer returns an incomplete PSBT. The model reports that more signatures are needed, prevents broadcast, and preserves the signer data when the PSBT is saved and reopened.
  [Assertions in test/test_walletqmlmodel.cpp:3070](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_walletqmlmodel.cpp#L3070) · [PASS   : WalletQmlModelTests::externalSignerApprovalKeepsIncompleteSignedPsbt()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Imported PSBT metadata is preserved** — Imports and exports a PSBT, compares the saved bytes with the original, and checks that transaction, input and output metadata survive without another signing attempt.
  [Assertions in test/test_walletqmlmodel.cpp:2929](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_walletqmlmodel.cpp#L2929) · [PASS   : WalletQmlModelTests::saveCurrentTransactionAsPsbt_preservesImportedMetadata()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Additional-signature state is presented** — With a simulated partial-signing result, the QML component displays the more-signatures-required message and disables sending.
  [Assertions in test/qml/tst_externalsignerreviewactions.qml:105](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_externalsignerreviewactions.qml#L105) · [PASS   : bitcoinqml_qmltests::ExternalSignerReviewActions::test_partial_success_shows_more_signatures_message()](gui-feature-evidence/logs/qml-quick-tests.log).

Coverage limits: Assessment trusts the existing signer/model tests and QML save flow. No new multisigner-device exchange or matching partial-signature capture was collected; file export provides the handoff.

## F15.S01 — Connect a wallet to a compatible external signer.

[Open criterion](#feature/F15?item=F15.S01)

The user can configure compatible signer software, check for a device, and create a signer-backed wallet. The recorded functional test drives those QML controls and discovers the mock signer.

QML: [qml/pages/settings/ExternalSignerSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ExternalSignerSettingsPage.qml), [qml/pages/wallet/WalletCreationTypePage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/WalletCreationTypePage.qml).

Hooks: [qml/walletqmlcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/walletqmlcontroller.cpp).

What the tests prove:

- **External signer functional flow** — Configures the mock signer through QML, checks device discovery and the saved signer path, then creates a wallet with the external-signer flag and expected receiving address.
  [Assertions in test/functional/qml_test_external_signer.py:268](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py#L268) · [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).

Coverage limits: The executable mock stands in for the compatible physical signer. Device-lab repetition is not required by this review standard.

## F15.S02 — Keep spending keys on the signing device.

[Open criterion](#feature/F15?item=F15.S02)

Signer-backed wallet creation disables local private keys, and the QML wallet settings omit local-key password controls. The recorded functional test checks private_keys_enabled is false; signing remains delegated to the external signer.

QML: [qml/pages/settings/WalletSectionPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/WalletSectionPage.qml), [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml).

Hooks: [qml/walletqmlcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/walletqmlcontroller.cpp), [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

What the tests prove:

- **External signer functional flow** — Checks through RPC that the wallet created by the GUI has external_signer enabled and private_keys_enabled disabled. This proves the application stores no local spending keys for that wallet; it does not inspect device firmware.
  [Assertions in test/functional/qml_test_external_signer.py:325](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py#L325) · [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).

Coverage limits: This accepts the application key-separation workflow. It does not claim that a physical device or its firmware was examined.

## F15.S04 — Authorize outgoing payments using the device.

[Open criterion](#feature/F15?item=F15.S04)

The payment review offers device approval, a waiting state, errors/retry, and sending after approval. The mock-signer functional test exercises failure recovery, approval and broadcast through that QML flow.

QML: [qml/pages/wallet/SendTransactionReview.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendTransactionReview.qml), [qml/components/ExternalSignerReviewActions.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/ExternalSignerReviewActions.qml).

Hooks: [qml/models/walletqmlmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/walletqmlmodel.cpp).

What the tests prove:

- **External signer functional flow** — Exercises the missing-signer error, restores the mock signer, approves the payment through QML, and checks that the expected transaction reaches the mempool after Send.
  [Assertions in test/functional/qml_test_external_signer.py:537](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_external_signer.py#L537) · [External signer GUI flow passed.](gui-feature-evidence/logs/qml_test_external_signer.log).
- **Approval waiting and completion** — Checks that the approval button stays disabled in the waiting state until the simulated signer completes, then presents an enabled Send action.
  [Assertions in test/qml/tst_externalsignerreviewactions.qml:72](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_externalsignerreviewactions.qml#L72) · [PASS   : bitcoinqml_qmltests::ExternalSignerReviewActions::test_waiting_state_persists_until_mock_completes()](gui-feature-evidence/logs/qml-quick-tests.log).

Coverage limits: Physical button presses are represented by the signer hook and tests, not a new hardware run.

## F16.S09 — Inspect transactions in external block explorers.

[Open criterion](#feature/F16?item=F16.S09)

Transaction details provide an explorer action whose URL is built by the tested options model and passed to Qt.openUrlExternally. The connected user action and browser handoff meet the outcome.

QML: [qml/pages/wallet/TransactionDetail.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/TransactionDetail.qml).

Hooks: [qml/models/options_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/options_model.cpp).

What the tests prove:

- **Explorer URL construction** — Checks transaction-ID substitution in HTTP and HTTPS explorer URLs and rejects unsupported schemes, malformed URLs and templates without the transaction placeholder. Browser launch is established by the connected QML source, not this test.
  [Assertions in test/test_options_model.cpp:2067](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp#L2067) · [PASS   : OptionsModelTests::thirdPartyTransactionLinksParseValidUrls()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: The operating-system browser launcher and remote explorer are trusted integration boundaries; no external service or browser capture is required.

## F20.S07 — Use mainnet, testnet, testnet4, signet, or regtest. Network support.

[Open criterion](#feature/F20?item=F20.S07)

Startup selects the configured Core chain, supplies its chain model to QML, and exposes a network-aware wallet/node shell. Network-style tests cover mainnet, testnet, testnet4, signet and regtest; the existing application scenarios exercise regtest.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml), [qml/components/NetworkIndicator.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/NetworkIndicator.qml).

Hooks: [qml/bitcoin.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp), [qml/models/chainmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/chainmodel.cpp), [qml/networkstyle.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/networkstyle.cpp).

What the tests prove:

- **Known network identities** — Instantiates mainnet, testnet, testnet4, signet and regtest styles and checks their window-title and tray suffixes. This test checks network identity, not startup or synchronization on each public chain.
  [Assertions in test/test_networkstyle.cpp:37](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networkstyle.cpp#L37) · [PASS   : NetworkStyleTests::getTitleAddText_perNetwork()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: Core chain selection and the common QML integration are trusted. Downloading each public chain is not an acceptance requirement here.

## F21.S03 — Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support.

[Open criterion](#feature/F21?item=F21.S03)

The user can configure and validate a default SOCKS5 proxy and a separate Tor proxy. The QML settings page commits them to Core, and the functional test checks toggles, validation, cancellation and persisted proxy/onion settings.

QML: [qml/pages/settings/ConnectionSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ConnectionSettingsPage.qml), [qml/pages/settings/ProxySettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ProxySettingsPage.qml).

Hooks: [qml/models/core_settings_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/core_settings_model.cpp), [qml/core_settings.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/core_settings.cpp).

What the tests prove:

- **Proxy settings functional flow** — Exercises proxy and Tor controls, validates addresses, checks that Back discards an unsaved draft, and verifies that saved proxy/onion addresses reach settings.json. It does not send traffic through a real proxy.
  [Assertions in test/functional/qml_test_proxy.py:237](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_proxy.py#L237) · [All tests PASSED](gui-feature-evidence/logs/qml_test_proxy.log).

Coverage limits: Core routing is trusted once the settings are connected. Live Tor/SOCKS service testing is not required for this QML acceptance assessment.

## F21.S04 — Automatically configure router access for incoming connections where supported.

[Open criterion](#feature/F21?item=F21.S04)

Connection settings expose automatic NAT-PMP port mapping. The setting reaches the node mapPort hook; the recorded model test verifies live enable/disable calls and persisted settings. This gives users the required router-mapping control.

QML: [qml/pages/settings/ConnectionSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/ConnectionSettingsPage.qml).

Hooks: [qml/models/options_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/options_model.cpp), [qml/models/core_settings_model.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/core_settings_model.cpp).

What the tests prove:

- **Live router-mapping setting** — Disables and enables NAT-PMP, checking both the persisted setting and the corresponding mapPort(false/true) calls. Neither change requires a restart. The node interface is mocked; a physical router is not exercised.
  [Assertions in test/test_options_model.cpp:662](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp#L662) · [PASS   : OptionsModelTests::natpmpAppliesLiveWithoutRestartDirty()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: A physical router and a matching screenshot are not required. Actual mapping still depends on a compatible router and build.

## F24.S01 — Keep the application accessible while its main window is hidden.

[Open criterion](#feature/F24?item=F24.S01)

The QML window responds to tray Show/Hide and the macOS Dock reopen hook. The controller uses Qt system-tray integration on supported desktops. Existing functional/model tests and native Linux captures demonstrate hide/restore behavior.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml).

Hooks: [qml/models/desktoptrayiconcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktoptrayiconcontroller.cpp), [qml/models/macdockiconhandler.mm](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/macdockiconhandler.mm).

What the tests prove:

- **Tray functional flow** — Checks that the window-behavior controls are reachable and that the tray-visibility switch updates when toggled off and on. This offscreen run does not click an operating-system tray icon.
  [Assertions in test/functional/qml_test_tray.py:112](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_tray.py#L112) · [All tests PASSED](gui-feature-evidence/logs/qml_test_tray.log).
- **Restore hidden-window geometry** — Hides a window, changes its geometry to simulate a window-manager change, and checks that showing it restores its previous position and size.
  [Assertions in test/test_desktoptrayiconcontroller.cpp:51](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_desktoptrayiconcontroller.cpp#L51) · [PASS   : DesktopTrayIconControllerTests::showRestoresGeometryCapturedAtHide()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: Windows and macOS execution is not newly certified; their connected Qt/Dock hooks are sufficient for this review.

## F26.S03 — Keep the node running while the main window is hidden, minimized, or closed, where supported.

[Open criterion](#feature/F26?item=F26.S03)

Window settings let the user choose minimize-to-tray and minimize-on-close. MainWindow routes those actions to window visibility instead of shutdown, while tray/Dock hooks restore it. Functional/model tests and native Linux RPC checks support continued node operation.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml), [qml/pages/settings/WindowBehaviorSettingsPage.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/settings/WindowBehaviorSettingsPage.qml).

Hooks: [qml/models/desktopwindowbehaviormodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktopwindowbehaviormodel.cpp), [qml/models/desktoptrayiconcontroller.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/desktoptrayiconcontroller.cpp), [qml/models/macdockiconhandler.mm](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/macdockiconhandler.mm).

What the tests prove:

- **Tray functional flow** — Enables minimize-on-close through QML, closes the window, and checks that the application remains reachable through its automation interface.
  [Assertions in test/functional/qml_test_tray.py:175](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_tray.py#L175) · [All tests PASSED](gui-feature-evidence/logs/qml_test_tray.log).
- **Close behavior follows user settings** — Checks that close-to-minimize is enabled only for a desktop build with the user setting enabled; it is disabled otherwise.
  [Assertions in test/test_desktopwindowbehaviormodel.cpp:170](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_desktopwindowbehaviormodel.cpp#L170) · [PASS   : DesktopWindowBehaviorModelTests::shouldMinimizeWindowOnClose_requiresDesktopAndMinimizeOnClose()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: The existing platform hooks are trusted. Additional operating-system screenshots are not acceptance prerequisites.

## F31.S02 — Identify the active Bitcoin network and distinguish instances using different networks.

[Open criterion](#feature/F31?item=F31.S02)

QML labels non-mainnet networks, and the shell uses network-specific application names, settings and tray/window identities. Network-style tests check the known chains and their title suffixes; the regtest identity is already captured.

QML: [qml/components/NetworkIndicator.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/NetworkIndicator.qml), [qml/pages/wallet/DesktopWallets.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/DesktopWallets.qml).

Hooks: [qml/bitcoin.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp), [qml/networkstyle.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/networkstyle.cpp), [qml/models/chainmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/chainmodel.cpp).

What the tests prove:

- **Known network identities** — Checks the window-title and tray suffix for all five supported networks, with no suffix on mainnet. QML and startup source review establish where that identity reaches the application.
  [Assertions in test/test_networkstyle.cpp:37](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networkstyle.cpp#L37) · [PASS   : NetworkStyleTests::getTitleAddText_perNetwork()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: Simultaneous public-network instances are not newly run. The tested identities and connected QML display are sufficient for review.

## F20.S03 — Assess available storage and the requirements for full or pruned storage.

[Open criterion](#feature/F20?item=F20.S03)

The storage-planning outcome is covered by tests for full and pruned disk requirements, insufficient space, and the visible selection controls. QML displays these same model values and prevents unsuitable choices. Additional wallet-recovery guidance is useful documentation, but is not required to plan disk use.

QML: [qml/pages/onboarding/OnboardingStorageAmount.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/onboarding/OnboardingStorageAmount.qml), [qml/pages/onboarding/OnboardingStorageLocation.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/onboarding/OnboardingStorageLocation.qml).

Hooks: [qml/onboarding_storage.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/onboarding_storage.cpp), [qml/models/onboardingoptionsmodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/onboardingoptionsmodel.cpp).

What the tests prove:

- **Pruned storage requirements** — Checks that choosing pruning uses the smaller storage requirement and permits a disk that is sufficient for pruning but too small for the full chain.
  [Assertions in test/test_onboarding_storage.cpp:92](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_onboarding_storage.cpp#L92) · [OnboardingStorageTests::prunedSelectionUsesPrunedRequirement()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Insufficient disk space** — Checks that insufficient space produces a warning containing the selected storage requirement and marks the selection as lacking space.
  [Assertions in test/test_onboarding_storage.cpp:109](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_onboarding_storage.cpp#L109) · [OnboardingStorageTests::insufficientSelectedStorageWarns()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Storage information reaches QML** — Checks that QML displays the detected available disk space rather than a fixed example value.
  [Assertions in test/qml/tst_onboarding_datadir.qml:483](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_onboarding_datadir.qml#L483) · [OnboardingDataDir::test_storage_amount_uses_detected_available_space()](gui-feature-evidence/logs/qml-quick-tests.log).
- **QML rejects insufficient full storage** — Checks that QML disables full-chain storage when space is insufficient while retaining the viable pruned option and showing both storage estimates.
  [Assertions in test/qml/tst_onboarding_datadir.qml:492](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_onboarding_datadir.qml#L492) · [OnboardingDataDir::test_storage_amount_disables_full_storage_when_space_is_insufficient()](gui-feature-evidence/logs/qml-quick-tests.log).

Coverage limits: Accepted for storage planning. Pruning and wallet-recovery consequences are not explained in the UI. The existing capture and recorded model/component tests are reused; no new disk-space scenario was run.

## F20.S05 — Assess synchronization progress, how far the node is behind, and the estimated remaining work.

[Open criterion](#feature/F20?item=F20.S05)

The real-peer capture already demonstrates synchronization. Model tests verify ETA publication, progress dips and clock regression; component tests verify that reported progress reaches the clock display. QML binds the remaining-time display to the tested tracker through NodeModel. Together these cover the progress-and-estimate outcome.

QML: [qml/components/BlockClock.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/BlockClock.qml), [qml/controls/utils.js](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/controls/utils.js).

Hooks: [qml/models/nodemodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/nodemodel.cpp), [qml/models/syncprogresstracker.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/syncprogresstracker.cpp).

What the tests prove:

- **ETA remains valid through progress dips** — Feeds progress samples with repeated small dips into the estimator and checks that remaining-time estimates are still published at the expected intervals and values.
  [Assertions in test/test_syncprogresstracker.cpp:45](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_syncprogresstracker.cpp#L45) · [SyncProgressTrackerTests::publishesDespiteFrequentProgressDips()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Clock regression resets the estimator** — Checks that a backward clock jump resets the estimator sample history. A decrease in the progress estimate alone does not reset it.
  [Assertions in test/test_syncprogresstracker.cpp:79](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_syncprogresstracker.cpp#L79) · [SyncProgressTrackerTests::resetsForClockRegression()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Progress is displayed during catch-up** — Supplies a connected node with 90% verification progress and checks that the block clock shows 90% and sends the same fraction to its dial.
  [Assertions in test/qml/tst_blockclock.qml:298](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_blockclock.qml#L298) · [BlockClock::test_startup_catch_up_uses_reported_progress()](gui-feature-evidence/logs/qml-quick-tests.log).
- **Header progress reaches QML** — Delivers a simulated header-tip notification and checks the model signal, active header-sync/presync state and calculated progress. It does not exercise Core initialization-stage messages.
  [Assertions in test/test_nodemodel.cpp:885](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_nodemodel.cpp#L885) · [NodeModelTests::headerTipNotificationsExposeHeaderSyncProgress()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: A stable live ETA screenshot and a new throttled-transfer run are not prerequisites. Numerical estimate behavior is supported by the existing tracker tests; the visible binding and actual peer-sync capture supply the integration evidence. No new application run is claimed.

## F22.S03 — Focus traffic monitoring on a chosen observation period.

[Open criterion](#feature/F22?item=F22.S03)

The QML period controls call the tested traffic-window method. Its unit test changes short and longer windows, checks the displayed sample history size, and preserves cumulative byte totals. This supports focusing the traffic graph on a chosen observation period.

QML: [qml/pages/node/NetworkTraffic.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/node/NetworkTraffic.qml).

Hooks: [qml/models/networktraffictower.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/networktraffictower.cpp).

What the tests prove:

- **Time-window selection preserves history and totals** — Switches between shorter and longer observation periods and checks the resulting history lengths while received/sent totals stay unchanged. Traffic samples come from a mocked node.
  [Assertions in test/test_networktraffictower.cpp:122](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networktraffictower.cpp#L122) · [NetworkTrafficTowerTests::filterWindowChangesPreserveTotalsAndHistory()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: Clearing all traffic history is not required for choosing an observation period. Totals remain cumulative; the selected period controls graph history. Existing test coverage and the traffic-page capture suffice without another deterministic-traffic GUI run.

## F22.S05 — Run advanced node and wallet commands.

[Open criterion](#feature/F22?item=F22.S05)

The live console test demonstrates command submission and replies. Model tests verify wallet scoping, and parser tests cover nested commands and quoted arguments. The QML console forwards commands through the same Core RPC dispatcher, so its access to advanced commands can be inferred without replaying every backend operation in the GUI.

QML: [qml/pages/node/CommandConsole.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/node/CommandConsole.qml), [qml/components/SettingsView.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/SettingsView.qml).

Hooks: [qml/models/rpcconsolemodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/rpcconsolemodel.cpp), [qml/models/rpccommandexecutor.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/rpccommandexecutor.cpp).

What the tests prove:

- **Live console submission and output** — Submits getblockcount, help and an invalid command through the running console, waits for execution to finish, and checks that output entries appear. This does not execute every available RPC.
  [Assertions in test/functional/qml_test_console.py:205](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_console.py#L205) · [All console tests passed.](gui-feature-evidence/logs/qml_test_console.log).
- **Commands use the selected wallet context** — Checks that a selected wallet name is encoded into the RPC wallet endpoint and that a node command with no selected wallet uses no wallet endpoint.
  [Assertions in test/test_rpcconsolemodel.cpp:319](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_rpcconsolemodel.cpp#L319) · [RpcConsoleModelTests::walletNameScopesRpcToWalletUri()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Nested command parsing** — Checks that nested-command syntax is accepted by the parser. This case parses without executing the command.
  [Assertions in test/test_rpccommandexecutor.cpp:51](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_rpccommandexecutor.cpp#L51) · [RpcCommandExecutorTests::parseNestedCommands()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Quoted argument parsing** — Checks single- and double-quoted arguments in the command parser. This case does not execute the commands or verify message signing.
  [Assertions in test/test_rpccommandexecutor.cpp:57](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_rpccommandexecutor.cpp#L57) · [RpcCommandExecutorTests::parseQuotedArguments()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: This accepts the console interface to advanced RPCs. It does not claim a fresh GUI run of descriptor import, multisig creation or PSBT combination, or independently certify every backend command. Their availability follows the shared dispatcher and selected wallet context.

## F23.S12 — Restore default preferences while retaining a backup of previous settings.

[Open criterion](#feature/F23?item=F23.S12)

The existing functional reset test verifies restored preferences. Unit tests seed nondefault Core settings, invoke the supported reset paths, assert a backup file exists, and verify cleared settings. The implementation writes the loaded settings to the backup before clearing them. Together these support reset with backup retention.

QML: [qml/pages/preinit.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/preinit.qml), [qml/pages/onboarding/OnboardingWizard.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/onboarding/OnboardingWizard.qml).

Hooks: [qml/datadir.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/datadir.cpp), [qml/onboarding_settings.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/onboarding_settings.cpp).

What the tests prove:

- **Startup reset restores visible defaults** — Starts onboarding with nondefault saved connection settings, resets them, and checks the visible defaults for listening, mapping, RPC and proxy controls.
  [Assertions in test/functional/qml_test_resetguisettings.py:147](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_resetguisettings.py#L147) · [All tests PASSED](gui-feature-evidence/collections/20261010-qml/logs/qml_test_resetguisettings.log).
- **Reset keeps a backup before clearing Core settings** — Checks that resetting Core settings creates a backup file and clears the active settings. It does not reopen the backup or perform a restore.
  [Assertions in test/test_options_model.cpp:1154](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp#L1154) · [OptionsModelTests::resetGuiSettingsClearsSettingsJson()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Reset of a selected profile keeps a backup** — Applies reset to a selected custom data directory, checks the default options, backup-file existence and cleared settings. It does not perform a restore round trip.
  [Assertions in test/test_options_model.cpp:1241](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_options_model.cpp#L1241) · [OptionsModelTests::resetGuiSettingsApplyClearsSelectedCustomDataDirSettingsJson()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: Backup retention is inferred from the tested file creation and write-before-clear code path. No new backup-restore round trip was run. The backup covers Core settings.json; GUI-only QSettings are cleared. Startup invocation remains an accepted equivalent workflow.

## F27.S04 — Request an orderly shutdown during startup.

[Open criterion](#feature/F27?item=F27.S04)

The recorded shutdown scenario requests cancellation during initialization and checks a successful process exit. It also exercises closing the GUI through the shutdown page. NodeModel tests cover interruption during initialization; the connected QML close action and application shutdown wiring provide the user path.

QML: [qml/pages/MainWindow.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/MainWindow.qml), [qml/pages/node/Shutdown.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/node/Shutdown.qml).

Hooks: [qml/bitcoin.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp), [qml/models/nodemodel.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/models/nodemodel.cpp), [qml/initexecutor.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/initexecutor.cpp).

What the tests prove:

- **Cancellation while initialization is active** — Waits for evidence that startup initialization has begun, sends SIGINT, and checks that the GUI exits with code 0.
  [Assertions in test/functional/qml_test_shutdown.py:149](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_shutdown.py#L149) · [SIGINT during load_on_startup shutdown completed successfully.](gui-feature-evidence/logs/qml_test_shutdown.log).
- **Window-close shutdown exits successfully** — Closes the running GUI with load-on-startup wallets configured, observes the shutdown page, and checks exit code 0. This case does not separately assert that initialization is still active at the instant of closing.
  [Assertions in test/functional/qml_test_shutdown.py:133](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_shutdown.py#L133) · [Close during load_on_startup shutdown completed successfully.](gui-feature-evidence/logs/qml_test_shutdown.log).
- **Interrupted initialization requests shutdown** — Simulates failed initialization after Core has requested shutdown and checks that the model requests application shutdown.
  [Assertions in test/test_nodemodel.cpp:369](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_nodemodel.cpp#L369) · [NodeModelTests::initializationFailureRequestsShutdownWhenCoreWasInterrupted()](gui-feature-evidence/logs/qml-unit-tests.log).
- **Shutdown execution leaves the GUI thread** — Checks that the shutdown executor calls node shutdown off the GUI thread and emits a successful completion signal exactly once.
  [Assertions in test/test_qmlinitexecutor_api.cpp:99](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_qmlinitexecutor_api.cpp#L99) · [QmlInitExecutorApiTests::shutdownEmitsResultAndRunsOffMainThread()](gui-feature-evidence/logs/qml-unit-tests.log).

Coverage limits: The SIGINT case waits for startup activity; the window-close case proves the user close path. Their combination with model tests and source wiring supports startup cancellation. The recorded build had IPC disabled. IPC child-process lifecycle, sanitizer stderr and other build configurations are not certified by this assessment; their required CI validation remains separate. No new application test was run.

[Review data and source hashes](hardware-platform-review.json)
