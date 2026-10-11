# GUI-QML acceptance criteria

182 current subfeatures across 34 feature groups. All duplicate-audit findings are implemented; the original IDs, evidence and review history remain available.

[Implemented audit](catalog-audit.md) · [Original evidence index](gui-feature-evidence/README.md)

## F01 — Create Wallet

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F01.S01 | Create a standard single-signature wallet. | parity |
| F01.S02 | Create an encrypted or unencrypted wallet containing spending keys. | parity |
| F01.S03 | Create a watch-only wallet to monitor funds without holding spending keys. | parity |
| F01.S04 | Create a blank wallet for later setup. | not-implemented |
| F01.S05 | Create a wallet that uses an external signer, such as a hardware wallet. | parity |
| F01.S06 | Name the wallet. | parity |

## F02 — Open, Switch, and Close Wallets

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F02.S01 | Open existing wallets. | parity |
| F02.S02 | Keep multiple wallets available at the same time. | parity |
| F02.S03 | Choose which wallet to use. | parity |
| F02.S04 | Close individual wallets or all wallets. | parity |

## F03 — Back Up and Restore Wallet

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F03.S01 | Save a wallet backup to a file. | parity |
| F03.S02 | Restore a wallet from a backup file. | parity |
| F03.S03 | Name a recovered wallet. | parity |
| F03.S04 | Recover and update a legacy wallet backup. | not-implemented |

## F04 — Migrate Legacy Wallet

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F04.S01 | Update legacy wallets to the current wallet format. | parity |
| F04.S02 | Preserve the original wallet with an automatic backup. | parity |
| F04.S03 | Preserve wallet contents, including watch-only information. | parity |
| F04.S04 | Open migrated wallets immediately or later. | parity |

## F05 — Export Watch-Only Wallet

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F05.S01 | Export a watch-only copy of a wallet for monitoring without spending access. | not-implemented |
| F05.S03 | Transfer wallet monitoring to another node. | not-implemented |

## F06 — Encrypt Wallet and Manage Passphrase

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F06.S01 | Protect stored spending keys with passphrase encryption. | parity |
| F06.S02 | Change the wallet passphrase. | parity |
| F06.S03 | Temporarily unlock spending keys for operations that require them. | parity |
| F06.S04 | Automatically restore the locked state after temporary access. | parity |
| F06.S05 | Check whether a wallet is encrypted and locked. | partial |
| F06.S06 | Show or hide entered passphrases. | parity |
| F06.S07 | Receive feedback on passphrase mismatches and common entry mistakes. | parity |

## F07 — View Wallet Overview

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F07.S01 | View available, pending, immature mining, and total balances. | partial |
| F07.S02 | Review recent wallet activity. | parity |
| F07.S03 | Find a recent transaction in the full transaction history. | parity |
| F07.S04 | Know when wallet information may be out of date. | parity |

**Related criteria, counted in their owning groups:** F32.S01 — Conceal wallet balances and recent activity.

## F08 — Receive Bitcoin / Request Payment

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F08.S01 | Generate receiving addresses using legacy, wrapped SegWit, native SegWit, or Taproot formats supported by the wallet. | parity |
| F08.S02 | Request a payment with an optional amount, label, and message. | parity |
| F08.S03 | Generate payment links and QR codes. | parity |
| F08.S04 | Copy receiving addresses, payment links, and request details to the clipboard. | parity |
| F08.S05 | Copy payment QR codes to the clipboard or save them as images. | parity |
| F08.S06 | Share QR images with other applications using drag and drop. | parity |
| F08.S07 | Review, reuse, and remove saved payment requests. | parity |
| F08.S09 | Generate receiving addresses for a configured watch-only wallet. | parity |

**Related criteria, counted in their owning groups:** F15.S03 — Verify a receiving address on a compatible signing device.

## F09 — Send Bitcoin

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F09.S01 | Pay one recipient or multiple recipients in a single transaction. | parity |
| F09.S02 | Enter or paste a recipient address, or use a saved address. | parity |
| F09.S03 | Associate recipient addresses with recognizable labels. | parity |
| F09.S04 | Send the available balance. | parity |
| F09.S05 | Deduct fees from selected recipient amounts. | not-implemented |
| F09.S06 | Review payment details and total costs before authorizing a transaction. | parity |
| F09.S07 | Sign payments with local spending keys. | parity |
| F09.S08 | Prepare a payment from a watch-only wallet for signing elsewhere. | parity |
| F09.S09 | Check payment details and available funds before sending. | parity |

**Related criteria, counted in their owning groups:** F15.S04 — Authorize outgoing payments using the device.

