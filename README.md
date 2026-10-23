# What's Next

What's Next is a web-based movie recommender that explains every suggestion it makes. Users rate movies they've seen, then choose between item-based collaborative filtering and content-based filtering to get a ranked list of recommendations. For each recommendation, the app shows which of the user's ratings contributed to it and lets them remove any rating's influence. No account or imported viewing history is required. Recommendations are built from the [MovieLens](https://grouplens.org/datasets/movielens/) dataset.

**Current status:** proof of concept. The app loads the MovieLens data and serves rating statistics for a given movie through a single endpoint. Recommendation features are in development.

Developed and tested on macOS 15.7.9 with Python 3.13.9. The Windows scripts were tested on Windows 11 with Python 3.13.

## Installation

You need Git installed. On macOS and Linux you also need Python 3. On Windows, the setup script installs Python for you if it's missing.

### macOS and Linux

1. Clone the repository and enter it:

   ```
   git clone https://github.com/cis3296-f26/TransparentMovieRecommender.git
   cd TransparentMovieRecommender
   ```

2. Create and activate a virtual environment:

   ```
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Download the MovieLens ml-latest-small dataset and move the files the app uses into `data/`:

   ```
   curl -O https://files.grouplens.org/datasets/movielens/ml-latest-small.zip
   unzip ml-latest-small.zip
   mkdir -p data
   mv ml-latest-small/ratings.csv ml-latest-small/movies.csv data/
   ```

### Windows (10 and 11)

1. Clone the repository:

   ```
   git clone https://github.com/cis3296-f26/TransparentMovieRecommender.git
   ```

2. Open the `TransparentMovieRecommender` folder and double-click `setup.bat`. It installs Python 3.13 with winget if Python is missing, creates the virtual environment, installs the dependencies, and downloads the MovieLens data into `data\`. Running it again skips any steps that are already done.

## Build

What's Next is written in Python, so there is no compile step. Installing the dependencies above is the full build.

## Run

### macOS and Linux

With the virtual environment active, start the server from the repository folder:

```
python poc.py
```

The server runs at http://127.0.0.1:5000. To check that it works, open http://127.0.0.1:5000/movie/2571 in a browser, or run this from a second terminal:

```
curl http://127.0.0.1:5000/movie/2571
```

It should return the title, average rating, and number of ratings for The Matrix:

```json
{
  "average_rating": 4.192446043165468,
  "movieId": 2571,
  "num_ratings": 278,
  "title": "Matrix, The (1999)"
}
```

While developing, start the server with `flask --app poc run --debug` instead to get automatic reloading and detailed error pages.

### Windows

Double-click `run.bat` in the repository folder. The server runs at http://127.0.0.1:5000, and you can check it the same way as above. Press Ctrl+C to stop it.

Project board is created under 'Projects' section in GitHub