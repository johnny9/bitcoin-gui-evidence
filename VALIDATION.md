# Static site validation

## October 11, 2026 — hardware and platform acceptance review

Validated changes based on site revision `f6034f09a62d0d5c6e249ee6065ebe412f5a3d9c`; [tested file hashes](validation/tested-files.json) identify the resulting source. The application source, binary and archived evidence are unchanged.

- The agreed standard accepts hardware/platform integrations when connected QML gives the user the necessary workflow and existing tests/hooks support it. Reviewed signer setup, key separation, approval/broadcast and incomplete-PSBT handoff; explorer launch; network selection/identity; proxy settings; NAT-PMP control; tray/Dock access and background operation. **11 criteria now default to Accepted** using the **QML + tests/hooks** basis. [Criterion assessments, modules, tests and existing pass records](dist/hardware-platform-review.md).
- All **32 reviewed source/test files** were checked against GUI-QML commit `a91f4b4774f25de061fe1a7c132a91ddde117fca`. Their SHA-256 hashes are recorded in [review data](data/hardware-platform-review.json). Each cited assertion is present in its archived passing log. This was a source and evidence assessment: no new hardware, operating-system, service or application test run is claimed.
- **62 browser checks pass** under the GitHub Pages project path. Coverage includes the updated filters/counts, full evidence without a required capture for the three reviewed integrations lacking one, manual acceptance overrides/restoration, module/test links, preserved expandable runtime scope, source-gap/failure guards, review migration/import/export, keyboard use, mobile layouts and all 221 original capture decodes. Desktop/mobile review cards and the policy guide were visually inspected. An old browser expectation that router mapping still required partial evidence was updated to reflect the new rule.
- Build, evidence integrity, Python parsing, JavaScript syntax/execution, local links and whitespace checks pass. A stale review is rejected if the implementation becomes partial or a recorded failure appears. Existing absent workflows, including device address verification, notifications, login startup, Windows session shutdown and macOS background-throttling protection, stay open. Both prior application regressions remain recorded.
- The catalog remains at **183 criteria: 135 parity, 13 partial and 35 absent**. **125 default to Accepted**, **10 parity items need evidence**, and **48 need implementation**. The 1,740 previously tracked evidence/collection/rerun files are unchanged. The functional record remains 40 passed and two failed; no captures were added. Snapshot identity, catalog revision and manual review compatibility are preserved.
- Native lint, clang-tidy and ASan commands were attempted from this standalone website checkout and returned 127 because its CI entry scripts are absent. [Command results](validation/native-ci.json) record the unchanged branch/revision after lint. No native rebuild, sanitizer or IPC-enabled GUI lifecycle pass is claimed.

[Browser outcomes](validation/browser-results.json) · [Evidence integrity](validation/evidence-integrity.json) · [Tested file hashes](validation/tested-files.json)

## October 11, 2026 — verify pending payments

Validated changes based on site revision `e680e15eaff28c6ba5b3ee91c4cf6e4518fd3144`; [tested file hashes](validation/tested-files.json) identify the resulting source. The pinned application and binary are unchanged.

