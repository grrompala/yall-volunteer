// SectionShell — shared wrapper that gives every panel the same heading
// treatment: title, subtitle, count badge, and an optional "View all →"
// link when shown in compact mode in the 3-column landing layout.

export default function SectionShell({
  title,
  subtitle,
  count,
  compact = false,
  // Drop the title and subtitle, keeping the count. The pre-filtered
  // /volunteer routes set this: their <h1> already names the page, and a
  // generic "Opportunities / Volunteer opportunities from across the Dallas
  // metro" directly beneath it said the same thing twice.
  hideHeading = false,
  onExpand,
  children,
}) {
  return (
    <section className="flex flex-col">
      {/* With the heading hidden this row holds only the result count, so it
          tucks up against the filter toolbar below rather than floating alone
          in the middle of the whitespace the heading used to occupy. */}
      <div
        className={`flex items-start gap-3 ${
          hideHeading ? 'justify-end -mt-4 mb-1' : 'justify-between mb-3'
        }`}
      >
        {!hideHeading && (
        <div>
          <h2 className={`font-bold text-ink ${compact ? 'text-xl' : 'text-h2'}`}>
            {title}
          </h2>
          {!compact && subtitle && (
            <div className="mt-1 text-sm sm:text-base text-muted max-w-3xl">{subtitle}</div>
          )}
        </div>
        )}
        <div className="shrink-0 flex flex-col items-end gap-1">
          {count !== undefined && (
            <span className="text-xs font-mono text-muted tabular-nums">{count}</span>
          )}
          {compact && onExpand && (
            <button
              onClick={onExpand}
              className="text-xs text-brand font-semibold hover:text-brandDark"
            >
              View all →
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}
