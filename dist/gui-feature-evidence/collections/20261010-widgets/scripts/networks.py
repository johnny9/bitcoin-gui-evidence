import json,os,subprocess,time
import capture_widgets as c
from widgets_driver import Driver
for index,chain in enumerate(['main','test','testnet4','signet','regtest']):
    base=c.ROOT/('network-'+chain);base.mkdir(exist_ok=True);port=19800+index;socket=c.ROOT/(chain+'.sock')
    env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(c.ROOT/('config-network-'+chain)),'LD_PRELOAD':'/work/widgets_bridge_v2.so','WIDGETS_EVIDENCE_SOCKET':str(socket)}
    args=['/work/widgets-build/bin/bitcoin-qt','-datadir='+str(base),'-chain='+chain,'-server','-listen=0','-connect=0','-dnsseed=0','-networkactive=0','-splash=0','-rpcport='+str(port),'-rpcuser=evidence','-rpcpassword=synthetic-test-only','-nowallet']
    with (c.ROOT/'logs'/f'network-{chain}.stdout').open('w') as out,(c.ROOT/'logs'/f'network-{chain}.stderr').open('w') as err:
        p=subprocess.Popen(args,env=env,stdout=out,stderr=err)
        c.waitfor(lambda:socket.exists())
        c.gui=Driver(path=str(socket));c.gui.wait(cls='BitcoinGUI',timeout=30)
        c.waitfor(lambda:c.rpc('getblockchaininfo',port=port))
        c.check('network-'+chain,['F20.S07','F31.S02'],'GUI starts on the selected network with peer activity disabled.',c.rpc('getblockchaininfo',port=port)['chain'],chain)
        c.gui.action('Node window');c.gui.action('Information')
        c.snap('network-'+chain,['F20.S07','F31.S02'],'Node information identifies '+chain+' in an isolated offline startup. No public-chain download is claimed.',cls='RPCConsole')
        c.gui.close('RPCConsole');c.gui.send('action',id=c.gui.find(cls='QAction',text='Exit')['id'])
        deadline=time.monotonic()+1
        while time.monotonic()<deadline:
            try:
                obj=c.gui.find(cls='ShutdownWindow');c.immediate_capture('shutdown-progress',obj,['F27.S05','F27.S06'],'The real application shutdown window explains that shutdown is in progress.');break
            except (RuntimeError,OSError,ValueError):time.sleep(.005)
        code=p.wait(timeout=30);(c.ROOT/'logs'/f'network-{chain}.exit').write_text(str(code)+'\n');assert code==0
c.check('network-gui-clean-exits',['F27.S05'],'All five network GUI sessions exited cleanly through the Exit action.',True)
