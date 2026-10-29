// main searchbox component, + button that will call api endpoint once implemented.
import { useState } from 'react'
import styles from './SearchBox.module.css'

function SearchBox({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    onSearch(searchTerm.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder="Search for a movie title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Search
      </button>
    </form>
  )
}

export default SearchBox