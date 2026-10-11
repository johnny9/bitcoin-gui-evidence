#!/usr/bin/env python3
"""Run an unchanged upstream GUI test, recording bridge traffic and real frames.

Only capture/logging is added. The GUI uses xcb on the evidence X server;
test assertions and application source are unchanged.
"""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import runpy
import subprocess
import sys
import time

test_path = Path(sys.argv[1]).resolve()
name = test_path.stem
out = Path(os.environ['EVIDENCE_OUTPUT']) / 'media/qml' / name
out.mkdir(parents=True, exist_ok=True)
trace_path = Path(os.environ['EVIDENCE_OUTPUT']) / 'logs' / f'{name}.bridge.jsonl'
manifest_path = out / 'captures.json'
sys.path.insert(0, str(test_path.parent))
sys.path.append(os.environ.get('BITCOIN_TEST_FRAMEWORK', '/work/qml-source/bitcoin/test/functional'))
os.environ['BITCOIND_LEGACY'] = os.environ.get('EVIDENCE_LEGACY_BITCOIND', '/work/releases/bitcoin-28.0/bin/bitcoind')
import qml_driver

original_send = qml_driver.QmlDriver._send
original_screenshot = qml_driver.QmlDriver.save_screenshot
original_popen = subprocess.Popen
captures = []
processes = []
capturing = False
last_auto = None
auto = '--save-screenshots' not in test_path.read_text()
if os.environ.get('CAPTURE_NAMED_ONLY') == '1' and name.startswith('qml_evidence_'):
    auto = False


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def record(value):
    with trace_path.open('a') as f:
        f.write(json.dumps({'utc': utc(), **value}, default=str) + '\n')


def capture(gui, label, supplied_path=None):
    global capturing
    if capturing:
        return original_screenshot(gui, supplied_path)
    capturing = True
    slug = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')[:100]
    path = out / f'{len(captures) + 1:03d}-{slug}.png'
    try:
        # StackView settling does not cover popup exit animations or the next
        # scenegraph frame. Allow those real frames to complete before grabbing.
        time.sleep(0.4)
        result = original_screenshot(gui, str(path))
        captures.append({'path': str(path.relative_to(os.environ['EVIDENCE_OUTPUT'])), 'caption': label,
                         'utc': utc(), 'width': result.get('width'), 'height': result.get('height'),
                         'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'test': name, 'kind': 'application-screenshot'})
        manifest_path.write_text(json.dumps(captures, indent=2) + '\n')
        return result
    finally:
        capturing = False


def save_screenshot(gui, path):
    return capture(gui, Path(path).stem, path)


def send(gui, command):
    global last_auto
    # Onboarding deliberately disables its footer during the entrance animation.
    # Wait for ordinary user activation; never force the control enabled.
    if command.get('cmd') == 'click' and command.get('objectName', '').startswith('onboarding'):
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            state = original_send(gui, {'cmd':'get_property', 'objectName':command['objectName'], 'prop':'enabled'})
            if state.get('value') is not False:
                break
            time.sleep(.1)
        record({'onboarding_activation_state': state, 'objectName': command['objectName']})
    result = original_send(gui, command)
    if not capturing:
        record({'request': command, 'response': result})
        action = command.get('cmd')
        label = f"{action}-{command.get('objectName', command.get('page', 'application'))}"
        if auto and action in ('click', 'key_click', 'wait_for_page') and 'error' not in result:
            if label != last_auto and len(captures) < 100:
                last_auto = label
                try:
                    capture(gui, label)
                except Exception as error:
                    record({'capture_error': str(error), 'after': command})
    return result


def popen(*args, **kwargs):
    command = args[0] if args else kwargs.get('args', [])
    app = isinstance(command, (list, tuple)) and command and Path(str(command[0])).name == 'bitcoin-core-app'
    if app:
        env = dict(kwargs.get('env', os.environ))
        env['QT_QPA_PLATFORM'] = 'xcb'
        env['DISPLAY'] = os.environ['DISPLAY']
        kwargs['env'] = env
    process = original_popen(*args, **kwargs)
    if app:
        processes.append(process)
        record({'application_start': command, 'pid': process.pid, 'platform': 'xcb'})
    return process


qml_driver.QmlDriver._send = send
qml_driver.QmlDriver.save_screenshot = save_screenshot
subprocess.Popen = popen
sys.argv = [str(test_path)] + (['--save-screenshots'] if '--save-screenshots' in test_path.read_text() else [])
try:
    runpy.run_path(str(test_path), run_name='__main__')
finally:
    for process in processes:
        record({'application_pid': process.pid, 'exit_code': process.poll()})
        if process.poll() is not None:
            for stream in ('stdout', 'stderr'):
                pipe = getattr(process, stream)
                if pipe and not pipe.closed:
                    (trace_path.parent / (name + '.app.' + stream)).open('ab').write(pipe.read())
    manifest_path.write_text(json.dumps(captures, indent=2) + '\n')
