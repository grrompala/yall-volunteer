// /volunteer/org/[slug] — one page per organization.
//
// This is the site's largest indexable surface and the clearest thing it adds
// that no source has: Idealist knows about its own listings, Voly knows about
// its own, and an organization that posts to both is split across two portals
// under two different category systems. This page is the only place its
// openings appear together, tagged consistently, with the stale ones removed.
//
// Only organizations at or above ORG_PAGE_MIN (lib/listings.js) get a page.
// The threshold is deliberate: a page built around a single scraped listing is
// a worse copy of the source's own page, and a few hundred of those is exactly
// the auto-generated thin content Google discounts across a whole domain.
//
// Unlike the cause/city routes, these render as plain server HTML rather than
// mounting the app shell — an org has a few dozen listings at most, so there's
// nothing to filter or infinitely scroll, and the page stays small and fast.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { orgCounts, orgBySlug, tagSlug, citySlug } from '../../../../lib/listings'
import {
  orgPageCopy, itemListLd, faqLd, breadcrumbLd, formatDate, pageMeta, SITE_URL, SITE_NAME, METRO,
} from '../../../../lib/seo'
import { tagMeta } from '../../../../components/tagMeta'
import { cityName } from '../../../../lib/city'
import PageIntro from '../../../../components/PageIntro'
import FaqSection from '../../../../components/FaqSection'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import SiteFooter from '../../../../components/SiteFooter'

export function generateStaticParams() {
  return orgCounts().map(({ slug }) => ({ slug }))
}

export const dynamicParams = false // unknown org -> 404 at build, not runtime

export function generateMetadata({ params }) {
  const org = orgBySlug(params.slug)
  if (!org) return {}
  const { title, description } = orgPageCopy(org)
  return pageMeta({ title, description, path: `/volunteer/org/${params.slug}` })
}

export default function OrgPage({ params }) {
  const org = orgBySlug(params.slug)
  if (!org) notFound()

  const copy = orgPageCopy(org)
  const listings = [...org.entries].sort(
    (a, b) => (b.last_scraped || '').localeCompare(a.last_scraped || '')
  )
  const cities = copy.summary.topCities.map(c => c.city)

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'Organizations', path: '/volunteer/organizations' },
    { name: org.name, path: `/volunteer/org/${params.slug}` },
  ]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/volunteer/org/${params.slug}#organization`,
      name: org.name,
      ...(org.url ? { url: org.url, sameAs: [org.url] } : {}),
      areaServed: cities.length
        ? cities.map(c => ({ '@type': 'City', name: `${c}, TX` }))
        : METRO,
      description: copy.description,
      subjectOf: { '@type': 'WebPage', url: `${SITE_URL}/volunteer/org/${params.slug}` },
    },
    itemListLd(`Volunteer opportunities with ${org.name}`, listings, 50),
    faqLd(copy.faq),
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

        <PageIntro heading={copy.h1} intro={copy.intro} className="mt-5" />

        {org.url && (
          <p className="mt-4">
            <a
              href={org.url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brandDark"
            >
              Visit {org.name} →
            </a>
          </p>
        )}

        {/* Cause and city links — these are what stop ~217 org pages from being
            crawlable dead ends, and they let a visitor go from one nonprofit
            back out to everything else doing similar work nearby. */}
        {(org.causes.length > 0 || cities.length > 0) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {org.causes.map(tag => (
              <Link
                key={tag}
                href={`/volunteer/${tagSlug(tag)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-inkSoft hover:border-brand hover:text-brand transition-colors"
              >
                <span aria-hidden>{tagMeta(tag).icon}</span>
                {tagMeta(tag).label}
              </Link>
            ))}
            {cities.map(city => (
              <Link
                key={city}
                href={`/volunteer/in/${citySlug(city)}`}
                className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-inkSoft hover:border-brand hover:text-brand transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        )}

        <h2 className="mt-12 font-display font-bold text-xl text-ink">
          Open volunteer {listings.length === 1 ? 'opportunity' : 'opportunities'} ({listings.length})
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {listings.map(o => {
            const city = cityName(o)
            const blurb = o.description_short || o.description_long || ''
            return (
              <li key={o.id} className="py-4">
                <h3 className="font-semibold text-ink">
                  <a
                    href={o.source_url}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-brand transition-colors"
                  >
                    {o.opportunity_title}
                  </a>
                </h3>
                {blurb && (
                  <p className="mt-1 text-sm text-inkSoft leading-relaxed line-clamp-3">
                    {blurb.slice(0, 320)}
                  </p>
                )}
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {city && <span>{city}, TX</span>}
                  {o.schedule?.raw && <span>{o.schedule.raw.slice(0, 90)}</span>}
                  {o.last_scraped && <span>Checked {formatDate(o.last_scraped)}</span>}
                </p>
              </li>
            )
          })}
        </ul>

        <FaqSection faq={copy.faq} />

        <p className="mt-12 text-sm text-muted leading-relaxed">
          {SITE_NAME} indexes these openings from public listings — it isn&apos;t affiliated with{' '}
          {org.name} and doesn&apos;t handle signups. Sign up through the organization directly.{' '}
          <Link href="/about" className="text-brand font-semibold hover:text-brandDark">
            How this list is built
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </>
  )
}
