import { useState, useEffect, type FC } from 'react'
import StarRating from './StarRating'
import { CATEGORIE_LABELS, type Bedrijf } from '../lib/types'

interface Props {
  stad:   string
  slug:   string
  limit?: number
}

const BedrijvenLijst: FC<Props> = ({ stad, slug, limit = 6 }) => {
  const [bedrijven, setBedrijven] = useState<Bedrijf[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL ?? ''
    if (!convexUrl) { setLoading(false); return }

    fetch(`${convexUrl}/api/query`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path:   'bedrijven:getByStad',
        args:   { stad, limit },
        format: 'json',
      }),
    })
      .then((r) => r.json())
      .then(({ value }) => { setBedrijven(value ?? []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [stad, limit])

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-[130px] rounded-lg bg-canvas-muted animate-pulse" aria-hidden="true" />
      ))}
    </div>
  )

  if (error || bedrijven.length === 0) return null

  return (
    <div className="font-body text-charcoal">
      <h2 className="font-heading text-[1.375rem] font-bold text-charcoal mb-1">Top hoveniers in {stad}</h2>
      <p className="text-sm text-charcoal-muted mb-5">
        Gesorteerd op Google-score, {bedrijven.length} bedrijven gevonden
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 mb-5" role="list">
        {bedrijven.map((b, i) => (
          <li key={b._id} className="relative bg-white border border-border rounded-lg p-4 flex flex-col gap-2 transition-colors duration-200 hover:border-border-hover hover:shadow-md">
            {i < 3 && (
              <div className="absolute top-3 right-3.5 bg-primary-50 border border-primary-200 text-primary-500 text-[0.65rem] font-bold py-0.5 px-2 rounded-full font-heading tracking-wide" aria-label={`#${i + 1}`}>
                #{i + 1}
              </div>
            )}

            <div className="flex flex-col gap-1 pr-9">
              <div className="font-heading text-[0.9375rem] font-bold text-charcoal leading-tight">{b.naam}</div>
              {b.hoofdCategorie && (
                <span className="inline-flex self-start py-0.5 px-2.5 bg-primary-50 border border-primary-200 rounded-full text-[0.68rem] font-semibold text-primary-700 tracking-wide">
                  {CATEGORIE_LABELS[b.hoofdCategorie] ?? b.hoofdCategorie}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[0.8rem]">
              {b.googleScore ? (
                <>
                  <StarRating score={b.googleScore} />
                  <strong className="text-charcoal font-bold">{b.googleScore.toFixed(1)}</strong>
                  {b.aantalReviews && (
                    <span className="text-charcoal-muted">({b.aantalReviews})</span>
                  )}
                </>
              ) : (
                <span className="text-[#94a3b8] text-[0.78rem] italic">Nog geen score</span>
              )}
            </div>

            {b.postcode && (
              <div className="text-[0.78rem] text-charcoal-muted flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {b.postcode}
              </div>
            )}

            <div className="flex gap-1.5 mt-1 flex-wrap">
              <a
                href={`/offerte?postcode=${encodeURIComponent(b.postcode ?? '')}&stad=${encodeURIComponent(slug)}`}
                className="inline-flex items-center py-1.5 px-3 rounded-md text-[0.78rem] font-semibold no-underline font-heading bg-primary-500 text-white transition-colors duration-200 hover:bg-primary-600"
              >
                Offerte aanvragen
              </a>
              <a href={`/hoveniers/${b.slug}`} className="inline-flex items-center py-1.5 px-3 rounded-md text-[0.78rem] font-semibold no-underline font-heading bg-transparent border border-border text-charcoal-light transition-colors duration-200 hover:border-border-hover hover:bg-canvas-alt hover:text-charcoal">
                Profiel
              </a>
              {b.googleMapsUrl && (
                <a
                  href={b.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 py-1.5 px-2.5 rounded-md text-[0.78rem] font-semibold no-underline font-heading bg-transparent border border-border text-charcoal-muted transition-colors duration-200 hover:border-border-hover hover:text-charcoal hover:bg-canvas-alt"
                  aria-label={`Google Maps - ${b.naam}`}
                >
                  Maps
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <a href={`/zoeken?stad=${encodeURIComponent(slug)}&dienst=&postcode=`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 no-underline font-heading transition-colors duration-150 hover:text-primary-600 hover:underline">
        Bekijk alle hoveniers in {stad}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  )
}

export default BedrijvenLijst
