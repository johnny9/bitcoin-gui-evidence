#!/usr/bin/env python3
"""Check the built catalog, original asset hashes, and generated local links."""
import ast
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href') and value:
                self.targets.append(value)


def main():
    script = (DIST / 'data.js').read_text()
    data = json.loads(script.removeprefix('window.REVIEW_EVIDENCE = ').strip().removesuffix(';'))
    original = DIST / 'gui-feature-evidence'
    coverage = {r['id']: r for r in json.loads((original / 'coverage.json').read_text())}
    assert len(data['groups']) == 34
    criteria = [c for g in data['groups'] for c in g['criteria']]
    assert len(criteria) == len({c['id'] for c in criteria}) == 203
    assert set(coverage) == {c['id'] for c in criteria}
    implementation = json.loads((ROOT / 'data/implementation.json').read_text())
    assert implementation == json.loads((DIST / 'implementation.json').read_text())
    assert implementation['snapshotCatalogId'] == data['catalogId']
    assert implementation['sourceRevisions'] == data['revisions']
    assert implementation['schemaVersion'] == 2
    assert implementation['assessmentStyle'] == 'rough-user-outcome'
    assert set(implementation['groups']) == {g['id'] for g in data['groups']}
    assert set(implementation['criteria']) == set(coverage)
    for criterion in criteria:
        assert criterion['implementation'] == implementation['criteria'][criterion['id']]
        assert criterion['implementation']['status'] in ('parity', 'partial', 'not-implemented')
        assert criterion['implementation']['reason'].strip()
    by_id = {c['id']: c for c in criteria}
    # Incomplete proof must not be mistaken for absent implementation.
    assert by_id['F04.S02']['implementation']['status'] == 'parity'
    assert by_id['F04.S02']['applications']['qml']['status'] == 'source'
    assert by_id['F15.S03']['implementation']['status'] == 'partial'
    assert by_id['F03.S04']['implementation']['status'] == 'not-implemented'
    assert by_id['F09.S03']['implementation']['status'] == 'parity'
    assert by_id['F09.S03']['applications']['qml']['status'] == 'assertions'
    assert by_id['F09.S03']['snapshotEvidence']['status'] == 'limited'
    assert by_id['F09.S03']['snapshotEvidence']['captures'] == []
    assert len(by_id['F09.S03']['applications']['qml']['captures']) == 2
    # Alternative workflows can fulfill an outcome without erasing source differences.
    assert by_id['F08.S06']['implementation']['status'] == 'parity'
    assert by_id['F08.S06']['applications']['qml']['status'] == 'gap'
    assert by_id['F13.S05']['implementation']['status'] == 'parity'
    assert by_id['F14.S01']['implementation']['status'] == 'partial'  # Import compatibility still blocks some PSBTs.
    assert implementation['groups']['F01']['status'] == 'parity'
    assert by_id['F01.S04']['implementation']['status'] == 'not-implemented'
    assert implementation['groups']['F25']['status'] == 'not-implemented'
    assert by_id['F25.S04']['implementation']['status'] == 'parity'
    assert sum(c['hasFailure'] for c in criteria) == 0
    parser = Links()
    parser.feed((DIST / 'index.html').read_text())
    parser.feed(data['testReportHtml'])
    parser.feed(data['provenanceHtml'])
    rerun_capture_count = 0
    for rerun in data['reruns']:
        parser.feed(rerun['reportHtml'])
        assert rerun['sourceRevision'] == data['revisions']['qml']
        assert rerun['applicationExitCode'] == 0
        assert all(r['exit_code'] == 0 and r['wrapper'] is False for r in rerun['repeats'])
        folder = original / 'reruns' / rerun['id']
        test_name = rerun['functional']['test']
        assert hashlib.sha256((folder / (test_name + '.py')).read_bytes()).hexdigest() == rerun['testSha256']
        captures = json.loads((folder / 'media/qml' / test_name / 'captures.json').read_text())
        assert len(captures) == rerun['functional']['captures']
        rerun_capture_count += len(captures)
        for capture in captures:
            assert hashlib.sha256((folder / capture['path']).read_bytes()).hexdigest() == capture['sha256']
    collection_capture_count = 0
    for collection in data['collections']:
        parser.feed(collection['reportHtml'])
        assert collection['application'] == 'widgets'
        assert collection['sourceRevision'] == data['revisions']['widgets']
        assert collection['snapshotCatalogId'] == data['catalogId']
        folder = original / 'collections' / collection['id']
        for filename, expected in collection['files'].items():
            assert hashlib.sha256((folder / filename).read_bytes()).hexdigest() == expected, filename
        checks = json.loads((folder / 'logs/checks.json').read_text())
        assert len(checks) == collection['assertions'] == 44
        assert all(c['status'] == 'passed' and c['actual'] == c['expected'] for c in checks)
        history = json.loads((folder / 'coverage.json').read_text())
        assert len(history) == collection['initialCriteriaWithoutCaptures'] == 69
        assert sum(c['captured'] for c in history) == collection['newlyCapturedCriteria'] == 58
        assert sum(not c['captured'] for c in history) == collection['remainingCriteriaWithoutCaptures'] == 11
        assert {c['id'] for c in history if c['captured']} == set(collection['criteria'])
        assert {c['id'] for c in history if not c['captured']} == set(collection['remainingGaps'])
        collection_capture_count += len(collection['selectedCaptures'])
        for previous in history:
            assert previous['before']['captures'] == []
            current = by_id[previous['id']]
            if previous['captured']:
                assert current['snapshotWidgetsEvidence'] == previous['before']
                assert current['applications']['widgets']['captures'] == previous['captures']
                update = collection['criteria'][previous['id']]
                assert update['checks'] == previous['checks']
                assert all(any(c['id'] == cid and previous['id'] in c['features'] for c in checks) for cid in update['checks'])
            else:
                assert current['applications']['widgets'] == previous['before']
        for capture in collection['selectedCaptures']:
            assert capture['application'] == 'widgets'
            assert set(capture['features']).issubset(collection['criteria'])
    for group in data['groups']:
        counts = Counter(c['implementation']['status'] for c in group['criteria'])
        assert group['implementation']['counts'] == {s: counts[s] for s in ('parity', 'partial', 'not-implemented')}
        assessment = implementation['groups'][group['id']]
        assert {k: v for k, v in group['implementation'].items() if k != 'counts'} == assessment
        assert assessment['status'] in ('parity', 'partial', 'not-implemented')
        assert assessment['goal'].strip() and assessment['reason'].strip()
        assert (DIST / group['markdown']).is_file()
        for field in ('modulesHtml', 'comparisonHtml', 'supportHtml'):
            parser.feed(group[field])
        for test in group['tests']:
            parser.feed(test['testHtml'])
            parser.feed(test['resultHtml'])
        for criterion in group['criteria']:
            for app, record in criterion['applications'].items():
                assert record['originalStatus'] == coverage[criterion['id']][app]
                parser.feed(record['html'])
    local_links = set()
    for target in parser.targets:
        url = urlsplit(target)
        if url.scheme or not url.path:
            continue
        path = (DIST / unquote(url.path)).resolve()
        assert path.is_relative_to(DIST), target
        assert path.is_file(), target
        local_links.add(url.path)
    assert len(data['captures']) == 120 + collection_capture_count == 181
    assert sum(not c['applications']['widgets']['captures'] for c in criteria) == 11
    archived_captures = json.loads((original / 'selected-captures.json').read_text())
    superseded = {p for r in data['reruns'] for p in r.get('supersededCaptures', [])}
    active_originals = [p for p in archived_captures if p['path'] not in superseded]
    assert data['captures'][:len(active_originals)] == active_originals
    assert not superseded.intersection(p['path'] for p in data['captures'])
    for photo in archived_captures + data['captures']:
        asset = original / photo['path']
        assert hashlib.sha256(asset.read_bytes()).hexdigest() == photo['sha256'], photo['path']
    assert Counter(r['status'] for r in data['functional']) == {'passed':34}
    assert Counter(r['status'] for r in json.loads((original / 'logs/qml-functional-results.json').read_text())) == {'passed':33, 'failed':1}
    rerun_result = next(r for r in data['functional'] if r['test'] == 'qml_test_send_create')
    assert rerun_result['previousResult']['status'] == 'failed'
    assert rerun_result['date'] == '2026-10-10' and rerun_result['testModified']
    rbf = next(r for r in data['functional'] if r['test'] == 'qml_test_wallet_rbf')
    assert rbf['previousResult']['status'] == 'passed'
    assert rbf['date'] == '2026-10-10' and rbf['testVariant'] == 'Capture checkpoints'
    for sid in ('F17.S01', 'F17.S02', 'F17.S03'):
        assert by_id[sid]['applications']['qml']['captures']
        assert all(p.startswith('reruns/20261010-wallet-rbf/') for p in by_id[sid]['applications']['qml']['captures'])
        assert not by_id[sid]['hasFailure']
    assert data['summary']['qml_functional'] == {'passed':34, 'failed':0}
    assert data['summary']['criteria_statuses']['qml']['Automated evidence collected'] == 108
    assert data['summary']['criteria_statuses']['qml']['Partial / limited evidence'] == 48
    for script in (ROOT / 'scripts').glob('*.py'):
        ast.parse(script.read_text())
    report = {'status':'passed', 'groups':34, 'criteria':203, 'originalCapturesVerified':116,
              'rerunCapturesVerified':rerun_capture_count, 'collectionCapturesVerified':collection_capture_count,
              'widgetsCriteriaWithoutCaptures':11, 'localLinkTargets':len(local_links), 'unresolvedFailures':0, 'catalogId':data['catalogId'],
              'groupParity': dict(Counter(g['implementation']['status'] for g in data['groups'])),
              'subfeatureParity': dict(Counter(c['implementation']['status'] for c in criteria))}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
