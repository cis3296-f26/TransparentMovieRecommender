import pandas as pd
from MovieCatalog import MovieCatalog

# Fake movies, stored the way MovieLens stores them
TEST_MOVIES = pd.DataFrame([(1, "Matrix, The (1999)"),
                            (2, "Toy Story (1995)"),
                            (3, "Toy Story 2 (1999)")],
                           columns=["movieId", "title"])

# Fake ratings: movie 1 has 3 ratings, movie 2 has 2, movie 3 has 1
TEST_RATINGS = pd.DataFrame([(1, 1, 5.0), (2, 1, 4.0), (3, 1, 4.5),
                             (1, 2, 3.0), (2, 2, 4.0),
                             (1, 3, 2.0)],
                            columns=["userId", "movieId", "rating"])

CATALOG = MovieCatalog(TEST_MOVIES, TEST_RATINGS)


# Return just the movie IDs from a list of search results.
def ids(results):
    return [movie["movieId"] for movie in results]


# Test that an empty search returns no results.
def test_search_empty_query_returns_nothing():
    assert CATALOG.search_titles("") == [], "An empty query should return nothing."

# Test that spaces around the query are ignored.
def test_search_ignores_surrounding_spaces():
    assert ids(CATALOG.search_titles("  matrix  ")) == [1], "Spaces around the query should be trimmed."

# Test that upper and lower case don't matter.
def test_search_ignores_case():
    assert ids(CATALOG.search_titles("MATRIX")) == [1], "Search should not care about case."

# Test that the query can match the middle of a title.
def test_search_matches_anywhere_in_title():
    assert ids(CATALOG.search_titles("atrix")) == [1], "Search should match part of a word."

# Test that 'Matrix, The (1999)' is searchable and shown as 'The Matrix (1999)'.
def test_search_moves_article_to_front():
    results = CATALOG.search_titles("the matrix")
    assert ids(results) == [1], "'the matrix' should find movie 1."
    assert results[0]["title"] == "The Matrix (1999)", "The title should have 'The' moved to the front."

# Test that a search with no matches returns an empty list.
def test_search_no_match_returns_nothing():
    assert CATALOG.search_titles("zzzz") == [], "A query that matches nothing should return nothing."

# Test that results are sorted by number of ratings, most first.
def test_search_most_rated_first():
    assert ids(CATALOG.search_titles("toy story")) == [2, 3], "Movie 2 has more ratings than movie 3, so it comes first."

# Test that each result has exactly movieId, title, and num_ratings.
def test_search_result_fields():
    result = CATALOG.search_titles("matrix")[0]
    assert set(result.keys()) == {"movieId", "title", "num_ratings"}, "Each result should have movieId, title, and num_ratings."
    assert result["num_ratings"] == 3, "Movie 1 has 3 ratings."

# Test that no more than `limit` results are returned.
def test_search_stops_at_limit():
    assert len(CATALOG.search_titles("toy", limit=1)) == 1, "Only 1 result should come back when limit=1."