from flask import Blueprint,render_template,request

bp = Blueprint("contact",__name__)

@bp.route("/contact",methods=['GET','POST'])
def contact():
    if request.method == 'GET':
        return render_template("Contact.html")