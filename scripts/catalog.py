"""Apply reviewed catalog edits while retaining the original evidence snapshot."""
from collections import Counter
from copy import deepcopy


def apply_catalog_audit(data, audit):
    if audit['schemaVersion'] != 1 or audit['snapshotCatalogId'] != data['catalogId']:
        raise ValueError('Catalog audit does not match the evidence snapshot')
    rows = {c['id']: c for g in data['groups'] for c in g['criteria']}
    reviewed = [sid for g in audit['groups'] for sid in g['reviewedCriteria']]
    if len(reviewed) != len(set(reviewed)) or set(reviewed) != rows.keys():
        raise ValueError('Audit must review every original criterion exactly once')
    if {g['id'] for g in audit['groups']} != {g['id'] for g in data['groups']}:
        raise ValueError('Audit must cover every feature group')
    for group in audit['groups']:
        if not group['conclusion'] or any(rows[sid]['groupId'] != group['id'] for sid in group['reviewedCriteria']):
            raise ValueError('Invalid audit group: ' + group['id'])
    for finding in audit['findings']:
        if not set(finding['criteria']).issubset(rows) or not finding['reason'] or not finding['recommendation']:
            raise ValueError('Invalid audit finding: ' + finding['id'])
    data['criterionAliases'] = {}
    data['retiredCriteria'] = []
    for merge in audit['merges']:
        target = rows[merge['target']]
        sources = [rows[sid] for sid in merge['sources']]
        if not sources or target in sources or len(merge['sources']) != len(set(merge['sources'])):
            raise ValueError('Invalid catalog merge')
        members = [target] + sources
        # A changed scope with different evidence/parity needs an explicit new
        # assessment. Never upgrade weaker evidence through a mechanical merge.
        for source in sources:
            if source['groupId'] != target['groupId'] or source['id'] in data['criterionAliases']:
                raise ValueError('Unsupported or repeated catalog merge')
            if source['implementation']['status'] != target['implementation']['status']:
                raise ValueError('Merged implementation needs reassessment')
            for app in ('widgets', 'qml'):
                if source['applications'][app]['status'] != target['applications'][app]['status']:
                    raise ValueError('Merged evidence needs reassessment')
        target['mergedCriteria'] = deepcopy(members)
        target['intent'] = merge['intent']
        target['hasFailure'] = any(c['hasFailure'] for c in members)
        for app in ('widgets', 'qml'):
            records = [c['applications'][app] for c in target['mergedCriteria']]
            record = target['applications'][app]
            record['captures'] = list(dict.fromkeys(p for r in records for p in r['captures']))
            record['html'] = '<br>'.join(dict.fromkeys(r['html'] for r in records))
            record['text'] = ' '.join(dict.fromkeys(r['text'] for r in records))
        target['searchText'] = ' '.join([target['searchText'], target['intent']] + [c['searchText'] for c in sources]).lower()
        for source in sources:
            data['criterionAliases'][source['id']] = target['id']
            data['retiredCriteria'].append(deepcopy(source))
    for group in data['groups']:
        group['criteria'] = [c for c in group['criteria'] if c['id'] not in data['criterionAliases']]
        counts = Counter(c['implementation']['status'] for c in group['criteria'])
        group['implementation']['counts'] = {s: counts[s] for s in ('parity', 'partial', 'not-implemented')}
    data['preMergeSummary'] = deepcopy(data['summary'])
    data['summary']['criteria'] = sum(len(g['criteria']) for g in data['groups'])
    for source in data['retiredCriteria']:
        for app, record in source['applications'].items():
            status = record.get('currentOriginalStatus', record['originalStatus'])
            data['summary']['criteria_statuses'][app][status] -= 1
    data['catalogAudit'] = {**audit, 'reviewedCount': len(reviewed), 'currentCount': data['summary']['criteria']}


def audit_markdown(data):
    audit = data['catalogAudit']
    rows = {c['id']: c for g in data['groups'] for c in g['criteria']}
    rows.update({c['id']: c for c in data['retiredCriteria']})
    for group in data['groups']:
        for row in group['criteria']:
            rows.update({source['id']: source for source in row.get('mergedCriteria', [])})
    groups = {g['id']: g for g in data['groups']}

    def link(sid):
        return f'[{sid}](#feature/{sid.split(".")[0]}?item={sid})'

    lines = ['# Subfeature duplicate audit', '', f'{audit["date"]} · All {audit["reviewedCount"]} original subfeatures across {len(groups)} groups reviewed. The current catalog has {audit["currentCount"]} criteria after the requested F05 merge.', '', audit['method'], '',
             '**Applied:** F05.S02 is combined into F05.S01. Other findings are recommendations and remain separately counted. Existing evidence and source IDs are archived; old links open the combined criterion.', '',
             '## Findings', '', '9 further merge candidates, 12 partial overlaps to clarify, and 8 reviewed distinctions to retain. These are finding clusters, not a proposed removal count.']
    for kind, title in [('merged', 'Applied merge'), ('duplicate', 'Further merge candidates'), ('overlap', 'Partial overlaps'), ('distinct', 'Related outcomes to keep distinct')]:
        lines.extend(['', f'## {title}', ''])
        for finding in audit['findings']:
            if finding['kind'] != kind:
                continue
            lines.extend([f'### {finding["id"]} — {finding["title"]}', '', ' · '.join(link(sid) for sid in finding['criteria']), '', finding['reason'], '', '**Action:** ' + finding['recommendation'], ''])
    lines.extend(['## Complete group-by-group review', '', 'Every original criterion is listed below. Finding IDs refer to the analysis above. “Keep” means no duplicate was identified for that row; it is not an implementation or acceptance decision.', ''])
    for group in audit['groups']:
        lines.extend([f'### {group["id"]} — {groups[group["id"]]["name"]}', '', group['conclusion'], '', '| Criterion | User outcome | Audit findings |', '| --- | --- | --- |'])
        for sid in group['reviewedCriteria']:
            findings = [f['id'] for f in audit['findings'] if sid in f['criteria']]
            lines.append(f'| {link(sid)} | {rows[sid]["intent"]} | {", ".join(findings) or "Keep"} |')
        lines.append('')
    return '\n'.join(lines).rstrip() + '\n'


def current_catalog_markdown(data):
    lines = ['# GUI-QML acceptance criteria', '', f'{data["catalogAudit"]["currentCount"]} current subfeatures across {len(data["groups"])} feature groups. F05.S02 is combined into F05.S01; the original IDs and evidence remain archived. Other audit recommendations have not been applied.', '', '[Duplicate audit](catalog-audit.md) · [Original evidence index](gui-feature-evidence/README.md)', '']
    for group in data['groups']:
        lines.extend([f'## {group["id"]} — {group["name"]}', '', '| Criterion | User outcome | GUI-QML implementation |', '| --- | --- | --- |'])
        for row in group['criteria']:
            lines.append(f'| {row["id"]} | {row["intent"]} | {row["implementation"]["status"]} |')
        lines.append('')
    return '\n'.join(lines).rstrip() + '\n'
