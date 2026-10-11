"""Apply source-and-test acceptance reviews without changing runtime records.

The original hardware/platform report path remains stable for existing links.
"""
import copy
import re


def apply_hardware_platform_review(data, review, evidence):
    if (review['schemaVersion'] != 1 or review['sourceRevision'] != data['revisions']['qml']
            or review['snapshotCatalogId'] != data['catalogId']):
        raise ValueError('Hardware/platform review does not match the pinned application')
    criteria = {c['id']: c for g in data['groups'] for c in g['criteria']}
    source_paths = set()
    for sid, assessment in review['criteria'].items():
        row = criteria[sid]
        if row['implementation']['status'] != 'parity' or row['hasFailure']:
            raise ValueError('Hardware/platform review cannot override a gap or failure: ' + sid)
        if (assessment['basis'] != 'qml-tests-hooks' or not assessment['reason']
                or not assessment['qml'] or not assessment['hooks'] or not assessment['tests']):
            raise ValueError('Incomplete hardware/platform review: ' + sid)
        for test in assessment['tests']:
            if (not test.get('covers', '').strip()
                    or type(test.get('sourceLine')) is not int or test['sourceLine'] < 1):
                raise ValueError('Missing test coverage explanation or source location: ' + sid)
            log = (evidence / test['log']).resolve()
            if (not log.is_relative_to(evidence) or not test['recordedAssertion']
                    or test['recordedAssertion'] not in log.read_text()):
                raise ValueError('Missing recorded test result: ' + sid)
        source_paths.update(assessment['qml'] + assessment['hooks'] + [t['path'] for t in assessment['tests']])
        row['qmlReview'] = copy.deepcopy(assessment)
        row['searchText'] += ' ' + assessment['reason'].lower()
    if source_paths != review['sourceFiles'].keys() or any(
            not re.fullmatch(r'[0-9a-f]{64}', value) for value in review['sourceFiles'].values()):
        raise ValueError('Incomplete reviewed-source hash register')
    data['hardwarePlatformReview'] = copy.deepcopy(review)
    for group in data['groups']:
        if any('qmlReview' in c for c in group['criteria']):
            group['tests'].append({
                'application': 'GUI-QML review',
                'testHtml': '<a href="hardware-platform-review.md">QML workflows, integration hooks and existing tests</a>',
                'resultHtml': review['date'] + ': sufficient for acceptance; assessment only, no new application test run',
                'failed': False,
            })


def review_markdown(data):
    review = data['hardwarePlatformReview']
    source = 'https://github.com/bitcoin-core/gui-qml/blob/' + review['sourceRevision'] + '/'
    criteria = {c['id']: c for g in data['groups'] for c in g['criteria']}
    lines = ['# Evidence review using existing tests', '',
             'Assessed ' + review['date'] + ' against GUI-QML `' + review['sourceRevision'] + '`.', '',
             review['rule'], '',
             'These evidence assessments use existing source and recorded test results to support acceptance. '
             'No new application test, physical-device run or operating-system run is claimed. '
             'Original runtime records and captures are unchanged. Saved reviewer decisions still take precedence.', '',
             f'The {len(review["criteria"])} reviewed subfeatures below have sufficient proof for this review. '
             'Device address verification, desktop notification delivery, login startup, Windows session shutdown '
             'and macOS background-throttling protection still lack the required connected user functionality. '
             'F27.S03 also remains partial: the startup busy indicator does not expose Core initialization progress. '
             'The six additional assessments cover storage planning, synchronization estimates, traffic periods, '
             'advanced console commands, settings reset and cancellation during startup.', '']
    for sid, row in review['criteria'].items():
        criterion = criteria[sid]
        lines += ['## ' + sid + ' — ' + criterion['intent'], '',
                  '[Open subfeature](#feature/' + criterion['groupId'] + '?item=' + sid + ')', '', row['reason'], '',
                  'QML: ' + ', '.join('[' + p + '](' + source + p + ')' for p in row['qml']) + '.', '',
                  'Hooks: ' + ', '.join('[' + p + '](' + source + p + ')' for p in row['hooks']) + '.', '',
                  'What the tests prove:', '']
        for test in row['tests']:
            lines += ['- **' + test['label'] + '** — ' + test['covers'],
                      '  [Assertions in ' + test['path'] + ':' + str(test['sourceLine']) + ']('
                      + source + test['path'] + '#L' + str(test['sourceLine']) + ') · ['
                      + test['recordedAssertion'] + '](gui-feature-evidence/' + test['log'] + ').']
        lines += ['', 'Coverage limits: ' + row['limits'], '']
    lines += ['[Review data and source hashes](hardware-platform-review.json)', '']
    return '\n'.join(lines)
