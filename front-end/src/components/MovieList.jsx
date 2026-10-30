// movie is entered as a list, please look at sampleMovieList.js for an example,
import styles from './MovieList.module.css'

function MovieList({ movies }) {
  if (!movies || movies.length === 0) {
    return <p className={styles.empty}>No movies found.</p>
  }

  return (
    <ul className={styles.list}>
      {movies.map((movie) => (
        <li key={movie.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>{movie.title}</h3>
            <span className={styles.year}>{movie.year}</span>
          </div>
          <p className={styles.overview}>{movie.overview}</p>
          <div className={styles.meta}>
            <span className={styles.genre}>{movie.genre}</span>
            <span className={styles.rating}>★ {movie.rating}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default MovieList