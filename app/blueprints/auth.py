from flask import Blueprint,request,render_template,redirect
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

bp = Blueprint("auth",__name__)

'''
note
here db is the db client, that we will use (will be declared in extensions.py)
User is the user table 
create_access_token is jwt token that we will use
we not store the password in db, rather we store password hash
right now we are storing the password hash in user cookie
'''

@bp.route("/register",method=['GET','POST'])
def register():
    if request.method=='GET':
        return render_template('register.html')
    
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

    access_token = create_access_token(identity=str(new_user.id))

    response=redirect("/")
    response.set_cookie('access_token_cookie',access_token,httponly=True)

    return response


@bp.route('/login',methods=['POST','GET'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

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

    response=redirect("/")
    response.set_cookie('access_token_cookie',access_token,httponly=True)

    return response