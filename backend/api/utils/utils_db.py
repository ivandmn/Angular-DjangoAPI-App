from api import serializers
from api import models as db

from django.db.models import Max
from django.db.models import Q

from decouple import config
import pytz

from django.http import HttpRequest

import datetime
from datetime import timedelta

from typing import Any

from . import utils_email

class dbError(Exception):
    pass

def login(_username: str, _password: str) -> dict[str, Any] | None:
    """
    Login - Check if user is in DB with given username and password
    
    Args:
        _username (str): User Name string
        _password (str): User Password string

    Returns:
        result (dict | None): Returns dict with user if found | None if not found
    """
    try:
        result_query: db.SsUser | None = db.SsUser.objects.filter(name=_username, pasword=_password).first()
        if not result_query:
            return None
        result: dict[str, Any] = serializers.loginSerializer(result_query)
        return result.data
    except Exception as e:
        raise dbError(format(e))

def email_validation(_email: str) -> dict[str, Any] | None:
    """
    Email Validation - Check if email exists in DB
    
    Args:
        _email (str): User email string

    Returns:
        result (dict | None): Returns dict with email if found | None if not found 
    """
    try: 
        result_query: db.SsUser | None = db.SsUser.objects.filter(email=_email).first()
        if not result_query:
            return None
        result: dict[str, Any] = {'email': result_query.email.strip(), 'reset_password_date': result_query.reset_password_date + timedelta(minutes=1)}
        return result
    except Exception as e:
        raise dbError(format(e))
    
def can_send_reset_password_email(_email: str) -> bool:
    try: 
        result_query: db.SsUser | None = db.SsUser.objects.filter(email=_email).first()
        if not result_query:
            return False
        if(result_query.reset_password_date):
            if(result_query.reset_password_date > datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE")))):
                return False
            else:
                return True
        else:
            return True
    except Exception as e:
        raise dbError(format(e))

def update_reset_password_expiration_time(_email: str) -> int:
    try: 
        updated: db.SsUser | None = db.SsUser.objects.filter(email=_email).update(reset_password_date = datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))) + timedelta(minutes=10))
        return updated
    except Exception as e:
        raise dbError(format(e))  
    

def change_user_password(_email: str, newpassword: str) -> int:
    """
    Change User Password - Change user password in DB with given email
    
    Args:
        _email (str): User email string
        newpassword(str): New user password string

    Returns:
        result (int): Return 1 if password change or 0 if password not change
    """
    try: 
        row_updated: int = db.SsUser.objects.filter(email=_email).update(pasword=newpassword)
        return row_updated
    except Exception as e:
        raise dbError(format(e))

def get_users() -> list[dict[str, Any]] | list: 
    """
    Get Users - Get username and name for all users in DB

    Returns:
        result (list[dict[str, Any]]): Return list with all users
    """
    try:
        result_query = db.SsUser.objects.all().order_by('usrname')
        result: list[dict[str, Any]] = serializers.shortUserSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))

def get_users_info(options_filter: dict) -> list[dict[str, Any]] | list: 
    """
    Get Users - Get info for all users in DB

    Returns:
        result (list[dict[str, Any]]): Return list with all users
    """
    try:
        if(options_filter.get('username')):
            result_query = db.SsUser.objects.all().filter(Q(name__icontains=options_filter.get('username')) | Q(usrname__icontains=options_filter.get('username'))).order_by('usrname')
        else:
            result_query = db.SsUser.objects.all().order_by('usrname')
        result: list[dict[str, Any]] = serializers.FullUserSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
def get_user_info(username: str) -> dict[str, Any]: 
    """
    Get User - Get info user with given username

    Returns:
        result (dict[str, Any]): Return user info
    """
    try:
        result_query = db.SsUser.objects.filter(name=username).first()
        result: list[dict[str, Any]] = serializers.FullUserSerializer(result_query)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
def edit_user(username: str, objedit) -> int:
    try:
        return db.SsUser.objects.filter(name=username).update(**objedit)
    except Exception as e:
        raise dbError(format(e))
    
    
def disable_user(username: str) -> int: 
    """
    Disable user - Disable user from database adding f_baja

    Returns:
        int: 1 if disabled, 0 if not
    """
    try:
        updated: int = db.SsUser.objects.filter(name=username).update(f_baja=datetime.datetime.now())
        return updated
    except Exception as e:
        raise dbError(format(e))
    
