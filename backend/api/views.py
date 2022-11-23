#Imports

from django.http import HttpRequest, HttpResponse
import mimetypes

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.core.files.storage import default_storage, DefaultStorage
from django.core.files.base import File

from .utils import utils_authentication as auth
from .utils import utils_db

@api_view(['GET'])
#Main API View
def main(request: HttpRequest):
    return Response(data={'msg':'API Main Page'}, status=status.HTTP_200_OK, template_name='api.html')

#Login Api View
@api_view(['POST'])
def login(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If username or password is not in request return error 400 to client
        if not request_data.get('username') or not request_data.get('password'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html')
        #Get user from database if exist
        user = utils_db.login(request_data.get('username'), request_data.get('password'))
        #If user don't exist in db return error 401 to client
        if not user:
             return Response(data={'state':'Could not verify login'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html')
        #Login user in server
        auth.login_user(request, user)
        #Generate JWT with user data
        access_token = auth.generate_jwt_access_token(user)
        #Return access_token to client
        response = Response(data={'access_token': access_token}, status=status.HTTP_200_OK, template_name='api.html')
        response.set_cookie('access_token', access_token)
        return response
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def logout(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            auth.logout_user(request)
            response = Response(data={'state':'Success'}, status=status.HTTP_200_OK, template_name='api.html')    
            response.set_cookie('access_token', '', 0)
            return response
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def validate_email(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If email is not in request return error 400 to client
        if not request_data.get('email'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html')
        else:
            #If reset password key has been sent earlier and email equals to session email, return error 423 to client
            if  request.session.get('reset_password_key') and  request.session.get('reset_password_email') == request_data.get('email'):
                return Response(data={'state':'Password Reset Key as been sent earlier'}, status=status.HTTP_423_LOCKED, template_name='api.html')
            #If reset password key has not been sent earlier or email not equals to session email, enter if
            else:
                #Get email from database if exist
                email_valid = utils_db.email_validation(request_data.get('email'))
                print(email_valid)
                #If email don't exist in db return 401 Error
                if not email_valid:
                    return Response(data={'state':'Could not verify email'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html')
                #If email exist in db, save reset_password_email and reset_password_key in session, and send reset_password_key to client email
                else:
                    #Save email in user session
                    request.session['reset_password_email'] = email_valid['email']
                    reset_password_key = auth.send_reset_password_email(email_valid['email'])
                    #Save reset password key in user session
                    request.session['reset_password_key'] = reset_password_key
                    #Return success to client
                    return Response(data={'state': 'Success'}, status=status.HTTP_200_OK, template_name='api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def validate_reset_key(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If key is not in request return error 400 to client
        if not request_data.get('key'):
            return Response(data={'state':'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html')
        else:
            #If session reset_password_key not equals request key return error 401
            if(request.session.get('reset_password_key') != request_data.get('key')):
                return Response(data={'state':'Invalid reset key'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html')
            #If session reset_password_key equals request key, set session valid_reset_key to true and return success to client
            else:
                request.session['valid_reset_key'] = True
                return Response(data={'state': 'Success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def change_user_password(request: HttpRequest):
    try:
        #Get parsed content of request body
        request_data: dict = request.data
        #If new password is not in request return error 400 to client
        if not request_data.get('password'):
                return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html') 
        else:
            #If session don't have a valid reset key and don't have a valid email return error 401 to client
            if(request.session.get('valid_reset_key') != True and not request.session.get('email')):
                return Response(data={'state':'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html')
            else:    
                #If password has been changed in DB return success to client
                passwordChanged: bool = utils_db.change_user_password(request.session.get('reset_password_email'), request_data.get('password'))
                return Response(data={'state': 'Password Changed'}, status=status.HTTP_200_OK)
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['GET'])
def get_users(request: HttpRequest):
    if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
    else:
        allusers = utils_db.get_users()
        return Response(data=allusers, status=status.HTTP_200_OK, template_name='api.html')
    
@api_view(['POST'])
def get_tickets(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
                response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
                response.set_cookie('access_token', '', 0)
                return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            tickets = utils_db.get_tickets(request_data)
            #Return success to client
            return Response(data=tickets, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])  
def get_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            t_code: int | None = request_data.get('t_code')
            if(t_code != None):
                ticket = utils_db.get_ticket(t_code)
                #Return success to client and set cookie with current ticket
                return Response(data=ticket, status=status.HTTP_200_OK, template_name='api.html')
            else:
                return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def get_tickets_msgs(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            t_code: int | None = request_data.get('t_code')
            if(t_code != None):
                ticket = utils_db.get_ticket_msgs(t_code)
                #Return success to client
                return Response(data=ticket, status=status.HTTP_200_OK, template_name='api.html')
            else:
                return Response(data={'state': 'Invalid request syntax'}, status=status.HTTP_400_BAD_REQUEST, template_name='api.html') 
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])     
def create_ticket_msg(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            utils_db.create_ticket_msg(request_data)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def create_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            utils_db.create_ticket(request_data)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def change_ticket_viewed_state(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            t_code = request_data.get('t_code')
            username = request_data.get('user_name')
            ticket: dict = utils_db.get_ticket(t_code)
            if(ticket.get('validation') == 0):
                print('gestor le toca resp')
                type_recent_message: dict = utils_db.get_most_recent_message(t_code)
                if(username == ticket.get('manager') and type_recent_message != 'R'):
                    print('gestor ha visto el mensaje')
                    utils_db.change_ticket_viewed_state(t_code)
                if(username == ticket.get('user') and type_recent_message == 'R'):
                    print('usuario ha visto el mensaje')
                    utils_db.change_ticket_viewed_state(t_code)
            if(ticket.get('validation') == -1):
                print('usuario le toca resp')
                if(username == ticket.get('user')):
                    print('usuario ha visto el mensje')
                    utils_db.change_ticket_viewed_state(t_code)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def open_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            t_code = request_data.get('t_code')
            updated: int = utils_db.open_ticket(t_code)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def close_ticket(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            t_code = request_data.get('t_code')
            updated: int = utils_db.close_ticket(t_code)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def change_ticket_manager(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            #Get parsed content of request body
            request_data: dict = request.data
            print(request_data)
            t_code = request_data.get('t_code')
            new_manager = request_data.get('manager')
            updated: int = utils_db.change_ticket_manager(t_code, new_manager)
            return Response(data={'state': 'success'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['GET'])
def get_managers(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            managers_list = utils_db.get_managers()
            return Response(data=managers_list, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def upload_file(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            file = request.FILES['file']
            full_path_str: str = default_storage.save('storage-files/' + file.name, file)
            file_name: str = full_path_str.split('storage-files/', maxsplit=1)[1]
            return Response(data={'file_name': file_name}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def delete_file(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            request_data: dict = request.data
            file_name = request_data.get('file')
            if(default_storage.exists('storage-files/' + file_name)):
                default_storage.delete('storage-files/' + file_name)
                return Response(data={'deleted': True}, status=status.HTTP_200_OK, template_name='api.html')
            else:
                return Response(data={'deleted': False}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')

@api_view(['POST'])
def download_file(request: HttpRequest):
    try:
        if not auth.is_authenticated(request):
            response = Response(data={'state':'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED, template_name='api.html') 
            response.set_cookie('access_token', '', 0)
            return response
        else:
            request_data: dict = request.data
            file_name = request_data.get('file')
            if(default_storage.exists('storage-files/' + file_name)):
                file: File = default_storage.open('storage-files/' + file_name, mode="rb")
                data = file.read()
                file.close()
                response: HttpResponse = HttpResponse(data, content_type=mimetypes.guess_type(file_name)[0])
                return response
            else:
                return Response(data={'state': 'Error getting file'}, status=status.HTTP_200_OK, template_name='api.html')
    except Exception as e:
        print("An exception occurred - " + format(e))
        return Response(data={'state':'Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR, template_name='api.html')
