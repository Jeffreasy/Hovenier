interface Step {
  title: string;
  description: string;
  tip?: string;
}

interface StepTimelineProps {
  title: string;
  steps: Step[];
}

export default function StepTimeline({ title, steps }: StepTimelineProps) {
  return (
    <div
      role="list"
      aria-label={title}
      style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}
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

      <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
        {/* Green connecting line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "0.9375rem",
            top: "1.25rem",
            bottom: "1.25rem",
            width: "2px",
            background:
              "linear-gradient(to bottom, var(--color-primary-300), var(--color-primary-100))",
            borderRadius: "9999px",
          }}
        />

        {steps.map((step, i) => (
          <div
            key={i}
            role="listitem"
            style={{
              position: "relative",
              paddingBottom: i < steps.length - 1 ? "1.5rem" : 0,
            }}
          >
            {/* Numbered circle */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-2.5rem",
                top: 0,
                width: "1.875rem",
                height: "1.875rem",
                borderRadius: "50%",
                background: "var(--color-primary-500)",
                color: "var(--color-white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8125rem",
                fontWeight: 700,
                fontFamily: "var(--font-heading)",
                boxShadow: "0 0 0 3px var(--color-white), 0 0 0 4px var(--color-primary-200)",
              }}
            >
              {i + 1}
            </div>

            {/* Content */}
            <div>
              <h5
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-charcoal)",
                  margin: "0 0 0.375rem 0",
                  lineHeight: 1.875,
                }}
              >
                {step.title}
              </h5>
              <p
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "var(--color-charcoal-light)",
                  margin: step.tip ? "0 0 0.75rem 0" : 0,
                }}
              >
                {step.description}
              </p>

              {/* Tip callout */}
              {step.tip && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.625rem",
                    padding: "0.75rem 1rem",
                    background: "var(--color-primary-50)",
                    border: "1px solid var(--color-primary-200)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                    color: "var(--color-primary-700)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: "0.125rem" }}
                    aria-hidden="true"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="var(--color-primary-400)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5v3M8 10.5v.5"
                      stroke="var(--color-primary-400)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>
                    <strong style={{ fontWeight: 600 }}>Tip:</strong> {step.tip}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
