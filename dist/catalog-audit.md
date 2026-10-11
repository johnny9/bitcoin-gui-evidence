# Subfeature duplicate audit

2026-10-11 · All 203 original subfeatures across 34 groups reviewed. The current catalog has 202 criteria after the requested F05 merge.

Compare user outcomes across all groups, asking whether one outcome can work while another fails. Shared screenshots, source modules or controls alone do not establish a duplicate. Preserve distinct wallet types, security requirements, lifecycle stages and interoperability checks.

**Applied:** F05.S02 is combined into F05.S01. Other findings are recommendations and remain separately counted. Existing evidence and source IDs are archived; old links open the combined criterion.

## Findings

9 further merge candidates, 12 partial overlaps to clarify, and 8 reviewed distinctions to retain. These are finding clusters, not a proposed removal count.

## Applied merge

### D01 — Export a watch-only copy

[F05.S01](#feature/F05?item=F05.S01) · [F05.S02](#feature/F05?item=F05.S02)

Creating a watch-only copy and writing that copy to a file describe one export outcome.

**Action:** Combined as F05.S01. File creation and absence of private spending keys are verification steps; cross-node use remains F05.S03.


## Further merge candidates

### D02 — Watch-only key separation

[F05.S01](#feature/F05?item=F05.S01) · [F05.S04](#feature/F05?item=F05.S04)

A copy without spending access already requires spending keys to remain separate. S04 repeats a defining property of S01.

**Action:** Fold S04 into the merged S01 and retain the public-descriptor/private-key assertions as its security checks.

### D03 — Conceal balances and activity

[F07.S05](#feature/F07?item=F07.S05) · [F32.S01](#feature/F32?item=F32.S01)

Both criteria ask privacy mode to conceal balances and recent activity. Their placement in different groups adds no user outcome.

**Action:** Keep F32.S01 as the counted criterion and cross-reference it from Wallet Overview.

### D04 — Switch the active wallet

[F02.S03](#feature/F02?item=F02.S03) · [F28.S02](#feature/F28?item=F28.S02)

Choosing which wallet to use and switching between available wallets are the same user action.

**Action:** Keep F02.S03 and cross-reference it from Navigation.

### D05 — Open a transaction in an external explorer

[F16.S09](#feature/F16?item=F16.S09) · [F31.S05](#feature/F31?item=F31.S05)

Both criteria open transaction information in an external block explorer.

**Action:** Keep F16.S09 and reference it from Desktop Integration. Keep configuration of the explorer service, F23.S08, separate.

### D06 — Select transaction funding coins

[F12.S01](#feature/F12?item=F12.S01) · [F12.S02](#feature/F12?item=F12.S02)

Selecting individual coins or groups is already a way of choosing which coins fund a transaction.

**Action:** Combine as choosing the funding coins individually or in groups. Keep coin inspection, locking and custom change separate.

### D07 — Keep the node running while the window is hidden

[F24.S02](#feature/F24?item=F24.S02) · [F26.S03](#feature/F26?item=F26.S03)

Both require visibility changes to leave the node running. Minimize, close-to-tray and restore are scenarios for the same outcome.

**Action:** Keep F26.S03, retain supported desktop variants in its test matrix, and link from the tray group.

### D08 — Quit cleanly

[F24.S04](#feature/F24?item=F24.S04) · [F27.S05](#feature/F27?item=F27.S05)

A tray/dock Quit entry is an activation path for orderly application and node shutdown.

**Action:** Keep F27.S05, with tray/dock Quit as a test path. Keep startup cancellation and Windows session shutdown as distinct cases.

### D09 — Submit a fee increase

[F17.S01](#feature/F17?item=F17.S01) · [F17.S03](#feature/F17?item=F17.S03)

Signing and submitting the replacement completes the fee increase described by S01. Neither wording establishes a separate user objective.

**Action:** Combine into increasing the fee of an eligible transaction and submitting its replacement. Retain cost review and unsigned fee-bump export separately.

### D10 — Receive payment links from other applications

[F10.S03](#feature/F10?item=F10.S03) · [F31.S01](#feature/F31?item=F31.S01)

Both provide desktop handoff of Bitcoin payment requests into the application. Running-instance delivery and drag-and-drop are supported variants.

**Action:** Keep one handoff criterion under Open Payment URI, preserving both startup/running-instance and drag-and-drop checks.


## Partial overlaps

### O01 — Receiving-address verification on a device

[F08.S08](#feature/F08?item=F08.S08) · [F15.S03](#feature/F15?item=F15.S03)

F08.S08 repeats the verification part of F15.S03, which also includes generating addresses.

**Action:** Give device verification one criterion under External Signer; keep address generation under Receive and reference that coverage.

### O02 — Wallet encryption and lock status

[F06.S05](#feature/F06?item=F06.S05) · [F29.S04](#feature/F29?item=F29.S04)

Encryption and lock status are repeated; F29.S04 additionally covers key-generation status.

**Action:** Keep encryption/lock status under F06 and narrow F29.S04 to key-generation status, with a link to F06.

### O03 — Amount display units

[F23.S06](#feature/F23?item=F23.S06) · [F29.S05](#feature/F29?item=F29.S05)

Choosing the displayed denomination is contained in F23.S06 along with language selection.

**Action:** Keep units in one place and narrow the other criterion to language. Preserve both as separately assessable outcomes.

### O04 — Synchronization status and wallet freshness

[F20.S05](#feature/F20?item=F20.S05) · [F29.S02](#feature/F29?item=F29.S02) · [F30.S06](#feature/F30?item=F30.S06) · [F07.S04](#feature/F07?item=F07.S04)

Synchronization progress is repeated in three criteria. Processing rate, remaining work and stale wallet information add distinct conditions.

**Action:** Define one synchronization-status criterion with rate/remaining-work checks and a separate wallet-freshness warning criterion. Replace the other occurrences with references.

### O05 — Advanced RPC commands and examples

[F22.S05](#feature/F22?item=F22.S05) · [F22.S09](#feature/F22?item=F22.S09)

S09 lists command examples within S05, including descriptor import, multisig setup, rescan and PSBT combination.

**Action:** Keep command execution as the capability and retain the examples as functional test cases. Keep wallet selection and rescan recovery outcomes independently visible.

### O06 — Startup and window preferences

[F23.S09](#feature/F23?item=F23.S09) · [F24.S05](#feature/F24?item=F24.S05) · [F26.S03](#feature/F26?item=F26.S03) · [F27.S01](#feature/F27?item=F27.S01) · [F27.S02](#feature/F27?item=F27.S02)

The general startup/window preference row overlaps named outcomes for login startup, minimized startup, background operation and tray visibility.

**Action:** Replace the broad preference row with references to the specific outcomes so each requirement can be accepted separately.

### O07 — Quick access to common tasks

[F24.S03](#feature/F24?item=F24.S03) · [F28.S01](#feature/F28?item=F28.S01) · [F28.S03](#feature/F28?item=F28.S03) · [F28.S04](#feature/F28?item=F28.S04)

Tray access and general quick-access wording repeat navigation to payments, records and diagnostics. The tray location alone does not add a user goal.

**Action:** Use the concrete navigation outcomes and keep keyboard access separate. Remove broad quick-access rows or turn them into group descriptions.

### O08 — Fee estimate and confirmation timing

[F11.S01](#feature/F11?item=F11.S01) · [F11.S03](#feature/F11?item=F11.S03)

Confirmation timing is both an input to fee selection and information the user can assess. The current short wording does not clearly distinguish them.

**Action:** Either combine them or narrow S03 to showing the estimated timing for the chosen fee, including a custom rate; retain that only if it is an independent requirement.

### O09 — Payment-notification contents

[F25.S01](#feature/F25?item=F25.S01) · [F25.S02](#feature/F25?item=F25.S02)

S02 specifies the identifying information inside the payment notifications of S01.

**Action:** Fold transaction/wallet/amount context into the acceptance checks for payment notifications. Keep notification fallback and flood prevention separate.

### O10 — Wallet and network identity

[F26.S05](#feature/F26?item=F26.S05) · [F31.S02](#feature/F31?item=F31.S02)

Network identification is repeated, but F26.S05 also identifies the active wallet and F31.S02 calls out multiple instances.

**Action:** Separate active-wallet identity from active-network identity, with multiple instances as a network-identity scenario.

### O11 — Device authorization and payment signing

[F09.S07](#feature/F09?item=F09.S07) · [F15.S04](#feature/F15?item=F15.S04)

The external-signer part of Send repeats authorization on the signing device. Local signing is a separate part of F09.S07.

**Action:** Narrow the Send criterion to local-key signing and reference device authorization under External Signer, retaining physical-device proof requirements.

### O12 — Continue an incomplete signing workflow

[F14.S06](#feature/F14?item=F14.S06) · [F15.S05](#feature/F15?item=F15.S05)

Both preserve an incompletely signed transaction for further signing; F15.S05 is the external-device variant.

**Action:** Use one partial-PSBT handoff criterion with local and external-signer cases. Keep actually combining additional signatures (F14.S05) distinct; successful export alone does not prove it.


## Related outcomes to keep distinct

### K01 — Watch-only export versus cross-node recovery

[F05.S01](#feature/F05?item=F05.S01) · [F05.S03](#feature/F05?item=F05.S03)

Producing a file does not establish that another node can restore it and monitor the same funds.

**Action:** Keep cross-node interoperability independently checked.

### K02 — Encrypted creation versus encrypting an existing wallet

[F01.S02](#feature/F01?item=F01.S02) · [F06.S01](#feature/F06?item=F06.S01)

Protecting an existing wallet can fail independently of creating an encrypted wallet.

**Action:** Keep both lifecycle outcomes.

### K03 — Multiple wallets versus selecting a wallet

[F02.S02](#feature/F02?item=F02.S02) · [F02.S03](#feature/F02?item=F02.S03) · [F22.S06](#feature/F22?item=F22.S06)

Keeping wallets loaded, choosing the wallet for normal activity, and targeting an RPC command have different state and failure conditions.

**Action:** Keep concurrency, active-wallet selection and RPC execution context separate.

### K04 — No open wallet versus disabled wallet functionality

[F20.S06](#feature/F20?item=F20.S06) · [F33.S01](#feature/F33?item=F33.S01) · [F33.S02](#feature/F33?item=F33.S02) · [F33.S03](#feature/F33?item=F33.S03)

A node with no open wallet still has wallet functionality available. A wallet-disabled run must retain node controls and application behavior without that subsystem.

**Action:** Keep the disabled-mode acceptance cases; shared screenshots are not enough to merge them.

### K05 — Unsigned export versus partial signing and signature collection

[F09.S08](#feature/F09?item=F09.S08) · [F13.S01](#feature/F13?item=F13.S01) · [F13.S02](#feature/F13?item=F13.S02) · [F13.S03](#feature/F13?item=F13.S03) · [F13.S05](#feature/F13?item=F13.S05) · [F14.S03](#feature/F14?item=F14.S03) · [F14.S05](#feature/F14?item=F14.S05) · [F14.S06](#feature/F14?item=F14.S06)

Preparing a payment, choosing supported wallet/signature types, exporting unsigned data, preserving existing signatures and collecting additional signatures are independently fallible outcomes.

**Action:** Keep their contract boundaries. Use cross-references for shared payment-entry controls instead of treating a common PSBT screenshot as duplicate proof.

### K06 — Copying data versus saving or sharing images

[F08.S03](#feature/F08?item=F08.S03) · [F08.S04](#feature/F08?item=F08.S04) · [F08.S05](#feature/F08?item=F08.S05) · [F08.S06](#feature/F08?item=F08.S06) · [F18.S05](#feature/F18?item=F18.S05) · [F19.S03](#feature/F19?item=F19.S03)

Generating a request, copying its text, exporting its QR image and sharing it are different usable capabilities. Clipboard copies of addresses or signatures involve different data contracts.

**Action:** Keep copying as a capability, as requested. Do not create extra criteria for the location of a Copy button.

### K07 — Progress and recovery stages

[F20.S04](#feature/F20?item=F20.S04) · [F27.S03](#feature/F27?item=F27.S03) · [F27.S04](#feature/F27?item=F27.S04) · [F27.S05](#feature/F27?item=F27.S05) · [F27.S06](#feature/F27?item=F27.S06) · [F27.S08](#feature/F27?item=F27.S08) · [F30.S05](#feature/F30?item=F30.S05) · [F30.S07](#feature/F30?item=F30.S07) · [F34.S01](#feature/F34?item=F34.S01) · [F34.S02](#feature/F34?item=F34.S02) · [F34.S03](#feature/F34?item=F34.S03)

Initial application startup, chain download, shutdown and wallet rescans operate at different lifecycle stages. Reporting progress, remaining usable and cancellation can fail independently.

**Action:** Keep stage-specific outcomes. Treat the broad long-running-operation row as a scoped summary, not proof of every operation.

### K08 — Explorer settings versus opening a transaction

[F23.S08](#feature/F23?item=F23.S08) · [F16.S09](#feature/F16?item=F16.S09)

Selecting an explorer service does not prove that a transaction is handed off using the correct ID.

**Action:** Keep configuration and actual explorer handoff separate.

## Complete group-by-group review

Every original criterion is listed below. Finding IDs refer to the analysis above. “Keep” means no duplicate was identified for that row; it is not an implementation or acceptance decision.

### F01 — Create Wallet

Creation variants, naming and existing-wallet encryption have distinct lifecycle contracts.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F01.S01](#feature/F01?item=F01.S01) | Create a standard single-signature wallet. | Keep |
| [F01.S02](#feature/F01?item=F01.S02) | Create an encrypted or unencrypted wallet containing spending keys. | K02 |
| [F01.S03](#feature/F01?item=F01.S03) | Create a watch-only wallet to monitor funds without holding spending keys. | Keep |
| [F01.S04](#feature/F01?item=F01.S04) | Create a blank wallet for later setup. | Keep |
| [F01.S05](#feature/F01?item=F01.S05) | Create a wallet that uses an external signer, such as a hardware wallet. | Keep |
| [F01.S06](#feature/F01?item=F01.S06) | Name the wallet. | Keep |

### F02 — Open, Switch, and Close Wallets

Wallet switching repeats Navigation; keeping wallets open and targeting RPC are different.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F02.S01](#feature/F02?item=F02.S01) | Open existing wallets. | Keep |
| [F02.S02](#feature/F02?item=F02.S02) | Keep multiple wallets available at the same time. | K03 |
| [F02.S03](#feature/F02?item=F02.S03) | Choose which wallet to use. | D04, K03 |
| [F02.S04](#feature/F02?item=F02.S04) | Close individual wallets or all wallets. | Keep |

### F03 — Back Up and Restore Wallet

Backup creation, restoration, naming and legacy recovery remain distinguishable.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F03.S01](#feature/F03?item=F03.S01) | Save a wallet backup to a file. | Keep |
| [F03.S02](#feature/F03?item=F03.S02) | Restore a wallet from a backup file. | Keep |
| [F03.S03](#feature/F03?item=F03.S03) | Name a recovered wallet. | Keep |
| [F03.S04](#feature/F03?item=F03.S04) | Recover and update a legacy wallet backup. | Keep |

### F04 — Migrate Legacy Wallet

Format conversion, preserving the original, retaining contents and reopening are separate migration checks.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F04.S01](#feature/F04?item=F04.S01) | Update legacy wallets to the current wallet format. | Keep |
| [F04.S02](#feature/F04?item=F04.S02) | Preserve the original wallet with an automatic backup. | Keep |
| [F04.S03](#feature/F04?item=F04.S03) | Preserve wallet contents, including watch-only information. | Keep |
| [F04.S04](#feature/F04?item=F04.S04) | Open migrated wallets immediately or later. | Keep |

### F05 — Export Watch-Only Wallet

Apply the requested export merge; key separation is another merge candidate; cross-node recovery remains distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F05.S01](#feature/F05?item=F05.S01) | Create a copy of a wallet that can monitor its funds without spending them. | D01, D02, K01 |
| [F05.S02](#feature/F05?item=F05.S02) | Export the watch-only wallet to a file. | D01 |
| [F05.S03](#feature/F05?item=F05.S03) | Transfer wallet monitoring to another node. | K01 |
| [F05.S04](#feature/F05?item=F05.S04) | Keep spending keys separate from a wallet used for monitoring. | D02 |

### F06 — Encrypt Wallet and Manage Passphrase

Encryption/lock status overlaps Application Status; key access and relocking remain separate.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F06.S01](#feature/F06?item=F06.S01) | Protect stored spending keys with passphrase encryption. | K02 |
| [F06.S02](#feature/F06?item=F06.S02) | Change the wallet passphrase. | Keep |
| [F06.S03](#feature/F06?item=F06.S03) | Temporarily unlock spending keys for operations that require them. | Keep |
| [F06.S04](#feature/F06?item=F06.S04) | Automatically restore the locked state after temporary access. | Keep |
| [F06.S05](#feature/F06?item=F06.S05) | Check whether a wallet is encrypted and locked. | O02 |
| [F06.S06](#feature/F06?item=F06.S06) | Show or hide entered passphrases. | Keep |
| [F06.S07](#feature/F06?item=F06.S07) | Receive feedback on passphrase mismatches and common entry mistakes. | Keep |

### F07 — View Wallet Overview

Privacy concealment repeats Privacy Mode; wallet freshness participates in the synchronization overlap.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F07.S01](#feature/F07?item=F07.S01) | View available, pending, immature mining, and total balances. | Keep |
| [F07.S02](#feature/F07?item=F07.S02) | Review recent wallet activity. | Keep |
| [F07.S03](#feature/F07?item=F07.S03) | Find a recent transaction in the full transaction history. | Keep |
| [F07.S04](#feature/F07?item=F07.S04) | Know when wallet information may be out of date. | O04 |
| [F07.S05](#feature/F07?item=F07.S05) | Conceal balances and recent activity with privacy mode. | D03 |

### F08 — Receive Bitcoin / Request Payment

Device verification overlaps External Signer; request generation, copying and sharing remain separate capabilities.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F08.S01](#feature/F08?item=F08.S01) | Generate receiving addresses using legacy, wrapped SegWit, native SegWit, or Taproot formats supported by the wallet. | Keep |
| [F08.S02](#feature/F08?item=F08.S02) | Request a payment with an optional amount, label, and message. | Keep |
| [F08.S03](#feature/F08?item=F08.S03) | Generate payment links and QR codes. | K06 |
| [F08.S04](#feature/F08?item=F08.S04) | Copy receiving addresses, payment links, and request details to the clipboard. | K06 |
| [F08.S05](#feature/F08?item=F08.S05) | Copy payment QR codes to the clipboard or save them as images. | K06 |
| [F08.S06](#feature/F08?item=F08.S06) | Share QR images with other applications using drag and drop. | K06 |
| [F08.S07](#feature/F08?item=F08.S07) | Review, reuse, and remove saved payment requests. | Keep |
| [F08.S08](#feature/F08?item=F08.S08) | Verify receiving addresses on a compatible signing device. | O01 |
| [F08.S09](#feature/F08?item=F08.S09) | Generate receiving addresses for a configured watch-only wallet. | Keep |

### F09 — Send Bitcoin

Device signing overlaps External Signer; recipient entry, labeling, amount, validation and watch-only preparation remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F09.S01](#feature/F09?item=F09.S01) | Pay one recipient or multiple recipients in a single transaction. | Keep |
| [F09.S02](#feature/F09?item=F09.S02) | Enter or paste a recipient address, or use a saved address. | Keep |
| [F09.S03](#feature/F09?item=F09.S03) | Associate recipient addresses with recognizable labels. | Keep |
| [F09.S04](#feature/F09?item=F09.S04) | Send the available balance. | Keep |
| [F09.S05](#feature/F09?item=F09.S05) | Deduct fees from selected recipient amounts. | Keep |
| [F09.S06](#feature/F09?item=F09.S06) | Review payment details and total costs before authorizing a transaction. | Keep |
| [F09.S07](#feature/F09?item=F09.S07) | Sign payments with local spending keys or a compatible external signer. | O11 |
| [F09.S08](#feature/F09?item=F09.S08) | Prepare a payment from a watch-only wallet for signing elsewhere. | K05 |
| [F09.S09](#feature/F09?item=F09.S09) | Check payment details and available funds before sending. | Keep |

### F10 — Open Payment URI

Desktop payment-link handoff repeats Desktop Integration; parsing a request and receiving it are separate checks.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F10.S01](#feature/F10?item=F10.S01) | Open or paste Bitcoin payment links. | Keep |
| [F10.S02](#feature/F10?item=F10.S02) | Prepare a payment using the requested recipient, amount, and descriptive information. | Keep |
| [F10.S03](#feature/F10?item=F10.S03) | Handle payment requests from other applications, including while Bitcoin Core is already running. | D10 |

### F11 — Choose Transaction Fee

Estimated confirmation timing needs a clearer boundary from fee selection; custom rates and unavailable estimates remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F11.S01](#feature/F11?item=F11.S01) | Choose an estimated fee based on the desired confirmation speed. | O08 |
| [F11.S02](#feature/F11?item=F11.S02) | Set a custom fee rate. | Keep |
| [F11.S03](#feature/F11?item=F11.S03) | Assess expected confirmation timing. | O08 |
| [F11.S04](#feature/F11?item=F11.S04) | Know when a fee estimate is unavailable. | Keep |

### F12 — Select Coins / Coin Control

Individual/group selection is part of selecting funding coins; inspection, locks and change handling remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F12.S01](#feature/F12?item=F12.S01) | Choose which coins fund a transaction. | D06 |
| [F12.S02](#feature/F12?item=F12.S02) | Select individual coins or groups of coins. | D06 |
| [F12.S03](#feature/F12?item=F12.S03) | Inspect coins individually or grouped by address. | Keep |
| [F12.S04](#feature/F12?item=F12.S04) | Compare coins by amount, address, label, age, and confirmations. | Keep |
| [F12.S05](#feature/F12?item=F12.S05) | Control spending eligibility by locking or unlocking coins. | Keep |
| [F12.S06](#feature/F12?item=F12.S06) | Copy coin addresses, labels, amounts, identifiers, and transaction estimates to the clipboard. | Keep |
| [F12.S07](#feature/F12?item=F12.S07) | Review the selected funds, expected fees, and change. | Keep |
| [F12.S08](#feature/F12?item=F12.S08) | Choose where transaction change is returned. | Keep |
| [F12.S09](#feature/F12?item=F12.S09) | Receive a warning when a change destination is not recognized as spendable by the wallet. | Keep |

### F13 — Create and Export PSBT

Preparation, supported wallet types and unsigned transfer have distinct contracts despite sharing one workflow.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F13.S01](#feature/F13?item=F13.S01) | Prepare a transaction for later signing. | K05 |
| [F13.S02](#feature/F13?item=F13.S02) | Create transactions from watch-only wallets or wallets containing spending keys. | K05 |
| [F13.S03](#feature/F13?item=F13.S03) | Use single-signature or previously configured multisig wallets. | K05 |
| [F13.S04](#feature/F13?item=F13.S04) | Choose recipients, fees, and coins for the proposed transaction. | Keep |
| [F13.S05](#feature/F13?item=F13.S05) | Copy an unsigned PSBT to the clipboard or save it to a file for signing elsewhere. | K05 |

### F14 — Import, Sign, and Broadcast PSBT

Partial-PSBT handoff overlaps the device variant; import, review, signing, combining and broadcasting remain separately fallible.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F14.S01](#feature/F14?item=F14.S01) | Import a PSBT from a file or the clipboard. | Keep |
| [F14.S02](#feature/F14?item=F14.S02) | Review recipients, amounts, available fee information, and signing progress. | Keep |
| [F14.S03](#feature/F14?item=F14.S03) | Process single-signature and multisig transactions when the required keys and transaction information are available. | K05 |
| [F14.S04](#feature/F14?item=F14.S04) | Sign with local wallets, including encrypted wallets after unlocking. | Keep |
| [F14.S05](#feature/F14?item=F14.S05) | Collect additional signatures by passing a transaction between signers. | K05 |
| [F14.S06](#feature/F14?item=F14.S06) | Copy a partially signed PSBT to the clipboard or save it to a file for further signing. | O12, K05 |
| [F14.S07](#feature/F14?item=F14.S07) | Finalize and broadcast a transaction once sufficient signatures are present. | Keep |
| [F14.S08](#feature/F14?item=F14.S08) | Inspect transactions and broadcast fully signed transactions without opening a wallet. | Keep |

### F15 — Use Hardware Wallet / External Signer

Device address verification, payment authorization and partial handoff overlap other groups; device connection and key custody remain explicit.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F15.S01](#feature/F15?item=F15.S01) | Connect a wallet to a compatible external signer. | Keep |
| [F15.S02](#feature/F15?item=F15.S02) | Keep spending keys on the signing device. | Keep |
| [F15.S03](#feature/F15?item=F15.S03) | Generate receiving addresses and verify them on the device. | O01 |
| [F15.S04](#feature/F15?item=F15.S04) | Authorize outgoing payments using the device. | O11 |
| [F15.S05](#feature/F15?item=F15.S05) | Continue a signing workflow when additional signatures are needed. Signing workflow. | O12 |

### F16 — Browse and Export Transaction History

External explorer handoff repeats Desktop Integration. History browsing, filtering, details, editing, clipboard and CSV are separate outcomes.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F16.S01](#feature/F16?item=F16.S01) | Review incoming, outgoing, mined, and other transactions. | Keep |
| [F16.S02](#feature/F16?item=F16.S02) | Filter transactions by date, type, or minimum amount. | Keep |
| [F16.S03](#feature/F16?item=F16.S03) | Search by address, transaction ID, or label, and sort transaction history. | Keep |
| [F16.S04](#feature/F16?item=F16.S04) | View confirmation, conflict, abandonment, and mining-maturity status. Transaction states. | Keep |
| [F16.S05](#feature/F16?item=F16.S05) | Inspect transaction costs, balance changes, confirmation details, and transaction data. Transaction details. | Keep |
| [F16.S06](#feature/F16?item=F16.S06) | Copy addresses, amounts, transaction IDs, transaction details, and raw transaction data to the clipboard. | Keep |
| [F16.S07](#feature/F16?item=F16.S07) | Update address labels associated with transactions. | Keep |
| [F16.S08](#feature/F16?item=F16.S08) | Export filtered transaction history as CSV for record keeping or analysis. | Keep |
| [F16.S09](#feature/F16?item=F16.S09) | Inspect transactions in external block explorers. | D05, K08 |

### F17 — Manage Unconfirmed Transactions

Submitting the signed replacement completes fee bumping; reviewing cost, exporting unsigned data and abandoning are distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F17.S01](#feature/F17?item=F17.S01) | Increase the fee of an eligible transaction to improve its confirmation prospects. | D09 |
| [F17.S02](#feature/F17?item=F17.S02) | Review the additional cost before authorizing a fee increase. | Keep |
| [F17.S03](#feature/F17?item=F17.S03) | Sign and submit a replacement transaction. | D09 |
| [F17.S04](#feature/F17?item=F17.S04) | Create a fee-bump PSBT and copy it to the clipboard for signing elsewhere. | Keep |
| [F17.S05](#feature/F17?item=F17.S05) | Abandon eligible transactions so their inputs can be used for another spend. | Keep |

### F18 — Manage Address Book

Record management, receive labels, search, clipboard and CSV remain distinct; labels in payment/history workflows have different contexts.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F18.S01](#feature/F18?item=F18.S01) | Keep records of sending and receiving addresses. | Keep |
| [F18.S02](#feature/F18?item=F18.S02) | Add, update, and remove saved recipients. | Keep |
| [F18.S03](#feature/F18?item=F18.S03) | Label receiving addresses. | Keep |
| [F18.S04](#feature/F18?item=F18.S04) | Search and sort saved addresses by address or label. | Keep |
| [F18.S05](#feature/F18?item=F18.S05) | Copy saved addresses and labels to the clipboard. | K06 |
| [F18.S06](#feature/F18?item=F18.S06) | Export address records as CSV. | Keep |

### F19 — Sign and Verify Messages

Signing, verification and copying the signature remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F19.S01](#feature/F19?item=F19.S01) | Sign a message to demonstrate control of a Bitcoin address. | Keep |
| [F19.S02](#feature/F19?item=F19.S02) | Verify that a message was signed by the holder of the corresponding key. | Keep |
| [F19.S03](#feature/F19?item=F19.S03) | Copy the resulting signature to the clipboard. | K06 |

### F20 — Set Up and Synchronize Node

Synchronization status repeats status/progress groups; no-open-wallet operation differs from disabled wallet functionality.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F20.S01](#feature/F20?item=F20.S01) | Choose where node and wallet data are stored. | Keep |
| [F20.S02](#feature/F20?item=F20.S02) | Limit blockchain storage through pruning. | Keep |
| [F20.S03](#feature/F20?item=F20.S03) | Assess available storage, expected requirements, and the effect of pruning on wallet recovery. | Keep |
| [F20.S04](#feature/F20?item=F20.S04) | Download and validate the blockchain. | K07 |
| [F20.S05](#feature/F20?item=F20.S05) | Monitor synchronization progress and how far the node is behind. | O04 |
| [F20.S06](#feature/F20?item=F20.S06) | Operate the node without an open wallet. | K04 |
| [F20.S07](#feature/F20?item=F20.S07) | Use mainnet, testnet, testnet4, signet, or regtest. Network support. | Keep |

### F21 — Configure Network and Manage Peers

Network controls, proxy/router behavior, peer inspection, encrypted transport, bans and copying remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F21.S01](#feature/F21?item=F21.S01) | Enable or pause peer-to-peer networking. | Keep |
| [F21.S02](#feature/F21?item=F21.S02) | Allow incoming peer connections. | Keep |
| [F21.S03](#feature/F21?item=F21.S03) | Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support. | Keep |
| [F21.S04](#feature/F21?item=F21.S04) | Automatically configure router access for incoming connections where supported. | Keep |
| [F21.S05](#feature/F21?item=F21.S05) | Inspect peer connectivity, performance, synchronization, and relay behavior. | Keep |
| [F21.S06](#feature/F21?item=F21.S06) | Check whether peer connections use encrypted transport. | Keep |
| [F21.S07](#feature/F21?item=F21.S07) | Sort peers, copy peer addresses to the clipboard, and disconnect unwanted peers. | Keep |
| [F21.S08](#feature/F21?item=F21.S08) | Temporarily ban peers, review existing bans, and restore access. | Keep |
| [F21.S09](#feature/F21?item=F21.S09) | Copy banned addresses and network ranges to the clipboard. | Keep |

### F22 — Inspect Node and Use RPC Console

RPC workflow examples overlap generic command execution; wallet context, console affordances, logs and traffic remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F22.S01](#feature/F22?item=F22.S01) | Inspect node identity, network, synchronization, and mempool information. | Keep |
| [F22.S02](#feature/F22?item=F22.S02) | Monitor network traffic and data usage over time. | Keep |
| [F22.S03](#feature/F22?item=F22.S03) | Focus traffic monitoring on a chosen time period or begin a fresh observation. | Keep |
| [F22.S04](#feature/F22?item=F22.S04) | Inspect logs for troubleshooting. | Keep |
| [F22.S05](#feature/F22?item=F22.S05) | Run advanced node and wallet commands. | O05 |
| [F22.S06](#feature/F22?item=F22.S06) | Choose which wallet an advanced operation applies to. | K03 |
| [F22.S07](#feature/F22?item=F22.S07) | Use command history, completion, and help. | Keep |
| [F22.S08](#feature/F22?item=F22.S08) | Adjust console readability and clear previous output. | Keep |
| [F22.S09](#feature/F22?item=F22.S09) | Use RPC for descriptor import, multisig setup, wallet rescans, and combining PSBTs. | O05 |

### F23 — Configure Application Preferences

Language/units and startup/window umbrella rows overlap specific groups; configuration precedence and reset recovery remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F23.S01](#feature/F23?item=F23.S01) | Allocate memory and processing resources for block validation. | Keep |
| [F23.S02](#feature/F23?item=F23.S02) | Allow external tools to communicate with the node through RPC. | Keep |
| [F23.S03](#feature/F23?item=F23.S03) | Choose whether unconfirmed change is available for spending. | Keep |
| [F23.S04](#feature/F23?item=F23.S04) | Set the default treatment of fees in recipient amounts. | Keep |
| [F23.S05](#feature/F23?item=F23.S05) | Choose whether advanced transaction controls are available. | Keep |
| [F23.S06](#feature/F23?item=F23.S06) | Choose the interface language and amount units: BTC, mBTC, bits, or satoshis. | O03 |
| [F23.S07](#feature/F23?item=F23.S07) | Customize the font used to display wallet balances. | Keep |
| [F23.S08](#feature/F23?item=F23.S08) | Choose external services for inspecting transactions. | K08 |
| [F23.S09](#feature/F23?item=F23.S09) | Configure startup and window behavior. | O06 |
| [F23.S10](#feature/F23?item=F23.S10) | Manage advanced application configuration. | Keep |
| [F23.S11](#feature/F23?item=F23.S11) | Understand which settings take precedence and which changes require a restart. | Keep |
| [F23.S12](#feature/F23?item=F23.S12) | Restore default preferences while retaining a backup of previous settings. | Keep |

### F24 — System Tray / macOS Dock

Visibility, quick actions and Quit overlap windows/navigation/lifecycle groups; tray availability and preference remain explicit.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F24.S01](#feature/F24?item=F24.S01) | Keep the application accessible while its main window is hidden. | Keep |
| [F24.S02](#feature/F24?item=F24.S02) | Control application visibility without interrupting the node. | D07 |
| [F24.S03](#feature/F24?item=F24.S03) | Quickly access payments, message signing and verification, settings, and diagnostics. | O07 |
| [F24.S04](#feature/F24?item=F24.S04) | Quit the application. | D08 |
| [F24.S05](#feature/F24?item=F24.S05) | Choose whether to display a tray icon on supported desktops. | O06 |

### F25 — Desktop Notifications

Payment-notification contents belong with their notification outcome; fallback, severity channels and flood suppression remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F25.S01](#feature/F25?item=F25.S01) | Receive updates about incoming and outgoing payments. | O09 |
| [F25.S02](#feature/F25?item=F25.S02) | Identify the affected transaction and wallet, including amounts and recipient information. | O09 |
| [F25.S03](#feature/F25?item=F25.S03) | Receive informational, warning, and critical messages through desktop notifications. | Keep |
| [F25.S04](#feature/F25?item=F25.S04) | Receive critical error messages when desktop notifications are unavailable. | Keep |
| [F25.S05](#feature/F25?item=F25.S05) | Avoid a flood of notifications while historical wallet activity is being loaded. | Keep |

### F26 — Manage Application Windows

Background operation repeats tray wording; network identity overlaps Desktop Integration; geometry and concurrent diagnostics remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F26.S01](#feature/F26?item=F26.S01) | Arrange, hide, and restore application windows. | Keep |
| [F26.S02](#feature/F26?item=F26.S02) | Remember the main window placement between sessions. | Keep |
| [F26.S03](#feature/F26?item=F26.S03) | Keep the node running while the main window is minimized or closed, where supported. | D07, O06 |
| [F26.S04](#feature/F26?item=F26.S04) | Use diagnostics alongside wallet activity. | Keep |
| [F26.S05](#feature/F26?item=F26.S05) | Identify the active wallet and network. | O10 |

### F27 — Start and Exit Application

Clean shutdown repeats tray Quit; startup modes, startup cancellation, settings recovery and session shutdown have distinct contracts.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F27.S01](#feature/F27?item=F27.S01) | Start automatically at system login on Windows and Linux. | O06 |
| [F27.S02](#feature/F27?item=F27.S02) | Start with the main window minimized. | O06 |
| [F27.S03](#feature/F27?item=F27.S03) | Monitor initialization progress. | K07 |
| [F27.S04](#feature/F27?item=F27.S04) | Request an orderly shutdown during startup. | K07 |
| [F27.S05](#feature/F27?item=F27.S05) | Shut down the node cleanly. | D08, K07 |
| [F27.S06](#feature/F27?item=F27.S06) | Know when shutdown is still in progress. | K07 |
| [F27.S07](#feature/F27?item=F27.S07) | Recover unreadable settings or stop startup without changing them. | Keep |
| [F27.S08](#feature/F27?item=F27.S08) | Coordinate application shutdown with Windows session shutdown. | K07 |

### F28 — Navigate the Application

Wallet switching is repeated; broad quick access overlaps concrete navigation; keyboard access remains independently useful.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F28.S01](#feature/F28?item=F28.S01) | Move between wallet balances, payments, and transaction history. | O07 |
| [F28.S02](#feature/F28?item=F28.S02) | Switch between available wallets. | D04 |
| [F28.S03](#feature/F28?item=F28.S03) | Access address records and node diagnostics. | O07 |
| [F28.S04](#feature/F28?item=F28.S04) | Reach common wallet and application tasks quickly. | O07 |
| [F28.S05](#feature/F28?item=F28.S05) | Use keyboard shortcuts for navigation and common actions. | Keep |

### F29 — View Application Status

Sync/freshness, wallet lock status and amount units overlap other groups; connection/proxy status and contextual guidance remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F29.S01](#feature/F29?item=F29.S01) | Check connection count and whether networking is active. | Keep |
| [F29.S02](#feature/F29?item=F29.S02) | Understand synchronization progress and whether wallet information is current. | O04 |
| [F29.S03](#feature/F29?item=F29.S03) | Check whether a proxy is in use. | Keep |
| [F29.S04](#feature/F29?item=F29.S04) | Check wallet encryption, lock, and key-generation status. | O02 |
| [F29.S05](#feature/F29?item=F29.S05) | Choose the denomination used to display amounts. | O03 |
| [F29.S06](#feature/F29?item=F29.S06) | Understand available actions through contextual guidance. | Keep |

### F30 — Show Progress, Errors, and Confirmations

Synchronization estimates overlap setup/status criteria; operation results, confirmation, diagnostic detail, attention and responsiveness differ.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F30.S01](#feature/F30?item=F30.S01) | Understand operation results, warnings, and errors. | Keep |
| [F30.S02](#feature/F30?item=F30.S02) | Review important decisions before committing to an action. | Keep |
| [F30.S03](#feature/F30?item=F30.S03) | Inspect additional diagnostic information when available. | Keep |
| [F30.S04](#feature/F30?item=F30.S04) | Receive a prompt when an operation requires attention. | Keep |
| [F30.S05](#feature/F30?item=F30.S05) | Track long-running operations. | K07 |
| [F30.S06](#feature/F30?item=F30.S06) | Assess synchronization progress, processing rate, and estimated remaining work. | O04 |
| [F30.S07](#feature/F30?item=F30.S07) | Monitor background synchronization while retaining access to the application. | K07 |

### F31 — Desktop Integration and Application Help

Payment handoff and explorers are repeated; instance identity overlaps windows; appearance, throttling and help remain distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F31.S01](#feature/F31?item=F31.S01) | Open Bitcoin payment requests from other applications or by drag and drop. | D10 |
| [F31.S02](#feature/F31?item=F31.S02) | Distinguish application instances using different Bitcoin networks. | O10 |
| [F31.S03](#feature/F31?item=F31.S03) | Adapt application visuals to the desktop appearance. | Keep |
| [F31.S04](#feature/F31?item=F31.S04) | Prevent macOS background throttling from slowing initial synchronization and reindexing. | Keep |
| [F31.S05](#feature/F31?item=F31.S05) | Use external block explorers to inspect transactions. | D05 |
| [F31.S06](#feature/F31?item=F31.S06) | Access application information and command-line help. | Keep |

### F32 — Mask Wallet Values / Privacy Mode

Balance/activity concealment repeats Overview; history restriction, multiwallet scope and persistence are distinct.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F32.S01](#feature/F32?item=F32.S01) | Conceal wallet balances and recent activity. | D03 |
| [F32.S02](#feature/F32?item=F32.S02) | Restrict access to transaction history while privacy mode is active. | Keep |
| [F32.S03](#feature/F32?item=F32.S03) | Apply the privacy preference across loaded wallets. | Keep |
| [F32.S04](#feature/F32?item=F32.S04) | Remember the privacy preference between sessions. | Keep |

### F33 — Run with Wallet Functionality Disabled

Disabled-wallet mode is different from merely closing wallets; retain node controls and desktop/preferences checks for this mode.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F33.S01](#feature/F33?item=F33.S01) | Operate a node independently of wallet functionality. | K04 |
| [F33.S02](#feature/F33?item=F33.S02) | Manage node information, networking, traffic, and diagnostics. | K04 |
| [F33.S03](#feature/F33?item=F33.S03) | Retain application preferences and desktop integration without wallet features. | K04 |

### F34 — Monitor and Cancel Wallet Rescans

Rediscovery, progress reporting and cancellation are distinct rescan outcomes.

| Criterion | User outcome | Audit findings |
| --- | --- | --- |
| [F34.S01](#feature/F34?item=F34.S01) | Rediscover wallet activity from blockchain history. | K07 |
| [F34.S02](#feature/F34?item=F34.S02) | Monitor rescan progress. | K07 |
| [F34.S03](#feature/F34?item=F34.S03) | Request cancellation of an ongoing wallet rescan. | K07 |
