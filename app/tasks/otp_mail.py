
import smtplib
import os
import textwrap
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


def send_email(receiver_email: str, receiver_name: str, expire_time: int, otp_code: int) -> bool:
    
    SENDER_EMAIL = os.getenv("NGO_EMAIL")
    APP_PASSWORD = os.getenv("APP_PASSWORD")

    if not SENDER_EMAIL or not APP_PASSWORD:
        raise EnvironmentError(
            "NGO_EMAIL or APP_PASSWORD not found in environment. "
            "Make sure your .env file is set up correctly."
        )

    SUBJECT = "Your One-Time Password (OTP) for Sign-In"

    BODY = textwrap.dedent(f"""\
        Dear {receiver_name},

        We received a request to sign in to your account.

        Your One-Time Password (OTP) for verification is:

        {otp_code}

        This OTP is valid for the next {expire_time} minutes. Please do not share this code with anyone for security reasons.

        If you did not request this, please ignore this email or contact our support team immediately.

        Thank you,
        NGO CONNECT Team
    """)

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = f"{receiver_name} <{receiver_email}>"
    msg["Subject"] = SUBJECT

    msg.attach(MIMEText(BODY, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())

        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_contact_email(sender_email: str, sender_name: str, message: str, support_email: str) -> bool:
    SENDER_EMAIL = os.getenv("NGO_EMAIL")
    APP_PASSWORD = os.getenv("APP_PASSWORD")

    if not SENDER_EMAIL or not APP_PASSWORD:
        raise EnvironmentError(
            "NGO_EMAIL or APP_PASSWORD not found in environment. "
            "Make sure your .env file is set up correctly."
        )

    SUBJECT = f"New Contact Message from {sender_name}"
    BODY = textwrap.dedent(f"""
        You have received a new message from {sender_name} <{sender_email}>.

        Message:
        {message}

        Please reply to the sender directly at {sender_email}.
    """)

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = support_email
    msg["Subject"] = SUBJECT

    msg.attach(MIMEText(BODY, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, support_email, msg.as_string())

        return True

    except Exception as e:
        print(f"Error sending contact email: {e}")
        return False