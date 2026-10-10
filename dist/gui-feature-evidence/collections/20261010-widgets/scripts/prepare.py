import json
from capture_widgets import ROOT,rpc,waitfor
waitfor(lambda:rpc('getblockchaininfo'))
pub=rpc('listdescriptors',wallet='Reference wallet')['descriptors']
result=rpc('importdescriptors',[[dict(desc=d['desc'],timestamp=0,active=d['active'],internal=d['internal'],range=d.get('range',[0,10]),next_index=d.get('next_index',0)) for d in pub]],wallet='Watch-only monitor')
assert all(r['success'] for r in result)
mining=rpc('getnewaddress',['Mining fixture'],wallet='Reference wallet');recipient=rpc('getnewaddress',['Capture recipient'],wallet='Recipient wallet')
(ROOT/'fixture.json').write_text(json.dumps({'mining':mining,'recipient':recipient,'watchonlyImport':result},indent=2)+'\n')
print(rpc('getwalletinfo',wallet='Watch-only monitor'))
rpc('stop')
