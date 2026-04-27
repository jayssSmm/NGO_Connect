from flask_jwt_extended import verify_jwt_in_request
from flask import jsonify,Blueprint

bp = Blueprint('auth_check',__name__)

@bp.route('/api/auth/check')
def auth_check():
    try:
        verify_jwt_in_request()
        return jsonify({"authenticated": True}), 200
    except:
        return jsonify({"authenticated": False}), 401