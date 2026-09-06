// FaqSection — the questions people actually type, answered in prose.
//
// This exists for two audiences at once. Search engines get FAQPage structured
// data (emitted by the page, not here) backed by matching visible text — schema
// that doesn't match what's on the page is a violation, so the answers have to
// be here in the HTML. AI answer engines get something quotable: they cite
// sentences that directly answer a question, and a grid of listing cards gives
// them nothing to work with.
//
// Rendered as plain <details>/<summary> so it works with no JavaScript at all —
// crawlers read the answers whether or not the disclosure is open.

export default function FaqSection({ faq, className = '' }) {
  if (!faq?.length) return null

  return (
    <section className={`mt-14 max-w-3xl ${className}`} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display font-bold text-xl text-ink">
        Common questions
      </h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {faq.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer items-start gap-3 list-none font-semibold text-ink marker:content-['']">
              <span
                aria-hidden
                className="mt-1 shrink-0 text-brand transition-transform group-open:rotate-90"
              >
                ›
              </span>
              <h3 className="text-base font-semibold">{q}</h3>
            </summary>
            <p className="mt-2 pl-6 text-base text-inkSoft leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
