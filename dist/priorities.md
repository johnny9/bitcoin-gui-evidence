# Subfeature priorities

Relative planning priority based on the user outcome, potential harm, ability to access or recover funds, workflow reach, and available alternatives. Existing implementation assessments inform the reasons. Lower numbers mean higher priority. Ranks are editorial judgments, not project commitments, effort estimates, vulnerability severity, or new test evidence. Implementation status, evidence coverage, acceptance and personal merge/release scope remain separate.

Priority sorts by numeric rank ascending, then subfeature ID. Incomplete first sorts partial and not-implemented outcomes together before parity outcomes, then by priority and ID. Partial and missing status alone do not change criticality. In Groups view the highest-ranked matching subfeature under the selected sort determines group order; ties use group ID. Conditional safeguards must ship with the capability they protect; priority order is not a dependency schedule.

| Rank | Priority | Meaning |
| --- | --- | --- |
| P1 | Safety and recovery | Protect keys and funds, prevent unintended irreversible actions, or restore access after loss. |
| P2 | Core workflow | Enable dependable everyday use, correct financial information, essential custody workflows, or reliable startup and shutdown. |
| P3 | Important capability | Support privacy, advanced workflows, accessibility, configuration, or practical operation when a basic path exists. |
| P4 | Workflow improvement | Improve efficiency, organization, discovery, or integrations with usable alternatives. |
| P5 | Convenience | Add presentation preferences, shortcuts, or polish with limited impact on completing the user goal. |

## Incomplete subfeatures, highest priority first

These are planning judgments, not release requirements or new application test results. Equal ranks use subfeature ID order. Conditional safeguards must be delivered with the capability they protect.

