from flask import Blueprint,render_template,request

bp = Blueprint("volunteer",__name__)

@bp.route('/volunteer',methods=['GET','POST'])
def volunteer():
    if request.method == 'GET':
        return render_template("Volunteer.html")