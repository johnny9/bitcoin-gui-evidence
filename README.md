# GUI-QML acceptance criteria

A static workspace for defining the acceptance criteria for Bitcoin Core GUI-QML. Review 203 proposed user outcomes across 34 feature groups, decide what is needed for merge or release, and assess implementation and evidence against Qt Widgets as the reference.

The October 8, 2026 evidence snapshot includes 116 original application captures, source modules, and recorded automated tests. An [October 10 rerun](data/reruns/20261010-send-create/report.md) corrects the send-create test input and records three passes on the unchanged application, with two additional selected captures. A second [October 10 capture rerun](data/reruns/20261010-wallet-rbf/report.md) replaces the password-covered fee-bump screenshot with three clear captures, bringing that gallery to 120 images. A further [Qt Widgets capture pass](data/collections/20261010-widgets/report.md) adds 61 screenshots for 58 of the 69 reference criteria previously missing captures, with 44 scoped assertions. The gallery now has 181 images; 11 Widgets criteria still lack screenshots. Hardware, platform, transient-startup and notification gaps remain explicit. The combined record is 34 passing functional scripts: 32 retained from October 8, plus the two reruns. The entire suite was not rerun. These support agreement on acceptance; parity, evidence coverage, scope choices, and review status are distinct. The site records personal proposals and reviews, not a shared project approval. No server application, database, CDN, or runtime package installation is required.

