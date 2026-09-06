// listings.js — server-side listing access for the crawlable /volunteer pages.
// Reads the same JSON files the client SPA fetches, applies the same
// active/QC/Texas filters, and exposes grouped views (by cause tag, by city).
// Runs at build time on Vercel, so pages regenerate on every deploy — including
// the weekly automated data-refresh commits.

import fs from 'node:fs'
import path from 'node:path'
import { isTexasListing } from './rag/corpus'
import { cityName, citySlug } from './city'
import { orgKey, summarizeOrg } from '../components/orgs'

export { cityName, citySlug } // re-export for existing importers

const LISTING_FILES = [
  'public/data/volops_garland.json',
  'public/data/volops_mckinney.json',
  'public/data/volops_voly.json',
  'public/data/volops_idealist.json',
  'public/data/volops_curated.json',
  'public/data/volops_dallasdoinggood.json',
]

// Minimum listings for a city to get its own page (avoids thin pages).
const CITY_PAGE_MIN = 8

// Minimum listings for an organization to get its own page. The threshold is
// the whole point of these pages: an org page that collects 23 SPCA of Texas
// opportunities is an aggregation that exists nowhere else, while a page built
// around a single scraped Idealist listing is just a worse copy of Idealist's
// own page — exactly the thin, auto-generated content Google discounts. Orgs
// below the line still surface everywhere else on the site; they just don't get
// a dedicated URL. Raise this to 5 if Search Console reports a large share of
// org pages as "Crawled – currently not indexed".
const ORG_PAGE_MIN = 3

let _cache = null

export function loadListings() {
  if (_cache) return _cache
  _cache = LISTING_FILES.flatMap(file => {
    try {
      const raw = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      return JSON.parse(raw)
    } catch {
      return [] // a missing source file is fine — just skip it
    }
  }).filter(o =>
    o.status !== 'inactive' && o.qc?.status !== 'rejected' && isTexasListing(o)
  )
  return _cache
}

// ── Cause tags ────────────────────────────────────────────────────────────────

export function tagSlug(tag) {
  return tag.replace(/_/g, '-')
}

export function slugToTag(slug) {
  return slug.replace(/-/g, '_')
}

export function listingsByTag(tag) {
  return loadListings().filter(o => (o.unified_tags || []).includes(tag))
}

// [{ tag, count }] for every tag that has at least one listing, biggest first.
export function tagCounts() {
  const counts = new Map()
  for (const o of loadListings()) {
    for (const t of o.unified_tags || []) counts.set(t, (counts.get(t) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
}

// ── Cities ────────────────────────────────────────────────────────────────────

// [{ city, slug, count }] for cities with enough listings for their own page.
export function cityCounts() {
  const counts = new Map()
  for (const o of loadListings()) {
    const c = cityName(o)
    if (c) counts.set(c, (counts.get(c) || 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= CITY_PAGE_MIN)
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => ({ city, slug: citySlug(city), count }))
}

export function listingsByCitySlug(slug) {
  return loadListings().filter(o => {
    const c = cityName(o)
    return c && citySlug(c) === slug
  })
}

// ── Organizations ─────────────────────────────────────────────────────────────
// Orgs are derived from listings by name (see components/orgs.js — orgKey() is
// the shared identity function, so an org page groups exactly the same listings
// the Organizations panel and OrgModal do).

// Display name -> URL slug. Stricter than citySlug() because org names are the
// messiest strings in the corpus: they carry punctuation, ampersands, trailing
// commas, "Inc.", and symbols like the ® in "I Want To Mow Your Lawn ®".
export function orgSlug(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')   // strip accents: "Camara" from "Cámara"
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')              // don't let the truncation leave a trailing dash
}

let _orgIndex = null
let _orgSlugByKey = null

// slug -> summarized org record, for every org at or above ORG_PAGE_MIN.
// Built once per process (build-time), so the ~217 pages, the org index page,
// and the sitemap all agree on the same slug set.
function orgIndex() {
  if (_orgIndex) return _orgIndex

  const byKey = new Map()
  for (const o of loadListings()) {
    const key = orgKey(o.org_name)
    if (!key) continue
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key).push(o)
  }

  const eligible = [...byKey.values()]
    .filter(entries => entries.length >= ORG_PAGE_MIN)
    .map(summarizeOrg)
    .filter(org => orgSlug(org.name))   // drop anything that slugs to nothing
    // Sort before assigning slugs so collision suffixes are stable across
    // builds: biggest org keeps the clean slug, ties broken by name.
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const index = new Map()
  for (const org of eligible) {
    const base = orgSlug(org.name)
    let slug = base
    for (let n = 2; index.has(slug); n++) slug = `${base}-${n}`
    index.set(slug, { ...org, slug })
  }

  _orgIndex = index
  _orgSlugByKey = new Map([...index.values()].map(org => [org.key, org.slug]))
  return _orgIndex
}

// [{ slug, name, count, causes[], cities[], ... }] — biggest org first.
export function orgCounts() {
  return [...orgIndex().values()]
}

export function orgBySlug(slug) {
  return orgIndex().get(slug) || null
}

// Slug for a listing's organization, or null when that org has no page.
// Used to link listing cards and cause/city pages into the org pages, so they
// aren't crawlable orphans.
export function orgSlugForListing(listing) {
  const key = orgKey(listing?.org_name)
  if (!key) return null
  orgIndex()                    // ensures _orgSlugByKey is populated
  return _orgSlugByKey.get(key) || null
}

export function listingsByOrgSlug(slug) {
  return orgBySlug(slug)?.entries || []
}

// Slim version of a listing for embedding in a pre-rendered page's payload.
// Drops the bulky fields (full description, QC audit trail) — the client
// fetch swaps in complete records right after hydration, so nothing that
// needs them (detail modals etc.) misses out for more than a moment.
export function lightenListing(o) {
  const { description_long, qc, contact, ...rest } = o
  return rest
}