- **Pending payments are verified:** 13 targeted checks pass. An incoming 0.125 BTC wallet transaction is in the mempool and visible under Pending; an unpaid 0.75 BTC request is excluded from the subtotal. Confirmation removes the pending amount and changes the wallet balance from 1.5 to 1.625 BTC. Two original application screenshots show those states. The new pending screenshot leads the F07.S01 comparison; its earlier capture remains accessible.
- Extending the fixture reveals a **separate mining-maturity refresh failure**, reproduced twice. RPC reports 51.625 BTC available after maturity, while the wallet header remains at 1.625 BTC for at least 20 seconds. A third selected screenshot, failing regression, RPC state and trace retain this result. F07.S01 and the overview group are partial because of this observed failure; the pending capability is explicitly verified. The Widgets-style balance layout is not required. [Evidence, scripts, modules and reproduction](data/collections/20261011-pending-balance/report.md).
- Both GUI processes exited 0; the pending test exited 0 and the maturity regression exited 1. The collection records 28 assertions: 27 pass and one fails; the maturity test repeats the pending assertions before testing maturity. Stderr was inspected and retains Fontconfig and Qt settings warnings. The latest combined functional record is 40 passing scripts and two failing regressions. Other application scripts were not rerun.
- **61 browser checks pass** under the GitHub Pages project path, including pending evidence links and primary image, separate failure visibility, all 221 capture decodes, historical collection preservation, filters, saved-review migration, keyboard use and mobile layouts. Application frames and the desktop/mobile evidence pages were visually inspected. Build, integrity, Python parsing, JavaScript execution/syntax and whitespace checks pass. The builder retains superseded collection transitions and shows each new collection's actual date and failure description.
- The catalog remains at 183 criteria: 135 parity, 13 partial and 35 absent. That is 48 implementation gaps, 114 automatic Accepted defaults and 21 parity proof gaps. Prior evidence files, original screenshot bytes, snapshot identity and personal-review compatibility are preserved. The earlier statement that Pending lacked a visible label was incorrect and is not published.
- Native lint, clang-tidy and ASan commands were attempted from this standalone website checkout and returned 127 because the CI entry scripts are absent. [Command results](validation/native-ci.json) record the unchanged branch/revision after lint. No native rebuild, sanitizer or IPC-enabled lifecycle pass is claimed; the reused binary has IPC disabled. Initial capture-script development fixed a wallet-notification wait, duplicate heading lookup and unit-symbol expectation. The application maturity failure remains recorded.

[Browser outcomes](validation/browser-results.json) · [Integrity results](validation/evidence-integrity.json). Website QA screenshots are retained locally in `.validation/pending-balance/`.

## October 11, 2026 — implement the approved duplicate audit

Validated the final website changes based on revision `148aed7778e93d05a24f796edd361cad7dff4abf`; [tested file hashes](validation/tested-files.json) identify the resulting source.

- All 22 change findings are applied and eight reviewed distinctions remain separate. The catalog now has **183 criteria** across 34 groups: **136 parity, 12 partial, 35 not implemented**. It counts **47 implementation gaps**, **114 evidence-default Accepted**, and **22 parity criteria needing fuller evidence** in a fresh browser. The 20 retired original rows have direct aliases (16) or replacement-outcome pages (4).
- Combined evidence retains incomplete proof. Device verification and key-generation status are now assessed alone as absent; local-key signing is now fully proved with device approval assessed separately. Wallet identity uses the existing wallet-selection capture; the node-only network capture remains with network identity. Cross-group outcomes link to their owning criteria and source modules/tests. No application feature was implemented and no application test was rerun for this catalog edit.
- **60 browser checks passed** under the GitHub Pages project path with external networking disabled. Checks cover all retired links, search and related-outcome navigation, all 34 groups and 218 image decodes, merged/split review migration, conflicting choices, inherited source-group scope, preserved original notes, v4 export/import, atomic invalid-import rejection, new-tab synchronization and older-tab isolation. Existing filtering, quick review, keyboard and mobile checks pass. Desktop catalog/audit and mobile replacement, related-outcome and review-history layouts were visually inspected.
- Build, evidence integrity, JavaScript syntax and whitespace checks passed. Regeneration is deterministic across Python hash seeds. Every one of the 203 original in-memory criterion records is unchanged, as are the archived application evidence, dated capture/test artifacts, source assessments, snapshot identity and functional results. The [integrity record](validation/evidence-integrity.json) includes the file count and capture/hash checks.
- The lint, clang-tidy and ASan CI commands were attempted from this checkout. They return 127 because `ci/lint.py` and `ci/test_run_all.sh` are absent. [Command results](validation/native-ci.json) record the base revision and unchanged branch after lint. No native lint, tidy, sanitizer or IPC-enabled lifecycle pass is claimed. The known application cache regression remains visible.
- The first new migration test omitted a page reload after seeding old browser storage. Correcting the fixture made the scenario exercise migration as intended; the final complete run passed. Visual QA also replaced a node-only image with the existing selected-wallet image for the narrowed wallet-identity scope.

[Browser outcomes](validation/browser-results.json) · [Integrity results](validation/evidence-integrity.json). Local screenshots are in `.validation/audit-implemented/`. Earlier sections below retain the counts and validation limits at the time of each prior update.

## October 11, 2026 — combine watch-only export and audit all subfeatures

