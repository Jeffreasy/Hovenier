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
  stad:   string  // display naam, bijv. "Amsterdam"
  slug:   string  // query key, bijv. "amsterdam"
  limit?: number
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
}

const BedrijvenLijst: FC<Props> = ({ stad, slug, limit = 6 }) => {
  const [bedrijven, setBedrijven] = useState<Bedrijf[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const convexUrl = (import.meta as Record<string, any>).env?.PUBLIC_CONVEX_URL ?? ''
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
    <div className="bl-grid">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bl-skeleton" aria-hidden="true" />
      ))}
      <style>{styles}</style>
    </div>
  )

  if (error || bedrijven.length === 0) return null

  return (
    <div className="bl-wrapper">
      <h2 className="bl-title">Top hoveniers in {stad}</h2>
      <p className="bl-subtitle">
        Gesorteerd op Google-score, {bedrijven.length} bedrijven gevonden
      </p>

      <ul className="bl-grid" role="list">
        {bedrijven.map((b, i) => (
          <li key={b._id} className="bl-card">
            {/* Rank badge voor top 3 */}
            {i < 3 && <div className="bl-rank" aria-label={`#${i + 1}`}>#{i + 1}</div>}

            <div className="bl-card-top">
              <div className="bl-naam">{b.naam}</div>
              {b.hoofdCategorie && (
                <span className="bl-badge">
                  {CATEGORIE_LABELS[b.hoofdCategorie] ?? b.hoofdCategorie}
                </span>
              )}
            </div>

            <div className="bl-score-row">
              {b.googleScore ? (
                <>
                  <span className="bl-stars" aria-hidden="true">
                    {'★'.repeat(Math.round(b.googleScore))}{'☆'.repeat(5 - Math.round(b.googleScore))}
                  </span>
                  <strong className="bl-score">{b.googleScore.toFixed(1)}</strong>
                  {b.aantalReviews && (
                    <span className="bl-reviews">({b.aantalReviews})</span>
                  )}
                </>
              ) : (
                <span className="bl-no-score">Nog geen score</span>
              )}
            </div>

            {b.postcode && <div className="bl-meta">📍 {b.postcode}</div>}

            <div className="bl-actions">
              <a
                href={`/offerte?postcode=${encodeURIComponent(b.postcode ?? '')}&stad=${encodeURIComponent(slug)}`}
                className="bl-btn bl-btn--primary"
              >
                Offerte aanvragen
              </a>
              <a href={`/hoveniers/${b.slug}`} className="bl-btn bl-btn--ghost">
                Profiel
              </a>
              {b.googleMapsUrl && (
                <a
                  href={b.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bl-btn bl-btn--icon"
                  aria-label={`Google Maps — ${b.naam}`}
                >
                  Maps ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <a href={`/zoeken?stad=${encodeURIComponent(slug)}&dienst=&postcode=`} className="bl-more">
        Bekijk alle hoveniers in {stad} →
      </a>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .bl-wrapper { font-family: 'Inter', sans-serif; color: #EDF2EC; }

  .bl-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.375rem;
    font-weight: 700;
    color: #EDF2EC;
    margin: 0 0 0.25rem;
  }
  .bl-subtitle {
    font-size: 0.875rem;
    color: rgba(237,242,236,0.40);
    margin: 0 0 1.25rem;
  }

  .bl-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem;
  }
  @media (min-width: 580px) {
    .bl-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .bl-skeleton {
    height: 130px;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: bl-shimmer 1.4s infinite;
  }
  @keyframes bl-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .bl-card {
    position: relative;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 1rem 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out, transform 0.15s ease-out;
  }
  .bl-card:hover {
    border-color: rgba(196,169,106,0.30);
    background: rgba(255,255,255,0.07);
    transform: translateY(-1px);
  }

  .bl-rank {
    position: absolute;
    top: 0.75rem;
    right: 0.875rem;
    background: rgba(196,169,106,0.15);
    border: 1px solid rgba(196,169,106,0.25);
    color: #C4A96A;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 99px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 0.04em;
  }

  .bl-card-top {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-right: 2.25rem;
  }

  .bl-naam {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #EDF2EC;
    line-height: 1.3;
  }

  .bl-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 0.15rem 0.55rem;
    background: rgba(110,158,101,0.10);
    border: 1px solid rgba(110,158,101,0.22);
    border-radius: 99px;
    font-size: 0.68rem;
    font-weight: 600;
    color: rgba(110,158,101,0.80);
    letter-spacing: 0.03em;
  }

  .bl-score-row {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
  }
  .bl-stars { color: #C4A96A; letter-spacing: -1px; }
  .bl-score { color: #C4A96A; font-weight: 700; }
  .bl-reviews { color: rgba(237,242,236,0.35); }
  .bl-no-score { color: rgba(237,242,236,0.28); font-size: 0.78rem; font-style: italic; }

  .bl-meta { font-size: 0.78rem; color: rgba(237,242,236,0.35); }

  .bl-actions {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .bl-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background-color 0.15s ease-out, border-color 0.15s ease-out;
  }
  .bl-btn--primary { background: #C4A96A; color: #1C1400; }
  .bl-btn--primary:hover { background: #A88B4A; }
  .bl-btn--ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(237,242,236,0.55);
  }
  .bl-btn--ghost:hover {
    border-color: rgba(255,255,255,0.25);
    color: rgba(237,242,236,0.85);
  }
  .bl-btn--icon {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.09);
    color: rgba(237,242,236,0.35);
    padding: 0.4rem 0.6rem;
  }
  .bl-btn--icon:hover {
    border-color: rgba(255,255,255,0.20);
    color: rgba(237,242,236,0.70);
  }

  .bl-more {
    display: inline-flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #C4A96A;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .bl-more:hover { text-decoration: underline; }

  @media (prefers-reduced-motion: reduce) {
    .bl-skeleton { animation: none; }
    .bl-card, .bl-btn { transition: none; }
  }
`

export default BedrijvenLijst
