# Bitcoin GUI evidence

A static review site for the October 8, 2026 evidence snapshot: 34 groups, 203 subfeatures, and 116 original application captures. No server application, database, CDN, or runtime package installation is required.

Explore the [published evidence browser](https://johnny9.github.io/bitcoin-gui-evidence/) or clone this repository to review it locally.

Open `dist/index.html` directly in a browser, or serve the directory:

```bash
python3 -m http.server 8080 --directory dist
```

Visit `http://localhost:8080`. Any ordinary static host can serve the same `dist/` directory. Hash routes work without a fallback/rewrite rule.

## Explore and review

- Dark mode is the default. Use the sun/moon button in the top bar to switch themes; the browser remembers your preference. Original application captures keep their recorded colors.
- Search feature names, criterion IDs, and evidence descriptions. Press `/` to focus search.
- Filter GUI-QML by **Parity**, **Partial parity**, or **Not implemented**. In Groups view this applies to the entire feature group; in Subfeatures view it applies to individual capabilities. Qt Widgets stays visible as the reference in comparisons and galleries.
- Combine implementation parity with evidence coverage, capture availability, feature area, and personal review status. Full evidence requires targeted automated evidence and a matching capture with no recorded failure; partial evidence includes the remaining criteria. Evidence coverage and implementation parity are independent.
- Switch between feature groups and individual subfeatures. Filter state is included in catalog links.
- Open a group for per-subfeature application comparisons, modules/tests, or a capture gallery.
- Inspect original screenshots with full-size zoom, timestamps, hashes, and keyboard navigation.
- Mark a comparison reviewed or needing follow-up, add notes, and export/import a JSON review record.

Reviews are stored only in the browser, keyed to the exact evidence snapshot. They are not submitted to the hosting service or written into the evidence pack. Import preserves existing differing records and reports conflicts. A different snapshot is rejected. If browser storage is unavailable, export before closing the page. Moving between the local file and a hosted origin requires export/import.

Review status is separate from acceptance. Evidence levels, the one known failing QML script, and the original scope limitations remain visible. The site does not turn a screenshot or a related passing test into an acceptance decision.

Implementation parity is a rough assessment of whether the main user goal is achieved at the pinned source revisions. Equivalent workflows count as fully implemented: for example, exporting a file instead of copying to the clipboard, or restoring the main window to reach an action instead of using a tray shortcut. Important missing capabilities, incompatibilities, and broken outcomes remain partial or not implemented. Missing captures or untested hardware do not imply missing implementation.

Each group has an explicit main goal, status, and rationale in [`data/implementation.json`](data/implementation.json), shown on its feature page. Its rating is judged independently of the subfeature tally. Wallet creation can reach parity while standalone blank-wallet creation remains a secondary gap; in-app error dialogs do not fulfill the desktop-notification goal. Each subfeature also has a reasoned assessment. Original detailed comparisons and evidence remain visible and unchanged, so reviewers can inspect exact differences and make their own acceptance decisions.

## Source and regeneration

`src/` contains the application HTML, CSS, JavaScript, and icon. The runtime has no external dependencies. `scripts/build.py` reads the original Markdown and JSON evidence, generates `dist/data.js`, and copies unmodified source records and selected captures into `dist/gui-feature-evidence/`.

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

The checks cover filters, direct links, all 34 feature routes, all 116 decoded images, local-file access, screenshot zoom, note persistence/escaping, review import/export, failure reporting, and mobile navigation/layout. The Pages workflow runs these checks under `/bitcoin-gui-evidence/` to verify project-relative asset links.

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

This is a standalone HTML/JavaScript site; it has no Bitcoin Core lint, clang-tidy, or sanitizer CI scripts. No Bitcoin Core application code was changed or retested for the site conversion. The original application-test results and their limits are preserved separately in the evidence snapshot.

## Hosting

GitHub Pages publishes `dist/` at [johnny9.github.io/bitcoin-gui-evidence](https://johnny9.github.io/bitcoin-gui-evidence/). The [Pages workflow](.github/workflows/pages.yml) validates pull requests and automatically publishes successful pushes to `main`. It can also be run manually from the Actions tab. Repository Settings → Pages uses **GitHub Actions** as its source.

Only `dist/` is deployed. The site uses relative asset links and hash navigation, so it works under the repository path without a custom domain or URL rewrites. Deployment follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

To move review notes from the previous hosted site, export them there and import the JSON on GitHub Pages. The evidence snapshot identity is unchanged, so matching notes remain compatible. Theme and review preferences are saved separately by each browser origin.
