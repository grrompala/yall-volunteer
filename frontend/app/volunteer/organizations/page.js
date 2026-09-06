// /volunteer/organizations — the crawlable index of every organization page.
//
// Without this the ~217 org pages would be reachable only from the sitemap and
// a handful of home-page links, which is how pages end up "Discovered –
// currently not indexed". Every org page is one plain <a> from here, and this
// page is one hop from the root and from /volunteer.

import Link from 'next/link'
import { orgCounts, loadListings } from '../../../lib/listings'
import {
  breadcrumbLd, formatDate, lastRefreshed, plural, pageMeta, SITE_URL, METRO,
} from '../../../lib/seo'
import { tagMeta } from '../../../components/tagMeta'
import Breadcrumbs from '../../../components/Breadcrumbs'
import PageIntro from '../../../components/PageIntro'
import SiteFooter from '../../../components/SiteFooter'

export function generateMetadata() {
  const orgs = orgCounts()
  const title = `Nonprofits recruiting volunteers in ${METRO}`
  const description =
    `${orgs.length} Dallas–Fort Worth organizations currently recruiting volunteers, with every open ` +
    `role they've posted. Updated weekly.`
  return pageMeta({ title, description, path: '/volunteer/organizations' })
}

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Organizations', path: '/volunteer/organizations' },
]

export default function OrganizationsIndex() {
  const orgs = orgCounts()
  const refreshed = formatDate(lastRefreshed(loadListings()))
  const totalRoles = orgs.reduce((n, o) => n + o.count, 0)

  // Alphabetical, grouped by first letter — a directory should be scannable by
  // name, not by size. (orgCounts() comes back biggest-first.)
  const alphabetical = [...orgs].sort((a, b) => a.name.localeCompare(b.name))
  const groups = new Map()
  for (const org of alphabetical) {
    const initial = /^[a-z]/i.test(org.name) ? org.name[0].toUpperCase() : '#'
    if (!groups.has(initial)) groups.set(initial, [])
    groups.get(initial).push(org)
  }
  const letters = [...groups.keys()]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Nonprofits recruiting volunteers in ${METRO}`,
      numberOfItems: orgs.length,
      itemListElement: orgs.map((org, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: org.name,
        url: `${SITE_URL}/volunteer/org/${org.slug}`,
      })),
    },
    breadcrumbLd(trail),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
        <Breadcrumbs trail={trail} />

        <PageIntro
          className="mt-5"
          heading={`Nonprofits recruiting volunteers in ${METRO}`}
          intro={
            `${orgs.length} organizations across the Dallas metro have ${totalRoles.toLocaleString()} ` +
            `volunteer ${plural(totalRoles, 'role', 'roles')} open between them. Each has a page ` +
            `collecting everything it's currently recruiting for, pulled together from whichever portals ` +
            `it posts to.` + (refreshed ? ` Last refreshed ${refreshed}.` : '')
          }
        />

        <p className="mt-6 text-sm text-muted">
          Organizations with three or more open roles get their own page. Smaller listings are still
          searchable from the{' '}
          <Link href="/" className="text-brand font-semibold hover:text-brandDark">home page</Link>.
        </p>

        {/* Letter jump-links — also a second internal path to each group. */}
        <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap gap-1.5">
          {letters.map(letter => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-line bg-white text-sm font-semibold text-inkSoft hover:border-brand hover:text-brand transition-colors"
            >
              {letter}
            </a>
          ))}
        </nav>

        {letters.map(letter => (
          <section key={letter} className="mt-10" aria-labelledby={`letter-${letter}`}>
            <h2
              id={`letter-${letter}`}
              className="font-display font-bold text-lg text-ink scroll-mt-6"
            >
              {letter}
            </h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {groups.get(letter).map(org => (
                <li key={org.slug} className="py-3">
                  <Link
                    href={`/volunteer/org/${org.slug}`}
                    className="font-medium text-ink hover:text-brand transition-colors"
                  >
                    {org.name}
                  </Link>
                  <div className="mt-0.5 text-sm text-muted">
                    {org.count} open {plural(org.count, 'role', 'roles')}
                    {org.cities.length > 0 && <span> · {org.cities.slice(0, 3).join(', ')}</span>}
                    {org.causes.length > 0 && (
                      <span> · {org.causes.slice(0, 3).map(t => tagMeta(t).label).join(', ')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <SiteFooter />
    </>
  )
}