Validated changes based on site revision `07793efda85cc8f637ce4f5b072a302745ec7b8d`; [tested file hashes](validation/tested-files.json) identify the resulting source.

- F05.S02 is combined into F05.S01: **Export a watch-only copy of a wallet for monitoring without spending access**. The current catalog has **202 criteria**, with **52 to implement** (15 partial, 37 missing), **125 accepted by default**, and **25 parity criteria needing fuller proof**. This is a catalog correction; no application capability or implementation assessment changed.
- All **203 original criteria across 34 groups** were audited for duplicate user outcomes. The [audit](dist/catalog-audit.md) documents the applied merge, nine further merge candidates, twelve partial overlaps and eight distinctions to retain. Every original criterion is listed in the group-by-group review. Only the requested F05 merge is applied.
- **55 browser checks passed**, including old-ID navigation and search, union of both evidence records, retained review notes and scope, conflicting decisions, explicit resolution, export/import, maximum-length notes, and desktop/mobile audit layout. Existing filters, review controls, local-file use and all 218 capture files also passed. The merged criterion, review-conflict dialog and audit page were visually inspected.
- Build, integrity, Python parsing, JavaScript syntax and source whitespace checks passed. The original evidence snapshot, application captures, dated collection artifacts, source assessments and catalog identity are unchanged. Removed IDs remain valid in historical reviews and exports; resolving a combined review keeps the earlier separate record. No application functional scripts were rerun for this catalog edit.
- Required native lint, clang-tidy and ASan commands were attempted from this website checkout and returned 127 because `ci/lint.py` and `ci/test_run_all.sh` are absent. No native CI, sanitizer or IPC lifecycle pass is claimed. [Attempt results](validation/catalog-audit-native-checks.json) record the tested base revision and blocker.

[Browser outcomes](validation/browser-results.json) · [Integrity results](validation/evidence-integrity.json). Screenshots are retained in `.validation/criterion-audit/`.

## October 10, 2026 — QML acceptance evidence and missing functional tests

Validated the changes based on site revision `6e26efe2602af785a01f4eb452072edc7b15ba0d`; [tested file hashes](validation/tested-files.json) identify the resulting source. The application remains GUI-QML `a91f4b4774f25de061fe1a7c132a91ddde117fca` with the original binary hash.

- **35 of the 61 QML proof gaps closed**, with 37 new selected screenshots and 50 scoped checks: 49 passed, one failed. Eleven unchanged functional scripts were rerun and six new scenarios were added; 16 pass and one reproduces the cache-range defect. The latest cumulative record is 39 passing scripts and one failing script; the whole upstream suite was not rerun.
- The database-cache editor rejects a valid 768 MiB allocation, leaving `7` after native keyboard entry. Core starts with the same allocation. F23.S01 is now partial and unaccepted; the failure log, captures, pinned modules and regression are linked. No application fix is included.
- **125 criteria default to Accepted**, 25 parity criteria need fuller proof, and 53 need implementation (15 partial, 38 absent). The [test plan](data/collections/20261010-qml/missing-functional-tests.md) identifies the remaining 26 items in 19 test/environment workstreams, including the reproduced defect. Existing explicit review choices and the catalog identity are preserved.
- **52 browser checks passed** under the GitHub Pages project path with external networking disabled. All 218 selected captures decode at their recorded dimensions. Checks cover current counts, acceptance defaults, the failed criterion, criterion-specific evidence and test-plan links, filters, review storage/import/export, and mobile layouts. Desktop catalog, the cache criterion, the mobile evidence report and selected new application captures were visually inspected.
- Static build, evidence integrity, Python parsing, JavaScript syntax and source/prose whitespace checks passed. Raw logs retain their original whitespace. Original snapshot artifacts remain unchanged; collection manifests verify the new screenshots, scripts, logs and reports. The final six new scenarios were rerun after collector corrections; early diagnostic traces remain explicitly marked as historical.
- Required native lint, clang-tidy and ASan commands returned 127 because their entry scripts are absent from both the site repository and the pinned QML checkout. The original binary has IPC disabled and is not a sanitizer build. The reset-onboarding harness terminates its second pre-initialization process with SIGTERM (-15); other recorded application exits are 0. No native CI, sanitizer or IPC-enabled lifecycle pass is claimed. See the [application validation record](data/collections/20261010-qml/validation.json).

