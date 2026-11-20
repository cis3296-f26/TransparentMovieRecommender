import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import SearchBox from './components/SearchBox'
import MovieList from './components/MovieList'
import RatedMovies from './components/RatedMovies'
import Recommendations from './components/Recommendations'
import './App.css'

const TRAILING_YEAR_REGEX = /\s*\((\d{4})\)$/
const MIN_RATING = 0.5
const MAX_RATING = 5

function isValidRating(value) {
  const num = Number(value)
  return (
    !Number.isNaN(num) &&
    num >= MIN_RATING &&
    num <= MAX_RATING &&
    Math.round(num * 2) === num * 2
  )
}

function normalizeMovie(item) {
  const rawTitle = item.title ?? ''
  const yearMatch = rawTitle.match(TRAILING_YEAR_REGEX)

  return {
    id: item.movieId,
    title: yearMatch ? rawTitle.replace(TRAILING_YEAR_REGEX, '') : rawTitle,
    year: yearMatch ? parseInt(yearMatch[1], 10) : 'N/A',
    genre: 'N/A',
    rating: 'N/A',
    numRatings: item.num_ratings,
    overview: 'Overview not available yet.',
  }
}

function App() {
  const [movies, setMovies] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Stores { [movieId]: ratingFloat } (0.5 to 5.0 in 0.5 increments)
  const [userRatings, setUserRatings] = useState({})
  // Explicitly tracks rating order because JS objects sort numeric keys ascending
  const [ratingOrder, setRatingOrder] = useState([])
  const [movieCatalog, setMovieCatalog] = useState({})

  const moviesRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  const handleSearch = useCallback(async (searchTerm) => {
    const query = (searchTerm || '').trim()
    if (!query) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsSearching(true)
    setSearchError(null)

    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`Search failed (${res.status})`)

      const backendResults = await res.json()
      const normalizedMovies = backendResults.map(normalizeMovie)

      moviesRef.current = normalizedMovies
      setMovies(normalizedMovies)
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Error fetching search results:', err)
      setSearchError('Could not load search results. Please try again.')
      moviesRef.current = []
      setMovies([])
    } finally {
      if (abortControllerRef.current === controller) {
        setIsSearching(false)
      }
    }
  }, [])

  const handleRateMovie = useCallback((movieId, ratingValue) => {
    if (!isValidRating(ratingValue)) return
    const numericRating = Number(ratingValue)

    const foundMovie = moviesRef.current?.find((m) => m.id === movieId)
    if (foundMovie) {
      setMovieCatalog((prev) =>
        prev[movieId] ? prev : { ...prev, [movieId]: foundMovie }
      )
    }

    setUserRatings((prev) => ({ ...prev, [movieId]: numericRating }))
    setRatingOrder((prev) => [...prev.filter((id) => id !== movieId), movieId])
  }, [])

  const handleRemoveRating = useCallback((movieId) => {
    setUserRatings((prev) => {
      if (!(movieId in prev)) return prev
      const { [movieId]: _, ...rest } = prev
      return rest
    })
    setRatingOrder((prev) => prev.filter((id) => id !== movieId))
  }, [])

  const handleClearAllRatings = useCallback(() => {
    setUserRatings({})
    setRatingOrder([])
  }, [])

  const ratedMoviesList = useMemo(
    () =>
      ratingOrder
        .map((id) => {
          const movie = movieCatalog[id]
          const userRating = userRatings[id]
          return movie && userRating !== undefined
            ? { ...movie, userRating }
            : null
        })
        .filter(Boolean),
    [ratingOrder, movieCatalog, userRatings]
  )

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

      <Recommendations
        userRatings={userRatings}
        movieCatalog={movieCatalog}
      />

      <section className="moviesSection" aria-labelledby="movies-to-rate-heading">
        <div className="sectionHeader">
          <h2 id="movies-to-rate-heading">Movies to Rate</h2>
        </div>

        {searchError && (
          <p className="errorMessage" role="alert">
            {searchError}
          </p>
        )}

        {isSearching ? (
          <p className="loadingMessage" role="status">
            Searching movies...
          </p>
        ) : (
          <MovieList
            movies={movies}
            userRatings={userRatings}
            onRateMovie={handleRateMovie}
          />
        )}
      </section>
    </main>
  )
}

export default App