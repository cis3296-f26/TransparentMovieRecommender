import styles from './RecommendationBreakdown.module.css'

// Component to display the breakdown of recommendations
function RecommendationBreakdown({breakdown = []}) {
    if (!breakdown || breakdown.length === 0) {
        return null
      }
      
      // Render the breakdown of recommendations
      return (
        <div className={styles.breakdown}>
          {breakdown.map((item, index) => ( 
            // Render each item in the breakdown
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