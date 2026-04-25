from flask import Flask
import os
<<<<<<< Updated upstream
from app.blueprints.auth import bp as auth_bp
from app.blueprints.main import bp as main_bp
from app.blueprints.volunteer import bp as volunteer_bp
from app.blueprints.donate import bp as donate_bp
from app.blueprints.contact import bp as contact_bp
from app.blueprints.explore import bp as explore_bp
=======
from app.blueprints.api import bp as api_bp
from app.blueprints.auth import bp as auth_bp
from app.blueprints.auth_check import bp as auth_check_bp
from app.blueprints.logout import bp as logout_bp
from app.blueprints.contact import bp as contact_bp
>>>>>>> Stashed changes
from app.models.user import User

from app.extensions import db 
from app.extensions import jwt
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.secret_key = os.getenv("SECRET_KEY")

    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
<<<<<<< Updated upstream
    app.register_blueprint(volunteer_bp)
    app.register_blueprint(donate_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(explore_bp)
=======
    app.register_blueprint(auth_check_bp)
    app.register_blueprint(logout_bp)
    app.register_blueprint(contact_bp)
>>>>>>> Stashed changes

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

    db.init_app(app)
    jwt.init_app(app)

    return app