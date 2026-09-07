"""
Send one email through the Resend API.

Used by .github/workflows/reddit-notify.yml to deliver the daily Reddit digest.
Standard library only — no pip install in the workflow, and nothing to keep
patched.

A small script rather than an inline `curl` because the body is HTML full of
quotes and angle brackets: building that JSON in shell is where this kind of
thing quietly breaks. It also lets the common Resend rejections come back as
something you can act on instead of a bare HTTP status.

Environment:
    RESEND_API_KEY   required. Never logged.
    MAIL_TO          required. Comma-separated for more than one recipient.
    MAIL_FROM        optional. Defaults to Resend's shared onboarding sender,
                     which can only deliver to the address that owns the Resend
                     account. Set this once a domain is verified.

Usage:
    python send_email.py --subject "..." --html-file body.html --text-file body.md
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ENDPOINT = "https://api.resend.com/emails"

# Resend's shared sender. Works with no DNS setup, but only to the account
# owner's own address — which is exactly this use case.
DEFAULT_FROM = "Good Deeds Dallas <onboarding@resend.dev>"


def fail(message: str) -> None:
    """Report to both the run log and the Actions annotations, then exit."""
    print(f"::error::{message}")
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def explain(status: int, body: str) -> str:
    """Turn a Resend rejection into something actionable."""
    detail = body.strip()[:400]
    try:
        detail = json.loads(body).get("message", detail)
    except (json.JSONDecodeError, AttributeError):
        pass

    if status in (401, 403):
        return (
            f"Resend rejected the API key ({status}): {detail}. Check that the "
            "RESEND_API_KEY repository secret holds a current key from "
            "resend.com/api-keys and has send permission."
        )
    if status == 422 and "testing emails" in detail.lower():
        return (
            f"Resend refused the recipient: {detail}. The default "
            f"'{DEFAULT_FROM}' sender can only deliver to the address that owns "
            "the Resend account. Either set MAIL_TO to that address, or verify a "
            "domain at resend.com/domains and set MAIL_FROM to an address on it."
        )
    if status == 429:
        return f"Resend rate-limited this send ({status}): {detail}."
    return f"Resend returned HTTP {status}: {detail}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--subject", required=True)
    ap.add_argument("--html-file", required=True)
    ap.add_argument("--text-file", default="", help="plain-text alternative")
    args = ap.parse_args()

    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    to_raw = os.environ.get("MAIL_TO", "").strip()
    sender = os.environ.get("MAIL_FROM", "").strip() or DEFAULT_FROM

    if not api_key:
        fail("RESEND_API_KEY is not set. Add it under Settings -> Secrets and variables -> Actions.")
    if not to_raw:
        fail("MAIL_TO is not set. Add the destination address as a repository secret.")

    html_path = Path(args.html_file)
    if not html_path.exists():
        fail(f"HTML body not found at {html_path} — the digest step probably did not run.")

    payload = {
        "from": sender,
        "to": [addr.strip() for addr in to_raw.split(",") if addr.strip()],
        "subject": args.subject,
        "html": html_path.read_text(encoding="utf-8"),
    }
    text_path = Path(args.text_file) if args.text_file else None
    if text_path and text_path.exists():
        payload["text"] = text_path.read_text(encoding="utf-8")

    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        fail(explain(exc.code, exc.read().decode("utf-8", "replace")))
    except urllib.error.URLError as exc:
        fail(f"Could not reach the Resend API: {exc}")

    # The id is the handle for this send in the Resend dashboard, which is where
    # you check whether a message that never arrived was actually delivered.
    message_id = ""
    try:
        message_id = json.loads(body).get("id", "")
    except json.JSONDecodeError:
        pass
    recipients = ", ".join(payload["to"])
    print(f"Sent to {recipients}" + (f" (id {message_id})" if message_id else ""))


if __name__ == "__main__":
    main()