def enable_user(username: str) -> int: 
    """
    Enable user - Enable user from database removing f_baja

    Returns:
        int: 1 if enabled, 0 if not
    """
    try:
        updated: int = db.SsUser.objects.filter(name=username).update(f_baja=None)
        return updated
    except Exception as e:
        raise dbError(format(e))
    
def create_user(user_object: dict) -> int:
    try:
        user_rol: int = 99
        if(user_object.get('privilegios') == 'admin'):
            user_rol = 9999
        user_code = get_user_code()
        new_user = db.SsUser.create_new_user(user_code, user_object.get('name'), user_object.get('usrname'), user_object.get('pasword'), user_rol, user_object.get('email'), user_object.get('powerbi_permissions'))
        #Insert ticket header in DB
        new_user.save()
        return 1
    except Exception as e:
        raise dbError(format(e))

def get_user_img_path(username: str) -> dict[str, Any]: 
    try:
        result_query = db.SsUser.objects.filter(name=username).values('imagen').first()
        if(result_query.get('imagen')):
            return result_query.get('imagen').strip()
        else:
            return result_query.get('imagen')
    except Exception as e:
        raise dbError(format(e))

    

def get_managers() -> list[dict[str, Any]]:
    """
    Get Managers - Get username and name for users that are managers in DB

    Returns:
         result (list[dict[str, Any]]): Returns list with all managers users
    """
    try: 
        result_query = db.SsUser.objects.filter(privilegios__gt=99)
        result: list[dict[str, Any]] = serializers.shortUserSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
def get_categories() -> list[dict[str, Any]]:
    """
    Get Categories - Get ticket categories in DB

    Returns:
         result (list[dict[str, Any]]): Returns list with all categories
    """
    try: 
        result_query: list[dict[str, Any]] = db.SsTablas.objects.filter(tipo='CATG').distinct() 
        result: list[dict[str, Any]] = serializers.categorySerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))

def get_tickets(ticket_options: dict, request: HttpRequest) -> list[dict[str, Any]] | list:
    """
    Get tickets - Return all tickets with given manager, username, category and state
    
    Args:
        ticket_options (dict): Dict with ticket search options

    Returns:
        result[list[tickets]]: Returns list of tickets
    """
    result: list[dict[str, Any]] = []
    result_query_min: list[db.SsAdmCasosH] = []
    try: 
        priority_tickets_hash_map = {1: 'BAJA', 2: 'MEDIA', 3: 'ALTA', 4: 'URGENTE'}
        category_tickets_hash_map = {}
        result_category: db.models.BaseManager[db.SsTablas] = db.SsTablas.objects.filter(tipo='CATG').distinct() 
        for category in result_category:
            category_tickets_hash_map[category.code.strip()] = category.name.strip()
        p: int = ticket_options.get('page')
        ixp: int = ticket_options.get('itemsPerPage')
        parsed_options = {'gestor': ticket_options.get('manager'), 'usuario': ticket_options.get('username'), 'estado': ticket_options.get('state'), 'categoria': ticket_options.get('category'), 'validacion': ticket_options.get('validation'), 'viewed': ticket_options.get('viewed')}
        final_options = {k: v for k, v in parsed_options.items() if v or v==0}

        if(ticket_options.get('userMode') == True): 
            result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(~Q(gestor=request.session.get('username'))).order_by('-prioridad', 'f_alta')[(p-1)*ixp:p*ixp]
        else:
            if(ticket_options.get('searchMode') == True):
                if(ticket_options.get('title')):
                    if(ticket_options.get('fechaInicio') and ticket_options.get('fechaFin')):
                        result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(f_alta__gte=ticket_options.get('fechaInicio'), f_alta__lt=ticket_options.get('fechaFin')).filter(titulo__icontains=ticket_options.get('title')).order_by('-f_alta')[(p-1)*ixp:p*ixp]
                    else:
                        result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(titulo__icontains=ticket_options.get('title')).order_by('-f_alta')[(p-1)*ixp:p*ixp]
                else:
                    if(ticket_options.get('fechaInicio') and ticket_options.get('fechaFin')):
                        result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(f_alta__gte=ticket_options.get('fechaInicio'), f_alta__lt=ticket_options.get('fechaFin')).order_by('-f_alta')[(p-1)*ixp:p*ixp]
                    else:
                        result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).order_by('-f_alta')[(p-1)*ixp:p*ixp]
            else:
                result_query_min: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).order_by('-prioridad', 'f_alta')[(p-1)*ixp:p*ixp]
        
        if(ticket_options.get('viewed') == 0):
            for row in result_query_min:
                type_most_recent_message: str = get_most_recent_message_type(row.code)
                date_most_recent_message: datetime.date = get_most_recent_message_date(row.code)
                if(request.session.get('rol') == 'admin'):
                    if(request.session.get('username') == row.gestor.strip() and row.usuario.strip() != row.gestor.strip() and type_most_recent_message == 'P'):
                        result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map.get(row.categoria), 'priority': priority_tickets_hash_map.get(row.prioridad), 'state': row.estado.strip(), 'position':  row.position, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': type_most_recent_message, 'last_msg_date': date_most_recent_message, 'ticket_closed_date': row.f_final})
                    if(request.session.get('username') == row.usuario.strip() and row.usuario.strip() != row.gestor.strip() and type_most_recent_message == 'R'):
                        result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map.get(row.categoria), 'priority': priority_tickets_hash_map.get(row.prioridad), 'state': row.estado.strip(), 'position':  row.position, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': type_most_recent_message, 'last_msg_date': date_most_recent_message, 'ticket_closed_date': row.f_final})
                else:
                    if(request.session.get('username') == row.usuario.strip() and type_most_recent_message == 'R'):
                        result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map.get(row.categoria), 'priority': priority_tickets_hash_map.get(row.prioridad), 'state': row.estado.strip(), 'position':  row.position, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': type_most_recent_message, 'last_msg_date': date_most_recent_message, 'ticket_closed_date': row.f_final})
        else:
            for row in result_query_min:
                type_most_recent_message: str = get_most_recent_message_type(row.code)
                date_most_recent_message: datetime.date = get_most_recent_message_date(row.code)
                result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map.get(row.categoria), 'priority': priority_tickets_hash_map.get(row.prioridad), 'state': row.estado.strip(), 'position':  row.position, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': type_most_recent_message, 'last_msg_date': date_most_recent_message, 'ticket_closed_date': row.f_final})
        return {'tickets': result}
    except Exception as e:
        raise dbError(format(e))
    
