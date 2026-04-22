import smtplib
import os
import textwrap
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()


def send_email(receiver_email: str, receiver_name: str, amount: int, transaction_id: int) -> bool:

    SENDER_EMAIL = os.getenv("NGO_EMAIL")
    APP_PASSWORD = os.getenv("APP_PASSWORD")

    if not SENDER_EMAIL or not APP_PASSWORD:
        raise EnvironmentError(
            "NGO_EMAIL or APP_PASSWORD not found in environment. "
            "Make sure your .env file is set up correctly."
        )

    SUBJECT = "Thank You for Your Donation!"
    BODY = textwrap.dedent(f"""\
        Dear {receiver_name},

        We are truly grateful for your generous contribution. We're happy to confirm that your donation has been successfully received.

        Donation Details:

          Amount:         ₹{amount}
          Date:           {datetime.now().strftime("%d %B %Y")}
          Transaction ID: {transaction_id}

        Your support helps us continue our mission and make a meaningful difference in the lives of those we serve. Because of you, we are able to take one more step toward creating a better and more equitable future.

        If you have any questions or need further assistance, please feel free to reply to this email.

        Once again, thank you for your kindness and support.

        Warm regards,
        NGO CONNECT,
        {SENDER_EMAIL}
    """)

    msg = MIMEMultipart()
    msg["From"]    = SENDER_EMAIL
    msg["To"]      = f"{receiver_name} <{receiver_email}>"
    msg["Subject"] = SUBJECT
    msg.attach(MIMEText(BODY, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())

    return True