## F10 — Open Payment URI

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F10.S01 | Open or paste Bitcoin payment links. | parity |
| F10.S02 | Prepare a payment using the requested recipient, amount, and descriptive information. | parity |
| F10.S03 | Handle Bitcoin payment requests transferred from other applications, including while the application is already running. | parity |

## F11 — Choose Transaction Fee

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F11.S01 | Choose an estimated fee based on the desired confirmation speed and understand its expected timing. | parity |
| F11.S02 | Set a custom fee rate. | parity |
| F11.S04 | Know when a fee estimate is unavailable. | parity |

## F12 — Select Coins / Coin Control

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F12.S01 | Choose which coins fund a transaction, individually or in groups. | parity |
| F12.S03 | Inspect coins individually or grouped by address. | parity |
| F12.S04 | Compare coins by amount, address, label, age, and confirmations. | parity |
| F12.S05 | Control spending eligibility by locking or unlocking coins. | parity |
| F12.S06 | Copy coin addresses, labels, amounts, identifiers, and transaction estimates to the clipboard. | not-implemented |
| F12.S07 | Review the selected funds, expected fees, and change. | parity |
| F12.S08 | Choose where transaction change is returned. | not-implemented |
| F12.S09 | Receive a warning when a change destination is not recognized as spendable by the wallet. | not-implemented |

## F13 — Create and Export PSBT

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F13.S01 | Prepare a transaction for later signing. | parity |
| F13.S02 | Create transactions from watch-only wallets or wallets containing spending keys. | partial |
| F13.S03 | Use single-signature or previously configured multisig wallets. | partial |
| F13.S04 | Choose recipients, fees, and coins for the proposed transaction. | parity |
| F13.S05 | Copy an unsigned PSBT to the clipboard or save it to a file for signing elsewhere. | parity |

## F14 — Import, Sign, and Broadcast PSBT

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F14.S01 | Import a PSBT from a file or the clipboard. | partial |
| F14.S02 | Review recipients, amounts, available fee information, and signing progress. | parity |
| F14.S03 | Process single-signature and multisig transactions when the required keys and transaction information are available. | partial |
| F14.S04 | Sign with local wallets, including encrypted wallets after unlocking. | partial |
| F14.S05 | Collect additional signatures by passing a transaction between signers. | not-implemented |
| F14.S06 | Copy a partially signed PSBT to the clipboard or save it to a file for further signing. | parity |
| F14.S07 | Finalize and broadcast a transaction once sufficient signatures are present. | parity |
| F14.S08 | Inspect transactions and broadcast fully signed transactions without opening a wallet. | not-implemented |

## F15 — Use Hardware Wallet / External Signer

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F15.S01 | Connect a wallet to a compatible external signer. | parity |
| F15.S02 | Keep spending keys on the signing device. | parity |
| F15.S03 | Verify a receiving address on a compatible signing device. | not-implemented |
| F15.S04 | Authorize outgoing payments using the device. | parity |

**Related criteria, counted in their owning groups:** F08.S01 — Generate receiving addresses using legacy, wrapped SegWit, native SegWit, or Taproot formats supported by the wallet.; F14.S06 — Copy a partially signed PSBT to the clipboard or save it to a file for further signing.

## F16 — Browse and Export Transaction History

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F16.S01 | Review incoming, outgoing, mined, and other transactions. | parity |
| F16.S02 | Filter transactions by date, type, or minimum amount. | parity |
| F16.S03 | Search by address, transaction ID, or label, and sort transaction history. | parity |
| F16.S04 | View confirmation, conflict, abandonment, and mining-maturity status. Transaction states. | parity |
| F16.S05 | Inspect transaction costs, balance changes, confirmation details, and transaction data. Transaction details. | parity |
| F16.S06 | Copy addresses, amounts, transaction IDs, transaction details, and raw transaction data to the clipboard. | partial |
| F16.S07 | Update address labels associated with transactions. | partial |
| F16.S08 | Export filtered transaction history as CSV for record keeping or analysis. | parity |
| F16.S09 | Inspect transactions in external block explorers. | parity |

## F17 — Manage Unconfirmed Transactions

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F17.S01 | Increase the fee of an eligible transaction by signing and submitting a replacement. | parity |
| F17.S02 | Review the additional cost before authorizing a fee increase. | parity |
| F17.S04 | Create a fee-bump PSBT and copy it to the clipboard for signing elsewhere. | not-implemented |
| F17.S05 | Abandon eligible transactions so their inputs can be used for another spend. | not-implemented |

