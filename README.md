# Spam Classifier

A simple SMS spam classifier using a bag-of-words (CountVectorizer) + Multinomial Naive Bayes model with a small Flask API for predictions.

This repository contains training code, preprocessing utilities, a sample prediction script, and a tiny Flask app that exposes a /predict endpoint.

## Repository structure

- app.py                - Flask API (runs from the project root)
- requirements.txt      - Python dependencies
- data/                 - Dataset (spam.csv expected)
- model/                - Saved artifacts (vectorizer.pkl, spam_model.pkl)
- notebooks/            - Saved notebook outputs (e.g., plots)
- src/
  - preprocess.py      - Vectorizer creation & transform helpers
  - train.py           - Script to train the model and save artifacts
  - predict.py         - Small test script that loads the saved model and runs sample predictions

## Requirements

Install dependencies:

python -m venv .venv
source .venv/bin/activate  # Linux / macOS
.\.venv\Scripts\activate   # Windows (PowerShell: .\.venv\Scripts\Activate.ps1)

pip install -r requirements.txt

## Training

1. Ensure the dataset `spam.csv` is present in the `data/` directory.
2. Change into the `src/` directory and run the training script (the scripts use relative paths expecting `src/` as the working directory):

cd src
python train.py

This will:
- Train a Multinomial Naive Bayes classifier on the dataset
- Persist the vectorizer to `model/vectorizer.pkl`
- Persist the trained model to `model/spam_model.pkl`
- Save a distribution plot to `notebooks/spam_distribution.png`

## Run the API

From the project root run:

python app.py

The Flask app exposes a POST /predict endpoint that accepts JSON with a `message` field and returns a JSON response with the predicted label.

Example request using curl:

curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"message":"Win a free iPhone now"}'

Example response:

{
  "message": "Win a free iPhone now",
  "prediction": "SPAM"
}

