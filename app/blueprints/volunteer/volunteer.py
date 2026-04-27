import uuid
from flask import Blueprint,request,render_template,abort
from app.models.ngo import NGO
from app.extensions import db

bp = Blueprint("volunteer",__name__)

@bp.route('/ngo/<string:ngo_id>', methods=['GET'])
def ngo_detail(ngo_id):
    try:
        ngo_uuid = uuid.UUID(ngo_id)
    except ValueError:
        abort(404)

    ngo = db.session.get(NGO, ngo_uuid)
    if not ngo:
        abort(404)

    return render_template('NGODetail.html', ngo=ngo)
