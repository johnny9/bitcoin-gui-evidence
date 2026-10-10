#!/usr/bin/env python3
"""Regression: the GUI must accept an ordinary total database-cache allocation."""
import os
import subprocess
from qml_wallet_test_lib import WalletFlowHarness, rpc_call
from evidence_helpers import check, key, settings, shot

os.environ['EVIDENCE_SCENARIO']='cache-limit'
h=WalletFlowHarness('evidence_cache_limit',2700)
try:
    h.start_gui(extra_args=['-dbcache=768'])
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    g.set_property('appWindow','width',1180)
    g.set_property('appWindow','height',1000)
    settings(g,'developer')
    check('core-accepts-768','F23.S01','Core starts successfully with a 768 MiB total cache allocation.',g.get_text('developerDbcacheField'),'768')
    shot(g,'valid-core-cache-allocation')
    h.restart_gui()
    g=h.driver
    g.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    settings(g,'developer')
    g.type_text('developerDbcacheField','')
    key('ctrl+a')
    subprocess.run(['xdotool','type','--clearmodifiers','--delay','100','768'],check=True)
    actual=g.get_text('developerDbcacheField')
    shot(g,'gui-rejects-valid-cache-allocation')
    check('gui-accepts-768','F23.S01','The GUI must accept the same valid 768 MiB value as Core.',actual,'768')
finally:
    h.stop()
