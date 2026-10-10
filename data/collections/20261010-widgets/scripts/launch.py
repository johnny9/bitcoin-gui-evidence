import json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path('/work/reruns/20261010-widgets')
mode=sys.argv[1]
env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(ROOT/'config'),'WIDGETS_EVIDENCE_SOCKET':str(ROOT/'widgets.sock'),'LD_PRELOAD':'/work/widgets_bridge_v2.so'}
(ROOT/'node').mkdir(exist_ok=True)
if mode=='desktop':
    for name,args in [('xvfb',['Xvfb',':98','-screen','0','1440x1080x24','-nolisten','tcp']),('openbox',['openbox'])]:
        with (ROOT/'logs'/f'{name}.log').open('w') as log:
            p=subprocess.Popen(args,env={k:v for k,v in env.items() if k!='LD_PRELOAD'},stdout=log,stderr=subprocess.STDOUT)
            (ROOT/f'{name}.pid').write_text(str(p.pid))
        time.sleep(.7)
    sys.exit()
args=['/work/widgets-build/bin/bitcoin-qt','-datadir='+str(ROOT/'node'),'-regtest','-server','-listen=0','-connect=0','-dnsseed=0','-discover=0','-rpcport=19643','-rpcuser=evidence','-rpcpassword=synthetic-test-only','-fallbackfee=0.00002','-keypool=5','-persistmempool=0','-splash=0','-lang=en','-nowallet']+sys.argv[2:]
(ROOT/'logs'/f'{mode}.command.json').write_text(json.dumps(args,indent=2)+'\n')
with (ROOT/'logs'/f'{mode}.stdout').open('w') as out,(ROOT/'logs'/f'{mode}.stderr').open('w') as err:
    process=subprocess.Popen(args,env=env,stdout=out,stderr=err)
    (ROOT/'gui.pid').write_text(str(process.pid))
    code=process.wait()
(ROOT/'logs'/f'{mode}.exit').write_text(str(code)+'\n')
