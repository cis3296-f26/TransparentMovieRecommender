import { useState } from 'react'
import styles from './RecommendationBreakdown.module.css'

// Component to display the breakdown of recommendations
function RecommendationBreakdown({breakdown = []}) {
  // State to toggle the visibility of the breakdown
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  // Check if the breakdown is empty and return null if it is
  if (!breakdown || breakdown.length === 0) {
      return null
    }
    
  // Render the breakdown of recommendations
  return (
    <div className={styles.breakdown}>
      <button 
        type="button" 
        className={styles.toggleButton} 
        onClick={() => setShowBreakdown(!showBreakdown)}
        aria-expanded={showBreakdown}
        > 
        {showBreakdown ? 'Hide Breakdown' : 'Why This Recommendation?'}
      </button>

      {showBreakdown && breakdown.map((item, index) => ( 
          // Render each item in the breakdown with its title, rating, and weight
          <div key={index} className={styles.breakdownItem}> 
            <span className={styles.movieTitle}>{item.title}</span>
            <span className={styles.movieRating}>Rated: {item.rating}</span>
            <span className={styles.movieWeight}>Weight: {item.weight}</span>
          </div>
        ))}
    </div>
  )
}
  
export default RecommendationBreakdown