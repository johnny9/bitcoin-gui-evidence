# Capture harness development

The latest results in `logs/runs.json` refer to the final scripts in this collection. Intermediate collector failures are not application failures unless reproduced by the focused regression below.

- Initially copying upstream tests away from their repository broke relative imports and fixture paths. The runner now executes unchanged upstream tests from the pinned source checkout. The password and restore tests both pass. Available initial logs remain in `logs/initial-fixture-attempts/`.
- The RPC helper does not URL-encode wallet names, so the new fixtures use names without spaces. This is a test-helper constraint.
- The address input displays grouped text. The entry assertion compares the normalized address, and does not reject the intended display formatting. A clipboard action is only offered for a Bitcoin payment URI; bare-address entry is verified separately. The existing URI-import test verifies the supported clipboard flow.
- Importing descriptors can discover historical transactions immediately. The rescan fixture explicitly removes wallet transaction records using `removeprunedfunds`, verifies an empty balance, then recovers the history with `rescanblockchain 0` from the GUI console.
- Migration backups reside under the data directory rather than necessarily inside the migrated wallet directory. The check locates the automatically created `.legacy.bak` file there.
- The wallet console adds an execution-context row. The desktop check allows that row and captures the actual RPC response. The Qt bridge serializes window visibility as enum names, not numeric values.
- Settings checks now follow the pinned implementation's documented precedence: command line, stored GUI override, configuration file, then default. They verify each applicable level after restart.
- Native paced keyboard input confirmed that the cache-entry problem was not a capture timing issue. A small cache allocation and script-thread setting persist successfully. The separate `qml_evidence_cache_limit.py` regression proves Core accepts 768 MiB and records that the GUI leaves `7` when entering `768`. This is the one unresolved application failure, with its own screenshots, trace, stderr, and expected/actual assertion.

Some available early development traces are retained under `logs/development-attempts/`; they are historical diagnostics, not the final proof. The final script list is a targeted rerun, not a fresh run of every repository test. Application source and binaries were not changed.
