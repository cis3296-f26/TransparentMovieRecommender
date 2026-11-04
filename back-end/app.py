from pathlib import Path
from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from MovieCatalog import MovieCatalog

FRONTEND = Path(__file__).resolve().parent.parent / "front-end" / "dist"

from recommender import CollaborativeFilter

app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")

@app.route("/")
def index():
    return app.send_static_file("index.html")

# pandas loads MovieLens CSVs
ratings = pd.read_csv("data/ratings.csv")   
movies = MovieCatalog(pd.read_csv("data/movies.csv"), ratings)

cf = CollaborativeFilter(ratings)

# flask creates an HTTP endpoint that returns a JSON with statistics for a given movie
@app.route("/movie/<int:movie_id>")
def movie(movie_id):
    # pandas filters every rating users gave to the given movie
    this_movie = ratings[ratings.movieId == movie_id]

    if this_movie.empty:
        return jsonify({"error": "movieId not found"}), 404

    title = movies.title(movie_id)

    # numpy computes average rating and how many people rated the given movie
    return jsonify({
        "movieId": movie_id,
        "title": title,
        "average_rating": float(np.mean(this_movie.rating)),
        "num_ratings": int(np.size(this_movie.rating)),
    })

# flask creates an HTTP endpoint that returns up to 10 movies whose title matches ?q=
@app.route("/search")
def search():
    query = request.args.get("q", "")
    results = movies.search_titles(query)
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


if __name__ == "__main__":
    app.run()