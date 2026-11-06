import { useState, useEffect } from 'react'
import styles from './Recommendations.module.css'

const REQUIRED_RATINGS = 5
const MAX_RECOMMENDATIONS = 10

function Recommendations({
  userRatings = {},
  movieCatalog = {},
  recommendations: externalRecommendations,
  isLoading: externalIsLoading,
}) {
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
    if (!requestPayload || externalRecommendations !== undefined) {
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
        const rawList = Array.isArray(data?.recommendations)
          ? data.recommendations.slice(0, MAX_RECOMMENDATIONS)
          : []

        const resolvedItems = await Promise.all(
          rawList.map(async (item) => {
            const movieId = Number(item.movieId ?? item.id)
            const predictedRating = Number(
              item.predicted_rating ?? item.predictedRating ?? 0
            )

            if (item.title) {
              return {
                movieId,
                title: item.title,
                predictedRating,
              }
            }

            try {
              const movieRes = await fetch(`/movie/${movieId}`)
              if (movieRes.ok) {
                const movieData = await movieRes.json()
                if (movieData?.title) {
                  return {
                    movieId,
                    title: movieData.title,
                    predictedRating,
                  }
                }
              }
            } catch {
              // Ignore per-movie lookup error and fall back to local catalog or ID
            }

            return {
              movieId,
              title: `Movie #${movieId}`,
              predictedRating,
            }
          })
        )

        if (!isCancelled) {
          setFetchState({
            key: requestPayload,
            items: resolvedItems,
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
  }, [requestPayload, externalRecommendations])

  const isLoading =
    externalIsLoading !== undefined
      ? externalIsLoading
      : hasEnoughRatings &&
        externalRecommendations === undefined &&
        fetchState.key !== requestPayload

  const recommendationList = (
    externalRecommendations !== undefined
      ? externalRecommendations
      : fetchState.items
  )
    .slice(0, MAX_RECOMMENDATIONS)
    .map((item) => {
      const movieId = Number(item.movieId ?? item.id)
      const predictedRating = Number(
        item.predictedRating ?? item.predicted_rating ?? 0
      )
      const fallbackTitle =
        movieCatalog[movieId]?.title || `Movie #${movieId}`
      const title =
        item.title && item.title !== `Movie #${movieId}`
          ? item.title
          : fallbackTitle

      return {
        movieId,
        title,
        predictedRating,
      }
    })

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
                  aria-label={`Predicted rating ${rec.predictedRating.toFixed(2)} out of 5`}
                >
                  ★ {rec.predictedRating.toFixed(2)} / 5
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default Recommendations