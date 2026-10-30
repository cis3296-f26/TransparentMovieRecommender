#!/usr/bin/env bash
set -o errexit  # stop at the first command that fails

pip install -r back-end/requirements.txt

# Front end: install the exact versions in package-lock.json, then build into front-end/dist
cd front-end
npm ci
npm run build
cd ..

# MovieLens data, which isn't in the repo
curl -L --fail -o ml-latest-small.zip https://files.grouplens.org/datasets/movielens/ml-latest-small.zip
python -m zipfile -e ml-latest-small.zip .
mkdir -p data
mv ml-latest-small/ratings.csv ml-latest-small/movies.csv data/