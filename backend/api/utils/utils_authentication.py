#Imports

from django.http import HttpRequest
from django.core.mail import send_mail

from .. import models as db

from typing import Any
from random import randint
from decouple import config
import jwt

#Authenticate functions

def login_user(request: HttpRequest, user: dict[str, Any]):
    request.session['user'] = user

def logout_user(request: HttpRequest):
    request.session.delete()

def send_reset_password_email(email: str) -> str | None:
    try:
        reset_key = generate_random_password_reset_key()
        send_mail(
            subject=f'Silver Sanz - Password Reset Code',
            message= "Reset Code - " + reset_key,
            from_email= config('EMAIL_USER'),
            recipient_list= [email]
        )
        return reset_key
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None 

def generate_random_password_reset_key() -> str | None:
    try:
        random_key: int = randint(0, 999999999)
        final_key: str = str(random_key).zfill(9)
        return final_key
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None

# JWT Functions

def generate_jwt_access_token(user: dict[str, Any]) -> str | None:
    try:
        access_token: str = jwt.encode({"user": user}, config('SECRET_KEY'), algorithm="HS256")
        return access_token
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None

def decode_jwt_access_token(encoded_token: str) -> dict[str, Any] | None: 
    try:  
        decoded_token: dict[str, Any] = jwt.decode(encoded_token, config('SECRET_KEY'), algorithms=["HS256"])
        return decoded_token
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None 

def get_jwt_access_token_from_request_header(auth_header: str) -> str | None:
    try: 
        auth_header_array: list[str] = auth_header.split()
        return auth_header_array[1]
    except Exception as e: 
        print("An exception occurred - " + format(e))
        return None 



    
    



