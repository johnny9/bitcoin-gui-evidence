#!/usr/bin/env python3
"""Desktop appearance, window restoration, and closing all loaded wallets."""
import os
import subprocess
from qml_wallet_test_lib import WalletFlowHarness, rpc_call
from qml_test_password_wallet import close_wallet_from_selector
from evidence_helpers import check, key, settings, shot, wait

os.environ['EVIDENCE_SCENARIO']='shell'
h=WalletFlowHarness('evidence_shell',2600)
try:
    h.start_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    rpc_call(h.gui_rpc_port,'createwallet',dict(wallet_name='First_wallet'))
    rpc_call(h.gui_rpc_port,'createwallet',dict(wallet_name='Second_wallet'))
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    settings(g,'display')
    g.click('displayThemePickerOption_0')
    check('appearance-light','F31.S03','The light appearance can be selected from the GUI.',g.get_property('displayThemePicker','currentIndex'),0)
    shot(g,'manual-light-appearance')
    g.click('displayThemePickerOption_1')
    check('appearance-dark','F31.S03','The dark appearance can be selected from the GUI.',g.get_property('displayThemePicker','currentIndex'),1)
    shot(g,'manual-dark-appearance')
    g.click('settingsDoneButton')
    g.invoke('appWindow','requestActivate')
    window=subprocess.check_output(['xdotool','getactivewindow'],text=True).strip()
    key('ctrl+m')
    g.wait_for_property('appWindow','visibility','Minimized')
    check('window-minimize','F26.S01','Minimizing the GUI leaves the node responding.',rpc_call(h.gui_rpc_port,'getblockcount'),0)
    subprocess.run(['xdotool','windowactivate','--sync',window],check=True)
    g.wait_for_property('appWindow','visibility','Windowed')
    check('window-restore','F26.S01','The desktop restores the minimized application window.',g.get_property('appWindow','visible'))
    shot(g,'window-restored-from-desktop')
    close_wallet_from_selector(g,'First_wallet')
    wait(lambda:rpc_call(h.gui_rpc_port,'listwallets')==['Second_wallet'])
    close_wallet_from_selector(g,'Second_wallet')
    wait(lambda:rpc_call(h.gui_rpc_port,'listwallets')==[])
    g.wait_for_property('walletBadge','noWalletLoaded',True)
    check('close-all-wallets','F02.S04','Repeating the wallet close action closes every loaded wallet while the node continues.',rpc_call(h.gui_rpc_port,'listwallets'),[])
    check('node-after-close','F02.S04','The node remains available after closing all wallets.',rpc_call(h.gui_rpc_port,'getblockcount'),0)
    shot(g,'all-wallets-closed')
finally:
    h.stop()
