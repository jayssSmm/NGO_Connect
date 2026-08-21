# import in app/__init__.py as:
# from app.routes.features_routes import features_bp
# then register with app.register_blueprint(features_bp)

from flask import Blueprint, render_template

features_bp = Blueprint('features', __name__)

@features_bp.route('/urgency')
def urgency_dashboard():
    return render_template('urgency_dashboard.html')

@features_bp.route('/clusters')
def problem_clusters():
    return render_template('problem_clusters.html')

@features_bp.route('/volunteer-match')
def volunteer_matching():
    return render_template('volunteer_matching.html')

@features_bp.route('/resources')
def resource_allocation():
    return render_template('resource_allocation.html')

@features_bp.route('/efficiency')
def volunteer_efficiency():
    return render_template('volunteer_efficiency.html')

@features_bp.route('/alerts')
def alerts_dashboard():
    return render_template('alerts_dashboard.html')

@features_bp.route('/trust')
def trust_system():
    return render_template('trust_system.html')

@features_bp.route('/features')
def features_index():
    return render_template('features_index.html')
