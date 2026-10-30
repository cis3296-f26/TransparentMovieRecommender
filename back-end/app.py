from pathlib import Path
from flask import Flask, jsonify
import pandas as pd
import numpy as np

FRONTEND = Path(__file__).resolve().parent.parent / "front-end" / "dist"

app = Flask(__name__, static_folder=str(FRONTEND), static_url_path="")

@app.route("/")
def index():
    return app.send_static_file("index.html")

# pandas loads MovieLens CSVs
ratings = pd.read_csv("data/ratings.csv")   
movies = pd.read_csv("data/movies.csv")    

# flask creates an HTTP endpoint that returns a JSON with statistics for a given movie
@app.route("/movie/<int:movie_id>")
def movie(movie_id):
    # pandas filters every rating users gave to the given movie
    this_movie = ratings[ratings.movieId == movie_id]

    if this_movie.empty:
        return jsonify({"error": "movieId not found"}), 404

    title = movies[movies.movieId == movie_id].title.iloc[0]

    # numpy computes average rating and how many people rated the given movie
    return jsonify({
        "movieId": movie_id,
        "title": title,
        "average_rating": float(np.mean(this_movie.rating)),
        "num_ratings": int(np.size(this_movie.rating)),
    })


if __name__ == "__main__":
    app.run()