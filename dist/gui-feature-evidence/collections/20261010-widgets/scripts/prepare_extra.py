import json,subprocess,time
from capture_widgets import ROOT,rpc,waitfor
log=(ROOT/'logs/extra-fixture-daemon.log').open('w')
args=['/work/widgets-build/bin/bitcoind','-datadir='+str(ROOT/'node'),'-regtest','-server','-listen=0','-connect=0','-dnsseed=0','-keypool=5','-rpcport=19643','-rpcuser=evidence','-rpcpassword=synthetic-test-only','-fallbackfee=0.00002','-wallet=Reference wallet','-wallet=Recipient wallet','-wallet=Watch-only monitor']
p=subprocess.Popen(args,stdout=log,stderr=subprocess.STDOUT);waitfor(lambda:rpc('getblockchaininfo'))
keys={}
for wallet in ['Cosigner A','Cosigner B']:
    if wallet in {w['name'] for w in rpc('listwalletdir')['wallets']}:rpc('loadwallet',[wallet])
    else:rpc('createwallet',[wallet])
    d=next(d['desc'] for d in rpc('listdescriptors',[True],wallet=wallet)['descriptors'] if d['desc'].startswith('wpkh') and not d['internal'])
    pub=next(d['desc'] for d in rpc('listdescriptors',wallet=wallet)['descriptors'] if d['desc'].startswith('wpkh') and not d['internal'])
    keys[wallet]={'private':d.split('#')[0][5:-1],'public':pub.split('#')[0][5:-1]}
public=rpc('getdescriptorinfo',['wsh(sortedmulti(2,'+keys['Cosigner A']['public']+','+keys['Cosigner B']['public']+'))'])['descriptor']
address=rpc('deriveaddresses',[public,[0,0]])[0]
for wallet,other in [('Cosigner A','Cosigner B'),('Cosigner B','Cosigner A')]:
    raw='wsh(sortedmulti(2,'+keys[wallet]['private']+','+keys[other]['public']+'))'
    info=rpc('getdescriptorinfo',[raw]);desc=raw+'#'+info['checksum']
    assert rpc('importdescriptors',[[{'desc':desc,'timestamp':'now','range':[0,5]}]],wallet=wallet)[0]['success']
fixture=json.loads((ROOT/'fixture.json').read_text())
funding=rpc('sendtoaddress',[address,2],wallet='Reference wallet');rpc('generatetoaddress',[1,fixture['mining']])
decoded=rpc('decoderawtransaction',[rpc('gettransaction',[funding],wallet='Reference wallet')['hex']]);index=next(o['n'] for o in decoded['vout'] if o['scriptPubKey'].get('address')==address)
psbt=rpc('walletcreatefundedpsbt',[[{'txid':funding,'vout':index}],{fixture['recipient']:1},0,{'changeAddress':address}],wallet='Cosigner A')['psbt']
(ROOT/'multisig-fixture.json').write_text(json.dumps({'publicDescriptor':public,'address':address,'unsignedPsbt':psbt},indent=2)+'\n')
# A longer real chain keeps rescan progress visible without delaying or replacing application behavior.
start=time.monotonic();rpc('generatetoaddress',[max(0,15120-rpc('getblockcount')),rpc('deriveaddresses',[rpc('getdescriptorinfo',['wpkh(0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798)'])['descriptor']])[0]]);print('Generated rescan chain in',time.monotonic()-start,'seconds',flush=True)
rpc('stop');assert p.wait(timeout=60)==0
