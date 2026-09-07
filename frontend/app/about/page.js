// /about — how the index is built.
//
// The methodology was written up well in README.md and lived only on GitHub.
// It's the most citation-worthy content the site has: asked "how do I find
// volunteer opportunities in Dallas", an answer engine has far more to quote
// from a page explaining how a directory is assembled, filtered and kept
// current than from a grid of listing cards. It's also the provenance signal
// Google looks for on an aggregator — who made this, from what, how often.

import Link from 'next/link'
import { loadListings, tagCounts, cityCounts } from '../../lib/listings'
import {
  summarize, formatDate, breadcrumbLd, faqLd, plural, pageMeta, SITE_URL, SITE_NAME, METRO,
} from '../../lib/seo'
import Breadcrumbs from '../../components/Breadcrumbs'
import PageIntro from '../../components/PageIntro'
import FaqSection from '../../components/FaqSection'
import SiteFooter from '../../components/SiteFooter'

export const metadata = pageMeta({
  title: 'How Good Deeds Dallas is built',
  description:
    'Where the listings come from, how they are quality-checked and de-duplicated, how often they ' +
    'refresh, and what the site does and does not do with your data.',
  path: '/about',
})

const trail = [
  { name: 'Home', path: '/' },
  { name: 'How it works', path: '/about' },
]

