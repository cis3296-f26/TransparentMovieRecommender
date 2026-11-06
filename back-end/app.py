from pathlib import Path
from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
import requests
from MovieCatalog import MovieCatalog

# grabs apikey from env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
TMDB_API_KEY = os.environ.get("TMDB_API_KEY")

FRONTEND = Path(__file__).resolve().parent.parent / "front-end" / "dist"

from recommender import CollaborativeFilter

app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")

@app.route("/")
def index():
    return app.send_static_file("index.html")

# pandas loads MovieLens CSVs
ratings = pd.read_csv("data/ratings.csv")   
movies = MovieCatalog(pd.read_csv("data/movies.csv"), ratings)
# pandas gets TMDB id
links_df = pd.read_csv("data/links.csv", usecols=["movieId", "tmdbId"]).dropna()
movie_to_tmdb = dict(zip(links_df["movieId"].astype(int), links_df["tmdbId"].astype(int)))

cf = CollaborativeFilter(ratings)

# flask creates an HTTP endpoint that returns a JSON with statistics for a given movie
@app.route("/movie/<int:movie_id>")
def movie(movie_id):
    # pandas filters every rating users gave to the given movie
    this_movie = ratings[ratings.movieId == movie_id]

    if this_movie.empty:
        return jsonify({"error": "movieId not found"}), 404

    title = movies.title(movie_id)
    tmdb_id = movie_to_tmdb.get(movie_id)
    overview = fetch_tmdb_overview(tmdb_id)

    # numpy computes average rating and how many people rated the given movie
    return jsonify({
        "movieId": movie_id,
        "title": title,
        "average_rating": float(np.mean(this_movie.rating)),
        "num_ratings": int(np.size(this_movie.rating)),
        "overview": overview
    })

# flask creates an HTTP endpoint that returns up to 10 movies whose title matches ?q=
@app.route("/search")
def search():
  query = request.args.get("q", "")
  results = movies.search_titles(query)

  # Enrich the top matches with TMDB overview & average rating, instead of editing MovieCatalog.py
  for item in results:
    m_id = item["movieId"]
    tmdb_id = movie_to_tmdb.get(m_id)
    item["overview"] = fetch_tmdb_overview(tmdb_id)

    # Compute average rating
    movie_ratings = ratings[ratings.movieId == m_id]
    item["average_rating"] = (
        float(np.mean(movie_ratings.rating)) if not movie_ratings.empty else 0.0
    )

  return jsonify(results)

@app.route("/recommendations", methods=["POST"])
def recommendations():
    data = request.get_json()
    user_ratings = data["ratings"]

    converted_ratings = {}

    for movie_id, rating in user_ratings.items():
        converted_ratings[int(movie_id)] = float(rating)

    predictions = cf.recommend(converted_ratings, n=10)

    results = []

    for movie_id, rating in predictions.items():
        results.append({
            "movieId": int(movie_id),
            "predicted_rating": float(rating)
        })

    return jsonify({"recommendations": results})

def fetch_tmdb_overview(tmdb_id):
    if not TMDB_API_KEY or not tmdb_id:
        print("Failed early check: missing key or tmdb_id")
        return "Overview not available."

    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        print(f"TMDB Response status code: {response.status_code}")
        print(f"TMDB Response body: {response.text}")

        if response.status_code == 200:
            return response.json().get("overview") or "Overview not available."
    except requests.exceptions.RequestException as e:
        print(f"Request exception: {e}")

    return "Overview not available."


if __name__ == "__main__":
    app.run()