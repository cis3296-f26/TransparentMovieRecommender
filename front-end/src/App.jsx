import { useState } from 'react'
import SearchBox from './components/SearchBox'
import MovieList from './components/MovieList'
import { TEST_MOVIES } from './sampleMovieList.js'
import './App.css'

function App() {
  const [movies, setMovies] = useState([])

  const handleSearch = () => {
    // this needs to be eddited to handle proper search once api is created, currently just displays sample information.
    setMovies(TEST_MOVIES)
  }

  return (
    <main className="container">
      <h1>Transparent Movie Recommender</h1>
      <SearchBox onSearch={handleSearch} />
      <MovieList movies={movies} />
    </main>
  )
}

export default App