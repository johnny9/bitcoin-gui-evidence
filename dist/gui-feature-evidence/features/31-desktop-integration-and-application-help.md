# F31 · Desktop Integration and Application Help

[Evidence index](../README.md) · [Test results](../TEST-RESULTS.md) · [Capture and build provenance](../PROVENANCE.md)

6 acceptance criteria from the supported-feature inventory. **Acceptance is pending review.** A screenshot demonstrates the visible state; the stated assertions describe the behavior that was actually checked. Related passing suites do not certify every variant of a criterion.

## Implementation comparison

**Partial.** Import payment requests by drag and drop, distinguish networks, choose light/dark appearance, open explorers, and view application information and RPC documentation. Desktop-delivered payment links, automatic following of desktop appearance, macOS protection against background throttling, and in-app command-line help are missing.

[Payment-request import](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendCreate.qml); [Appearance](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/controls/Theme.qml); [Help and desktop actions](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/DesktopMenuActions.qml); [Startup integration](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp).

## Application captures

| Qt Widgets (`src/qt`) | GUI-QML (`qt6`) |
| --- | --- |
| ![About application](../media/widgets/about-application.png)<br>About application<br><br>![Command line help](../media/widgets/command-line-help.png)<br>Command line help | ![Display preferences](../media/qml/qml_test_settings_display/004-wait-for-page-displaysettingspage.png)<br>Display preferences<br><br>![Application information](../media/qml/qml_test_disablewallet_boot/006-06-about-settings-opened.png)<br>Application information |

## Modules

- **Qt Widgets:** [primary implementation](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/bitcoingui.cpp).
- **GUI-QML:** [Payment-request import](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/pages/wallet/SendCreate.qml); [Appearance](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/controls/Theme.qml); [Help and desktop actions](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/components/DesktopMenuActions.qml); [Startup integration](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/qml/bitcoin.cpp).

These are the implementation entry points for the criteria below. Links are pinned to the tested source revisions.

## Automated tests

| Application | Test/module | Recorded result |
| --- | --- | --- |
| GUI-QML | [qml_test_uri_import](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_uri_import.py) | [passed](../logs/qml_test_uri_import.log) |
| GUI-QML | [qml_test_settings_display](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_settings_display.py) | [passed](../logs/qml_test_settings_display.log) |
| GUI-QML | [qml_test_disablewallet_boot](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/functional/qml_test_disablewallet_boot.py) | [passed](../logs/qml_test_disablewallet_boot.log) |
| GUI-QML C++ | [test/test_networkstyle.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_networkstyle.cpp) | [Suite passed](../logs/qml-unit-tests.log); fixture/model assertions |
| GUI-QML C++ | [test/test_guiargs.cpp](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/test_guiargs.cpp) | [Suite passed](../logs/qml-unit-tests.log); fixture/model assertions |
| GUI-QML components | [test/qml/tst_desktopmenuactions.qml](https://github.com/bitcoin-core/gui-qml/blob/a91f4b4774f25de061fe1a7c132a91ddde117fca/test/qml/tst_desktopmenuactions.qml) | [Suite passed](../logs/qml-quick-tests.log); component assertions |
| Qt Widgets | [URITests](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/test/uritests.cpp) | [Suite passed](../logs/widgets-qt-tests.log); inspect assertion scope |
| Qt Widgets | [AppTests](https://github.com/bitcoin-core/gui/blob/f739c7876b81304bdc72e7eaa307702da269ac31/src/qt/test/apptests.cpp) | [Suite passed](../logs/widgets-qt-tests.log); inspect assertion scope |

## Acceptance criteria

### F31.S01 · Open Bitcoin payment requests from other applications or by drag and drop.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Related automated suite | No targeted runtime assertion collected for this exact criterion.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Partial / limited evidence | In-app import/drop is supported; OS-delivered requests are missing.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

### F31.S02 · Distinguish application instances using different Bitcoin networks.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Related automated suite | No targeted runtime assertion collected for this exact criterion.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Partial / limited evidence | Regtest identity is captured; other network identities have source/component coverage.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

### F31.S03 · Adapt application visuals to the desktop appearance.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Related automated suite | No targeted runtime assertion collected for this exact criterion.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Partial / limited evidence | Manual light/dark appearance exists; automatic desktop-theme following is missing.<br>[Display preferences](../media/qml/qml_test_settings_display/004-wait-for-page-displaysettingspage.png)<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

### F31.S04 · Prevent macOS background throttling from slowing initial synchronization and reindexing.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Related automated suite | No targeted runtime assertion collected for this exact criterion.<br>**Limit:** macOS App Nap behavior cannot be verified in this Linux run.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Implementation gap | No macOS background-throttling protection.<br>No screenshot: this GUI workflow is absent.<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

### F31.S05 · Use external block explorers to inspect transactions.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Related automated suite | No targeted runtime assertion collected for this exact criterion.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Automated evidence collected | Explorer URL generation has tests; browser launch remains manual.<br>No matching screenshot collected.<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

### F31.S06 · Access application information and command-line help.

| Application | Evidence status | Evidence and limits |
| --- | --- | --- |
| Qt Widgets | Visual evidence only | No targeted runtime assertion collected for this exact criterion.<br>[About application](../media/widgets/about-application.png)<br>[Command line help](../media/widgets/command-line-help.png)<br>[Modules](#modules) · [Related tests](#automated-tests) |
| GUI-QML | Partial / limited evidence | About and RPC help exist; graphical command-line help is missing.<br>[Application information](../media/qml/qml_test_disablewallet_boot/006-06-about-settings-opened.png)<br>[Modules](#modules) · [Related tests](#automated-tests) |

- [ ] Acceptance decision recorded by reviewer.

## Capture register

The original PNGs are unmodified application captures. Timestamps, dimensions and SHA-256 hashes are in the [capture manifest](../selected-captures.json). Some early/raw frames are not selected for review.

| Application | Capture | Criteria |
| --- | --- | --- |
| widgets | [About application](../media/widgets/about-application.png) | F31.S06 |
| widgets | [Command line help](../media/widgets/command-line-help.png) | F31.S06 |
| qml | [Display preferences](../media/qml/qml_test_settings_display/004-wait-for-page-displaysettingspage.png) | F31.S03 |
| qml | [Application information](../media/qml/qml_test_disablewallet_boot/006-06-about-settings-opened.png) | F31.S06 |
