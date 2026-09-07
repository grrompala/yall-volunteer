// LineIcon — the small leading glyphs on the home page's lead lines.
//
// One component so the three rows stay a set: same box, same stroke weight,
// same optical size. The search glyph is the one that was already inline in the
// welcome copy; the other two were added to match it rather than the reverse.

const PATHS = {
  // Bulleted rows — "here is a list of many things". Deliberately plain: an
  // earlier version used ragged lines with a dot, which at 20px lost the dot
  // entirely and read as a sort-order control instead of a count.
  count: (
    <>
      <circle cx="5" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9.5 6h10M9.5 12h10M9.5 18h10" strokeLinecap="round" />
    </>
  ),
  // Clock — when the data was last refreshed.
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Magnifying glass — how to start looking.
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </>
  ),
}

export default function LineIcon({ name, className = '' }) {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={className}
    >
      {paths}
    </svg>
  )
}
