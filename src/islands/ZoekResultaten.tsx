import { useState, useEffect, type FC } from 'react'
import StarRating from './StarRating'

interface Bedrijf {
  _id:            string
  naam:           string
  stad?:          string
  provincie?:     string
  website?:       string
  telefoon?:      string
  googleScore?:   number
  aantalReviews?: number
  postcode?:      string
  hoofdCategorie?: string
  googleMapsUrl:  string
  slug:           string
}

interface Props {
  postcode: string
  dienst:   string
  stad:     string
  stadSlug: string
}

const CATEGORIE_LABELS: Record<string, string> = {
  'Tuin': 'Tuin',
  'Tuin- en landschapaannemer': 'Tuinaannemer',
  'Tuin- en landschapsaannemer': 'Tuinaannemer',
  'Tuin- en landschapsarchitect': 'Tuinaannemer',
  'Hoveniersbedrijf': 'Hovenier',
  'Hovenier': 'Hovenier',
  'Landschapsarchitect': 'Landschapsarchitect',
  'Boomverzorging': 'Boomverzorging',
  'Boomverzorgingsdienst': 'Boomverzorging',
  'Tuinaannemer': 'Tuinaannemer',
  'Tuinonderhoud': 'Tuinonderhoud',
  'Tuinman': 'Tuinman',
}

const ZoekResultaten: FC<Props> = ({ postcode, dienst, stad, stadSlug }) => {
  const [bedrijven, setBedrijven] = useState<Bedrijf[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const convexUrl = (import.meta as Record<string, any>).env?.PUBLIC_CONVEX_URL ?? ''
    if (!convexUrl) { setLoading(false); return }

    const path = stad ? 'bedrijven:zoekBedrijven' : 'bedrijven:getTopBedrijven'
    const args = stad ? { stad, limit: 12 } : { limit: 12 }

    fetch(`${convexUrl}/api/query`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, args, format: 'json' }),
    })
      .then((r) => r.json())
      .then(({ value }) => { setBedrijven(value ?? []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [stad])

  function buildOffertUrl(_b: Bedrijf): string {
    const p = new URLSearchParams({ postcode, dienst, stad: stadSlug })
    return `/offerte?${p.toString()}`
  }

  if (loading) return (
    <div className="max-w-[1100px] mx-auto">
      <div className="h-8 w-70 rounded-md bg-canvas-muted mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[180px] rounded-lg bg-canvas-muted animate-pulse" aria-hidden="true" />
        ))}
      </div>
    </div>
  )

  if (error || bedrijven.length === 0) return (
    <div className="max-w-[1100px] mx-auto">
      <div className="text-center py-16 px-8 flex flex-col items-center gap-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border-hover mb-2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <h2 className="font-heading text-charcoal m-0">Geen hoveniers gevonden{stad ? ` in ${stad}` : ''}</h2>
        <p className="text-charcoal-muted m-0 max-w-[400px]">Vraag een algemene offerte aan. We koppelen je aan hoveniers in jouw regio.</p>
        <a
          href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}`}
          className="inline-flex items-center gap-1 py-3 px-6 bg-primary-500 text-white rounded-md font-heading font-bold no-underline transition-colors duration-200 hover:bg-primary-600"
        >
          Vraag gratis offerte aan
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1100px] mx-auto font-body text-charcoal">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading text-[clamp(1.5rem,3vw,2rem)] font-bold text-charcoal m-0 mb-1">
            {stad ? `Hoveniers in ${stad}` : 'Populaire hoveniers in Nederland'}
          </h1>
          <p className="text-sm text-charcoal-muted m-0">
            {bedrijven.length} {stad ? `hoveniersbedrijven gevonden` : `topbedrijven geselecteerd`}, gesorteerd op Google score
          </p>
        </div>
        <a
          href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}&stad=${encodeURIComponent(stadSlug)}`}
          className="inline-flex items-center py-2.5 px-5 border-[1.5px] border-primary-500 rounded-md text-primary-500 text-sm font-semibold no-underline font-heading whitespace-nowrap transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
        >
          Vraag algemene offerte aan
        </a>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 list-none p-0 mb-10" role="list">
        {bedrijven.map((b, i) => (
          <li key={b._id} className="relative bg-white border border-border rounded-lg p-5 flex flex-col gap-2.5 transition-colors duration-200 hover:border-border-hover hover:shadow-md" role="listitem">
            {i < 3 && (
              <div className="absolute top-3.5 right-3.5 bg-primary-50 border border-primary-200 text-primary-500 text-[0.7rem] font-bold py-0.5 px-2 rounded-full font-heading tracking-wide" aria-label={`#${i + 1} hoogste score`}>
                #{i + 1}
              </div>
            )}

            <div className="flex flex-col gap-1.5 pr-10">
              <div className="font-heading text-base font-bold text-charcoal leading-tight">{b.naam}</div>
              {b.hoofdCategorie && (
                <span className="inline-flex self-start py-0.5 px-2.5 bg-primary-50 border border-primary-200 rounded-full text-[0.7rem] font-semibold text-primary-700 tracking-wide">
                  {CATEGORIE_LABELS[b.hoofdCategorie] ?? b.hoofdCategorie}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[0.8125rem]">
              {b.googleScore ? (
                <>
                  <StarRating score={b.googleScore} />
                  <strong className="text-charcoal font-bold">{b.googleScore.toFixed(1)}</strong>
                  {b.aantalReviews && (
                    <span className="text-charcoal-muted">({b.aantalReviews} reviews)</span>
                  )}
                </>
              ) : (
                <span className="text-[#94a3b8] italic">Nog geen reviews</span>
              )}
            </div>

            {b.postcode && (
              <div className="text-[0.8rem] text-charcoal-muted flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {b.postcode}{b.stad ? `, ${b.stad}` : ''}
              </div>
            )}

            <div className="flex gap-2 mt-1 flex-wrap">
              <a href={buildOffertUrl(b)} className="inline-flex items-center py-1.5 px-3.5 rounded-md text-[0.8125rem] font-semibold no-underline font-heading bg-primary-500 text-white transition-colors duration-200 hover:bg-primary-600">
                Offerte aanvragen
              </a>
              <a href={`/hoveniers/${b.slug}`} className="inline-flex items-center py-1.5 px-3.5 rounded-md text-[0.8125rem] font-semibold no-underline font-heading bg-transparent border border-border text-charcoal-light transition-colors duration-200 hover:border-border-hover hover:bg-canvas-alt hover:text-charcoal">
                Bekijk profiel
              </a>
              {b.website && (
                <a
                  href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 py-1.5 px-3 rounded-md text-[0.8125rem] font-semibold no-underline font-heading bg-transparent border border-border text-charcoal-muted transition-colors duration-200 hover:border-border-hover hover:bg-canvas-alt hover:text-charcoal"
                  aria-label={`Website van ${b.naam}`}
                >
                  Website
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-5 p-8 bg-canvas-alt border border-border rounded-lg flex-wrap">
        <p className="m-0 text-[0.9375rem] text-charcoal-light flex-1 min-w-[180px]">Niet gevonden wat je zoekt?</p>
        <a
          href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}&stad=${encodeURIComponent(stadSlug)}`}
          className="inline-flex items-center gap-1 py-3 px-6 bg-primary-500 text-white rounded-md font-heading font-bold no-underline whitespace-nowrap transition-colors duration-200 hover:bg-primary-600"
        >
          Ontvang 3 gratis offertes
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default ZoekResultaten
