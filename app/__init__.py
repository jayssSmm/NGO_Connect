from flask import Flask
from app.blueprints.auth import bp as auth_bp
from app.blueprints.main import bp as main_bp
from app.blueprints.volunteer import bp as volunteer_bp
from app.blueprints.donate import bp as donate_bp
from app.blueprints.contact import bp as contact_bp
from app.blueprints.explore import bp as explore_bp

def create_app():
    app = Flask(__name__)

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(volunteer_bp)
    app.register_blueprint(donate_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(explore_bp)

    return app