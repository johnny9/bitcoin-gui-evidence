"""Load the already synchronized secondary fixture after a GUI capture timeout."""
import json,os,subprocess,time
import capture_widgets as c
from widgets_driver import Driver
base=c.ROOT/'monitor-node';port=19653
with (c.ROOT/'logs/monitor-prepare.log').open('w') as log:
    p=subprocess.Popen(['/work/widgets-build/bin/bitcoind','-datadir='+str(base),'-regtest','-listen=0','-connect=0','-server','-rpcport='+str(port),'-rpcuser=evidence','-rpcpassword=synthetic-test-only','-nowallet'],stdout=log,stderr=subprocess.STDOUT)
    c.waitfor(lambda:c.rpc('getblockchaininfo',port=port))
    if 'Transferred watch-only monitor' not in c.rpc('listwallets',port=port):
        if any(w['name']=='Transferred watch-only monitor' for w in c.rpc('listwalletdir',port=port)['wallets']):c.rpc('loadwallet',['Transferred watch-only monitor'],port=port)
        else:c.rpc('restorewallet',['Transferred watch-only monitor',str(c.ROOT/'monitor-export.dat')],port=port)
    info=c.rpc('getwalletinfo',wallet='Transferred watch-only monitor',port=port)
    descriptors=c.rpc('listdescriptors',wallet='Transferred watch-only monitor',port=port)['descriptors']
    c.check('exported-monitor-on-second-node',['F05.S03'],'Separate node restores the GUI-exported wallet with public monitoring descriptors and no spending keys. Restore is RPC fixture setup.',[info['private_keys_enabled'],bool(descriptors),any('prv' in d['desc'] for d in descriptors)],[False,True,False])
    balance=c.rpc('getbalances',wallet='Transferred watch-only monitor',port=port)['mine']['trusted'];c.rpc('stop',port=port);assert p.wait(timeout=30)==0
socket=c.ROOT/'monitor-recovered.sock';env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(c.ROOT/'config-monitor'),'LD_PRELOAD':'/work/widgets_bridge_v2.so','WIDGETS_EVIDENCE_SOCKET':str(socket)}
with (c.ROOT/'logs/monitor-recovered.stdout').open('w') as out,(c.ROOT/'logs/monitor-recovered.stderr').open('w') as err:
    p=subprocess.Popen(['/work/widgets-build/bin/bitcoin-qt','-datadir='+str(base),'-regtest','-server','-listen=0','-connect=0','-splash=0','-rpcport='+str(port),'-rpcuser=evidence','-rpcpassword=synthetic-test-only','-wallet=Transferred watch-only monitor'],env=env,stdout=out,stderr=err)
    c.waitfor(lambda:socket.exists());c.gui=Driver(path=str(socket));c.gui.wait(cls='BitcoinGUI',timeout=40);c.waitfor(lambda:'Transferred watch-only monitor' in c.gui.find(cls='BitcoinGUI')['title'],timeout=40)
    c.gui.action('Overview');time.sleep(.5)
    c.snap('watchonly-monitor-another-node',['F05.S03'],'GUI displays the watch-only wallet restored from its export on a second node. Restore preparation used RPC.')
    c.check('transferred-monitor-visible',['F05.S03'],'The independently restored watch-only wallet is loaded in the second GUI and has a rediscovered balance.',balance>0)
    c.gui.action('Node window');c.gui.action('Information');c.snap('downloaded-validated-regtest-chain',['F20.S04'],'Information from the second node after its recorded download and validation of 15,120 local regtest blocks. GUI was restarted after the live-sync capture timed out.',cls='RPCConsole');c.gui.close('RPCConsole')
    c.gui.action('Exit');code=p.wait(timeout=30);(c.ROOT/'logs/monitor-recovered.exit').write_text(str(code)+'\n');assert code==0
