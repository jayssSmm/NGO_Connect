from flask import Blueprint,render_template,request

bp = Blueprint("donate",__name__)

@bp.route('/donate',methods=['GET','POST'])
def donate():
    if request.method == 'GET':
        return render_template("Donate.html")