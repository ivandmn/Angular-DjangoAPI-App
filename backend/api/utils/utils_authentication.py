from decouple import config
from django.http import HttpRequest
from django.core.mail import send_mail

from typing import Any
from random import randint
import jwt


import datetime
import pytz

from .. import models as db
from . import utils_templates_email as email_templates


def is_authenticated(request: HttpRequest) -> bool:
    """
    Is Authenticated - Check if user is authenticated
    
    Args:
        request (HttpRequest): User request

    Returns:
        bool: Returns True if is authenticated or False if is not authenticated
    """
    #If authorization token is not in request headers or user is not logged in session return False
    if not request.headers.get('Authorization') or request.session.get('logged') != True:
        return False
    #Get user access token from request headers
    encoded_token = get_jwt_access_token_from_request_header(request.headers.get('Authorization'))
    #Try to decode token 
    decoded_token = decode_jwt_access_token(encoded_token)
    #If token is invalid or expired, return False
    if not decoded_token:
        return False
    #If token is valid, return True
    else:
        return True

def is_admin(request: HttpRequest) -> bool:
    """
    Is Admin - Check if user is admin
    
    Args:
        request (HttpRequest): User request

    Returns:
        bool: Returns True if is admin or False if is not admin
    """
    if(request.session.get('rol') == 'admin'):
        return True
    else:
        return False


def login_user(request: HttpRequest, user: dict[str, Any]) -> None:
    """
    Login User - Save user info in session
    
    Args:
        request (HttpRequest): User request
        user (dict): Dict with user info
    """
    request.session['username'] = user.get('username')
    request.session['name'] = user.get('name')
    request.session['email'] = user.get('email')
    request.session['rol'] = user.get('rol')
    request.session['logged'] = True

def logout_user(request: HttpRequest) -> None:
    """
    Logout User - Delete user info from session
    
    Args:
        request (HttpRequest): User request
    """
    del request.session['username']
    del request.session['name']
    del request.session['email']
    del request.session['rol']
    request.session['logged'] = False


def send_reset_password_email(email: str) -> str | None:
    """
    Send Reset Password Email - Send email to user with reset key
    
    Args:
        email (str): User email

    Returns:
        reset_key (str | None): Returns reset key
    """
    try:
        reset_key = generate_random_password_reset_key()
        send_mail(
            subject=f'Silver Sanz - Password Reset Code',
            message="",
            html_message= email_templates.reset_password_template.format(reset_key),
            from_email= config('EMAIL_USER'),
            recipient_list= [email]
        )
        return reset_key
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None 

def generate_random_password_reset_key() -> str | None:
    """
    Generate Random Password Reset Key - Generate a random 9 digits number

    Returns:
        reset_key (str | None): Returns generated reset key
    """
    try:
        random_number: int = randint(0, 999999999)
        reset_key: str = str(random_number).zfill(9)
        return reset_key
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None

def generate_jwt_access_token(user: dict[str, Any]) -> str | None:
    """
    Generate JWT Access Token - Generate JSON Web Token with user info signed with secret password
    
    Args:
        user (dict): Dict with user info

    Returns:
        access_token (str | None): Returns access_token
    """
    try:
        access_token: str = jwt.encode({"user": user, "exp": datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))) + datetime.timedelta(days=1)}, config('SECRET_KEY'), algorithm="HS256")
        return access_token
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None

def decode_jwt_access_token(encoded_token: str) -> dict[str, Any] | None:
    """
    Decode JWT Access Token - Decode JSON Web Token with secret password
    
    Args:
        encoded_token (str): JWT encoded

    Returns:
        decoded_token (dict | None): Returns decoded token
    """
    try:  
        decoded_token: dict[str, Any] = jwt.decode(encoded_token, config('SECRET_KEY'), algorithms=["HS256"])
        return decoded_token
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None 

def get_jwt_access_token_from_request_header(auth_header: str) -> str | None:
    """
    Get JWT Access Token From Request Header - Get Json Web Token from request authentication header
    
    Args:
        auth_header (str): Authentication header

    Returns:
        access_token (str): Returns access token
    """
    try: 
        auth_header_array: list[str] = auth_header.split()
        access_token: str = auth_header_array[1]
        return access_token
    except Exception as e: 
        print("An exception occurred - " + format(e))
        return None 



    
    



