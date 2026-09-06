// icon.jsx — the browser-tab favicon, generated at build time.
//
// The site had no favicon of any kind: no icon.png, no favicon.ico, and
// public/logo.png is a 782×192 wordmark that can't stand in for one. Browsers
// showed the generic blank-page glyph, which reads as broken in a tab strip or
// a bookmark bar.

import { ImageResponse } from 'next/og'
import BrandMark from '../components/BrandMark'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<BrandMark size={32} radius={7} />, size)
}
