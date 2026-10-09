# Static site validation

Validated October 9, 2026, against evidence snapshot `b4b1026b74ad8bf0a1628c9889b82193d33d210c3aa0170e94783f371fe15c0b`.

- **32 browser checks passed**, using Chromium 139 in the existing Puppeteer 24.16.0 image, with external networking disabled.
- All 34 feature routes expose their 203 original criteria; all 116 original images decode at their recorded dimensions.
- Search, GUI-QML evidence/capture filters, review filters, deep links, galleries, zoom, keyboard search, mobile menus, and local-file access passed.
- Parity filtering is independent of evidence coverage. Group results are 19 parity, 12 partial parity, and 3 not implemented; subfeature results are 150 parity, 15 partial parity, and 38 not implemented. Each group has an explicit main user goal and a reasoned assessment, independent of its subfeature tally. Browser checks cover group/subfeature scope, combined evidence and parity filters, reload persistence, mobile filtering, and the unchanged Widgets reference.
- Regression cases include equivalent file/clipboard sharing at parity while the original missing drag-and-drop evidence remains visible, wallet creation at parity despite a secondary blank-wallet gap, and desktop notifications absent despite an in-app error fallback. Source-only automatic-backup evidence stays at implementation parity; device address verification and PSBT import compatibility remain partial, legacy backup restore/migrate remains absent, and the recorded recipient-note failure remains partial.
- Full evidence selects 89 GUI-QML criteria with targeted automated evidence and a capture; partial selects the remaining 114, including the 43 original missing-workflow records and the known failure. Original evidence records describe the exact methods tested; a supported equivalent workflow can now reach implementation parity without changing those historical records. The evidence sets are disjoint and cover all 203 criteria. Capture filters use QML records even when Widgets has a capture. Widgets remains visible in comparisons and galleries. Legacy application/evidence links migrate to the simplified filters.
- Personal notes persist locally and render markup as text. Export/import preserves the snapshot identity; import rejects an unrelated snapshot.
- Mobile catalog, feature, tests, and provenance views fit a 390-pixel viewport without page-level horizontal overflow. Wide test tables scroll within their panels.
- No JavaScript errors or missing requested local assets were recorded.
- The Python integrity checker validated all 116 original capture hashes, all status mappings, the known failed criterion, and 70 generated local link targets. JavaScript syntax checks passed.
- Regeneration from the bundled evidence snapshot passed, preserving the catalog identity.
- The full browser suite passed with dark mode enabled. Theme checks passed for the dark default, switching to light, preference persistence, unchanged deep links, mobile fit, and mobile switching. Desktop/mobile screenshots, feature comparisons, review dialogs, and test results were visually checked. Original capture pixels remain unchanged.

[Browser outcomes](validation/browser-results.json) · [Theme outcomes](validation/theme-results.json) · [Tested file hashes](validation/tested-files.json)

Dark-mode QA screenshots are in the workspace's `../.validation/gui-feature-review-dark-20261009/` directory.

Filter-update QA screenshots and results are in `../.validation/gui-feature-review-filters-20261009/`.

Outcome-assessment QA screenshots and results are in the ignored `.validation/outcomes/` directory; the earlier parity-filter run is in `.validation/parity/`. Desktop and mobile goal panels and a subfeature with an equivalent sharing workflow were visually inspected. Every assessment is checked against the original group/criterion IDs, source revisions, and snapshot identity; all original evidence statuses and capture hashes are preserved.

The browser run initially exposed a sidebar transition intercepting the menu click during a desktop-to-mobile resize. Removing that transition fixed the interaction; the final full run passed. Chrome cache configuration was adjusted for the container account during setup.

These checks validate the static review site. The historical QML recipient-note test failure remains visible and unchanged. Bitcoin Core application tests were not rerun for this conversion. This standalone static repository has no Bitcoin Core `ci/lint.py`, clang-tidy, or sanitizer CI configurations; those checks are not claimed.

## GitHub Pages migration

The standalone GitHub checkout preserves evidence snapshot identity and all 116 capture hashes. All 25 browser checks passed under the `/bitcoin-gui-evidence/` project path, including filters, capture loading, review import/export, deep links, and mobile layouts. GitHub Actions rebuilds the bundled snapshot, checks generated output for drift, runs the integrity and browser checks, and publishes only `dist/` after validation. The pinned actions follow GitHub’s supported Pages workflow.
