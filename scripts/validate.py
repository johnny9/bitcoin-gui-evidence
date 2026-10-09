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
    assert by_id['F09.S03']['implementation']['status'] == 'partial'
    assert sum(c['hasFailure'] for c in criteria) == 1
    assert next(c['id'] for c in criteria if c['hasFailure']) == 'F09.S03'
    parser = Links()
    parser.feed((DIST / 'index.html').read_text())
    parser.feed(data['testReportHtml'])
    parser.feed(data['provenanceHtml'])
    for group in data['groups']:
        counts = Counter(c['implementation']['status'] for c in group['criteria'])
        assert group['implementation']['counts'] == {s: counts[s] for s in ('parity', 'partial', 'not-implemented')}
        expected = ('parity' if counts['parity'] == len(group['criteria']) else
                    'not-implemented' if counts['not-implemented'] == len(group['criteria']) else 'partial')
        assert group['implementation']['status'] == expected
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
    assert len(data['captures']) == 116
    for photo in data['captures']:
        asset = original / photo['path']
        assert hashlib.sha256(asset.read_bytes()).hexdigest() == photo['sha256'], photo['path']
    assert Counter(r['status'] for r in data['functional']) == {'passed':33, 'failed':1}
    for script in (ROOT / 'scripts').glob('*.py'):
        ast.parse(script.read_text())
    report = {'status':'passed', 'groups':34, 'criteria':203, 'originalCapturesVerified':116,
              'localLinkTargets':len(local_links), 'knownFailure':'F09.S03', 'catalogId':data['catalogId'],
              'groupParity': dict(Counter(g['implementation']['status'] for g in data['groups'])),
              'subfeatureParity': dict(Counter(c['implementation']['status'] for c in criteria))}
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
