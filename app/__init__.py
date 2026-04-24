from flask import Flask
import os
from app.blueprints.auth import bp as auth_bp
from app.blueprints.main import bp as main_bp
from app.blueprints.volunteer import bp as volunteer_bp
from app.blueprints.donate import bp as donate_bp
from app.blueprints.contact import bp as contact_bp
from app.blueprints.explore import bp as explore_bp
from app.blueprints.auth_check import bp as auth_check_bp
from app.blueprints.dashboard import bp as  dashboard_bp
from app.blueprints.logout import bp as logout_bp
from app.models.user import User

from app.extensions import db 
from app.extensions import jwt

from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("SECRET_KEY")

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(volunteer_bp)
    app.register_blueprint(donate_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(explore_bp)
    app.register_blueprint(auth_check_bp)
    app.register_blueprint(logout_bp)
    app.register_blueprint(dashboard_bp)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config["JWT_COOKIE_SECURE"] = False 
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=5)
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')

    db.init_app(app)
    jwt.init_app(app)

    return app