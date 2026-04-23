from flask import Blueprint,request,render_template

bp = Blueprint("explore",__name__)

@bp.route("/explore",methods=['GET','POST'])
def explore():
    if request.method == 'GET':
        return render_template('Explore.html')