[Browser outcomes](validation/browser-results.json) · [Integrity results](validation/evidence-integrity.json) · [Evidence report](data/collections/20261010-qml/report.md). Local browser screenshots are in `.validation/qml-evidence/`.

## October 10, 2026 — remaining implementation and acceptance defaults

Validated the acceptance changes based on revision `53be2676c57cec67a8e809d2805873ab1ef38250`; [tested file hashes](validation/tested-files.json) identify the resulting source.

- The catalog and navigation show **52 criteria to implement**: 14 partial and 38 not implemented. The full catalog remains 203 subfeatures across 34 groups. **90 default to Accepted** from parity plus Full GUI-QML evidence; **61 parity items need fuller proof**. Summary links open the corresponding subfeature filters. Explicit saved decisions can change the Accepted total without changing implementation/evidence ratings.
- **51 browser checks passed** under the GitHub Pages project path. New checks cover the exact count/filter sets, acceptance defaults, withdrawal of an automatic acceptance when evidence fails, explicit overrides, restoring defaults, and retaining defaults during scope/note edits. Existing checks cover v1/v2 migration, v3 acceptance/default export and import, conflict preservation, notes, scope inheritance, keyboard actions, mobile layouts, and all 181 original capture files. Desktop catalog, mobile acceptance guide and card controls were visually inspected.
- The checkmark now accepts or reopens a subfeature. Accepted defaults are labeled; previous Reviewed, Not reviewed, and Needs follow-up records remain explicit overrides. Storage and export move to v3 so older open tabs cannot overwrite the new states. Default records remain `default`, rather than becoming fixed acceptances when only scope or notes change.
- Build, integrity, JavaScript syntax and whitespace checks passed. All evidence, captures, source and implementation assessments, and catalog identity remain unchanged. The initial browser run exposed an old expected list of parity-filter choices; the assertion now includes the combined Partial or not implemented choice, and the complete run passed.
- Native lint, clang-tidy and sanitizer commands were attempted from this standalone website repository and returned 127 because their entry scripts are absent. No Bitcoin Core application code changed and no native CI or sanitizer pass is claimed.

[Browser outcomes](validation/browser-results.json). Visual QA is in `.validation/accepted-defaults/`.

## October 10, 2026 — subfeature counts and acceptance explanation

Validated the wording changes based on revision `d2fd5c416bc95954722cf6a364f121944cad6949`; [tested file hashes](validation/tested-files.json) identify the resulting source. The catalog prominently names **203 subfeatures across 34 feature groups**, with subfeature labels on the view switch, result counts and group pages. The acceptance guide defines a criterion, illustrates it with PSBT export, and explains scope, supporting evidence and project agreement.

- **49 existing browser checks passed** under the Pages project path, including mobile layouts, filters, review storage, import/export, direct review controls and all 181 captures. Two existing wording expectations were updated for the Subfeatures label. Desktop catalog and mobile acceptance-guide screenshots were visually inspected.
- Build, evidence integrity, JavaScript syntax and whitespace checks passed. Catalog data, source evidence, captures, parity assessments and saved-review identity are byte-for-byte unchanged.
- Native lint, clang-tidy and sanitizer commands were attempted from this standalone repository; each returned 127 because the entry scripts are absent. No Bitcoin Core application code changed and no native CI or sanitizer pass is claimed.

[Browser outcomes](validation/browser-results.json). Visual QA is in `.validation/acceptance-explanation/`.

## October 10, 2026 — Qt Widgets evidence gaps

Validated the website changes based on revision `ac890e6c14aadd58eabc5336594016d68ca34e3b`; [tested file hashes](validation/tested-files.json) identify the resulting source. The application remains at `f739c7876b81304bdc72e7eaa307702da269ac31` with the original executable and driver hashes.

