// movie list component that displays a list of movies with their details and allows users to rate them
import styles from './MovieList.module.css'
import RatingControl from './RatingControl'

function MovieList({ movies, userRatings = {}, onRateMovie }) {
  if (!movies) {
    return <p className={styles.empty}>Search for a movie.</p>
  }

  if (movies.length === 0) {
    return <p className={styles.empty}>No movies found.</p>
  }

  return (
    <ul className={styles.list}>
      {movies.map((movie) => {
        const userRating = userRatings[movie.id]
        return (
          <li key={movie.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.title}>{movie.title}</h3>
              <span className={styles.year}>{movie.year}</span>
            </div>
            <p className={styles.overview}>{movie.overview}</p>
            <div className={styles.meta}>
              <span className={styles.genre}>{movie.genre}</span>
              <div className={styles.ratingBadges}>
                <span className={styles.rating} title="Community Rating">
                  ★ {movie.rating}
                </span>
                {userRating !== undefined && (
                  <span className={styles.userRatingBadge}>
                    Your Rating: ★ {userRating.toFixed(1)} / 5
                  </span>
                )}
              </div>
            </div>
            {onRateMovie && (
              <RatingControl
                movieId={movie.id}
                movieTitle={movie.title}
                currentRating={userRating}
                onRate={onRateMovie}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MovieList