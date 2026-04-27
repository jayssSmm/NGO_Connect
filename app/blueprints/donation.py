from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.donation import Donation
from app.models.user import User
from flask_jwt_extended import get_jwt_identity,jwt_required
from sqlalchemy import text
import uuid

donate_bp = Blueprint('donation', __name__)

@donate_bp.route("/api/donate", methods=["POST"])
@jwt_required()
def donate():
    data = request.get_json()

    user_id = get_jwt_identity()  # 🔥 THIS replaces currentUserId
    ngo_id = data.get("ngo_id")
    amount = data.get("amount")

    if not ngo_id or not amount:
        return jsonify({"error": "Missing data"}), 400

    # store donation
    db.session.execute(
        text("""
            INSERT INTO donations (user_id, ngo_id, amount)
            VALUES (:user_id, :ngo_id, :amount)
        """),
        {"user_id": user_id, "ngo_id": ngo_id, "amount": amount}
    )
    db.session.commit()

    return jsonify({"ok": True}), 200