# Static site validation

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
