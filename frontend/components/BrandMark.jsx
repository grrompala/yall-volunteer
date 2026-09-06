// BrandMark — the square icon mark, shared by app/icon.jsx and
// app/apple-icon.jsx so the tab favicon and the iOS home-screen icon can't
// drift apart.
//
// A drawn shape rather than a "GD" monogram, because next/og renders with a
// single regular-weight font: text ignores fontWeight and comes out thin, and
// two thin letters are unreadable in a 16px tab strip. The wordmark carries the
// name everywhere it has room to; this only has to be recognizable at postage-
// stamp size.

export const BRAND = '#4F46E5'

export default function BrandMark({ size, radius }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND,
        borderRadius: radius,
      }}
    >
      {/* Two hands cupping a heart, simplified to read as a solid silhouette. */}
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 21.35c-.28 0-.55-.1-.76-.29C7.14 17.36 3 13.72 3 9.5 3 6.42 5.42 4 8.5 4c1.4 0 2.72.6 3.5 1.56A4.66 4.66 0 0 1 15.5 4C18.58 4 21 6.42 21 9.5c0 4.22-4.14 7.86-8.24 11.56-.21.19-.48.29-.76.29z" />
      </svg>
    </div>
  )
}
