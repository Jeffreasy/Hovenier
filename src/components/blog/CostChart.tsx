import { useEffect, useRef, useState } from "react";

interface CostItem {
  label: string;
  min: number;
  max: number;
  unit?: string;
}

interface CostChartProps {
  title: string;
  data: CostItem[];
  highlight?: string;
  source?: string;
}

export default function CostChart({
  title,
  data,
  highlight,
  source,
}: CostChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const globalMax = Math.max(...data.map((d) => d.max));

  const fmt = (value: number, unit?: string) => {
    const formatted = new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  };

  return (
    <div
      ref={containerRef}
      role="figure"
      aria-label={title}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-box)",
        padding: "1.5rem",
        marginTop: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <h4
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--color-charcoal)",
          margin: "0 0 1.25rem 0",
        }}
      >
        {title}
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {data.map((item, i) => {
          const isHighlighted = highlight === item.label;
          const minPct = (item.min / globalMax) * 100;
          const maxPct = (item.max / globalMax) * 100;

          return (
            <div
              key={item.label}
              role="group"
              aria-label={`${item.label}: ${fmt(item.min, item.unit)} tot ${fmt(item.max, item.unit)}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.375rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: isHighlighted ? 600 : 400,
                    color: isHighlighted
                      ? "var(--color-primary-600)"
                      : "var(--color-charcoal)",
                  }}
                >
                  {item.label}
                  {isHighlighted && (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "0.5rem",
                        padding: "0.125rem 0.5rem",
                        background: "var(--color-primary-50)",
                        border: "1px solid var(--color-primary-200)",
                        borderRadius: "9999px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-primary-700)",
                      }}
                    >
                      Voordeligst
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--color-charcoal-muted)",
                    whiteSpace: "nowrap",
                    marginLeft: "0.75rem",
                  }}
                >
                  {fmt(item.min, item.unit)} - {fmt(item.max, item.unit)}
                </span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  position: "relative",
                  height: "0.75rem",
                  background: "var(--color-canvas-muted)",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                {/* Range bar (min to max) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${minPct}%`,
                    width: visible ? `${maxPct - minPct}%` : "0%",
                    height: "100%",
                    background: isHighlighted
                      ? "var(--color-primary-500)"
                      : "var(--color-primary-200)",
                    borderRadius: "9999px",
                    transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms`,
                  }}
                />
                {/* Min bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: visible ? `${minPct}%` : "0%",
                    height: "100%",
                    background: isHighlighted
                      ? "var(--color-primary-300)"
                      : "var(--color-primary-100)",
                    borderRadius: "9999px 0 0 9999px",
                    transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {source && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-charcoal-muted)",
            marginTop: "1rem",
            marginBottom: 0,
            fontStyle: "italic",
          }}
        >
          Bron: {source}
        </p>
      )}
    </div>
  );
}
