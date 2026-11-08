import { useState, useEffect } from 'react'
import styles from './Recommendations.module.css'
import RecommendationBreakdown from './RecommendationBreakdown'

const REQUIRED_RATINGS = 5

function Recommendations({userRatings = {},}) {
  const ratedEntries = Object.entries(userRatings)
  const ratedCount = ratedEntries.length
  const ratingsNeeded = Math.max(0, REQUIRED_RATINGS - ratedCount)
  const hasEnoughRatings = ratedCount >= REQUIRED_RATINGS

  // Serialize { ratings: userRatings } when >= 5 ratings exist so any rating change triggers a refresh
  const requestPayload = hasEnoughRatings
    ? JSON.stringify({ ratings: userRatings })
    : null

  const [fetchState, setFetchState] = useState({
    key: null,
    items: [],
  })

  useEffect(() => {
    if (!requestPayload) {
      return
    }

    let isCancelled = false

    async function fetchRecommendations() {
      try {
        const res = await fetch('/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestPayload,
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch recommendations (${res.status})`)
        }
        
        const data = await res.json()

        if (!isCancelled) {
          setFetchState({
            key: requestPayload,
            items: data.recommendations || [], 
          })
        }
      } catch {
        if (!isCancelled) {
          setFetchState({
            key: requestPayload,
            items: [],
          })
        }
      }
    }

    fetchRecommendations()

    return () => {
      isCancelled = true
    }
  }, [requestPayload])

  // Determine the source of recommendations and loading state
  const isLoading = hasEnoughRatings && fetchState.key !== requestPayload
  const recommendationList = fetchState.items

  const progressPercent = Math.min(
    100,
    Math.round((ratedCount / REQUIRED_RATINGS) * 100)
  )

  return (
    <section
      className={styles.section}
      aria-labelledby="recommendations-heading"
    >
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 id="recommendations-heading" className={styles.heading}>
            Recommendations
          </h2>
          {!hasEnoughRatings ? (
            <span className={styles.statusBadge}>
              {ratingsNeeded} more {ratingsNeeded === 1 ? 'rating' : 'ratings'} needed ({REQUIRED_RATINGS} total)
            </span>
          ) : isLoading ? (
            <span className={styles.statusBadge}>Loading...</span>
          ) : (
            <span className={styles.countBadge}>
              {recommendationList.length}{' '}
              {recommendationList.length === 1
                ? 'recommendation'
                : 'recommendations'}
            </span>
          )}
        </div>
      </div>

      {!hasEnoughRatings && (
        <div className={styles.progressContainer}>
          <p className={styles.message}>
            Rate <strong>{ratingsNeeded}</strong> more{' '}
            {ratingsNeeded === 1 ? 'movie' : 'movies'} before recommendations
            are given ({ratedCount} of {REQUIRED_RATINGS} total ratings
            completed).
          </p>
          <div
            className={styles.progressBarTrack}
            role="progressbar"
            aria-valuenow={ratedCount}
            aria-valuemin={0}
            aria-valuemax={REQUIRED_RATINGS}
            aria-label="Ratings progress toward recommendations"
          >
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {hasEnoughRatings && isLoading && (
        <p className={styles.loadingMessage} role="status" aria-live="polite">
          Loading recommendations...
        </p>
      )}

      {hasEnoughRatings && !isLoading && recommendationList.length === 0 && (
        <p className={styles.emptyMessage} role="status" aria-live="polite">
          No recommendations found based on your current ratings. Try rating or
          updating more movies!
        </p>
      )}

      {hasEnoughRatings && !isLoading && recommendationList.length > 0 && (
        <ol className={styles.list}>
          {recommendationList.map((rec, index) => (
            <li key={rec.movieId} className={styles.item}>
              <div className={styles.movieInfo}>
                <span className={styles.rank}>#{index + 1}</span>
                <strong className={styles.title}>{rec.title}</strong>
              </div>
              <div className={styles.predictionBadge}>
                <span className={styles.predictionLabel}>Predicted Rating:</span>
                <span
                  className={styles.predictedValue}
                  aria-label={`Predicted rating ${rec.predicted_rating.toFixed(2)} out of 5`}
                >
                  ★ {rec.predicted_rating.toFixed(2)} / 5
                </span>
              </div>
              <RecommendationBreakdown breakdown={rec.breakdown} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Recommendations