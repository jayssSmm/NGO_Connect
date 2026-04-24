from flask import Blueprint,request,jsonify,render_template
from app.extensions import db,redis_client
from app.tasks.otp_mail import send_email
from app.utils.otp_generator import generate_otp
from app.models.user import User
from datetime import datetime,timezone
from werkzeug.security import generate_password_hash

bp = Blueprint('forgetPassword',__name__)

@bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = (data or {}).get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400
    
    user = User.query.filter_by(email=email).first()

    if user:
        otp_code, expiry_dt = generate_otp()          # -> (int, datetime)
        ttl = 600

        redis_client.setex(f"otp:{email}", ttl, str(otp_code))

        expire_minutes = ttl // 60
        send_email(email, email, expire_minutes, otp_code)

    return jsonify({"message": "If that email is registered, an OTP has been sent."}), 200



@bp.route("/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = (data or {}).get("email", "").strip().lower()
    otp_input = str((data or {}).get("otp", "")).strip()

    if not email or not otp_input:
        return jsonify({"error": "Email and OTP are required."}), 400

    stored_otp = redis_client.get(f"otp:{email}")

    if stored_otp is None:
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    if isinstance(stored_otp, bytes):
        stored_otp = stored_otp.decode()

    if stored_otp != otp_input:
        return jsonify({"error": "Incorrect OTP. Please try again."}), 400

    redis_client.delete(f"otp:{email}")

    redis_client.setex(f"otp_verified:{email}", 300, "1")   # 5 minutes

    return jsonify({"message": "OTP verified.", "redirect": "/change-password", "email": email}), 200


@bp.route("/change-password", methods=["GET"])
def change_password_page():
    return render_template("ForgotPassword.html")


@bp.route("/change-password", methods=["POST"])
def change_password():
    data = request.get_json()
    email = (data or {}).get("email", "").strip().lower()
    password = (data or {}).get("password", "")
    confirm_password = (data or {}).get("confirm_password", "")
    print(password)

    if not email or not password or not confirm_password:
        return jsonify({"error": "All fields are required."}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    # Gate: must have passed OTP verification
    verified = redis_client.get(f"otp_verified:{email}")
    if not verified:
        return jsonify({"error": "Session expired. Please restart the password reset flow."}), 403

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404

    # Hash new password and update DB
    hashed = generate_password_hash(password)
    user.password_hash = hashed
    db.session.commit()

    # Clean up verification token
    redis_client.delete(f"otp_verified:{email}")

    return jsonify({"message": "Password updated successfully.", "redirect": "/"}), 200