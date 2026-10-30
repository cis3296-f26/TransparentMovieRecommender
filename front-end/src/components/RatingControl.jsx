import { useState, useEffect } from 'react'
import styles from './RatingControl.module.css'

export const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

function StarIcon({ fillLevel }) {
  // fillLevel: 0 (empty), 0.5 (half), 1 (full)
  if (fillLevel === 1) {
    return (
      <svg className={styles.starSvg} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>
    )
  }
  if (fillLevel === 0.5) {
    return (
      <svg className={styles.starSvg} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
        <path
          fill="currentColor"
          d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2z"
        />
      </svg>
    )
  }
  return (
    <svg className={styles.starSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  )
}

function RatingControl({ movieId, movieTitle, currentRating, onRate }) {
  const [selectedValue, setSelectedValue] = useState(
    currentRating !== undefined ? String(currentRating) : ''
  )
  const [hoverRating, setHoverRating] = useState(null)

  useEffect(() => {
    setSelectedValue(currentRating !== undefined ? String(currentRating) : '')
  }, [currentRating])

  const displayRating =
    hoverRating !== null
      ? hoverRating
      : selectedValue !== ''
      ? parseFloat(selectedValue)
      : 0

  const handleSelectChange = (e) => {
    const val = e.target.value
    setSelectedValue(val)
    if (val !== '') {
      onRate(movieId, parseFloat(val))
    }
  }

  const handleStepClick = (val) => {
    setSelectedValue(String(val))
    onRate(movieId, val)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const numericVal = selectedValue !== '' ? parseFloat(selectedValue) : 5
    setSelectedValue(String(numericVal))
    onRate(movieId, numericVal)
  }

  return (
    <form className={styles.ratingContainer} onSubmit={handleFormSubmit}>
      <div
        className={styles.starsWrapper}
        onMouseLeave={() => setHoverRating(null)}
        role="group"
        aria-label={`Star rating for ${movieTitle}`}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const leftVal = starIndex - 0.5
          const rightVal = starIndex
          let fillLevel = 0
          if (displayRating >= rightVal) {
            fillLevel = 1
          } else if (displayRating >= leftVal) {
            fillLevel = 0.5
          }

          return (
            <div key={starIndex} className={styles.starItem}>
              <button
                type="button"
                className={`${styles.halfHitbox} ${styles.leftHalf}`}
                onMouseEnter={() => setHoverRating(leftVal)}
                onClick={() => handleStepClick(leftVal)}
                aria-label={`Rate ${movieTitle} ${leftVal} out of 5`}
                title={`${leftVal} stars`}
              />
              <button
                type="button"
                className={`${styles.halfHitbox} ${styles.rightHalf}`}
                onMouseEnter={() => setHoverRating(rightVal)}
                onClick={() => handleStepClick(rightVal)}
                aria-label={`Rate ${movieTitle} ${rightVal} out of 5`}
                title={`${rightVal} stars`}
              />
              <StarIcon fillLevel={fillLevel} />
            </div>
          )
        })}
      </div>

      <div className={styles.controlsRow}>
        <label className={styles.selectLabel} htmlFor={`rating-select-${movieId}`}>
          Rating:
        </label>
        <select
          id={`rating-select-${movieId}`}
          className={styles.select}
          value={selectedValue}
          onChange={handleSelectChange}
          aria-label={`Select rating for ${movieTitle}`}
        >
          <option value="">-- 0.5 to 5 --</option>
          {RATING_STEPS.map((step) => (
            <option key={step} value={String(step)}>
              {step.toFixed(1)} ★
            </option>
          ))}
        </select>
        <button type="submit" className={styles.rateBtn}>
          {currentRating !== undefined ? 'Update' : 'Rate'}
        </button>
      </div>
    </form>
  )
}

export default RatingControl
