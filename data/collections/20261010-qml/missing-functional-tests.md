# Missing functional proof after the QML evidence pass

35 of the original 61 criteria now have full scoped proof. 26 still need work: one reproduced application failure and 25 incomplete evidence packages. These are 19 test/environment workstreams, not one new test file per criterion.

Hardware and desktop-platform rows require the corresponding test environment. Existing component tests and mock-signer tests remain useful, but do not substitute for those runs. The proposed filenames below identify work to add; they are not claims that those tests already exist.

[Complete before/after evidence report](report.md) · [Machine-readable plan for all 61](functional-test-plan.json)

<a id="f07-s01"></a>
## F07.S01 — View available, pending, immature mining, and total balances.

**Test/environment:** qml_test_wallet_balances.py. **Workstream:** wallet-balances.

Create available, pending and immature funds, then assert the displayed balances and pending activity agree with RPC before and after confirmation.

<a id="f09-s07"></a>
## F09.S07 — Sign payments with local spending keys or a compatible external signer.

**Test/environment:** hardware acceptance run. **Workstream:** physical-signer.

Repeat the payment with a compatible physical signer: approve on the device, verify the destination and fee, broadcast, and check the wallet holds no spending keys.

<a id="f12-s04"></a>
## F12.S04 — Compare coins by amount, address, label, age, and confirmations.

**Test/environment:** qml_test_coin_comparison.py. **Workstream:** coin-comparison.

Create coins with distinct amounts, labels, ages and confirmations; verify the supported comparison fields, grouping and sorting against listunspent. Document that confirmation counts are not displayed.

<a id="f14-s06"></a>
## F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

**Test/environment:** qml_test_multisigner_psbt.py. **Workstream:** multisigner-psbt.

Export a transaction after one signer, assert the signature survives the GUI handoff, then have a second signer complete it.

<a id="f15-s01"></a>
## F15.S01 — Connect a wallet to a compatible external signer.

**Test/environment:** hardware acceptance run. **Workstream:** physical-signer.

Enumerate and connect a real compatible signer; validate identity and wallet descriptors.

<a id="f15-s02"></a>
## F15.S02 — Keep spending keys on the signing device.

**Test/environment:** hardware acceptance run. **Workstream:** physical-signer.

Verify key custody on a real device while the connected wallet exposes only public descriptors.

<a id="f15-s04"></a>
## F15.S04 — Authorize outgoing payments using the device.

**Test/environment:** hardware acceptance run. **Workstream:** physical-signer.

Approve and reject payments on a real device; compare its recipient/fee confirmation and the broadcast transaction.

<a id="f15-s05"></a>
## F15.S05 — Continue a signing workflow when additional signatures are needed. Signing workflow.

**Test/environment:** qml_test_multisigner_psbt.py. **Workstream:** multisigner-psbt.

Save an incomplete signing result and resume it with another signer without losing signatures or changing outputs.

<a id="f16-s09"></a>
## F16.S09 — Inspect transactions in external block explorers.

**Test/environment:** qml_test_external_explorer.py. **Workstream:** explorer-handoff.

Configure a controlled explorer URL, open a real transaction, confirm the outgoing URL contains its exact transaction ID, and observe browser delivery.

<a id="f18-s05"></a>
## F18.S05 — Copy saved addresses and labels to the clipboard.

**Test/environment:** qml_test_addresses.py extension. **Workstream:** address-label-copy.

Copy a saved address and an editable saved label through the GUI; assert both clipboard values exactly match the records.

<a id="f20-s03"></a>
## F20.S03 — Assess available storage, expected requirements, and the effect of pruning on wallet recovery.

**Test/environment:** qml_test_storage_planning.py. **Workstream:** storage-planning.

Exercise sufficient and insufficient free space and pruning choices; assert displayed requirements and the accepted storage selection. Recovery guidance remains a documented UI difference.

<a id="f20-s07"></a>
## F20.S07 — Use mainnet, testnet, testnet4, signet, or regtest. Network support.

**Test/environment:** qml_test_network_identity.py. **Workstream:** network-matrix.

Launch isolated offline profiles for mainnet, testnet, testnet4, signet and regtest; assert the active chain and GUI identity for each.

<a id="f21-s03"></a>
## F21.S03 — Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support.

**Test/environment:** qml_test_proxy_routing.py. **Workstream:** proxy-routing.