## F18 — Manage Address Book

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F18.S01 | Keep records of sending and receiving addresses. | partial |
| F18.S02 | Add, update, and remove saved recipients. | not-implemented |
| F18.S03 | Label receiving addresses. | parity |
| F18.S04 | Search and sort saved addresses by address or label. | not-implemented |
| F18.S05 | Copy saved addresses to the clipboard. | parity |
| F18.S06 | Export address records as CSV. | not-implemented |

## F19 — Sign and Verify Messages

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F19.S01 | Sign a message to demonstrate control of a Bitcoin address. | parity |
| F19.S02 | Verify that a message was signed by the holder of the corresponding key. | parity |
| F19.S03 | Copy the resulting signature to the clipboard. | parity |

## F20 — Set Up and Synchronize Node

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F20.S01 | Choose where node and wallet data are stored. | parity |
| F20.S02 | Limit blockchain storage through pruning. | parity |
| F20.S03 | Assess available storage, expected requirements, and the effect of pruning on wallet recovery. | parity |
| F20.S04 | Download and validate the blockchain. | parity |
| F20.S05 | Assess synchronization progress, how far the node is behind, and the estimated remaining work. | parity |
| F20.S06 | Operate the node without an open wallet. | parity |
| F20.S07 | Use mainnet, testnet, testnet4, signet, or regtest. Network support. | parity |

## F21 — Configure Network and Manage Peers

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F21.S01 | Enable or pause peer-to-peer networking. | parity |
| F21.S02 | Allow incoming peer connections. | parity |
| F21.S03 | Route connections through SOCKS5 proxies, with separate routing for Tor. Proxy support. | parity |
| F21.S04 | Automatically configure router access for incoming connections where supported. | parity |
| F21.S05 | Inspect peer connectivity, performance, synchronization, and relay behavior. | parity |
| F21.S06 | Check whether peer connections use encrypted transport. | parity |
| F21.S07 | Sort peers, copy peer addresses to the clipboard, and disconnect unwanted peers. | parity |
| F21.S08 | Temporarily ban peers, review existing bans, and restore access. | parity |
| F21.S09 | Copy banned addresses and network ranges to the clipboard. | not-implemented |

## F22 — Inspect Node and Use RPC Console

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F22.S01 | Inspect node identity, network, synchronization, and mempool information. | parity |
| F22.S02 | Monitor network traffic and data usage over time. | parity |
| F22.S03 | Focus traffic monitoring on a chosen time period or begin a fresh observation. | parity |
| F22.S04 | Inspect logs for troubleshooting. | parity |
| F22.S05 | Run advanced node and wallet commands. | parity |
| F22.S06 | Choose which wallet an advanced operation applies to. | parity |
| F22.S07 | Use command history, completion, and help. | parity |
| F22.S08 | Adjust console readability and clear previous output. | parity |

## F23 — Configure Application Preferences

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F23.S01 | Allocate memory and processing resources for block validation. | partial |
| F23.S02 | Allow external tools to communicate with the node through RPC. | parity |
| F23.S03 | Choose whether unconfirmed change is available for spending. | not-implemented |
| F23.S04 | Set the default treatment of fees in recipient amounts. | not-implemented |
| F23.S05 | Choose whether advanced transaction controls are available. | not-implemented |
| F23.S06 | Choose the interface language. | parity |
| F23.S07 | Customize the font used to display wallet balances. | parity |
| F23.S08 | Choose external services for inspecting transactions. | parity |
| F23.S10 | Manage advanced application configuration. | parity |
| F23.S11 | Understand which settings take precedence and which changes require a restart. | parity |
| F23.S12 | Restore default preferences while retaining a backup of previous settings. | parity |

**Related criteria, counted in their owning groups:** F29.S05 — Choose the denomination used to display amounts: BTC, mBTC, bits, or satoshis.; F27.S01 — Start automatically at system login on Windows and Linux.; F27.S02 — Start with the main window minimized.; F26.S03 — Keep the node running while the main window is hidden, minimized, or closed, where supported.; F24.S05 — Choose whether to display a tray icon on supported desktops.

## F24 — System Tray / macOS Dock

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F24.S01 | Keep the application accessible while its main window is hidden. | parity |
| F24.S05 | Choose whether to display a tray icon on supported desktops. | parity |

**Related criteria, counted in their owning groups:** F26.S03 — Keep the node running while the main window is hidden, minimized, or closed, where supported.; F28.S01 — Move between wallet balances, payments, and transaction history.; F27.S05 — Quit the application and shut down the node cleanly.

