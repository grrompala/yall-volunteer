// /volunteer/[tag] — the real app experience, pre-filtered to one cause
// (e.g. /volunteer/animals, /volunteer/food-security). Statically generated
// per taxonomy tag: the matching listings are server-loaded and passed into
// HomeClient, so the full content is in the HTML for crawlers (which don't
// run JS) — while humans get the exact interactive home-page experience with
// the cause filter pre-selected. After hydration the client fetch swaps in
// the complete live dataset.
//
// The page's <h1>, lead paragraph and FAQ all come from tagPageCopy() in
// lib/seo.js, which also produces the <title> and meta description — one
// function so the four can't drift as the underlying counts change.

import { notFound } from 'next/navigation'
import { listingsByTag, tagSlug, slugToTag, lightenListing } from '../../../lib/listings'
import { TAG_META, tagMeta } from '../../../components/tagMeta'
import { tagPageCopy, itemListLd, faqLd, breadcrumbLd, pageMeta } from '../../../lib/seo'
import HomeClient from '../../../components/HomeClient'

// How many listings to bake into the static HTML. Enough for topical
// relevance without megabyte pages on the biggest causes; the client fetch
// brings in the complete dataset immediately after hydration.
const SSR_CAP = 60

export function generateStaticParams() {
  return Object.keys(TAG_META).map(tag => ({ tag: tagSlug(tag) }))
}

export const dynamicParams = false // unknown tags -> 404 at build, not runtime

export function generateMetadata({ params }) {
  const tag = slugToTag(params.tag)
  const { title, description } = tagPageCopy(tag, listingsByTag(tag))
  return pageMeta({ title, description, path: `/volunteer/${params.tag}` })
}

export default function TagPage({ params }) {
  const tag = slugToTag(params.tag)
  if (!TAG_META[tag]) notFound()

  const listings = listingsByTag(tag)
    .sort((a, b) => (b.last_scraped || '').localeCompare(a.last_scraped || ''))
  const copy = tagPageCopy(tag, listings)

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: tagMeta(tag).label, path: `/volunteer/${params.tag}` },
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
        initialCauses={[tag]}
        initialFocusedTab="listings"
        heading={copy.h1}
        intro={copy.intro}
        faq={copy.faq}
      />
    </>
  )
}