def get_tickets_count(ticket_options: dict, request: HttpRequest) -> int | None:
    """
    Get tickets - Return all tickets count with given manager, username, category and state
    
    Args:
        ticket_options (dict): Dict with ticket search options

    Returns:
        rows (int): Tickets count with search options
    """
    result_query_total: list[db.SsAdmCasosH] = []
    count: int = 0
    total_hours: int = 0
    total_minutes: int = 0
    try:
        parsed_options = {'gestor': ticket_options.get('manager'), 'usuario': ticket_options.get('username'), 'estado': ticket_options.get('state'), 'categoria': ticket_options.get('category'), 'validacion': ticket_options.get('validation'), 'viewed': ticket_options.get('viewed')}
        final_options = {k: v for k, v in parsed_options.items() if v or v==0}
        if(ticket_options.get('userMode') == True): 
                result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(~Q(gestor=request.session.get('username')))
        else:
            if(ticket_options.get('searchMode') == True):
                if(ticket_options.get('title')):
                    if(ticket_options.get('fechaInicio') and ticket_options.get('fechaFin')):
                        result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(f_alta__gte=ticket_options.get('fechaInicio'), f_alta__lt=ticket_options.get('fechaFin')).filter(titulo__icontains=ticket_options.get('title'))
                    else:
                        result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(titulo__icontains=ticket_options.get('title'))
                else:
                    if(ticket_options.get('fechaInicio') and ticket_options.get('fechaFin')):
                        result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(f_alta__gte=ticket_options.get('fechaInicio'), f_alta__lt=ticket_options.get('fechaFin'))
                    else:
                        result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options)
            else:
                result_query_total: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options) 
        if(ticket_options.get('viewed') == 0):
            for row in result_query_total:
                type_most_recent_message: str = get_most_recent_message_type(row.code)
                if(request.session.get('rol') == 'admin'):
                    if(request.session.get('username') == row.gestor.strip() and row.usuario.strip() != row.gestor.strip() and type_most_recent_message == 'P'):
                        count += 1
                    if(request.session.get('username') == row.usuario.strip() and row.usuario.strip() != row.gestor.strip() and type_most_recent_message == 'R'):
                        count += 1
                else:
                    if(request.session.get('username') == row.usuario.strip() and type_most_recent_message == 'R'):
                        count += 1
            return {'count': count}
        else:
            if(ticket_options.get('searchMode') == True):
                for row in result_query_total:
                    count += 1
                    if(row.tiempo != datetime.time(0,0,0)):
                        total_hours += row.tiempo.hour
                        total_minutes += row.tiempo.minute
                total_hours += int(total_minutes/60)
                total_minutes = total_minutes % 60
                return {'count': count, 'total-time': str(total_hours).zfill(2) + 'h-' + str(total_minutes).zfill(2) + 'm-00s'}
            else:
                for row in result_query_total:
                    count += 1
                return {'count': count}
    except Exception as e:
        raise dbError(format(e))