Use controlled SOCKS5 and Tor routes, verify connections reach the configured proxy, and prove no unintended direct connection bypasses it.

<a id="f21-s04"></a>
## F21.S04 — Automatically configure router access for incoming connections where supported.

**Test/environment:** NAT-PMP integration environment. **Workstream:** router-mapping.

Enable mapping against a controlled gateway; verify the resulting mapping and its removal/renewal. A settings toggle alone does not prove router behavior.

<a id="f22-s03"></a>
## F22.S03 — Focus traffic monitoring on a chosen time period or begin a fresh observation.

**Test/environment:** qml_test_traffic_history.py. **Workstream:** traffic-window.

Produce deterministic traffic, select different observation periods, and verify displayed samples and totals follow the selected period.

<a id="f22-s09"></a>
## F22.S09 — Use RPC for descriptor import, multisig setup, wallet rescans, and combining PSBTs.

**Test/environment:** qml_test_console_wallet_workflows.py. **Workstream:** advanced-rpc.

Run descriptor import, multisig setup and PSBT combination through the GUI console and validate resulting wallet/PSBT state. Rescan is covered by the new watch-only test.

<a id="f23-s01"></a>
## F23.S01 — Allocate memory and processing resources for block validation.

**Test/environment:** qml_evidence_cache_limit.py (now failing). **Workstream:** cache-limit-fix.

Fix the GUI total-cache range, then make the new 768 MiB regression pass. Add boundary cases and assert persistence after restart.

<a id="f23-s12"></a>
## F23.S12 — Restore default preferences while retaining a backup of previous settings.

**Test/environment:** qml_test_resetguisettings.py extension. **Workstream:** settings-backup.

Seed nondefault preferences, reset through the supported startup flow, and assert a nonempty backup retains the original settings and can be read back.

<a id="f24-s01"></a>
## F24.S01 — Keep the application accessible while its main window is hidden.

**Test/environment:** qml_test_tray.py + native desktop fixtures. **Workstream:** desktop-platforms.

Repeat native hide/restore on Windows and macOS; assert the process and node remain alive while the window is hidden.

<a id="f24-s02"></a>
## F24.S02 — Control application visibility without interrupting the node.

**Test/environment:** qml_test_tray.py + native desktop fixtures. **Workstream:** desktop-platforms.

Exercise visibility transitions on Windows/macOS and assert node RPC remains responsive. Linux native Hide/Show already has proof.

<a id="f24-s03"></a>
## F24.S03 — Quickly access payments, message signing and verification, settings, and diagnostics.

**Test/environment:** qml_test_tray_navigation.py. **Workstream:** tray-action-routing.

After native tray/Dock restoration, reach payment, message signing/verification, settings and diagnostics while preserving the selected wallet.

<a id="f27-s03"></a>
## F27.S03 — Monitor initialization progress.

**Test/environment:** qml_test_startup_progress.py. **Workstream:** startup-progress.

Use a sufficiently long real initialization/reindex fixture, assert progress updates remain visible, and capture a stable initialization frame.

<a id="f27-s04"></a>
## F27.S04 — Request an orderly shutdown during startup.

**Test/environment:** interface_gui.py + QML startup cancellation. **Workstream:** ipc-startup-shutdown.

Run initialization cancellation with IPC enabled; assert GUI and child-node exit status and inspect both stderr streams under the required sanitizer configuration.

<a id="f30-s06"></a>
## F30.S06 — Assess synchronization progress, processing rate, and estimated remaining work.

**Test/environment:** qml_evidence_sync.py extension. **Workstream:** sync-estimates.

Extend the controlled peer transfer until a settled ETA appears; assert progress advances and the estimate responds sensibly to throughput changes.

<a id="f31-s02"></a>
## F31.S02 — Distinguish application instances using different Bitcoin networks.

**Test/environment:** qml_test_network_identity.py. **Workstream:** network-matrix.

Capture the identity shown by each of the five supported networks, including simultaneous distinct profiles.

<a id="f31-s05"></a>
## F31.S05 — Use external block explorers to inspect transactions.

**Test/environment:** qml_test_external_explorer.py. **Workstream:** explorer-handoff.

Assert a configured explorer action delivers the selected transaction ID to a controlled browser target. Current evidence checks URL construction only.
