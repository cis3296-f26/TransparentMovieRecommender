import { useState } from 'react'
import SearchBox from './components/SearchBox'
import MovieList from './components/MovieList'
import RatedMovies from './components/RatedMovies'
import './App.css'

function App() {
  const [movies, setMovies] = useState(null)
  //stores { [movieId]: ratingFloat } where rating is 0.5 to 5.0 in 0.5 increments.
  //rating the same movie again overwrites its entry and keeps the newest rating.
  const [userRatings, setUserRatings] = useState({})
  const [movieCatalog, setMovieCatalog] = useState({})

  const handleSearch = async (searchTerm) => {
    const query = (searchTerm || '').trim()
    if (!query) {
      return
    }

    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')

      const backendResults = await res.json()

      const normalizedMovies = backendResults.map((item) => {
        // Separate trailing (YYYY) from title to avoid duplicate year display
        const yearMatch = item.title.match(/\s*\((\d{4})\)$/)
        const year = yearMatch ? parseInt(yearMatch[1], 10) : 'N/A'
        const cleanTitle = item.title.replace(/\s*\(\d{4}\)$/, '')

        return {
          id: item.movieId,
          title: cleanTitle,
          year: year,
          genre: 'N/A',
          rating: item.average_rating ? item.average_rating.toFixed(1) : 'N/A',
          numRatings: item.num_ratings,
          overview: item.overview || 'Overview not available',
        }
      })

      setMovies(normalizedMovies)
    } catch (err) {
      console.error('Error fetching search results:', err)
      setMovies([])
    }
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