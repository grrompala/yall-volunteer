// SiteFooter — shared footer for both the app shell and the plain server-
// rendered pages (org pages, /about, the organization index).
//
// Extracted from HomeClient so the new static routes carry the same footer
// links rather than a second copy that drifts. Inside the app shell the
// wordmark resets the view in place, so it takes an `onHome` handler; on a
// static page there's nothing to reset and it's just a link to /.
//
// `showBrowse` is off on the landing page: it lists every cause and city link
// itself, so a footer link to the page that lists them goes nowhere new.

import Link from 'next/link'
import { CONTACT_EMAIL } from './SourcesBlurb'

export default function SiteFooter({ onHome = null, lastUpdated = null, showBrowse = true }) {
  const wordmark = (
    <span className="font-display font-extrabold text-ink text-lg">
      Good Deeds <span className="text-brand">Dallas</span>
    </span>
  )

  return (
    <footer className="border-t border-line bg-white mt-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {onHome ? (
          <button
            onClick={onHome}
            className="flex flex-wrap items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {wordmark}
          </button>
        ) : (
          <Link href="/" className="flex flex-wrap items-center gap-3 hover:opacity-80 transition-opacity">
            {wordmark}
          </Link>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted">
          {showBrowse && (
            <Link href="/volunteer" className="hover:text-brand transition-colors">
              Browse
            </Link>
          )}
          <Link href="/about" className="hover:text-brand transition-colors">
            How it works
          </Link>
          <Link href="/privacy" className="hover:text-brand transition-colors">
            Privacy Policy
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand transition-colors">
            {CONTACT_EMAIL}
          </a>
          {lastUpdated && (
            <span>
              Last updated{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
