"""Apply reviewed priorities to the active catalog, after scope consolidation."""
import copy


def apply_priorities(data, assessment):
    if assessment.get('schemaVersion') != 1:
        raise ValueError('Expected priority assessment schema version 1')
    if assessment.get('snapshotCatalogId') != data['catalogId'] or assessment.get('catalogRevision') != data['catalogRevision']:
        raise ValueError('Reassess priorities for the changed catalog')
    levels = assessment.get('levels', [])
    if [level.get('rank') for level in levels] != [1, 2, 3, 4, 5]:
        raise ValueError('Priority levels must run from 1 (highest) to 5 (lowest)')
    if any(not isinstance(level.get(key), str) or not level[key].strip() for level in levels for key in ('label', 'description')):
        raise ValueError('Priority levels need labels and descriptions')
    criteria = {c['id']: c for g in data['groups'] for c in g['criteria']}
    ratings = assessment.get('criteria', {})
    if ratings.keys() != criteria.keys():
        raise ValueError('Priorities must cover exactly the active subfeatures')
    for sid, rating in ratings.items():
        if type(rating.get('rank')) is not int or rating['rank'] not in range(1, 6) or not isinstance(rating.get('reason'), str) or not rating['reason'].strip():
            raise ValueError('Invalid priority assessment: ' + sid)
    data['priorityAssessment'] = copy.deepcopy({k: v for k, v in assessment.items() if k != 'criteria'})
    for sid, criterion in criteria.items():
        criterion['priority'] = copy.deepcopy(ratings[sid])


def priorities_markdown(data):
    assessment = data['priorityAssessment']
    lines = ['# Subfeature priorities', '', assessment['basis'], '', assessment['sorting'], '', '| Rank | Priority | Meaning |', '| --- | --- | --- |']
    for level in assessment['levels']:
        lines.append(f'| P{level["rank"]} | {level["label"]} | {level["description"]} |')
    lines.extend(['', '## Incomplete subfeatures, highest priority first', '', 'These are planning judgments, not release requirements or new application test results. Equal ranks use subfeature ID order. Conditional safeguards must be delivered with the capability they protect.', '', '| Subfeature | User outcome | Implementation | Priority | Reason |', '| --- | --- | --- | --- | --- |'])
    criteria = [c for g in data['groups'] for c in g['criteria'] if c['implementation']['status'] != 'parity']
    for c in sorted(criteria, key=lambda c: (c['priority']['rank'], c['id'])):
        cells = [f'[{c["id"]}](index.html#feature/{c["groupId"]}?item={c["id"]})', c['intent'], c['implementation']['status'], f'P{c["priority"]["rank"]}', c['priority']['reason']]
        lines.append('| ' + ' | '.join(cell.replace('|', '\\|').replace('\n', ' ') for cell in cells) + ' |')
    lines.extend(['', '[All subfeature priorities and reasons (JSON)](priorities.json) · [Full catalog](current-catalog.md)', ''])
    return '\n'.join(lines)
