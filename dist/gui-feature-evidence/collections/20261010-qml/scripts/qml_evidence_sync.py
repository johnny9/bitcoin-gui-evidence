#!/usr/bin/env python3
"""Observe real peer synchronization through a rate-limited loopback connection."""
import os
import socket
import threading
import time
from qml_wallet_test_lib import WalletFlowHarness, rpc_call
from evidence_helpers import check, shot, wait

os.environ['EVIDENCE_SCENARIO']='sync'
h=WalletFlowHarness('evidence_sync',2500)
stop=threading.Event()
sockets=[]


def relay(source, destination, slow=False):
    try:
        while not stop.is_set():
            data=source.recv(2048)
            if not data:
                break
            if slow:
                time.sleep(.04)
            destination.sendall(data)
    except OSError:
        pass


def accept(proxy):
    try:
        client,_=proxy.accept()
        upstream=socket.create_connection(('127.0.0.1',h.source_p2p_port))
        sockets.extend([client,upstream])
        threading.Thread(target=relay,args=(client,upstream),daemon=True).start()
        relay(upstream,client,True)
    except OSError:
        pass


try:
    h.start_source_node(extra_args=['-listen=1'])
    rpc_call(h.source_rpc_port,'createwallet',dict(wallet_name='sync_fixture'))
    address=rpc_call(h.source_rpc_port,'getnewaddress',wallet='sync_fixture')
    rpc_call(h.source_rpc_port,'generatetoaddress',[2200,address])
    h.start_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    rpc_call(h.gui_rpc_port,'createwallet',dict(wallet_name='Sync_observer'))
    g.wait_for_property('walletBadge','text','Sync_observer',timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    proxy=socket.socket()
    proxy.bind(('127.0.0.1',0))
    proxy.listen(1)
    sockets.append(proxy)
    threading.Thread(target=accept,args=(proxy,),daemon=True).start()
    rpc_call(h.gui_rpc_port,'addnode',[f'127.0.0.1:{proxy.getsockname()[1]}','onetry'])
    g.click('blockClockTabButton')
    g.wait_for_property('blockClock','state','IBD',timeout_ms=40000)
    info=rpc_call(h.gui_rpc_port,'getblockchaininfo')
    check('real-sync-in-progress','F20.S05 F29.S02 F30.S06','The GUI shows synchronization while its real node remains behind its peer.',info['blocks']<2200 and g.get_property('blockClock','synced') is False)
    shot(g,'live-regtest-sync-progress')
    g.click('activityTabButton')
    g.wait_for_page('activityPage')
    check('wallet-access-during-sync','F30.S07','The wallet remains navigable while the connected node is still syncing.',rpc_call(h.gui_rpc_port,'getblockcount')<2200 and g.get_property('activityPage','visible'))
    shot(g,'wallet-accessible-during-sync')
    wait(lambda:rpc_call(h.gui_rpc_port,'getblockcount')==2200,timeout=100)
    g.click('blockClockTabButton')
    g.wait_for_property('blockClock','synced',True,timeout_ms=30000)
    check('download-and-validate','F20.S04 F20.S05 F29.S02','The GUI node downloads and validates the same chain tip as its peer.',rpc_call(h.gui_rpc_port,'getbestblockhash'),rpc_call(h.source_rpc_port,'getbestblockhash'))
    shot(g,'real-peer-sync-complete')
finally:
    stop.set()
    for s in sockets:
        try:
            s.shutdown(socket.SHUT_RDWR)
        except OSError:
            pass
        s.close()
    h.stop()
