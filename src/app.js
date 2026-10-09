/* A dependency-free, browser-local review surface for the pinned evidence. */
(() => {
  'use strict';
  const data = window.REVIEW_EVIDENCE;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    check: '<path d="m8 12 3 3 6-7"/><rect x="3" y="3" width="18" height="18" rx="5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
    note: '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v6h6M7 13h10M7 17h6"/>',
    wallet: '<path d="M20 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h15V8H5a3 3 0 0 1 0-5"/><path d="M20 12h-5v5h5"/>',
    network: '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m10.5 8-4 7m7-7 4 7M8 18h8"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    payments: '<path d="M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5"/>',
  };
  function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`; }
  $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  function updateThemeToggle() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const toggle = $('#theme-toggle');
    toggle.innerHTML = icon(dark ? 'sun' : 'moon');
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.title = toggle.getAttribute('aria-label');
  }
  $('#theme-toggle').addEventListener('click', () => {
    window.EvidenceTheme.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  window.addEventListener('themechange', updateThemeToggle);
  updateThemeToggle();
  const groupMap = new Map(data.groups.map(g => [g.id, g]));
  const criteria = data.groups.flatMap(g => g.criteria);
  const criterionMap = new Map(criteria.map(c => [c.id, c]));
  const captureMap = new Map(data.captures.map(p => [p.path, p]));
  const areaIcons = {wallets:'wallet', payments:'payments', activity:'activity', node:'network', application:'grid'};
  const appNames = {widgets:'Qt Widgets', qml:'GUI-QML'};
  const comparisonApps = ['widgets', 'qml'];
  const storageKey = 'bitcoin-gui-evidence-review-v2:' + data.catalogId;
  const legacyStorageKey = 'bitcoin-gui-evidence-review-v1:' + data.catalogId;
  const defaults = {q:'', parity:'any', requirement:'any', evidence:'any', area:'all', review:'any', captures:'any', view:'groups'};
  let filters = {...defaults};
  let reviews = {};
  let storageAvailable = true;
  let captureList = [];
  let captureIndex = 0;
  let editingReview = null;
  let toastTimer;
  let route = {page:'catalog', params:new URLSearchParams()};
  const permittedStates = ['unreviewed', 'reviewed', 'followup'];
  const requirementLabels = {merge:'Needed for merge', release:'Needed for release', 'not-needed':'Not needed', unassigned:'Unassigned'};
  const automaticRequirement = id => (groupMap.get(id) || criterionMap.get(id)).implementation.status === 'parity' ? 'merge' : 'unassigned';
  const defaultRequirement = id => groupMap.has(id) ? automaticRequirement(id) : 'inherit';

  function validateReviews(records) {
    if (!records || typeof records !== 'object' || Array.isArray(records)) throw new Error('Review records are missing.');
    const clean = {};
    for (const [id, value] of Object.entries(records)) {
      if ((!criterionMap.has(id) && !groupMap.has(id)) || !value || !permittedStates.includes(value.status) || typeof value.note !== 'string' || value.note.length > 10000) throw new Error('The file contains an invalid review record.');
      const requirement = value.requirement === undefined ? defaultRequirement(id) : value.requirement;
      if (!Object.hasOwn(requirementLabels, requirement) && !(criterionMap.has(id) && requirement === 'inherit')) throw new Error('The file contains an invalid requirement.');
      clean[id] = {status:value.status, note:value.note, requirement, updatedAt:typeof value.updatedAt === 'string' ? value.updatedAt : null};
    }
    return clean;
  }
  try {
    const saved = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey);
    if (saved) reviews = validateReviews(JSON.parse(saved));
  } catch { storageAvailable = false; }

  function reviewFor(id) { return reviews[id] || {status:'unreviewed', note:'', requirement:defaultRequirement(id)}; }
  function inheritedRequirement(id) {
    const groupId = criterionMap.get(id).groupId;
    return reviews[groupId] ? reviewFor(groupId).requirement : automaticRequirement(id);
  }
  function requirementFor(id) {
    const requirement = reviewFor(id).requirement;
    return requirement === 'inherit' ? inheritedRequirement(id) : requirement;
  }
  function requirementBadge(id) {
    const requirement = requirementFor(id);
    const inherited = reviewFor(id).requirement === 'inherit';
    const origin = inherited ? (reviews[criterionMap.get(id).groupId] ? 'from group' : 'default') : (!reviews[id] ? 'default' : '');
    return `<span class="requirement-badge" data-requirement="${requirement}">${requirementLabels[requirement]}${origin && requirement !== 'unassigned' ? `<span class="requirement-origin"> · ${origin}</span>` : ''}</span>`;
  }
  function reviewLabel(id) { return ({unreviewed:'Not reviewed', reviewed:'Reviewed', followup:'Needs follow-up'})[reviewFor(id).status]; }
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(reviews)); storageAvailable = true; }
    catch { storageAvailable = false; notify('Browser storage is unavailable. Export your review to save it.'); }
    updateProgress();
  }
  function updateProgress() {
    const reviewed = criteria.filter(c => reviewFor(c.id).status !== 'unreviewed').length;
    $('#review-progress-text').textContent = `${reviewed} / ${criteria.length}`;
    $('#review-progress-bar').style.width = `${reviewed / criteria.length * 100}%`;
    $('#storage-status').textContent = storageAvailable ? 'Saved in this browser' : 'Session only · export to save';
  }
  function evidenceCoverage(c) {
    const record = c.applications.qml;
    return record.status === 'assertions' && record.captures.length > 0 && !c.hasFailure ? 'full' : 'partial';
  }
  const parityLabels = {parity:'Parity', partial:'Partial parity', 'not-implemented':'Not implemented'};
  function parityBadge(record) {
    const color = {parity:'assertions', partial:'limited', 'not-implemented':'gap'}[record.status];
    return `<span class="badge parity-badge badge-${color}" data-parity="${record.status}"${record.reason?` title="${escape(record.reason)}"`:''}><span class="badge-dot"></span>${parityLabels[record.status]}</span>`;
  }
  function paritySummary(g) {
    return Object.entries(g.implementation.counts).filter(([,n])=>n).map(([status,n])=>`${n} ${parityLabels[status].toLowerCase()}`).join(' · ');
  }
  function matches(c) {
    const implementation = filters.view === 'groups' ? groupMap.get(c.groupId).implementation : c.implementation;
    if (filters.parity !== 'any' && implementation.status !== filters.parity) return false;
    if (filters.requirement !== 'any' && requirementFor(filters.view === 'groups' ? c.groupId : c.id) !== filters.requirement) return false;
    if (filters.area !== 'all' && c.area !== filters.area) return false;
    if (filters.review !== 'any' && reviewFor(c.id).status !== filters.review) return false;
    const words = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.every(word => c.searchText.includes(word))) return false;
    const record = c.applications.qml;
    return (filters.evidence === 'any' || evidenceCoverage(c) === filters.evidence) &&
      (filters.captures === 'any' || (filters.captures === 'yes' ? record.captures.length > 0 : record.captures.length === 0));
  }
  function hasFilters() { return Object.keys(defaults).some(k => k !== 'view' && filters[k] !== defaults[k]); }
  function badge(record) { return `<span class="badge badge-${record.status}"><span class="badge-dot"></span>${escape(record.label)}</span>`; }
  function options(values, current) { return values.map(([value,label]) => `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`).join(''); }
  function filtersMarkup() {
    return `<div class="filter-panel"><div class="search-box">${icon('search')}<label class="sr-only" for="catalog-search">Search features, evidence, or criterion IDs</label><input id="catalog-search" type="search" value="${escape(filters.q)}" placeholder="Search features, evidence, or criterion IDs…" autocomplete="off"><kbd>/</kbd></div><div class="filter-row"><label class="filter-field">GUI-QML parity<select data-filter="parity">${options([['any','Any implementation'],...Object.entries(parityLabels)],filters.parity)}</select></label><label class="filter-field">Evidence coverage<select data-filter="evidence">${options([['any','Any evidence'],['full','Full'],['partial','Partial']],filters.evidence)}</select></label><label class="filter-field">GUI-QML captures<select data-filter="captures">${options([['any','With or without captures'],['yes','Has captures'],['no','No captures']],filters.captures)}</select></label><label class="filter-field">My requirement<select data-filter="requirement">${options([['any','Any requirement'],...Object.entries(requirementLabels)],filters.requirement)}</select></label><label class="filter-field">My review<select data-filter="review">${options([['any','Any review status'],['unreviewed','Not reviewed'],['followup','Needs follow-up'],['reviewed','Reviewed']],filters.review)}</select></label><button class="text-button clear-filters" data-action="clear-filters">Reset filters</button></div></div>`;
  }
  function areaChips() {
    return `<div class="area-chips" aria-label="Filter by feature area">${[{id:'all',label:'All features'},...data.areas].map(a => `<button class="area-chip ${filters.area === a.id ? 'selected' : ''}" data-area="${a.id}" aria-pressed="${filters.area === a.id}">${escape(a.label)}</button>`).join('')}</div>`;
  }
  function statsMarkup() {
    return `<div class="stats-grid"><div class="stat"><span class="stat-label">Feature groups</span><strong>${data.summary.groups}</strong><span>Wallet, node & application</span></div><div class="stat"><span class="stat-label">Subfeatures</span><strong>${data.summary.criteria}</strong><span>Individual review criteria</span></div><div class="stat"><span class="stat-label">Application captures</span><strong>${data.summary.selected_captures}</strong><span>60 Widgets · 56 QML</span></div><a class="stat stat-link" href="#tests"><span class="stat-label">QML functional scripts ${icon('external')}</span><strong>33<span class="stat-denominator"> / 34</span></strong><span class="failure-text"><span class="issue-dot"></span>1 failing script to inspect</span></a></div>`;
  }
  function coverageRow(g, app) {
    const counts = {assertions:0, limited:0, visual:0, source:0, gap:0};
    g.criteria.forEach(c => { counts[c.applications[app].status]++; });
    const detail = Object.entries(counts).filter(([,v])=>v).map(([k,v])=>`${v} ${{assertions:'automated',limited:'limited',visual:'visual',source:'source / related tests',gap:'missing'}[k]}`).join(' · ');
    return `<div class="coverage-row"><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]}</span><div class="coverage-track" role="img" aria-label="${escape(detail)}">${Object.entries(counts).filter(([,n])=>n).map(([k,n])=>`<span class="segment-${k}" style="width:${n/g.criteria.length*100}%" title="${n} ${k}"></span>`).join('')}</div><span class="coverage-description">${escape(detail)}</span></div>`;
  }
  function groupCard(g, matching) {
    const count = g.criteria.length;
    const reviewed = g.criteria.filter(c => reviewFor(c.id).status !== 'unreviewed').length;
    return `<a class="group-card" href="#feature/${g.id}"><div class="group-card-top"><span class="group-icon">${icon(areaIcons[g.area])}</span><span class="criterion-id">${g.id}</span>${g.criteria.some(c=>c.hasFailure)?'<span class="failure-marker" title="Contains a failing test">1 finding</span>':''}<span class="card-arrow">${icon('arrow')}</span></div><h2>${escape(g.name)}</h2><div class="group-meta"><span>${count} subfeatures</span><span class="meta-separator">·</span><span>${g.captures.length} captures</span>${matching < count ? `<span class="match-count">${matching} matching</span>` : ''}</div><div class="implementation-summary"><span class="small-label">GUI-QML</span>${parityBadge(g.implementation)}<span class="helper-text">Subfeature detail: ${paritySummary(g)}</span></div><div class="requirement-summary"><span class="small-label">My requirement</span>${requirementBadge(g.id)}</div><div class="group-coverage">${comparisonApps.map(app=>coverageRow(g,app)).join('')}</div><div class="group-card-footer"><span>${reviewed ? `${reviewed} of ${count} reviewed` : 'Ready for review'}</span><span>Explore evidence <span aria-hidden="true">↗</span></span></div></a>`;
  }
  function criterionResult(c) {
    return `<a class="criterion-result" href="#feature/${c.groupId}?item=${c.id}"><div><span class="criterion-id">${c.id}</span><span class="result-group">${escape(groupMap.get(c.groupId).name)}</span><h2>${escape(c.intent)}</h2><div class="requirement-summary">${requirementBadge(c.id)}</div></div><div class="result-statuses">${comparisonApps.map(app=>`<div><span class="small-label">${appNames[app]}</span>${app==='qml'?parityBadge(c.implementation):''}${badge(c.applications[app])}</div>`).join('')}</div><span class="card-arrow">${icon('arrow')}</span></a>`;
  }
  function renderCatalogResults() {
    const matching = criteria.filter(matches);
    const groups = data.groups.map(g=>({group:g, rows:g.criteria.filter(matches)})).filter(r=>r.rows.length);
    $('#results-count').innerHTML = `<strong>${filters.view === 'groups' ? groups.length : matching.length}</strong> ${filters.view === 'groups' ? 'feature groups' : 'subfeatures'}<span class="muted"> · ${matching.length} of 203 subfeatures match</span>`;
    $('#filter-scope').textContent = `Parity and requirement filters apply to ${filters.view === 'groups' ? 'whole feature groups' : 'individual subfeatures (including group defaults)'}. Evidence and captures filter GUI-QML; Qt Widgets stays visible as the reference.`;
    const container = $('#catalog-results');
    container.className = filters.view === 'groups' ? 'group-grid' : 'criterion-results';
    container.innerHTML = matching.length ? (filters.view === 'groups' ? groups.map(r=>groupCard(r.group,r.rows.length)).join('') : matching.map(criterionResult).join('')) : `<div class="empty-state">${icon('search')}<h2>No matching evidence</h2><p>Try another search or loosen the filters.</p><button class="button" data-action="clear-filters">Clear filters</button></div>`;
    $$('.area-chip').forEach(el=>{el.classList.toggle('selected', el.dataset.area===filters.area);el.setAttribute('aria-pressed',el.dataset.area===filters.area);});
    $$('[data-view]').forEach(el=>{el.classList.toggle('selected',el.dataset.view===filters.view);el.setAttribute('aria-pressed',el.dataset.view===filters.view);});
    $('.clear-filters').classList.toggle('has-filters',hasFilters());
  }
  function renderCatalog() {
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">BITCOIN CORE / GUI COMPARISON</div><h1>Feature evidence</h1><p>Explore the capabilities. Compare the applications. Inspect the proof.</p></div><a class="subtle-link" href="#about">How to review ${icon('arrow')}</a></section>${statsMarkup()}<div class="snapshot-notice">${icon('info')}<p>Evidence collected on <strong>October 8, 2026</strong>. Coverage describes what was checked; acceptance is still pending review.</p></div>${filtersMarkup()}<p class="helper-text coverage-definition">Parity means the main user goal is achieved. Workflow differences and secondary gaps remain listed; evidence coverage is separate. <a class="subtle-link" href="#about">Evidence guide ↗</a></p>${areaChips()}<div class="results-toolbar"><div><span id="results-count" aria-live="polite"></span><div class="filter-scope" id="filter-scope"></div></div><div class="segmented" aria-label="Catalog layout"><button data-view="groups" aria-pressed="true">${icon('grid')} Groups</button><button data-view="criteria" aria-pressed="false">Subfeatures</button></div></div><div id="catalog-results"></div><div class="evidence-legend"><span>Evidence level</span><span><i class="segment-assertions"></i>Automated</span><span><i class="segment-limited"></i>Limited</span><span><i class="segment-visual"></i>Visual</span><span><i class="segment-source"></i>Source / related tests</span><span><i class="segment-gap"></i>Missing GUI</span></div>`;
    renderCatalogResults();
  }
  function capturePreview(path, list, compact=false) {
    const photo = captureMap.get(path);
    return `<button class="capture-preview ${compact?'compact':''}" data-capture="${escape(path)}" data-capture-list="${escape(list.join('|'))}" aria-label="Open capture: ${escape(photo.caption)}"><span class="capture-image-wrap"><img src="gui-feature-evidence/${escape(path)}" alt="${escape(photo.caption)}" loading="lazy" width="${photo.width}" height="${photo.height}"><span class="zoom-hint">${icon('image')} View capture</span></span><span class="capture-caption">${escape(photo.caption)}<span aria-hidden="true">↗</span></span></button>`;
  }
  function evidencePanel(c, app) {
    const record = c.applications[app];
    const pics = record.captures;
    return `<section class="application-evidence" aria-label="${appNames[app]} evidence for ${c.id}"><header><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]} <code>${app==='widgets'?'src/qt · reference':'qt6'}</code></span>${badge(record)}</header>${app==='qml'?`<div class="parity-detail">${parityBadge(c.implementation)}<p>${escape(c.implementation.reason)}</p></div>`:''}<div class="evidence-description">${record.html}</div>${pics.length ? `<div class="criterion-captures">${capturePreview(pics[0],pics)}${pics.length>1?`<div class="capture-strip">${pics.slice(1).map(path=>`<button data-capture="${escape(path)}" data-capture-list="${escape(pics.join('|'))}" aria-label="Open capture: ${escape(captureMap.get(path).caption)}"><img src="gui-feature-evidence/${escape(path)}" alt="${escape(captureMap.get(path).caption)}" loading="lazy"></button>`).join('')}<span>${pics.length} captures</span></div>`:''}</div>`:`<div class="no-capture">${icon('image')}<span>${record.status==='gap'?'No capture · GUI workflow absent':'No matching capture collected'}</span></div>`}</section>`;
  }
  function criterionCard(c) {
    const review = reviewFor(c.id);
    return `<article class="criterion-card ${c.hasFailure?'has-finding':''}" id="${c.id}"><header class="criterion-card-heading"><div><span class="criterion-id">${c.id}</span>${c.hasFailure?'<span class="failure-marker">Test failure</span>':''}<h2>${escape(c.intent)}</h2></div><button class="icon-button copy-link" data-copy="${c.id}" aria-label="Copy link to ${c.id}" title="Copy link">#</button></header><div class="evidence-comparison">${comparisonApps.map(app=>evidencePanel(c,app)).join('')}</div><footer class="criterion-footer"><a class="subtle-link" href="#feature/${c.groupId}?tab=tests">Modules & related tests ${icon('external')}</a><div class="criterion-review-actions">${requirementBadge(c.id)}<button class="review-button review-${review.status}" data-review="${c.id}" aria-label="Review and set requirement for ${c.id}">${icon('note')}${reviewLabel(c.id)}${review.note?'<span class="note-dot" title="Has a review note"></span>':''}</button></div></footer>${review.note?`<div class="saved-note"><span class="small-label">Your note</span><p>${escape(review.note)}</p></div>`:''}</article>`;
  }
  function groupTests(g) {
    return `<section class="content-panel"><div class="section-heading"><h2>Implementation modules</h2><span class="small-label">Pinned source revisions</span></div><div class="prose module-list">${g.modulesHtml}</div></section><section class="content-panel"><div class="section-heading"><h2>Automated tests & assertions</h2><a class="subtle-link" href="#tests">All test results ↗</a></div><p class="helper-text">These tests are related to this feature group. The assertion scope and limits for each subfeature remain authoritative; a passing suite is not blanket acceptance.</p><div class="table-scroll"><table class="tests-table"><thead><tr><th>Application</th><th>Test / module</th><th>Recorded result</th></tr></thead><tbody>${g.tests.map(t=>`<tr class="${t.failed?'failed-row':''}"><td>${escape(t.application)}</td><td>${t.testHtml}</td><td>${t.resultHtml}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function renderGroup() {
    const g = groupMap.get(route.groupId);
    if (!g) { $('#main').innerHTML = '<div class="empty-state"><h1>Feature not found</h1><p>The link does not match a feature in this snapshot.</p><a class="button" href="#catalog">Open the catalog</a></div>'; return; }
    const tab = ['evidence','tests','captures'].includes(route.params.get('tab')) ? route.params.get('tab') : 'evidence';
    const area = data.areas.find(a=>a.id===g.area);
    const previous = data.groups[g.number-2], next = data.groups[g.number];
    const matching = route.params.has('item') ? g.criteria : g.criteria.filter(matches);
    $('#main').innerHTML = `<a class="back-link" href="#catalog">← Feature catalog</a><section class="page-heading feature-heading"><div><div class="eyebrow">${g.id} <span class="eyebrow-divider">/</span> ${escape(area.label)}</div><h1>${escape(g.name)}</h1><div class="implementation-summary"><span class="small-label">GUI-QML</span>${parityBadge(g.implementation)}<span class="helper-text">Subfeature detail: ${paritySummary(g)}</span></div><div class="group-meta"><span>${g.criteria.length} subfeatures</span><span>·</span><span>${g.captures.length} captures</span><span>·</span><span>Acceptance pending review</span></div></div><div class="feature-pagination">${previous?`<a class="icon-button" href="#feature/${previous.id}" aria-label="Previous feature: ${escape(previous.name)}">←</a>`:'<span></span>'}${next?`<a class="icon-button" href="#feature/${next.id}" aria-label="Next feature: ${escape(next.name)}">→</a>`:''}</div></section><section class="content-panel outcome-assessment"><div class="eyebrow">ROUGH USER-OUTCOME ASSESSMENT</div><h2>Main user goal</h2><p class="outcome-goal">${escape(g.implementation.goal)}</p><p class="helper-text">${escape(g.implementation.reason)}</p><div class="group-requirement"><div><span class="small-label">My requirement</span><p class="helper-text">Full parity defaults to Needed for merge. A saved group choice applies to subfeatures without overrides.</p></div><button class="button" data-review="${g.id}" aria-label="Set requirement for ${escape(g.name)}">${requirementBadge(g.id)}<span>Change</span></button></div></section><details class="implementation-note"><summary>Detailed implementation differences <span>Pinned source comparison</span></summary><p class="helper-text">This original comparison lists individual differences. The outcome assessment allows equivalent workflows and secondary differences when the main user goal is achieved.</p><div class="prose">${g.comparisonHtml}${g.supportHtml?`<p class="baseline-note">${g.supportHtml}</p>`:''}</div></details><div class="feature-tabs-row"><nav class="feature-tabs" aria-label="Feature sections">${[['evidence','Evidence'],['tests','Modules & tests'],['captures','All captures']].map(([key,label])=>`<a href="#feature/${g.id}?tab=${key}" ${tab===key?'aria-current="page"':''}>${label}${key==='captures'?` <span>${g.captures.length}</span>`:''}</a>`).join('')}</nav></div><div id="feature-content"></div><div class="feature-bottom-links"><a href="${g.markdown}" download>Download the Markdown evidence page ${icon('download')}</a><a href="#catalog">Back to catalog ↑</a></div>`;
    const content = $('#feature-content');
    if (tab==='tests') content.innerHTML = groupTests(g);
    else if (tab==='captures') {
      const pics = g.captures;
      content.innerHTML = `<p class="helper-text gallery-intro">Original application captures. Select an image to inspect it at full size and view its timestamp and hash.</p><div class="capture-gallery">${pics.length?pics.map(path=>`<div class="gallery-card"><span class="application-label"><span class="app-dot ${captureMap.get(path).application}"></span>${appNames[captureMap.get(path).application]}</span>${capturePreview(path,pics,true)}<div class="capture-criteria">${captureMap.get(path).features.filter(id=>id.startsWith(g.id+'.')).map(id=>`<a href="#feature/${g.id}?item=${id}">${id}</a>`).join(' ')}</div></div>`).join(''):'<div class="empty-state"><h2>No matching captures</h2><p>This group has no selected captures. Check the criterion-level evidence and limits.</p></div>'}</div>`;
    } else {
      content.innerHTML = `<div class="criterion-list-heading"><span>${matching.length===g.criteria.length?'All '+g.criteria.length:matching.length+' of '+g.criteria.length} subfeatures</span><span class="helper-text">Assertions show what was checked. Review notes are personal.</span></div>${hasFilters()&&!route.params.has('item')?`<div class="active-filter-notice">GUI-QML catalog filters are applied here; Qt Widgets is the reference. Parity and requirement apply to ${filters.view==='groups'?'the whole feature group':'individual subfeatures'}. <button class="text-button" data-action="clear-filters">Show all subfeatures</button></div>`:''}<div class="criterion-list">${matching.length?matching.map(criterionCard).join(''):'<div class="empty-state"><h2>No subfeatures match the current filters</h2><button class="button" data-action="clear-filters">Clear filters</button></div>'}</div>`;
      const item = route.params.get('item');
      if (item && criterionMap.get(item)?.groupId===g.id) requestAnimationFrame(()=>{document.getElementById(item)?.scrollIntoView({block:'start'});});
    }
    document.title = g.name + ' · Bitcoin GUI evidence';
  }
  function renderTests() {
    const failedOnly = route.params.get('result')==='failed';
    const results = data.functional.filter(r=>!failedOnly || r.status==='failed').sort((a,b)=>a.test.localeCompare(b.test));
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">RECORDED AUTOMATION</div><h1>Test results</h1><p>The October 8 run, with its failures and coverage limits preserved.</p></div><a class="button" href="gui-feature-evidence/TEST-RESULTS.md" download>${icon('download')} Full report</a></section><div class="finding-panel"><div class="finding-icon">!</div><div><span class="eyebrow">ONE UNRESOLVED FAILURE</span><h2>Recipient-note preservation</h2><p><code>qml_test_send_create</code> fails when it expects the first recipient’s private note to remain after editing that recipient again. No product fix or assertion suppression was applied.</p><div class="finding-links"><a href="#feature/F09?item=F09.S03">Inspect feature evidence →</a><a href="gui-feature-evidence/logs/qml_test_send_create.log" target="_blank" rel="noopener">Read the failure log ↗</a></div></div></div><div class="suite-grid">${Object.entries(data.summary.qtest).map(([key,suite])=>`<a class="suite-card" href="gui-feature-evidence/logs/${key}.log" target="_blank" rel="noopener"><span class="small-label">${{'qml-unit-tests':'QML C++ tests','qml-quick-tests':'QML component tests','widgets-qt-tests':'Widgets Qt tests'}[key]}</span><strong>${suite.passed}<span> passed</span></strong><span class="suite-meta">${suite.failed} failed · ${suite.skipped} skipped ${icon('external')}</span></a>`).join('')}</div><p class="helper-text">QTest totals include setup, cleanup, and data-driven cases. They are not counts of independent user capabilities.</p><section class="content-panel"><div class="section-heading"><h2>QML functional scripts <span class="count-badge">34</span></h2><div class="segmented"><a href="#tests" ${!failedOnly?'aria-current="page"':''}>All results</a><a href="#tests?result=failed" ${failedOnly?'aria-current="page"':''}>Failures <span class="failure-count">1</span></a></div></div><div class="table-scroll"><table class="tests-table functional-table"><thead><tr><th>Script</th><th>Result</th><th>Duration</th><th>Raw captures</th><th>Log</th></tr></thead><tbody>${results.map(r=>`<tr class="${r.status==='failed'?'failed-row':''}"><td><code>${escape(r.test)}</code></td><td><span class="badge badge-${r.status==='failed'?'gap':'assertions'}"><span class="badge-dot"></span>${r.status==='failed'?'Failed':'Passed'}</span></td><td>${r.seconds}s</td><td>${r.captures}</td><td><a href="gui-feature-evidence/${r.log}" target="_blank" rel="noopener" aria-label="Open ${r.test} log">Open log ↗</a></td></tr>`).join('')}</tbody></table></div></section><section class="content-panel"><h2>Additional live assertions</h2><div class="assertion-links">${[['Widgets GUI, RPC, files & clipboard',39,'widgets-checks.json'],['QML wallet & coin controls',6,'qml-additional-checks.json'],['QML native Linux tray & exit',3,'qml-native-shell-checks.json']].map(([label,count,file])=>`<a href="gui-feature-evidence/logs/${file}" target="_blank" rel="noopener"><span>${label}</span><span class="badge badge-assertions">${count} passed ↗</span></a>`).join('')}</div></section><details class="content-panel detailed-report"><summary>Full report, reproduction steps & validation limits</summary><div class="prose">${data.testReportHtml}</div></details>`;
  }
  function renderAbout() {
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">SCOPE & PROVENANCE</div><h1>About this evidence</h1><p>A traceable snapshot for human review.</p></div><a class="button" href="gui-feature-evidence/PROVENANCE.md" download>${icon('download')} Provenance</a></section><section class="how-to-grid"><article><span class="step-number">01</span><h2>Find a capability</h2><p>Search all 203 subfeatures or browse the 34 groups. Filter GUI-QML by parity, partial parity, or missing implementation. Evidence coverage is a separate filter, and Qt Widgets stays visible as the reference.</p></article><article><span class="step-number">02</span><h2>Inspect the evidence</h2><p>Compare captures, read assertion scope, and follow modules and test logs. Screenshots show a state; they do not prove every behavior.</p></article><article><span class="step-number">03</span><h2>Keep a review record</h2><p>Mark items reviewed or flag follow-up. Set whether they are needed for merge, needed for release, or not needed. Your choices and notes stay in your browser; export and import them to keep or share your work.</p></article></section><section class="content-panel"><h2>Implementation parity</h2><div class="status-guide">${[['parity','The main user goal is achieved through a reasonably usable workflow. Different controls, file transfer instead of clipboard transfer, or straightforward extra steps can still count as fully implemented.'],['partial','An important part of the user goal remains unavailable or broken; the difference affects the outcome rather than just the workflow.'],['not-implemented','The main user goal has no supported workflow. A related capability alone does not fulfill that goal.']].map(([status,meaning])=>`<div>${parityBadge({status})}<p>${meaning}</p></div>`).join('')}</div><p class="helper-text">These are rough judgments of user outcomes, not acceptance decisions. Each group has an explicit main goal and rationale; its rating is not an all-subfeatures tally. A group can achieve its main goal while secondary subfeatures remain missing. Conversely, critical in-app dialogs do not implement the desktop-notification channel. In Groups view the parity filter applies to the whole group; in Subfeatures view it applies to each subfeature. Missing captures and untested hardware do not by themselves reduce implementation parity. RPC capability counts when the Widgets baseline also permits RPC.</p><p class="helper-text"><a href="implementation.json" target="_blank" rel="noopener">Group and subfeature assessments and reasons ↗</a> · Based on the pinned source comparison, with recorded functional failures included.</p></section><section class="content-panel"><h2>Merge and release requirements</h2><p class="helper-text">Set a group default on its feature page, or change a subfeature through its review button. Full-parity groups and subfeatures default to Needed for merge; partial and missing items stay Unassigned. A saved group choice overrides those automatic defaults for subfeatures without individual overrides. Existing choices, including Unassigned, are preserved. These defaults use implementation parity and do not mark anything reviewed or accepted. Needed for merge means it must be ready before merging; Needed for release means it can wait until release; Not needed explicitly excludes it. Unassigned means no decision yet. In Groups view the requirement filter uses the group choice; in Subfeatures view it uses each effective choice, including group defaults. Requirement choices are personal review data, separate from implementation parity and review status. Export includes both group choices and individual overrides; older review files remain importable.</p></section><section class="content-panel"><h2>Full and partial evidence</h2><p class="helper-text">Full means this GUI-QML subfeature has both targeted automated evidence and a matching capture, with no recorded failure. Partial includes limited assertions, missing captures, source-only evidence, and missing GUI workflows. These filters describe the collected evidence, not acceptance or coverage of every platform and variant.</p></section><section class="content-panel"><h2>What the detailed evidence levels mean</h2><div class="status-guide">${[['assertions','Automated assertions','A targeted live assertion or scoped automated test supports the stated behavior. Read its limits before accepting broader variants.'],['limited','Limited evidence','Only some variants or behaviors are covered, or a known test failure remains.'],['visual','Visual evidence only','A real screenshot is available, without a targeted runtime assertion for this exact criterion.'],['source','Source / related tests','Implementation or a related suite is available. No targeted runtime proof was collected for this criterion.'],['gap','Missing GUI workflow','The source comparison found no reachable graphical workflow. Backend RPC availability is a separate capability.']].map(([status,label,text])=>`<div>${badge({status,label})}<p>${text}</p></div>`).join('')}</div></section><section class="scope-panel"><h2>Boundaries of this snapshot</h2><p>Linux X11 and synthetic regtest wallets. Physical hardware wallets, macOS, Windows, live Tor routing, router mapping, and full mainnet synchronization were not validated in this collection.</p><p>The applications use different pinned Core revisions and Qt builds. Full lint, clang-tidy, sanitizer, ancestor-commit, and IPC-enabled CI was not run. Missing evidence stays visible; nothing is accepted automatically.</p></section><div class="source-cards">${Object.entries(data.revisions).map(([app,rev])=>`<a href="https://github.com/bitcoin-core/${app==='qml'?'gui-qml':'gui'}/commit/${rev}" target="_blank" rel="noopener"><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]}</span><code>${rev.slice(0,12)}</code>${icon('external')}</a>`).join('')}</div><details class="content-panel detailed-report"><summary>Builds, fixtures, capture method & reproduction</summary><div class="prose">${data.provenanceHtml}</div></details><section class="content-panel"><h2>Original records</h2><div class="record-links">${[['Markdown evidence index','gui-feature-evidence/README.md'],['Feature comparison','bitcoin-core-gui-supported-features.md'],['Criterion coverage','gui-feature-evidence/coverage.json'],['Capture timestamps & hashes','gui-feature-evidence/selected-captures.json'],['Evidence integrity results','gui-feature-evidence/logs/evidence-validation.json'],['Binary hashes','gui-feature-evidence/binaries.json']].map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div></section>`;
  }
  function renderNavigation() {
    $('#feature-navigation').innerHTML = data.areas.map(area=>`<details open><summary>${escape(area.label)}<span>${data.groups.filter(g=>g.area===area.id).length}</span></summary>${data.groups.filter(g=>g.area===area.id).map(g=>`<a href="#feature/${g.id}" data-group-link="${g.id}" title="${escape(g.name)}"><span class="nav-feature-id">${g.id.slice(1)}</span><span>${escape(g.name)}</span></a>`).join('')}</details>`).join('');
  }
  function readRoute() {
    const [path, query=''] = location.hash.slice(1).split('?');
    const [page, groupId] = path.split('/');
    route = {page:page || 'catalog', groupId, params:new URLSearchParams(query)};
    if (route.page==='catalog' && query) {
      filters = {...defaults};
      const legacyEvidence = {assertions:'full', limited:'partial', visual:'partial', source:'partial', gap:'partial'};
      const previousEvidence = route.params.get('evidence');
      if (legacyEvidence[previousEvidence]) route.params.set('evidence', legacyEvidence[previousEvidence]);
      const allowed = {parity:['any','parity','partial','not-implemented'], requirement:['any',...Object.keys(requirementLabels)], evidence:['any','full','partial'], area:['all',...data.areas.map(a=>a.id)], review:['any',...permittedStates], captures:['any','yes','no'], view:['groups','criteria']};
      for (const key of Object.keys(defaults)) {
        const value = route.params.get(key);
        if (value!==null && (key==='q' || allowed[key].includes(value))) filters[key] = value;
      }
      if (route.params.has('app') || legacyEvidence[previousEvidence]) saveFilterRoute();
    }
  }
  function render() {
    readRoute();
    $('#main').dataset.route=location.hash;
    if (route.page==='main') { $('#main').focus(); return; }
    const title = route.page==='feature' ? groupMap.get(route.groupId)?.name || 'Feature' : {catalog:'Feature catalog', tests:'Test results', about:'About this evidence'}[route.page] || 'Feature catalog';
    $('#breadcrumb-current').textContent = title;
    document.title = title + ' · Bitcoin GUI evidence';
    $$('[data-nav]').forEach(a=>{a.removeAttribute('aria-current');if(a.dataset.nav===route.page || (route.page==='feature'&&a.dataset.nav==='catalog'))a.setAttribute('aria-current','page');});
    $$('[data-group-link]').forEach(a=>{a.removeAttribute('aria-current');if(route.page==='feature' && a.dataset.groupLink===route.groupId)a.setAttribute('aria-current','page');});
    if (route.page==='feature') renderGroup();
    else if (route.page==='tests') renderTests();
    else if (route.page==='about') renderAbout();
    else renderCatalog();
    updateProgress();
  }
  function saveFilterRoute() {
    if (route.page!=='catalog') return;
    const params = new URLSearchParams();
    for (const [key,value] of Object.entries(filters)) if (value!==defaults[key]) params.set(key,value);
    history.replaceState(null,'','#catalog'+(params.size?'?'+params.toString():''));
  }
  function refreshFilters() {
    if (route.page==='catalog') { saveFilterRoute(); renderCatalogResults(); }
    else { const top=window.scrollY; renderGroup(); window.scrollTo(0,top); }
  }
  function setNavigation(open) {
    document.body.classList.toggle('navigation-open',open);
    $('.workspace').inert=open;
    document.body.style.overflow=open?'hidden':'';
    $('#nav-backdrop').hidden=!open;
    $('#open-navigation').setAttribute('aria-expanded',String(open));
    if (open) $('#close-navigation').focus();
  }
  function showCapture(path, list) {
    captureList=list.filter(p=>captureMap.has(p));
    captureIndex=Math.max(0,captureList.indexOf(path));
    updateCapture();
    if (!$('#capture-dialog').open) $('#capture-dialog').showModal();
  }
  function updateCapture() {
    const photo=captureMap.get(captureList[captureIndex]);
    if (!photo) return;
    const src='gui-feature-evidence/'+photo.path;
    $('#capture-title').textContent=photo.caption;
    $('#capture-application').textContent=appNames[photo.application]+' · ORIGINAL APPLICATION CAPTURE';
    $('#capture-image').src=src;
    $('#capture-image').alt=photo.caption;
    $('#capture-original').href=src;
    $('#capture-counter').textContent=`${captureIndex+1} / ${captureList.length}`;
    $('#capture-prev').disabled=captureIndex===0;
    $('#capture-next').disabled=captureIndex===captureList.length-1;
    $('#capture-canvas').classList.remove('actual-size');
    $('#capture-zoom').textContent='Actual size';
    $('#capture-metadata').innerHTML=`<span>${photo.width} × ${photo.height} pixels · ${escape(photo.utc)}</span><code>SHA-256 ${escape(photo.sha256)}</code><span>Criteria: ${photo.features.map(escape).join(', ')}</span>`;
  }
  function openReview(id) {
    const criterion=criterionMap.get(id), group=groupMap.get(id); if(!criterion && !group)return;
    editingReview=id;
    $('#review-criterion-id').textContent=id+(group?' · GROUP REQUIREMENT':' · MY REVIEW');
    $('#review-title').textContent=group ? group.name : criterion.intent;
    $('#review-detail-fields').hidden=!!group;
    $('#review-requirement').innerHTML=options([
      ...(criterion ? [['inherit',`Use default (${requirementLabels[inheritedRequirement(id)]})`]] : []),
      ...Object.entries(requirementLabels)
    ],reviewFor(id).requirement);
    $('#requirement-help').textContent=group ? 'Full-parity groups default to Needed for merge. Saving a group choice applies it to subfeatures without individual overrides.' : 'Use the saved group choice, or the parity default if none is saved. Full parity defaults to Needed for merge; other items stay Unassigned. You can override either default.';
    $('#review-form button[type="submit"]').textContent=group ? 'Save requirement' : 'Save review';
    $('#review-state').value=reviewFor(id).status;
    $('#review-note').value=reviewFor(id).note;
    $('#review-dialog').showModal();
  }
  async function copyCriterionLink(id) {
    const c=criterionMap.get(id);
    const url=new URL(location.href); url.hash='feature/'+c.groupId+'?item='+id;
    try { await navigator.clipboard.writeText(url.href); notify('Link copied.'); }
    catch {
      const input=document.createElement('textarea');input.value=url.href;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();
      const copied=document.execCommand('copy');input.remove();notify(copied?'Link copied.':'Copy the link from your address bar.');
      if(!copied)location.hash=url.hash;
    }
  }
  document.addEventListener('click', event=>{
    const element=event.target.closest('button, a'); if(!element)return;
    if(element.classList.contains('skip-link')){event.preventDefault();$('#main').focus();return;}
    if(element.dataset.closeDialog)document.getElementById(element.dataset.closeDialog).close();
    if(element.dataset.area){filters.area=element.dataset.area;refreshFilters();}
    if(element.dataset.view){filters.view=element.dataset.view;refreshFilters();}
    if(element.dataset.action==='clear-filters'){
      filters={...defaults};saveFilterRoute();render();
    }
    if(element.dataset.capture)showCapture(element.dataset.capture,element.dataset.captureList.split('|'));
    if(element.dataset.review)openReview(element.dataset.review);
    if(element.dataset.copy)copyCriterionLink(element.dataset.copy);
    if(element.closest('.sidebar') && element.tagName==='A')setNavigation(false);
  });
  document.addEventListener('change',event=>{if(event.target.dataset.filter){filters[event.target.dataset.filter]=event.target.value;refreshFilters();}});
  document.addEventListener('input',event=>{if(event.target.id==='catalog-search'){filters.q=event.target.value;refreshFilters();}});
  $('#review-form').addEventListener('submit',event=>{
    event.preventDefault();
    if (!editingReview) return;
    const previous=reviewFor(editingReview), group=groupMap.has(editingReview);
    reviews[editingReview]={status:group?previous.status:$('#review-state').value,note:group?previous.note:$('#review-note').value.trim(),requirement:$('#review-requirement').value,updatedAt:new Date().toISOString()};
    persist();$('#review-dialog').close();const top=window.scrollY;render();window.scrollTo(0,top);notify(storageAvailable?'Review saved in this browser.':'Review kept for this session. Export to save.');
  });
  $('#export-review').addEventListener('click',()=>{
    const payload={schemaVersion:2,catalogId:data.catalogId,evidenceDate:data.summary.date,sourceRevisions:data.revisions,exportedAt:new Date().toISOString(),reviews};
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bitcoin-gui-review-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Review exported.');
  });
  $('#import-review').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>4_000_000)throw new Error('The review file is too large.');
      const payload=JSON.parse(await file.text());
      if(![1,2].includes(payload.schemaVersion))throw new Error('This review file version is not supported.');
      if(payload.catalogId!==data.catalogId)throw new Error('This review belongs to a different evidence snapshot.');
      const incoming=validateReviews(payload.reviews);let conflicts=0;
      for(const [id,value] of Object.entries(incoming)){
        if(reviews[id] && JSON.stringify(reviews[id])!==JSON.stringify(value)){conflicts++;continue;}
        reviews[id]=value;
      }
      persist();render();notify(conflicts?`Imported reviews. Kept ${conflicts} existing records where they differed.`:'Review imported.');
    } catch(error){notify(error.message || 'Unable to import this review.');}
    event.target.value='';
  });
  $('#open-navigation').addEventListener('click',()=>setNavigation(true));
  $('#close-navigation').addEventListener('click',()=>{setNavigation(false);$('#open-navigation').focus();});
  $('#nav-backdrop').addEventListener('click',()=>setNavigation(false));
  $('#capture-prev').addEventListener('click',()=>{if(captureIndex>0){captureIndex--;updateCapture();}});
  $('#capture-next').addEventListener('click',()=>{if(captureIndex<captureList.length-1){captureIndex++;updateCapture();}});
  $('#capture-zoom').addEventListener('click',()=>{const actual=$('#capture-canvas').classList.toggle('actual-size');$('#capture-zoom').textContent=actual?'Fit to window':'Actual size';});
  document.addEventListener('keydown',event=>{
    const inDialog=!!$('dialog[open]');
    if($('#capture-dialog').open && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();$(event.key==='ArrowLeft'?'#capture-prev':'#capture-next').click();return;}
    if(event.key==='Escape' && document.body.classList.contains('navigation-open'))setNavigation(false);
    if(inDialog || event.target.matches('input, textarea, select') || event.target.isContentEditable)return;
    if(event.key==='/' || ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')){
      event.preventDefault();if(route.page!=='catalog')location.hash='catalog';setTimeout(()=>$('#catalog-search')?.focus(),0);
    }
  });
  window.addEventListener('hashchange',()=>{setNavigation(false);window.scrollTo(0,0);render();});
  window.addEventListener('storage',event=>{if(event.key===storageKey){try{reviews=validateReviews(JSON.parse(event.newValue||'{}'));render();}catch{notify('A saved review could not be read.');}}});
  renderNavigation();render();
})();
