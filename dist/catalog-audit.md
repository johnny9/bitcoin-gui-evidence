# Implemented subfeature audit

2026-10-11 · All 203 original subfeatures across 34 groups reviewed. The current catalog has **183 criteria**, with 20 repeated or broad rows retired.

Compare user outcomes across all groups, asking whether one outcome can work while another fails. Shared screenshots, source modules or controls alone do not establish a duplicate. Preserve distinct wallet types, security requirements, lifecycle stages and interoperability checks.

**All findings applied:** the original export merge, nine further duplicate findings and twelve overlapping scopes have been implemented. Eight reviewed distinctions remain separate. These edits change how outcomes are counted and reviewed; they do not implement application features.

Evidence, source modules, tests and original IDs remain available. A merged outcome keeps its incomplete proof visible. Narrowed outcomes are assessed for their remaining scope. Old links redirect to the current criterion or show the several outcomes that replaced a broad row.

Earlier review records remain in exports and Review details. Conflicting decisions require follow-up. Acceptance of a broad old row is not copied onto several separate outcomes. Requirements inherited from an old group are preserved when the outcome moves to another group.

## Applied merges

### D01 — Export a watch-only copy

**Original rows:** [F05.S01](#feature/F05?item=F05.S01) · [F05.S02](#feature/F05?item=F05.S02)

Creating a watch-only copy and writing that copy to a file describe one export outcome.

**Implemented:** Combined file export and creation of the watch-only copy.

**Review now:** [F05.S01](#feature/F05?item=F05.S01)

### D02 — Watch-only key separation

**Original rows:** [F05.S01](#feature/F05?item=F05.S01) · [F05.S04](#feature/F05?item=F05.S04)

A copy without spending access already requires spending keys to remain separate. S04 repeats a defining property of S01.

**Implemented:** Added key separation to the same export outcome and retained its security evidence.

**Review now:** [F05.S01](#feature/F05?item=F05.S01)

### D03 — Conceal balances and activity

**Original rows:** [F07.S05](#feature/F07?item=F07.S05) · [F32.S01](#feature/F32?item=F32.S01)

Both criteria ask privacy mode to conceal balances and recent activity. Their placement in different groups adds no user outcome.

**Implemented:** Concealment is counted under Privacy Mode and linked from Wallet Overview.

**Review now:** [F32.S01](#feature/F32?item=F32.S01)

### D04 — Switch the active wallet

**Original rows:** [F02.S03](#feature/F02?item=F02.S03) · [F28.S02](#feature/F28?item=F28.S02)

Choosing which wallet to use and switching between available wallets are the same user action.

**Implemented:** Wallet switching is counted under wallet management and linked from Navigation.

**Review now:** [F02.S03](#feature/F02?item=F02.S03)

### D05 — Open a transaction in an external explorer

**Original rows:** [F16.S09](#feature/F16?item=F16.S09) · [F31.S05](#feature/F31?item=F31.S05)

Both criteria open transaction information in an external block explorer.

**Implemented:** Explorer handoff is counted under transaction history and linked from Desktop Integration.

**Review now:** [F16.S09](#feature/F16?item=F16.S09)

### D06 — Select transaction funding coins

**Original rows:** [F12.S01](#feature/F12?item=F12.S01) · [F12.S02](#feature/F12?item=F12.S02)

Selecting individual coins or groups is already a way of choosing which coins fund a transaction.

**Implemented:** Individual and group selection are combined in the funding-coins criterion.

**Review now:** [F12.S01](#feature/F12?item=F12.S01)

### D07 — Keep the node running while the window is hidden

**Original rows:** [F24.S02](#feature/F24?item=F24.S02) · [F26.S03](#feature/F26?item=F26.S03)

Both require visibility changes to leave the node running. Minimize, close-to-tray and restore are scenarios for the same outcome.

**Implemented:** Visibility changes that preserve the node are counted under application windows; desktop limits remain visible.

**Review now:** [F26.S03](#feature/F26?item=F26.S03)

### D08 — Quit cleanly

**Original rows:** [F24.S04](#feature/F24?item=F24.S04) · [F27.S05](#feature/F27?item=F27.S05)

A tray/dock Quit entry is an activation path for orderly application and node shutdown.

**Implemented:** Tray/Dock Quit is retained as a clean-shutdown test path.

**Review now:** [F27.S05](#feature/F27?item=F27.S05)

### D09 — Submit a fee increase

**Original rows:** [F17.S01](#feature/F17?item=F17.S01) · [F17.S03](#feature/F17?item=F17.S03)

Signing and submitting the replacement completes the fee increase described by S01. Neither wording establishes a separate user objective.

**Implemented:** Fee increase and signed replacement submission are one outcome.

**Review now:** [F17.S01](#feature/F17?item=F17.S01)

### D10 — Receive payment links from other applications

**Original rows:** [F10.S03](#feature/F10?item=F10.S03) · [F31.S01](#feature/F31?item=F31.S01)

Both provide desktop handoff of Bitcoin payment requests into the application. Running-instance delivery and drag-and-drop are supported variants.

**Implemented:** Desktop payment-request handoff is counted under Open Payment URI, retaining delivery variants.

**Review now:** [F10.S03](#feature/F10?item=F10.S03)

## Applied scope changes

### O01 — Receiving-address verification on a device

**Original rows:** [F08.S08](#feature/F08?item=F08.S08) · [F15.S03](#feature/F15?item=F15.S03)

F08.S08 repeats the verification part of F15.S03, which also includes generating addresses.

**Implemented:** Device verification is assessed alone under External Signer; receiving-address generation remains under Receive.

**Review now:** [F15.S03](#feature/F15?item=F15.S03) · [F08.S01](#feature/F08?item=F08.S01)

### O02 — Wallet encryption and lock status

**Original rows:** [F06.S05](#feature/F06?item=F06.S05) · [F29.S04](#feature/F29?item=F29.S04)

Encryption and lock status are repeated; F29.S04 additionally covers key-generation status.

**Implemented:** Encryption/lock status stays under F06; F29.S04 now covers only key-generation status.

**Review now:** [F06.S05](#feature/F06?item=F06.S05) · [F29.S04](#feature/F29?item=F29.S04)

### O03 — Amount display units

**Original rows:** [F23.S06](#feature/F23?item=F23.S06) · [F29.S05](#feature/F29?item=F29.S05)

Choosing the displayed denomination is contained in F23.S06 along with language selection.

**Implemented:** Language selection and amount-unit selection are separate, single-owner criteria.

**Review now:** [F23.S06](#feature/F23?item=F23.S06) · [F29.S05](#feature/F29?item=F29.S05)

### O04 — Synchronization status and wallet freshness

**Original rows:** [F20.S05](#feature/F20?item=F20.S05) · [F29.S02](#feature/F29?item=F29.S02) · [F30.S06](#feature/F30?item=F30.S06) · [F07.S04](#feature/F07?item=F07.S04)

Synchronization progress is repeated in three criteria. Processing rate, remaining work and stale wallet information add distinct conditions.

**Implemented:** Synchronization status and estimates are consolidated; wallet-freshness warnings remain separate.

**Review now:** [F20.S05](#feature/F20?item=F20.S05) · [F07.S04](#feature/F07?item=F07.S04)

### O05 — Advanced RPC commands and examples

**Original rows:** [F22.S05](#feature/F22?item=F22.S05) · [F22.S09](#feature/F22?item=F22.S09)

S09 lists command examples within S05, including descriptor import, multisig setup, rescan and PSBT combination.

**Implemented:** Advanced commands are one console capability with explicit workflow test cases; wallet context and rescan recovery remain distinct.

**Review now:** [F22.S05](#feature/F22?item=F22.S05) · [F22.S06](#feature/F22?item=F22.S06) · [F34.S01](#feature/F34?item=F34.S01)

### O06 — Startup and window preferences

**Original rows:** [F23.S09](#feature/F23?item=F23.S09) · [F24.S05](#feature/F24?item=F24.S05) · [F26.S03](#feature/F26?item=F26.S03) · [F27.S01](#feature/F27?item=F27.S01) · [F27.S02](#feature/F27?item=F27.S02)

The general startup/window preference row overlaps named outcomes for login startup, minimized startup, background operation and tray visibility.

**Implemented:** Removed the broad preference row and linked the four specific startup/window outcomes.

**Review now:** [F27.S01](#feature/F27?item=F27.S01) · [F27.S02](#feature/F27?item=F27.S02) · [F26.S03](#feature/F26?item=F26.S03) · [F24.S05](#feature/F24?item=F24.S05)

### O07 — Quick access to common tasks

**Original rows:** [F24.S03](#feature/F24?item=F24.S03) · [F28.S01](#feature/F28?item=F28.S01) · [F28.S03](#feature/F28?item=F28.S03) · [F28.S04](#feature/F28?item=F28.S04)

Tray access and general quick-access wording repeat navigation to payments, records and diagnostics. The tray location alone does not add a user goal.

**Implemented:** Removed generic quick-access rows; concrete task navigation and keyboard access remain explicit.

**Review now:** [F28.S01](#feature/F28?item=F28.S01) · [F28.S03](#feature/F28?item=F28.S03) · [F28.S05](#feature/F28?item=F28.S05)

### O08 — Fee estimate and confirmation timing

**Original rows:** [F11.S01](#feature/F11?item=F11.S01) · [F11.S03](#feature/F11?item=F11.S03)

Confirmation timing is both an input to fee selection and information the user can assess. The current short wording does not clearly distinguish them.

**Implemented:** Expected timing is part of choosing an estimated fee; no separate custom-fee timing capability was introduced.

**Review now:** [F11.S01](#feature/F11?item=F11.S01)

### O09 — Payment-notification contents

**Original rows:** [F25.S01](#feature/F25?item=F25.S01) · [F25.S02](#feature/F25?item=F25.S02)

S02 specifies the identifying information inside the payment notifications of S01.

**Implemented:** Transaction, wallet, amount and recipient context are part of the payment-notification criterion.

**Review now:** [F25.S01](#feature/F25?item=F25.S01)

### O10 — Wallet and network identity

**Original rows:** [F26.S05](#feature/F26?item=F26.S05) · [F31.S02](#feature/F31?item=F31.S02)

Network identification is repeated, but F26.S05 also identifies the active wallet and F31.S02 calls out multiple instances.

**Implemented:** Wallet identity and network identity now have separate criteria; multiple instances are a network-identity test case.

**Review now:** [F26.S05](#feature/F26?item=F26.S05) · [F31.S02](#feature/F31?item=F31.S02)

### O11 — Device authorization and payment signing

**Original rows:** [F09.S07](#feature/F09?item=F09.S07) · [F15.S04](#feature/F15?item=F15.S04)

The external-signer part of Send repeats authorization on the signing device. Local signing is a separate part of F09.S07.

**Implemented:** Send covers local-key signing; physical-device authorization remains under External Signer.

**Review now:** [F09.S07](#feature/F09?item=F09.S07) · [F15.S04](#feature/F15?item=F15.S04)

### O12 — Continue an incomplete signing workflow

**Original rows:** [F14.S06](#feature/F14?item=F14.S06) · [F15.S05](#feature/F15?item=F15.S05)

Both preserve an incompletely signed transaction for further signing; F15.S05 is the external-device variant.

**Implemented:** Incomplete-PSBT handoff is consolidated with local and device cases; actually collecting additional signatures remains distinct.

**Review now:** [F14.S06](#feature/F14?item=F14.S06) · [F14.S05](#feature/F14?item=F14.S05)

## Distinct outcomes retained

### K01 — Watch-only export versus cross-node recovery

**Original rows:** [F05.S01](#feature/F05?item=F05.S01) · [F05.S03](#feature/F05?item=F05.S03)

Producing a file does not establish that another node can restore it and monitor the same funds.

**Implemented:** Keep cross-node interoperability independently checked.

**Review now:** [F05.S01](#feature/F05?item=F05.S01) · [F05.S03](#feature/F05?item=F05.S03)

### K02 — Encrypted creation versus encrypting an existing wallet

**Original rows:** [F01.S02](#feature/F01?item=F01.S02) · [F06.S01](#feature/F06?item=F06.S01)

Protecting an existing wallet can fail independently of creating an encrypted wallet.

**Implemented:** Keep both lifecycle outcomes.

**Review now:** [F01.S02](#feature/F01?item=F01.S02) · [F06.S01](#feature/F06?item=F06.S01)

### K03 — Multiple wallets versus selecting a wallet

**Original rows:** [F02.S02](#feature/F02?item=F02.S02) · [F02.S03](#feature/F02?item=F02.S03) · [F22.S06](#feature/F22?item=F22.S06)

Keeping wallets loaded, choosing the wallet for normal activity, and targeting an RPC command have different state and failure conditions.

**Implemented:** Keep concurrency, active-wallet selection and RPC execution context separate.

**Review now:** [F02.S02](#feature/F02?item=F02.S02) · [F02.S03](#feature/F02?item=F02.S03) · [F22.S06](#feature/F22?item=F22.S06)

### K04 — No open wallet versus disabled wallet functionality

**Original rows:** [F20.S06](#feature/F20?item=F20.S06) · [F33.S01](#feature/F33?item=F33.S01) · [F33.S02](#feature/F33?item=F33.S02) · [F33.S03](#feature/F33?item=F33.S03)

A node with no open wallet still has wallet functionality available. A wallet-disabled run must retain node controls and application behavior without that subsystem.

**Implemented:** Keep the disabled-mode acceptance cases; shared screenshots are not enough to merge them.

**Review now:** [F20.S06](#feature/F20?item=F20.S06) · [F33.S01](#feature/F33?item=F33.S01) · [F33.S02](#feature/F33?item=F33.S02) · [F33.S03](#feature/F33?item=F33.S03)

### K05 — Unsigned export versus partial signing and signature collection

**Original rows:** [F09.S08](#feature/F09?item=F09.S08) · [F13.S01](#feature/F13?item=F13.S01) · [F13.S02](#feature/F13?item=F13.S02) · [F13.S03](#feature/F13?item=F13.S03) · [F13.S05](#feature/F13?item=F13.S05) · [F14.S03](#feature/F14?item=F14.S03) · [F14.S05](#feature/F14?item=F14.S05) · [F14.S06](#feature/F14?item=F14.S06)

Preparing a payment, choosing supported wallet/signature types, exporting unsigned data, preserving existing signatures and collecting additional signatures are independently fallible outcomes.

**Implemented:** Keep their contract boundaries. Use cross-references for shared payment-entry controls instead of treating a common PSBT screenshot as duplicate proof.

**Review now:** [F09.S08](#feature/F09?item=F09.S08) · [F13.S01](#feature/F13?item=F13.S01) · [F13.S02](#feature/F13?item=F13.S02) · [F13.S03](#feature/F13?item=F13.S03) · [F13.S05](#feature/F13?item=F13.S05) · [F14.S03](#feature/F14?item=F14.S03) · [F14.S05](#feature/F14?item=F14.S05) · [F14.S06](#feature/F14?item=F14.S06)

### K06 — Copying data versus saving or sharing images

**Original rows:** [F08.S03](#feature/F08?item=F08.S03) · [F08.S04](#feature/F08?item=F08.S04) · [F08.S05](#feature/F08?item=F08.S05) · [F08.S06](#feature/F08?item=F08.S06) · [F18.S05](#feature/F18?item=F18.S05) · [F19.S03](#feature/F19?item=F19.S03)

Generating a request, copying its text, exporting its QR image and sharing it are different usable capabilities. Clipboard copies of addresses or signatures involve different data contracts.

**Implemented:** Keep copying as a capability, as requested. Do not create extra criteria for the location of a Copy button.

**Review now:** [F08.S03](#feature/F08?item=F08.S03) · [F08.S04](#feature/F08?item=F08.S04) · [F08.S05](#feature/F08?item=F08.S05) · [F08.S06](#feature/F08?item=F08.S06) · [F18.S05](#feature/F18?item=F18.S05) · [F19.S03](#feature/F19?item=F19.S03)

### K07 — Progress and recovery stages

**Original rows:** [F20.S04](#feature/F20?item=F20.S04) · [F27.S03](#feature/F27?item=F27.S03) · [F27.S04](#feature/F27?item=F27.S04) · [F27.S05](#feature/F27?item=F27.S05) · [F27.S06](#feature/F27?item=F27.S06) · [F27.S08](#feature/F27?item=F27.S08) · [F30.S05](#feature/F30?item=F30.S05) · [F30.S07](#feature/F30?item=F30.S07) · [F34.S01](#feature/F34?item=F34.S01) · [F34.S02](#feature/F34?item=F34.S02) · [F34.S03](#feature/F34?item=F34.S03)

Initial application startup, chain download, shutdown and wallet rescans operate at different lifecycle stages. Reporting progress, remaining usable and cancellation can fail independently.

**Implemented:** Keep stage-specific outcomes. Treat the broad long-running-operation row as a scoped summary, not proof of every operation.

**Review now:** [F20.S04](#feature/F20?item=F20.S04) · [F27.S03](#feature/F27?item=F27.S03) · [F27.S04](#feature/F27?item=F27.S04) · [F27.S05](#feature/F27?item=F27.S05) · [F27.S06](#feature/F27?item=F27.S06) · [F27.S08](#feature/F27?item=F27.S08) · [F30.S05](#feature/F30?item=F30.S05) · [F30.S07](#feature/F30?item=F30.S07) · [F34.S01](#feature/F34?item=F34.S01) · [F34.S02](#feature/F34?item=F34.S02) · [F34.S03](#feature/F34?item=F34.S03)

### K08 — Explorer settings versus opening a transaction

**Original rows:** [F23.S08](#feature/F23?item=F23.S08) · [F16.S09](#feature/F16?item=F16.S09)

Selecting an explorer service does not prove that a transaction is handed off using the correct ID.

**Implemented:** Keep configuration and actual explorer handoff separate.

**Review now:** [F23.S08](#feature/F23?item=F23.S08) · [F16.S09](#feature/F16?item=F16.S09)

## Complete group-by-group record

Every original criterion appears below, with its current review destination. Related outcomes may appear as links in several groups but are counted once.

### F01 — Create Wallet

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F01.S01](#feature/F01?item=F01.S01) | Create a standard single-signature wallet. | [F01.S01](#feature/F01?item=F01.S01) | Kept |
| [F01.S02](#feature/F01?item=F01.S02) | Create an encrypted or unencrypted wallet containing spending keys. | [F01.S02](#feature/F01?item=F01.S02) | K02 |
| [F01.S03](#feature/F01?item=F01.S03) | Create a watch-only wallet to monitor funds without holding spending keys. | [F01.S03](#feature/F01?item=F01.S03) | Kept |
| [F01.S04](#feature/F01?item=F01.S04) | Create a blank wallet for later setup. | [F01.S04](#feature/F01?item=F01.S04) | Kept |
| [F01.S05](#feature/F01?item=F01.S05) | Create a wallet that uses an external signer, such as a hardware wallet. | [F01.S05](#feature/F01?item=F01.S05) | Kept |
| [F01.S06](#feature/F01?item=F01.S06) | Name the wallet. | [F01.S06](#feature/F01?item=F01.S06) | Kept |

### F02 — Open, Switch, and Close Wallets

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F02.S01](#feature/F02?item=F02.S01) | Open existing wallets. | [F02.S01](#feature/F02?item=F02.S01) | Kept |
| [F02.S02](#feature/F02?item=F02.S02) | Keep multiple wallets available at the same time. | [F02.S02](#feature/F02?item=F02.S02) | K03 |
| [F02.S03](#feature/F02?item=F02.S03) | Choose which wallet to use. | [F02.S03](#feature/F02?item=F02.S03) | D04, K03 |
| [F02.S04](#feature/F02?item=F02.S04) | Close individual wallets or all wallets. | [F02.S04](#feature/F02?item=F02.S04) | Kept |

### F03 — Back Up and Restore Wallet

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F03.S01](#feature/F03?item=F03.S01) | Save a wallet backup to a file. | [F03.S01](#feature/F03?item=F03.S01) | Kept |
| [F03.S02](#feature/F03?item=F03.S02) | Restore a wallet from a backup file. | [F03.S02](#feature/F03?item=F03.S02) | Kept |
| [F03.S03](#feature/F03?item=F03.S03) | Name a recovered wallet. | [F03.S03](#feature/F03?item=F03.S03) | Kept |
| [F03.S04](#feature/F03?item=F03.S04) | Recover and update a legacy wallet backup. | [F03.S04](#feature/F03?item=F03.S04) | Kept |

### F04 — Migrate Legacy Wallet

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F04.S01](#feature/F04?item=F04.S01) | Update legacy wallets to the current wallet format. | [F04.S01](#feature/F04?item=F04.S01) | Kept |
| [F04.S02](#feature/F04?item=F04.S02) | Preserve the original wallet with an automatic backup. | [F04.S02](#feature/F04?item=F04.S02) | Kept |
| [F04.S03](#feature/F04?item=F04.S03) | Preserve wallet contents, including watch-only information. | [F04.S03](#feature/F04?item=F04.S03) | Kept |
| [F04.S04](#feature/F04?item=F04.S04) | Open migrated wallets immediately or later. | [F04.S04](#feature/F04?item=F04.S04) | Kept |

### F05 — Export Watch-Only Wallet

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F05.S01](#feature/F05?item=F05.S01) | Create a copy of a wallet that can monitor its funds without spending them. | [F05.S01](#feature/F05?item=F05.S01) | D01, D02, K01 |
| [F05.S02](#feature/F05?item=F05.S02) | Export the watch-only wallet to a file. | [F05.S01](#feature/F05?item=F05.S01) | D01 |
| [F05.S03](#feature/F05?item=F05.S03) | Transfer wallet monitoring to another node. | [F05.S03](#feature/F05?item=F05.S03) | K01 |
| [F05.S04](#feature/F05?item=F05.S04) | Keep spending keys separate from a wallet used for monitoring. | [F05.S01](#feature/F05?item=F05.S01) | D02 |

### F06 — Encrypt Wallet and Manage Passphrase

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F06.S01](#feature/F06?item=F06.S01) | Protect stored spending keys with passphrase encryption. | [F06.S01](#feature/F06?item=F06.S01) | K02 |
| [F06.S02](#feature/F06?item=F06.S02) | Change the wallet passphrase. | [F06.S02](#feature/F06?item=F06.S02) | Kept |
| [F06.S03](#feature/F06?item=F06.S03) | Temporarily unlock spending keys for operations that require them. | [F06.S03](#feature/F06?item=F06.S03) | Kept |
| [F06.S04](#feature/F06?item=F06.S04) | Automatically restore the locked state after temporary access. | [F06.S04](#feature/F06?item=F06.S04) | Kept |
| [F06.S05](#feature/F06?item=F06.S05) | Check whether a wallet is encrypted and locked. | [F06.S05](#feature/F06?item=F06.S05) | O02 |
| [F06.S06](#feature/F06?item=F06.S06) | Show or hide entered passphrases. | [F06.S06](#feature/F06?item=F06.S06) | Kept |
| [F06.S07](#feature/F06?item=F06.S07) | Receive feedback on passphrase mismatches and common entry mistakes. | [F06.S07](#feature/F06?item=F06.S07) | Kept |

### F07 — View Wallet Overview

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F07.S01](#feature/F07?item=F07.S01) | View available, pending, immature mining, and total balances. | [F07.S01](#feature/F07?item=F07.S01) | Kept |
| [F07.S02](#feature/F07?item=F07.S02) | Review recent wallet activity. | [F07.S02](#feature/F07?item=F07.S02) | Kept |
| [F07.S03](#feature/F07?item=F07.S03) | Find a recent transaction in the full transaction history. | [F07.S03](#feature/F07?item=F07.S03) | Kept |
| [F07.S04](#feature/F07?item=F07.S04) | Know when wallet information may be out of date. | [F07.S04](#feature/F07?item=F07.S04) | O04 |
| [F07.S05](#feature/F07?item=F07.S05) | Conceal balances and recent activity with privacy mode. | [F32.S01](#feature/F32?item=F32.S01) | D03 |

### F08 — Receive Bitcoin / Request Payment

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F08.S01](#feature/F08?item=F08.S01) | Generate receiving addresses using legacy, wrapped SegWit, native SegWit, or Taproot formats supported by the wallet. | [F08.S01](#feature/F08?item=F08.S01) | Kept |
| [F08.S02](#feature/F08?item=F08.S02) | Request a payment with an optional amount, label, and message. | [F08.S02](#feature/F08?item=F08.S02) | Kept |
| [F08.S03](#feature/F08?item=F08.S03) | Generate payment links and QR codes. | [F08.S03](#feature/F08?item=F08.S03) | K06 |
| [F08.S04](#feature/F08?item=F08.S04) | Copy receiving addresses, payment links, and request details to the clipboard. | [F08.S04](#feature/F08?item=F08.S04) | K06 |
| [F08.S05](#feature/F08?item=F08.S05) | Copy payment QR codes to the clipboard or save them as images. | [F08.S05](#feature/F08?item=F08.S05) | K06 |
| [F08.S06](#feature/F08?item=F08.S06) | Share QR images with other applications using drag and drop. | [F08.S06](#feature/F08?item=F08.S06) | K06 |
| [F08.S07](#feature/F08?item=F08.S07) | Review, reuse, and remove saved payment requests. | [F08.S07](#feature/F08?item=F08.S07) | Kept |
| [F08.S08](#feature/F08?item=F08.S08) | Verify receiving addresses on a compatible signing device. | [F15.S03](#feature/F15?item=F15.S03) | O01 |
| [F08.S09](#feature/F08?item=F08.S09) | Generate receiving addresses for a configured watch-only wallet. | [F08.S09](#feature/F08?item=F08.S09) | Kept |

### F09 — Send Bitcoin

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F09.S01](#feature/F09?item=F09.S01) | Pay one recipient or multiple recipients in a single transaction. | [F09.S01](#feature/F09?item=F09.S01) | Kept |
| [F09.S02](#feature/F09?item=F09.S02) | Enter or paste a recipient address, or use a saved address. | [F09.S02](#feature/F09?item=F09.S02) | Kept |
| [F09.S03](#feature/F09?item=F09.S03) | Associate recipient addresses with recognizable labels. | [F09.S03](#feature/F09?item=F09.S03) | Kept |
| [F09.S04](#feature/F09?item=F09.S04) | Send the available balance. | [F09.S04](#feature/F09?item=F09.S04) | Kept |
| [F09.S05](#feature/F09?item=F09.S05) | Deduct fees from selected recipient amounts. | [F09.S05](#feature/F09?item=F09.S05) | Kept |
| [F09.S06](#feature/F09?item=F09.S06) | Review payment details and total costs before authorizing a transaction. | [F09.S06](#feature/F09?item=F09.S06) | Kept |
| [F09.S07](#feature/F09?item=F09.S07) | Sign payments with local spending keys or a compatible external signer. | [F09.S07](#feature/F09?item=F09.S07), [F15.S04](#feature/F15?item=F15.S04) | O11 |
| [F09.S08](#feature/F09?item=F09.S08) | Prepare a payment from a watch-only wallet for signing elsewhere. | [F09.S08](#feature/F09?item=F09.S08) | K05 |
| [F09.S09](#feature/F09?item=F09.S09) | Check payment details and available funds before sending. | [F09.S09](#feature/F09?item=F09.S09) | Kept |

### F10 — Open Payment URI

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F10.S01](#feature/F10?item=F10.S01) | Open or paste Bitcoin payment links. | [F10.S01](#feature/F10?item=F10.S01) | Kept |
| [F10.S02](#feature/F10?item=F10.S02) | Prepare a payment using the requested recipient, amount, and descriptive information. | [F10.S02](#feature/F10?item=F10.S02) | Kept |
| [F10.S03](#feature/F10?item=F10.S03) | Handle payment requests from other applications, including while Bitcoin Core is already running. | [F10.S03](#feature/F10?item=F10.S03) | D10 |

### F11 — Choose Transaction Fee

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F11.S01](#feature/F11?item=F11.S01) | Choose an estimated fee based on the desired confirmation speed. | [F11.S01](#feature/F11?item=F11.S01) | O08 |
| [F11.S02](#feature/F11?item=F11.S02) | Set a custom fee rate. | [F11.S02](#feature/F11?item=F11.S02) | Kept |
| [F11.S03](#feature/F11?item=F11.S03) | Assess expected confirmation timing. | [F11.S01](#feature/F11?item=F11.S01) | O08 |
| [F11.S04](#feature/F11?item=F11.S04) | Know when a fee estimate is unavailable. | [F11.S04](#feature/F11?item=F11.S04) | Kept |

### F12 — Select Coins / Coin Control

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F12.S01](#feature/F12?item=F12.S01) | Choose which coins fund a transaction. | [F12.S01](#feature/F12?item=F12.S01) | D06 |
| [F12.S02](#feature/F12?item=F12.S02) | Select individual coins or groups of coins. | [F12.S01](#feature/F12?item=F12.S01) | D06 |
| [F12.S03](#feature/F12?item=F12.S03) | Inspect coins individually or grouped by address. | [F12.S03](#feature/F12?item=F12.S03) | Kept |
| [F12.S04](#feature/F12?item=F12.S04) | Compare coins by amount, address, label, age, and confirmations. | [F12.S04](#feature/F12?item=F12.S04) | Kept |
| [F12.S05](#feature/F12?item=F12.S05) | Control spending eligibility by locking or unlocking coins. | [F12.S05](#feature/F12?item=F12.S05) | Kept |
| [F12.S06](#feature/F12?item=F12.S06) | Copy coin addresses, labels, amounts, identifiers, and transaction estimates to the clipboard. | [F12.S06](#feature/F12?item=F12.S06) | Kept |
| [F12.S07](#feature/F12?item=F12.S07) | Review the selected funds, expected fees, and change. | [F12.S07](#feature/F12?item=F12.S07) | Kept |
| [F12.S08](#feature/F12?item=F12.S08) | Choose where transaction change is returned. | [F12.S08](#feature/F12?item=F12.S08) | Kept |
| [F12.S09](#feature/F12?item=F12.S09) | Receive a warning when a change destination is not recognized as spendable by the wallet. | [F12.S09](#feature/F12?item=F12.S09) | Kept |

### F13 — Create and Export PSBT

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F13.S01](#feature/F13?item=F13.S01) | Prepare a transaction for later signing. | [F13.S01](#feature/F13?item=F13.S01) | K05 |
| [F13.S02](#feature/F13?item=F13.S02) | Create transactions from watch-only wallets or wallets containing spending keys. | [F13.S02](#feature/F13?item=F13.S02) | K05 |
| [F13.S03](#feature/F13?item=F13.S03) | Use single-signature or previously configured multisig wallets. | [F13.S03](#feature/F13?item=F13.S03) | K05 |
| [F13.S04](#feature/F13?item=F13.S04) | Choose recipients, fees, and coins for the proposed transaction. | [F13.S04](#feature/F13?item=F13.S04) | Kept |
| [F13.S05](#feature/F13?item=F13.S05) | Copy an unsigned PSBT to the clipboard or save it to a file for signing elsewhere. | [F13.S05](#feature/F13?item=F13.S05) | K05 |

### F14 — Import, Sign, and Broadcast PSBT

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F14.S01](#feature/F14?item=F14.S01) | Import a PSBT from a file or the clipboard. | [F14.S01](#feature/F14?item=F14.S01) | Kept |
| [F14.S02](#feature/F14?item=F14.S02) | Review recipients, amounts, available fee information, and signing progress. | [F14.S02](#feature/F14?item=F14.S02) | Kept |
| [F14.S03](#feature/F14?item=F14.S03) | Process single-signature and multisig transactions when the required keys and transaction information are available. | [F14.S03](#feature/F14?item=F14.S03) | K05 |
| [F14.S04](#feature/F14?item=F14.S04) | Sign with local wallets, including encrypted wallets after unlocking. | [F14.S04](#feature/F14?item=F14.S04) | Kept |
| [F14.S05](#feature/F14?item=F14.S05) | Collect additional signatures by passing a transaction between signers. | [F14.S05](#feature/F14?item=F14.S05) | K05 |
| [F14.S06](#feature/F14?item=F14.S06) | Copy a partially signed PSBT to the clipboard or save it to a file for further signing. | [F14.S06](#feature/F14?item=F14.S06) | O12, K05 |
| [F14.S07](#feature/F14?item=F14.S07) | Finalize and broadcast a transaction once sufficient signatures are present. | [F14.S07](#feature/F14?item=F14.S07) | Kept |
| [F14.S08](#feature/F14?item=F14.S08) | Inspect transactions and broadcast fully signed transactions without opening a wallet. | [F14.S08](#feature/F14?item=F14.S08) | Kept |

### F15 — Use Hardware Wallet / External Signer

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F15.S01](#feature/F15?item=F15.S01) | Connect a wallet to a compatible external signer. | [F15.S01](#feature/F15?item=F15.S01) | Kept |
| [F15.S02](#feature/F15?item=F15.S02) | Keep spending keys on the signing device. | [F15.S02](#feature/F15?item=F15.S02) | Kept |
| [F15.S03](#feature/F15?item=F15.S03) | Generate receiving addresses and verify them on the device. | [F15.S03](#feature/F15?item=F15.S03), [F08.S01](#feature/F08?item=F08.S01) | O01 |
| [F15.S04](#feature/F15?item=F15.S04) | Authorize outgoing payments using the device. | [F15.S04](#feature/F15?item=F15.S04) | O11 |
| [F15.S05](#feature/F15?item=F15.S05) | Continue a signing workflow when additional signatures are needed. Signing workflow. | [F14.S06](#feature/F14?item=F14.S06) | O12 |

### F16 — Browse and Export Transaction History

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F16.S01](#feature/F16?item=F16.S01) | Review incoming, outgoing, mined, and other transactions. | [F16.S01](#feature/F16?item=F16.S01) | Kept |
| [F16.S02](#feature/F16?item=F16.S02) | Filter transactions by date, type, or minimum amount. | [F16.S02](#feature/F16?item=F16.S02) | Kept |
| [F16.S03](#feature/F16?item=F16.S03) | Search by address, transaction ID, or label, and sort transaction history. | [F16.S03](#feature/F16?item=F16.S03) | Kept |
| [F16.S04](#feature/F16?item=F16.S04) | View confirmation, conflict, abandonment, and mining-maturity status. Transaction states. | [F16.S04](#feature/F16?item=F16.S04) | Kept |
| [F16.S05](#feature/F16?item=F16.S05) | Inspect transaction costs, balance changes, confirmation details, and transaction data. Transaction details. | [F16.S05](#feature/F16?item=F16.S05) | Kept |
| [F16.S06](#feature/F16?item=F16.S06) | Copy addresses, amounts, transaction IDs, transaction details, and raw transaction data to the clipboard. | [F16.S06](#feature/F16?item=F16.S06) | Kept |
| [F16.S07](#feature/F16?item=F16.S07) | Update address labels associated with transactions. | [F16.S07](#feature/F16?item=F16.S07) | Kept |
| [F16.S08](#feature/F16?item=F16.S08) | Export filtered transaction history as CSV for record keeping or analysis. | [F16.S08](#feature/F16?item=F16.S08) | Kept |
| [F16.S09](#feature/F16?item=F16.S09) | Inspect transactions in external block explorers. | [F16.S09](#feature/F16?item=F16.S09) | D05, K08 |

### F17 — Manage Unconfirmed Transactions

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F17.S01](#feature/F17?item=F17.S01) | Increase the fee of an eligible transaction to improve its confirmation prospects. | [F17.S01](#feature/F17?item=F17.S01) | D09 |
| [F17.S02](#feature/F17?item=F17.S02) | Review the additional cost before authorizing a fee increase. | [F17.S02](#feature/F17?item=F17.S02) | Kept |
| [F17.S03](#feature/F17?item=F17.S03) | Sign and submit a replacement transaction. | [F17.S01](#feature/F17?item=F17.S01) | D09 |
| [F17.S04](#feature/F17?item=F17.S04) | Create a fee-bump PSBT and copy it to the clipboard for signing elsewhere. | [F17.S04](#feature/F17?item=F17.S04) | Kept |
| [F17.S05](#feature/F17?item=F17.S05) | Abandon eligible transactions so their inputs can be used for another spend. | [F17.S05](#feature/F17?item=F17.S05) | Kept |

### F18 — Manage Address Book

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F18.S01](#feature/F18?item=F18.S01) | Keep records of sending and receiving addresses. | [F18.S01](#feature/F18?item=F18.S01) | Kept |
| [F18.S02](#feature/F18?item=F18.S02) | Add, update, and remove saved recipients. | [F18.S02](#feature/F18?item=F18.S02) | Kept |
| [F18.S03](#feature/F18?item=F18.S03) | Label receiving addresses. | [F18.S03](#feature/F18?item=F18.S03) | Kept |
| [F18.S04](#feature/F18?item=F18.S04) | Search and sort saved addresses by address or label. | [F18.S04](#feature/F18?item=F18.S04) | Kept |
| [F18.S05](#feature/F18?item=F18.S05) | Copy saved addresses and labels to the clipboard. | [F18.S05](#feature/F18?item=F18.S05) | K06 |
| [F18.S06](#feature/F18?item=F18.S06) | Export address records as CSV. | [F18.S06](#feature/F18?item=F18.S06) | Kept |

### F19 — Sign and Verify Messages

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F19.S01](#feature/F19?item=F19.S01) | Sign a message to demonstrate control of a Bitcoin address. | [F19.S01](#feature/F19?item=F19.S01) | Kept |
| [F19.S02](#feature/F19?item=F19.S02) | Verify that a message was signed by the holder of the corresponding key. | [F19.S02](#feature/F19?item=F19.S02) | Kept |
| [F19.S03](#feature/F19?item=F19.S03) | Copy the resulting signature to the clipboard. | [F19.S03](#feature/F19?item=F19.S03) | K06 |

### F20 — Set Up and Synchronize Node

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F20.S01](#feature/F20?item=F20.S01) | Choose where node and wallet data are stored. | [F20.S01](#feature/F20?item=F20.S01) | Kept |
| [F20.S02](#feature/F20?item=F20.S02) | Limit blockchain storage through pruning. | [F20.S02](#feature/F20?item=F20.S02) | Kept |
| [F20.S03](#feature/F20?item=F20.S03) | Assess available storage, expected requirements, and the effect of pruning on wallet recovery. | [F20.S03](#feature/F20?item=F20.S03) | Kept |
| [F20.S04](#feature/F20?item=F20.S04) | Download and validate the blockchain. | [F20.S04](#feature/F20?item=F20.S04) | K07 |
| [F20.S05](#feature/F20?item=F20.S05) | Monitor synchronization progress and how far the node is behind. | [F20.S05](#feature/F20?item=F20.S05) | O04 |
| [F20.S06](#feature/F20?item=F20.S06) | Operate the node without an open wallet. | [F20.S06](#feature/F20?item=F20.S06) | K04 |
| [F20.S07](#feature/F20?item=F20.S07) | Use mainnet, testnet, testnet4, signet, or regtest. Network support. | [F20.S07](#feature/F20?item=F20.S07) | Kept |

### F21 — Configure Network and Manage Peers

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F21.S01](#feature/F21?item=F21.S01) | Enable or pause peer-to-peer networking. | [F21.S01](#feature/F21?item=F21.S01) | Kept |
| [F21.S02](#feature/F21?item=F21.S02) | Allow incoming peer connections. | [F21.S02](#feature/F21?item=F21.S02) | Kept |
| [F21.S03](#feature/F21?item=F21.S03) | Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support. | [F21.S03](#feature/F21?item=F21.S03) | Kept |
| [F21.S04](#feature/F21?item=F21.S04) | Automatically configure router access for incoming connections where supported. | [F21.S04](#feature/F21?item=F21.S04) | Kept |
| [F21.S05](#feature/F21?item=F21.S05) | Inspect peer connectivity, performance, synchronization, and relay behavior. | [F21.S05](#feature/F21?item=F21.S05) | Kept |
| [F21.S06](#feature/F21?item=F21.S06) | Check whether peer connections use encrypted transport. | [F21.S06](#feature/F21?item=F21.S06) | Kept |
| [F21.S07](#feature/F21?item=F21.S07) | Sort peers, copy peer addresses to the clipboard, and disconnect unwanted peers. | [F21.S07](#feature/F21?item=F21.S07) | Kept |
| [F21.S08](#feature/F21?item=F21.S08) | Temporarily ban peers, review existing bans, and restore access. | [F21.S08](#feature/F21?item=F21.S08) | Kept |
| [F21.S09](#feature/F21?item=F21.S09) | Copy banned addresses and network ranges to the clipboard. | [F21.S09](#feature/F21?item=F21.S09) | Kept |

### F22 — Inspect Node and Use RPC Console

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F22.S01](#feature/F22?item=F22.S01) | Inspect node identity, network, synchronization, and mempool information. | [F22.S01](#feature/F22?item=F22.S01) | Kept |
| [F22.S02](#feature/F22?item=F22.S02) | Monitor network traffic and data usage over time. | [F22.S02](#feature/F22?item=F22.S02) | Kept |
| [F22.S03](#feature/F22?item=F22.S03) | Focus traffic monitoring on a chosen time period or begin a fresh observation. | [F22.S03](#feature/F22?item=F22.S03) | Kept |
| [F22.S04](#feature/F22?item=F22.S04) | Inspect logs for troubleshooting. | [F22.S04](#feature/F22?item=F22.S04) | Kept |
| [F22.S05](#feature/F22?item=F22.S05) | Run advanced node and wallet commands. | [F22.S05](#feature/F22?item=F22.S05) | O05 |
| [F22.S06](#feature/F22?item=F22.S06) | Choose which wallet an advanced operation applies to. | [F22.S06](#feature/F22?item=F22.S06) | K03 |
| [F22.S07](#feature/F22?item=F22.S07) | Use command history, completion, and help. | [F22.S07](#feature/F22?item=F22.S07) | Kept |
| [F22.S08](#feature/F22?item=F22.S08) | Adjust console readability and clear previous output. | [F22.S08](#feature/F22?item=F22.S08) | Kept |
| [F22.S09](#feature/F22?item=F22.S09) | Use RPC for descriptor import, multisig setup, wallet rescans, and combining PSBTs. | [F22.S05](#feature/F22?item=F22.S05) | O05 |

### F23 — Configure Application Preferences

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F23.S01](#feature/F23?item=F23.S01) | Allocate memory and processing resources for block validation. | [F23.S01](#feature/F23?item=F23.S01) | Kept |
| [F23.S02](#feature/F23?item=F23.S02) | Allow external tools to communicate with the node through RPC. | [F23.S02](#feature/F23?item=F23.S02) | Kept |
| [F23.S03](#feature/F23?item=F23.S03) | Choose whether unconfirmed change is available for spending. | [F23.S03](#feature/F23?item=F23.S03) | Kept |
| [F23.S04](#feature/F23?item=F23.S04) | Set the default treatment of fees in recipient amounts. | [F23.S04](#feature/F23?item=F23.S04) | Kept |
| [F23.S05](#feature/F23?item=F23.S05) | Choose whether advanced transaction controls are available. | [F23.S05](#feature/F23?item=F23.S05) | Kept |
| [F23.S06](#feature/F23?item=F23.S06) | Choose the interface language and amount units: BTC, mBTC, bits, or satoshis. | [F23.S06](#feature/F23?item=F23.S06), [F29.S05](#feature/F29?item=F29.S05) | O03 |
| [F23.S07](#feature/F23?item=F23.S07) | Customize the font used to display wallet balances. | [F23.S07](#feature/F23?item=F23.S07) | Kept |
| [F23.S08](#feature/F23?item=F23.S08) | Choose external services for inspecting transactions. | [F23.S08](#feature/F23?item=F23.S08) | K08 |
| [F23.S09](#feature/F23?item=F23.S09) | Configure startup and window behavior. | [F27.S01](#feature/F27?item=F27.S01), [F27.S02](#feature/F27?item=F27.S02), [F26.S03](#feature/F26?item=F26.S03), [F24.S05](#feature/F24?item=F24.S05) | O06 |
| [F23.S10](#feature/F23?item=F23.S10) | Manage advanced application configuration. | [F23.S10](#feature/F23?item=F23.S10) | Kept |
| [F23.S11](#feature/F23?item=F23.S11) | Understand which settings take precedence and which changes require a restart. | [F23.S11](#feature/F23?item=F23.S11) | Kept |
| [F23.S12](#feature/F23?item=F23.S12) | Restore default preferences while retaining a backup of previous settings. | [F23.S12](#feature/F23?item=F23.S12) | Kept |

### F24 — System Tray / macOS Dock

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F24.S01](#feature/F24?item=F24.S01) | Keep the application accessible while its main window is hidden. | [F24.S01](#feature/F24?item=F24.S01) | Kept |
| [F24.S02](#feature/F24?item=F24.S02) | Control application visibility without interrupting the node. | [F26.S03](#feature/F26?item=F26.S03) | D07 |
| [F24.S03](#feature/F24?item=F24.S03) | Quickly access payments, message signing and verification, settings, and diagnostics. | [F28.S01](#feature/F28?item=F28.S01), [F28.S03](#feature/F28?item=F28.S03) | O07 |
| [F24.S04](#feature/F24?item=F24.S04) | Quit the application. | [F27.S05](#feature/F27?item=F27.S05) | D08 |
| [F24.S05](#feature/F24?item=F24.S05) | Choose whether to display a tray icon on supported desktops. | [F24.S05](#feature/F24?item=F24.S05) | O06 |

### F25 — Desktop Notifications

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F25.S01](#feature/F25?item=F25.S01) | Receive updates about incoming and outgoing payments. | [F25.S01](#feature/F25?item=F25.S01) | O09 |
| [F25.S02](#feature/F25?item=F25.S02) | Identify the affected transaction and wallet, including amounts and recipient information. | [F25.S01](#feature/F25?item=F25.S01) | O09 |
| [F25.S03](#feature/F25?item=F25.S03) | Receive informational, warning, and critical messages through desktop notifications. | [F25.S03](#feature/F25?item=F25.S03) | Kept |
| [F25.S04](#feature/F25?item=F25.S04) | Receive critical error messages when desktop notifications are unavailable. | [F25.S04](#feature/F25?item=F25.S04) | Kept |
| [F25.S05](#feature/F25?item=F25.S05) | Avoid a flood of notifications while historical wallet activity is being loaded. | [F25.S05](#feature/F25?item=F25.S05) | Kept |

### F26 — Manage Application Windows

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F26.S01](#feature/F26?item=F26.S01) | Arrange, hide, and restore application windows. | [F26.S01](#feature/F26?item=F26.S01) | Kept |
| [F26.S02](#feature/F26?item=F26.S02) | Remember the main window placement between sessions. | [F26.S02](#feature/F26?item=F26.S02) | Kept |
| [F26.S03](#feature/F26?item=F26.S03) | Keep the node running while the main window is minimized or closed, where supported. | [F26.S03](#feature/F26?item=F26.S03) | D07, O06 |
| [F26.S04](#feature/F26?item=F26.S04) | Use diagnostics alongside wallet activity. | [F26.S04](#feature/F26?item=F26.S04) | Kept |
| [F26.S05](#feature/F26?item=F26.S05) | Identify the active wallet and network. | [F26.S05](#feature/F26?item=F26.S05), [F31.S02](#feature/F31?item=F31.S02) | O10 |

### F27 — Start and Exit Application

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F27.S01](#feature/F27?item=F27.S01) | Start automatically at system login on Windows and Linux. | [F27.S01](#feature/F27?item=F27.S01) | O06 |
| [F27.S02](#feature/F27?item=F27.S02) | Start with the main window minimized. | [F27.S02](#feature/F27?item=F27.S02) | O06 |
| [F27.S03](#feature/F27?item=F27.S03) | Monitor initialization progress. | [F27.S03](#feature/F27?item=F27.S03) | K07 |
| [F27.S04](#feature/F27?item=F27.S04) | Request an orderly shutdown during startup. | [F27.S04](#feature/F27?item=F27.S04) | K07 |
| [F27.S05](#feature/F27?item=F27.S05) | Shut down the node cleanly. | [F27.S05](#feature/F27?item=F27.S05) | D08, K07 |
| [F27.S06](#feature/F27?item=F27.S06) | Know when shutdown is still in progress. | [F27.S06](#feature/F27?item=F27.S06) | K07 |
| [F27.S07](#feature/F27?item=F27.S07) | Recover unreadable settings or stop startup without changing them. | [F27.S07](#feature/F27?item=F27.S07) | Kept |
| [F27.S08](#feature/F27?item=F27.S08) | Coordinate application shutdown with Windows session shutdown. | [F27.S08](#feature/F27?item=F27.S08) | K07 |

### F28 — Navigate the Application

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F28.S01](#feature/F28?item=F28.S01) | Move between wallet balances, payments, and transaction history. | [F28.S01](#feature/F28?item=F28.S01) | O07 |
| [F28.S02](#feature/F28?item=F28.S02) | Switch between available wallets. | [F02.S03](#feature/F02?item=F02.S03) | D04 |
| [F28.S03](#feature/F28?item=F28.S03) | Access address records and node diagnostics. | [F28.S03](#feature/F28?item=F28.S03) | O07 |
| [F28.S04](#feature/F28?item=F28.S04) | Reach common wallet and application tasks quickly. | [F28.S01](#feature/F28?item=F28.S01), [F28.S03](#feature/F28?item=F28.S03) | O07 |
| [F28.S05](#feature/F28?item=F28.S05) | Use keyboard shortcuts for navigation and common actions. | [F28.S05](#feature/F28?item=F28.S05) | Kept |

### F29 — View Application Status

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F29.S01](#feature/F29?item=F29.S01) | Check connection count and whether networking is active. | [F29.S01](#feature/F29?item=F29.S01) | Kept |
| [F29.S02](#feature/F29?item=F29.S02) | Understand synchronization progress and whether wallet information is current. | [F20.S05](#feature/F20?item=F20.S05), [F07.S04](#feature/F07?item=F07.S04) | O04 |
| [F29.S03](#feature/F29?item=F29.S03) | Check whether a proxy is in use. | [F29.S03](#feature/F29?item=F29.S03) | Kept |
| [F29.S04](#feature/F29?item=F29.S04) | Check wallet encryption, lock, and key-generation status. | [F29.S04](#feature/F29?item=F29.S04), [F06.S05](#feature/F06?item=F06.S05) | O02 |
| [F29.S05](#feature/F29?item=F29.S05) | Choose the denomination used to display amounts. | [F29.S05](#feature/F29?item=F29.S05) | O03 |
| [F29.S06](#feature/F29?item=F29.S06) | Understand available actions through contextual guidance. | [F29.S06](#feature/F29?item=F29.S06) | Kept |

### F30 — Show Progress, Errors, and Confirmations

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F30.S01](#feature/F30?item=F30.S01) | Understand operation results, warnings, and errors. | [F30.S01](#feature/F30?item=F30.S01) | Kept |
| [F30.S02](#feature/F30?item=F30.S02) | Review important decisions before committing to an action. | [F30.S02](#feature/F30?item=F30.S02) | Kept |
| [F30.S03](#feature/F30?item=F30.S03) | Inspect additional diagnostic information when available. | [F30.S03](#feature/F30?item=F30.S03) | Kept |
| [F30.S04](#feature/F30?item=F30.S04) | Receive a prompt when an operation requires attention. | [F30.S04](#feature/F30?item=F30.S04) | Kept |
| [F30.S05](#feature/F30?item=F30.S05) | Track long-running operations. | [F30.S05](#feature/F30?item=F30.S05) | K07 |
| [F30.S06](#feature/F30?item=F30.S06) | Assess synchronization progress, processing rate, and estimated remaining work. | [F20.S05](#feature/F20?item=F20.S05) | O04 |
| [F30.S07](#feature/F30?item=F30.S07) | Monitor background synchronization while retaining access to the application. | [F30.S07](#feature/F30?item=F30.S07) | K07 |

### F31 — Desktop Integration and Application Help

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F31.S01](#feature/F31?item=F31.S01) | Open Bitcoin payment requests from other applications or by drag and drop. | [F10.S03](#feature/F10?item=F10.S03) | D10 |
| [F31.S02](#feature/F31?item=F31.S02) | Distinguish application instances using different Bitcoin networks. | [F31.S02](#feature/F31?item=F31.S02) | O10 |
| [F31.S03](#feature/F31?item=F31.S03) | Adapt application visuals to the desktop appearance. | [F31.S03](#feature/F31?item=F31.S03) | Kept |
| [F31.S04](#feature/F31?item=F31.S04) | Prevent macOS background throttling from slowing initial synchronization and reindexing. | [F31.S04](#feature/F31?item=F31.S04) | Kept |
| [F31.S05](#feature/F31?item=F31.S05) | Use external block explorers to inspect transactions. | [F16.S09](#feature/F16?item=F16.S09) | D05 |
| [F31.S06](#feature/F31?item=F31.S06) | Access application information and command-line help. | [F31.S06](#feature/F31?item=F31.S06) | Kept |

### F32 — Mask Wallet Values / Privacy Mode

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F32.S01](#feature/F32?item=F32.S01) | Conceal wallet balances and recent activity. | [F32.S01](#feature/F32?item=F32.S01) | D03 |
| [F32.S02](#feature/F32?item=F32.S02) | Restrict access to transaction history while privacy mode is active. | [F32.S02](#feature/F32?item=F32.S02) | Kept |
| [F32.S03](#feature/F32?item=F32.S03) | Apply the privacy preference across loaded wallets. | [F32.S03](#feature/F32?item=F32.S03) | Kept |
| [F32.S04](#feature/F32?item=F32.S04) | Remember the privacy preference between sessions. | [F32.S04](#feature/F32?item=F32.S04) | Kept |

### F33 — Run with Wallet Functionality Disabled

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F33.S01](#feature/F33?item=F33.S01) | Operate a node independently of wallet functionality. | [F33.S01](#feature/F33?item=F33.S01) | K04 |
| [F33.S02](#feature/F33?item=F33.S02) | Manage node information, networking, traffic, and diagnostics. | [F33.S02](#feature/F33?item=F33.S02) | K04 |
| [F33.S03](#feature/F33?item=F33.S03) | Retain application preferences and desktop integration without wallet features. | [F33.S03](#feature/F33?item=F33.S03) | K04 |

### F34 — Monitor and Cancel Wallet Rescans

| Original criterion | Original user outcome | Review now | Findings |
| --- | --- | --- | --- |
| [F34.S01](#feature/F34?item=F34.S01) | Rediscover wallet activity from blockchain history. | [F34.S01](#feature/F34?item=F34.S01) | K07 |
| [F34.S02](#feature/F34?item=F34.S02) | Monitor rescan progress. | [F34.S02](#feature/F34?item=F34.S02) | K07 |
| [F34.S03](#feature/F34?item=F34.S03) | Request cancellation of an ongoing wallet rescan. | [F34.S03](#feature/F34?item=F34.S03) | K07 |
