#!/usr/bin/env python3
"""Prepare an unsigned payment and rediscover history through the QML console."""
import base64
import json
import os
from pathlib import Path
import time
from qml_wallet_test_lib import WalletFlowHarness, rpc_call
from evidence_helpers import check, key, select_wallet, settings, shot, wait

os.environ['EVIDENCE_SCENARIO']='watchonly'
h=WalletFlowHarness('evidence_watchonly',2300)
try:
    h.start_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    rpc_call(h.gui_rpc_port,'createwallet',{'wallet_name':'Offline_signer'})
    mining=rpc_call(h.gui_rpc_port,'getnewaddress',wallet='Offline_signer')
    rpc_call(h.gui_rpc_port,'generatetoaddress',[103,mining])
    descs=rpc_call(h.gui_rpc_port,'listdescriptors',wallet='Offline_signer')['descriptors']
    pub=[dict(desc=x['desc'],timestamp=int(time.time())+86400,active=x['active'],internal=x['internal'],range=x.get('range',[0,100])) for x in descs if x['active']]
    rpc_call(h.gui_rpc_port,'createwallet',dict(wallet_name='Watch_only',disable_private_keys=True,blank=True,descriptors=True))
    result=rpc_call(h.gui_rpc_port,'importdescriptors',[pub],wallet='Watch_only')
    assert all(x['success'] for x in result),result
    select_wallet(g,'Watch_only')
    # Fixture: forget the imported historical wallet records, preserving descriptors.
    txids={x['txid'] for x in rpc_call(h.gui_rpc_port,'listtransactions',['*',1000],wallet='Watch_only')}
    for txid in txids:
        rpc_call(h.gui_rpc_port,'removeprunedfunds',[txid],wallet='Watch_only')
    before=rpc_call(h.gui_rpc_port,'getbalance',wallet='Watch_only')
    check('rescan-fixture','F34.S01','Removing historical wallet records leaves the monitoring wallet empty before rescan.',before,0)
    settings(g,'rpc-console')
    g.wait_for_page('rpcConsoleSettingsPage')
    g.set_text('consoleInput','rescanblockchain 0')
    g.invoke('appWindow','requestActivate')
    key('Return')
    g.wait_for_property('rpcConsole','outputCount',2,timeout_ms=30000)
    g.wait_for_property('rpcConsole','executing',False,timeout_ms=30000)
    after=rpc_call(h.gui_rpc_port,'getbalance',wallet='Watch_only')
    check('console-rescan','F34.S01','A rescan initiated in the GUI recovers the historical wallet funds.',after,150)
    shot(g,'console-rescan-recovers-history')
    g.click('settingsDoneButton')
    g.click('activityTabButton')
    g.wait_for_page('activityPage')
    shot(g,'watch-only-recovered-activity')

    recipient=rpc_call(h.gui_rpc_port,'getnewaddress',['Payment recipient'],wallet='Offline_signer')
    g.click('sendTabButton')
    g.wait_for_page('sendPage')
    g.set_text('sendAddressInput',recipient)
    g.set_text('sendAmountInput','0.125')
    g.wait_for_property('sendReviewButton','enabled',True,timeout_ms=20000)
    g.click('sendReviewButton')
    g.wait_for_page('sendTransactionReviewPage')
    g.wait_for_property('sendTransactionReviewSaveButton','visible',True)
    output=Path(h.tmpdir)/'watch-only-payment.psbt'
    g.set_text('sendTransactionReviewSavePsbtPathField',str(output))
    g.click('sendTransactionReviewSaveButton')
    wait(output.exists)
    psbt=base64.b64encode(output.read_bytes()).decode()
    decoded=rpc_call(h.gui_rpc_port,'decodepsbt',[psbt])
    outputs=[(x['scriptPubKey'].get('address'),x['value']) for x in decoded['tx']['vout']] if 'tx' in decoded else [(x['script'].get('address'),x['amount']) for x in decoded['outputs']]
    check('watch-only-export','F09.S08 F13.S05','The GUI saves an unsigned PSBT with the requested recipient and amount.',[v for a,v in outputs if a==recipient],[.125])
    check('watch-only-no-keys','F09.S08','Preparing the payment does not introduce local spending keys.',rpc_call(h.gui_rpc_port,'getwalletinfo',wallet='Watch_only')['private_keys_enabled'],False)
    check('watch-only-unsigned','F09.S08 F13.S05','The export still requires external signatures.',rpc_call(h.gui_rpc_port,'finalizepsbt',[psbt])['complete'],False)
    # An independent signing wallet consumes exactly the bytes exported by QML.
    signed=rpc_call(h.gui_rpc_port,'walletprocesspsbt',[psbt],wallet='Offline_signer')
    check('external-handoff','F09.S08 F13.S05','The separate signing wallet can finish the exported transaction.',signed['complete'])
    shot(g,'watch-only-unsigned-payment-exported')
finally:
    h.stop()