function Section({ id, title, children }) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="font-display font-bold text-xl text-ink scroll-mt-6">
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-base text-inkSoft leading-relaxed">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  const listings = loadListings()
  const s = summarize(listings)
  const refreshed = formatDate(s.newest)
  const tags = tagCounts()
  const cities = cityCounts()

  const faq = [
    {
      q: 'Who runs Good Deeds Dallas?',
      a:
        `It's an independent, non-commercial project covering the ${METRO} metroplex. It takes no fees from ` +
        `nonprofits, runs no ads, and has no relationship with any of the organizations or portals it indexes. ` +
        `It exists because volunteer listings in this metro are scattered across half a dozen portals that ` +
        `don't talk to each other.`,
    },
    {
      q: 'How do I get my organization listed?',
      a:
        `If you post to Idealist, Volunteer McKinney, Volunteer Garland or Voly Dallas, your openings are ` +
        `probably already here — the weekly refresh picks them up. If you only publish on your own website, ` +
        `email info@good-deeds-dallas.org and the site can add you to the curated list it extracts from ` +
        `directly. Listing is free.`,
    },
    {
      q: 'Why is a listing missing or out of date?',
      a:
        `The index refreshes weekly, so an opening posted since the last run won't appear until the next one. ` +
        `Listings are also removed when their date passes, when the source marks them inactive, or when the ` +
        `quality filter judges them not to be volunteer roles. If something looks wrong, email ` +
        `info@good-deeds-dallas.org.`,
    },
    {
      q: 'Does Good Deeds Dallas handle signups?',
      a:
        `No. Every listing links back to where it was posted — the organization's own site, or the portal it ` +
        `posted to — and registration happens there. The site never ` +
        `sits between a volunteer and a nonprofit, takes no cut, and collects nothing from you to browse.`,
    },
  ]

  const jsonLd = [
    breadcrumbLd(trail),
    faqLd(faq),
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `How ${SITE_NAME} is built`,
      url: `${SITE_URL}/about`,
      about: { '@id': `${SITE_URL}/#organization` },
      description: metadata.description,
      dateModified: s.newest || undefined,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
        <Breadcrumbs trail={trail} />

        <PageIntro
          className="mt-5"
          heading={`How ${SITE_NAME} is built`}
          intro={
            `${SITE_NAME} is a free, independent index of volunteer opportunities across ${METRO}. ` +
            `It currently tracks ${s.total.toLocaleString()} open roles from ${s.orgCount} organizations, ` +
            `sorted into ${tags.length} cause categories across ${cities.length} cities.` +
            (refreshed ? ` Last refreshed ${refreshed}.` : '')
          }
        />

        <Section id="problem" title="The problem it solves">
          <p>
            Volunteer listings in this metro are scattered. A nonprofit in Plano might post to Idealist;
            one in McKinney posts to its city&apos;s Galaxy Digital portal; a third posts nowhere but its own
            website. Each portal uses its own category system, so &ldquo;food security&rdquo; work is filed
            under four different labels depending on where you look, and there is no single place to ask
            &ldquo;what needs doing near me this weekend?&rdquo;
          </p>
          <p>
            This site aggregates those sources, applies one consistent set of cause tags, removes what has
            expired or was never a volunteer role to begin with, and links you straight back to the
            organization to sign up.
          </p>
        </Section>

        <Section id="sources" title="Where the listings come from">
          <p>
            Six public sources are rechecked every week:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-ink">Idealist</strong> — the largest national listing site, filtered to
              the DFW metro.
            </li>
            <li>
              <strong className="text-ink">Volunteer McKinney</strong> and{' '}
              <strong className="text-ink">Volunteer Garland</strong> — municipal Galaxy Digital portals with
              structured feeds.
            </li>
            <li>
              <strong className="text-ink">Voly Dallas</strong> — a Texas volunteer platform used widely by
              local nonprofits.
            </li>
            <li>
              <strong className="text-ink">Dallas Doing Good</strong> — local coverage of nonprofits and the
              volunteer needs they publish.
            </li>
            <li>
              <strong className="text-ink">Nonprofits&apos; own websites</strong> — a curated list of local
              organizations that publish no structured feed at all. Their volunteer pages are read and
              converted into structured listings by a language model.
            </li>
          </ul>
          <p>
            Local subreddits are read too, but kept separate as community chatter rather than mixed into the
            opportunity index.
          </p>
        </Section>

        <Section id="quality" title="How listings are quality-checked">
          <p>
            Aggregation without filtering produces a worse experience than the portals it aggregates. Every
            extracted listing passes three stages before it appears:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-ink">De-duplication.</strong> Platforms re-post the same shift many
              times — the same Saturday pantry slot can appear a dozen times under different dates. Rule-based
              matching collapses those.
            </li>
            <li>
              <strong className="text-ink">Expiry.</strong> One-time events drop off automatically the day
              after they happen. This runs daily, not weekly, so nothing shown here has already passed.
            </li>
            <li>
              <strong className="text-ink">Screening.</strong> A language-model judge removes what isn&apos;t
              actually a volunteer role: 5K race signups, donation drives, paid internships posted to the
              wrong board. Sources that are already staffed volunteer platforms skip this stage — they
              don&apos;t need it.
            </li>
          </ul>
          <p>
            Rejected listings are kept in a separate audit file rather than silently dropped, so a filter that
            starts making bad calls is visible rather than invisible.
          </p>
        </Section>

        <Section id="tagging" title="One taxonomy across six sources">
          <p>
            Each source labels causes its own way, which makes filtering across them meaningless. Every
            listing is re-tagged against a single fixed taxonomy of {tags.length} categories — seniors, food
            security, animals, environment, mental health, and the rest. That is what makes it possible to ask
            for &ldquo;animal welfare volunteering in Denton&rdquo; and get results from four different
            portals in one list.
          </p>
        </Section>

        <Section id="search" title="Smart Search">
          <p>
            Alongside keyword search there&apos;s a retrieval-based one. Listings are embedded into a vector
            index; a query is embedded and matched by similarity; a language model then writes an answer using
            only the listings actually retrieved. It cannot invent an opportunity that isn&apos;t in the
            index — if nothing matches, it says so rather than inventing a plausible-sounding nonprofit.
          </p>
        </Section>

        <Section id="cadence" title="How often it updates">
          <p>
            The full collection, quality-control and re-tagging pipeline runs weekly and unattended. Expiry runs
            daily. The site rebuilds on every data change, so the counts on every page — {s.total.toLocaleString()}{' '}
            {plural(s.total, 'opportunity', 'opportunities')} as of this build — are generated from the
            current data rather than written by hand.
          </p>
        </Section>

        <Section id="privacy" title="What it does with your data">
          <p>
            Browsing requires no account and sets no tracking cookies. Smart Search is rate-limited per IP
            using a hashed address, and no raw addresses are stored. The full detail is in the{' '}
            <Link href="/privacy" className="text-brand font-semibold hover:text-brandDark">
              privacy policy
            </Link>
            .
          </p>
        </Section>

        <FaqSection faq={faq} />

        <p className="mt-12 text-sm text-muted leading-relaxed">
          Browse{' '}
          <Link href="/volunteer" className="text-brand font-semibold hover:text-brandDark">
            by cause or city
          </Link>
          , or start from the{' '}
          <Link href="/" className="text-brand font-semibold hover:text-brandDark">
            home page
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </>
  )
}
