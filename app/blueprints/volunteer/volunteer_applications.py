from flask import jsonify,Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.volunteer import VolunteerApplication
from app.extensions import db

bp = Blueprint('volunteer_application',__name__)

@bp.route('/api/volunteer/apply', methods=['POST'])
@jwt_required()
def apply_volunteer():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    ngo_id         = data.get('ngo_id')
    ngo_name       = data.get('ngo_name')
    skill_needed   = data.get('skill_needed')
    skill_provided = data.get('skill_provided')

    if not all([ngo_id, ngo_name, skill_needed, skill_provided]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        application = VolunteerApplication(
            user_id        = current_user_id,
            ngo_id         = ngo_id,
            ngo_name       = ngo_name,
            skill_needed   = skill_needed,
            skill_provided = skill_provided
        )
        db.session.add(application)
        db.session.commit()
        return jsonify({'message': 'Application submitted successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to submit application'}), 500