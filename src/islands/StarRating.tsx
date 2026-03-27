import type { FC } from 'react'

interface Props {
  score: number
  className?: string
}

const StarRating: FC<Props> = ({ score, className = '' }) => {
  const rounded = Math.round(score)
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${score} van 5 sterren`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < rounded ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={i < rounded ? 'text-[#f59e0b]' : 'text-border-hover'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

export default StarRating
