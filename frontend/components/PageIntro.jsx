// PageIntro — the <h1> and lead lines for a crawlable page.
//
// Every route used to top out at <h2>: the wordmark is an image, so the home,
// cause, city and org pages shipped no <h1> at all. This gives each page one,
// with copy generated in lib/seo.js so the heading, the <title>, and the
// JSON-LD `name` all come from the same place.
//
// `intro` takes a string (one paragraph, used by the cause / city / org pages)
// or an array. Array entries may be plain strings, or `{ icon, text }` to get
// an icon list — the home page's form, where the lead is a few independent
// facts rather than an argument, and the icons give the rows a shared left
// edge to hang off.
//
// No hooks and no browser APIs, so it renders identically in a server page or
// inside the client app shell.

import LineIcon from './LineIcon'

// Matches the lead to the copy it sits next to. On the home screen the welcome
// line ("Type a cause, town, or nonprofit…") is text-base sm:text-lg, so a
// text-base lead directly above it read as two different typefaces stacked.
// The browse pages keep 'base', where the lead is a paragraph above a grid.
const SIZES = {
  base: 'text-base',
  lg: 'text-base sm:text-lg',
}

export default function PageIntro({
  heading, intro, centered = false, size = 'base', className = '',
}) {
  const lines = (Array.isArray(intro) ? intro : [intro])
    .filter(Boolean)
    .map(line => (typeof line === 'string' ? { text: line } : line))
  if (!heading && !lines.length) return null

  const hasIcons = lines.some(l => l.icon)

  return (
    <div className={`${centered ? 'mx-auto' : ''} max-w-3xl ${className}`}>
      {heading && (
        <h1
          className={`font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight text-balance ${
            centered ? 'text-center' : ''
          }`}
        >
          {heading}
        </h1>
      )}

      {lines.length > 0 && (
        // An icon list is always left-aligned, even inside a centred column —
        // ragged-centre rows with glyphs in front of them don't line up with
        // each other, which is the whole point of putting icons there.
        <div
          className={`mt-4 space-y-2 ${SIZES[size] || SIZES.base} text-inkSoft leading-relaxed ${
            hasIcons ? 'max-w-xl' : ''
          } ${centered ? (hasIcons ? 'mx-auto text-left' : 'text-center') : ''}`}
        >
          {lines.map(({ icon, text }) => (
            <p key={text} className={hasIcons ? 'flex items-start gap-2.5' : ''}>
              {hasIcons && (
                <span className="shrink-0 mt-1 w-5 h-5 text-brand">
                  {icon ? <LineIcon name={icon} className="w-5 h-5" /> : null}
                </span>
              )}
              <span>{text}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
