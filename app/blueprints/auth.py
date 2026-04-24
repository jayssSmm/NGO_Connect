import json
from flask import Blueprint,request,render_template,redirect,jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token,set_access_cookies

from datetime import datetime

from app.utils.otp_generator import generate_otp
from app.tasks.otp_mail import send_email
from app.extensions import redis_client

from app.models.user import User
from app.extensions import db

bp = Blueprint("auth",__name__)

OTP_TTL = 600

@bp.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template("Signup.html")

    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify({"error": "This email is already registered."}), 409

    otp, expiry_time = generate_otp()

    sent = send_email(
        receiver_email=email,
        receiver_name=email.split('@')[0],
        expire_time=10,
        otp_code=otp
    )

    if not sent:
        return jsonify({"error": "Failed to send OTP. Please try again."}), 500

    pending = {
        "email": email,
        "password_hash": generate_password_hash(password),
        "otp": str(otp),
        "expiry": expiry_time.isoformat()
    }
    redis_client.setex(f"otp:{email}", OTP_TTL, json.dumps(pending))

    return jsonify({"ok": True}), 200

@bp.route("/verify-otp", methods=['POST'])
def verify_otp():
    email = request.form.get('email', '').strip().lower()
    entered_otp = request.form.get('otp', '').strip()

    raw = redis_client.get(f"otp:{email}")
    if not raw:
        return jsonify({"error": "OTP expired. Please register again."}), 410

    pending = json.loads(raw)

    if entered_otp != pending['otp']:
        return jsonify({"error": "Invalid OTP. Please try again."}), 400

    new_user = User(email=pending['email'], password_hash=pending['password_hash'])
    db.session.add(new_user)
    db.session.commit()

    redis_client.delete(f"otp:{email}")

    access_token = create_access_token(identity=str(new_user.user_id))
    response = jsonify({"ok": True})
    set_access_cookies(response, access_token)
    return response, 200


@bp.route('/login',methods=['POST','GET'])
def login():
    if request.method == 'GET':
        return render_template('Login.html')

    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return redirect("/login")

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if not user or not check_password_hash(user.password_hash, password):
        print(user.password_hash)
        print()
        print(create_access_token(password))
        return redirect("/login")

    access_token = create_access_token(identity=str(user.user_id))

    response=redirect("/")

    response.set_cookie('access_token_cookie',access_token,httponly=True)
    return response