- **61 original screenshots** add captures for **58 of 69** previously uncovered Widgets criteria; **11 remain**, with reasons in the [capture report](data/collections/20261010-widgets/report.md). Each new criterion record links its captures, checks, module references and limitations. The latest 44 checks pass: 43 criterion assertions and one fixture check. Failed exploratory attempts and instrumentation limits are retained; this is not a fresh full upstream suite pass.
- **49 browser checks passed** under the GitHub Pages project path with external networking disabled. All 181 gallery images decode at their recorded dimensions. Checks cover new reference mappings, report/source/check links, remaining gaps, mobile report layout, and existing filters and review controls. The new desktop criterion page, mobile report, and all 61 capture frames were visually inspected.
- Build, evidence integrity, JavaScript syntax and whitespace checks passed. All original evidence files and prior QML reruns remain byte-for-byte unchanged. All 203 GUI-QML records, implementation assessments, functional results and the saved-review catalog identity were compared with the base and are unchanged.
- The three requested native CI commands were attempted from this standalone repository and returned 127 because `ci/lint.py` and `ci/test_run_all.sh` are absent. No native lint, clang-tidy, sanitizer or IPC-enabled lifecycle pass is claimed. No Bitcoin Core application source changed; [validation details](data/collections/20261010-widgets/validation.json) record the limits.
- An initial browser check assumed the first detailed report was the QML send-create rerun. Adding the Widgets collection exposed that ordering assumption; the check now identifies the intended report explicitly. The final complete browser run passed.

[Browser outcomes](validation/browser-results.json) · [Integrity results](validation/evidence-integrity.json). Local visual QA is retained in `.validation/widgets-pass/`; the disposable capture container was returned to its original stopped state.

## October 10, 2026 — direct criterion review controls

Validated the card-action changes based on revision `7d814cc13afb72db2813c29793d32a6723f3bcea`; [tested file hashes](validation/tested-files.json) identify the exact source tested. The checkmark toggles Reviewed, the scope label opens a native selector, and Review details retains the full dialog.

- **47 browser checks passed** under the GitHub Pages project path in Chromium with external networking disabled. New checks cover immediate saving, reloading, preserving notes and scope, quick-review progress and filtering, requirement overrides and inheritance, native dropdown selection, keyboard focus and scrolling at a criterion deep link.
- All three controls fit on one row at 390 and 320 pixels in both themes. Keyboard navigation reaches each control and opens the existing dialog with its saved values intact. Desktop dark and mobile dark/light screenshots were visually inspected.
- Static build, evidence integrity, JavaScript syntax and whitespace checks passed. No evidence records, application captures, implementation assessments or snapshot identity changed.
- This standalone repository has no `ci/lint.py`, `ci/test_run_all.sh`, clang-tidy or sanitizer configurations. Those native checks could not run and no native CI or sanitizer pass is claimed; no Bitcoin Core application code or binaries changed.

[Browser outcomes](validation/browser-results.json) and screenshots in `.validation/card-actions/` record this run.

## October 10, 2026 — clear unconfirmed-transaction evidence

`qml_test_wallet_rbf` passed a fresh end-to-end run against the unchanged pinned application. Capture checkpoints dismiss the password prompt through Cancel before recording fee review, wait for it to close after authorization, and open the replacement transaction details after successful broadcast. All five original assert statements remain. The GUI and test exit 0; fees, replacement mempool entry, wallet relocking, transaction conflict state and mined confirmation are recorded. See the [capture rerun report](data/reruns/20261010-wallet-rbf/report.md) and [validation limits](data/reruns/20261010-wallet-rbf/validation.json).

- **44 browser checks passed**, including three clear GUI-QML gallery images for F17, criterion-specific capture mappings, the unchanged Widgets reference, and decoding all 120 selected images. The feature page and gallery were visually inspected.
- The old password-covered frame is superseded in the current gallery and remains byte-for-byte available with its historical links. All earlier evidence artifacts remain unchanged. Integrity checks cover 116 archived original captures and 44 raw images across the two dated reruns.
- The latest combined functional results are still 34 passed: 32 October 8 results and two October 10 reruns. This was not a fresh full-suite run. No implementation, acceptance or requirement ratings changed; saved review identity is preserved.
- Build, integrity, JavaScript syntax and whitespace checks passed. The original application binary and fixture hashes were verified. Native lint/tidy/ASan entry scripts are absent from this historical checkout, as recorded in the rerun validation JSON; no native CI or sanitizer pass is claimed.

Current QA artifacts are in `.validation/wallet-rbf-captures/`. The sections below describe earlier validation at the time of each update.

## October 10, 2026 — functional rerun update

