from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.donation import Donation
from app.models.user import User
import uuid

donate_bp = Blueprint('donation', __name__)

@donate_bp.route('/api/donate', methods=['POST'])
def donate():
    data = request.get_json()

    user_id = data.get('user_id')
    ngo_id  = data.get('ngo_id')
    amount  = data.get('amount')
    item    = data.get('item')

    if not user_id or not ngo_id:
        return jsonify({'error': 'user_id and ngo_id are required'}), 400

    if not amount and not item:
        return jsonify({'error': 'Either amount or item must be provided'}), 400

    if amount and item:
        return jsonify({'error': 'Cannot donate both money and item at once'}), 400

    try:
        donation = Donation(
            user_id=uuid.UUID(user_id),
            ngo_id=uuid.UUID(ngo_id),
            amount=amount if amount else None,
            item=item if item else None,
        )
        db.session.add(donation)
        db.session.commit()
        return jsonify({'message': 'Donation recorded', 'donation_id': str(donation.donation_id)}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500