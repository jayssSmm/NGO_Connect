from flask import Blueprint,render_template,request

bp = Blueprint("main",__name__)

@bp.route('/',methods=['GET','POST'])
def volunteer():
    if request.method == 'GET':
        return render_template("Volunteer.html")

@bp.route("/about")
def about():
    return render_template("About.html")