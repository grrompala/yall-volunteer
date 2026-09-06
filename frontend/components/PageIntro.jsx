// PageIntro — the <h1> and lead paragraph for a crawlable page.
//
// Every route used to top out at <h2>: the wordmark is an image, so the home,
// cause, city and org pages shipped no <h1> at all. This gives each page one,
// with copy generated in lib/seo.js so the heading, the <title>, and the
// JSON-LD `name` all come from the same place.
//
// No hooks and no browser APIs, so it renders identically in a server page or
// inside the client app shell.

// `intro` takes either a string (one paragraph) or an array of strings, which
// renders each as its own spaced line. The array form is for the home page,
// where the lead is a few independent facts rather than an argument — running
// them together as one block made them harder to take in than they need to be.
export default function PageIntro({ heading, intro, centered = false, className = '' }) {
  const lines = (Array.isArray(intro) ? intro : [intro]).filter(Boolean)
  if (!heading && !lines.length) return null

  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
      {heading && (
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-tight text-balance">
          {heading}
        </h1>
      )}
      {lines.length > 0 && (
        <div className="mt-3 space-y-2 text-base text-inkSoft leading-relaxed">
          {lines.map(line => <p key={line}>{line}</p>)}
        </div>
      )}
    </div>
  )
}
