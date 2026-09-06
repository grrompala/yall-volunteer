// HomeBrowseSection — the crawlable body of the home page.
//
// The home page used to ship a 19 KB shell: a header, eight category chips, a
// footer, and 1,700 listings that only existed after a client fetch. It's the
// page that ranks for "volunteer Dallas" and the page everything links to, and
// a crawler saw almost nothing on it. This is the fix — real HTML, real links,
// rendered on the server.
//
// It's also where the site finally gets internal linking. Cause, city and
// organization pages were reachable only through eight chips and the /volunteer
// index; now every one of them is one hop from the root.
//
// Server component (no hooks, no 'use client') — passed as children into the
// client app shell, so none of this ships as JavaScript.

import Link from 'next/link'
import { tagMeta } from './tagMeta'
import { cleanOrgName } from './cleanText'

function SectionHeading({ children, href, hrefLabel }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display font-bold text-xl text-ink">{children}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-brand hover:text-brandDark">
          {hrefLabel} →
        </Link>
      )}
    </div>
  )
}

export default function HomeBrowseSection({ tags = [], cities = [], orgs = [], recent = [], totalOrgs = 0 }) {
  return (
    <div className="space-y-14">
      {/* ── Causes ────────────────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <section aria-labelledby="browse-causes">
          <div id="browse-causes">
            <SectionHeading href="/volunteer" hrefLabel="All browse pages">
              Volunteer by cause
            </SectionHeading>
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tags.map(({ tag, slug, count }) => {
              const meta = tagMeta(tag)
              return (
                <li key={tag}>
                  <Link
                    href={`/volunteer/${slug}`}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3 hover:border-brand transition-colors"
                  >
                    <span aria-hidden>{meta.icon}</span>
                    <span className="font-semibold text-ink">{meta.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted">{count}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ── Cities ────────────────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <section aria-labelledby="browse-cities">
          <div id="browse-cities">
            <SectionHeading>Volunteer by city</SectionHeading>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {cities.map(({ city, slug, count }) => (
              <li key={slug}>
                <Link
                  href={`/volunteer/in/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-inkSoft hover:border-brand hover:text-brand transition-colors"
                >
                  {city}
                  <span className="font-mono text-xs text-muted">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Organizations ─────────────────────────────────────────────────── */}
      {orgs.length > 0 && (
        <section aria-labelledby="browse-orgs">
          <div id="browse-orgs">
            <SectionHeading href="/volunteer/organizations" hrefLabel={`All ${totalOrgs}`}>
              Organizations recruiting now
            </SectionHeading>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {orgs.map(({ slug, name, count }) => (
              <li key={slug}>
                <Link
                  href={`/volunteer/org/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-inkSoft hover:border-brand hover:text-brand transition-colors"
                >
                  {name}
                  <span className="font-mono text-xs text-muted">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Recently added ────────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <section aria-labelledby="browse-recent">
          <div id="browse-recent">
            <SectionHeading>Recently added opportunities</SectionHeading>
          </div>
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-line md:[&>li:nth-child(2)]:border-t-0">
            {recent.map(o => {
              const org = cleanOrgName(o.org_name)
              return (
                <li key={o.id} className="py-3 first:border-t-0 border-t border-line">
                  <a
                    href={o.source_url}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-ink hover:text-brand transition-colors"
                  >
                    {o.opportunity_title}
                  </a>
                  <div className="mt-0.5 text-sm text-muted">
                    {o.orgSlug ? (
                      <Link href={`/volunteer/org/${o.orgSlug}`} className="hover:text-brand">
                        {org}
                      </Link>
                    ) : (
                      org
                    )}
                    {o.city ? <span> · {o.city}</span> : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
