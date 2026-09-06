// /volunteer/in/[city] — the real app experience, pre-filtered to one DFW
// city (e.g. /volunteer/in/garland). The city's listings are server-loaded
// into the HTML for crawlers; humans land on the interactive app focused on
// Opportunities with that city's filter pill active.
// Only cities with enough listings get a page (CITY_PAGE_MIN in lib/listings).
//
// Heading, lead paragraph, FAQ, title and meta description all come from
// cityPageCopy() in lib/seo.js — see the note on the cause route.

import { notFound } from 'next/navigation'
import { listingsByCitySlug, cityCounts, lightenListing } from '../../../../lib/listings'
import { cityPageCopy, itemListLd, faqLd, breadcrumbLd, pageMeta } from '../../../../lib/seo'
import HomeClient from '../../../../components/HomeClient'

// How many listings to bake into the static HTML. Enough for topical
// relevance without megabyte pages on the biggest causes; the client fetch
// brings in the complete dataset immediately after hydration.
const SSR_CAP = 60

export function generateStaticParams() {
  return cityCounts().map(({ slug }) => ({ city: slug }))
}

export const dynamicParams = false

function cityForSlug(slug) {
  return cityCounts().find(c => c.slug === slug)
}

export function generateMetadata({ params }) {
  const entry = cityForSlug(params.city)
  if (!entry) return {}
  const { title, description } = cityPageCopy(entry.city, listingsByCitySlug(params.city))
  return pageMeta({ title, description, path: `/volunteer/in/${params.city}` })
}

export default function CityPage({ params }) {
  const entry = cityForSlug(params.city)
  if (!entry) notFound()

  const listings = listingsByCitySlug(params.city)
    .sort((a, b) => (b.last_scraped || '').localeCompare(a.last_scraped || ''))
  const copy = cityPageCopy(entry.city, listings)

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: entry.city, path: `/volunteer/in/${params.city}` },
  ]

  const jsonLd = [
    itemListLd(copy.title, listings, 50),
    faqLd(copy.faq),
    breadcrumbLd(trail),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        initialListings={listings.slice(0, SSR_CAP).map(lightenListing)}
        initialCities={[entry.city]}
        initialFocusedTab="listings"
        heading={copy.h1}
        intro={copy.intro}
        faq={copy.faq}
      />
    </>
  )
}