| Subfeature | User outcome | Implementation | Priority | Reason |
| --- | --- | --- | --- | --- |
| [F03.S04](index.html#feature/F03?item=F03.S04) | Recover and update a legacy wallet backup. | not-implemented | P1 | Legacy backup recovery can be the only practical GUI path back to funds; migration guidance alone does not recover them. |
| [F12.S09](index.html#feature/F12?item=F12.S09) | Receive a warning when a change destination is not recognized as spendable by the wallet. | not-implemented | P1 | A non-wallet change address can send change outside the user's control; this warning is required when custom change is introduced, not evidence of a current exposed path. |
| [F15.S03](index.html#feature/F15?item=F15.S03) | Verify a receiving address on a compatible signing device. | not-implemented | P1 | Device verification lets users check the receiving destination independently of the host display before sending funds to it. |
| [F06.S05](index.html#feature/F06?item=F06.S05) | Check whether a wallet is encrypted and locked. | partial | P2 | Users need to know whether keys are currently unlocked; the missing state display weakens security awareness. |
| [F07.S01](index.html#feature/F07?item=F07.S01) | View available, pending, immature mining, and total balances. | partial | P2 | Accurate balances guide spending decisions; the recorded stale balance after mining maturity is a real correctness gap. |
| [F13.S02](index.html#feature/F13?item=F13.S02) | Create transactions from watch-only wallets or wallets containing spending keys. | partial | P2 | The remaining partial-key multisig gap blocks transaction preparation for affected custody setups. |
| [F13.S03](index.html#feature/F13?item=F13.S03) | Use single-signature or previously configured multisig wallets. | partial | P2 | Configured multisig users need a complete preparation path, including wallets with only some local keys. |
| [F14.S01](index.html#feature/F14?item=F14.S01) | Import a PSBT from a file or the clipboard. | partial | P2 | Import restrictions can block otherwise usable transactions from other signing tools. |
| [F14.S03](index.html#feature/F14?item=F14.S03) | Process single-signature and multisig transactions when the required keys and transaction information are available. | partial | P2 | Incomplete multisig support prevents affected users from processing their custody transactions. |
| [F14.S04](index.html#feature/F14?item=F14.S04) | Sign with local wallets, including encrypted wallets after unlocking. | partial | P2 | Adding local partial signatures is necessary for the missing multisig spending workflow. |
| [F14.S05](index.html#feature/F14?item=F14.S05) | Collect additional signatures by passing a transaction between signers. | not-implemented | P2 | Passing and adding signatures is essential to completing collaborative multisig payments. |
| [F17.S04](index.html#feature/F17?item=F17.S04) | Create a fee-bump PSBT and copy it to the clipboard for signing elsewhere. | not-implemented | P2 | External signers need a fee-bump PSBT path to resolve stuck payments without moving keys online. |
| [F17.S05](index.html#feature/F17?item=F17.S05) | Abandon eligible transactions so their inputs can be used for another spend. | not-implemented | P2 | Abandoning eligible transactions restores spendable inputs after a failed payment attempt. |
| [F23.S01](index.html#feature/F23?item=F23.S01) | Allocate memory and processing resources for block validation. | partial | P2 | The recorded cache cap rejects normal allocations and can obstruct practical node synchronization and tuning. |
| [F27.S07](index.html#feature/F27?item=F27.S07) | Recover unreadable settings or stop startup without changing them. | not-implemented | P2 | A repair-or-abort choice helps recover from settings that block startup while preserving user control over existing configuration. |
| [F27.S08](index.html#feature/F27?item=F27.S08) | Coordinate application shutdown with Windows session shutdown. | not-implemented | P2 | Windows session shutdown needs coordinated cleanup; otherwise that platform lacks the intended orderly exit path. |
| [F01.S04](index.html#feature/F01?item=F01.S04) | Create a blank wallet for later setup. | not-implemented | P3 | Blank wallets enable custom key imports and advanced custody setup; standard setup is already available. |
| [F05.S01](index.html#feature/F05?item=F05.S01) | Export a watch-only copy of a wallet for monitoring without spending access. | not-implemented | P3 | A watch-only copy enables separate monitoring while spending keys remain in the original wallet. |
| [F05.S03](index.html#feature/F05?item=F05.S03) | Export watch-only wallet. | not-implemented | P3 | Watch-only export supports moving a monitoring wallet between systems; it does not replace a spending-key backup. |
| [F09.S05](index.html#feature/F09?item=F09.S05) | Deduct fees from selected recipient amounts. | not-implemented | P3 | Selected fee subtraction supports fixed-budget and shared-cost payments; ordinary sending already works. |
| [F12.S08](index.html#feature/F12?item=F12.S08) | Choose where transaction change is returned. | not-implemented | P3 | Custom change supports advanced custody and privacy workflows; deliver the ownership warning with this control. |
| [F14.S08](index.html#feature/F14?item=F14.S08) | Inspect transactions and broadcast fully signed transactions without opening a wallet. | not-implemented | P3 | Wallet-free inspection and broadcast support dedicated relay setups; an open-wallet path already exists. |
| [F18.S01](index.html#feature/F18?item=F18.S01) | Keep records of sending and receiving addresses. | partial | P3 | A managed recipient list reduces repeated manual address entry; the missing sending side limits that workflow. |
| [F18.S02](index.html#feature/F18?item=F18.S02) | Add, update, and remove saved recipients. | not-implemented | P3 | Recipient management supports safer repeat payments to known destinations. |
| [F23.S03](index.html#feature/F23?item=F23.S03) | Choose whether unconfirmed change is available for spending. | not-implemented | P3 | Unconfirmed-change policy gives users control over payment availability and confirmation assumptions. |
| [F25.S03](index.html#feature/F25?item=F25.S03) | Receive informational, warning, and critical messages through desktop notifications. | not-implemented | P3 | Desktop warnings help users notice issues while the main window is hidden; in-app error handling already exists. |
| [F27.S03](index.html#feature/F27?item=F27.S03) | Monitor initialization progress. | partial | P3 | Initialization progress helps users distinguish lengthy startup from a stalled application. |
| [F29.S04](index.html#feature/F29?item=F29.S04) | Check the wallet’s key-generation status. | not-implemented | P3 | Key-generation status helps users understand wallet capabilities and backup needs. |
| [F30.S05](index.html#feature/F30?item=F30.S05) | Track long-running operations. | partial | P3 | Progress feedback reduces uncertainty during long wallet operations and rescans. |
| [F31.S04](index.html#feature/F31?item=F31.S04) | Prevent macOS background throttling from slowing initial synchronization and reindexing. | not-implemented | P3 | Preventing background throttling improves practical synchronization time on macOS. |
| [F32.S01](index.html#feature/F32?item=F32.S01) | Conceal wallet balances and recent activity. | not-implemented | P3 | Masking balances reduces casual disclosure during shared-screen or in-person use; it is not wallet access control. |
| [F32.S02](index.html#feature/F32?item=F32.S02) | Restrict access to transaction history while privacy mode is active. | not-implemented | P3 | Transaction history must respect privacy mode so hidden balances are not disclosed through another view. |
| [F32.S03](index.html#feature/F32?item=F32.S03) | Apply the privacy preference across loaded wallets. | not-implemented | P3 | Privacy mode must cover all loaded wallets to avoid exposing a second account when switching. |
| [F32.S04](index.html#feature/F32?item=F32.S04) | Remember the privacy preference between sessions. | not-implemented | P3 | Remembering privacy mode avoids unexpected disclosure after restart; deliver it with the masking workflow. |
| [F34.S02](index.html#feature/F34?item=F34.S02) | Monitor rescan progress. | not-implemented | P3 | Rescan progress lets users judge long recovery waits and distinguish activity from a stall. |
| [F34.S03](index.html#feature/F34?item=F34.S03) | Request cancellation of an ongoing wallet rescan. | not-implemented | P3 | Cancellation gives users control over an expensive scan without stopping the whole application. |
| [F12.S06](index.html#feature/F12?item=F12.S06) | Copy coin addresses, labels, amounts, identifiers, and transaction estimates to the clipboard. | not-implemented | P4 | Clipboard export helps inspect and share coin details; coin selection itself remains available. |
| [F16.S06](index.html#feature/F16?item=F16.S06) | Copy addresses, amounts, transaction IDs, transaction details, and raw transaction data to the clipboard. | partial | P4 | The remaining amount and full-detail copy gaps slow record keeping; transaction ID and raw-data copying already work. |
| [F16.S07](index.html#feature/F16?item=F16.S07) | Update address labels associated with transactions. | partial | P4 | Editing outgoing labels improves transaction records without changing payments. |
| [F18.S04](index.html#feature/F18?item=F18.S04) | Search and sort saved addresses by address or label. | not-implemented | P4 | Search and sorting improve access to larger saved-address lists. |
| [F18.S06](index.html#feature/F18?item=F18.S06) | Export address records as CSV. | not-implemented | P4 | CSV export supports contact record keeping and transfer. |
| [F23.S04](index.html#feature/F23?item=F23.S04) | Set the default treatment of fees in recipient amounts. | not-implemented | P4 | A fee-subtraction default saves repeated choices; implement the per-payment capability first. |
| [F25.S01](index.html#feature/F25?item=F25.S01) | Receive payment notifications that identify the transaction, wallet, amount, and recipient. | not-implemented | P4 | Payment notifications reduce active monitoring; payment history and balances remain available in the app. |
| [F25.S05](index.html#feature/F25?item=F25.S05) | Avoid a flood of notifications while historical wallet activity is being loaded. | not-implemented | P4 | Historical notification suppression is required with desktop notifications to prevent a misleading flood on wallet load. |
| [F27.S01](index.html#feature/F27?item=F27.S01) | Start automatically at system login on Windows and Linux. | not-implemented | P4 | Login startup supports unattended node availability but manual launch already works. |
| [F31.S06](index.html#feature/F31?item=F31.S06) | Access application information and command-line help. | partial | P4 | Graphical command-line help improves discoverability; application information and RPC help already exist. |
| [F21.S09](index.html#feature/F21?item=F21.S09) | Copy banned addresses and network ranges to the clipboard. | not-implemented | P5 | Copying ban entries is an operator convenience; inspecting and managing bans already work. |
| [F23.S05](index.html#feature/F23?item=F23.S05) | Choose whether advanced transaction controls are available. | not-implemented | P5 | Hiding advanced controls is a presentation preference; the transaction controls are already usable. |
| [F27.S02](index.html#feature/F27?item=F27.S02) | Start with the main window minimized. | not-implemented | P5 | Minimized startup is a convenience for background node use. |

[All subfeature priorities and reasons (JSON)](priorities.json) · [Full catalog](current-catalog.md)