def get_tickets_date_range(ticket_options: dict, request: HttpRequest):
    oldest_ticket: datetime.datetime | None = None
    newest_ticket: datetime.datetime | None = None
    try:
        parsed_options = {'gestor': ticket_options.get('manager'), 'usuario': ticket_options.get('username'), 'estado': ticket_options.get('state'), 'categoria': ticket_options.get('category')}
        final_options = {k: v for k, v in parsed_options.items() if v or v==0}
        if(ticket_options.get('searchMode') == True and ticket_options.get('title')):
            oldest_ticket = db.SsAdmCasosH.objects.filter(**final_options).filter(titulo__icontains=ticket_options.get('title')).order_by('f_alta').first()
            newest_ticket = db.SsAdmCasosH.objects.filter(**final_options).filter(titulo__icontains=ticket_options.get('title')).order_by('-f_alta').first()
        else:
            oldest_ticket = db.SsAdmCasosH.objects.filter(**final_options).order_by('f_alta').first()
            newest_ticket = db.SsAdmCasosH.objects.filter(**final_options).order_by('-f_alta').first()
        
        if(oldest_ticket and newest_ticket):
            return {'f_min': oldest_ticket.f_alta, 'f_max': newest_ticket.f_alta}
        else:
           return {'f_min': None, 'f_max': None} 
    except Exception as e:
        raise dbError(format(e))

def get_pending_tickets_count(request: HttpRequest) -> int | None:
    try:
        if(request.session.get('rol') == 'admin'):
            rows_as_manager: int = db.SsAdmCasosH.objects.filter(gestor=request.session.get('username'), validacion=0, estado='A').count()
            rows_no_viewed_as_manager = 0
            tickets_as_manager = db.SsAdmCasosH.objects.filter(gestor=request.session.get('username'), estado='A').filter(~Q(usuario=request.session.get('username')))
            for ticket_as_manager in tickets_as_manager:
                if(ticket_as_manager.viewed == 0 and get_most_recent_message_type(ticket_as_manager.code) == 'P'):
                    rows_no_viewed_as_manager +=1
            rows_as_user: int = db.SsAdmCasosH.objects.filter(~Q(gestor=request.session.get('username'))).filter(usuario=request.session.get('username'), validacion=-1, estado='A').count()
            rows_no_viewed_as_user: int = 0
            tickets_as_user = db.SsAdmCasosH.objects.filter(usuario=request.session.get('username'), estado='A').filter(~Q(gestor=request.session.get('username')))
            for ticket_as_user in tickets_as_user:
                if(ticket_as_user.viewed == 0 and get_most_recent_message_type(ticket_as_user.code) == 'R'):
                    rows_no_viewed_as_user = rows_no_viewed_as_user + 1
            return {'RM': rows_as_manager, 'RNVM': rows_no_viewed_as_manager, 'RU': rows_as_user, 'RNVU': rows_no_viewed_as_user}
        if(request.session.get('rol') == 'user'):
            rows_as_user: int = db.SsAdmCasosH.objects.filter(usuario=request.session.get('username'), validacion=-1, estado='A').count()
            rows_no_viewed_as_user: int = 0
            tickets_as_user = db.SsAdmCasosH.objects.filter(usuario=request.session.get('username'), estado='A')
            for ticket_as_user in tickets_as_user:
                if(ticket_as_user.viewed == 0 and get_most_recent_message_type(ticket_as_user.code) == 'R'):
                    rows_no_viewed_as_user = rows_no_viewed_as_user + 1
            return {'RU': rows_as_user, 'RNVU': rows_no_viewed_as_user}
    except Exception as e:
        raise dbError(format(e))

