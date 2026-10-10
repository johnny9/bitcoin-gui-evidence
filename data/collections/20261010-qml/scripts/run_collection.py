#!/usr/bin/env python3
"""Capture pinned functional scenarios, preserving per-run results and logs."""
import datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time

root = Path(os.environ['EVIDENCE_OUTPUT'])
results_path = root / 'logs/results.json'
results = json.loads(results_path.read_text()) if results_path.exists() else []
for name in sys.argv[1:]:
    script = (Path('/work/qml-source/test/functional') if name.startswith('qml_test_') else root / 'scripts') / (name + '.py')
    command = ['python3', str(root / 'scripts/qml_capture_test.py'), str(script)]
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t0 = time.monotonic()
    with (root / 'logs' / (name + '.log')).open('w') as log:
        result = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, timeout=480)
    record = dict(test=name, started_utc=started, seconds=round(time.monotonic()-t0,2),
                  exit_code=result.returncode, status='passed' if result.returncode == 0 else 'failed',
                  command=command, log='logs/' + name + '.log')
    results.append(record)
    results_path.write_text(json.dumps(results, indent=2)+'\n')
    print(name, record['status'], record['seconds'], flush=True)
