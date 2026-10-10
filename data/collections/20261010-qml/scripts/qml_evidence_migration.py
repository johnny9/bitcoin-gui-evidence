#!/usr/bin/env python3
"""Migrate a funded legacy wallet and verify its backup and watch-only history."""
import json
import os
from pathlib import Path
from qml_wallet_test_lib import WalletFlowHarness, rpc_call, find_legacy_bitcoind
from qml_test_wallet_migration import select_wallet_for_migration
from evidence_helpers import check, select_wallet, settings, shot, wait

os.environ['EVIDENCE_SCENARIO']='migration'
h=WalletFlowHarness('evidence_migration',2400)
try:
    h.start_source_node(binary=find_legacy_bitcoind(),extra_args=['-deprecatedrpc=create_bdb','-listen=1'])
    rpc_call(h.source_rpc_port,'createwallet',dict(wallet_name='Legacy_savings',descriptors=False))
    rpc_call(h.source_rpc_port,'createwallet',dict(wallet_name='Other_keys'))
    address=rpc_call(h.source_rpc_port,'getnewaddress',['Preserved label'],wallet='Legacy_savings')
    watch=rpc_call(h.source_rpc_port,'getnewaddress',['Watch funds'],wallet='Other_keys')
    rpc_call(h.source_rpc_port,'importaddress',[watch,'Preserved watch address',False],wallet='Legacy_savings')
    rpc_call(h.source_rpc_port,'generatetoaddress',[103,address])
    txid=rpc_call(h.source_rpc_port,'sendtoaddress',[watch,.75],wallet='Legacy_savings')
    rpc_call(h.source_rpc_port,'generatetoaddress',[1,address])
    before=rpc_call(h.source_rpc_port,'getbalances',wallet='Legacy_savings')
    target=Path(h.gui_wallets_path)/'Legacy_savings'
    target.mkdir(parents=True)
    rpc_call(h.source_rpc_port,'backupwallet',[str(target/'wallet.dat')],wallet='Legacy_savings')
    h.start_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    rpc_call(h.gui_rpc_port,'addnode',[f'127.0.0.1:{h.source_p2p_port}','onetry'])
    wait(lambda: rpc_call(h.gui_rpc_port,'getblockcount')==104,timeout=40)
    select_wallet_for_migration(g,'Legacy_savings')
    g.click('walletMigrationConfirmButton')
    g.wait_for_property('walletBadge','text','Legacy_savings',timeout_ms=30000)
    g.wait_for_property('walletMigrationPopup','visible',False)
    backups=list(Path(h.gui_datadir).rglob('*.legacy.bak'))
    check('migration-backup','F04.S02','GUI migration automatically preserves a nonempty original wallet backup.',len(backups)==1 and backups[0].stat().st_size>0)
    check('migration-label','F04.S03','The receiving address and its label survive migration.',rpc_call(h.gui_rpc_port,'getaddressinfo',[address],wallet='Legacy_savings')['labels'],['Preserved label'])
    balance=rpc_call(h.gui_rpc_port,'getbalances',wallet='Legacy_savings')
    check('migration-funds','F04.S03','The migrated spending wallet retains its confirmed balance.',balance['mine']['trusted'],before['mine']['trusted'])
    info=rpc_call(h.gui_rpc_port,'getwalletinfo',wallet='Legacy_savings')
    check('migration-history','F04.S03','The migrated wallet retains the payment transaction.',rpc_call(h.gui_rpc_port,'gettransaction',[txid],wallet='Legacy_savings')['txid'],txid)
    g.click('activityTabButton')
    shot(g,'migrated-wallet-preserved-funds')
    check('migration-auto-open','F04.S04','The migrated wallet is immediately available.',g.get_text('walletBadge'),'Legacy_savings')
    watch_wallet=next(x for x in rpc_call(h.gui_rpc_port,'listwallets') if 'watchonly' in x)
    watch_info=rpc_call(h.gui_rpc_port,'getaddressinfo',[watch],wallet=watch_wallet)
    check('migration-watch-label','F04.S03','Watch-only address metadata survives in the migrated watch-only wallet.',watch_info['labels'],['Preserved watch address'])
    check('migration-watch-funds','F04.S03','The migrated watch-only wallet retains its received funds.',rpc_call(h.gui_rpc_port,'getbalance',wallet=watch_wallet),.75)
    select_wallet(g,watch_wallet)
    g.click('activityTabButton')
    shot(g,'migrated-watch-only-funds')
finally:
    h.stop()
