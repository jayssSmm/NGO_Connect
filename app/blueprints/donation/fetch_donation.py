from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.donation import Donation

bp = Blueprint("get-donation", __name__)

@bp.route("/api/get-donations", methods=["GET"])
@jwt_required()
def get_user_donations():
    user_id = get_jwt_identity()

    donations = db.session.execute(
        db.select(Donation).filter_by(user_id=user_id)
    ).scalars().all()

    result = [
        {
            "ngo_id": d.ngo_id,
            "ngo_name":d.ngo_name,
            "amount": d.amount,
            "created_at": d.donated_at
        }
        for d in donations
    ]

    return jsonify(result), 200