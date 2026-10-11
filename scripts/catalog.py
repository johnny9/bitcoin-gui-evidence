"""Apply the approved outcome audit, retaining source evidence and review mappings."""
from collections import Counter
from copy import deepcopy
from html import escape

LEVELS = {'assertions': 0, 'visual': 1, 'source': 2, 'limited': 3, 'gap': 4}
LABELS = {'assertions': 'Assertions collected', 'visual': 'Visual evidence only',
          'source': 'Source / related tests', 'limited': 'Limited evidence', 'gap': 'Missing GUI workflow'}
ORIGINAL_STATUS = {'visual': 'Visual evidence only', 'source': 'Source / related tests only',
                   'limited': 'Partial / limited evidence', 'gap': 'Implementation gap'}


def apply_catalog_audit(data, audit):
    if audit['schemaVersion'] != 2 or audit['snapshotCatalogId'] != data['catalogId']:
        raise ValueError('Catalog audit does not match the evidence snapshot')
    rows = {c['id']: c for g in data['groups'] for c in g['criteria']}
    original = deepcopy(rows)
    data['originalCriteria'] = list(original.values())
    reviewed = [sid for g in audit['groups'] for sid in g['reviewedCriteria']]
    if len(reviewed) != len(set(reviewed)) or set(reviewed) != rows.keys():
        raise ValueError('Audit must review every original criterion exactly once')
    if {g['id'] for g in audit['groups']} != {g['id'] for g in data['groups']}:
        raise ValueError('Audit must cover every feature group')
    for group in audit['groups']:
        if not group['conclusion'] or any(rows[sid]['groupId'] != group['id'] for sid in group['reviewedCriteria']):
            raise ValueError('Invalid audit group: ' + group['id'])
    replacements = deepcopy(audit['replacements'])
    for merge in audit['merges']:
        if not merge['sources'] or merge['target'] in merge['sources']:
            raise ValueError('Invalid catalog merge')
        for sid in merge['sources']:
            if sid in replacements:
                raise ValueError('Criterion retired more than once: ' + sid)
            replacements[sid] = [merge['target']]
    active = rows.keys() - replacements.keys()
    if not set(replacements).issubset(rows) or any(not ids or len(ids) != len(set(ids)) or not set(ids).issubset(active) for ids in replacements.values()):
        raise ValueError('Every retired criterion must lead directly to current criteria')
    targets = {sid: replacements.get(sid, [sid]) for sid in rows}
    for sid, ids in audit['scopeTransfers'].items():
        if sid not in active or sid not in ids or not set(ids).issubset(active):
            raise ValueError('Invalid scope transfer: ' + sid)
        targets[sid] = ids
    data['criterionReplacements'] = replacements
    data['criterionAliases'] = {sid: ids[0] for sid, ids in replacements.items() if len(ids) == 1}
    data['retiredCriteria'] = [original[sid] for sid in replacements]
    data['catalogRevision'] = audit['revision']
    data['sourceTargets'] = targets
    proof_sources = {sid: [sid] for sid in active}
    for merge in audit['merges']:
        target = rows[merge['target']]
        proof_sources[target['id']].extend(merge['sources'])
        target.update(intent=merge['intent'], catalogChange=merge['reason'], reviewMode=merge['reviewMode'])
        target['mergedCriteria'] = [{'id': sid, 'intent': original[sid]['intent']} for sid in [target['id']] + merge['sources']]
    for sid, change in audit['rewrites'].items():
        if sid not in active:
            raise ValueError('Rewrite refers to retired criterion: ' + sid)
        row = rows[sid]
        for key in ('intent', 'implementation', 'checks', 'reviewMode'):
            if key in change:
                row[key] = deepcopy(change[key])
        if change.get('related'):
            row['relatedCriteria'] = change['related']
        proof_sources[sid].extend(change.get('proofFrom', []))
    for sid in active:
        row = rows[sid]
        source_ids = list(dict.fromkeys(proof_sources[sid]))
        if not set(source_ids).issubset(original):
            raise ValueError('Unknown evidence source')
        row['evidenceSources'] = source_ids
        row['reviewSources'] = [{'id': source, 'kind': 'split' if len(ids) > 1 else 'equivalent'} for source, ids in targets.items() if sid in ids]
        row['hasFailure'] = any(original[source]['hasFailure'] for source in source_ids)
        for app in ('widgets', 'qml'):
            records = [original[source]['applications'][app] for source in source_ids]
            record = row['applications'][app]
            override = audit['rewrites'].get(sid, {}).get(app)
            if len(records) > 1 or override:
                status = override['status'] if override else max((r['status'] for r in records), key=LEVELS.get)
                record['status'], record['label'] = status, LABELS[status]
                record['currentOriginalStatus'] = ('Assertions collected' if app == 'widgets' else 'Automated evidence collected') if status == 'assertions' else ORIGINAL_STATUS[status]
                capture_sources = override.get('captureFrom', source_ids) if override else source_ids
                if not set(capture_sources).issubset(source_ids):
                    raise ValueError('Capture scope must use the recorded evidence sources')
                record['captures'] = list(dict.fromkeys(p for source in capture_sources for p in original[source]['applications'][app]['captures']))
                if override:
                    prior = ''.join('<p><strong>' + escape(source + ' — ' + original[source]['intent']) + '</strong></p>' + original[source]['applications'][app]['html'] for source in source_ids)
                    record['html'] = escape(override['detail']) + '<details><summary>Earlier evidence and scope</summary><p>These records describe the original scope; the assessment above applies to the current outcome.</p>' + prior + '</details>'
                else:
                    record['html'] = '<br>'.join(dict.fromkeys(r['html'] for r in records))
                record['text'] = override['detail'] if override else ' '.join(dict.fromkeys(r['text'] for r in records))
        # Search retired IDs and wording without introducing extra counted rows.
        old_ids = list(dict.fromkeys([sid] + [source for source, ids in targets.items() if sid in ids]))
        row['searchText'] = ' '.join([row['intent']] + [original[source]['searchText'] for source in old_ids]).lower()
        row['sourceGroups'] = sorted({original[source]['groupId'] for source in source_ids})
    for group in data['groups']:
        group['criteria'] = [c for c in group['criteria'] if c['id'] in active]
        counts = Counter(c['implementation']['status'] for c in group['criteria'])
        group['implementation']['counts'] = {s: counts[s] for s in ('parity', 'partial', 'not-implemented')}
        group['relatedCriteria'] = list(dict.fromkeys(target for sid, ids in targets.items() if original[sid]['groupId'] == group['id'] for target in ids if rows[target]['groupId'] != group['id']))
        group['captures'] = list(dict.fromkeys(group['captures'] + [p for c in group['criteria'] for r in c['applications'].values() for p in r['captures']]))
    for finding in audit['findings']:
        if not set(finding['criteria']).issubset(original) or not set(finding['outcomes']).issubset(active) or finding['status'] not in ('applied', 'retained'):
            raise ValueError('Incomplete audit finding: ' + finding['id'])
    data['preMergeSummary'] = deepcopy(data['summary'])
    data['summary']['criteria'] = len(active)
    for app in ('widgets', 'qml'):
        data['summary']['criteria_statuses'][app] = dict(Counter(rows[sid]['applications'][app].get('currentOriginalStatus', rows[sid]['applications'][app]['originalStatus']) for sid in rows if sid in active))
    data['catalogAudit'] = {**audit, 'reviewedCount': len(reviewed), 'currentCount': len(active), 'retiredCount': len(replacements)}


