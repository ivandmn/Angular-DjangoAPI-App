#Imports

from django.http import HttpRequest, HttpResponse
import mimetypes

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser

from django.core.files.storage import default_storage, DefaultStorage
from django.core.files.base import File

from datetime import datetime, timedelta

from .utils import utils_authentication as auth
from .utils import utils_email
from .utils import utils_db

@api_view(['GET'])
@parser_classes([JSONParser])
def main(request: HttpRequest):
    return Response(data={'msg':'API Main Page'}, status=status.HTTP_200_OK, template_name='api.api.html')

# -------------------------------------------------------------------Authentication API-------------------------------------------------------------------

@api_view(['POST'])
@parser_classes([JSONParser])
def login(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If username or password is not in request return error 400 to client
        if not request_data.get('username') or not request_data.get('password'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')
        #Get user from database if exist
        user = utils_db.login(request_data.get('username'), request_data.get('password'))
        #If user don't exist in db return error 401 to client
        if not user:
             return Response(data={'state':'Could not verify login'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html')
        else:
            if(user.get('f_baja')):
                return Response(data={'state':'This user is disabled'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html')
        #Login user in server
        auth.login_user(request, user)
        #Generate JWT with user data
        access_token = auth.generate_jwt_access_token(user)
        #Return access_token to client
        response = Response(data={'access_token': access_token}, status=status.HTTP_200_OK, template_name='api.api.html')
        response.set_cookie('access_token', access_token)
        return response
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def logout(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        auth.logout_user(request)
        response = Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')    
        response.set_cookie('access_token', '', 0)
        return response
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def validate_email(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If email is not in request return error 400 to client
        if not request_data.get('email'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')
        #If reset password key has been sent earlier and email equals to session email, return error 423 to client
        if(utils_db.can_send_reset_password_email(request_data.get('email')) == False):
            if(request.session.get('reset_password_email')):
                del request.session['reset_password_email']
            email_valid = utils_db.email_validation(request_data.get('email'))
            if(not email_valid):
                 return Response(data={'state':'Could not verify email'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html')
            else:
                return Response(data={'state':'Send email to this user disabled', 'time': email_valid.get('reset_password_date')}, status=status.HTTP_423_LOCKED, template_name='api.api.html')
        else:
            utils_db.update_reset_password_expiration_time(request_data.get('email'))
            reset_password_key = utils_email.send_reset_password_email(request_data.get('email'))
            #Save email in user session
            request.session['reset_password_email'] = request_data.get('email')
            #Save reset password key in user session
            request.session['reset_password_key'] = reset_password_key
            #Return success to client
            return Response(data={'state': 'Success'}, status=status.HTTP_200_OK, template_name='api.api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def validate_reset_key(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If key is not in request return error 400 to client
        if not request_data.get('key'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')
        else:
            #If session reset_password_key not equals request key return error 401
            if(request.session.get('reset_password_key') != request_data.get('key') and not request.session.get('reset_password_email')):
                request.session['valid_reset_key'] = False
                return Response(data={'state':'Invalid reset key'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html')
            #If session reset_password_key equals request key, set session valid_reset_key to true and return success to client
            else:
                request.session['valid_reset_key'] = True
                return Response(data={'state': 'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_user_password(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If new password is not in request return error 400 to client
        if not request_data.get('password'):
            return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')
        if(request.session.get('logged')):
            utils_db.change_user_password(request.session.get('email'), request_data.get('password'))
        else:
            #If session don't have a valid reset key and don't have a valid email return error 401 to client
            if(request.session.get('valid_reset_key') != True and not request.session.get('email')):
                return Response(data={'state':'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html')
            #Change password and return success to client
            utils_db.change_user_password(request.session.get('reset_password_email'), request_data.get('password'))
        return Response(data={'state': 'Password Changed'}, status=status.HTTP_200_OK)
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

# -------------------------------------------------------------------Tickets API-------------------------------------------------------------------


@api_view(['POST'])
@parser_classes([JSONParser])
def get_tickets(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
                response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
                response.set_cookie('access_token', '', 0)
                return response
        #Get parsed content of request body
        request_data: dict = request.data
        tickets = utils_db.get_tickets(request_data, request)
        #Return success to client
        return Response(data=tickets, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])  
@parser_classes([JSONParser])
def get_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        t_code: int | None = request_data.get('t_code')
        if(t_code != None):
            ticket = utils_db.get_ticket(t_code)
            #Return success to client and set cookie with current ticket
            return Response(data=ticket, status=status.HTTP_200_OK, template_name='api.api.html')
        else:
            return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def get_tickets_msgs(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        t_code: int | None = request_data.get('t_code')
        if(t_code != None):
            ticket = utils_db.get_ticket_msgs(t_code)
            #Return success to client
            return Response(data=ticket, status=status.HTTP_200_OK, template_name='api.api.html')
        else:
            return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def get_tickets_count(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
                response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
                response.set_cookie('access_token', '', 0)
                return response
        #Get parsed content of request body
        request_data: dict = request.data
        tickets_count = utils_db.get_tickets_count(request_data, request)
        #Return success to client
        return Response(data=tickets_count, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])
@parser_classes([JSONParser])
def get_pending_tickets_count(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
                response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
                response.set_cookie('access_token', '', 0)
                return response
        pending_tickets_count = utils_db.get_pending_tickets_count(request)
        #Return success to client
        return Response(data=pending_tickets_count, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def get_tickets_date_range(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
                response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
                response.set_cookie('access_token', '', 0)
                return response
        #Get parsed content of request body
        request_data: dict = request.data
        tickets_date_range = utils_db.get_tickets_date_range(request_data, request)
        #Return success to client
        return Response(data=tickets_date_range, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])
@parser_classes([JSONParser])
def get_users(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        allusers = utils_db.get_users()
        return Response(data=allusers, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])
def get_categories(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        categories_list = utils_db.get_categories()
        return Response(data=categories_list, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])
def get_managers(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        managers_list = utils_db.get_managers()
        return Response(data=managers_list, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def get_users_info(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        users = utils_db.get_users_info(request_data)
        return Response(data=users, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def get_user_info(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        user = utils_db.get_user_info(request_data.get('username'))
        return Response(data=user, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
    
@api_view(['POST'])
@parser_classes([JSONParser])
def edit_user(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        if(request_data.get('username') and request_data.get('full_name') and request_data.get('email')):
            userEditObject = {'usrname': request_data.get('full_name').strip(),
                              'email': request_data.get('email').strip(),
                              'powerbi_permissions': request_data.get('pwbi_permissions')}
            utils_db.edit_user(request_data.get('username'), userEditObject)
            if(request.session.get('username') == request_data.get('username')):
                request.session['powerbi_permissions'] = request_data.get('pwbi_permissions') 
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
        else:
            return Response(data={'state':'Bad Request'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')  
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  
  
@api_view(['POST'])
@parser_classes([JSONParser])
def disable_user(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        username = request_data.get('username')
        updated: int = utils_db.disable_user(username)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  
  
@api_view(['POST'])
@parser_classes([JSONParser])
def enable_user(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        username = request_data.get('username')
        updated: int = utils_db.enable_user(username)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  

@api_view(['POST'])
@parser_classes([JSONParser])
def create_user(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        if(request_data.get('name') and request_data.get('pasword') and request_data.get('usrname') and request_data.get('privilegios') and request_data.get('email') and request_data.get('powerbi_permissions')):
            user_created: int = utils_db.create_user(request_data)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
        else:
            return Response(data={'state': 'Bad request'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  

@api_view(['POST'])
@parser_classes([JSONParser])
def get_user_img_path(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        if(request_data):
            user_img_path = utils_db.get_user_img_path(request_data.get('username'))
        else:
            user_img_path = None
        return Response(data={'img_path':user_img_path}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  


@api_view(['GET'])  
@parser_classes([JSONParser])
def update_tickets_position(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        utils_db.update_tickets_position()
        return Response(data={'state':'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
     
@api_view(['POST'])
@parser_classes([JSONParser]) 
def create_ticket_msg(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        utils_db.create_ticket_msg(request,request_data)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def create_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        print(request_data)
        utils_db.create_ticket(request, request_data)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_viewed_state(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        ticket: dict = utils_db.get_ticket(t_code)
        type_recent_message: dict = utils_db.get_most_recent_message_type(t_code)
        if(request.session.get('username') == ticket.get('manager') and type_recent_message == 'P'):
            utils_db.change_ticket_viewed_state(t_code)
        if(request.session.get('username') == ticket.get('user') and type_recent_message == 'R'):
            utils_db.change_ticket_viewed_state(t_code)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def open_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        utils_db.open_ticket(t_code)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def close_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        utils_db.close_ticket(t_code)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_manager(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        new_manager = request_data.get('manager')
        updated: int = utils_db.change_ticket_manager(t_code, new_manager)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_user(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        new_user = request_data.get('user')
        updated: int = utils_db.change_ticket_user(t_code, new_user)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')


@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_priority(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        new_priority = request_data.get('priority')
        updated: int = utils_db.change_ticket_priority(t_code, new_priority)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_category(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        new_category = request_data.get('category')
        updated: int = utils_db.change_ticket_categroy(t_code, new_category)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def change_ticket_validation(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        #Get parsed content of request body
        request_data: dict = request.data
        t_code = request_data.get('t_code')
        new_validation = request_data.get('validation')
        updated: int = utils_db.change_ticket_validation(t_code, new_validation)
        return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def upload_file(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        file = request.FILES['file']
        file_name: str = default_storage.save('Imagenes/' + file.name, file)
        return Response(data={'file_name': file_name.split('/')[1]}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def upload_file_existing_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        file = request.FILES['file']
        request_data = request.data
        duplicated_file = utils_db.check_duplicated_files(file.name, request_data.get('t_code'))
        if(duplicated_file):
            if(duplicated_file.get('adjunto')):
                if(default_storage.exists('Imagenes/' + duplicated_file.get('adjunto').strip())):
                    default_storage.delete('Imagenes/' + duplicated_file.get('adjunto').strip())
        file_name: str = default_storage.save('Imagenes/' + file.name, file)
        return Response(data={'file_name': file_name.split('/')[1]}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def download_file(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        file_name = request_data.get('file')
        if(default_storage.exists('Imagenes/' + file_name)):
            file: File = default_storage.open('Imagenes/' + file_name, mode="rb")
            data = file.read()
            file.close()
            response: HttpResponse = HttpResponse(data, content_type=mimetypes.guess_type(file_name)[0])
            return response
        else:
            return Response(data={'state': 'Error getting file'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
@parser_classes([JSONParser])
def download_manual(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        file_name = request_data.get('file')
        if(default_storage.exists('Manuales/' + file_name)):
            file: File = default_storage.open('Manuales/' + file_name, mode="rb")
            data = file.read()
            file.close()
            response: HttpResponse = HttpResponse(data, content_type=mimetypes.guess_type(file_name)[0])
            return response
        else:
            return Response(data={'state': 'Error getting file'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def get_manuals(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        manuals_list = utils_db.get_manuals(request, request_data.get('clave'))
        return Response(data=manuals_list, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])
def get_manuals_categories(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        manuals_categories_list = utils_db.get_manuals_categories(request)
        return Response(data=manuals_categories_list, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def upload_profile_img(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        file = request.FILES['file']
        user_img_exist = utils_db.get_user_info(request.session.get('username'))
        if(user_img_exist.get('image')):
            if(default_storage.exists('user-profile/' + user_img_exist.get('image').strip())):
                default_storage.delete('user-profile/' + user_img_exist.get('image').strip())
        file_name: str = default_storage.save('user-profile/' + request.session.get('username') + '.' + file.name.split('.')[1], file)
        user = utils_db.save_profile_img(request, file_name.split('/')[1])
        access_token = auth.generate_jwt_access_token(user)
        response = Response(data={'file_name': file_name}, status=status.HTTP_200_OK, template_name='api.api.html')
        response.set_cookie('access_token', access_token)
        return response      
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
    
@api_view(['POST'])
def download_profile_img(request: HttpRequest):
    try:
        request_data: dict = request.data
        file_name = request_data.get('file')
        if(file_name):
            if(default_storage.exists('user-profile/' + file_name)):
                file: File = default_storage.open('user-profile/' + file_name, mode="rb")
                data = file.read()
                file.close()
                response: HttpResponse = HttpResponse(data, content_type=mimetypes.guess_type(file_name)[0])
                return response
        file: File = default_storage.open('user-profile/default.png', mode="rb")
        data = file.read()
        file.close()
        response: HttpResponse = HttpResponse(data, content_type='image/png')
        return response
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
    
# -----------------------------------PowerBi API-----------------------------------

@api_view(['GET'])
def get_powerbi_categories(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        powerbi_cat = utils_db.get_powerbi_categories(request)
        return Response(data=powerbi_cat, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
    
@api_view(['GET'])
def get_all_powerbi_categories(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html')
        powerbi_cat = utils_db.get_all_powerbi_categories()
        return Response(data=powerbi_cat, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def get_powerbi_category(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        pwbi_cat_id = request_data.get('category_id')
        powerbi_cat = utils_db.get_powerbi_category(pwbi_cat_id, request)
        if(powerbi_cat == None):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html')
        else:
            return Response(data=powerbi_cat, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def create_pwbi_publication(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        request_data: dict = request.data
        utils_db.create_pwbi_publication(request_data)
        return Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def delete_pwbi_publication(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        request_data: dict = request.data
        utils_db.delete_pwbi_publication(request_data.get('publication_id'))
        return Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])
def change_publication_newness_state(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        if not auth.is_admin(request):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        request_data: dict = request.data
        utils_db.change_publication_newness_state(request_data.get('publication_id'), request_data.get('state'))
        return Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['GET'])  
def get_pwbi_newness_publications(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        pwbi_p_n = utils_db.get_pwbi_all_newness_publications(request)
        return Response(data=pwbi_p_n, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])  
def get_pwbi_publications_news(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        pwbi_p_n = utils_db.get_pwbi_publications_news(request_data.get('category_id'), request)
        if(pwbi_p_n == None):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html')
        else:
            return Response(data=pwbi_p_n, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])  
def get_pwbi_publications_guides(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        pwbi_p_g = utils_db.get_pwbi_publications_guides(request_data.get('category_id'), request)
        if(pwbi_p_g == None):
           return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html') 
        else:
            return Response(data=pwbi_p_g, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])  
def get_pwbi_publication(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        pwbi_p = utils_db.get_pwbi_publication(request_data.get('publication_id'), request)
        print(pwbi_p)
        if(pwbi_p == None):
            return Response(data={'state':'Permission denied'}, status=status.HTTP_403_FORBIDDEN, template_name='api.api.html')
        else:
            return Response(data=pwbi_p, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')

@api_view(['POST'])  
def start_user_statistic_info(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        id_statistic = utils_db.start_user_statistic_info(request_data, request)
        return Response(data={'id_statistic': id_statistic}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')
    
@api_view(['POST'])  
def end_user_statistic_info(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        request_data: dict = request.data
        if(request_data.get('ids_statistics')):
            utils_db.end_user_statistic_info(request_data.get('ids_statistics'))
        return Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.api.html')  




    