## F25 — Desktop Notifications

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F25.S01 | Receive payment notifications that identify the transaction, wallet, amount, and recipient. | not-implemented |
| F25.S03 | Receive informational, warning, and critical messages through desktop notifications. | not-implemented |
| F25.S04 | Receive critical error messages when desktop notifications are unavailable. | parity |
| F25.S05 | Avoid a flood of notifications while historical wallet activity is being loaded. | not-implemented |

## F26 — Manage Application Windows

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F26.S01 | Arrange, hide, and restore application windows. | parity |
| F26.S02 | Remember the main window placement between sessions. | parity |
| F26.S03 | Keep the node running while the main window is hidden, minimized, or closed, where supported. | parity |
| F26.S04 | Use diagnostics alongside wallet activity. | parity |
| F26.S05 | Identify the active wallet. | parity |

**Related criteria, counted in their owning groups:** F31.S02 — Identify the active Bitcoin network and distinguish instances using different networks.

## F27 — Start and Exit Application

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F27.S01 | Start automatically at system login on Windows and Linux. | not-implemented |
| F27.S02 | Start with the main window minimized. | not-implemented |
| F27.S03 | Monitor initialization progress. | parity |
| F27.S04 | Request an orderly shutdown during startup. | parity |
| F27.S05 | Quit the application and shut down the node cleanly. | parity |
| F27.S06 | Know when shutdown is still in progress. | parity |
| F27.S07 | Recover unreadable settings or stop startup without changing them. | not-implemented |
| F27.S08 | Coordinate application shutdown with Windows session shutdown. | not-implemented |

## F28 — Navigate the Application

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F28.S01 | Move between wallet balances, payments, and transaction history. | parity |
| F28.S05 | Use keyboard shortcuts for navigation and common actions. | parity |

**Related criteria, counted in their owning groups:** F02.S03 — Choose which wallet to use.

## F29 — View Application Status

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F29.S01 | Check connection count and whether networking is active. | parity |
| F29.S03 | Check whether a proxy is in use. | parity |
| F29.S04 | Check the wallet’s key-generation status. | not-implemented |
| F29.S05 | Choose the denomination used to display amounts: BTC, mBTC, bits, or satoshis. | parity |
| F29.S06 | Understand available actions through contextual guidance. | parity |

**Related criteria, counted in their owning groups:** F20.S05 — Assess synchronization progress, how far the node is behind, and the estimated remaining work.; F07.S04 — Know when wallet information may be out of date.; F06.S05 — Check whether a wallet is encrypted and locked.

## F30 — Show Progress, Errors, and Confirmations

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F30.S01 | Understand operation results, warnings, and errors. | parity |
| F30.S02 | Review important decisions before committing to an action. | parity |
| F30.S03 | Inspect additional diagnostic information when available. | parity |
| F30.S04 | Receive a prompt when an operation requires attention. | parity |
| F30.S05 | Track long-running operations. | partial |
| F30.S07 | Monitor background synchronization while retaining access to the application. | parity |

**Related criteria, counted in their owning groups:** F20.S05 — Assess synchronization progress, how far the node is behind, and the estimated remaining work.

## F31 — Desktop Integration and Application Help

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F31.S02 | Identify the active Bitcoin network and distinguish instances using different networks. | parity |
| F31.S03 | Adapt application visuals to the desktop appearance. | parity |
| F31.S04 | Prevent macOS background throttling from slowing initial synchronization and reindexing. | not-implemented |
| F31.S06 | Access application information and command-line help. | partial |

**Related criteria, counted in their owning groups:** F10.S03 — Handle Bitcoin payment requests transferred from other applications, including while the application is already running.; F16.S09 — Inspect transactions in external block explorers.

## F32 — Mask Wallet Values / Privacy Mode

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F32.S01 | Conceal wallet balances and recent activity. | not-implemented |
| F32.S02 | Restrict access to transaction history while privacy mode is active. | not-implemented |
| F32.S03 | Apply the privacy preference across loaded wallets. | not-implemented |
| F32.S04 | Remember the privacy preference between sessions. | not-implemented |

## F33 — Run with Wallet Functionality Disabled

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F33.S01 | Operate a node independently of wallet functionality. | parity |
| F33.S02 | Manage node information, networking, traffic, and diagnostics. | parity |
| F33.S03 | Retain application preferences and desktop integration without wallet features. | parity |

## F34 — Monitor and Cancel Wallet Rescans

| Criterion | User outcome | GUI-QML implementation |
| --- | --- | --- |
| F34.S01 | Rediscover wallet activity from blockchain history. | parity |
| F34.S02 | Monitor rescan progress. | not-implemented |
| F34.S03 | Request cancellation of an ongoing wallet rescan. | not-implemented |
