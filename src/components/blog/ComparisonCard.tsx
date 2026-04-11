interface ComparisonItem {
  name: string;
  pros: string[];
  cons: string[];
  price?: string;
  rating?: number;
}

interface ComparisonCardProps {
  title: string;
  items: ComparisonItem[];
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div
      role="img"
      aria-label={`${rating} van 5 sterren`}
      style={{ display: "flex", gap: "0.125rem" }}
    >
      {Array.from({ length: full }, (_, i) => (
        <svg
          key={`f${i}`}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="var(--color-warning)"
        >
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.45.91-5.33L2.27 6.62l5.34-.78z" />
        </svg>
      ))}
      {half && (
        <svg width="16" height="16" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="var(--color-warning)" />
              <stop offset="50%" stopColor="var(--color-border)" />
            </linearGradient>
          </defs>
          <path
            d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.45.91-5.33L2.27 6.62l5.34-.78z"
            fill="url(#half-star)"
          />
        </svg>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <svg
          key={`e${i}`}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="var(--color-border)"
        >
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.45.91-5.33L2.27 6.62l5.34-.78z" />
        </svg>
      ))}
    </div>
  );
}

export default function ComparisonCard({ title, items }: ComparisonCardProps) {
  return (
    <div
      role="region"
      aria-label={title}
      style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
    >
      <h4
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--color-charcoal)",
          margin: "0 0 1rem 0",
        }}
      >
        {title}
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((item) => (
          <div
            key={item.name}
            style={{
              background: "var(--color-white)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-box)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              transition:
                "border-color 200ms ease-out, box-shadow 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-hover)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Header with name, price, rating */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <h5
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-charcoal)",
                    margin: 0,
                  }}
                >
                  {item.name}
                </h5>
                {item.price && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.125rem 0.625rem",
                      background: "var(--color-primary-50)",
                      border: "1px solid var(--color-primary-200)",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-primary-700)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.price}
                  </span>
                )}
              </div>
              {item.rating !== undefined && (
                <div style={{ marginTop: "0.375rem" }}>
                  <StarRating rating={item.rating} />
                </div>
              )}
            </div>

            {/* Pros */}
            {item.pros.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                {item.pros.map((pro) => (
                  <li
                    key={pro}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--color-charcoal-light)",
                      lineHeight: 1.5,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        flexShrink: 0,
                        marginTop: "0.1875rem",
                      }}
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="8" fill="var(--color-success-light)" />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke="var(--color-success)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            )}

            {/* Cons */}
            {item.cons.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                {item.cons.map((con) => (
                  <li
                    key={con}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--color-charcoal-light)",
                      lineHeight: 1.5,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        flexShrink: 0,
                        marginTop: "0.1875rem",
                      }}
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="8" fill="var(--color-error-light)" />
                      <path
                        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                        stroke="var(--color-error)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
