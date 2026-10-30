import styles from './RatedMovies.module.css'
import { RATING_STEPS } from './RatingControl'

function RatedMovies({ ratedMovies, onRateMovie, onRemoveRating, onClearAll }) {
  if (!ratedMovies || ratedMovies.length === 0) {
    return (
      <section className={styles.section} aria-labelledby="rated-movies-heading">
        <div className={styles.headerRow}>
          <h2 id="rated-movies-heading" className={styles.heading}>
            Rated Movies
          </h2>
          <span className={styles.countBadge}>0 rated</span>
        </div>
        <p className={styles.empty}>
          No movies rated yet. Rate any movie from 0.5 to 5 (in 0.5 increments) to see it listed here.
        </p>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-labelledby="rated-movies-heading">
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 id="rated-movies-heading" className={styles.heading}>
            Rated Movies
          </h2>
          <span className={styles.countBadge}>
            {ratedMovies.length} {ratedMovies.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>
        {onClearAll && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClearAll}
          >
            Clear All
          </button>
        )}
      </div>

      <ul className={styles.list}>
        {ratedMovies.map((movie) => (
          <li key={movie.id} className={styles.item}>
            <div className={styles.movieInfo}>
              <div className={styles.titleLine}>
                <strong className={styles.title}>{movie.title}</strong>
                <span className={styles.year}>({movie.year})</span>
              </div>
              <span className={styles.genre}>{movie.genre}</span>
            </div>

            <div className={styles.ratingActions}>
              <span className={styles.ratingValue} aria-label={`Rated ${movie.userRating} out of 5`}>
                ★ {movie.userRating.toFixed(1)} / 5
              </span>
              <select
                className={styles.quickSelect}
                value={String(movie.userRating)}
                onChange={(e) => onRateMovie(movie.id, parseFloat(e.target.value))}
                aria-label={`Update rating for ${movie.title}`}
              >
                {RATING_STEPS.map((step) => (
                  <option key={step} value={String(step)}>
                    {step.toFixed(1)} ★
                  </option>
                ))}
              </select>
              {onRemoveRating && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => onRemoveRating(movie.id)}
                  aria-label={`Remove rating for ${movie.title}`}
                  title="Remove rating"
                >
                  ✕
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RatedMovies