def update_tickets_position():
    result_users_manager: list[db.SsUser] = db.SsUser.objects.filter(privilegios__gt=99).values('name').distinct()
    for user_manager in result_users_manager:
        position: int = 0
        result_query: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(gestor=user_manager.get('name').strip(), estado='A').order_by('-prioridad', 'f_alta')
        for row in result_query:
            position += 1
            row.position = position
            row.save()
    
def get_ticket(t_code: int) -> dict[str, Any] | None:
    """
    Get ticket - Return ticket with given code
    
    Args:
        t_code (int): Code ticket

    Returns:
        result (dict): Dict with ticket info if found / None if not found
    """
    try: 
        result_query: db.SsAdmCasosH = db.SsAdmCasosH.objects.filter(code=t_code).first()
        result: dict[str, Any] = serializers.getTicketSerializer(result_query)
        return result.data
    except Exception as e:
        raise dbError(format(e))

def get_ticket_msgs(t_code: int) -> list[dict[str, Any]] | list:
    """
    Get ticket - Return ticket messages with given code
    
    Args:
        t_code (int): Ticket code

    Returns:
        result (list[dict[str, Any]]): List of dict with ticket message objects
    """
    try: 
        result_query = db.SsAdmCasosL.objects.filter(u_docentry=t_code).order_by('code')
        result: list[db.SsAdmCasosL] = serializers.getTicketMsgsSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))

def get_ticket_code_H() -> int | None:
    """
    Get Ticket Code Header - Return the code for a ticket header that is going to insert in DB

    Returns:
        ticket_code (int) - Return max(code) + 1 for tickets_h
    """
    try:
        ticket_code: int = 1
        max_code: dict = db.SsAdmCasosH.objects.aggregate(Max('code'))
        if(max_code.get('code__max')):
            ticket_code = max_code.get('code__max') + 1 
        return ticket_code
    except Exception as e:
        raise dbError(format(e))

def get_ticket_code_l(code_h: int) -> int | None:
    """
    Get Ticket Code List - Return the code for a message in a ticket that is going to insert in DB

    Returns:
        ticket_code (int) - Return max(code) + 1 for tickets_l
    """
    try:
        ticket_code: int = 1
        max_code: dict = db.SsAdmCasosL.objects.filter(u_docentry = code_h).aggregate(Max('code'))
        if(max_code.get('code__max')):
            ticket_code = max_code.get('code__max') + 1 
        return ticket_code
    except Exception as e:
        raise dbError(format(e))
    
def get_user_code() -> int | None:
    try:
        user_code: int = 1
        max_user_code: dict = db.SsUser.objects.aggregate(Max('code'))
        if(max_user_code.get('code__max')):
            user_code = max_user_code.get('code__max') + 1 
        return user_code
    except Exception as e:
        raise dbError(format(e))

def open_ticket(t_code: int) -> int:
    """
    Open Ticket - Update state of ticket to 'A' (open) with the given ticket code

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        row_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(estado='A', f_final=None)
        return row_updated
    except Exception as e:
        raise dbError(format(e))
    
    
def save_profile_img(request: HttpRequest, img: str):
    try:
        db.SsUser.objects.filter(name=request.session.get('username')).update(imagen=img)
        result_query = db.SsUser.objects.filter(name=request.session.get('username')).first()
        result: dict[str, Any] = serializers.loginSerializer(result_query)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
def close_ticket(t_code: int) -> int:
    """
    Close Ticket - Update estate of ticket to 'C' (closed) with the given ticket code

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        row_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(estado='C', f_final=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))), position=None)
        return row_updated
    except Exception as e:
        raise dbError(format(e))

