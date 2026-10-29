import numpy as np
import pandas as pd
import pytest
from recommender import CollaborativeFilter

TEST_RATINGS = pd.DataFrame([(1, 10, 5.0), (2, 10, 3.0), (1, 20, 3.0), (2, 20, 5.0), (1, 30, 4.0)],
                               columns=["userId", "movieId", "rating"])

def test_cutoff_filtering():
    """Test that movies with fewer than min_ratings are filtered out."""
    cf = CollaborativeFilter(TEST_RATINGS, min_ratings=2)
    assert list(cf._movie_vectors.index) == [10, 20], "Movies 10 and 20 have 2 ratings each; 30 has only 1."

def test_matrix_shape():
    """Test that the movie-user matrix has the correct shape and orientation."""
    cf = CollaborativeFilter(TEST_RATINGS, min_ratings=1)
    assert list(cf._movie_vectors.index) == [10, 20, 30], "Rows should be movies."
    assert list(cf._movie_vectors.columns) == [1, 2], "Columns should be users."

def test_normalization():
    """Test that the movie vectors are normalized to have magnitude 1."""
    cf = CollaborativeFilter(TEST_RATINGS, min_ratings=1)
    norms = np.linalg.norm(cf._movie_vectors.to_numpy(), axis=1)
    assert norms == pytest.approx(1), "All movie vectors should have magnitude 1."

def test_movie_vectors_are_correct():
    """Test that the movie vectors are correctly normalized."""
    cf = CollaborativeFilter(TEST_RATINGS, min_ratings=1)
    norm = np.sqrt(5**2 + 3**2)
    assert cf._movie_vectors.loc[10, 1] == pytest.approx(5 / norm), "Movie 10's entry for user 1 is incorrect."
    assert cf._movie_vectors.loc[10, 2] == pytest.approx(3 / norm), "Movie 10's entry for user 2 is incorrect."

def test_similarity_to_itself_is_1(): ...
def test_similarities_are_between_0_and_1(): ...
def test_matches_hand_worked_example(): ...  
def test_movies_below_cutoff_are_skipped(): ...
def test_one_row_per_requested_movie(): ...
