#!/usr/bin/env python3
"""Validate evidence records and links without rerunning application tests.

Uses only the Python standard library. Source-link targets are checked against
the archived checkouts when available; portable copies explicitly report skips.
"""
import argparse
import ast
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import struct
import sys
from urllib.parse import unquote, urlsplit
import zlib


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
PINNED = {
    "gui": "f739c7876b81304bdc72e7eaa307702da269ac31",
    "gui-qml": "a91f4b4774f25de061fe1a7c132a91ddde117fca",
}
SOURCE_ROOTS = {
    "gui": WORKSPACE / ".validation/gui-feature-evidence-20261008/widgets-source",
    "gui-qml": WORKSPACE / ".validation/gui-feature-evidence-20261008/qml-source",
}


def heading_ids(markdown):
    """GitHub-style IDs sufficient for the headings used in this pack."""
    ids = set()
    seen = Counter()
    for match in re.finditer(r"^#{1,6}\s+(.+)$", markdown, re.M):
        text = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", match[1])
        text = re.sub(r"[^\w\- ]", "", text.lower()).replace(" ", "-")
        suffix = f"-{seen[text]}" if seen[text] else ""
        ids.add(text + suffix)
        seen[text] += 1
    return ids


def png_dimensions(data):
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    offset = 8
    image_data = []
    dimensions = None
    while offset < len(data):
        size = struct.unpack_from(">I", data, offset)[0]
        tag = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + size]
        recorded_crc = struct.unpack_from(">I", data, offset + 8 + size)[0]
        if zlib.crc32(tag + payload) & 0xffffffff != recorded_crc:
            raise ValueError(f"invalid {tag!r} CRC")
        if tag == b"IHDR":
            dimensions = struct.unpack(">II", payload[:8])
        if tag == b"IDAT":
            image_data.append(payload)
        offset += size + 12
        if tag == b"IEND":
            if offset != len(data):
                raise ValueError("unexpected bytes after IEND")
            break
    else:
        raise ValueError("missing IEND")
    if not dimensions or not all(dimensions):
        raise ValueError("missing/empty dimensions")
    if not zlib.decompress(b"".join(image_data)):
        raise ValueError("empty pixel data")
    return dimensions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-binaries", action="store_true",
                        help="also hash the local build executables (not bundled)")
    args = parser.parse_args()
    errors = []
    skipped = []
    counts = Counter()

    def require(condition, message):
        if not condition:
            errors.append(message)

    def read_json(relative):
        return json.loads((ROOT / relative).read_text())

    inventory = read_json("inventory.json")
    coverage = read_json("coverage.json")
    photos = read_json("selected-captures.json")
    summary = read_json("summary.json")
    functional = read_json("logs/qml-functional-results.json")
    outcomes = read_json("test-results.json")
    criterion_ids = [s["id"] for f in inventory for s in f["subfeatures"]]
    known_ids = set(criterion_ids)
    require(len(inventory) == 34, "expected 34 feature groups")
    require(len(criterion_ids) == len(known_ids) == 203, "expected 203 unique criteria")
    require(Counter(r["id"] for r in coverage) == Counter(criterion_ids),
            "coverage records do not match inventory criteria")
    require(summary["groups"] == len(inventory) and summary["criteria"] == len(coverage),
            "summary group/criterion counts differ")
    counts.update(groups=len(inventory), criteria=len(criterion_ids))

    pages = sorted((ROOT / "features").glob("*.md"))
    require(len(pages) == len(inventory), "unexpected number of feature pages")
    for feature in inventory:
        page = ROOT / "features" / (feature["slug"] + ".md")
        if not page.is_file():
            errors.append(f"missing feature page: {page.name}")
            continue
        text = page.read_text()
        expected = [s["id"] for s in feature["subfeatures"]]
        actual = re.findall(r"^### (F\d+\.S\d+) ·", text, re.M)
        require(actual == expected, f"criterion sections differ in {page.name}")
        require(text.count("- [ ] Acceptance decision recorded by reviewer.") == len(expected),
                f"acceptance checkboxes differ in {page.name}")
        for section in re.split(r"^### F\d+\.S\d+ ·", text, flags=re.M)[1:]:
            require("| Qt Widgets |" in section and "| GUI-QML |" in section,
                    f"missing application evidence row in {page.name}")

    by_path = {p["path"]: p for p in photos}
    require(len(by_path) == len(photos), "duplicate selected capture paths")
    require(summary["selected_captures"] == len(photos), "summary capture count differs")
    require(summary["captures_by_application"] == dict(Counter(p["application"] for p in photos)),
            "summary application capture counts differ")
    for photo in photos:
        path = ROOT / photo["path"]
        try:
            data = path.read_bytes()
            dims = png_dimensions(data)
            require(hashlib.sha256(data).hexdigest() == photo["sha256"],
                    f"capture hash mismatch: {photo['path']}")
            require(dims == (photo["width"], photo["height"]),
                    f"capture dimensions mismatch: {photo['path']}")
            stamp = datetime.fromisoformat(photo["utc"])
            require(stamp.tzinfo is not None, f"capture lacks timezone: {photo['path']}")
            require(bool(photo["features"]) and set(photo["features"]) <= known_ids,
                    f"unknown/missing capture criteria: {photo['path']}")
            counts["verified_pngs"] += 1
        except (OSError, ValueError, KeyError, struct.error, zlib.error) as exc:
            errors.append(f"capture {photo['path']}: {exc}")
    for row in coverage:
        expected = [p["path"] for p in photos if row["id"] in p["features"]]
        require(row["captures"] == expected, f"capture coverage differs for {row['id']}")

    checks = {}
    for filename in ("widgets-checks.json", "qml-additional-checks.json", "qml-native-shell-checks.json"):
        records = read_json("logs/" + filename)
        require(len({r["id"] for r in records}) == len(records), f"duplicate assertion IDs: {filename}")
        for row in records:
            require(set(row["features"]) <= known_ids, f"unknown criteria in {row['id']}")
            require(row["status"] in ("passed", "failed"), f"invalid outcome in {row['id']}")
        checks[filename] = records
        counts["live_assertions"] += len(records)
    widgets_checks = {r["id"]: r for r in checks["widgets-checks.json"]}
    for row in coverage:
        require(all(key in widgets_checks and row["id"] in widgets_checks[key]["features"]
                    for key in row["widgets_assertions"]), f"invalid assertion reference: {row['id']}")

    require(len(functional) == len({r["test"] for r in functional}) == 34,
            "expected 34 unique functional scripts")
    require(summary["qml_functional"] == dict(Counter(r["status"] for r in functional)),
            "functional summary differs")
    for row in functional:
        require(row["source_revision"] == PINNED["gui-qml"], f"unexpected source pin for {row['test']}")
        require((ROOT / row["log"]).is_file(), f"missing functional log: {row['test']}")
        require((row["status"] == "passed") == (row["exit_code"] == 0 and not row["timed_out"]),
                f"status/exit mismatch for {row['test']}")
    counts["functional_results"] = len(functional)
    for suite, expected in summary["qtest"].items():
        text = (ROOT / "logs" / (suite + ".log")).read_text()
        totals = [tuple(map(int, match)) for match in re.findall(
            r"Totals: (\d+) passed, (\d+) failed, (\d+) skipped", text)]
        require(bool(totals), f"no QTest totals in {suite}")
        aggregate = dict(zip(("passed", "failed", "skipped"), map(sum, zip(*totals))))
        require(all(expected[key] == value for key, value in aggregate.items()),
                f"QTest total mismatch for {suite}")
        records = Counter(r["result"] for r in outcomes if r["suite"] == suite)
        require(records.get("PASS", 0) == expected["passed"] and records.get("FAIL", 0) == expected["failed"],
                f"QTest individual outcome mismatch for {suite}")
        require(int((ROOT / "logs" / (suite + ".exit")).read_text()) == expected["exit_code"],
                f"QTest exit mismatch for {suite}")
    counts["qtest_outcomes"] = len(outcomes)

    for script in sorted((ROOT / "scripts").glob("*.py")):
        try:
            ast.parse(script.read_text(), filename=str(script))
            counts["python_scripts"] += 1
        except SyntaxError as exc:
            errors.append(str(exc))

    documents = sorted(ROOT.glob("*.md")) + pages
    comparison = WORKSPACE / "bitcoin-core-gui-supported-features.md"
    if comparison.exists():
        documents.append(comparison)
    source_links = set()
    for document in documents:
        text = document.read_text()
        expected_columns = None
        fenced = False
        for line_number, line in enumerate(text.splitlines(), 1):
            if line.startswith("```"):
                fenced = not fenced
            if fenced:
                continue
            if line.startswith("|"):
                columns = len(re.split(r"(?<!\\)\|", line)) - 2
                if expected_columns is None:
                    expected_columns = columns
                    counts["markdown_tables"] += 1
                require(columns == expected_columns,
                        f"table column mismatch in {document.name}:{line_number}")
            else:
                expected_columns = None
        for raw in re.findall(r"\]\(([^)]+)\)", text):
            link = urlsplit(raw.strip("<>"))
            if link.scheme:
                if link.netloc == "github.com":
                    match = re.fullmatch(r"/bitcoin-core/(gui|gui-qml)/blob/([^/]+)/(.+)", link.path)
                    if match:
                        source_links.add((*match.groups(), link.fragment))
                continue
            target = (document.parent / unquote(link.path)).resolve() if link.path else document
            require(target.exists(), f"missing link from {document.name}: {raw}")
            if target.is_file() and link.fragment and target.suffix == ".md":
                require(unquote(link.fragment) in heading_ids(target.read_text()),
                        f"missing anchor from {document.name}: {raw}")
            counts["local_links"] += 1
    for repo, revision, relative, fragment in sorted(source_links):
        require(revision == PINNED[repo], f"unexpected source pin: {repo}/{relative}")
        root = SOURCE_ROOTS[repo]
        if not root.is_dir():
            item = f"source checkout unavailable: {root}"
            if item not in skipped:
                skipped.append(item)
            continue
        target = root / relative
        require(target.is_file(), f"missing source target: {repo}/{relative}")
        if target.is_file() and fragment:
            match = re.fullmatch(r"L(\d+)(?:-L(\d+))?", fragment)
            if match:
                require(max(int(n) for n in match.groups() if n) <= len(target.read_text().splitlines()),
                        f"source line beyond file: {repo}/{relative}#{fragment}")
        counts["source_links"] += 1

    if args.check_binaries:
        for name, record in read_json("binaries.json").items():
            path = Path(record["path"])
            try:
                with path.open("rb") as handle:
                    digest = hashlib.file_digest(handle, "sha256").hexdigest()
                require(digest == record["sha256"], f"binary hash mismatch: {name}")
                counts["binary_hashes"] += 1
            except OSError as exc:
                errors.append(f"binary {name}: {exc}")
    else:
        skipped.append("local binary hashes: pass --check-binaries to verify")
    report = {
        "checked_utc": datetime.now(timezone.utc).isoformat(),
        "status": "failed" if errors else "passed",
        "checks": dict(counts),
        "errors": errors,
        "skipped": skipped,
        "scope": "Evidence structure/integrity only; does not rerun or replace application tests.",
    }
    (ROOT / "logs/evidence-validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
