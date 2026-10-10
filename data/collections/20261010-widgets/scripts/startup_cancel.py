import os,shutil,subprocess,time
import capture_widgets as c
from widgets_driver import Driver
base=c.ROOT/'startup-cancel-node';(base/'regtest').mkdir(parents=True,exist_ok=True)
(base/'regtest/blocks').mkdir(exist_ok=True)
for blockfile in (c.ROOT/'node/regtest/blocks').glob('blk*.dat'):shutil.copy2(blockfile,base/'regtest/blocks'/blockfile.name)
socket=c.ROOT/'startup-cancel.sock';env={**os.environ,'DISPLAY':':98','XDG_CONFIG_HOME':str(c.ROOT/'config-startup-cancel'),'LD_PRELOAD':'/work/widgets_bridge_v2.so','WIDGETS_EVIDENCE_SOCKET':str(socket)}
args=['/work/widgets-build/bin/bitcoin-qt','-datadir='+str(base),'-regtest','-networkactive=0','-listen=0','-reindex','-splash=1','-nowallet']
with (c.ROOT/'logs/startup-cancel.stdout').open('w') as out,(c.ROOT/'logs/startup-cancel.stderr').open('w') as err:
    p=subprocess.Popen(args,env=env,stdout=out,stderr=err);c.waitfor(lambda:socket.exists());c.gui=Driver(path=str(socket));splash=c.gui.wait(cls='SplashScreen',timeout=15)
    c.immediate_capture('cancel-during-startup',splash,['F27.S03','F27.S04'],'Startup splash during a real local reindex, before requesting shutdown with Q.')
    c.gui.send('key',id=splash['id'],key=81);code=p.wait(timeout=40);(c.ROOT/'logs/startup-cancel.exit').write_text(str(code)+'\n')
    c.check('orderly-cancel-during-startup',['F27.S04'],'Q on the initialization splash requests shutdown and the process exits cleanly.',code,0)
