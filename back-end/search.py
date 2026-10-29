"""Search movies by title. Used by the GET /search endpoint in app.py."""


# MovieLens stores "The Matrix" as "Matrix, The (1999)".
# This moves "The", "A" or "An" back to the front so searches match.
def readable_title(title):
    for article in ["The", "A", "An"]:
        marker = ", " + article + " ("
        if marker in title:
            name, rest = title.split(marker, 1)
            return article + " " + name + " (" + rest
    return title


# Finds up to `limit` movies whose title contains `query`, most-rated first.
def search_titles(movies, ratings, query, limit=10):
    query = (query or "").strip().lower()
    if query == "":
        return []

    # How many ratings each movie has, e.g. {2571: 278, 6365: 96, ...}
    rating_counts = ratings["movieId"].value_counts().to_dict()

    results = []
    for movie_id, title in zip(movies["movieId"], movies["title"]):
        if query in title.lower() or query in readable_title(title).lower():
            results.append({
                "movieId": int(movie_id),
                "title": title,
                "num_ratings": int(rating_counts.get(movie_id, 0)),
            })

    # Most ratings first; ties go in alphabetical order
    results.sort(key=lambda movie: (-movie["num_ratings"], movie["title"]))
    return results[:limit]