"""Search movies by title. Used by the GET /search endpoint in app.py."""

class MovieCatalog:
    def __init__(self, movies, ratings):
        # How many ratings each movie has, e.g. {2571: 278, 6365: 96, ...}
        rating_counts = ratings["movieId"].value_counts().to_dict()


        self.movies = [] # List of movies with their IDs, readable titles, and number of ratings
        self.titles = {} # Dictionary mapping movie IDs to readable titles

        # Populate self.movies and self.titles with movie information
        for movie_id, title in zip(movies["movieId"], movies["title"]):
            self.titles[int(movie_id)] = self._readable_title(title)
            self.movies.append({
                "movieId": int(movie_id),
                "readable_title": self._readable_title(title),
                "num_ratings": int(rating_counts.get(movie_id, 0)),
            })

        # Sort movies by number of ratings (descending) and then by title (ascending)
        self.movies.sort(key=lambda movie: (-movie["num_ratings"], movie["readable_title"]))

    # MovieLens stores "The Matrix" as "Matrix, The (1999)".
    # This moves "The", "A" or "An" back to the front so searches match.
    @staticmethod
    def _readable_title(title):
        for article in ["The", "A", "An"]:
            marker = ", " + article + " ("
            if marker in title:
                name, rest = title.split(marker, 1)
                return article + " " + name + " (" + rest
        return title
    
    # Returns the readable title for a given movie ID, or None if not found.
    def title(self, movie_id):
        return self.titles[movie_id]

    # Finds up to `limit` movies whose title contains `query`, most-rated first.
    def search_titles(self, query, limit=10):
        query = (query or "").strip().lower()
        if query == "":
            return []

        results = []
        for movie in self.movies:
            if query in movie["readable_title"].lower():
                results.append({
                    "movieId": movie["movieId"],
                    "title": movie["readable_title"],
                    "num_ratings": movie["num_ratings"],
                })
            if len(results) == limit:
                break
        return results