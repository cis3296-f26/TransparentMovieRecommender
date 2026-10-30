import { useState } from 'react'
import SearchBox from './components/SearchBox'
import MovieList from './components/MovieList'
import RatedMovies from './components/RatedMovies'
import { TEST_MOVIES } from './sampleMovieList.js'
import './App.css'

function App() {
  const [movies, setMovies] = useState(TEST_MOVIES)
  //stores { [movieId]: ratingFloat } where rating is 0.5 to 5.0 in 0.5 increments.
  //rating the same movie again overwrites its entry and keeps the newest rating.
  const [userRatings, setUserRatings] = useState({})
  const [movieCatalog, setMovieCatalog] = useState(() => {
    const map = {}
    TEST_MOVIES.forEach((m) => {
      map[m.id] = m
    })
    return map
  })

  const handleSearch = (searchTerm) => {
    const query = (searchTerm || '').trim().toLowerCase()
    if (!query) {
      setMovies(TEST_MOVIES)
      return
    }
    const filtered = TEST_MOVIES.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query) ||
        String(movie.year).includes(query)
    )
    //fallback to TEST_MOVIES if sample search term doesn't match specific titles
    setMovies(filtered.length > 0 ? filtered : TEST_MOVIES)
  }

  const handleRateMovie = (movieId, ratingValue) => {
    const numericRating = Number(ratingValue)
    if (
      Number.isNaN(numericRating) ||
      numericRating < 0.5 ||
      numericRating > 5 ||
      Math.round(numericRating * 2) !== numericRating * 2
    ) {
      return
    }

    const foundMovie = movies.find((m) => m.id === movieId)
    if (foundMovie) {
      setMovieCatalog((prev) => ({ ...prev, [movieId]: foundMovie }))
    }

    setUserRatings((prev) => {
      const next = { ...prev }
      //deleting first and re-inserting updates insertion order so newest rating is kept
      delete next[movieId]
      next[movieId] = numericRating
      return next
    })
  }

  const handleRemoveRating = (movieId) => {
    setUserRatings((prev) => {
      const next = { ...prev }
      delete next[movieId]
      return next
    })
  }

  const handleClearAllRatings = () => {
    setUserRatings({})
  }

  const ratedMoviesList = Object.entries(userRatings)
    .map(([id, userRating]) => {
      const numericId = Number(id)
      const movie = movieCatalog[numericId]
      return movie ? { ...movie, userRating } : null
    })
    .filter(Boolean)

  return (
    <main className="container">
      <h1>Transparent Movie Recommender</h1>
      <p className="subtitle">
        Search and rate movies from 0.5 to 5 stars (in 0.5 increments) to build your rating profile.
      </p>

      <SearchBox onSearch={handleSearch} />

      <RatedMovies
        ratedMovies={ratedMoviesList}
        onRateMovie={handleRateMovie}
        onRemoveRating={handleRemoveRating}
        onClearAll={handleClearAllRatings}
      />

      <section className="moviesSection" aria-labelledby="movies-to-rate-heading">
        <div className="sectionHeader">
          <h2 id="movies-to-rate-heading">Movies to Rate</h2>
          {movies.length < TEST_MOVIES.length && (
            <button
              type="button"
              className="resetFilterBtn"
              onClick={() => setMovies(TEST_MOVIES)}
            >
              Show All Movies ({TEST_MOVIES.length})
            </button>
          )}
        </div>
        <MovieList
          movies={movies}
          userRatings={userRatings}
          onRateMovie={handleRateMovie}
        />
      </section>
    </main>
  )
}

export default App