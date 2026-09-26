# Spam Classifier

A simple SMS spam classifier using a bag-of-words model with a Multinomial Naive Bayes classifier, backed by a Flask API and a Vite + React frontend for testing predictions and reviewing history/statistics.

This repository includes model training code, preprocessing utilities, a prediction API, and a small browser app to interact with the classifier.

## Repository structure

- app.py                - Flask API with prediction, history, and stats endpoints
- requirements.txt      - Python dependencies
- data/                 - Training dataset (`spam.csv`)
- model/                - Saved model artifacts (`vectorizer.pkl`, `spam_model.pkl`)
- notebooks/            - Notebook outputs and plots
- src/
  - preprocess.py       - Text preprocessing and feature transformation helpers
  - train.py            - Trains the classifier and saves the model files
  - predict.py          - Example script for running sample predictions
- frontend/
  - index.html          - Vite app entry
  - package.json        - Frontend dependencies and scripts
  - src/                - React app source code

## Requirements

### Python backend

```bash
python -m venv .venv
# Linux / macOS
source .venv/bin/activate
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### Frontend

From the `frontend/` directory:

```bash
npm install
```

## Training the model

1. Ensure the dataset `data/spam.csv` is present.
2. Run the training script from the `src/` folder:

```bash
cd src
python train.py
```

This will:
- train the Naive Bayes classifier on the dataset
- save the vectorizer to `model/vectorizer.pkl`
- save the trained model to `model/spam_model.pkl`
- generate a distribution plot in `notebooks/spam_distribution.png`

## Run the backend API

From the project root:

```bash
python app.py
```

The Flask app exposes:
- `POST /predict` — classify a message
- `GET /history` — view recent predictions with pagination and filtering
- `GET /stats` — get aggregate spam statistics

Example request using curl:

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"message":"Win a free iPhone now"}'
```

Example response:

```json
{
  "message": "Win a free iPhone now",
  "prediction": "SPAM",
  "confidence": 0.9992,
  "created_at": "2026-09-26T12:00:00+00:00"
}
```

## Run the frontend

From the `frontend/` directory:

```bash
npm run dev
```

This starts the Vite app, typically at:

```text
http://localhost:5173
```

The frontend expects the Flask API to be running on `http://127.0.0.1:5000` by default. If needed, you can set a custom API base URL before running the app:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000 npm run dev
```

## Frontend features

The React app includes:
- a message classifier form
- prediction result with confidence bar
- recent prediction history table
- spam/non-spam filtering
- aggregate statistics dashboard with charts

## Typical workflow

1. Train the model with `python src/train.py`
2. Start the backend with `python app.py`
3. Start the frontend with `cd frontend && npm run dev`
4. Open the frontend in the browser and test messages


