// opengraph-image.jsx — the social preview card, generated at build time.
//
// The site had no OG image at all, so every share — Reddit, Discord, LinkedIn,
// Slack, iMessage — rendered as a bare blue link. That matters more than it
// sounds: a link with a card showing a real, current number ("1,787 volunteer
// opportunities") is a fundamentally different object to scroll past than a
// naked URL, and link-sharing is the cheapest distribution this site has.
//
// Next generates this at build time via ImageResponse, so the count is baked
// from the same data the pages are, and refreshes with the weekly deploy.
// Applies to every route that doesn't define its own opengraph-image.

import { ImageResponse } from 'next/og'
import { loadListings } from '../lib/listings'
import { cityName } from '../lib/city'

export const alt = 'Good Deeds Dallas — volunteer opportunities across Dallas–Fort Worth'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  const listings = loadListings()
  const orgs = new Set(listings.map(o => o.org_name).filter(Boolean)).size
  const cities = new Set(listings.map(cityName).filter(Boolean)).size

  const stats = [
    [listings.length.toLocaleString(), 'opportunities'],
    [String(orgs), 'organizations'],
    [String(cities), 'cities'],
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 55%, #ECFEFF 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#4F46E5',
            }}
          >
            Good Deeds Dallas
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#0B1220',
              maxWidth: 940,
            }}
          >
            Volunteer opportunities across Dallas–Fort Worth
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: '#475569', maxWidth: 900 }}>
            Every local opening in one place — refreshed weekly, quality-checked, free.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 64 }}>
          {stats.map(([value, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 60, fontWeight: 800, color: '#4F46E5' }}>{value}</div>
              <div style={{ fontSize: 26, color: '#64748B' }}>{label}</div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 26, color: '#64748B' }}>
            good-deeds-dallas.org
          </div>
        </div>
      </div>
    ),
    size
  )
}
