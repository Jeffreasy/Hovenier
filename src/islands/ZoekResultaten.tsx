import { useState, useEffect, type FC } from 'react'

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
  stad:     string   // display naam van de stad
  stadSlug: string   // slug voor URL
}

const CATEGORIE_LABELS: Record<string, string> = {
  'Tuin': 'Tuin',
  'Tuin- en landschapaannemer': 'Tuinaannemer',
  'Tuin- en landschapsaannemer': 'Tuinaannemer',
  'Hoveniersbedrijf': 'Hovenier',
  'Hovenier': 'Hovenier',
  'Landschapsarchitect': 'Landschapsarchitect',
  'Boomverzorging': 'Boomverzorging',
  'Boomverzorgingsdienst': 'Boomverzorging',
  'Tuinaannemer': 'Tuinaannemer',
  'Tuinonderhoud': 'Tuinonderhoud',
}

const ZoekResultaten: FC<Props> = ({ postcode, dienst, stad, stadSlug }) => {
  const [bedrijven, setBedrijven] = useState<Bedrijf[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const convexUrl = (import.meta as Record<string, any>).env?.PUBLIC_CONVEX_URL ?? ''
    if (!convexUrl) { setLoading(false); return }

    // Als stad bekend: zoek per stad. Anders: top nationaal als fallback
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

  function buildOffertUrl(b: Bedrijf): string {
    const p = new URLSearchParams({ postcode, dienst, stad: stadSlug })
    return `/offerte?${p.toString()}`
  }

  if (loading) return (
    <div className="zr-wrapper">
      <div className="zr-header">
        <div className="zr-skeleton zr-skeleton--title" />
      </div>
      <div className="zr-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="zr-card zr-card--skeleton" aria-hidden="true" />
        ))}
      </div>
      <style>{styles}</style>
    </div>
  )

  if (error || bedrijven.length === 0) return (
    <div className="zr-wrapper">
      <div className="zr-empty">
        <div className="zr-empty-icon" aria-hidden="true">🔍</div>
        <h2>Geen hoveniers gevonden{stad ? ` in ${stad}` : ''}</h2>
        <p>Vraag een algemene offerte aan. We koppelen je aan hoveniers in jouw regio.</p>
        <a href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}`} className="zr-cta-btn">
          Vraag gratis offerte aan →
        </a>
      </div>
      <style>{styles}</style>
    </div>
  )

  return (
    <div className="zr-wrapper">
      <div className="zr-header">
        <div>
          <h1 className="zr-title">
            {stad ? `Hoveniers in ${stad}` : 'Populaire hoveniers in Nederland'}
          </h1>
          <p className="zr-subtitle">
            {bedrijven.length} {stad ? `hoveniersbedrijven gevonden` : `topbedrijven geselecteerd`}, gesorteerd op Google score
          </p>
        </div>
        <a
          href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}&stad=${encodeURIComponent(stadSlug)}`}
          className="zr-algemeen-btn"
        >
          Vraag algemene offerte aan
        </a>
      </div>

      <ul className="zr-grid" role="list">
        {bedrijven.map((b, i) => (
          <li key={b._id} className="zr-card" role="listitem">
            {/* Rank badge voor top 3 */}
            {i < 3 && (
              <div className="zr-rank" aria-label={`#${i + 1} hoogste score`}>
                #{i + 1}
              </div>
            )}

            <div className="zr-card-top">
              <div className="zr-naam">{b.naam}</div>
              {b.hoofdCategorie && (
                <span className="zr-badge">
                  {CATEGORIE_LABELS[b.hoofdCategorie] ?? b.hoofdCategorie}
                </span>
              )}
            </div>

            <div className="zr-score-row">
              {b.googleScore ? (
                <>
                  <span className="zr-stars" aria-hidden="true">
                    {'★'.repeat(Math.round(b.googleScore))}{'☆'.repeat(5 - Math.round(b.googleScore))}
                  </span>
                  <strong className="zr-score">{b.googleScore.toFixed(1)}</strong>
                  {b.aantalReviews && (
                    <span className="zr-reviews">({b.aantalReviews} reviews)</span>
                  )}
                </>
              ) : (
                <span className="zr-no-score">Nog geen reviews</span>
              )}
            </div>

            {b.postcode && (
              <div className="zr-meta">📍 {b.postcode}{b.stad ? ` · ${b.stad}` : ''}</div>
            )}

            <div className="zr-actions">
              <a href={buildOffertUrl(b)} className="zr-btn zr-btn--primary">
                Offerte aanvragen
              </a>
              <a href={`/hoveniers/${b.slug}`} className="zr-btn zr-btn--ghost">
                Bekijk profiel
              </a>
              {b.website && (
                <a
                  href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zr-btn zr-btn--ghost"
                  aria-label={`Website van ${b.naam}`}
                >
                  Website ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="zr-footer">
        <p>Niet gevonden wat je zoekt?</p>
        <a
          href={`/offerte?postcode=${encodeURIComponent(postcode)}&dienst=${encodeURIComponent(dienst)}&stad=${encodeURIComponent(stadSlug)}`}
          className="zr-cta-btn"
        >
          Ontvang 3 gratis offertes →
        </a>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .zr-wrapper {
    font-family: 'Inter', sans-serif;
    color: #EDF2EC;
    max-width: 1100px;
    margin: 0 auto;
  }

  .zr-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .zr-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: #EDF2EC;
    margin: 0 0 0.25rem;
  }

  .zr-subtitle {
    font-size: 0.875rem;
    color: rgba(237,242,236,0.45);
    margin: 0;
  }

  .zr-skeleton--title {
    height: 2rem;
    width: 280px;
    border-radius: 6px;
    background: rgba(255,255,255,0.08);
  }

  .zr-algemeen-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.25rem;
    border: 1px solid rgba(196,169,106,0.35);
    border-radius: 8px;
    color: #C4A96A;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out;
    white-space: nowrap;
  }
  .zr-algemeen-btn:hover {
    background: rgba(196,169,106,0.08);
    border-color: rgba(196,169,106,0.55);
  }

  .zr-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
    list-style: none;
    padding: 0;
    margin: 0 0 2.5rem;
  }

  @media (min-width: 640px) {
    .zr-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 1024px) {
    .zr-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .zr-card {
    position: relative;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out;
  }
  .zr-card:hover {
    border-color: rgba(196,169,106,0.30);
    background: rgba(255,255,255,0.07);
    transform: translateY(-2px);
  }

  .zr-card--skeleton {
    height: 180px;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: zr-shimmer 1.4s infinite;
  }
  @keyframes zr-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .zr-rank {
    position: absolute;
    top: 0.875rem;
    right: 0.875rem;
    background: rgba(196,169,106,0.15);
    border: 1px solid rgba(196,169,106,0.30);
    color: #C4A96A;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 99px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 0.04em;
  }

  .zr-card-top {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-right: 2.5rem; /* ruimte voor rank badge */
  }

  .zr-naam {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #EDF2EC;
    line-height: 1.3;
  }

  .zr-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 0.18rem 0.6rem;
    background: rgba(110,158,101,0.12);
    border: 1px solid rgba(110,158,101,0.25);
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(110,158,101,0.85);
    letter-spacing: 0.03em;
  }

  .zr-score-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
  }

  .zr-stars { color: #C4A96A; letter-spacing: -1px; }
  .zr-score { color: #C4A96A; font-weight: 700; }
  .zr-reviews { color: rgba(237,242,236,0.35); }
  .zr-no-score { color: rgba(237,242,236,0.28); font-style: italic; }

  .zr-meta {
    font-size: 0.8rem;
    color: rgba(237,242,236,0.38);
  }

  .zr-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .zr-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.875rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out;
  }
  .zr-btn--primary { background: #C4A96A; color: #1C1400; }
  .zr-btn--primary:hover { background: #A88B4A; }
  .zr-btn--ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(237,242,236,0.55);
  }
  .zr-btn--ghost:hover {
    border-color: rgba(255,255,255,0.25);
    color: rgba(237,242,236,0.85);
  }

  .zr-footer {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 2rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .zr-footer p {
    margin: 0;
    font-size: 0.9375rem;
    color: rgba(237,242,236,0.55);
    flex: 1;
    min-width: 180px;
  }

  .zr-cta-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #C4A96A;
    color: #1C1400;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 0.15s ease-out;
  }
  .zr-cta-btn:hover { background: #A88B4A; }

  .zr-empty {
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .zr-empty-icon { font-size: 3rem; }
  .zr-empty h2 { font-family: 'Plus Jakarta Sans', sans-serif; color: #EDF2EC; margin: 0; }
  .zr-empty p { color: rgba(237,242,236,0.50); margin: 0; max-width: 400px; }

  @media (prefers-reduced-motion: reduce) {
    .zr-card--skeleton { animation: none; }
    .zr-card, .zr-btn, .zr-algemeen-btn, .zr-cta-btn { transition: none; }
  }
`

export default ZoekResultaten
