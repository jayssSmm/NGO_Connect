from flask import Blueprint,request,render_template,redirect
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db

bp = Blueprint("auth",__name__)


@bp.route("/register",methods=['GET','POST'])
def register():
    if request.method=='GET':
        return render_template("Signup.html")
    print('hit')
    
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return redirect("/register")
    
    existing_user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    if existing_user:
        return redirect("/register")
    
    new_user = User(email=email, password_hash=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.user_id))
    
    response=redirect("/")

    response.set_cookie('access_token_cookie',access_token,httponly=True)
    return response


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
        return redirect("/login")

    access_token = create_access_token(identity=str(user.user_id))

    response=redirect("/")

    response.set_cookie('access_token_cookie',access_token,httponly=True)
    return response