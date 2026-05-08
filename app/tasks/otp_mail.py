import os
import textwrap

import sib_api_v3_sdk

from dotenv import load_dotenv
from sib_api_v3_sdk.rest import ApiException

load_dotenv()

SENDER_EMAIL = os.getenv("NGO_EMAIL")
SENDER_NAME = "NGO CONNECT"


def get_api_instance():

    api_key = os.getenv("BREVO_API_KEY", "").strip()

    if not api_key:
        raise ValueError("BREVO_API_KEY is missing")

    configuration = sib_api_v3_sdk.Configuration()

    configuration.api_key = {
        "api-key": api_key
    }

    api_client = sib_api_v3_sdk.ApiClient(configuration)

    return sib_api_v3_sdk.TransactionalEmailsApi(api_client)

def send_email(
    receiver_email: str,
    receiver_name: str,
    expire_time: int,
    otp_code: int,
) -> bool:


    BODY = textwrap.dedent(f"""
        Dear {receiver_name},

        We received a request to sign in to your account.

        Your One-Time Password (OTP) for verification is:

        {otp_code}

        This OTP is valid for the next {expire_time} minutes.
        Please do not share this code with anyone.

        If you did not request this, please ignore this email.

        Thank you,
        NGO CONNECT Team
    """)

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[
            {
                "email": receiver_email,
                "name": receiver_name,
            }
        ],
        sender={
            "email": SENDER_EMAIL,
            "name": SENDER_NAME,
        },
        subject="Your One-Time Password (OTP)",
        text_content=BODY,
    )

    try:

        api_instance = get_api_instance()

        response = api_instance.send_transac_email(email)

        return True

    except ApiException as e:

        print(
            f"Brevo API Error: {e}",
            flush=True
        )

        return False

    except Exception as e:

        print(
            f"Unexpected Email Error: {e}",
            flush=True
        )

        return False


def send_contact_email(
    sender_email: str,
    sender_name: str,
    message: str,
    support_email: str,
) -> bool:

    BODY = textwrap.dedent(f"""
        You have received a new contact message.

        Sender:
        {sender_name} <{sender_email}>

        Message:
        {message}

        Reply directly to:
        {sender_email}
    """)

    email = sib_api_v3_sdk.SendSmtpEmail(
        to=[
            {
                "email": support_email,
            }
        ],
        sender={
            "email": SENDER_EMAIL,
            "name": SENDER_NAME,
        },
        reply_to={
            "email": sender_email,
            "name": sender_name,
        },
        subject=f"New Contact Message from {sender_name}",
        text_content=BODY,
    )

    try:

        api_instance = get_api_instance()

        response = api_instance.send_transac_email(email)

        return True

    except ApiException as e:

        print(
            f"Brevo API Error: {e}",
            flush=True
        )

        return False

    except Exception as e:

        print(
            f"Unexpected Contact Email Error: {e}",
            flush=True
        )

        return False