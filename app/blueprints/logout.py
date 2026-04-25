from flask_jwt_extended import unset_jwt_cookies
from flask import Blueprint,jsonify

bp = Blueprint('logout',__name__)

@bp.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({"logout": True})
    unset_jwt_cookies(response)
    return response, 200