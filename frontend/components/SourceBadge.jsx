// SourceBadge — annotates each opportunity row with where it came from.
// "Volunteer Garland", "Voly Dallas", etc. Subtle by design.
//
// Keys must match the `source` field the scrapers actually write. Three of them
// didn't: the map had `garland` where records carry `volunteergarland`, and had
// no entry at all for `idealist` or `volunteermckinney` — so ~1,080 of the
// ~1,780 live listings, the two largest sources included, rendered no badge.

const SOURCES = {
  idealist:          { label: 'Idealist',          color: 'text-sky-700 bg-sky-50 ring-sky-200' },
  volunteergarland:  { label: 'Volunteer Garland', color: 'text-emerald-700 bg-emerald-50 ring-emerald-200' },
  volunteermckinney: { label: 'Volunteer McKinney',color: 'text-amber-700 bg-amber-50 ring-amber-200' },
  voly_dallas:       { label: 'Voly Dallas',       color: 'text-violet-700 bg-violet-50 ring-violet-200' },
  dallasdoinggood:   { label: 'Dallas Doing Good', color: 'text-rose-700 bg-rose-50 ring-rose-200' },
  curated:           { label: 'Curated',           color: 'text-slate-700 bg-slate-100 ring-slate-200' },
}

export default function SourceBadge({ source }) {
  const def = SOURCES[source]
  if (!def) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold ring-1 ${def.color}`}>
      via {def.label}
    </span>
  )
}
