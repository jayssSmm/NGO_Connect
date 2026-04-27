from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func

from app.models.ngo import NGO

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
