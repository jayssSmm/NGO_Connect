from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func
<<<<<<< HEAD

from app.models.ngo import NGO
=======
import uuid

from app.models.ngo import NGO
from app.extensions import db
>>>>>>> d5797a22cd40abfd58a3fc6f0fdc0721f830ccff

bp = Blueprint("api", __name__, url_prefix="/api")

@bp.route('/ngos', methods=['GET'])
def get_ngos():
    query_text = request.args.get('q', '').strip()
    query = NGO.query

    if query_text:
        search_text = f"%{query_text.lower()}%"
        query = query.filter(
            or_(
                func.lower(NGO.name).like(search_text),
                func.lower(NGO.category).like(search_text),
                func.lower(NGO.location).like(search_text),
                func.lower(NGO.address).like(search_text),
                func.lower(NGO.focus).like(search_text),
                func.lower(NGO.email).like(search_text),
            )
        )

    ngos = query.order_by(NGO.name).all()
    if not ngos and query_text:
        return jsonify({"message": "Sorry, We could not find this NGO", "ngos": []}), 404

    return jsonify([ngo.to_dict() for ngo in ngos]), 200
<<<<<<< HEAD
=======

@bp.route('/ngo/<string:ngo_id>', methods=['GET'])
def get_ngo(ngo_id):
    try:
        ngo_uuid = uuid.UUID(ngo_id)
    except ValueError:
        return jsonify({"message": "Invalid NGO ID"}), 400

    ngo = db.session.get(NGO, ngo_uuid)
    if not ngo:
        return jsonify({"message": "NGO not found"}), 404

    return jsonify(ngo.to_dict()), 200
>>>>>>> d5797a22cd40abfd58a3fc6f0fdc0721f830ccff
