// page.js — Good Deeds Dallas landing page. The interactive experience lives in
// components/HomeClient.jsx (shared with the pre-filtered /volunteer routes);
// this server wrapper mounts it and supplies the page's crawlable content.
//
// It used to mount HomeClient with nothing at all, which meant the strongest
// page on the domain shipped ~19 KB containing no opportunities, no
// organizations, and links to only eight of the 45+ browse pages. Crawlers
// don't run JavaScript, so as far as search engines and AI crawlers were
// concerned the home page was close to empty — while the cause and city pages
// under it were returning 250 KB+ of real content. Now the root carries an
// <h1>, a lead paragraph, an FAQ, links to every cause / city / organization
// page, and the 40 most recent listings, all as static HTML
// (components/HomeBrowseSection.jsx).

import {
  loadListings, tagCounts, tagSlug, cityCounts, orgCounts, orgSlugForListing, cityName,
} from '../lib/listings'
import {
  summarize, formatDate, plural, itemListLd, faqLd, pageMeta, SITE_URL, SITE_NAME, METRO,
} from '../lib/seo'
import { tagMeta } from '../components/tagMeta'
import HomeClient from '../components/HomeClient'
import HomeBrowseSection from '../components/HomeBrowseSection'

// Note on why the client shell is NOT seeded with listings here, unlike the
// cause/city routes: the home screen renders its welcome state regardless of
// whether data is loaded, so seeding would buy nothing visible while making a
// search typed in the first moment after hydration match against a 60-row
// subset instead of showing "Loading…". The crawlable content comes from
// HomeBrowseSection below, which is static HTML either way.

// Listings rendered as plain HTML in the "Recently added" block.
const RECENT_CAP = 40
// Organizations linked from the home page; the rest are on /volunteer/organizations.
const HOME_ORG_CAP = 30

const byRecency = (a, b) => (b.last_scraped || '').localeCompare(a.last_scraped || '')

export function generateMetadata() {
  const listings = loadListings()
  const total = listings.length
  const orgs = new Set(listings.map(o => o.org_name).filter(Boolean)).size
  const description =
    `${total.toLocaleString()} volunteer opportunities across Dallas–Fort Worth from ${orgs} local ` +
    `nonprofits, refreshed weekly and quality-checked. Browse by cause or city, then sign up directly ` +
    `with the organization.`

  return pageMeta({
    title: `${SITE_NAME} — Volunteer opportunities across DFW`,
    description,
    path: '/',
  })
}

export default function Home() {
  const listings = loadListings()
  const sorted = [...listings].sort(byRecency)
  const s = summarize(listings)

  const tags = tagCounts().map(({ tag, count }) => ({ tag, slug: tagSlug(tag), count }))
  const cities = cityCounts()
  const orgs = orgCounts()

  const heading = `Volunteer opportunities across ${METRO}`
  const refreshed = formatDate(s.newest)

  // Three independent facts, rendered as separate lines rather than one
  // paragraph. A "biggest categories right now" sentence used to sit in here;
  // it was filler — the cause links directly below list all of them with real
  // counts, which is both more useful and more scannable.
  const intro = [
    `${s.total.toLocaleString()} open volunteer ${plural(s.total, 'role', 'roles')} from ` +
      `${s.orgCount} ${plural(s.orgCount, 'organization')} across the Dallas metro, in one place.`,
    `Every listing links straight to the organization's own signup page.`,
    refreshed ? `Last refreshed ${refreshed}.` : '',
  ].filter(Boolean)

  const faq = [
    {
      q: 'How do I find volunteer opportunities in Dallas?',
      a:
        `Good Deeds Dallas indexes ${s.total.toLocaleString()} current openings from ${s.orgCount} ` +
        `organizations across ${METRO}. Browse by cause (food security, animals, seniors, and ` +
        `${tags.length - 3} more) or ` +
        `by city, search by keyword, or describe what you're after in Smart Search. Each result links to the ` +
        `nonprofit's own signup page.`,
    },
    {
      q: 'Is Good Deeds Dallas free?',
      a:
        `Yes. It's free to use, there's no account to create, and it sets no tracking cookies. It also takes ` +
        `no cut and handles no signups — it points you at the organization and gets out of the way.`,
    },
    {
      q: 'Where do these listings come from?',
      a:
        `From the volunteer listings the organizations themselves publish. Good Deeds Dallas checks six public ` +
        `sources each week — Idealist, Volunteer McKinney, Volunteer Garland, Voly Dallas, Dallas Doing Good, ` +
        `and the websites of local nonprofits that don't post to any portal — and brings what it finds ` +
        `together in one place. Everything then passes a quality check that removes duplicates, expired ` +
        `events, paid positions, and donation drives that aren't really volunteer roles, and is re-tagged ` +
        `against one consistent set of cause labels so filtering works across sources. Listings link back to ` +
        `the original posting rather than replacing it.`,
    },
    {
      q: 'How often is the list updated?',
      a:
        `Every source is rechecked weekly and past-dated events are removed daily, so nothing shown here has ` +
        `already happened. ${refreshed ? `The current data was refreshed on ${refreshed}.` : ''}`,
    },
  ]

  const jsonLd = [
    itemListLd(`Volunteer opportunities in ${METRO}`, sorted, 50),
    faqLd(faq),
    // The browse pages, declared as a list so a crawler landing on the root can
    // see the shape of the site without following every link first.
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Volunteer opportunities by cause',
      itemListElement: tags.map(({ tag, slug }, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${tagMeta(tag).label} volunteer opportunities in ${METRO}`,
        url: `${SITE_URL}/volunteer/${slug}`,
      })),
    },
  ]

  const recent = sorted.slice(0, RECENT_CAP).map(o => ({
    id: o.id,
    opportunity_title: o.opportunity_title,
    org_name: o.org_name,
    source_url: o.source_url,
    city: cityName(o),
    orgSlug: orgSlugForListing(o),
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient heading={heading} intro={intro} faq={faq}>
        <HomeBrowseSection
          tags={tags}
          cities={cities}
          orgs={orgs.slice(0, HOME_ORG_CAP).map(({ slug, name, count }) => ({ slug, name, count }))}
          recent={recent}
          totalOrgs={orgs.length}
        />
      </HomeClient>
    </>
  )
}
