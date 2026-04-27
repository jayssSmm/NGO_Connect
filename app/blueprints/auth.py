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


@bp.route("/register",methods=['GET','POST'])
def register():
    if request.method=='GET':
        return render_template("Signup.html")
    
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return redirect("/register")
    
    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()
    if existing_user:
        return redirect("/regsiter")
    
    new_user = User(email=email, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()

    redis_client.delete(f"otp:{email}")

    next_url = pending.get('next', '/')
    access_token = create_access_token(identity=str(new_user.user_id))
    response = jsonify({"ok": True, "redirect": next_url})
    set_access_cookies(response, access_token)
    return response, 200


@bp.route('/login',methods=['POST','GET'])
def login():
    if request.method == 'GET':
        return render_template('Login.html')

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