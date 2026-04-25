from flask import Blueprint,request,render_template,redirect
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db

bp = Blueprint("auth",__name__)


<<<<<<< Updated upstream
@bp.route("/register",methods=['GET','POST'])
def register():
    if request.method=='GET':
        return render_template("Signup.html")
    
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')
=======

@bp.route("/api/register", methods=['POST'])
def register():

    data = request.get_json() or request.form
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    next_url = data.get('next', '')
    if not next_url or not next_url.startswith('/'):
        next_url = '/'

    if not full_name or not email or not password:
        return jsonify({"error": "Full name, email, and password are required."}), 400
>>>>>>> Stashed changes

    if not email or not password:
        return redirect("/register")
    
    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if existing_user:
<<<<<<< Updated upstream
        return redirect("/regsiter")
    
    new_user = User(email=email, password_hash=generate_password_hash(password))
=======
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

@bp.route("/api/verify-otp", methods=['POST'])
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
>>>>>>> Stashed changes
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))

    response.set_cookie('access_token_cookie',access_token,httponly=True)

    response=redirect("/")
    return response


<<<<<<< Updated upstream
@bp.route('/login',methods=['POST','GET'])
def login():
    if request.method == 'GET':
        return render_template('Login.html')
=======
@bp.route('/api/login', methods=['POST'])
def login():
>>>>>>> Stashed changes

    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return redirect("/login")

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if not user or not check_password_hash(user.password_hash, password):
        return redirect("/login")

    access_token = create_access_token(identity=str(user.id))

    response.set_cookie('access_token_cookie',access_token,httponly=True)

    response=redirect("/")
    return response