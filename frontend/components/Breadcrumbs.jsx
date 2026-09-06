// Breadcrumbs — visible trail for the server-rendered pages.
//
// Pairs with breadcrumbLd() in lib/seo.js: Google wants the BreadcrumbList
// structured data to describe a trail that actually appears on the page, and
// the visible version is what stops a deep org page from being a place a
// visitor can only arrive at, never navigate from.
//
// The last item is the current page, so it renders as plain text.

import Link from 'next/link'

export default function Breadcrumbs({ trail = [] }) {
  if (trail.length < 2) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {trail.map(({ name, path }, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={path} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span aria-hidden className="text-subtle">/</span>}
              {isLast ? (
                <span className="truncate text-inkSoft" aria-current="page">{name}</span>
              ) : (
                <Link href={path} className="hover:text-brand transition-colors">
                  {name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
