#!/usr/bin/env python3
"""Acceptance outcomes exercised through the running QML application."""
import json
import os
from pathlib import Path
import subprocess
import time
from qml_wallet_test_lib import WalletFlowHarness, rpc_call
from evidence_helpers import check, key, settings, shot, wait

os.environ['EVIDENCE_SCENARIO'] = 'desktop'
h = WalletFlowHarness('evidence_desktop', 2200)
try:
    h.start_gui()
    g = h.driver
    g.wait_for_property('walletBadge', 'loading', False, timeout_ms=20000)
    rpc_call(h.gui_rpc_port, 'createwallet', {'wallet_name':'Review_wallet'})
    g.wait_for_property('walletBadge', 'text', 'Review_wallet', timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    address = rpc_call(h.gui_rpc_port,'getnewaddress',['Evidence recipient'],wallet='Review_wallet')
    g.invoke('appWindow','requestActivate')

    for combo, page in [('ctrl+2','sendPage'),('ctrl+3','requestPaymentPage'),('ctrl+1','activityPage')]:
        key(combo)
        g.wait_for_page(page)
        check('shortcut-'+combo, 'F28.S04 F28.S05', 'Keyboard shortcut reaches '+page, g.get_property(page,'visible'))
        shot(g,'keyboard-'+page)

    g.click('sendTabButton')
    g.wait_for_page('sendPage')
    g.wait_for_property('feeSelectionEstimateLabel','value','—')
    check('fee-unavailable', 'F11.S04', 'An empty payment has no fee estimate and explains the missing recipient.',
          g.get_property('feeSelectionEstimateLabel','value'), '—')
    shot(g,'fee-estimate-unavailable')
    g.type_text('sendAddressInput',address)
    g.wait_for_property('sendAddressInput','text',lambda value:value.replace(' ','')==address)
    check('enter-payment-address','F09.S02','Entering a recipient preserves the complete address.',g.get_text('sendAddressInput').replace(' ',''),address)
    shot(g,'recipient-entered')

    settings(g,'wallet')
    g.click('walletAddressesRow')
    g.wait_for_page('addressListPage')
    check('open-address-records','F28.S03','Wallet settings opens the address records.',g.get_property('addressListPage','visible'))
    shot(g,'address-records')
    settings(g,'rpc-console')
    g.wait_for_page('rpcConsoleSettingsPage')
    g.set_text('consoleInput','getblockchaininfo')
    key('Return')
    g.wait_for_property('rpcConsole','executing',False)
    g.wait_for_property('rpcConsole','outputCount',lambda value:value>=2)
    check('wallet-diagnostics','F26.S04 F28.S03','Node diagnostics execute while the same wallet remains loaded.',rpc_call(h.gui_rpc_port,'listwallets'),['Review_wallet'])
    check('contextual-guidance','F29.S06','The console explains history navigation and how to discover available commands.', 'navigate history' in g.get_text('rpcConsoleHelpFooter') and 'help-console' in g.get_text('rpcConsoleHelpFooter'))
    shot(g,'diagnostics-with-wallet')
    g.click('settingsDoneButton')
    g.click('blockClockTabButton')
    g.wait_for_property('blockClock','visible',True)
    g.click('blockClockToggleArea')
    g.wait_for_property('blockClock','paused',True)
    check('pause-network','F21.S01','Pausing from the node view disables Core peer networking.',rpc_call(h.gui_rpc_port,'getnetworkinfo')['networkactive'],False)
    shot(g,'network-paused')
    g.click('blockClockToggleArea')
    g.wait_for_property('blockClock','paused',False)
    check('resume-network','F21.S01','Resuming from the node view enables Core peer networking.',rpc_call(h.gui_rpc_port,'getnetworkinfo')['networkactive'])

    settings(g,'connection')
    g.wait_for_page('connectionSettingsPage')
    check('rpc-server','F23.S02','The displayed RPC server is enabled and serves a real external client.',g.get_property('serverSwitch','checked') and rpc_call(h.gui_rpc_port,'getblockcount')==0)
    shot(g,'rpc-server-configured')
    settings(g,'developer')
    g.wait_for_page('settingsDeveloper')
    for field, value in [('developerDbcacheField','6'),('developerScriptThreadsField','2')]:
        g.settle()
        g.type_text(field,'')
        key('ctrl+a')
        subprocess.run(['xdotool','type','--clearmodifiers','--delay','80',value],check=True)
        g.wait_for_property(field,'text',value)
        key('Tab')
    wait(lambda: json.loads(Path(h.gui_settings_path).read_text()).get('dbcache')=='6')
    values=json.loads(Path(h.gui_settings_path).read_text())
    check('resource-preferences','F23.S01','GUI edits persist cache and script thread allocations.',[int(values['dbcache']),int(values['par'])],[6,2])
    shot(g,'resource-settings-restart-guidance')

    g.set_property('appWindow','x',145)
    g.set_property('appWindow','y',65)
    before=[g.get_property('appWindow',p) for p in ['width','height','x','y']]
    shot(g,'window-placement-before-restart')
    h.restart_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    after=[g.get_property('appWindow',p) for p in ['width','height','x','y']]
    check('window-placement-restored','F26.S02','The real window position and size survive an application restart.',after,before)
    shot(g,'window-placement-restored')
    settings(g,'developer')
    check('resources-restored','F23.S01','Resource allocations remain visible after restart.',[g.get_text('developerDbcacheField'),g.get_text('developerScriptThreadsField')],['6','2'])
    shot(g,'resource-settings-after-restart')
    with (Path(h.gui_datadir)/'bitcoin.conf').open('a') as conf:
        conf.write('dbcache=384\n')
    h.restart_gui(extra_args=['-dbcache=256'])
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    settings(g,'developer')
    check('command-line-precedence','F23.S11','Command-line settings override configuration and GUI settings and disable editing.',[g.get_text('developerDbcacheField'),g.get_property('developerDbcacheField','enabled')],['256',False])
    shot(g,'command-line-setting-precedence')
    h.restart_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    settings(g,'developer')
    check('gui-over-config','F23.S11','A persisted GUI override takes precedence over the configuration file.',[g.get_text('developerDbcacheField'),g.get_property('developerDbcacheField','enabled')],['6',True])
    h.stop_gui()
    h.update_gui_settings({'dbcache':None})
    h.start_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    settings(g,'developer')
    check('configuration-precedence','F23.S10 F23.S11','The configuration-file value is shown when no command-line or GUI override is present.',[g.get_text('developerDbcacheField'),g.get_property('developerDbcacheField','enabled')],['384',True])
    shot(g,'configuration-file-setting-precedence')
finally:
    h.stop()