Explore the [published acceptance criteria](https://johnny9.github.io/bitcoin-gui-evidence/) or clone this repository to review it locally.

Open `dist/index.html` directly in a browser, or serve the directory:

```bash
python3 -m http.server 8080 --directory dist
```

Visit `http://localhost:8080`. Any ordinary static host can serve the same `dist/` directory. Hash routes work without a fallback/rewrite rule.

## Define acceptance criteria

- Dark mode is the default. Use the sun/moon button in the top bar to switch themes; the browser remembers your preference. Original application captures keep their recorded colors.
- Search feature names, criterion IDs, and evidence descriptions. Press `/` to focus search.
- Filter GUI-QML by **Parity**, **Partial parity**, or **Not implemented**. In Groups view this applies to the entire feature group; in Criteria view it applies to individual capabilities. Qt Widgets stays visible as the reference in comparisons and galleries.
- Combine implementation parity with requirements, evidence coverage, capture availability, feature area, and personal review status. Full evidence requires targeted automated evidence and a matching capture with no unresolved recorded failure; partial evidence includes the remaining criteria. Evidence coverage and implementation parity are independent.
- Switch between feature groups and individual acceptance criteria. Filter state is included in catalog links.
- Open a group for per-subfeature application comparisons, modules/tests, or a capture gallery.
- Inspect original screenshots with full-size zoom, timestamps, hashes, and keyboard navigation.
- Use the checkmark at the bottom of a criterion card to toggle **Reviewed**. **Review details** opens the full dialog for notes and follow-up status. Quick changes preserve existing notes and can be exported/imported in a JSON review record.
- Mark a feature **Needed for merge**, **Needed for release**, or **Not needed**. Full-parity groups and subfeatures default to **Needed for merge**; partial and missing items stay **Unassigned**. These defaults use implementation parity, without marking anything reviewed or accepted.
- Set a group choice using **Acceptance scope → Change** on its feature page; click a criterion's scope label (such as **Needed for merge**) to choose another scope or restore **Use default**. Changes save immediately. A saved group choice takes precedence over automatic criterion defaults; individual overrides take precedence over both. Existing choices, including explicit Unassigned, are preserved. An automatic full-parity group rating alone does not assign missing secondary criteria to merge.
- Filter **Acceptance scope** in Groups view to match group choices, or in Criteria view to match individual choices including inherited defaults. Requirement choices are independent of parity and reviewed/follow-up status; assigning a requirement does not mark anything reviewed.

Reviews are stored only in the browser, keyed to the exact evidence snapshot. They are not submitted to the hosting service or written into the evidence pack. Import preserves existing differing records and reports conflicts. A different snapshot is rejected. If browser storage is unavailable, export before closing the page. Moving between the local file and a hosted origin requires export/import.

Review exports use schema version 2 and include saved group requirements, individual overrides, review status, and notes. Version 1 review files and previously saved browser notes still load; missing requirements use the saved group choice or the parity default. Automatic defaults are derived from the current implementation assessment, rather than written as personal decisions. **Not needed** is always an explicit choice. Exported version 2 files require this updated browser to import.

Review status is separate from acceptance. Evidence levels, the resolved test failure and its history, and the original scope limitations remain visible. The site does not turn a screenshot or a related passing test into an acceptance decision.

Implementation parity is a rough assessment of whether the main user goal is achieved at the pinned source revisions. Equivalent workflows count as fully implemented: for example, exporting a file instead of copying to the clipboard, or restoring the main window to reach an action instead of using a tray shortcut. Important missing capabilities, incompatibilities, and broken outcomes remain partial or not implemented. Missing captures or untested hardware do not imply missing implementation.

Each group has an explicit main goal, status, and rationale in [`data/implementation.json`](data/implementation.json), shown on its feature page. Its rating is judged independently of the subfeature tally. Wallet creation can reach parity while standalone blank-wallet creation remains a secondary gap; in-app error dialogs do not fulfill the desktop-notification goal. Each subfeature also has a reasoned assessment. Original detailed comparisons and evidence remain archived, with dated addenda applied to the current view, so reviewers can inspect exact differences and make their own acceptance decisions.

## Source and regeneration

`src/` contains the application HTML, CSS, JavaScript, and icon. The runtime has no external dependencies. `scripts/build.py` reads the original Markdown and JSON evidence, generates `dist/data.js`, applies the dated addenda in `data/reruns/` and reference collections in `data/collections/`, and copies the unmodified original records and rerun artifacts into `dist/gui-feature-evidence/`. The original catalog identity is preserved while current results, captures, and explicitly reassessed criteria are updated. A rerun can supersede a gallery capture while its original bytes and historical links remain available in the archive. Existing saved reviews and explicit requirements are preserved; parity-based automatic defaults follow the updated assessment.

```bash
python3 -m pip install -r requirements-build.txt
python3 scripts/build.py
python3 scripts/validate.py
node --check src/app.js
```

The builder regenerates from the bundled snapshot under `dist/gui-feature-evidence/`. To intentionally replace that snapshot, pass `--evidence /path/to/gui-feature-evidence`. Screenshot bytes and evidence statuses are checked against the original manifests. All feature modules and source links remain pinned to the reviewed revisions.

Commit both the source edits and regenerated `dist/` output. CI rebuilds the site and fails if the committed output is stale. The bundled snapshot makes a fresh clone self-contained.

Update `data/implementation.json` when implementation changes are reviewed. Schema version 2 requires a status and reason for every group and criterion, plus a main user goal for every group. The builder rejects missing or extra assessments and references to a different evidence snapshot or source revision. Generated `dist/implementation.json` exposes the assessment for reviewers. These assessments preserve the existing evidence snapshot identity and saved review compatibility.

## Validation

`scripts/browser-test.cjs` exercises the browser interactions using the workspace's existing Puppeteer image. It expects `/site` to contain this project and `/qa` to be a writable, disposable results directory. Run as root with `PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer`; Chrome runs in the container with `--no-sandbox`. The container may use `--network none`: the test server uses loopback only.

The checks cover filters, direct links, all 34 feature routes, all 181 selected images, local-file access, screenshot zoom, note persistence/escaping, review import/export, current results and historical failure reporting, and mobile navigation/layout. The Pages workflow runs these checks under `/bitcoin-gui-evidence/` to verify project-relative asset links.

Run the same browser checks locally with Docker:

```bash
mkdir -p .validation/browser
docker run --rm --init --network none --user 0 --shm-size=256m \
  -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  -e SITE_BASE_PATH=/bitcoin-gui-evidence/ \
  -v "$PWD:/site:ro" -v "$PWD/.validation/browser:/qa:rw" \
  -w /home/pptruser ghcr.io/puppeteer/puppeteer:24.16.0 \
  node /site/scripts/browser-test.cjs
```

Recorded validation results are in `validation/`. Each Actions run also retains browser screenshots and results as the `browser-validation` artifact for 14 days.

This is a standalone HTML/JavaScript site; it has no Bitcoin Core lint, clang-tidy, or sanitizer CI scripts. No Bitcoin Core application code changed. The October 10 functional rerun uses the original binary with a two-line test input correction; its [validation record](data/reruns/20261010-send-create/validation.json) records the missing historical CI scripts and remaining limits. The original application-test results and their limits are preserved separately in the evidence snapshot.

## Hosting

GitHub Pages publishes `dist/` at [johnny9.github.io/bitcoin-gui-evidence](https://johnny9.github.io/bitcoin-gui-evidence/). The [Pages workflow](.github/workflows/pages.yml) validates pull requests and automatically publishes successful pushes to `main`. It can also be run manually from the Actions tab. Repository Settings → Pages uses **GitHub Actions** as its source.

Only `dist/` is deployed. The site uses relative asset links and hash navigation, so it works under the repository path without a custom domain or URL rewrites. Deployment follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

To move review notes from the previous hosted site, export them there and import the JSON on GitHub Pages. The evidence snapshot identity is unchanged, so matching notes remain compatible. Theme and review preferences are saved separately by each browser origin.
