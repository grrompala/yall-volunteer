// layout.js — outermost wrapper for every page.
// Loads Inter + JetBrains Mono, sets site-wide metadata (title template,
// OpenGraph, Twitter card, robots), and embeds Organization/WebSite JSON-LD so
// search engines and AI crawlers can identify the site without executing JS.

import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL, SITE_NAME, METRO } from '../lib/seo'

const SITE_DESCRIPTION =
  'A free index of volunteer opportunities across Dallas–Fort Worth, ' +
  'pulled weekly from local volunteer portals and nonprofits. Find a cause, ' +
  'then sign up directly with the organization.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Volunteer opportunities across DFW`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'volunteer Dallas',
    'volunteer opportunities Dallas',
    'volunteering DFW',
    'Dallas nonprofits',
    'volunteer near me Dallas',
  ],
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: `${SITE_NAME} — Volunteer opportunities across DFW`,
    description: SITE_DESCRIPTION,
  },
  // Without this every share rendered as a bare link. `summary_large_image`
  // pairs with app/opengraph-image.jsx; Slack, Discord and iMessage read the
  // same tags, so this is not just X.
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Volunteer opportunities across DFW`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

// Site-identity structured data (rendered into static HTML for crawlers).
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      email: 'info@good-deeds-dallas.org',
      description: SITE_DESCRIPTION,
      areaServed: { '@type': 'Place', name: `${METRO}, Texas` },
      logo: `${SITE_URL}/logo.png`,
      knowsAbout: [
        'volunteering',
        'nonprofit organizations',
        'community service',
        'Dallas–Fort Worth metroplex',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="font-sans text-ink antialiased min-h-screen bg-canvas">
        {children}
        {/* Cookieless, no client-side identifiers — consistent with the privacy
            policy's promise of no tracking cookies. Without any analytics there
            was no way to tell whether search or AI referrals were arriving. */}
        <Analytics />
      </body>
    </html>
  )
}
