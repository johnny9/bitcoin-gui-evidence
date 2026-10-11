"""Record explicit acceptance of existing screenshots without relabeling automation."""
from copy import deepcopy


def apply_visual_review(data, review):
    if (review['schemaVersion'] != 1 or review['sourceRevision'] != data['revisions']['qml']
            or review['snapshotCatalogId'] != data['catalogId']):
        raise ValueError('Visual review does not match the pinned application')
    criteria = {c['id']: c for g in data['groups'] for c in g['criteria']}
    captures = {p['path']: p for p in data['captures']}
    for sid, assessment in review['criteria'].items():
        row = criteria[sid]
        photo = captures.get(assessment['capture'])
        if row['implementation']['status'] != 'parity' or row['hasFailure']:
            raise ValueError('Visual acceptance cannot override a gap or failure: ' + sid)
        if (assessment['basis'] != 'reviewed-screenshot' or assessment['decision'] != 'accepted'
                or not assessment['reason'] or not photo or photo['application'] != 'qml'
                or photo['sha256'] != assessment['sha256']):
            raise ValueError('Visual acceptance needs an explicit decision and matching QML capture: ' + sid)
        if 'qmlReview' in row:
            raise ValueError('Criterion already has a reviewed evidence basis: ' + sid)
        row['qmlReview'] = deepcopy(assessment)
        row['searchText'] += ' ' + assessment['reason'].lower()
    data['visualAcceptance'] = deepcopy(review)
