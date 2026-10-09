#!/usr/bin/env python3
"""Build the acceptance catalogue from explicit mappings and recorded outcomes."""
import hashlib
import json
from pathlib import Path
import re
import struct
import sys
sys.path.insert(0,str(Path(__file__).parent))
from catalog_data import FUNCTIONAL, UNIT, QUICK, WIDGET_TESTS, WIDGET_TEST_FILES, MISSING, PARTIAL, SCOPES, WIDGET_LIMITS
from capture_map import QML_CAPTURES, feature_ids
ROOT=Path(__file__).resolve().parents[1]
GUI_REV='f739c7876b81304bdc72e7eaa307702da269ac31'
QML_REV='a91f4b4774f25de061fe1a7c132a91ddde117fca'
features=json.loads((ROOT/'inventory.json').read_text())
results={r['test']:r for r in json.loads((ROOT/'logs/qml-functional-results.json').read_text())}
checks=json.loads((ROOT/'logs/widgets-checks.json').read_text())
photos=json.loads((ROOT/'media/widgets/captures.json').read_text())
for p in photos:p['application']='widgets'
for p in json.loads((ROOT/'media/qml/captures.json').read_text()):
    photos.append({**p,'application':'qml'})
additional=json.loads((ROOT/'logs/qml-additional-checks.json').read_text())+json.loads((ROOT/'logs/qml-native-shell-checks.json').read_text())
missing_matches=[]
for folder,needle,caption,ids in QML_CAPTURES:
    stem=folder if folder.startswith('qml_') else 'qml_test_'+folder
    manifest=ROOT/'media/qml'/stem/'captures.json'
    rows=json.loads(manifest.read_text()) if manifest.exists() else []
    matches=[r for r in rows if needle.lower() in r['caption'].lower()]
    if not matches:
        missing_matches.append([folder,needle]);continue
    item={**matches[0],'caption':caption,'features':feature_ids(ids),'application':'qml'}
    if not any(p['path']==item['path'] for p in photos):photos.append(item)
    else:
        existing=next(p for p in photos if p['path']==item['path'])
        existing['features']=sorted(set(existing['features']+item['features']))
for photo in photos:
    header=(ROOT/photo['path']).read_bytes()[:24]
    photo['width'],photo['height']=struct.unpack('>II',header[16:24])
    if photo['application']=='widgets' and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)+',photo['caption']):
        photo['caption']=photo['caption'].replace('-',' ').capitalize()
        for word in ('psbt','qr','rpc','uri'):
            photo['caption']=re.sub(r'\b'+word+r'\b',word.upper(),photo['caption'],flags=re.I)
(ROOT/'selected-captures.json').write_text(json.dumps(photos,indent=2)+'\n')

