import json,shutil,subprocess,time
from capture_widgets import ROOT,rpc,waitfor
base=ROOT/'legacy-node';base.mkdir(exist_ok=True)
log=(ROOT/'logs/legacy-fixture.log').open('w')
args=['/work/releases/bitcoin-28.0/bin/bitcoind','-datadir='+str(base),'-regtest','-server','-listen=0','-connect=0','-dnsseed=0','-keypool=5','-deprecatedrpc=create_bdb','-rpcport=19743','-rpcuser=evidence','-rpcpassword=synthetic-test-only']
p=subprocess.Popen(args,stdout=log,stderr=subprocess.STDOUT)
waitfor(lambda:rpc('getblockchaininfo',port=19743))
records={}
for name in ['Legacy savings','Legacy deferred']:
    rpc('createwallet',{'wallet_name':name,'descriptors':False},port=19743)
    own=rpc('getnewaddress',['Preserved savings','legacy'],wallet=name,port=19743)
    watched=json.loads((ROOT/'fixture.json').read_text())['recipient']
    rpc('importaddress',[watched,'Preserved watch-only',False],wallet=name,port=19743)
    backup=ROOT/(name.replace(' ','-')+'.dat');rpc('backupwallet',[str(backup)],wallet=name,port=19743)
    records[name]={'ownedAddress':own,'watchedAddress':watched,'backup':str(backup)}
rpc('stop',port=19743);assert p.wait(timeout=30)==0
shutil.copytree(base/'regtest/wallets/Legacy deferred',ROOT/'node/regtest/wallets/Legacy deferred')
(ROOT/'legacy-fixture.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps(records))
