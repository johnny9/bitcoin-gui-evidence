#!/usr/bin/env python3
"""Build a portable static browser for the original, unmodified evidence pack."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from tempfile import TemporaryDirectory

from markdown_it import MarkdownIt

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
    criterion_ids = {s['id'] for f in inventory for s in f['subfeatures']}
    if implementation_rows.keys() != criterion_ids:
        raise ValueError('Implementation assessment must cover exactly the inventory criteria')
    for sid, assessment in implementation_rows.items():
        if assessment['status'] not in ('parity', 'partial', 'not-implemented') or not assessment['reason'].strip():
            raise ValueError('Invalid implementation assessment: ' + sid)
    coverage = {r['id']: r for r in load('coverage.json')}
    photos = load('selected-captures.json')
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
        group_implementation = ('parity' if implementation_counts['parity'] == len(rows) else
                                'not-implemented' if implementation_counts['not-implemented'] == len(rows) else 'partial')
        groups.append({
            'id': fid, 'name': feature['name'], 'number': feature['number'], 'slug': feature['slug'], 'area': area,
            'implementation': {'status': group_implementation, 'counts': implementation_counts},
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
        'implementationAssessment': {k: v for k, v in implementation.items() if k != 'criteria'},
        'areas': [{'id': key, 'label': label} for key, label, _ in AREAS],
        'groups': groups, 'captures': photos,
        'functional': load('logs/qml-functional-results.json'),
        'testReportHtml': html((evidence / 'TEST-RESULTS.md').read_text(), document=evidence / 'TEST-RESULTS.md', inline=False),
        'provenanceHtml': html((evidence / 'PROVENANCE.md').read_text(), document=evidence / 'PROVENANCE.md', inline=False),
        'revisions': {'widgets': 'f739c7876b81304bdc72e7eaa307702da269ac31', 'qml': 'a91f4b4774f25de061fe1a7c132a91ddde117fca'},
    }
    if implementation['sourceRevisions'] != data['revisions']:
        raise ValueError('Implementation assessment source revisions do not match the comparison')
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir()
    for file in (ROOT / 'src').iterdir():
        if file.is_file():
            shutil.copy2(file, DEST / file.name)
    (DEST / 'data.js').write_text('window.REVIEW_EVIDENCE = ' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + ';\n')
    shutil.copy2(ROOT / 'data/implementation.json', DEST / 'implementation.json')
    output_evidence = DEST / 'gui-feature-evidence'
    output_evidence.mkdir()
    for file in evidence.iterdir():
        if file.is_file() and file.suffix in ('.md', '.json'):
            shutil.copy2(file, output_evidence / file.name)
    for dirname in ('features', 'logs', 'scripts'):
        shutil.copytree(evidence / dirname, output_evidence / dirname, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    for photo in photos:
        source = evidence / photo['path']
        target = output_evidence / photo['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != photo['sha256']:
            raise ValueError('Capture hash mismatch: ' + photo['path'])
    comparison = evidence.parent / 'bitcoin-core-gui-supported-features.md'
    if comparison.is_file():
        shutil.copy2(comparison, DEST / comparison.name)
    manifest = {'catalogId': data['catalogId'], 'groups': len(groups), 'criteria': sum(len(f['criteria']) for f in groups),
                'selectedCaptures': len(photos), 'sourceEvidenceDate': data['summary']['date']}
    (DEST / 'build-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))
    if snapshot:
        snapshot.cleanup()


if __name__ == '__main__':
    main()
