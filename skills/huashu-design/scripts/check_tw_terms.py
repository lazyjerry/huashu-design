#!/usr/bin/env python3
"""
check_tw_terms.py — 批次檢查文件中的中國用語，提示對應台灣用語

用法：
    python3 scripts/check_tw_terms.py
    python3 scripts/check_tw_terms.py references
    python3 scripts/check_tw_terms.py references docs --glob "**/*.md"

預設：
    - 掃描 skill 根目錄下的 references/
    - 遞迴搜尋 Markdown 檔案
    - 找到詞彙時回傳 exit code 1，方便放進 CI 或 pre-commit
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Rule:
    pattern: re.Pattern[str]
    replacement: str
    label: str
    allow_patterns: tuple[re.Pattern[str], ...] = field(default_factory=tuple)


RULES = (
    Rule(re.compile(r"導出"), "匯出", "導出 → 匯出"),
    Rule(re.compile(r"數據"), "資料", "數據 → 資料"),
    Rule(re.compile(r"用戶"), "使用者", "用戶 → 使用者"),
    Rule(re.compile(r"配置"), "設定", "配置 → 設定"),
    Rule(re.compile(r"調用"), "呼叫", "調用 → 呼叫"),
    Rule(re.compile(r"實時"), "即時", "實時 → 即時"),
    Rule(re.compile(r"音頻"), "音訊", "音頻 → 音訊"),
    Rule(
        re.compile(r"公眾號"),
        "微信公眾號",
        "公眾號 → 微信公眾號",
        allow_patterns=(
            re.compile(r"微信公眾號"),
            re.compile(r"公眾號寫作"),
        ),
    ),
)

INLINE_CODE_RE = re.compile(r"`[^`]*`")
FENCED_CODE_DELIM_RE = re.compile(r"^```")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="批次檢查 Markdown 裡的中國用語，提示對應台灣用語"
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["references"],
        help="要掃描的相對路徑，預設為 references",
    )
    parser.add_argument(
        "--root",
        default=None,
        help="掃描根目錄，預設為此腳本上一層的 skill 根目錄",
    )
    parser.add_argument(
        "--glob",
        default="**/*.md",
        help="檔案 glob，預設為 **/*.md",
    )
    parser.add_argument(
        "--include-code",
        action="store_true",
        help="連 fenced code block 與 inline code 也一起掃描",
    )
    return parser.parse_args()


def resolve_root(root_arg: str | None) -> Path:
    if root_arg:
        return Path(root_arg).resolve()
    return Path(__file__).resolve().parent.parent


def iter_files(root: Path, input_paths: list[str], glob_pattern: str) -> list[Path]:
    files: list[Path] = []
    for raw_path in input_paths:
        candidate = (root / raw_path).resolve()
        if not candidate.exists():
            print(f"WARN：略過不存在的路徑：{candidate}", file=sys.stderr)
            continue
        if candidate.is_file():
            files.append(candidate)
            continue
        files.extend(path for path in sorted(candidate.glob(glob_pattern)) if path.is_file())
    return files


def should_skip_match(rule: Rule, line: str) -> bool:
    return any(pattern.search(line) for pattern in rule.allow_patterns)


def scan_file(path: Path, root: Path, include_code: bool) -> list[tuple[str, int, str, str]]:
    findings: list[tuple[str, int, str, str]] = []
    in_fenced_code = False
    rel_path = path.relative_to(root).as_posix()

    for line_number, original_line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if FENCED_CODE_DELIM_RE.match(original_line):
            in_fenced_code = not in_fenced_code
            if not include_code:
                continue

        if in_fenced_code and not include_code:
            continue

        scan_line = original_line if include_code else INLINE_CODE_RE.sub("", original_line)

        for rule in RULES:
            if not rule.pattern.search(scan_line):
                continue
            if should_skip_match(rule, scan_line):
                continue
            findings.append((rel_path, line_number, rule.label, original_line.strip()))

    return findings


def main() -> int:
    args = parse_args()
    root = resolve_root(args.root)
    files = iter_files(root, args.paths, args.glob)

    if not files:
        print("沒有找到可掃描的檔案。", file=sys.stderr)
        return 2

    all_findings: list[tuple[str, int, str, str]] = []
    for path in files:
        all_findings.extend(scan_file(path, root, args.include_code))

    if not all_findings:
        print(f"✅ 未發現命中的詞彙。已掃描 {len(files)} 個檔案。")
        return 0

    current_file = None
    for rel_path, line_number, label, content in all_findings:
        if rel_path != current_file:
            current_file = rel_path
            print(f"\n[{rel_path}]")
        print(f"  L{line_number}: {label}")
        print(f"    {content}")

    print(f"\n共找到 {len(all_findings)} 筆命中，分布於 {len({item[0] for item in all_findings})} 個檔案。")
    return 1


if __name__ == "__main__":
    sys.exit(main())