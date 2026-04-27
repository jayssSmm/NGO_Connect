from flask import Blueprint, render_template, request, jsonify

from app.tasks.otp_mail import send_contact_email

bp = Blueprint("contact", __name__)

@bp.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == 'GET':
        return render_template("Contact.html")

    data = request.get_json() or request.form
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required."}), 400

    sent = send_contact_email(
        sender_email=email,
        sender_name=name,
        message=message,
        support_email="miyamoto123.undersky@gmail.com"
    )

    if not sent:
        return jsonify({"error": "Unable to send your message. Please try again later."}), 500

    return jsonify({"ok": True, "message": "Your message has been sent successfully."}), 200