def create_ticket(request: HttpRequest ,ticket: dict) -> None:
    """
    Create Ticket - Create ticket_H with given ticket and ticket_L if ticket have description or file

    Args:
        ticket (dict): Ticket to insert in DB
    """
    try:
        validation: int = 0
        message_type: str = 'P'
        #Get code of new ticket header
        ticket_code = get_ticket_code_H()
        if(ticket.get('manager') == request.session.get('username')):
            validation: int = -1
            message_type: str = 'R'
        #Create new ticket calling class method create_new_ticket()
        new_ticket = db.SsAdmCasosH.create_new_ticket(ticket_code, ticket.get('title'), ticket.get('username'), ticket.get('manager'), ticket.get('priority'), ticket.get('category'), validation)
        #Insert ticket header in DB
        new_ticket.save()
        
        #Get code of new ticket message
        message_code = get_ticket_code_l(ticket_code)
        #Create new ticket message calling class method create_new_ticket_message()
        new_ticket_message = db.SsAdmCasosL.create_new_ticket_message(message_code, ticket_code, ticket.get('description'), ticket.get('file'), '00:00', message_type)
        #Insert ticket message in DB
        new_ticket_message.save()
        
        if(request.session.get('rol').strip() == 'admin' and ticket.get('username').strip() != ticket.get('manager').strip()):
            if(ticket.get('manager').strip() == request.session.get('username').strip()):
                user_email = db.SsUser.objects.filter(name=ticket.get('username').strip()).values('email').first()
                utils_email.send_new_ticket_email(ticket_code, ticket.get('manager'), ticket.get('title'), ticket.get('description'), user_email.get('email').strip())
    except Exception as e:
        raise dbError(format(e))

def create_ticket_msg(request: HttpRequest ,ticket_msg: dict) -> None:
    """
    Create Ticket Message - Create ticket_L with message object given and the code of ticket_H

    Args:
        ticket_msg (dict): Ticket message to insert in DB
    """
    try:
        #Get ticket code
        ticket_code: int | None = ticket_msg.get('t_code')
        #Get code of new ticket message
        ticket_msg_code: int = get_ticket_code_l(ticket_code)
        #Create new ticket message calling class method create_new_ticket_message()
        new_ticket_message = db.SsAdmCasosL.create_new_ticket_message(ticket_msg_code, ticket_code, ticket_msg.get('description'), ticket_msg.get('file'), ticket_msg.get('time'), ticket_msg.get('type'))
        #Insert ticket message in DB
        new_ticket_message.save()
    

        #Update ticket to no viewed 
        db.SsAdmCasosH.objects.filter(code=ticket_code).update(viewed = 0)
        
        #Refresh validation of ticket
        validation: int = ticket_msg.get('validation')
        if validation is not None:
            validation = int(validation)
            change_ticket_validation(ticket_code,validation)

        #Refresh time of ticket
        resfresh_ticket_time(ticket_code, datetime.datetime.strptime(ticket_msg.get('time'), '%H:%M').time())

        #Send Email
        ticket_info = db.SsAdmCasosH.objects.filter(code=ticket_code).values('usuario', 'gestor', 'titulo', 'code').first()
        if(request.session.get('rol').strip() == 'admin' and ticket_info.get('usuario').strip() != ticket_info.get('gestor').strip() and ticket_info.get('gestor').strip() == request.session.get('username').strip()):
            user_email = db.SsUser.objects.filter(name=ticket_info.get('usuario').strip()).values('email').first()
            utils_email.send_manager_response_ticket_email(ticket_info.get('code'),ticket_info.get('gestor').strip(), ticket_info.get('titulo').strip(), ticket_msg.get('description'), user_email.get('email').strip())

    except Exception as e:
        raise dbError(format(e))
    
