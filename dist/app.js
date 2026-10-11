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
    tick: '<path d="m5 12 4 4L19 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
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
  const aliases = data.criterionAliases || {};
  const replacements = data.criterionReplacements;
  const removals = data.catalogAudit.removals || {};
  const originalMap = new Map(data.originalCriteria.map(c=>[c.id,c]));
  const captureMap = new Map(data.captures.map(p => [p.path, p]));
  const areaIcons = {wallets:'wallet', payments:'payments', activity:'activity', node:'network', application:'grid'};
  const appNames = {widgets:'Qt Widgets', qml:'GUI-QML'};
  const comparisonApps = ['widgets', 'qml'];
  const legacyStorageKey = 'bitcoin-gui-evidence-review-v4:' + data.catalogId;
  const storageKey = legacyStorageKey + ':' + data.catalogRevision;
  const previousStorageKeys = ['bitcoin-gui-evidence-review-v3:', 'bitcoin-gui-evidence-review-v2:', 'bitcoin-gui-evidence-review-v1:'].map(key=>key+data.catalogId);
  const defaults = {q:'', parity:'any', requirement:'any', evidence:'any', area:'all', review:'any', captures:'any', view:'groups'};
  let filters = {...defaults};
  let reviews = {};
  let priorReviews = {};
  let retiredReviews = {};
  let storageAvailable = true;
  let captureList = [];
  let captureIndex = 0;
  let editingReview = null;
  let toastTimer;
  let route = {page:'catalog', params:new URLSearchParams()};
  const reviewLabels = {unreviewed:'Not reviewed', reviewed:'Reviewed', followup:'Needs follow-up', accepted:'Accepted'};
  const permittedStates = ['default', ...Object.keys(reviewLabels)];
  const requirementLabels = {merge:'Needed for merge', release:'Needed for release', 'not-needed':'Not needed', unassigned:'Unassigned'};
  const automaticRequirement = id => (groupMap.get(id) || criterionMap.get(id) || originalMap.get(id)).implementation.status === 'parity' ? 'merge' : 'unassigned';
  const defaultRequirement = id => groupMap.has(id) ? automaticRequirement(id) : 'inherit';

  function validateReviews(records, current = false) {
    if (!records || typeof records !== 'object' || Array.isArray(records)) throw new Error('Review records are missing.');
    const clean = {};
    for (const [id, value] of Object.entries(records)) {
      if ((!(current ? criterionMap.has(id) : originalMap.has(id)) && !groupMap.has(id)) || !value || !permittedStates.includes(value.status) || typeof value.note !== 'string' || value.note.length > 10000) throw new Error('The file contains an invalid review record.');
      const requirement = value.requirement === undefined ? defaultRequirement(id) : value.requirement;
      if (!Object.hasOwn(requirementLabels, requirement) && !(originalMap.has(id) && requirement === 'inherit')) throw new Error('The file contains an invalid requirement.');
      clean[id] = {status:value.status, note:value.note, requirement, updatedAt:typeof value.updatedAt === 'string' ? value.updatedAt : null};
      if (!current && value.mergedIds !== undefined) {
        if (!Array.isArray(value.mergedIds) || value.mergedIds.some(source=>!originalMap.has(source) || !data.sourceTargets[source]?.includes(id))) throw new Error('The file contains an invalid merged review.');
        clean[id].mergedIds = [...new Set(value.mergedIds)];
      }
    }
    return clean;
  }
  function isAffected(id) {
    const c = criterionMap.get(id);
    return originalMap.has(id) && (!c || c.reviewMode === 'reassess' || c.reviewSources.length > 1 || data.sourceTargets[id].length > 1);
  }
  function validateEnvelope(payload) {
    const compatible = data.catalogAudit.compatibleReviewRevisions?.includes(payload.catalogRevision);
    if (payload.schemaVersion !== 4 || (payload.catalogRevision !== data.catalogRevision && !compatible)) throw new Error('This review belongs to a different catalog revision.');
    const current = validateReviews(payload.reviews, !compatible), prior = validateReviews(payload.priorReviews);
    const retired = validateReviews(payload.retiredReviews || {});
    if (Object.keys(retired).some(id=>!Object.hasOwn(removals,id))) throw new Error('The file contains an invalid retired review.');
    for (const [id, record] of Object.entries(current)) {
      if (criterionMap.has(id) || groupMap.has(id)) continue;
      if (!Object.hasOwn(removals,id) || (retired[id] && JSON.stringify(retired[id]) !== JSON.stringify(record))) throw new Error('The file contains an invalid review record.');
      retired[id] = record;
      delete current[id];
    }
    return {reviews:current, priorReviews:prior, retiredReviews:retired};
  }
  function reviewEnvelope() {
    return {schemaVersion:4,catalogRevision:data.catalogRevision,reviews,priorReviews,retiredReviews};
  }
  function restoreEnvelope(payload) {
    const clean = validateEnvelope(payload);
    reviews = clean.reviews; priorReviews = clean.priorReviews; retiredReviews = clean.retiredReviews;
  }
  try {
    const current = localStorage.getItem(storageKey);
    if (current !== null) restoreEnvelope(JSON.parse(current));
    else if (localStorage.getItem(legacyStorageKey) !== null) {
      restoreEnvelope(JSON.parse(localStorage.getItem(legacyStorageKey)));
      localStorage.setItem(storageKey, JSON.stringify(reviewEnvelope()));
    } else {
      const saved = previousStorageKeys.map(key=>localStorage.getItem(key)).find(value=>value!==null);
      if (saved) {
        priorReviews = validateReviews(JSON.parse(saved));
        for (const [id, record] of Object.entries(priorReviews)) if (!isAffected(id)) reviews[id] = {...record};
      }
    }
  } catch { storageAvailable = false; }

  function defaultReviewStatus(id) {
    const c = criterionMap.get(id);
    return c && c.implementation.status === 'parity' && evidenceCoverage(c) === 'full' ? 'accepted' : 'unreviewed';
  }
  function legacyChoices(id, includeResolved = false) {
    const c = criterionMap.get(id);
    if (!c || !isAffected(id)) return [];
    return c.reviewSources.flatMap(source=>{
      const old = originalMap.get(source.id), groupId = old.groupId;
      if (!includeResolved && source.id !== id && priorReviews[id]?.mergedIds?.includes(source.id)) return [];
      const individual = priorReviews[source.id], group = priorReviews[groupId];
      if (!individual && !group) return [];
      const record = individual || {status:'default',requirement:'inherit',note:'Inherited scope from '+groupId+'.',updatedAt:group.updatedAt};
      const inherited = groupId === c.groupId && !includeResolved ? (reviews[groupId] || group)?.requirement || automaticRequirement(id) : group?.requirement || (old.implementation.status === 'parity' ? 'merge' : 'unassigned');
      return [{...source, record, groupId, requirement:record.requirement === 'inherit' ? inherited : record.requirement}];
    });
  }
  function savedReviewFor(id) {
    if (reviews[id]) return reviews[id];
    const choices = legacyChoices(id);
    if (!choices.length) return {status:'default', note:'', requirement:defaultRequirement(id)};
    const c = criterionMap.get(id);
    const states = [...new Set(choices.map(c=>c.record.status).filter(s=>s !== 'default'))];
    const requirements = [...new Set(choices.map(c=>c.requirement))];
    const conflict = states.length > 1 || requirements.length > 1;
    const reassess = (c.reviewMode === 'reassess' || choices.some(c=>c.kind==='split')) && states.some(s=>['accepted','reviewed'].includes(s));
    const primary = choices.find(c=>c.id === id) || choices.find(c=>c.record.note) || choices[0];
    const inherit = choices.every(c=>c.record.requirement==='inherit' && c.groupId===criterionMap.get(id).groupId);
    return {status:conflict || reassess ? 'followup' : states[0] || 'default',
      note:primary.record.note, requirement:requirements.length>1?'unassigned':inherit?'inherit':requirements[0],
      updatedAt:primary.record.updatedAt, mergeConflict:conflict, needsReassessment:reassess};
  }
  function reviewFor(id) {
    const saved = savedReviewFor(id);
    return {...saved, status:saved.status === 'default' ? defaultReviewStatus(id) : saved.status};
  }
  function acceptanceBadge(id) {
    const status = reviewFor(id).status;
    const automatic = status === 'accepted' && savedReviewFor(id).status === 'default';
    const color = status === 'accepted' ? 'assertions' : status === 'followup' ? 'limited' : 'source';
    return `<span class="badge badge-${color} acceptance-badge" data-acceptance="${status}"${automatic?' title="Accepted by default: parity plus full GUI-QML evidence"':''}>${reviewLabels[status]}${automatic?' · evidence default':''}</span>`;
  }
  function inheritedRequirement(id) {
    const groupId = criterionMap.get(id).groupId;
    return reviews[groupId] || priorReviews[groupId] ? reviewFor(groupId).requirement : automaticRequirement(id);
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
  function reviewLabel(id) { return reviewLabels[reviewFor(id).status]; }
  function requirementPicker(id) {
    const choices = [['inherit', `Use default (${requirementLabels[inheritedRequirement(id)]})`], ...Object.entries(requirementLabels)];
    return `<label class="requirement-picker"><span class="requirement-picker-label" aria-hidden="true">${requirementBadge(id)}${icon('chevron')}</span><select data-set-requirement="${id}" aria-label="Acceptance scope for ${id}" title="Change acceptance scope for ${id}">${options(choices,reviewFor(id).requirement)}</select></label>`;
  }
  function reviewActions(id) {
    const review = reviewFor(id);
    const checked = review.status === 'accepted';
    const action = checked ? 'Reopen for review' : 'Accept';
    return `<div class="criterion-review-actions"><button type="button" class="quick-review" data-quick-review="${id}" aria-pressed="${checked}" aria-label="${action}: ${id}" title="${reviewLabel(id)} · ${action}">${icon('tick')}</button>${requirementPicker(id)}<button type="button" class="review-button review-${review.status}" data-review="${id}" aria-label="Review details for ${id}: ${reviewLabel(id)}" title="${reviewLabel(id)} · Open notes and review details">${icon('note')}Review details${review.note?'<span class="note-dot" title="Has a review note"></span>':''}</button></div>`;
  }
  function saveCardReview(id, changes, focusSelector, message) {
    const {mergeConflict, needsReassessment, ...saved} = savedReviewFor(id);
    reviews[id] = {...saved, ...changes, updatedAt:new Date().toISOString()};
    const top = window.scrollY;
    persist();
    render();
    const restorePosition = () => {
      ($(focusSelector) || $('#main')).focus({preventScroll:true});
      window.scrollTo(0,top);
    };
    restorePosition();
    // Keep the action in view even when a criterion deep link schedules a scroll.
    requestAnimationFrame(restorePosition);
    notify(storageAvailable ? message : 'Change kept for this session. Export to save.');
  }
  function notify(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(reviewEnvelope())); storageAvailable = true; }
    catch { storageAvailable = false; notify('Browser storage is unavailable. Export your review to save it.'); }
    updateProgress();
  }
  function updateProgress() {
    const accepted = criteria.filter(c => reviewFor(c.id).status === 'accepted').length;
    $('#review-progress-text').textContent = `${accepted} / ${criteria.length}`;
    $('#review-progress-bar').style.width = `${accepted / criteria.length * 100}%`;
    const gaps = criteria.filter(c=>c.implementation.status !== 'parity').length;
    $('.nav-count').textContent = gaps;
    $('.nav-count').title = `${gaps} subfeatures are partially or not implemented`;
    $('#storage-status').textContent = storageAvailable ? 'Saved in this browser' : 'Session only · export to save';
  }
  function evidenceCoverage(c) {
    const record = c.applications.qml;
    const sufficient = (record.status === 'assertions' && record.captures.length > 0) || hasQmlReview(c);
    return sufficient && !c.hasFailure ? 'full' : 'partial';
  }
  function hasQmlReview(c) {
    const review = c.qmlReview;
    if (!review || c.implementation.status !== 'parity' || c.hasFailure) return false;
    return review.basis === 'qml-tests-hooks' || (review.basis === 'reviewed-screenshot' && review.decision === 'accepted' && captureMap.get(review.capture)?.sha256 === review.sha256);
  }
  function evidenceBadge(c, app) {
    return app === 'qml' && hasQmlReview(c)
      ? `<span class="badge badge-assertions" data-evidence-basis="${escape(c.qmlReview.basis)}"><span class="badge-dot"></span>${c.qmlReview.basis==='reviewed-screenshot'?'Screenshot accepted':'QML + tests/hooks'}</span>`
      : badge(c.applications[app]);
  }
  function qmlReviewDetails(c) {
    const review = c.qmlReview;
    if (review.basis === 'reviewed-screenshot') return `<div class="qml-review"><p><strong>Sufficient for acceptance · Screenshot accepted</strong></p><p>${escape(review.reason)}</p><p class="helper-text">${escape(review.limits)}</p><p><a href="visual-acceptance.json">Recorded visual acceptance ↗</a></p></div>`;
    const sourceLink = (path, label = path.split('/').pop()) => `<a href="https://github.com/bitcoin-core/gui-qml/blob/${data.revisions.qml}/${escape(path)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
    return `<div class="qml-review"><p><strong>Sufficient for acceptance · QML + tests/hooks</strong></p><p><strong>Why this covers the feature:</strong> ${escape(review.reason)}</p><p><strong>User interface:</strong> ${review.qml.map(p=>sourceLink(p)).join(', ')}<br><strong>Connected modules:</strong> ${review.hooks.map(p=>sourceLink(p)).join(', ')}</p><p><strong>What the tests prove</strong></p>${testCoverageDetails(review)}<p class="helper-text"><strong>Coverage limits:</strong> ${escape(review.limits)} <a href="#about?section=hardware-platform">Review standard ↗</a></p></div>`;
  }
  function testCoverageDetails(review) {
    return `<ul class="test-coverage-list">${review.tests.map(t=>{
      const level = t.path.startsWith('test/functional/') ? 'Functional test' : t.path.startsWith('test/qml/') ? 'QML component test' : 'Unit test';
      return `<li><p><strong>${escape(t.label)}</strong> <span class="test-level">${level}</span></p><p class="test-coverage">${escape(t.covers)}</p><p><a href="https://github.com/bitcoin-core/gui-qml/blob/${data.revisions.qml}/${escape(t.path)}#L${t.sourceLine}" target="_blank" rel="noopener noreferrer" title="${escape(t.path)}">${escape(t.path.split('/').pop())}:${t.sourceLine} ↗</a> · <a href="gui-feature-evidence/${escape(t.log)}">Recorded pass ↗</a></p><details class="test-record"><summary>Exact recorded result</summary><code>${escape(t.recordedAssertion)}</code></details></li>`;
    }).join('')}</ul>`;
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
    if (filters.parity === 'incomplete' ? implementation.status === 'parity' : filters.parity !== 'any' && implementation.status !== filters.parity) return false;
    if (filters.requirement !== 'any' && requirementFor(filters.view === 'groups' ? c.groupId : c.id) !== filters.requirement) return false;
    if (filters.area !== 'all' && c.area !== filters.area) return false;
    if (filters.review === 'pending' ? reviewFor(c.id).status === 'accepted' : filters.review !== 'any' && reviewFor(c.id).status !== filters.review) return false;
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
    return `<div class="filter-panel"><div class="search-box">${icon('search')}<label class="sr-only" for="catalog-search">Search acceptance criteria, features, or evidence</label><input id="catalog-search" type="search" value="${escape(filters.q)}" placeholder="Search acceptance criteria, features, or evidence…" autocomplete="off"><kbd>/</kbd></div><div class="filter-row"><label class="filter-field">GUI-QML parity<select data-filter="parity">${options([['any','Any implementation'],['incomplete','Partial or not implemented'],...Object.entries(parityLabels)],filters.parity)}</select></label><label class="filter-field">Evidence coverage<select data-filter="evidence">${options([['any','Any evidence'],['full','Full'],['partial','Partial']],filters.evidence)}</select></label><label class="filter-field">GUI-QML captures<select data-filter="captures">${options([['any','With or without captures'],['yes','Has captures'],['no','No captures']],filters.captures)}</select></label><label class="filter-field">Acceptance scope<select data-filter="requirement">${options([['any','Any requirement'],...Object.entries(requirementLabels)],filters.requirement)}</select></label><label class="filter-field">Acceptance status<select data-filter="review">${options([['any','Any acceptance status'],['accepted','Accepted'],['pending','Not accepted'],['unreviewed','Not reviewed'],['followup','Needs follow-up'],['reviewed','Reviewed']],filters.review)}</select></label><button class="text-button clear-filters" data-action="clear-filters">Reset filters</button></div></div>`;
  }
  function areaChips() {
    return `<div class="area-chips" aria-label="Filter by feature area">${[{id:'all',label:'All features'},...data.areas].map(a => `<button class="area-chip ${filters.area === a.id ? 'selected' : ''}" data-area="${a.id}" aria-pressed="${filters.area === a.id}">${escape(a.label)}</button>`).join('')}</div>`;
  }
  function statsMarkup() {
    const partial = criteria.filter(c=>c.implementation.status === 'partial').length;
    const absent = criteria.filter(c=>c.implementation.status === 'not-implemented').length;
    const accepted = criteria.filter(c=>reviewFor(c.id).status === 'accepted').length;
    return `<div class="stats-grid"><div class="stat" data-stat="total"><span class="stat-label">Total subfeatures</span><strong>${criteria.length}</strong><span>Across ${data.groups.length} feature groups</span></div><a class="stat stat-link" data-stat="implementation" href="#catalog?parity=incomplete&view=criteria"><span class="stat-label">Criteria to implement ${icon('arrow')}</span><strong>${partial+absent}</strong><span>${partial} partial · ${absent} not implemented</span></a><a class="stat stat-link" data-stat="accepted" href="#catalog?review=accepted&view=criteria"><span class="stat-label">Accepted ${icon('arrow')}</span><strong>${accepted}</strong><span>Sufficient GUI-QML proof by default</span></a></div>`;
  }
  function coverageRow(g, app) {
    const counts = {assertions:0, reviewed:0, acceptedVisual:0, limited:0, visual:0, source:0, gap:0};
    g.criteria.forEach(c => { counts[app==='qml' && hasQmlReview(c)?c.qmlReview.basis==='reviewed-screenshot'?'acceptedVisual':'reviewed':c.applications[app].status]++; });
    const detail = Object.entries(counts).filter(([,v])=>v).map(([k,v])=>`${v} ${{assertions:'automated',reviewed:'QML + tests/hooks',acceptedVisual:'screenshot accepted',limited:'limited',visual:'visual',source:'source / related tests',gap:'missing'}[k]}`).join(' · ');
    return `<div class="coverage-row"><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]}</span><div class="coverage-track" role="img" aria-label="${escape(detail)}">${Object.entries(counts).filter(([,n])=>n).map(([k,n])=>`<span class="segment-${['reviewed','acceptedVisual'].includes(k)?'assertions':k}" style="width:${n/g.criteria.length*100}%" title="${n} ${k}"></span>`).join('')}</div><span class="coverage-description">${escape(detail)}</span></div>`;
  }
  function groupCard(g, matching) {
    const count = g.criteria.length;
    const accepted = g.criteria.filter(c => reviewFor(c.id).status === 'accepted').length;
    return `<a class="group-card" href="#feature/${g.id}"><div class="group-card-top"><span class="group-icon">${icon(areaIcons[g.area])}</span><span class="criterion-id">${g.id}</span>${g.criteria.some(c=>c.hasFailure)?'<span class="failure-marker" title="Contains a failing test">1 finding</span>':''}<span class="card-arrow">${icon('arrow')}</span></div><h2>${escape(g.name)}</h2><div class="group-meta"><span>${count} subfeatures</span><span class="meta-separator">·</span><span>${g.captures.length} captures</span>${matching < count ? `<span class="match-count">${matching} matching</span>` : ''}</div><div class="implementation-summary"><span class="small-label">GUI-QML</span>${parityBadge(g.implementation)}<span class="helper-text">Subfeature parity: ${paritySummary(g)}</span></div><div class="requirement-summary"><span class="small-label">Acceptance scope</span>${requirementBadge(g.id)}</div><div class="group-coverage">${comparisonApps.map(app=>coverageRow(g,app)).join('')}</div><div class="group-card-footer"><span>${accepted} of ${count} accepted</span><span>Review criteria <span aria-hidden="true">↗</span></span></div></a>`;
  }
  function criterionResult(c) {
    return `<a class="criterion-result" href="#feature/${c.groupId}?item=${c.id}"><div><span class="criterion-id">${c.id}</span><span class="result-group">${escape(groupMap.get(c.groupId).name)}</span><h2>${escape(c.intent)}</h2><div class="requirement-summary">${requirementBadge(c.id)} ${acceptanceBadge(c.id)}</div></div><div class="result-statuses">${comparisonApps.map(app=>`<div><span class="small-label">${appNames[app]}</span>${app==='qml'?parityBadge(c.implementation):''}${evidenceBadge(c,app)}</div>`).join('')}</div><span class="card-arrow">${icon('arrow')}</span></a>`;
  }
  function renderCatalogResults() {
    const matching = criteria.filter(matches);
    const groups = data.groups.map(g=>({group:g, rows:g.criteria.filter(matches)})).filter(r=>r.rows.length);
    $('#results-count').innerHTML = `<strong>${filters.view === 'groups' ? groups.length : matching.length}</strong> ${filters.view === 'groups' ? 'feature groups' : 'subfeatures'}<span class="muted"> · ${matching.length} of ${criteria.length} subfeatures match</span>`;
    $('#filter-scope').textContent = `Parity and acceptance scope filters apply to ${filters.view === 'groups' ? 'whole feature groups' : 'individual subfeatures (including group defaults)'}. Evidence and captures filter GUI-QML; Qt Widgets stays visible as the reference.`;
    const container = $('#catalog-results');
    container.className = filters.view === 'groups' ? 'group-grid' : 'criterion-results';
    container.innerHTML = matching.length ? (filters.view === 'groups' ? groups.map(r=>groupCard(r.group,r.rows.length)).join('') : matching.map(criterionResult).join('')) : `<div class="empty-state">${icon('search')}<h2>No matching acceptance criteria</h2><p>Try another search or loosen the filters.</p><button class="button" data-action="clear-filters">Clear filters</button></div>`;
    $$('.area-chip').forEach(el=>{el.classList.toggle('selected', el.dataset.area===filters.area);el.setAttribute('aria-pressed',el.dataset.area===filters.area);});
    $$('[data-view]').forEach(el=>{el.classList.toggle('selected',el.dataset.view===filters.view);el.setAttribute('aria-pressed',el.dataset.view===filters.view);});
    $('.clear-filters').classList.toggle('has-filters',hasFilters());
  }
  function renderCatalog() {
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">BITCOIN CORE / GUI-QML</div><h1>GUI-QML acceptance criteria</h1><p><strong>${criteria.length} subfeatures</strong> across <strong>${data.groups.length} feature groups</strong>. The remaining implementation count covers partial and missing GUI-QML outcomes.</p><p>Items with parity and sufficient GUI-QML proof default to <strong>Accepted</strong>. For hardware and platform integrations, reviewed QML workflows with tests/hooks are sufficient. Other proof gaps remain visible.</p></div><a class="subtle-link" href="#about">Acceptance guide ${icon('arrow')}</a></section>${statsMarkup()}<div class="snapshot-notice">${icon('info')}<p>${data.summary.selected_captures} application captures · <a href="#tests">${data.summary.qml_functional.passed} / ${data.functional.length} latest QML functional results passed</a> · Latest evidence: ${escape(data.latestEvidenceDate)}.</p></div>${filtersMarkup()}<p class="helper-text coverage-definition">Criteria to implement counts partial and missing outcomes. Acceptance status reflects evidence defaults and your saved decisions; acceptance scope sets what is needed for merge or release. <a class="subtle-link" href="#about">Acceptance guide ↗</a></p>${areaChips()}<div class="results-toolbar"><div><span id="results-count" aria-live="polite"></span><div class="filter-scope" id="filter-scope"></div></div><div class="segmented" aria-label="Catalog layout"><button data-view="groups" aria-pressed="true">${icon('grid')} Groups</button><button data-view="criteria" aria-pressed="false">Subfeatures</button></div></div><div id="catalog-results"></div><div class="evidence-legend"><span>Evidence level</span><span><i class="segment-assertions"></i>Automated / reviewed</span><span><i class="segment-limited"></i>Limited</span><span><i class="segment-visual"></i>Visual</span><span><i class="segment-source"></i>Source / related tests</span><span><i class="segment-gap"></i>Missing GUI</span></div>`;
    renderCatalogResults();
  }
  function capturePreview(path, list, compact=false) {
    const photo = captureMap.get(path);
    return `<button class="capture-preview ${compact?'compact':''}" data-capture="${escape(path)}" data-capture-list="${escape(list.join('|'))}" aria-label="Open capture: ${escape(photo.caption)}"><span class="capture-image-wrap"><img src="gui-feature-evidence/${escape(path)}" alt="${escape(photo.caption)}" loading="lazy" width="${photo.width}" height="${photo.height}"><span class="zoom-hint">${icon('image')} View capture</span></span><span class="capture-caption">${escape(photo.caption)}<span aria-hidden="true">↗</span></span></button>`;
  }
  function evidencePanel(c, app) {
    const record = c.applications[app];
    const pics = app==='qml' && hasQmlReview(c) && c.qmlReview.capture
      ? [...new Set([c.qmlReview.capture, ...record.captures])] : record.captures;
    return `<section class="application-evidence" aria-label="${appNames[app]} evidence for ${c.id}"><header><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]} <code>${app==='widgets'?'src/qt · reference':'qt6'}</code></span>${evidenceBadge(c,app)}</header>${app==='qml'?`<div class="parity-detail">${parityBadge(c.implementation)}<p>${escape(c.implementation.reason)}</p></div>`:''}<div class="evidence-description">${app==='qml' && hasQmlReview(c)?`${qmlReviewDetails(c)}<details class="recorded-evidence"><summary>Recorded captures and test scope</summary>${badge(record)}<div>${record.html}</div></details>`:record.html}</div>${pics.length ? `<div class="criterion-captures">${capturePreview(pics[0],pics)}${pics.length>1?`<div class="capture-strip">${pics.slice(1).map(path=>`<button data-capture="${escape(path)}" data-capture-list="${escape(pics.join('|'))}" aria-label="Open capture: ${escape(captureMap.get(path).caption)}"><img src="gui-feature-evidence/${escape(path)}" alt="${escape(captureMap.get(path).caption)}" loading="lazy"></button>`).join('')}<span>${pics.length} captures</span></div>`:''}</div>`:`<div class="no-capture">${icon('image')}<span>${record.status==='gap'?'No capture · GUI workflow absent':app==='qml' && hasQmlReview(c)?'Capture optional · QML + tests/hooks reviewed':'No matching capture collected'}</span></div>`}</section>`;
  }
  function criterionCard(c) {
    const review = reviewFor(c.id);
    return `<article class="criterion-card ${c.hasFailure?'has-finding':''}" id="${c.id}"><header class="criterion-card-heading"><div><span class="criterion-id">${c.id}</span> ${acceptanceBadge(c.id)}${c.hasFailure?'<span class="failure-marker">Test failure</span>':''}<h2>${escape(c.intent)}</h2>${c.mergedCriteria?`<p class="helper-text">Combines ${c.mergedCriteria.map(s=>escape(s.id)).join(' and ')}. <a href="#audit">Duplicate audit ↗</a></p>`:''}${review.mergeConflict?'<p class="helper-text">Earlier review decisions differ. Review details retains them; choose the current acceptance status and scope.</p>':''}${review.needsReassessment?'<p class="helper-text">The earlier review covered a different scope. Review this outcome before accepting it.</p>':''}</div><button class="icon-button copy-link" data-copy="${c.id}" aria-label="Copy link to ${c.id}" title="Copy link">#</button></header><div class="evidence-comparison">${comparisonApps.map(app=>evidencePanel(c,app)).join('')}</div>${c.checks?.length?`<div class="criterion-checks"><span class="small-label">Verification scenarios</span><ul>${c.checks.map(check=>`<li>${escape(check)}</li>`).join('')}</ul></div>`:''}${c.relatedCriteria?.length?`<div class="criterion-checks"><span class="small-label">Related outcomes</span><ul>${criterionLinks(c.relatedCriteria)}</ul></div>`:''}${c.sourceGroups.length>1?`<div class="criterion-checks"><span class="small-label">Source modules and tests</span><p>${c.sourceGroups.map(id=>`<a href="#feature/${id}?tab=tests">${id} · ${escape(groupMap.get(id).name)}</a>`).join(' · ')}</p></div>`:''}<footer class="criterion-footer"><a class="subtle-link" href="#feature/${c.groupId}?tab=tests">Modules & related tests ${icon('external')}</a>${reviewActions(c.id)}</footer>${review.note?`<div class="saved-note"><span class="small-label">Your note</span><p>${escape(review.note)}</p></div>`:''}</article>`;
  }
  function criterionLinks(ids) {
    return ids.map(id=>{const c=criterionMap.get(id);return `<li><a href="#feature/${c.groupId}?item=${id}"><strong>${id}</strong> · ${escape(c.intent)}</a></li>`;}).join('');
  }
  function renderRetiredCriterion(id) {
    if (removals[id]) { renderRemovedCriterion(id); return; }
    const old=originalMap.get(id), targets=replacements[id], prior=priorReviews[id];
    $('#main').innerHTML=`<a class="back-link" href="#feature/${old.groupId}">← ${escape(groupMap.get(old.groupId).name)}</a><section class="page-heading"><div><div class="eyebrow">${id} · SCOPE CONSOLIDATED</div><h1>${escape(old.intent)}</h1><p>This broad row is now reviewed through the specific outcomes below. Each is counted once in its owning group.</p></div></section><section class="content-panel"><h2>Review these outcomes</h2><ul class="replacement-links">${criterionLinks(targets)}</ul><p class="helper-text">Earlier acceptance is not automatically applied to every replacement. Original review records remain in your export and in the current criteria’s Review details.</p>${prior?`<div class="saved-note"><span class="small-label">Earlier ${id} review · ${escape(prior.status==='default'?'Evidence default':reviewLabels[prior.status])}</span><p>${escape(prior.note || 'No note recorded.')}</p></div>`:''}<a class="subtle-link" href="#audit">Applied audit ↗</a></section><details class="content-panel"><summary>Earlier evidence and limits</summary><div class="evidence-comparison">${comparisonApps.map(app=>evidencePanel(old,app)).join('')}</div></details>`;
  }
  function renderRemovedCriterion(id) {
    const old=originalMap.get(id), removal=removals[id];
    const notes=[['Saved review before removal',retiredReviews[id]],['Earlier review',priorReviews[id]]].filter(([,record])=>record);
    $('#main').innerHTML=`<a class="back-link" href="#feature/${old.groupId}">← ${escape(groupMap.get(old.groupId).name)}</a><section class="page-heading removed-criterion"><div><div class="eyebrow">${id} · REMOVED CRITERION</div><h1>Task access is covered by the individual features</h1><p>${escape(removal.reason)}</p><p>This item is excluded from acceptance counts and filters. Its saved review does not change any other criterion.</p></div></section><section class="content-panel"><h2>Individual feature groups</h2><ul>${removal.relatedGroups.map(fid=>`<li><a href="#feature/${fid}">${escape(groupMap.get(fid).name)}</a></li>`).join('')}</ul>${notes.map(([label,record])=>`<div class="saved-note"><span class="small-label">${escape(label)} · ${escape(record.status==='default'?'Evidence default':reviewLabels[record.status])} · ${escape(record.requirement==='inherit'?'Group scope':requirementLabels[record.requirement])}</span><p>${escape(record.note || 'No note recorded.')}</p></div>`).join('')}<a class="subtle-link" href="#audit">Applied audit ↗</a></section><details class="content-panel"><summary>Archived criterion and evidence</summary><h2>${escape(old.intent)}</h2><div class="evidence-comparison">${comparisonApps.map(app=>evidencePanel(old,app)).join('')}</div></details>`;
  }
  function groupTests(g) {
    const mapped = g.criteria.filter(c=>hasQmlReview(c) && c.qmlReview.basis === 'qml-tests-hooks');
    const coverage = mapped.length ? `<section class="content-panel"><h2>Tests mapped to subfeatures</h2><p class="helper-text">These assessments connect specific assertions to a user outcome. Each lists the tested behavior, the source connection and the limits of the proof.</p>${mapped.map(c=>`<article class="mapped-criterion"><h3><a href="#feature/${g.id}?item=${c.id}">${c.id} · ${escape(c.intent)}</a></h3>${qmlReviewDetails(c)}</article>`).join('')}</section>` : '';
    return `${coverage}<section class="content-panel"><div class="section-heading"><h2>Implementation modules</h2><span class="small-label">Pinned source revisions</span></div><div class="prose module-list">${g.modulesHtml}</div></section><section class="content-panel"><div class="section-heading"><h2>Related automated tests & assertions</h2><a class="subtle-link" href="#tests">All test results ↗</a></div><p class="helper-text">These tests are related to this feature group. A module name or a passing suite alone does not prove every subfeature. Use the recorded assertions and coverage limits to assess each outcome.</p><div class="table-scroll"><table class="tests-table"><thead><tr><th>Application</th><th>Test / module</th><th>Recorded result</th></tr></thead><tbody>${g.tests.map(t=>`<tr class="${t.failed?'failed-row':''}"><td>${escape(t.application)}</td><td>${t.testHtml}</td><td>${t.resultHtml}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function renderGroup() {
    const g = groupMap.get(route.groupId);
    if (!g) { $('#main').innerHTML = '<div class="empty-state"><h1>Feature not found</h1><p>The link does not match a feature in this snapshot.</p><a class="button" href="#catalog">Open acceptance criteria</a></div>'; return; }
    const tab = ['evidence','tests','captures'].includes(route.params.get('tab')) ? route.params.get('tab') : 'evidence';
    const area = data.areas.find(a=>a.id===g.area);
    const previous = data.groups[g.number-2], next = data.groups[g.number];
    const matching = route.params.has('item') ? g.criteria : g.criteria.filter(matches);
    $('#main').innerHTML = `<a class="back-link" href="#catalog">← Acceptance criteria</a><section class="page-heading feature-heading"><div><div class="eyebrow">${g.id} <span class="eyebrow-divider">/</span> ${escape(area.label)}</div><h1>${escape(g.name)}</h1><div class="implementation-summary"><span class="small-label">GUI-QML</span>${parityBadge(g.implementation)}<span class="helper-text">Subfeature parity: ${paritySummary(g)}</span></div><div class="group-meta"><span>${g.criteria.length} subfeatures</span><span>·</span><span>${g.captures.length} captures</span><span>·</span><span>Proposed acceptance criteria</span></div></div><div class="feature-pagination">${previous?`<a class="icon-button" href="#feature/${previous.id}" aria-label="Previous feature: ${escape(previous.name)}">←</a>`:'<span></span>'}${next?`<a class="icon-button" href="#feature/${next.id}" aria-label="Next feature: ${escape(next.name)}">→</a>`:''}</div></section><section class="content-panel outcome-assessment"><div class="eyebrow">GUI-QML IMPLEMENTATION ASSESSMENT</div><h2>Main user goal</h2><p class="outcome-goal">${escape(g.implementation.goal)}</p><p class="helper-text">${escape(g.implementation.reason)}</p><div class="group-requirement"><div><span class="small-label">Acceptance scope</span><p class="helper-text">Full parity defaults to Needed for merge. A saved group choice applies to criteria without overrides.</p></div><button class="button" data-review="${g.id}" aria-label="Set requirement for ${escape(g.name)}">${requirementBadge(g.id)}<span>Change</span></button></div></section><details class="implementation-note"><summary>Detailed implementation differences <span>Pinned source comparison</span></summary><p class="helper-text">This original comparison lists individual differences. The outcome assessment allows equivalent workflows and secondary differences when the main user goal is achieved.</p><div class="prose">${g.comparisonHtml}${g.supportHtml?`<p class="baseline-note">${g.supportHtml}</p>`:''}</div></details><div class="feature-tabs-row"><nav class="feature-tabs" aria-label="Feature sections">${[['evidence','Subfeatures & evidence'],['tests','Modules & tests'],['captures','All captures']].map(([key,label])=>`<a href="#feature/${g.id}?tab=${key}" ${tab===key?'aria-current="page"':''}>${label}${key==='captures'?` <span>${g.captures.length}</span>`:''}</a>`).join('')}</nav></div>${g.relatedCriteria.length?`<section class="content-panel related-criteria"><h2>Related outcomes, counted elsewhere</h2><ul>${criterionLinks(g.relatedCriteria)}</ul></section>`:''}<div id="feature-content"></div><div class="feature-bottom-links"><a href="${g.markdown}" download>Download the original evidence page ${icon('download')}</a><a href="#catalog">Back to acceptance criteria ↑</a></div>`;
    const content = $('#feature-content');
    if (tab==='tests') content.innerHTML = groupTests(g);
    else if (tab==='captures') {
      const pics = g.captures;
      content.innerHTML = `<p class="helper-text gallery-intro">Original application captures. Select an image to inspect it at full size and view its timestamp and hash.</p><div class="capture-gallery">${pics.length?pics.map(path=>`<div class="gallery-card"><span class="application-label"><span class="app-dot ${captureMap.get(path).application}"></span>${appNames[captureMap.get(path).application]}</span>${capturePreview(path,pics,true)}<div class="capture-criteria">${captureMap.get(path).features.filter(id=>id.startsWith(g.id+'.')).map(id=>`<a href="#feature/${g.id}?item=${id}">${id}</a>`).join(' ')}</div></div>`).join(''):'<div class="empty-state"><h2>No matching captures</h2><p>This group has no selected captures. Check the criterion-level evidence and limits.</p></div>'}</div>`;
    } else {
      content.innerHTML = `<div class="criterion-list-heading"><span>${matching.length===g.criteria.length?'All '+g.criteria.length:matching.length+' of '+g.criteria.length} subfeatures</span><span class="helper-text">Each subfeature is a proposed acceptance criterion. Review its outcome and evidence.</span></div>${hasFilters()&&!route.params.has('item')?`<div class="active-filter-notice">GUI-QML catalog filters are applied here; Qt Widgets is the reference. Parity and acceptance scope apply to ${filters.view==='groups'?'the whole feature group':'individual subfeatures'}. <button class="text-button" data-action="clear-filters">Show all subfeatures</button></div>`:''}<div class="criterion-list">${matching.length?matching.map(criterionCard).join(''):'<div class="empty-state"><h2>No subfeatures match the current filters</h2><button class="button" data-action="clear-filters">Clear filters</button></div>'}</div>`;
      const item = route.params.get('item');
      if (item && criterionMap.get(item)?.groupId===g.id) requestAnimationFrame(()=>{document.getElementById(item)?.scrollIntoView({block:'start'});});
    }
    document.title = g.name + ' · GUI-QML acceptance';
  }
  function renderTests() {
    const failedOnly = route.params.get('result')==='failed';
    const results = data.functional.filter(r=>!failedOnly || r.status==='failed').sort((a,b)=>a.test.localeCompare(b.test));
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">RECORDED AUTOMATION</div><h1>Test results</h1><p>Latest recorded evidence for GUI-QML acceptance, with the date of each result shown below. Dated capture collections, reruns and original reports are available at the end of this page.</p></div><a class="button" href="gui-feature-evidence/TEST-RESULTS.md" download>${icon('download')} Original report</a></section><div class="suite-grid">${Object.entries(data.summary.qtest).map(([key,suite])=>`<a class="suite-card" href="gui-feature-evidence/logs/${key}.log" target="_blank" rel="noopener"><span class="small-label">${{'qml-unit-tests':'QML C++ tests','qml-quick-tests':'QML component tests','widgets-qt-tests':'Widgets Qt tests'}[key]}</span><strong>${suite.passed}<span> passed</span></strong><span class="suite-meta">${suite.failed} failed · ${suite.skipped} skipped ${icon('external')}</span></a>`).join('')}</div><p class="helper-text">QTest totals include setup, cleanup, and data-driven cases. They are not counts of independent user capabilities.</p><section class="content-panel"><div class="section-heading"><h2>QML functional scripts <span class="count-badge">${data.functional.length}</span></h2><div class="segmented"><a href="#tests" ${!failedOnly?'aria-current="page"':''}>All results</a><a href="#tests?result=failed" ${failedOnly?'aria-current="page"':''}>Failures <span class="failure-count">${data.summary.qml_functional.failed}</span></a></div></div><div class="table-scroll"><table class="tests-table functional-table"><thead><tr><th>Script</th><th>Result</th><th>Recorded</th><th>Duration</th><th>Raw captures</th><th>Log</th></tr></thead><tbody>${results.map(r=>`<tr class="${r.status==='failed'?'failed-row':''}"><td><code>${escape(r.test)}</code></td><td><span class="badge badge-${r.status==='failed'?'gap':'assertions'}"><span class="badge-dot"></span>${r.status==='failed'?'Failed':'Passed'}</span></td><td>${escape(r.date || data.summary.date)}${r.testModified?'<br>'+escape(r.testVariant || 'Corrected script'):''}</td><td>${r.seconds}s</td><td>${r.captures}</td><td><a href="gui-feature-evidence/${r.log}" target="_blank" rel="noopener" aria-label="Open ${r.test} log">Open log ↗</a></td></tr>`).join('') || '<tr><td colspan="6">No unresolved failures in the latest recorded results.</td></tr>'}</tbody></table></div></section><section class="content-panel"><h2>Additional live assertions</h2><div class="assertion-links">${[['Widgets GUI, RPC, files & clipboard',39,'widgets-checks.json'],['QML wallet & coin controls',6,'qml-additional-checks.json'],['QML native Linux tray & exit',3,'qml-native-shell-checks.json']].map(([label,count,file])=>`<a href="gui-feature-evidence/logs/${file}" target="_blank" rel="noopener"><span>${label}</span><span class="badge badge-assertions">${count} passed ↗</span></a>`).join('')}${data.collections.map(c=>`<a href="gui-feature-evidence/collections/${c.id}/logs/checks.json" target="_blank" rel="noopener"><span>${escape(c.title)} · ${escape(c.date)}</span><span class="badge badge-${c.failedAssertions?'limited':'assertions'}">${c.assertions-(c.failedAssertions||0)} passed${c.failedAssertions?' · '+c.failedAssertions+' failed':''} ↗</span></a>`).join('')}</div></section>${data.collections.map(c=>`<details class="content-panel detailed-report" data-collection="${escape(c.id)}"><summary>${escape(c.date)} — ${escape(c.title)}</summary><div class="prose">${c.reportHtml}</div></details>`).join('')}${data.reruns.map(r=>`<details class="content-panel detailed-report" data-rerun="${escape(r.id)}"><summary>${escape(r.date)} rerun — diagnosis, evidence and reproduction</summary><div class="prose">${r.reportHtml}</div></details>`).join('')}<details class="content-panel detailed-report"><summary>October 8 original report and validation limits</summary><div class="prose">${data.testReportHtml}</div></details>`;
  }
  function renderAbout() {
    $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">GUI-QML / ACCEPTANCE PROCESS</div><h1>Define GUI-QML acceptance</h1><p>${data.groups.length} feature groups contain ${criteria.length} subfeatures. Each current subfeature is counted once. Related outcomes in other groups link to that same criterion. Criteria to implement counts partial and missing GUI-QML outcomes; fully implemented outcomes with incomplete proof can be found using the evidence filters.</p></div><a class="button" href="gui-feature-evidence/PROVENANCE.md" download>${icon('download')} Provenance</a></section><section class="content-panel acceptance-definition"><h2>What are acceptance criteria?</h2><p class="helper-text">Acceptance criteria are the conditions reviewers agree must be met before required work is ready. Here, each criterion describes a user outcome GUI-QML should support. Reviewers decide whether that outcome is needed for merge or release, then check whether the evidence demonstrates it.</p><p class="helper-text">The catalog retains all ${criteria.length} subfeatures. The remaining implementation count includes only partial and missing outcomes. Acceptance and evidence are tracked separately, so fully implemented items that need proof stay visible.</p><div class="prose"><p><strong>Example — <a href="#feature/F13?item=F13.S05">Create and Export PSBT</a></strong></p><p>A user can transfer an unsigned transaction to another signing application, preserving the proposed recipients and amounts.</p><p>To assess that outcome, export a PSBT and verify that a signing application can open it with the same recipients and amounts. Captures show the workflow; targeted checks provide evidence that the transaction was preserved. Reviewers agree which wallet types and environments the proof needs to cover.</p><p><strong>Accepted by default</strong> means the subfeature has parity and sufficient GUI-QML proof, with no unresolved recorded failure. Proof can be targeted automation with a matching capture, a reviewed QML workflow with connected QML and tests/hooks, or an explicit acceptance of a screenshot for that criterion. Qt Widgets proof is the reference; it does not establish GUI-QML acceptance. These defaults are visible as “Accepted · evidence default”.</p><p>The checkmark accepts an item or reopens it for review. Review details lets you record follow-up work or restore the evidence default. Saved decisions, including older Reviewed and Not reviewed choices, take precedence. Scope changes and notes preserve the default unless you choose a status explicitly. These are local acceptance decisions you can export for project agreement.</p></div></section><section class="how-to-grid"><article><span class="step-number">01</span><h2>Set acceptance scope</h2><p>Review ${criteria.length} subfeatures across ${data.groups.length} feature groups. Mark each Needed for merge, Needed for release, or Not needed. Leave undecided items Unassigned.</p></article><article><span class="step-number">02</span><h2>Assess the user outcome</h2><p>Use Qt Widgets as the reference for what the user needs to achieve. Check GUI-QML parity and the remaining gaps; an equivalent workflow can fulfill the same intent.</p></article><article><span class="step-number">03</span><h2>Review the proof</h2><p>Inspect captures, modules and automated tests for each required criterion. Proven parity items start Accepted. Review the remaining outcomes and evidence, record follow-up work, and export your acceptance decisions for project agreement.</p></article></section><section class="content-panel"><h2>Implementation parity</h2><div class="status-guide">${[['parity','The main user goal is achieved through a reasonably usable workflow. Different controls, file transfer instead of clipboard transfer, or straightforward extra steps can still count as fully implemented.'],['partial','An important part of the user goal remains unavailable or broken; the difference affects the outcome rather than just the workflow.'],['not-implemented','The main user goal has no supported workflow. A related capability alone does not fulfill that goal.']].map(([status,meaning])=>`<div>${parityBadge({status})}<p>${meaning}</p></div>`).join('')}</div><p class="helper-text">These are rough judgments of user outcomes, not acceptance decisions. Each group has an explicit main goal and rationale; its rating is not an all-criteria tally. A group can achieve its main goal while secondary criteria remain missing. Conversely, critical in-app dialogs do not implement the desktop-notification channel. In Groups view the parity filter applies to the whole group; in Subfeatures view it applies to each subfeature. Missing captures and untested hardware do not by themselves reduce implementation parity. For displayed information, users must be able to identify both the value and its meaning. A visible Pending activity amount can meet the pending-funds intent. Missing screenshots are proof gaps; a displayed balance that fails to update is an implementation gap. RPC capability counts when the Widgets baseline also permits RPC.</p><p class="helper-text"><a href="current-assessments.json" target="_blank" rel="noopener">Current group and criterion assessments and reasons ↗</a> · Based on the pinned source comparison and dated functional reruns. The October 10 note-input correction supersedes the original failure assessment.</p></section><section class="content-panel"><h2>Merge and release requirements</h2><p class="helper-text">Set a group default on its feature page, or use a criterion’s scope dropdown to change it directly. The checkmark toggles Accepted; Review details opens the full dialog for acceptance status, notes, follow-up work and scope. Full-parity groups and criteria default to Needed for merge; partial and missing items stay Unassigned. A saved group choice overrides those automatic defaults for criteria without individual overrides. Existing choices, including Unassigned, are preserved. Requirement defaults use implementation parity. Acceptance defaults additionally require full GUI-QML evidence. Needed for merge means it must be ready before merging; Needed for release means it can wait until release; Not needed explicitly excludes it. Unassigned means no decision yet. In Groups view the requirement filter uses the group choice; in Subfeatures view it uses each effective choice, including group defaults. Requirement choices are personal review data, separate from implementation parity and review status. Export includes both group choices and individual overrides; older review files remain importable.</p></section><section class="content-panel"><h2>Full and partial evidence</h2><p class="helper-text">Relevant model/component tests can establish behavior when source review connects that tested code to the user interface. A matching screenshot or a new end-to-end run is not mandatory for explicitly reviewed workflows. An unrelated passing suite alone is insufficient; each assessment links the tests and explains the inference and its limits.</p><p class="helper-text">Full means there is sufficient proof under the agreed review standard: targeted GUI-QML automation with a matching capture, a reviewed QML workflow backed by connected QML and existing tests/hooks, or a screenshot explicitly accepted for that criterion. An unresolved recorded failure prevents Full coverage. Partial means the available proof has not met one of these bases. These filters describe proof for acceptance, not certification of every device, operating system or variant.</p><p class="helper-text">Screenshots count as sufficient only where that acceptance is explicitly recorded. <a href="#feature/F12?item=F12.S04">The coin viewer (F12.S04)</a> has been accepted on its existing screenshot; this does not automatically accept other visual-only evidence.</p></section><section class="content-panel" id="hardware-platform"><h2>Review using existing tests</h2><p class="helper-text">${escape(data.hardwarePlatformReview.rule)}</p><p class="helper-text">${Object.keys(data.hardwarePlatformReview.criteria).length} criteria use this basis, labeled <strong>QML + tests/hooks</strong>. These are source assessments using relevant existing test results; no new application, device or operating-system run is claimed. Each card explains what each cited test proves, links to its assertions at the pinned source revision, and shows the exact recorded pass. The feature connection and coverage limits identify what is inferred from source review or trusted integration boundaries. The Modules &amp; tests tab repeats this mapping by subfeature; its related-suite list alone is not proof of every outcome.</p><details class="detailed-report" ${route.params.get('section')==='hardware-platform'?'open':''}><summary>Review all assessed workflows</summary><div class="prose">${data.hardwarePlatformReview.reportHtml}</div></details><p class="helper-text"><a href="hardware-platform-review.md" download>Download review</a> · <a href="hardware-platform-review.json">Review data and source hashes</a></p></section><section class="content-panel"><h2>What the detailed evidence levels mean</h2><div class="status-guide">${[['assertions','Automated assertions','A targeted live assertion or scoped automated test supports the stated behavior. Read its limits before accepting broader variants.'],['limited','Limited evidence','Only some variants or behaviors are covered, or a known test failure remains.'],['visual','Visual evidence only','A real screenshot is available, without a targeted runtime assertion for this exact criterion.'],['source','Source / related tests','Implementation or a related suite is available. No targeted runtime proof was collected for this criterion.'],['gap','Missing GUI workflow','The source comparison found no reachable graphical workflow. Backend RPC availability is a separate capability.']].map(([status,label,text])=>`<div>${badge({status,label})}<p>${text}</p></div>`).join('')}</div></section><section class="scope-panel"><h2>Boundaries of this snapshot</h2><p>Linux X11 and synthetic regtest wallets. Physical hardware wallets, macOS, Windows, live Tor routing, router mapping, and full mainnet synchronization were not exercised in this collection. For the reviewed workflows, the connected QML and existing tests/hooks satisfy the agreed acceptance standard.</p><p>The applications use different pinned Core revisions and Qt builds. Full lint, clang-tidy, sanitizer, ancestor-commit, and IPC-enabled CI was not run. Missing evidence stays visible. Parity with full GUI-QML proof defaults to Accepted; saved decisions override that default.</p></section><div class="source-cards">${Object.entries(data.revisions).map(([app,rev])=>`<a href="https://github.com/bitcoin-core/${app==='qml'?'gui-qml':'gui'}/commit/${rev}" target="_blank" rel="noopener"><span class="application-label"><span class="app-dot ${app}"></span>${appNames[app]}</span><code>${rev.slice(0,12)}</code>${icon('external')}</a>`).join('')}</div><details class="content-panel detailed-report"><summary>Builds, fixtures, capture method & reproduction</summary><div class="prose">${data.provenanceHtml}</div></details><section class="content-panel"><h2>Evidence collections and original records</h2>${data.collections.map(c=>`<p class="helper-text"><a href="${c.report}">${escape(c.date)} — ${escape(c.title)} ↗</a>: ${c.selectedCaptures.length} captures, ${c.newlyCapturedCriteria} previously uncovered criteria, ${c.remainingCriteriaWithoutCaptures} remaining screenshot gaps.</p>`).join('')}<p class="helper-text"><a href="${data.reruns[0].report}">October 10 rerun: corrected script, diagnosis and passing proof ↗</a>. The original snapshot below remains archived.</p><div class="record-links">${[['Markdown evidence index','gui-feature-evidence/README.md'],['Feature comparison','bitcoin-core-gui-supported-features.md'],['Criterion coverage','gui-feature-evidence/coverage.json'],['Capture timestamps & hashes','gui-feature-evidence/selected-captures.json'],['Evidence integrity results','gui-feature-evidence/logs/evidence-validation.json'],['Binary hashes','gui-feature-evidence/binaries.json']].map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div></section>`;
  }
  function renderNavigation() {
    $('#feature-navigation').innerHTML = data.areas.map(area=>`<details open><summary>${escape(area.label)}<span>${data.groups.filter(g=>g.area===area.id).length}</span></summary>${data.groups.filter(g=>g.area===area.id).map(g=>`<a href="#feature/${g.id}" data-group-link="${g.id}" title="${escape(g.name)}"><span class="nav-feature-id">${g.id.slice(1)}</span><span>${escape(g.name)}</span></a>`).join('')}</details>`).join('');
  }
  function readRoute() {
    const [path, query=''] = location.hash.slice(1).split('?');
    const [page, groupId] = path.split('/');
    route = {page:page || 'catalog', groupId, params:new URLSearchParams(query)};
    const item = route.params.get('item');
    if (route.page === 'feature' && aliases[item]) {
      const canonical = criterionMap.get(aliases[item]);
      route.groupId = canonical.groupId;
      route.params.set('item', canonical.id);
      history.replaceState(null,'',`#feature/${route.groupId}?${route.params}`);
    }
    if (route.page==='catalog' && query) {
      filters = {...defaults};
      const legacyEvidence = {assertions:'full', limited:'partial', visual:'partial', source:'partial', gap:'partial'};
      const previousEvidence = route.params.get('evidence');
      if (legacyEvidence[previousEvidence]) route.params.set('evidence', legacyEvidence[previousEvidence]);
      const allowed = {parity:['any','incomplete','parity','partial','not-implemented'], requirement:['any',...Object.keys(requirementLabels)], evidence:['any','full','partial'], area:['all',...data.areas.map(a=>a.id)], review:['any','pending',...Object.keys(reviewLabels)], captures:['any','yes','no'], view:['groups','criteria']};
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
    const title = route.page==='feature' ? groupMap.get(route.groupId)?.name || 'Feature' : {catalog:'Acceptance criteria', tests:'Test results', about:'Acceptance guide', audit:'Duplicate audit'}[route.page] || 'Acceptance criteria';
    $('#breadcrumb-current').textContent = title;
    document.title = title + ' · GUI-QML acceptance';
    $$('[data-nav]').forEach(a=>{a.removeAttribute('aria-current');if(a.dataset.nav===route.page || (route.page==='feature'&&a.dataset.nav==='catalog'))a.setAttribute('aria-current','page');});
    $$('[data-group-link]').forEach(a=>{a.removeAttribute('aria-current');if(route.page==='feature' && a.dataset.groupLink===route.groupId)a.setAttribute('aria-current','page');});
    if (route.page==='feature' && replacements[route.params.get('item')] && replacements[route.params.get('item')].length!==1) renderRetiredCriterion(route.params.get('item'));
    else if (route.page==='feature') renderGroup();
    else if (route.page==='tests') renderTests();
    else if (route.page==='about') {
      renderAbout();
      if (route.params.get('section')==='hardware-platform') $('#hardware-platform').scrollIntoView();
    }
    else if (route.page==='audit') $('#main').innerHTML = `<section class="page-heading"><div><div class="eyebrow">CATALOG REVIEW · ${escape(data.catalogAudit.date)}</div><h1>Applied subfeature audit</h1></div><a class="button" href="catalog-audit.md" download>${icon('download')} Download audit</a></section><section class="content-panel"><p class="helper-text"><a href="current-catalog.md" download>Download current criteria ↗</a> · <a href="catalog-audit.json" target="_blank" rel="noopener">Structured audit ↗</a></p><div class="prose audit-report">${data.catalogAudit.reportHtml}</div></section>`;
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
    const screenshotReviews=criteria.filter(c=>hasQmlReview(c) && c.qmlReview.capture===photo.path).map(c=>c.id);
    $('#capture-metadata').innerHTML=`<span>${photo.width} × ${photo.height} pixels · ${escape(photo.utc)}</span><code>SHA-256 ${escape(photo.sha256)}</code><span>Criteria: ${photo.features.map(escape).join(', ')}</span>${screenshotReviews.length?`<span>Screenshot accepted for: ${screenshotReviews.map(escape).join(', ')}</span>`:''}`;
  }
  function openReview(id) {
    const criterion=criterionMap.get(id), group=groupMap.get(id); if(!criterion && !group)return;
    editingReview=id;
    $('#review-criterion-id').textContent=id+(group?' · GROUP ACCEPTANCE SCOPE':' · CRITERION REVIEW');
    $('#review-title').textContent=group ? group.name : criterion.intent;
    $('#review-detail-fields').hidden=!!group;
    $('#review-requirement').innerHTML=options([
      ...(criterion ? [['inherit',`Use default (${requirementLabels[inheritedRequirement(id)]})`]] : []),
      ...Object.entries(requirementLabels)
    ],reviewFor(id).requirement);
    $('#requirement-help').textContent=group ? 'Full-parity groups default to Needed for merge. Saving a group choice applies it to criteria without individual overrides.' : 'Use the saved group choice, or the parity default if none is saved. Full parity defaults to Needed for merge; other items stay Unassigned. You can override either default.';
    $('#review-form button[type="submit"]').textContent=group ? 'Save requirement' : 'Save review';
    $('#review-state').innerHTML=options([['default',`Use evidence default (${reviewLabels[defaultReviewStatus(id)]})`],...Object.entries(reviewLabels)],savedReviewFor(id).status);
    $('#review-note').value=reviewFor(id).note;
    const earlier = legacyChoices(id, true);
    const history = $('#merged-review-history');
    history.hidden=!earlier.length;
    history.innerHTML=earlier.length?`<summary>Earlier reviews (${earlier.length})</summary><p class="helper-text">Original notes and decisions remain in your export. Saving this criterion sets its current decision.</p>${earlier.map(source=>`<div class="saved-note"><span class="small-label">${escape(source.id)} · ${escape(source.record.status==='default'?'Evidence default':reviewLabels[source.record.status])} · ${escape(requirementLabels[source.requirement])}</span><p>${escape(source.record.note || 'No note recorded.')}</p></div>`).join('')}`:'';
    history.open=!!reviewFor(id).mergeConflict || !!reviewFor(id).needsReassessment;
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
    if(element.dataset.quickReview && criterionMap.has(element.dataset.quickReview)) {
      const id=element.dataset.quickReview;
      const status=reviewFor(id).status==='accepted'?'unreviewed':'accepted';
      saveCardReview(id,{status},`[data-quick-review="${id}"]`,status==='accepted'?'Accepted.':'Reopened for review.');
    }
    if(element.dataset.review)openReview(element.dataset.review);
    if(element.dataset.copy)copyCriterionLink(element.dataset.copy);
    if(element.closest('.sidebar') && element.tagName==='A')setNavigation(false);
  });
  document.addEventListener('change',event=>{
    if(event.target.dataset.filter){filters[event.target.dataset.filter]=event.target.value;refreshFilters();}
    const id=event.target.dataset.setRequirement;
    const requirement=event.target.value;
    if(criterionMap.has(id) && (requirement==='inherit' || Object.hasOwn(requirementLabels,requirement))) {
      saveCardReview(id,{requirement},`[data-set-requirement="${id}"]`,'Acceptance scope saved.');
    }
  });
  document.addEventListener('input',event=>{if(event.target.id==='catalog-search'){filters.q=event.target.value;refreshFilters();}});
  $('#review-form').addEventListener('submit',event=>{
    event.preventDefault();
    if (!editingReview) return;
    const previous=savedReviewFor(editingReview), group=groupMap.has(editingReview);
    reviews[editingReview]={status:group?previous.status:$('#review-state').value,note:group?previous.note:$('#review-note').value.trim(),requirement:$('#review-requirement').value,updatedAt:new Date().toISOString()};
    persist();$('#review-dialog').close();const top=window.scrollY;render();window.scrollTo(0,top);notify(storageAvailable?'Review saved in this browser.':'Review kept for this session. Export to save.');
  });
  $('#export-review').addEventListener('click',()=>{
    const payload={...reviewEnvelope(),catalogId:data.catalogId,evidenceDate:data.summary.date,latestEvidenceDate:data.latestEvidenceDate,sourceRevisions:data.revisions,exportedAt:new Date().toISOString(),acceptanceDefaults:{rule:'parity-and-full-qml-evidence',accepted:criteria.filter(c=>savedReviewFor(c.id).status==='default' && defaultReviewStatus(c.id)==='accepted').map(c=>c.id)}};
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bitcoin-gui-review-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Review exported.');
  });
  $('#import-review').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>8_000_000)throw new Error('The review file is too large.');
      const payload=JSON.parse(await file.text());
      if(![1,2,3,4].includes(payload.schemaVersion))throw new Error('This review file version is not supported.');
      if(payload.catalogId!==data.catalogId)throw new Error('This review belongs to a different evidence snapshot.');
      const envelope=payload.schemaVersion===4?validateEnvelope(payload):null;
      const incoming=envelope?envelope.reviews:validateReviews(payload.reviews);
      const prior=envelope?envelope.priorReviews:incoming;
      let conflicts=0;
      function mergeRecords(target, records) {
        for(const [id,value] of Object.entries(records)) {
          if(target[id] && JSON.stringify(target[id])!==JSON.stringify(value)){conflicts++;continue;}
          target[id]=value;
        }
      }
      if(envelope) { mergeRecords(reviews,incoming); mergeRecords(priorReviews,prior); mergeRecords(retiredReviews,envelope.retiredReviews); }
      else {
        for(const [id,value] of Object.entries(prior)) {
          if((reviews[id] && JSON.stringify(reviews[id])!==JSON.stringify(value)) || (priorReviews[id] && JSON.stringify(priorReviews[id])!==JSON.stringify(value))){conflicts++;continue;}
          priorReviews[id]=value;
          if(!isAffected(id))reviews[id]=value;
        }
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
  window.addEventListener('storage',event=>{if(event.key===storageKey){try{restoreEnvelope(event.newValue?JSON.parse(event.newValue):{schemaVersion:4,catalogRevision:data.catalogRevision,reviews:{},priorReviews:{}});render();}catch{notify('A saved review could not be read.');}}});
  renderNavigation();render();
})();
