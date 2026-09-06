// apple-icon.jsx — the home-screen icon iOS uses when someone saves the site.
// Same mark as app/icon.jsx, at the size Apple asks for; iOS applies its own
// rounding, so this one is drawn square.

import { ImageResponse } from 'next/og'
import BrandMark from '../components/BrandMark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} radius={0} />, size)
}