def change_ticket_viewed_state(t_code: int) -> int:
    """
    Change ticket viewed state - Change ticket to viewed state

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(viewed = 1)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def get_most_recent_message_type(t_code: int) -> int:
    try: 
        max_code: dict = db.SsAdmCasosL.objects.filter(u_docentry = t_code).aggregate(Max('code'))
        if(max_code.get('code__max')):
            recent_message: db.SsAdmCasosL | None = db.SsAdmCasosL.objects.filter(u_docentry = t_code, code = max_code.get('code__max')).first()
            result: str = recent_message.tipo
            return result
    except Exception as e: 
        raise dbError(format(e))
    
def get_most_recent_message_date(t_code: int) -> datetime:
    try: 
        max_code: dict = db.SsAdmCasosL.objects.filter(u_docentry = t_code).aggregate(Max('code'))
        if(max_code.get('code__max')):
            recent_message: db.SsAdmCasosL | None = db.SsAdmCasosL.objects.filter(u_docentry = t_code, code = max_code.get('code__max')).first()
            result: datetime = recent_message.fecha
            return result
    except Exception as e: 
        raise dbError(format(e))
        

def resfresh_ticket_time(t_code: int, time: datetime.time) -> int:
    """
    Refresh Time of Ticket - Update time of ticket with the given t_code and new time

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        ticket: db.SsAdmCasosH | None = db.SsAdmCasosH.objects.filter(code=t_code).first()
        t1: datetime.datetime = datetime.datetime.strptime(datetime.time.strftime(time, '%H:%M:%S'), '%H:%M:%S')
        t2: datetime.datetime = datetime.datetime.strptime(datetime.time.strftime(ticket.tiempo, '%H:%M:%S'), '%H:%M:%S')
        result_time = (t1 - datetime.datetime.strptime('00:00:00', '%H:%M:%S') + t2).time()
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(tiempo=result_time)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def change_ticket_validation(t_code: int, validation: int) -> int:
    """
    Change Ticket Validation - Update validation of ticket with the given t_code and validation

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(validacion=validation)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def change_ticket_manager(t_code: int, new_manager: str) -> int:
    """
    Change Ticket Manager - Update manager of ticket with the given t_code and new manager

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(gestor=new_manager)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))
    