The original failure reproduced at application revision `a91f4b4774f25de061fe1a7c132a91ddde117fca`. A test-only correction uses focused keyboard input for both recipient notes. All original assertions remain. Corrected script revision `19891532b849b1f72fbbc9dfaa2565e7ce50546e` passed three complete runs against the unchanged binary, including two without the evidence wrapper. See the [rerun report](data/reruns/20261010-send-create/report.md), [exact patch](data/reruns/20261010-send-create/test-fix.patch) and [application validation record](data/reruns/20261010-send-create/validation.json).

- **43 browser checks passed** under the GitHub Pages project path with external networking disabled. Checks include the resolved failure, current versus archived results, both application references, review compatibility, and expanded rerun evidence on mobile. The new criterion comparison, result page and mobile report were visually inspected.
- Current combined functional results: **34 passed, zero unresolved failures** (33 original October 8 results and one October 10 rerun; not a fresh full-suite run).
- F09.S03 is now parity with full evidence. Send Bitcoin remains partial because selected-recipient fee deduction is still unsupported. Group totals stay 19 parity / 12 partial / 3 absent; criterion totals are 151 / 14 / 38. Full evidence selects 90 criteria and partial selects 113.
- All 316 tracked original evidence files are byte-for-byte unchanged, including 116 original selected captures and the failure record. The addendum retains 31 raw screenshots and adds two to the gallery, for 118 selected captures. All original and rerun image hashes passed verification.
- Catalog identity, saved review decisions and explicit requirements are preserved. Updated parity gives F09.S03 the automatic Needed for merge default only when no saved choice overrides it. No criterion is automatically accepted.
- Python integrity checks, JavaScript syntax and diff whitespace checks passed. The dated record retains application stdout/stderr and exit status 0. Historical lint/clang-tidy/ASan entry scripts are absent in the pinned GUI-QML top-level checkout, so those attempted checks are explicitly blocked, not passed. IPC-enabled sanitizer lifecycle coverage is not claimed.

Current browser outcomes and tested file hashes are linked below. QA screenshots are in `.validation/send-create-rerun/`. The sections that follow record earlier site validation and describe the evidence as it stood at that time.

## October 9 site validation (historical)

Validated October 9, 2026, against evidence snapshot `b4b1026b74ad8bf0a1628c9889b82193d33d210c3aa0170e94783f371fe15c0b`.

- **42 browser checks passed**, using Chromium 139 in the existing Puppeteer 24.16.0 image, with external networking disabled.
- All 34 feature routes expose their 203 original criteria; all 116 original images decode at their recorded dimensions.
- Search, GUI-QML evidence/capture filters, review filters, deep links, galleries, zoom, keyboard search, mobile menus, and local-file access passed.
- Parity filtering is independent of evidence coverage. Group results are 19 parity, 12 partial parity, and 3 not implemented; subfeature results are 150 parity, 15 partial parity, and 38 not implemented. Each group has an explicit main user goal and a reasoned assessment, independent of its subfeature tally. Browser checks cover group/subfeature scope, combined evidence and parity filters, reload persistence, mobile filtering, and the unchanged Widgets reference.
- Regression cases include equivalent file/clipboard sharing at parity while the original missing drag-and-drop evidence remains visible, wallet creation at parity despite a secondary blank-wallet gap, and desktop notifications absent despite an in-app error fallback. Source-only automatic-backup evidence stays at implementation parity; device address verification and PSBT import compatibility remain partial, legacy backup restore/migrate remains absent, and the recorded recipient-note failure remains partial.
- Full evidence selects 89 GUI-QML criteria with targeted automated evidence and a capture; partial selects the remaining 114, including the 43 original missing-workflow records and the known failure. Original evidence records describe the exact methods tested; a supported equivalent workflow can now reach implementation parity without changing those historical records. The evidence sets are disjoint and cover all 203 criteria. Capture filters use QML records even when Widgets has a capture. Widgets remains visible in comparisons and galleries. Legacy application/evidence links migrate to the simplified filters.
- Personal notes persist locally and render markup as text. Export/import preserves the snapshot identity; import rejects an unrelated snapshot.
- Requirements support Needed for merge, Needed for release, Not needed, and Unassigned. Group defaults flow to subfeatures; individual overrides survive group edits, and inheritance or Unassigned can be restored. Assigning requirements leaves review progress unchanged. Group/subfeature filter scope, combined parity/review filters, URL persistence, reset, and direct links passed.
- Full-parity items automatically default to Needed for merge: 19 groups and 150 subfeatures in a fresh browser. Partial/missing subfeatures remain Unassigned even inside a full-parity group; full-parity subfeatures receive the default even inside partial/absent groups. Saved group choices and individual overrides, including explicit Unassigned, take precedence. Legacy notes remain intact, and these defaults do not mark items reviewed or accepted.
- Version 2 exports retain group defaults, subfeature overrides, notes, and review status when imported into a fresh browser. Version 1 files and existing browser records migrate without losing notes. Invalid requirements are rejected, and conflicting imports preserve existing choices and notes. Versioned browser storage isolates new choices from older open tabs.
- Requirement editing and filtering passed at a 390-pixel viewport, including dark/light dialogs, preserved notes, and no horizontal overflow. Catalog, group controls, and review dialogs were visually inspected.
- Mobile catalog, feature, tests, and provenance views fit a 390-pixel viewport without page-level horizontal overflow. Wide test tables scroll within their panels.
- No JavaScript errors or missing requested local assets were recorded.
- The Python integrity checker validated all 116 original capture hashes, all status mappings, the known failed criterion, and 70 generated local link targets. JavaScript syntax checks passed.
- Regeneration from the bundled evidence snapshot passed, preserving the catalog identity.
- The full browser suite passed with dark mode enabled. Theme checks passed for the dark default, switching to light, preference persistence, unchanged deep links, mobile fit, and mobile switching. Desktop/mobile screenshots, feature comparisons, review dialogs, and test results were visually checked. Original capture pixels remain unchanged.

