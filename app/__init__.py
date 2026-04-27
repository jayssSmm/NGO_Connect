from flask import Flask
import os
from app.blueprints.auth.auth import bp as auth_bp
from app.blueprints.main import bp as main_bp
from app.blueprints.volunteer import bp as volunteer_bp
from app.blueprints.donation.donate import bp as donate_bp
from app.blueprints.contact import bp as contact_bp
from app.blueprints.explore import bp as explore_bp
from app.blueprints.auth.auth_check import bp as auth_check_bp
from app.blueprints.dashboard import bp as  dashboard_bp
from app.blueprints.logout import bp as logout_bp
from app.blueprints.auth.change_password import bp as change_pass_bp
from app.blueprints.donation.donation import donate_bp as donation_bp
from app.blueprints.donation.fetch_donation import bp as get_donation_bp
from app.blueprints.volunteer_applications import bp as volunteer_application_bp
from app.blueprints.fetch_volunteer import bp as fetch_volunteer_bp
from app.blueprints.api import bp as api_bp
from app.models.user import User
from app.models.ngo import NGO


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
    app.register_blueprint(change_pass_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(donation_bp)
    app.register_blueprint(get_donation_bp)
    app.register_blueprint(volunteer_application_bp)
    app.register_blueprint(fetch_volunteer_bp)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        app.logger.warning("DATABASE_URL is not set; using local SQLite fallback for development.")

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config["JWT_COOKIE_SECURE"] = False 
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=5)
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')

    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()
        seed_default_ngos()

    return app


def seed_default_ngos():
    if NGO.query.first():
        return

    ngos = [
        {
            "name": "Silver Years Care Foundation",
            "category": "Old Age NGOs",
            "location": "Salt Lake, Sector V, Kolkata",
            "address": "EM-4/2, Sector V, Salt Lake, Kolkata - 700091",
            "contact": "+91 9830456721",
            "email": "silveryears.care@gmail.com",
            "focus": "Elderly care, assisted living, medical support",
            "established_year": 2012,
            "latitude": 22.5750,
            "longitude": 88.4350,
        },
        {
            "name": "Golden Age Support Trust",
            "category": "Old Age NGOs",
            "location": "Behala, Kolkata",
            "address": "45/2 Diamond Harbour Road, Behala, Kolkata - 700034",
            "contact": "+91 9876543210",
            "email": "goldenage.support@ngo.org",
            "focus": "Old age homes, emotional support, healthcare camps",
            "established_year": 2015,
            "latitude": 22.5000,
            "longitude": 88.2500,
        },
        {
            "name": "Bright Future Children Foundation",
            "category": "Children NGOs",
            "location": "Dum Dum, Kolkata",
            "address": "12 Netaji Subhash Road, Dum Dum, Kolkata - 700028",
            "contact": "+91 9123456780",
            "email": "brightfuture.child@gmail.com",
            "focus": "Child education, nutrition programs",
            "established_year": 2014,
            "latitude": 22.6100,
            "longitude": 88.4300,
        },
        {
            "name": "Little Smiles Welfare Society",
            "category": "Children NGOs",
            "location": "Park Circus, Kolkata",
            "address": "22 Circus Avenue, Park Circus, Kolkata - 700017",
            "contact": "+91 9007123456",
            "email": "littlesmiles.ws@gmail.com",
            "focus": "Orphan care, child welfare, adoption support",
            "established_year": 2016,
            "latitude": 22.5460,
            "longitude": 88.3590,
        },
        {
            "name": "Hope for Every Child",
            "category": "Children NGOs",
            "location": "Howrah (near Kolkata)",
            "address": "8/1 GT Road, Howrah - 711101",
            "contact": "+91 9432109876",
            "email": "hope.everychild@ngo.in",
            "focus": "Street children rehabilitation, education",
            "established_year": 2013,
            "latitude": 22.5850,
            "longitude": 88.3200,
        },
        {
            "name": "Paws & Claws Rescue Foundation",
            "category": "Animal NGOs",
            "location": "New Town, Kolkata",
            "address": "Action Area 1, New Town, Kolkata - 700156",
            "contact": "+91 9831122334",
            "email": "pawsclaws.rescue@gmail.com",
            "focus": "Animal rescue, shelter, adoption",
            "established_year": 2018,
            "latitude": 22.5700,
            "longitude": 88.4250,
        },
        {
            "name": "Animal Care & Protection Trust",
            "category": "Animal NGOs",
            "location": "Tollygunge, Kolkata",
            "address": "56 Tollygunge Circular Road, Kolkata - 700033",
            "contact": "+91 9073456123",
            "email": "acpt.kolkata@ngo.org",
            "focus": "Animal welfare, vaccination drives",
            "established_year": 2011,
            "latitude": 22.4980,
            "longitude": 88.3500,
        },
        {
            "name": "Lifeline Health Initiative",
            "category": "Healthcare NGO",
            "location": "Sealdah, Kolkata",
            "address": "10 Beliaghata Main Road, Sealdah, Kolkata - 700014",
            "contact": "+91 9812345678",
            "email": "lifeline.health@ngo.in",
            "focus": "Free medical camps, rural healthcare",
            "established_year": 2010,
            "latitude": 22.5760,
            "longitude": 88.3660,
        },
        {
            "name": "Knowledge Bridge Foundation",
            "category": "Education & Development NGOs",
            "location": "Garia, Kolkata",
            "address": "33 Garia Main Road, Kolkata - 700084",
            "contact": "+91 9901234567",
            "email": "knowledge.bridge@gmail.com",
            "focus": "Skill development, education programs",
            "established_year": 2017,
            "latitude": 22.4580,
            "longitude": 88.4200,
        },
        {
            "name": "Shiksha Udaan Trust",
            "category": "Education & Development NGOs",
            "location": "Barasat (Greater Kolkata)",
            "address": "14 Jessore Road, Barasat - 700124",
            "contact": "+91 9087654321",
            "email": "shiksha.udaan@ngo.org",
            "focus": "Rural education, digital literacy",
            "established_year": 2019,
            "latitude": 22.7100,
            "longitude": 88.4850,
        },
    ]

    for ngo_data in ngos:
        if not NGO.query.filter_by(name=ngo_data['name']).first():
            db.session.add(NGO(**ngo_data))

    db.session.commit()
