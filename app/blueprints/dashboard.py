from flask import Blueprint,render_template,request

bp = Blueprint("dashboard",__name__)

@bp.route('/dashboard')
def dashboard():
    return render_template('Dashboard.html')