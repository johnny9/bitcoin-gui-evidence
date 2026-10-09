#!/usr/bin/env python3
"""Real Linux X11 tray actions, node continuity, and native tray quit."""
import json
import os
from pathlib import Path
import subprocess
import time
from qml_wallet_test_lib import WalletFlowHarness, rpc_call

checks=[]
def check(name,features,description,condition):
    checks.append({'id':name,'features':features,'description':description,'status':'passed' if condition else 'failed'})
    Path('/evidence/logs/qml-native-shell-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
    assert condition,description
    print(name,': passed',flush=True)

def xdo(*args):
    subprocess.run(['xdotool',*map(str,args)],check=True);time.sleep(.35)

def desktop(name):
    subprocess.run(['import','-window','root',f'/evidence/media/qml/{name}.png'],check=True)

h=WalletFlowHarness('acceptance_native_shell',port_offset=1600)
try:
    h.start_gui(extra_args=['-disablewallet']);g=h.driver
    g.wait_for_property('appWindow','visible',True)
    g.save_screenshot('/tmp/node-only-with-tray.png')
    xdo('mousemove',1424,1066,'click',3);desktop('linux-tray-menu')
    xdo('key','Escape');xdo('mousemove',1424,1066,'click',1)
    check('native-tray-hide',['F24.S01','F24.S02','F26.S03'],'Linux tray hides the QML window while RPC still responds.',g.get_property('appWindow','visible') is False and rpc_call(h.gui_rpc_port,'getblockcount')>=0)
    xdo('mousemove',1424,1066,'click',3);desktop('linux-tray-hidden');xdo('key','Escape')
    xdo('mousemove',1424,1066,'click',1)
    check('native-tray-show',['F24.S01','F24.S02'],'Linux tray restores the QML window.',g.get_property('appWindow','visible') is True)
    xdo('mousemove',1424,1066,'click',3);xdo('mousemove',1360,1054,'click',1)
    code=h.gui_process.wait(timeout=30)
    Path('/evidence/logs/qml-native-shell-app.log').write_text(h.process_output(h.gui_process))
    check('native-tray-quit',['F24.S04','F27.S05'],'The native Linux tray Quit action exits the application successfully.',code==0)
finally:
    h.stop()
