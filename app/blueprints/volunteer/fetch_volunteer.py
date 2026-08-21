from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.volunteer import VolunteerApplication

bp = Blueprint("get-volunteer", __name__)

@bp.route("/api/get-volunteer", methods=["GET"])
@jwt_required()
def get_user_donations():
    user_id = get_jwt_identity()

    donations = db.session.execute(
        db.select(VolunteerApplication).filter_by(user_id=user_id)
    ).scalars().all()

    result = [
        {
            "ngo_name":d.ngo_name,
            "skill_needed":d.skill_needed,
            "skill_provided":d.skill_provided,
            "applied_at":d.applied_at,
            "status":d.status,
        }
        for d in donations
    ]

    return jsonify(result), 200