def audit_markdown(data):
    audit = data['catalogAudit']
    original = {c['id']: c for c in data['originalCriteria']}
    groups = {g['id']: g for g in data['groups']}

    def link(sid):
        return f'[{sid}](#feature/{sid.split(".")[0]}?item={sid})'

    lines = ['# Implemented subfeature audit', '', f'{audit["date"]} · All {audit["reviewedCount"]} original subfeatures across {len(groups)} groups reviewed. The current catalog has **{audit["currentCount"]} criteria**, with {audit["retiredCount"]} repeated or broad rows retired.', '', audit['method'], '',
             '**All findings applied:** the original export merge, nine further duplicate findings and twelve overlapping scopes have been implemented. Eight reviewed distinctions remain separate. These edits change how outcomes are counted and reviewed; they do not implement application features.', '',
             'Evidence, source modules, tests and original IDs remain available. A merged outcome keeps its incomplete proof visible. Narrowed outcomes are assessed for their remaining scope. Old links redirect to the current criterion or show the several outcomes that replaced a broad row.', '',
             'Earlier review records remain in exports and Review details. Conflicting decisions require follow-up. Acceptance of a broad old row is not copied onto several separate outcomes. Requirements inherited from an old group are preserved when the outcome moves to another group.', '']
    for title, kinds in [('Applied merges', ('merged', 'duplicate')), ('Applied scope changes', ('overlap',)), ('Distinct outcomes retained', ('distinct',))]:
        lines.extend([f'## {title}', ''])
        for finding in audit['findings']:
            if finding['kind'] not in kinds:
                continue
            lines.extend([f'### {finding["id"]} — {finding["title"]}', '', '**Original rows:** ' + ' · '.join(link(sid) for sid in finding['criteria']), '', finding['reason'], '', '**Implemented:** ' + finding['resolution'], '', '**Review now:** ' + ' · '.join(link(sid) for sid in finding['outcomes']), ''])
    lines.extend(['## Complete group-by-group record', '', 'Every original criterion appears below, with its current review destination. Related outcomes may appear as links in several groups but are counted once.', ''])
    for group in audit['groups']:
        lines.extend([f'### {group["id"]} — {groups[group["id"]]["name"]}', '', '| Original criterion | Original user outcome | Review now | Findings |', '| --- | --- | --- | --- |'])
        for sid in group['reviewedCriteria']:
            findings = [f['id'] for f in audit['findings'] if sid in f['criteria']]
            lines.append(f'| {link(sid)} | {original[sid]["intent"]} | {", ".join(link(target) for target in data["sourceTargets"][sid])} | {", ".join(findings) or "Kept"} |')
        lines.append('')
    return '\n'.join(lines).rstrip() + '\n'


def current_catalog_markdown(data):
    by_id = {c['id']: c for g in data['groups'] for c in g['criteria']}
    lines = ['# GUI-QML acceptance criteria', '', f'{len(by_id)} current subfeatures across {len(data["groups"])} feature groups. All duplicate-audit findings are implemented; the original IDs, evidence and review history remain available.', '', '[Implemented audit](catalog-audit.md) · [Original evidence index](gui-feature-evidence/README.md)', '']
    for group in data['groups']:
        lines.extend([f'## {group["id"]} — {group["name"]}', '', '| Criterion | User outcome | GUI-QML implementation |', '| --- | --- | --- |'])
        for row in group['criteria']:
            lines.append(f'| {row["id"]} | {row["intent"]} | {row["implementation"]["status"]} |')
        if group['relatedCriteria']:
            lines.extend(['', '**Related criteria, counted in their owning groups:** ' + '; '.join(sid + ' — ' + by_id[sid]['intent'] for sid in group['relatedCriteria'])])
        lines.append('')
    return '\n'.join(lines).rstrip() + '\n'
