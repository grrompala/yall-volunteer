"""
Submit the site's URLs to IndexNow so Bing (and through it, parts of Copilot
and ChatGPT search) picks up changes in hours instead of waiting to re-crawl.

Google does not participate in IndexNow — Google Search Console's sitemap
submission covers that side. This is specifically about the Bing index, which
is the one that feeds several AI answer engines.

Reads the LIVE sitemap rather than generating a URL list locally: the sitemap is
built by Next at deploy time on Vercel, so the deployed sitemap is the only
authority on which pages actually exist right now.

The key is public by design (IndexNow verifies ownership by fetching
https://<host>/<key>.txt and checking it contains the key), so it lives in the
repo rather than in secrets.

Usage:
    python submit_indexnow.py
    python submit_indexnow.py --dry-run
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

HOST = "www.good-deeds-dallas.org"
SITEMAP = f"https://{HOST}/sitemap.xml"
KEY = "b272712f763fdd709446856970bda55d"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/IndexNow"

SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# IndexNow caps a single submission at 10,000 URLs; we're far under, but the
# batching keeps the request body small and the failure blast radius smaller.
BATCH = 1000


def fetch_sitemap_urls() -> list[str]:
    req = urllib.request.Request(SITEMAP, headers={"User-Agent": "good-deeds-dallas-indexnow"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        xml = resp.read()
    root = ET.fromstring(xml)
    return [el.text.strip() for el in root.findall(".//sm:url/sm:loc", SITEMAP_NS) if el.text]


def verify_key() -> bool:
    """IndexNow rejects the whole submission if the key file isn't reachable."""
    try:
        with urllib.request.urlopen(KEY_LOCATION, timeout=15) as resp:
            body = resp.read().decode("utf-8", "replace").strip()
    except urllib.error.URLError as exc:
        print(f"Key file unreachable at {KEY_LOCATION}: {exc}")
        return False
    if body != KEY:
        print(f"Key file contents don't match the key (got {body[:40]!r})")
        return False
    return True


def submit(urls: list[str], dry_run: bool) -> bool:
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    if dry_run:
        print(f"  [dry-run] would submit {len(urls)} URL(s)")
        return True

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"  submitted {len(urls)} URL(s) -> HTTP {resp.status}")
            return True
    except urllib.error.HTTPError as exc:
        # 422 usually means the key check failed; 429 means slow down. Neither
        # should fail the weekly pipeline, so report and carry on.
        print(f"  submission failed: HTTP {exc.code} {exc.reason}")
        print(f"  {exc.read().decode('utf-8', 'replace')[:300]}")
        return False
    except urllib.error.URLError as exc:
        print(f"  submission failed: {exc}")
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Fetch and report, submit nothing")
    args = ap.parse_args()

    if not args.dry_run and not verify_key():
        print("Aborting — IndexNow would reject this submission.")
        sys.exit(1)

    urls = fetch_sitemap_urls()
    print(f"{len(urls)} URL(s) in {SITEMAP}")
    if not urls:
        print("Nothing to submit.")
        return

    ok = True
    for i in range(0, len(urls), BATCH):
        ok = submit(urls[i:i + BATCH], args.dry_run) and ok

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
