import pytest
from app import app, movies

RATINGS = {20: 2.5, 10: 4.0}

def test_recommendations_endpoint():
    """Test that the /recommendations endpoint returns a successful response and includes recommendations."""
    with app.test_client() as client:
        response = client.post("/recommendations", json={"ratings": RATINGS})
        assert response.status_code == 200, "Request to /recommendations should succeed."
        assert response.get_json()["recommendations"], "Response should include recommendations."

def test_recommendations_include_breakdown():
    """Test that each recommendation includes a 'breakdown' key in the response."""
    with app.test_client() as client:
        response = client.post("/recommendations", json={"ratings": RATINGS})
        for recommendation in response.get_json()["recommendations"]:
            assert recommendation["breakdown"], "Each recommendation should include a breakdown of contributing movies."

def test_recommendations_breakdown_contents():
    """Test that the breakdown for each recommendation includes correct movie IDs, titles, and ratings, and that the weighted ratings sum to the predicted rating."""
    with app.test_client() as client:
        response = client.post("/recommendations", json={"ratings": RATINGS})
        for recommendation in response.get_json()["recommendations"]:
            breakdown = recommendation["breakdown"]
            for item in breakdown:
                assert item["movieId"] in RATINGS, "Breakdown should only include movies that were rated by the user."
                assert item["title"] == movies.title(item["movieId"]), "Breakdown should include the correct title for the rated movie."
                assert item["rating"] == RATINGS[item["movieId"]], "Breakdown should include the correct rating for the rated movie."
            weighted_ratings = sum(item["weight"] * item["rating"] for item in breakdown)
            assert weighted_ratings == pytest.approx(recommendation["predicted_rating"]), "Weighted ratings should sum to the predicted rating."
                        


