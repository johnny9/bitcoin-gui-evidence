#!/usr/bin/env python3
"""Check the built catalog, original asset hashes, and generated local links."""
import ast
from collections import Counter
import copy
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit
from hardware_platform import apply_hardware_platform_review
from visual_review import apply_visual_review

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
    assert len(criteria) == len({c['id'] for c in criteria}) == 182
    assert set(coverage) == {c['id'] for c in criteria + data['retiredCriteria']}
    historical = {c['id']: c for c in data['originalCriteria']}
    assert len(historical) == 203 and set(historical) == set(coverage)
    implementation = json.loads((ROOT / 'data/implementation.json').read_text())
    assert implementation == json.loads((DIST / 'implementation.json').read_text())
    assert implementation['snapshotCatalogId'] == data['catalogId']
    assert implementation['sourceRevisions'] == data['revisions']
    assert implementation['schemaVersion'] == 2
    assert implementation['assessmentStyle'] == 'rough-user-outcome'
    assert set(implementation['groups']) == {g['id'] for g in data['groups']}
    assert set(implementation['criteria']) == set(coverage)
    audit = data['catalogAudit']
    for criterion in criteria:
        expected = audit['rewrites'].get(criterion['id'], {}).get('implementation', implementation['criteria'][criterion['id']])
        assert criterion['implementation'] == expected
        assert criterion['implementation']['status'] in ('parity', 'partial', 'not-implemented')
        assert criterion['implementation']['reason'].strip()
    by_id = {c['id']: c for c in criteria}
    assert len(data['criterionAliases']) == 18
    assert len(data['criterionReplacements']) == len(data['retiredCriteria']) == 21
    assert set(data['criterionReplacements']) == set(coverage) - set(by_id)
    assert set(data['sourceTargets']) == set(coverage)
    for sid, targets in data['sourceTargets'].items():
        assert (targets or sid in audit['removals']) and len(targets) == len(set(targets)) and set(targets).issubset(by_id)
        for target in targets:
            assert sid in [source['id'] for source in by_id[target]['reviewSources']]
    for sid, targets in data['criterionReplacements'].items():
        assert all(sid.lower() in by_id[target]['searchText'] for target in targets)
        if len(targets) == 1:
            assert data['criterionAliases'][sid] == targets[0]
        else:
            assert sid not in data['criterionAliases']
    combined = by_id['F05.S01']
    assert combined['intent'] == 'Export a watch-only copy of a wallet for monitoring without spending access.'
    assert [r['id'] for r in combined['mergedCriteria']] == ['F05.S01', 'F05.S02', 'F05.S04']
    assert all(row == historical[row['id']] for row in data['retiredCriteria'])
    assert combined['implementation']['status'] == 'not-implemented'
    levels = {'assertions':0, 'visual':1, 'source':2, 'limited':3, 'gap':4}
    for criterion in criteria:
        for app in ('widgets', 'qml'):
            previous = [historical[sid]['applications'][app] for sid in criterion['evidenceSources']]
            record = criterion['applications'][app]
            override = audit['rewrites'].get(criterion['id'], {}).get(app)
            sources = override.get('captureFrom', criterion['evidenceSources']) if override else criterion['evidenceSources']
            assert record['captures'] == list(dict.fromkeys(p for sid in sources for p in historical[sid]['applications'][app]['captures']))
            assert record['status'] == (override['status'] if override else max((r['status'] for r in previous), key=levels.get))
            if not override:
                assert all(r['html'] in record['html'] for r in previous)
        assert set(criterion.get('relatedCriteria', [])).issubset(by_id)
    assert audit['reviewedCount'] == 203 and audit['currentCount'] == 182
    assert 'F28.S03' not in by_id and data['sourceTargets']['F28.S03'] == []
    assert not any(source['id'] == 'F28.S03' for c in criteria for source in c['reviewSources'])
    assert audit['removals']['F28.S03']['relatedGroups'] == ['F18', 'F19', 'F23', 'F22']
    assert audit['status'] == 'implemented'
    assert Counter(f['kind'] for f in audit['findings']) == {'merged':1, 'duplicate':9, 'overlap':12, 'distinct':8}
    assert Counter(f['status'] for f in audit['findings']) == {'applied':22, 'retained':8}
    assert all(f['resolution'] and set(f['outcomes']).issubset(by_id) for f in audit['findings'])
    reviewed = [sid for g in audit['groups'] for sid in g['reviewedCriteria']]
    assert len(reviewed) == len(set(reviewed)) == 203 and set(reviewed) == set(coverage)
    assert data['preMergeSummary']['criteria'] == 203 and data['summary']['criteria'] == 182
    current = json.loads((DIST / 'current-assessments.json').read_text())
    assert current['catalogRevision'] == data['catalogRevision']
    assert current['criteria'] == {c['id']:c['implementation'] for c in criteria}
    assert current['groups'] == {g['id']:g['implementation'] for g in data['groups']}
    # Pending payments are proved; the separate maturity refresh failure remains.
    assert by_id['F07.S01']['implementation']['status'] == 'partial'
    assert implementation['groups']['F07']['status'] == 'partial'
    assert by_id['F07.S01']['applications']['qml']['status'] == 'limited'
    assert 'Verified: pending payments.' in by_id['F07.S01']['applications']['qml']['text']
    assert by_id['F07.S01']['hasFailure']
    # Incomplete proof must not be mistaken for absent implementation.
    assert by_id['F04.S02']['implementation']['status'] == 'parity'
    assert by_id['F04.S02']['applications']['qml']['status'] == 'assertions'
    assert by_id['F04.S02']['snapshotQmlEvidence']['status'] == 'source'
    assert by_id['F15.S03']['implementation']['status'] == 'not-implemented'
    assert by_id['F29.S04']['implementation']['status'] == 'not-implemented'
    assert by_id['F09.S07']['applications']['qml']['status'] == 'assertions'
    for sid in ('F20.S05', 'F22.S05', 'F26.S03', 'F14.S06'):
        assert by_id[sid]['applications']['qml']['status'] == 'limited', sid
    assert by_id['F03.S04']['implementation']['status'] == 'not-implemented'
    assert by_id['F09.S03']['implementation']['status'] == 'parity'
    assert by_id['F09.S03']['applications']['qml']['status'] == 'assertions'
    assert by_id['F09.S03']['snapshotEvidence']['status'] == 'limited'
    assert by_id['F09.S03']['snapshotEvidence']['captures'] == []
    assert len(by_id['F09.S03']['applications']['qml']['captures']) == 2
    # Alternative workflows can fulfill an outcome without erasing source differences.
    assert by_id['F08.S06']['implementation']['status'] == 'parity'
    assert by_id['F08.S06']['applications']['qml']['status'] == 'assertions'
    assert by_id['F08.S06']['snapshotQmlEvidence']['status'] == 'gap'
    assert by_id['F13.S05']['implementation']['status'] == 'parity'
    assert by_id['F14.S01']['implementation']['status'] == 'partial'  # Import compatibility still blocks some PSBTs.
    assert implementation['groups']['F01']['status'] == 'parity'
    assert by_id['F01.S04']['implementation']['status'] == 'not-implemented'
    assert implementation['groups']['F25']['status'] == 'not-implemented'
    assert by_id['F25.S04']['implementation']['status'] == 'parity'
    assert [c['id'] for c in criteria if c['hasFailure']] == ['F07.S01', 'F23.S01']
    assert by_id['F23.S01']['implementation']['status'] == 'partial'
    review = json.loads((ROOT / 'data/hardware-platform-review.json').read_text())
    assert review == json.loads((DIST / 'hardware-platform-review.json').read_text())
    assert len(review['criteria']) == 11
    assert {c['id'] for c in criteria if c.get('qmlReview', {}).get('basis') == 'qml-tests-hooks'} == review['criteria'].keys()
    for sid, assessment in review['criteria'].items():
        assert by_id[sid]['qmlReview'] == assessment
        assert by_id[sid]['implementation']['status'] == 'parity' and not by_id[sid]['hasFailure']
        assert assessment['qml'] and assessment['hooks'] and assessment['tests']
        for test in assessment['tests']:
            assert test['recordedAssertion'] in (original / test['log']).read_text()
    assert all('qmlReview' not in c for c in data['originalCriteria'])
    visual = json.loads((ROOT / 'data/visual-acceptance.json').read_text())
    assert visual == data['visualAcceptance'] == json.loads((DIST / 'visual-acceptance.json').read_text())
    assert set(visual['criteria']) == {'F12.S04'}
    assert by_id['F12.S04']['qmlReview'] == visual['criteria']['F12.S04']
    assert by_id['F12.S04']['applications']['qml']['status'] == 'limited'
    assert by_id['F12.S04']['qmlReview']['capture'].endswith('019-wallet-coin-locked.png')
    photo = next(p for p in data['captures'] if p['path'] == by_id['F12.S04']['qmlReview']['capture'])
    assert photo['sha256'] == by_id['F12.S04']['qmlReview']['sha256']
    # Explicit visual acceptance is scoped to the existing QML image and criterion.
    for field, value in (('hasFailure', True), ('implementation', {'status': 'partial'})):
        rejected = copy.deepcopy(data)
        row = next(c for g in rejected['groups'] for c in g['criteria'] if c['id'] == 'F12.S04')
        row.pop('qmlReview')
        row[field] = value
        try:
            apply_visual_review(rejected, visual)
        except ValueError as error:
            assert 'cannot override a gap or failure' in str(error)
        else:
            raise AssertionError('Visual acceptance overrode an implementation gap or failure')
    assert not any('qmlReview' in by_id[sid] for sid in ('F15.S03', 'F25.S01', 'F27.S01', 'F27.S08', 'F31.S04', 'F07.S01', 'F23.S01'))
    sufficient = lambda c: not c['hasFailure'] and bool(c.get('qmlReview') or
        (c['applications']['qml']['status'] == 'assertions' and c['applications']['qml']['captures']))
    assert sum(sufficient(c) for c in criteria) == 127
    assert sum(sufficient(c) and c['implementation']['status'] == 'parity' for c in criteria) == 127
    assert sum(not sufficient(c) and c['implementation']['status'] == 'parity' for c in criteria) == 7
    # A stale assessment must not override a new failure or an implementation gap.
    for change in ({'hasFailure': True}, {'implementation': {'status': 'partial'}}):
        rejected = copy.deepcopy(data)
        row = next(c for g in rejected['groups'] for c in g['criteria'] if c['id'] == 'F21.S04')
        row.update(change)
        try:
            apply_hardware_platform_review(rejected, review, original)
        except ValueError as error:
            assert 'cannot override a gap or failure' in str(error)
        else:
            raise AssertionError('Hardware/platform assessment accepted a failure or missing workflow')
    parser = Links()
    parser.feed((DIST / 'index.html').read_text())
    parser.feed(data['testReportHtml'])
    parser.feed(data['provenanceHtml'])
    parser.feed(audit['reportHtml'])
    parser.feed(data['hardwarePlatformReview']['reportHtml'])
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
        app = collection['application']
        assert app in ('widgets', 'qml')
        assert collection['sourceRevision'] == data['revisions'][app]
        assert collection['snapshotCatalogId'] == data['catalogId']
        folder = original / 'collections' / collection['id']
        for filename, expected in collection['files'].items():
            assert hashlib.sha256((folder / filename).read_bytes()).hexdigest() == expected, filename
        checks = json.loads((folder / 'logs/checks.json').read_text())
        if collection['id'] == '20261011-pending-balance':
            assert len(checks) == collection['assertions'] == 28
            assert [c['id'] for c in checks if c['status'] == 'failed'] == ['maturity-refresh-matured-balance-display']
            assert all((c['actual'] == c['expected']) == (c['status'] == 'passed') for c in checks)
            assert len([c for c in checks if c['test'] == 'qml_evidence_pending_balance']) == 13
            assert Counter(r['status'] for r in collection['functional']) == {'passed': 1, 'failed': 1}
            assert set(collection['criteria']) == {'F07.S01'}
            assert len(collection['selectedCaptures']) == 3
            state = json.loads((folder / 'logs/pending-wallet-state.json').read_text())
            assert state['incomingTransaction'] in state['mempoolBefore']
            assert state['beforeConfirmation']['untrusted_pending'] == 0.125
            assert state['afterConfirmation']['trusted'] == 1.625
            assert state['afterConfirmation']['untrusted_pending'] == 0
            for result in collection['functional']:
                captures = json.loads((folder / 'media/qml' / result['test'] / 'captures.json').read_text())
                assert len(captures) == result['captures']
                for capture in captures:
                    assert hashlib.sha256((folder / capture['path']).read_bytes()).hexdigest() == capture['sha256']
            collection_capture_count += len(collection['selectedCaptures'])
            continue
        if app == 'qml':
            assert len(checks) == collection['assertions'] == 50
            assert [c['id'] for c in checks if c['status'] == 'failed'] == ['gui-accepts-768']
            assert all((c['actual'] == c['expected']) == (c['status'] == 'passed') for c in checks)
            history = json.loads((folder / 'coverage.json').read_text())
            assert len(history) == 61
            assert sum(c['fullAfter'] for c in history) == collection['closedProofGaps'] == 35
            assert sum(c['newCapture'] for c in history) == collection['newlyCapturedCriteria'] == 33
            assert set(collection['criteria']) == {c['id'] for c in history}
            plan = json.loads((folder / 'functional-test-plan.json').read_text())
            assert {c['id'] for c in plan} == set(collection['criteria'])
            assert sum(c['status'] != 'proved' for c in plan) == collection['remainingProofGaps'] == 26
            assert len({c['testGroup'] for c in plan if c['testGroup']}) == 19
            for previous in history:
                current = historical[previous['id']]
                transitions = [r for r in current.get('collectionEvidenceHistory', []) if r['application'] == app]
                if transitions:
                    assert len(transitions) == 1
                    assert transitions[0]['before'] == previous['before']
                    reference = transitions[0]['after']
                    has_failure = transitions[0]['hasFailure']
                else:
                    assert current['snapshotQmlEvidence'] == previous['before']
                    reference = current['applications']['qml']
                    has_failure = current['hasFailure']
                assert reference['captures'] == previous['before']['captures'] + previous['captures']
                assert has_failure == previous['hasFailure']
                full = reference['status'] == 'assertions' and bool(reference['captures']) and not has_failure
                assert full == previous['fullAfter']
                for cid in previous['checks']:
                    assert any(c['id'] == cid and previous['id'] in c['features'] for c in checks)
            assert Counter(r['status'] for r in collection['functional']) == {'passed':16, 'failed':1}
            for result in collection['functional']:
                name = result['test']
                captures = json.loads((folder / 'media/qml' / name / 'captures.json').read_text())
                assert len(captures) == result['captures']
                for capture in captures:
                    assert hashlib.sha256((folder / capture['path']).read_bytes()).hexdigest() == capture['sha256']
            for capture in collection['selectedCaptures']:
                assert capture['application'] == 'qml'
                assert set(capture['features']).issubset(collection['criteria'])
            collection_capture_count += len(collection['selectedCaptures'])
            continue
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
            current = historical[previous['id']]
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
        assert set(group['relatedCriteria']).issubset(by_id)
        assert all(by_id[sid]['groupId'] != group['id'] for sid in group['relatedCriteria'])
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
    assert len(data['captures']) == 120 + collection_capture_count == 221
    assert sum(not c['applications']['widgets']['captures'] for c in criteria) == 9
    assert sum(not c['applications']['widgets']['captures'] for c in historical.values()) == 11
    archived_captures = json.loads((original / 'selected-captures.json').read_text())
    superseded = {p for r in data['reruns'] for p in r.get('supersededCaptures', [])}
    active_originals = [p for p in archived_captures if p['path'] not in superseded]
    assert data['captures'][:len(active_originals)] == active_originals
    assert not superseded.intersection(p['path'] for p in data['captures'])
    for photo in archived_captures + data['captures']:
        asset = original / photo['path']
        assert hashlib.sha256(asset.read_bytes()).hexdigest() == photo['sha256'], photo['path']
    assert Counter(r['status'] for r in data['functional']) == {'passed':40, 'failed':2}
    assert Counter(r['status'] for r in json.loads((original / 'logs/qml-functional-results.json').read_text())) == {'passed':33, 'failed':1}
    rerun_result = next(r for r in data['functional'] if r['test'] == 'qml_test_send_create')
    assert rerun_result['previousResult']['status'] == 'failed'
    assert rerun_result['date'] == '2026-10-10' and rerun_result['testModified']
    rbf = next(r for r in data['functional'] if r['test'] == 'qml_test_wallet_rbf')
    assert rbf['previousResult']['status'] == 'passed'
    assert rbf['date'] == '2026-10-10' and rbf['testVariant'] == 'Capture checkpoints'
    for sid in ('F17.S01', 'F17.S02', 'F17.S03'):
        assert historical[sid]['applications']['qml']['captures']
        assert all(p.startswith('reruns/20261010-wallet-rbf/') for p in historical[sid]['applications']['qml']['captures'])
        assert not historical[sid]['hasFailure']
    assert data['summary']['qml_functional'] == {'passed':40, 'failed':2}
    assert data['summary']['criteria_statuses']['qml']['Automated evidence collected'] == 115
    assert data['summary']['criteria_statuses']['qml']['Partial / limited evidence'] == 33
    assert sum(data['summary']['criteria_statuses']['qml'].values()) == 182
    for script in (ROOT / 'scripts').glob('*.py'):
        ast.parse(script.read_text())
    report = {'status':'passed', 'groups':34, 'criteria':182, 'auditedOriginalCriteria':203, 'retiredCriteria':21, 'appliedFindings':22, 'retainedDistinctions':8, 'originalCapturesVerified':116,
              'rerunCapturesVerified':rerun_capture_count, 'collectionCapturesVerified':collection_capture_count,
              'widgetsCriteriaWithoutCaptures':9, 'historicalWidgetsCriteriaWithoutCaptures':11, 'localLinkTargets':len(local_links), 'unresolvedFailures':2, 'catalogId':data['catalogId'],
              'hardwarePlatformReviewed':11, 'screenshotsAccepted':1, 'defaultAccepted':127, 'remainingParityProofGaps':7,
              'groupParity': dict(Counter(g['implementation']['status'] for g in data['groups'])),
              'subfeatureParity': dict(Counter(c['implementation']['status'] for c in criteria))}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
