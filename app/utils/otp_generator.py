import random
from datetime import datetime, timedelta


def generate_otp() -> tuple[int, datetime]:

    otp = random.randint(100000, 999999)

    expiry_time = datetime.utcnow() + timedelta(minutes=10)

    return otp, expiry_time