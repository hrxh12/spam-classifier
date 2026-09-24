import os
import pickle
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy

import sys

ROOT_DIR = Path(__file__).resolve().parent
sys.path.append(str(ROOT_DIR / "src"))
from preprocess import preprocess_predict

app = Flask(__name__)
database_url = os.getenv("DATABASE_URL", f"sqlite:///{ROOT_DIR / 'predictions.db'}")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app)
limiter = Limiter(key_func=get_remote_address, app=app, default_limits=[])

model = pickle.load(open(ROOT_DIR / "model" / "spam_model.pkl", "rb"))


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(20), nullable=False, index=True)
    confidence = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        created_at = self.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return {
            "id": self.id,
            "message": self.message,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "created_at": created_at.isoformat(),
        }


with app.app_context():
    db.create_all()


@app.errorhandler(429)
def rate_limit_error(error):
    return jsonify({"error": "Rate limit exceeded. Please try again in a minute."}), 429


@app.route("/predict", methods=["POST"])
@limiter.limit("20 per minute")
def predict():
    data = request.get_json(silent=True) or {}
    message = data.get("message")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "message must be a non-empty string"}), 400

    X = preprocess_predict(message)
    result = model.predict(X)
    prediction = "SPAM" if result[0] == 1 else "NOT SPAM"
    confidence = None
    if hasattr(model, "predict_proba"):
        confidence = float(model.predict_proba(X).max())

    record = Prediction(message=message, prediction=prediction, confidence=confidence)
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "message": message,
        "prediction": prediction,
        "confidence": confidence,
        "created_at": record.to_dict()["created_at"],
    })


@app.route("/history", methods=["GET"])
def history():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    if page is None or per_page is None:
        return jsonify({"error": "page and per_page must be integers"}), 400
    page = max(page, 1)
    per_page = min(max(per_page, 1), 100)

    prediction_filter = request.args.get("prediction", "").upper()
    query = Prediction.query.order_by(Prediction.created_at.desc())
    if prediction_filter:
        if prediction_filter not in {"SPAM", "NOT SPAM"}:
            return jsonify({"error": "prediction must be SPAM or NOT SPAM"}), 400
        query = query.filter_by(prediction=prediction_filter)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "items": [item.to_dict() for item in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    })


@app.route("/stats", methods=["GET"])
def stats():
    total = Prediction.query.count()
    spam = Prediction.query.filter_by(prediction="SPAM").count()
    not_spam = total - spam
    volume = db.session.query(
        db.func.date(Prediction.created_at).label("date"),
        db.func.count(Prediction.id).label("count"),
    ).group_by(db.func.date(Prediction.created_at)).order_by(db.func.date(Prediction.created_at)).all()

    return jsonify({
        "total": total,
        "spam": spam,
        "not_spam": not_spam,
        "spam_percentage": round((spam / total) * 100, 2) if total else 0,
        "not_spam_percentage": round((not_spam / total) * 100, 2) if total else 0,
        "volume_over_time": [{"date": date, "count": count} for date, count in volume],
    })


if __name__ == "__main__":
    app.run(debug=True)
