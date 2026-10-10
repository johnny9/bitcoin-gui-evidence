"""Record assertions and unmodified application screenshots together."""
import json
import os
from pathlib import Path
import subprocess
import time

ROOT = Path(os.environ['EVIDENCE_OUTPUT'])
CHECKS = []


def check(name, features, description, actual, expected=True):
    item = dict(id=name, features=features.split(), description=description,
                actual=actual, expected=expected,
                status='passed' if actual == expected else 'failed')
    CHECKS.append(item)
    (ROOT / 'logs' / (os.environ.get('EVIDENCE_SCENARIO', 'outcomes') + '-checks.json')).write_text(json.dumps(CHECKS, indent=2)+'\n')
    assert actual == expected, item
    print(name + ': passed', flush=True)


def shot(gui, name):
    gui.save_screenshot('/tmp/' + name + '.png')


def wait(predicate, timeout=20):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(.15)
    raise AssertionError('Timed out waiting for outcome')


def key(combo):
    subprocess.run(['xdotool','key','--clearmodifiers',combo], check=True)
    time.sleep(.2)


def select_wallet(gui, name):
    from qml_wallet_test_lib import open_wallet_selector
    import re
    open_wallet_selector(gui)
    gui.click('walletSelectItem_' + re.sub(r'[^A-Za-z0-9_]', '_', name))
    gui.wait_for_property('walletBadge', 'text', name, timeout_ms=20000)
    gui.wait_for_property('walletSelectPopup', 'visible', False)


def settings(gui, section):
    gui.click('desktopWalletSettingsTabButton')
    gui.click('settingsSidebar_' + ('about' if section == 'developer' else section))
    gui.settle()
    if section == 'developer':
        gui.click('aboutDeveloperRow')
        gui.settle()
