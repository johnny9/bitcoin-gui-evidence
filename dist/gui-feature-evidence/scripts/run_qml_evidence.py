#!/usr/bin/env python3
"""Collect independent regtest GUI scenarios, continuing after recorded failures."""
import datetime
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time

source = Path('/work/qml-source')
tests = source / 'test/functional'
results_path = Path('/evidence/logs/qml-functional-results.json')
selected = sys.argv[1:] or [
    'onboarding', 'create_wallet_name', 'watchonly_wallet', 'password_wallet',
    'wallet_selector_load', 'wallet_settings', 'wallet_restore', 'wallet_migration',
    'receive', 'send_create', 'send_receive', 'psbt', 'wallet_rbf',
    'activity_filter_export', 'addresses', 'address_label_sync',
    'uri_import', 'external_signer', 'console', 'debug_log', 'peers', 'proxy',
    'settings_display', 'tray', 'window_geometry', 'node_runtime_dialogs',
    'disablewallet_boot', 'blockclock', 'shutdown', 'resetguisettings',
    'blocksonly_settings', 'preinit_onboarding', 'wallet_qt_compat', 'uri_argument_injection',
]
env = dict(os.environ)
env.update(BITCOIN_CORE_APP='/validation/build/bin/bitcoin-core-app',
           BITCOIND='/tools/bitcoind', QML_TEST_QPA_PLATFORM='xcb',
           QT_QPA_PLATFORM='xcb', QT_QUICK_BACKEND='software',
           PYTHONUNBUFFERED='1', TMPDIR='/work/tmp')
Path(env['TMPDIR']).mkdir(exist_ok=True)
results = json.loads(results_path.read_text()) if results_path.exists() else []
for suffix in selected:
    test = f'qml_test_{suffix}'
    path = tests / f'{test}.py'
    log_path = Path('/evidence/logs') / f'{test}.log'
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t0 = time.monotonic()
    command = ['python3', '/evidence/scripts/qml_capture_test.py', str(path)]
    timed_out = False
    with log_path.open('w') as log:
        process = subprocess.Popen(command, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            code = process.wait(timeout=480)
        except subprocess.TimeoutExpired:
            timed_out = True
            os.killpg(process.pid, signal.SIGTERM)
            try:
                code = process.wait(timeout=15)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                code = process.wait()
    text = log_path.read_text(errors='replace')
    captures = Path('/evidence/media/qml') / test / 'captures.json'
    count = len(json.loads(captures.read_text())) if captures.exists() else 0
    result = {'test': test, 'started_utc': started, 'seconds': round(time.monotonic() - t0, 2),
              'exit_code': code, 'timed_out': timed_out, 'captures': count,
              'status': 'passed' if code == 0 else 'failed',
              'skip_messages': [s for s in text.splitlines() if 'SKIPPED' in s or s.startswith('SKIP')],
              'log': str(log_path.relative_to('/evidence')), 'command': command,
              'source_revision': 'a91f4b4774f25de061fe1a7c132a91ddde117fca'}
    results = [r for r in results if r['test'] != test] + [result]
    results_path.write_text(json.dumps(results, indent=2) + '\n')
    print(test, result['status'], result['seconds'], 'seconds,', count, 'screenshots', flush=True)
