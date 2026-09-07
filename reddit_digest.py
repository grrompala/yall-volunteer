"""
Diff a fresh Reddit scrape against the previous committed snapshot and build a
notification digest of the posts that are NEW this run. Also inspects the
scraper's own log to tell a genuinely-quiet day apart from a scrape that got
rate-limited/blocked (Reddit throttles datacenter IPs hard — see fetch_reddit.py).

Used by .github/workflows/reddit-notify.yml, but runnable locally:

    python reddit_digest.py \
        --baseline /tmp/reddit_baseline.json \
        --current  frontend/public/data/reddit_raw.json \
        --log      /tmp/scrape.log \
        --body-out reddit-body.md \
        --html-out reddit-body.html

Outputs (for the workflow):
  - appends has_new / new_count / scrape_ok / subject to $GITHUB_OUTPUT (if set)
  - writes a markdown body to --body-out and an HTML email body to --html-out
  - prints a human summary
"""

import argparse
import html
import json
import os
import re
from datetime import date
from pathlib import Path


def load(path: Path) -> list[dict]:
    if not path or not path.exists():
        return []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def scrape_health(log_path: Path) -> tuple[bool, int, int]:
    """Parse fetch_reddit.py's stdout. Returns (ok, total_raw_results, gave_up).

    A run where every query returned zero raw results (or every subreddit was
    given up on after retries) is almost certainly a block, not a quiet day."""
    if not log_path or not log_path.exists():
        return True, -1, 0  # no log to judge — don't cry wolf
    text = log_path.read_text(encoding="utf-8", errors="replace")
    raw = sum(int(n) for n in re.findall(r"->\s*(\d+)\s+raw results", text))
    gave_up = len(re.findall(r"Giving up on", text))
    # ok unless we truly got nothing back across the whole run
    ok = raw > 0
    return ok, raw, gave_up


def html_body(posts: list[dict], ok: bool, raw: int, gave_up: int, today: str) -> str:
    """A plain, self-contained HTML email body.

    Inline styles only and no external assets: mail clients strip <style>
    blocks and block remote images, and this only ever has to render in one
    inbox. The post title is the link -- the whole point is to reach the thread
    fast enough to be an early comment, which is what actually gets seen.
    """
    esc = html.escape
    parts = [
        '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'
        'font-size:15px;line-height:1.5;color:#0B1220;max-width:640px">',
        f'<h2 style="font-size:18px;margin:0 0 4px">{len(posts)} new volunteer-related '
        f'Reddit post{"" if len(posts) == 1 else "s"}</h2>',
        f'<div style="color:#64748B;font-size:13px;margin-bottom:16px">{esc(today)}</div>',
    ]

    if not ok:
        parts.append(
            '<p style="background:#FEF2F2;border-left:3px solid #DC2626;padding:10px 12px;'
            'margin:0 0 16px;font-size:14px">The scrape returned <strong>0 raw results</strong> '
            f'this run ({gave_up} subreddit(s) gave up after retries). Reddit may be blocking '
            'the Actions runner, so this list could be incomplete.</p>'
        )

    if posts:
        parts.append('<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">')
        for r in posts:
            score = r.get("relevance", {}).get("total", 0)
            sub = esc(f"r/{r.get('subreddit', '?')}")
            title = esc((r.get("title") or "(untitled)").strip())
            url = esc(r.get("source_url") or "")
            parts.append(
                '<tr><td style="padding:10px 0;border-top:1px solid #E2E8F0">'
                f'<a href="{url}" style="color:#4F46E5;font-weight:600;text-decoration:none">{title}</a>'
                f'<div style="color:#64748B;font-size:13px;margin-top:2px">{sub} &middot; '
                f'relevance {score}</div></td></tr>'
            )
        parts.append('</table>')
    else:
        parts.append('<p style="color:#64748B">No new posts since the last run.</p>')

    parts.append(
        '<p style="color:#94A3B8;font-size:12px;margin-top:24px;border-top:1px solid #E2E8F0;'
        'padding-top:12px">Sent by reddit-notify.yml from fetch_reddit.py (search.rss, no LLM). '
        f'Raw results this run: {raw if raw >= 0 else "n/a"}.</p></div>'
    )
    return "\n".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", required=True, help="pre-scrape snapshot of reddit_raw.json")
    ap.add_argument("--current", required=True, help="reddit_raw.json after the scrape")
    ap.add_argument("--log", default="", help="captured fetch_reddit.py stdout (health check)")
    ap.add_argument("--body-out", default="reddit-body.md")
    ap.add_argument("--html-out", default="", help="also write an HTML email body here")
    args = ap.parse_args()

    baseline = load(Path(args.baseline))
    current = load(Path(args.current))
    base_ids = {r.get("id") for r in baseline}

    # New = present now, absent from the previous snapshot. Robust to the
    # scraper's re-sorting and its 90-day expiry pruning (both only reorder /
    # remove, never spuriously add).
    new_posts = [r for r in current if r.get("id") not in base_ids]
    new_posts.sort(
        key=lambda r: (r.get("relevance", {}).get("total", 0), r.get("created_utc") or ""),
        reverse=True,
    )

    ok, raw, gave_up = scrape_health(Path(args.log) if args.log else None)

    # Build the notification body.
    today = date.today().isoformat()
    lines = [f"## 🙋 {len(new_posts)} new volunteer-related Reddit post(s) — {today}", ""]
    if not ok:
        lines += [
            "> ⚠️ **Heads up:** the scrape returned **0 raw results** this run "
            f"({gave_up} subreddit(s) rate-limited to giving up). Reddit may be "
            "blocking the Actions runner IP, so this list could be incomplete.",
            "",
        ]
    if new_posts:
        lines += ["| Score | Subreddit | Post |", "|:-:|:--|:--|"]
        for r in new_posts:
            score = r.get("relevance", {}).get("total", 0)
            sub = f"r/{r.get('subreddit', '?')}"
            title = (r.get("title") or "(untitled)").replace("|", "\\|").strip()
            url = r.get("source_url") or ""
            lines.append(f"| {score} | {sub} | [{title}]({url}) |")
    else:
        lines.append("_No new posts since the last run._")
    lines += [
        "",
        "---",
        "_Auto-generated by `reddit-notify.yml` from `fetch_reddit.py` "
        f"(search.rss, no LLM). Raw results this run: {raw if raw >= 0 else 'n/a'}._",
    ]
    Path(args.body_out).write_text("\n".join(lines) + "\n", encoding="utf-8")

    if args.html_out:
        Path(args.html_out).write_text(
            html_body(new_posts, ok, raw, gave_up, today), encoding="utf-8"
        )

    # Surface outputs for the workflow.
    subject = (
        f"{len(new_posts)} new volunteer post(s) on Reddit - {today}"
        if ok else
        f"Reddit scrape returned nothing - {today}"
    )
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"has_new={'true' if new_posts else 'false'}\n")
            f.write(f"new_count={len(new_posts)}\n")
            f.write(f"scrape_ok={'true' if ok else 'false'}\n")
            f.write(f"subject={subject}\n")

    print(f"New posts: {len(new_posts)} | scrape_ok={ok} (raw={raw}, gave_up={gave_up})")
    for r in new_posts[:10]:
        print(f"  [{r.get('relevance', {}).get('total', 0)}] r/{r.get('subreddit')} - "
              f"{(r.get('title') or '')[:70]}")


if __name__ == "__main__":
    main()