def change_ticket_user(t_code: int, new_user: str) -> int:
    """
    Change Ticket User - Update user of ticket with the given t_code and new user

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(usuario=new_user)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def change_ticket_priority(t_code: int, new_priority: int) -> int:
    """
    Change Ticket Priority - Update priority of ticket with the given t_code and new priority

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(prioridad=new_priority)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def change_ticket_categroy(t_code: int, new_category: str) -> int:
    """
    Change Ticket Category - Update category of ticket with the given t_code and new category

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        rows_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(categoria=new_category)
        return rows_updated
    except Exception as e:
        raise dbError(format(e))

def get_powerbi_categories(request: HttpRequest) -> list[dict[str, Any]] | list:
    """
    Get PowerBi Categories - Get all powerbi categories from database

    Returns:
        list - list with all power bi categories
    """
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            result_query = db.WebPowerbiH.objects.filter(id__in=powerbi_permissions).values('id','name', 'img')
            return result_query
        else:
            return None
    except Exception as e:
        raise dbError(format(e))
    
def get_all_powerbi_categories():
    try:
        result_query = db.WebPowerbiH.objects.all().values('id','name')
        result: dict[str, Any] = serializers.pwbiCategoryMinSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
    
def get_powerbi_category(category_id: int, request: HttpRequest) -> dict[str, Any]:
    """
    Get PowerBi Category - Get powerbi category with given id from database

    Returns:
        dict[str, Any] - power bi category info
    """
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            if category_id in powerbi_permissions:
                result_query = db.WebPowerbiH.objects.filter(id=category_id).first()
                if not result_query:
                    return None
                result: dict[str, Any] = serializers.pwbiCategorySerializer(result_query)
                return result.data
            else:
                return None
        else:
            return None
    except Exception as e:
        raise dbError(format(e))
    
def get_publication_code(id_category: int) -> int | None:
    try:
        publication_code: int = 1
        max_code: dict = db.WebPowerbiL.objects.filter(doc_entry = id_category).aggregate(Max('code'))
        if(max_code.get('code__max')):
            publication_code = max_code.get('code__max') + 1 
        return publication_code
    except Exception as e:
        raise dbError(format(e))
    
def create_pwbi_publication(publication) -> int:
    try:
        
        publication_code = get_publication_code(publication.get('doc_entry'))
        new_publication = db.WebPowerbiL.create_new_publication(publication_code, publication.get('doc_entry'), publication.get('title'),
                            publication.get('description'), publication.get('video'), publication.get('newness'), publication.get('summary')
                            , publication.get('type'))
        new_publication.save()
    except Exception as e:
        raise dbError(format(e))
    
    
def delete_pwbi_publication(publication_id: int):
    try:
        db.WebPowerbiL.objects.filter(id=publication_id).delete()
    except Exception as e:
        raise dbError(format(e))
        
def change_publication_newness_state(publication_id: int, state: int):
    try:
        updated: int = db.WebPowerbiL.objects.filter(id=publication_id).update(newness=state)
        return updated
    except Exception as e:
        raise dbError(format(e))
    
def get_pwbi_all_newness_publications(request: HttpRequest):
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            result_query = db.WebPowerbiL.objects.filter(doc_entry__in=powerbi_permissions).filter(newness=1).order_by('-creation_date')
            result: list[dict[str, Any]] = serializers.pwbiPublicationsNewnessSerializer(result_query, many=True) 
            return result.data       
        else:
            return None
    except Exception as e:
        raise dbError(format(e))

def get_pwbi_publications_news(id_category: int, request: HttpRequest):
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            if id_category in powerbi_permissions:
                result_query = db.WebPowerbiL.objects.filter(doc_entry=id_category, type='news').order_by('-newness', '-creation_date')
                result: list[dict[str, Any]] = serializers.pwbiPublicationsMinSerializer(result_query, many=True)
                return result.data
            else:
                return None      
        else:
            return None
    except Exception as e:
        raise dbError(format(e))
    
def get_pwbi_publications_guides(id_category: int, request: HttpRequest):
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            if id_category in powerbi_permissions:
                result_query = db.WebPowerbiL.objects.filter(doc_entry=id_category, type='guide').order_by('-newness', '-creation_date')
                result: list[dict[str, Any]] = serializers.pwbiPublicationsMinSerializer(result_query, many=True)
                return result.data
            else:
                return None      
        else:
            return None
    except Exception as e:
        raise dbError(format(e))
    
def get_pwbi_publication(id_publication: int, request: HttpRequest):
    try:
        if(request.session.get('powerbi_permissions')):
            powerbi_permissions = [int(x) for x in request.session.get('powerbi_permissions').split(';')]
            id_category = db.WebPowerbiL.objects.filter(id=id_publication).values('doc_entry').first()
            if id_category.get('doc_entry') in powerbi_permissions:
                result_query = db.WebPowerbiL.objects.filter(id=id_publication).first()
                result: list[dict[str, Any]] = serializers.pwbiPublicationSerializer(result_query)
                return result.data
            else:
                return None      
        else:
            return None

    except Exception as e:
        raise dbError(format(e))
    
def get_manuals(request: HttpRequest, category: str):
    try:
        if(request.session.get('rol') == 'admin'):
            if(category):
                result_query = db.SsAdmManuales.objects.filter(clave=category)
            else:
                result_query = db.SsAdmManuales.objects.all()
        else:
            if(category):
                result_query = db.SsAdmManuales.objects.filter(~Q(privilegio='9999')).filter(clave=category)
            else:
                result_query = db.SsAdmManuales.objects.filter(~Q(privilegio='9999'))
        result: list[dict[str, Any]] = serializers.manualsSerializer(result_query, many=True)
        return result.data
    except Exception as e:
        raise dbError(format(e))
    
def get_manuals_categories(request: HttpRequest):
    try:
        if(request.session.get('rol') == 'admin'):
            result_query = db.SsAdmManuales.objects.all().values_list('clave', flat=True).distinct()
        else:
            result_query = db.SsAdmManuales.objects.filter(~Q(privilegio='9999')).values_list('clave', flat=True).distinct()
        return list(result_query)
    except Exception as e:
        raise dbError(format(e))

def check_duplicated_files(file_name: str, t_code: int):
    try:
        file_duplicated_name = db.SsAdmCasosL.objects.filter(u_docentry=t_code).filter(adjunto=file_name).values('adjunto').first()
        return file_duplicated_name
    except Exception as e:
        raise dbError(format(e))
    

def start_user_statistic_info(obj, request: HttpRequest):
    try:
        user_statistic = db.WebPowerbiStatistics.create_new_pwbi_user_statistic(request.session.get('username'), obj.get('id_category'), obj.get('title_category'), obj.get('id_publication'), obj.get('title_publication'))
        user_statistic.save()
        return user_statistic.id
    except Exception as e:
        raise dbError(format(e))
    
def end_user_statistic_info(ids_statistics: tuple) -> None:
    try:
        for id_s in ids_statistics:
            final_request = db.WebPowerbiStatistics.objects.filter(id=id_s).values('date_start').first()
            delta: datetime.timedelta = datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))) - final_request.get('date_start')
            db.WebPowerbiStatistics.objects.filter(id=id_s).update(date_end=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))), time_spend=delta)
    except Exception as e:
        raise dbError(format(e))