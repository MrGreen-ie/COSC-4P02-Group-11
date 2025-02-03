from flask import Blueprint, request, jsonify
from models import db, AIGeneratedSummary
from utils.ai_helpers import summarize_text

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    summary = summarize_text(text)

    # Save summary to database
    new_summary = AIGeneratedSummary(text=text, summary=summary)
    db.session.add(new_summary)
    db.session.commit()

    return jsonify({"summary": summary, "id": new_summary.id}), 200

@ai_bp.route("/summaries", methods=["GET"])
def get_summaries():
    summaries = AIGeneratedSummary.query.all()
    return jsonify([{"id": s.id, "text": s.text, "summary": s.summary} for s in summaries])