def mdlink(label,target):return f'[{label}]({target})'
def capture_links(items):return '<br>'.join(mdlink(p['caption'],'../'+p['path']) for p in items[:3])
def source(repo,revision,path,label=None):return mdlink(label or path,f'https://github.com/bitcoin-core/{repo}/blob/{revision}/{path}')
def plain(text):return re.sub(r'\[([^]]+)\]\([^)]+\)',r'\1',text)
def cell(text):return text.replace('|','\\|').replace('\n',' ')
summary=[]
for feature in features:
    n=feature['number'];fid=feature['id'];subs=feature['subfeatures']
    selected=[p for p in photos if any(s.startswith(fid+'.') for s in p.get('features',[]))]
    wp=[p for p in selected if p['application']=='widgets'];qp=[p for p in selected if p['application']=='qml']
    functional=FUNCTIONAL.get(n,'').split();unit=UNIT.get(n,'').split();quick=QUICK.get(n,'').split()
    widgets_suites=WIDGET_TESTS.get(n,'').split()
    lines=[f'# {fid} · {feature["name"]}', '', '[Evidence index](../README.md) · [Test results](../TEST-RESULTS.md) · [Capture and build provenance](../PROVENANCE.md)', '',
           f'{len(subs)} acceptance criteria from the supported-feature inventory. **Acceptance is pending review.** A screenshot demonstrates the visible state; the stated assertions describe the behavior that was actually checked. Related passing suites do not certify every variant of a criterion.', '',
           '## Implementation comparison', '',feature['qml_comparison'].replace('<br><br>','\n\n').replace('<br>','\n'),'',
           '## Application captures','', '| Qt Widgets (`src/qt`) | GUI-QML (`qt6`) |','| --- | --- |']
    def gallery(items):
        if not items:return 'No matching application capture collected. See the criterion-level gaps below.'
        return '<br><br>'.join(f'![{p["caption"]}](../{p["path"]})<br>{p["caption"]}' for p in items[:2])
    lines.append('| '+gallery(wp)+' | '+gallery(qp)+' |')
    if feature.get('support'):
        lines += ['', 'Baseline support notes: '+ ' '.join(feature['support'])]
    if len(selected)>4:
        lines += ['','[All selected captures for this group](#capture-register) are listed below.']
    lines += ['','## Modules','',f'- **Qt Widgets:** [primary implementation]({feature["widgets_source"]}).']
    widget_extra=[]
    for s in subs: widget_extra+=re.findall(r'\[([^]]+)\]\((https://github.com/bitcoin-core/gui/[^)]+)\)',s['intent'])
    for label,url in dict.fromkeys(widget_extra):lines.append(f'  {mdlink(label,url)}.')
    qrefs=re.findall(r'\[([^]]+)\]\((https://github.com/bitcoin-core/gui-qml/[^)]+)\)',feature['qml_comparison'])
    lines += ['- **GUI-QML:** '+('; '.join(mdlink(label,url) for label,url in qrefs) or 'No reachable implementation for this feature.')+'.', '',
              'These are the implementation entry points for the criteria below. Links are pinned to the tested source revisions.', '', '## Automated tests', '',
              '| Application | Test/module | Recorded result |','| --- | --- | --- |']
    for t in functional:
        stem='qml_test_'+t;r=results.get(stem,{})
        status=r.get('status','not run')
        if r.get('skip_messages'):status+='; '+', '.join(r['skip_messages'])
        lines.append('| GUI-QML | '+source('gui-qml',QML_REV,f'test/functional/{stem}.py',stem)+' | '+mdlink(status,'../logs/'+stem+'.log')+' |')
    for t in unit:
        lines.append('| GUI-QML C++ | '+source('gui-qml',QML_REV,'test/test_'+t+'.cpp')+' | [Suite passed](../logs/qml-unit-tests.log); fixture/model assertions |')
    for t in quick:
        lines.append('| GUI-QML components | '+source('gui-qml',QML_REV,'test/qml/tst_'+t+'.qml')+' | [Suite passed](../logs/qml-quick-tests.log); component assertions |')
    if n in (2,9,11,12,19):lines.append('| GUI-QML additional | [Independent live scenarios](../scripts/qml_additional.py) | [Passed](../logs/qml-additional.log), [assertions](../logs/qml-additional-checks.json) |')
    if n in (24,26,27):lines.append('| GUI-QML native shell | [Linux tray scenario](../scripts/qml_native_shell.py) | [Passed](../logs/qml-native-shell.log), [assertions](../logs/qml-native-shell-checks.json) |')
    for t in widgets_suites:
        lines.append('| Qt Widgets | '+source('gui',GUI_REV,'src/qt/test/'+WIDGET_TEST_FILES[t],t)+' | [Suite passed](../logs/widgets-qt-tests.log); inspect assertion scope |')
    relevantchecks=[c for c in checks if any(s.startswith(fid+'.') for s in c['features'])]
    if relevantchecks:lines.append('| Qt Widgets additional | [Live GUI/RPC scenarios](../scripts/widgets_scenarios.py) | [Recorded assertions](../logs/widgets-checks.json); outcomes listed per criterion |')
    if not functional+unit+quick+widgets_suites and not relevantchecks:lines.append('| Both | No targeted automated run collected | Source/capture evidence only |')
    lines += ['', '## Acceptance criteria', '']
    for s in subs:
        sid=s['id'];idx=int(sid.split('S')[1]);intent=plain(s['intent'])
        # Keep the user-facing criterion at the same level as the original inventory.
        intent=re.sub(r'\s+(Unlock handling|Activity navigation|QR support|Payment validation|Multisig support|Amount units|Settings behavior|Settings recovery|Transaction notifications|Automatic startup|System shutdown integration|Synchronization feedback|History privacy)\.?$','',intent)
        sp=[p for p in selected if sid in p.get('features',[])]
        sw=[p for p in sp if p['application']=='widgets'];sq=[p for p in sp if p['application']=='qml']
        sc=[c for c in checks if sid in c['features']]
        wstatus='Assertions collected' if any(c['status']=='passed' for c in sc) else ('Visual evidence only' if sw else ('Related automated suite' if widgets_suites else 'Source only'))
        wtext='<br>'.join(c['description']+' **'+c['status']+'**.' for c in sc)
        if not wtext:wtext='No targeted runtime assertion collected for this exact criterion.'
        if sid in WIDGET_LIMITS:wtext+='<br>**Limit:** '+WIDGET_LIMITS[sid]
        if sw:wtext+='<br>'+capture_links(sw)
        else:wtext+='<br>No matching screenshot collected.'
        wtext+='<br>[Modules](#modules) · [Related tests](#automated-tests)'
        gap=MISSING.get(n,{}).get(idx);partial=PARTIAL.get(n,{}).get(idx);scope=SCOPES.get(n,{}).get(idx)
        targeted=[c for c in additional if sid in c['features']]
        if targeted:scope=(scope+'<br>' if scope else '')+'<br>'.join(c['description']+' **'+c['status']+'**.' for c in targeted)
        qstatus='Implementation gap' if gap else ('Partial / limited evidence' if partial else ('Automated evidence collected' if scope else ('Visual evidence only' if sq else 'Source / related tests only')))
        qtext=gap or partial or ''
        if scope:qtext+=(('<br>' if qtext else '')+scope)
        if not qtext:qtext='No targeted runtime assertion collected for this exact criterion.'
        if sq:qtext+='<br>'+capture_links(sq)
        else:qtext+='<br>'+('No screenshot: this GUI workflow is absent.' if gap else 'No matching screenshot collected.')
        qtext+='<br>[Modules](#modules) · [Related tests](#automated-tests)'
        lines += [f'### {sid} · {intent}', '', '| Application | Evidence status | Evidence and limits |','| --- | --- | --- |',f'| Qt Widgets | {wstatus} | {cell(wtext)} |',f'| GUI-QML | {qstatus} | {cell(qtext)} |','', '- [ ] Acceptance decision recorded by reviewer.', '']
        summary.append({'id':sid,'intent':s['intent'],'page':'features/'+feature['slug']+'.md','widgets':wstatus,'qml':qstatus,'widgets_assertions':[c['id'] for c in sc],'captures':[p['path'] for p in sp]})
    lines += ['## Capture register','','The original PNGs are unmodified application captures. Timestamps, dimensions and SHA-256 hashes are in the [capture manifest](../selected-captures.json). Some early/raw frames are not selected for review.','', '| Application | Capture | Criteria |','| --- | --- | --- |']
    for p in selected:lines.append('| '+p['application']+' | '+mdlink(p['caption'],'../'+p['path'])+' | '+', '.join(x for x in p['features'] if x.startswith(fid+'.'))+' |')
    if not selected:lines.append('| Both | No selected capture | See source and test evidence above |')
    (ROOT/'features'/f'{feature["slug"]}.md').write_text('\n'.join(lines)+'\n')
(ROOT/'coverage.json').write_text(json.dumps(summary,indent=2)+'\n')
print('Generated',len(features),'pages and',len(summary),'criteria;',len(photos),'selected captures.')
if missing_matches:print('Unmatched capture selectors:',json.dumps(missing_matches))
