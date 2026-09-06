// PageIntro — the <h1> and lead paragraph for a crawlable page.
//
// Every route used to top out at <h2>: the wordmark is an image, so the home,
// cause, city and org pages shipped no <h1> at all. This gives each page one,
// with copy generated in lib/seo.js so the heading, the <title>, and the
// JSON-LD `name` all come from the same place.
//
// No hooks and no browser APIs, so it renders identically in a server page or
// inside the client app shell.

export default function PageIntro({ heading, intro, centered = false, className = '' }) {
  if (!heading && !intro) return null

  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
      {heading && (
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight text-balance">
          {heading}
        </h1>
      )}
      {intro && (
        <p className="mt-3 text-base text-inkSoft leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  )
}
