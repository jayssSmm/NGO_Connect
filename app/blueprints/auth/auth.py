import json
from flask import Blueprint, request, render_template, redirect, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, set_access_cookies
from urllib.parse import urlparse
from sqlalchemy import text

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
        next_url = request.args.get('next', '')
        if not next_url:
            referer = request.headers.get('Referer', '')
            if referer:
                parsed = urlparse(referer)
                if parsed.netloc == request.host and parsed.path not in ['/login', '/register']:
                    next_url = parsed.path
                    if parsed.query:
                        next_url += f'?{parsed.query}'
        return render_template("Signup.html", next_url=next_url)

    data = request.get_json() or request.form
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    next_url = data.get('next', '')
    if not next_url or not next_url.startswith('/'):
        next_url = '/'

    if not full_name or not email or not password:
        return jsonify({"error": "Full name, email, and password are required."}), 400

    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()
    if existing_user:
        return jsonify({"error": "This email is already registered."}), 409

    otp,expire = generate_otp()  # make sure this returns a plain string/int

    pending = {
        "full_name": full_name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "otp": otp,
        "next": next_url
    }
    redis_client.setex(f"otp:{email}", OTP_TTL, json.dumps(pending))

    send_email(
        receiver_email=email,
        receiver_name=full_name,
        expire_time=OTP_TTL // 60,   # 600 seconds → 10 minutes
        otp_code=otp
    )

    return jsonify({"ok": True}), 200

@bp.route("/verify-otp", methods=['POST'])
def verify_otp():
    data = request.get_json() or request.form
    email = data.get('email', '').strip().lower()
    entered_otp = data.get('otp', '').strip()

    raw = redis_client.get(f"otp:{email}")
    if not raw:
        return jsonify({"error": "OTP expired. Please register again."}), 410

    pending = json.loads(raw)
    print(pending)
    print(type(pending.get('otp')))

    if str(entered_otp) != str(pending.get('otp')):
        return jsonify({"error": "Invalid OTP. Please try again."}), 400

    new_user = User(
        full_name=pending['full_name'],
        email=pending['email'],
        password_hash=pending['password_hash']
    )
    db.session.add(new_user)
    db.session.commit()

    redis_client.delete(f"otp:{email}")

    next_url = pending.get('next', '/')
    access_token = create_access_token(identity=str(new_user.user_id))
    response = jsonify({"ok": True, "redirect": next_url})
    set_access_cookies(response, access_token)
    return response, 200


@bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'GET':
        next_url = request.args.get('next', '')
        if not next_url:
            referer = request.headers.get('Referer', '')
            if referer:
                parsed = urlparse(referer)
                if parsed.netloc == request.host and parsed.path not in ['/login', '/register']:
                    next_url = parsed.path
                    if parsed.query:
                        next_url += f'?{parsed.query}'
        return render_template('Login.html', next_url=next_url)

    data = request.get_json() or request.form
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    next_url = data.get('next', '')
    if not next_url or not next_url.startswith('/'):
        next_url = '/'

    if not email or not password:
        if request.is_json:
            return jsonify({"error": "Email and password are required."}), 400
        return redirect(f"/login?next={next_url}")

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if not user or not check_password_hash(user.password_hash, password):
        if request.is_json:
            return jsonify({"error": "Wrong credentials. Try again."}), 401
        return redirect(f"/login?next={next_url}")

    access_token = create_access_token(identity=str(user.user_id))
    if request.is_json:
        response = jsonify({"ok": True, "redirect": next_url})
        set_access_cookies(response, access_token)
        return response, 200

    response = redirect(next_url)
    response.set_cookie('access_token_cookie', access_token, httponly=True)
    return response