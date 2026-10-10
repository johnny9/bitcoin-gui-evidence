import json,os,subprocess,time
import capture_widgets as c
from widgets_driver import Driver
base=c.ROOT/'monitor-node';base.mkdir(exist_ok=True);socket=c.ROOT/'monitor.sock';port=19653
args=['/work/widgets-build/bin/bitcoin-qt','-datadir='+str(base),'-regtest','-server','-listen=0','-connect=127.0.0.1:19644','-dnsseed=0','-discover=0','-splash=0','-rpcport='+str(port),'-rpcuser=evidence','-rpcpassword=synthetic-test-only','-nowallet']
env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(c.ROOT/'config-monitor'),'LD_PRELOAD':'/work/widgets_bridge_v2.so','WIDGETS_EVIDENCE_SOCKET':str(socket)}
with (c.ROOT/'logs/monitor-node.stdout').open('w') as out,(c.ROOT/'logs/monitor-node.stderr').open('w') as err:
    p=subprocess.Popen(args,env=env,stdout=out,stderr=err);c.waitfor(lambda:socket.exists());c.gui=Driver(path=str(socket));c.gui.wait(cls='BitcoinGUI',timeout=40)
    c.waitfor(lambda:c.rpc('getblockcount',port=port)==c.rpc('getblockcount'),timeout=90)
    c.check('local-peer-block-download',['F20.S04'],'The second GUI node downloads and validates the local peer chain to the same best block.',[c.rpc('getblockcount',port=port),c.rpc('getbestblockhash',port=port)],[c.rpc('getblockcount'),c.rpc('getbestblockhash')])
    c.gui.action('Node window');c.gui.action('Information');c.snap('downloaded-validated-regtest-chain',['F20.S04'],'Node information after downloading and validating the 15,120-block local regtest chain. Not mainnet-scale or public-network validation.',cls='RPCConsole');c.gui.close('RPCConsole')
    c.gui.action('Restore Wallet…');c.gui.wait(cls='QFileDialog');c.gui.text('fileNameEdit',str(c.ROOT/'monitor-export.dat'));c.gui.click(cls='QPushButton',text='Open');c.gui.wait(cls='QInputDialog');c.gui.send('text',id=c.gui.find(cls='QLineEdit')['id'],text='Transferred watch-only monitor');c.ok()
    c.waitfor(lambda:'Transferred watch-only monitor' in c.rpc('listwallets',port=port),timeout=60);c.gui.wait(cls='QMessageBox',timeout=60)
    info=c.rpc('getwalletinfo',wallet='Transferred watch-only monitor',port=port);descriptors=c.rpc('listdescriptors',wallet='Transferred watch-only monitor',port=port)['descriptors']
    c.check('exported-monitor-on-second-node',['F05.S03'],'A separate GUI node restores the exported wallet with monitoring descriptors and no spending keys.',[info['private_keys_enabled'],bool(descriptors),any('prv' in d['desc'] for d in descriptors)],[False,True,False])
    c.snap('watchonly-transfer-restored',['F05.S03'],'The exported monitor wallet was restored in a separate GUI node.',cls='QMessageBox');c.ok();c.gui.action('Overview');time.sleep(.5)
    c.check('transferred-monitor-balance',['F05.S03'],'Transferred monitor rediscovers the original wallet balance on the synchronized second node.',c.rpc('getbalances',wallet='Transferred watch-only monitor',port=port)['mine']['trusted'],c.rpc('getbalances',wallet='Reference wallet')['mine']['trusted'])
    c.snap('watchonly-monitor-another-node',['F05.S03'],'Transferred watch-only wallet monitors the same balance on a separately synchronized node.')
    c.gui.action('Exit');code=p.wait(timeout=30);(c.ROOT/'logs/monitor-node.exit').write_text(str(code)+'\n');assert code==0
