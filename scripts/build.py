#!/usr/bin/env python3
"""Build a static browser for the original evidence and dated evidence addenda."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from tempfile import TemporaryDirectory

from markdown_it import MarkdownIt
from catalog import apply_catalog_audit, audit_markdown, current_catalog_markdown
from hardware_platform import apply_hardware_platform_review, review_markdown
from visual_review import apply_visual_review

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'dist'
MD = MarkdownIt('default', {'html': True, 'linkify': False})
AREAS = [
    ('wallets', 'Wallets & security', [1, 2, 3, 4, 5, 6, 7, 18, 19, 32, 34]),
    ('payments', 'Payments & signing', list(range(8, 16))),
    ('activity', 'Transaction activity', [16, 17]),
    ('node', 'Node & network', [20, 21, 22, 33]),
    ('application', 'Application & desktop', list(range(23, 32))),
]
STATUS = {
    'Assertions collected': ('assertions', 'Assertions collected'),
    'Automated evidence collected': ('assertions', 'Automated evidence'),
    'Visual evidence only': ('visual', 'Visual evidence only'),
    'Related automated suite': ('source', 'Related tests only'),
    'Source only': ('source', 'Source only'),
    'Source / related tests only': ('source', 'Source / related tests'),
    'Implementation gap': ('gap', 'Missing GUI workflow'),
    'Partial / limited evidence': ('limited', 'Limited evidence'),
}


def plain(value):
    value = re.sub(r'\[([^]]+)\]\([^)]+\)', r'\1', value)
    return re.sub(r'<[^>]*>|[*`]', '', value).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    default_evidence = DEST / 'gui-feature-evidence'
    parser.add_argument('--evidence', type=Path, default=default_evidence)
    args = parser.parse_args()
    evidence = args.evidence.resolve()
    if not evidence.is_dir():
        parser.error('The evidence pack is missing; pass --evidence /path/to/gui-feature-evidence')
    # A standalone checkout retains the snapshot in dist/. Stage it before
    # replacing generated output, so the same build command works after cloning.
    snapshot = None
    if evidence.is_relative_to(DEST):
        snapshot = TemporaryDirectory(prefix='gui-evidence-build-')
        staged = Path(snapshot.name)
        shutil.copytree(evidence, staged / 'gui-feature-evidence')
        comparison = evidence.parent / 'bitcoin-core-gui-supported-features.md'
        if comparison.is_file():
            shutil.copy2(comparison, staged / comparison.name)
        evidence = staged / 'gui-feature-evidence'
    load = lambda name: json.loads((evidence / name).read_text())
    inventory = load('inventory.json')
    implementation = json.loads((ROOT / 'data/implementation.json').read_text())
    implementation_rows = implementation['criteria']
    implementation_groups = implementation['groups']
    if implementation['schemaVersion'] != 2 or implementation['assessmentStyle'] != 'rough-user-outcome':
        raise ValueError('Expected explicit user-outcome implementation assessments')
    if implementation_groups.keys() != {f['id'] for f in inventory}:
        raise ValueError('Implementation assessment must cover exactly the inventory groups')
    criterion_ids = {s['id'] for f in inventory for s in f['subfeatures']}
    if implementation_rows.keys() != criterion_ids:
        raise ValueError('Implementation assessment must cover exactly the inventory criteria')
    for sid, assessment in {**implementation_rows, **implementation_groups}.items():
        if assessment['status'] not in ('parity', 'partial', 'not-implemented') or not assessment['reason'].strip():
            raise ValueError('Invalid implementation assessment: ' + sid)
    if any(not assessment['goal'].strip() for assessment in implementation_groups.values()):
        raise ValueError('Every group assessment needs an explicit main user goal')
    coverage = {r['id']: r for r in load('coverage.json')}
    photos = load('selected-captures.json')
    original_photos = list(photos)
    groups_by_slug = {f['slug']: f['id'] for f in inventory}
    prefix = 'gui-feature-evidence/'

    def rewrite_link(target, group=None, document=None):
        if target.startswith(('https://', 'http://', 'mailto:')):
            return target
        if target in ('#modules', '#automated-tests') and group:
            return '#feature/' + group + '?tab=tests'
        if target == '#capture-register' and group:
            return '#feature/' + group + '?tab=captures'
        if target.startswith('#'):
            return target
        base = document.parent if document else evidence / 'features'
        path = (base / target.split('#')[0]).resolve()
        fragment = '#' + target.split('#', 1)[1] if '#' in target else ''
        if path.parent == evidence / 'features' and path.stem in groups_by_slug:
            return '#feature/' + groups_by_slug[path.stem]
        if path == evidence / 'README.md':
            return '#catalog'
        if path == evidence / 'TEST-RESULTS.md':
            return '#tests'
        if path == evidence / 'PROVENANCE.md':
            return '#about'
        try:
            return prefix + str(path.relative_to(evidence)) + fragment
        except ValueError:
            if path.name == 'bitcoin-core-gui-supported-features.md':
                return path.name
            raise ValueError('Link outside evidence pack: ' + target)

    def html(value, group=None, document=None, inline=True):
        value = re.sub(r'\]\(([^)]+)\)', lambda m: '](' + rewrite_link(m[1], group, document) + ')', value)
        result = MD.renderInline(value) if inline else MD.render(value)
        return re.sub(r'<a href="(https?://[^"]+)"', r'<a target="_blank" rel="noopener noreferrer" href="\1"', result)

    def section(text, name):
        match = re.search(r'^## ' + re.escape(name) + r'\n(.*?)(?=^## |\Z)', text, re.M | re.S)
        if not match:
            raise ValueError('Missing Markdown section: ' + name)
        return match[1].strip()

    groups = []
    for feature in inventory:
        fid = feature['id']
        page = evidence / 'features' / (feature['slug'] + '.md')
        text = page.read_text()
        area = next(key for key, _, numbers in AREAS if feature['number'] in numbers)
        rows = []
        for match in re.finditer(r'^### (F\d+\.S\d+) · (.*?)\n(.*?)(?=^### |^## |\Z)', text, re.M | re.S):
            sid, intent, body = match.groups()
            row = {'id': sid, 'intent': intent.strip(), 'groupId': fid, 'area': area, 'applications': {},
                   'implementation': implementation_rows[sid]}
            for app, label in [('widgets', 'Qt Widgets'), ('qml', 'GUI-QML')]:
                line = next(line for line in body.splitlines() if line.startswith('| ' + label + ' |'))
                cells = re.split(r'(?<!\\)\|', line)[1:-1]
                original_status, detail = cells[1].strip(), cells[2].strip()
                code, display = STATUS[original_status]
                detail = re.sub(r'<br>\[[^]]+\]\([^)]*media/[^)]+\)', '', detail)
                detail = detail.replace('<br>[Modules](#modules) · [Related tests](#automated-tests)', '')
                row['applications'][app] = {
                    'status': code, 'label': display, 'originalStatus': original_status,
                    'html': html(detail, fid), 'text': plain(detail.replace('<br>', ' ')),
                    'captures': [p['path'] for p in photos if p['application'] == app and sid in p['features']],
                }
                if original_status != coverage[sid][app]:
                    raise ValueError('Markdown/coverage status mismatch: ' + sid)
            row['hasFailure'] = 'qml_test_send_create' in row['applications']['qml']['text'] and 'fails' in row['applications']['qml']['text']
            row['searchText'] = ' '.join([fid, sid, feature['name'], row['intent']] + [a['text'] for a in row['applications'].values()]).lower()
            rows.append(row)
        if [r['id'] for r in rows] != [s['id'] for s in feature['subfeatures']]:
            raise ValueError('Incomplete criterion extraction: ' + fid)
        tests = []
        for line in section(text, 'Automated tests').splitlines():
            if not line.startswith('|') or line.startswith(('| Application', '| ---')):
                continue
            cells = [c.strip() for c in re.split(r'(?<!\\)\|', line)[1:-1]]
            tests.append({'application': cells[0], 'testHtml': html(cells[1], fid), 'resultHtml': html(cells[2], fid),
                          'failed': bool(re.search(r'\bfailed\b', cells[2]))})
        implementation_counts = {status: sum(r['implementation']['status'] == status for r in rows)
                                 for status in ('parity', 'partial', 'not-implemented')}
        groups.append({
            'id': fid, 'name': feature['name'], 'number': feature['number'], 'slug': feature['slug'], 'area': area,
            'implementation': {**implementation_groups[fid], 'counts': implementation_counts},
            'comparisonHtml': html(feature['qml_comparison'], fid),
            'modulesHtml': html(section(text, 'Modules'), fid, inline=False),
            'supportHtml': html(' '.join(feature.get('support', [])), fid),
            'tests': tests, 'criteria': rows,
            'captures': [p['path'] for p in photos if any(s.startswith(fid + '.') for s in p['features'])],
            'markdown': prefix + 'features/' + feature['slug'] + '.md',
        })
    digest = hashlib.sha256()
    for filename in ['inventory.json', 'coverage.json', 'selected-captures.json', 'summary.json']:
        digest.update((evidence / filename).read_bytes())
    if implementation['snapshotCatalogId'] != digest.hexdigest():
        raise ValueError('Reassess implementation parity for the changed evidence snapshot')
    data = {
        'catalogId': digest.hexdigest(), 'summary': load('summary.json'),
        'implementationAssessment': {k: v for k, v in implementation.items() if k not in ('criteria', 'groups')},
        'areas': [{'id': key, 'label': label} for key, label, _ in AREAS],
        'groups': groups, 'captures': photos,
        'functional': load('logs/qml-functional-results.json'),
        'testReportHtml': html((evidence / 'TEST-RESULTS.md').read_text(), document=evidence / 'TEST-RESULTS.md', inline=False),
        'provenanceHtml': html((evidence / 'PROVENANCE.md').read_text(), document=evidence / 'PROVENANCE.md', inline=False),
        'revisions': {'widgets': 'f739c7876b81304bdc72e7eaa307702da269ac31', 'qml': 'a91f4b4774f25de061fe1a7c132a91ddde117fca'},
    }
    if implementation['sourceRevisions'] != data['revisions']:
        raise ValueError('Implementation assessment source revisions do not match the comparison')
    # Addenda preserve the original records and catalog identity, so existing
    # personal reviews remain compatible. Only explicitly reassessed rows change.
    data['snapshotSummary'] = json.loads(json.dumps(data['summary']))
    data['reruns'] = []
    for record in sorted((ROOT / 'data/reruns').glob('*/result.json')):
        rerun = json.loads(record.read_text())
        result = rerun['functional']
        test_filename = result['test'] + '.py'
        if rerun['snapshotCatalogId'] != data['catalogId'] or rerun['sourceRevision'] != data['revisions']['qml']:
            raise ValueError('Rerun does not match the pinned application: ' + str(record))
        if hashlib.sha256((record.parent / test_filename).read_bytes()).hexdigest() != rerun['testSha256']:
            raise ValueError('Rerun test hash mismatch')
        base = 'reruns/' + rerun['id'] + '/'
        report = base + 'report.md'
        rerun['report'] = prefix + report
        rerun['reportHtml'] = html((record.parent / 'report.md').read_text(), document=evidence / report, inline=False)
        data['reruns'].append(rerun)
        superseded = set(rerun.get('supersededCaptures', []))
        if not superseded.issubset({p['path'] for p in photos}):
            raise ValueError('Unknown capture to supersede: ' + str(record))
        photos[:] = [p for p in photos if p['path'] not in superseded]
        photos.extend(rerun['selectedCaptures'])
        previous = next(r for r in data['functional'] if r['test'] == result['test'])
        previous['previousResult'] = dict(previous)
        previous.update(result)
        for group in groups:
            for row in group['criteria']:
                if row['id'] not in rerun['criteria']:
                    continue
                update = rerun['criteria'][row['id']]
                qml = row['applications']['qml']
                row['snapshotEvidence'] = json.loads(json.dumps(qml))
                statuses = data['summary']['criteria_statuses']['qml']
                statuses[qml['originalStatus']] -= 1
                statuses[update['status']] = statuses.get(update['status'], 0) + 1
                qml['status'], qml['label'] = STATUS[update['status']]
                qml['text'] = update['detail']
                qml['html'] = html(update['detail']) + ' <a href="' + prefix + report + '">Rerun report and evidence</a>.'
                qml['captures'] = [p for p in qml['captures'] if p not in superseded]
                qml['captures'].extend(p['path'] for p in rerun['selectedCaptures'] if row['id'] in p['features'])
                row['hasFailure'] = update['hasFailure']
                row['searchText'] = ' '.join([group['id'], row['id'], group['name'], row['intent']] + [a['text'] for a in row['applications'].values()]).lower()
            for test in group['tests']:
                if result['test'] in test['testHtml']:
                    variant = result.get('testVariant', 'Corrected script').lower()
                    test['testHtml'] = '<a href="' + prefix + base + test_filename + '">' + result['test'] + ' (' + variant + ')</a>'
                    test['resultHtml'] = '<a href="' + prefix + result['log'] + '">' + result['status'] + ' on ' + rerun['date'] + '</a>; <a href="' + prefix + report + '">dated rerun report</a>'
                    test['failed'] = result['status'] == 'failed'
            group['captures'] = [p['path'] for p in photos if any(s.startswith(group['id'] + '.') for s in p['features'])]
    # Dated collections retain the original snapshot and personal review identity.
    data['collections'] = []
    for record in sorted((ROOT / 'data/collections').glob('*/result.json')):
        collection = json.loads(record.read_text())
        app = collection['application']
        if app not in ('widgets', 'qml') or collection['snapshotCatalogId'] != data['catalogId'] or collection['sourceRevision'] != data['revisions'][app]:
            raise ValueError('Collection does not match the pinned application: ' + str(record))
        for filename, expected in collection['files'].items():
            if hashlib.sha256((record.parent / filename).read_bytes()).hexdigest() != expected:
                raise ValueError('Collection file hash mismatch: ' + filename)
        base = 'collections/' + collection['id'] + '/'
        report = base + 'report.md'
        collection['report'] = prefix + report
        collection['reportHtml'] = html((record.parent / 'report.md').read_text(), document=evidence / report, inline=False)
        data['collections'].append(collection)
        photos.extend(collection['selectedCaptures'])
        for result in collection.get('functional', []):
            previous = next((r for r in data['functional'] if r['test'] == result['test']), None)
            if previous:
                previous['previousResult'] = dict(previous)
                previous.update(result)
            else:
                data['functional'].append(dict(result))
        for group in groups:
            updated = False
            for row in group['criteria']:
                if row['id'] not in collection['criteria']:
                    continue
                update = collection['criteria'][row['id']]
                reference = row['applications'][app]
                snapshot_key = 'snapshotWidgetsEvidence' if app == 'widgets' else 'snapshotQmlEvidence'
                if snapshot_key in row:
                    # Preserve earlier collection transitions when a later run
                    # supersedes the same criterion's evidence.
                    row.setdefault('collectionEvidenceHistory', []).append({
                        'application': app,
                        'before': row[snapshot_key],
                        'after': json.loads(json.dumps(reference)),
                        'hasFailure': row['hasFailure'],
                    })
                row[snapshot_key] = json.loads(json.dumps(reference))
                statuses = data['summary']['criteria_statuses'][app]
                statuses[reference.get('currentOriginalStatus', reference['originalStatus'])] -= 1
                statuses[update['status']] = statuses.get(update['status'], 0) + 1
                reference['currentOriginalStatus'] = update['status']
                reference['status'], reference['label'] = STATUS[update['status']]
                reference['text'] = update['detail']
                reference['html'] = html(update['detail']) + ' <a href="' + prefix + report + '">Capture report, checks and limits</a>.'
                if update.get('testGap'):
                    reference['html'] += ' <strong>Remaining functional proof:</strong> ' + html(update['testGap'], document=evidence / 'README.md')
                if app == 'qml':
                    row['hasFailure'] = update.get('hasFailure', row['hasFailure'])
                new_captures = [p['path'] for p in collection['selectedCaptures'] if row['id'] in p['features']]
                reference['captures'] = (new_captures + reference['captures'] if update.get('preferNewCaptures')
                                         else reference['captures'] + new_captures)
                row['searchText'] = ' '.join([group['id'], row['id'], group['name'], row['intent']] + [a['text'] for a in row['applications'].values()]).lower()
                updated = True
            if updated:
                group['tests'].append({
                    'application': 'Qt Widgets' if app == 'widgets' else 'GUI-QML',
                    'testHtml': '<a href="' + prefix + base + collection.get('entryScript', 'scripts/capture_widgets.py') + '">Additional capture scenarios</a>',
                    'resultHtml': '<a href="' + prefix + report + '">' + collection['date'] + ': criterion-specific proof and limits</a>; <a href="' + prefix + base + 'logs/checks.json">targeted assertions</a>' + ('; ' + collection.get('failureSummary', 'cache-range regression failed') if app == 'qml' and any(c['hasFailure'] for c in group['criteria']) else ''),
                    'failed': app == 'qml' and any(c['hasFailure'] for c in group['criteria']),
                })
            group['captures'] = [p['path'] for p in photos if any(s.startswith(group['id'] + '.') for s in p['features'])]
    data['summary']['selected_captures'] = len(photos)
    data['summary']['captures_by_application'] = {app: sum(p['application'] == app for p in photos) for app in ('widgets', 'qml')}
    data['summary']['qml_functional'] = {status: sum(r['status'] == status for r in data['functional']) for status in ('passed', 'failed')}
    data['latestEvidenceDate'] = max([data['summary']['date']] + [r['date'] for r in data['reruns'] + data['collections']])
    apply_catalog_audit(data, json.loads((ROOT / 'data/catalog-audit.json').read_text()))
    audit_text = audit_markdown(data)
    data['catalogAudit']['reportHtml'] = html(audit_text.partition('\n\n')[2], inline=False)
    apply_hardware_platform_review(data, json.loads((ROOT / 'data/hardware-platform-review.json').read_text()), evidence)
    hardware_review_text = review_markdown(data)
    data['hardwarePlatformReview']['reportHtml'] = MD.render(hardware_review_text.partition('\n\n')[2])
    apply_visual_review(data, json.loads((ROOT / 'data/visual-acceptance.json').read_text()))
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir()
    for file in (ROOT / 'src').iterdir():
        if file.is_file():
            shutil.copy2(file, DEST / file.name)
    (DEST / 'data.js').write_text('window.REVIEW_EVIDENCE = ' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + ';\n')
    (DEST / 'catalog-audit.md').write_text(audit_text)
    (DEST / 'hardware-platform-review.md').write_text(hardware_review_text)
    shutil.copy2(ROOT / 'data/hardware-platform-review.json', DEST / 'hardware-platform-review.json')
    shutil.copy2(ROOT / 'data/visual-acceptance.json', DEST / 'visual-acceptance.json')
    (DEST / 'current-catalog.md').write_text(current_catalog_markdown(data))
    (DEST / 'current-assessments.json').write_text(json.dumps({'catalogId': data['catalogId'], 'catalogRevision': data['catalogRevision'], 'criteria': {c['id']: c['implementation'] for g in groups for c in g['criteria']}, 'groups': {g['id']: g['implementation'] for g in groups}}, indent=2) + '\n')
    shutil.copy2(ROOT / 'data/catalog-audit.json', DEST / 'catalog-audit.json')
    shutil.copy2(ROOT / 'data/implementation.json', DEST / 'implementation.json')
    output_evidence = DEST / 'gui-feature-evidence'
    output_evidence.mkdir()
    for file in evidence.iterdir():
        if file.is_file() and file.suffix in ('.md', '.json'):
            shutil.copy2(file, output_evidence / file.name)
    for dirname in ('features', 'logs', 'scripts'):
        shutil.copytree(evidence / dirname, output_evidence / dirname, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    if (ROOT / 'data/reruns').is_dir():
        shutil.copytree(ROOT / 'data/reruns', output_evidence / 'reruns')
    if (ROOT / 'data/collections').is_dir():
        shutil.copytree(ROOT / 'data/collections', output_evidence / 'collections')
    for photo in original_photos + [p for p in photos if p not in original_photos]:
        source = (ROOT / 'data' if photo['path'].startswith(('reruns/', 'collections/')) else evidence) / photo['path']
        target = output_evidence / photo['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != photo['sha256']:
            raise ValueError('Capture hash mismatch: ' + photo['path'])
    comparison = evidence.parent / 'bitcoin-core-gui-supported-features.md'
    if comparison.is_file():
        shutil.copy2(comparison, DEST / comparison.name)
    manifest = {'catalogId': data['catalogId'], 'groups': len(groups), 'criteria': sum(len(f['criteria']) for f in groups),
                'selectedCaptures': len(photos), 'sourceEvidenceDate': data['summary']['date'],
                'latestEvidenceDate': data['latestEvidenceDate']}
    (DEST / 'build-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))
    if snapshot:
        snapshot.cleanup()


if __name__ == '__main__':
    main()