[Browser outcomes](validation/browser-results.json) · [Theme outcomes](validation/theme-results.json) · [Tested file hashes](validation/tested-files.json)

Dark-mode QA screenshots are in the workspace's `../.validation/gui-feature-review-dark-20261009/` directory.

Filter-update QA screenshots and results are in `../.validation/gui-feature-review-filters-20261009/`.

Outcome-assessment QA screenshots and results are in the ignored `.validation/outcomes/` directory; the earlier parity-filter run is in `.validation/parity/`. Desktop and mobile goal panels and a subfeature with an equivalent sharing workflow were visually inspected. Every assessment is checked against the original group/criterion IDs, source revisions, and snapshot identity; all original evidence statuses and capture hashes are preserved.

Requirement-review QA screenshots and results are in `.validation/requirements/`. The implementation assessments, snapshot identity, original evidence records, and capture bytes are unchanged by this review-workflow update.

Automatic merge-default QA screenshots and results are in `.validation/merge-defaults/`; the catalog was visually inspected. The same implementation snapshot supplies the defaults, with no changes to evidence or acceptance decisions.

Acceptance-language QA screenshots and results are in `.validation/acceptance-language/`. The site identifies its purpose as defining GUI-QML acceptance criteria for merge and release, with Qt Widgets as the reference. Catalog, navigation, criterion labels, scope controls, review help, and the acceptance guide use that framing. Desktop catalog and mobile guide layouts were visually inspected. Saved reviews, requirement defaults, implementation assessments, and the evidence snapshot remain unchanged.

The browser run initially exposed a sidebar transition intercepting the menu click during a desktop-to-mobile resize. Removing that transition fixed the interaction; the final full run passed. Chrome cache configuration was adjusted for the container account during setup.

These checks validate the static review site. The historical QML recipient-note test failure remains visible and unchanged. Bitcoin Core application tests were not rerun for this conversion. This standalone static repository has no Bitcoin Core `ci/lint.py`, clang-tidy, or sanitizer CI configurations; those checks are not claimed.

## GitHub Pages migration

The standalone GitHub checkout preserves evidence snapshot identity and all 116 capture hashes. All 25 browser checks passed under the `/bitcoin-gui-evidence/` project path, including filters, capture loading, review import/export, deep links, and mobile layouts. GitHub Actions rebuilds the bundled snapshot, checks generated output for drift, runs the integrity and browser checks, and publishes only `dist/` after validation. The pinned actions follow GitHub’s supported Pages workflow.
