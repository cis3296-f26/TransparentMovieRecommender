# What's Next (Transparent Movie Recommender)

What's Next is a web-based movie recommender that explains every suggestion it makes. Users search for and rate movies they've seen from 0.5 to 5.0 stars, then receive a ranked list of personalized recommendations. No account or imported viewing history is required. Recommendations are built from the [MovieLens](https://grouplens.org/datasets/movielens/) dataset and enriched with movie overviews from [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api).

**Live site:** https://www.google.com/search?q=https://whats-next-w3q5.onrender.com

**Current status:** Active development. The application features a React + Vite front end and a Flask back end with item-based collaborative filtering:
- **Movie Search (`MovieCatalog`):** Searches MovieLens titles (normalizing trailing articles such as `"Matrix, The (1999)"` to `"The Matrix (1999)"`) sorted by rating count, with community ratings and TMDB movie overviews.
- **Rating Profile:** Lets users rate movies from 0.5 to 5.0 stars in 0.5-star increments, update or remove individual ratings, or clear all ratings.
- **Collaborative Filtering (`CollaborativeFilter`):** Filters movies with at least 10 ratings, normalizes movie-user rating vectors, computes cosine similarity, predicts ratings via weighted averages (`recommend`), and calculates per-movie rating contribution weights (`breakdown`). Once a user rates at least 5 movies, the app returns up to 10 ranked recommendations.

Developed and tested on macOS 15.7.9 with Python 3.13.9. The Windows scripts were tested on Windows 11 with Python 3.13.

## Prerequisites

- **Git**
- **Python 3** (On Windows, `setup.bat` installs Python 3.13 via `winget` if missing)
- **Node.js and npm** (Required to build or run the React front end)
- **TMDB API Key** (Optional for core ratings/recommendations, required to fetch movie overviews from [The Movie Database](https://www.themoviedb.org/settings/api))

## Installation

### macOS and Linux

1. Clone the repository and enter it:

   ```bash
   git clone https://github.com/cis3296-f26/TransparentMovieRecommender.git
   cd TransparentMovieRecommender
   ```

2. Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the Python back-end dependencies:

   ```bash
   pip install -r back-end/requirements.txt
   ```

4. Install the React front-end dependencies:

   ```bash
   cd front-end
   npm install
   cd ..
   ```

5. Download the MovieLens `ml-latest-small` dataset and move the CSV files (`ratings.csv`, `movies.csv`, and `links.csv`) into `data/`:

   ```bash
   curl -L -O https://files.grouplens.org/datasets/movielens/ml-latest-small.zip
   unzip ml-latest-small.zip
   mkdir -p data
   mv ml-latest-small/ratings.csv ml-latest-small/movies.csv ml-latest-small/links.csv data/
   ```

### Windows (10 and 11)

1. Clone the repository:

   ```powershell
   git clone https://github.com/cis3296-f26/TransparentMovieRecommender.git
   ```

2. Open the `TransparentMovieRecommender\back-end` folder and double-click `setup.bat`. It installs Python 3.13 with `winget` if Python is missing, creates the virtual environment, installs the Python dependencies, and downloads the MovieLens data into `data\`. Running it again skips any steps that are already done. *(If using the TMDB branch/features, also ensure `links.csv` from `ml-latest-small.zip` is placed inside `data\`.)*

3. Install the front-end dependencies from a terminal in the repository root:

   ```powershell
   cd front-end
   npm install
   cd ..
   ```

## Environment Variables (API Key Setup)

The back end uses `python-dotenv` to load a TMDB API key from `back-end/.env` (or from your system environment) to fetch movie overviews.

1. Create or update the `.env` file inside the `back-end/` directory (`back-end/.env`):

   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

   - **macOS / Linux:**

     ```bash
     echo "TMDB_API_KEY=your_tmdb_api_key_here" > back-end/.env
     ```

   - **Windows (PowerShell):**

     ```powershell
     Set-Content -Path back-end\.env -Value "TMDB_API_KEY=your_tmdb_api_key_here"
     ```

2. To update your API key later, edit `back-end/.env` and replace `your_tmdb_api_key_here` with the new key, then restart the Flask server so the updated environment variable is loaded. *(Note: `.env` is listed in `.gitignore` so your API key is never committed to Git.)*

## Build

Flask serves the compiled React front end from `front-end/dist`. To build the front-end production bundle:

```bash
cd front-end
npm run build
cd ..
```

On macOS/Linux (or Render deployments), you can also run `./build.sh` from the repository root to install Python packages, run `npm ci && npm run build`, and download the MovieLens dataset in one step.

## How to Run

You can run the application either in **Integrated Mode** (Flask serves both the built front end and API on port 5000) or in **Development Mode** (Vite dev server with hot reloading alongside the Flask API).

### Option 1: Integrated Mode (Single Server on Port 5000)

Make sure you have built the front end (`cd front-end && npm run build && cd ..`) first.

- **macOS and Linux:** With the virtual environment active, run from the repository root:

  ```bash
  python back-end/app.py
  ```

  Or with automatic reloading and debug output:

  ```bash
  flask --app back-end/app run --debug
  ```

- **Windows:** Double-click `run.bat` in the `back-end` folder (or run `venv\Scripts\python back-end\app.py` from the repository root). Press `Ctrl+C` to stop it.

Open https://www.google.com/url?sa=E\&source=gmail\&q=http://127.0.0.1:5000 in your browser to use the app.

### Option 2: Front-End + Back-End Development Mode (Two Terminals)

1. **Terminal 1 (Back End):** From the repository root with the virtual environment active, start Flask on `http://127.0.0.1:5000`:

   ```bash
   python back-end/app.py
   ```

2. **Terminal 2 (Front End):** Start the Vite development server (which automatically proxies `/search`, `/recommendations`, and `/movie` requests to `http://127.0.0.1:5000`):

   ```bash
   cd front-end
   npm run dev
   ```

3. Open the local URL shown by Vite (typically http://localhost:5173) in your browser.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the built React application from `front-end/dist/index.html`. |
| `GET` | `/search?q=<query>` | Searches movies by title and returns up to 10 matches sorted by number of ratings (`movieId`, `title`, `num_ratings`, plus `average_rating` and `overview` when TMDB is enabled). |
| `POST` | `/recommendations` | Accepts `{ "ratings": { "<movieId>": <rating>, ... } }` and returns up to 10 recommended movies with `movieId`, `title`, and `predicted_rating`. |
| `GET` | `/movie/<movie_id>` | Returns statistics for a movie (`movieId`, `title`, `average_rating`, `num_ratings`, and `overview`). |

To verify the server from a terminal, run:

```bash
curl http://127.0.0.1:5000/movie/2571
```

It returns the title, average rating, and number of ratings for *The Matrix*:

```json
{
  "average_rating": 4.192446043165468,
  "movieId": 2571,
  "num_ratings": 278,
  "title": "The Matrix (1999)"
}
```

## Testing

Unit tests are located in `tests/` (`test_recommender.py` and `test_titleSearch.py`) and configured via `pytest.ini`. With the virtual environment active, run:

```bash
pytest
```

To include test coverage:

```bash
pytest --cov=back-end
```

Project board is created under the **Projects** section in GitHub.