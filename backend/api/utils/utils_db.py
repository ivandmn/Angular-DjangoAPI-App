from api import serializers
from api import models as db
from . import utils_custom_exceptions as c_exceptions 

from django.db.models import Max
from django.db.models import Q

import textwrap
import datetime
from typing import Any

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
        raise c_exceptions.dbError(format(e))

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
        result: dict[str, Any] = {'email': result_query.email.strip()}
        return result
    except Exception as e:
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))
    
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
        raise c_exceptions.dbError(format(e))

def get_tickets(ticket_options: dict) -> list[dict[str, Any]] | list:
    """
    Get tickets - Return all tickets with given manager, username, category and state
    
    Args:
        ticket_options (dict): Dict with ticket search options

    Returns:
        result[list[tickets]]: Returns list of tickets
    """
    result: list[dict[str, Any]] = []
    try: 
        priority_tickets_hash_map = {1: 'BAJA', 2: 'MEDIA', 3: 'ALTA', 4: 'URGENTE'}
        category_tickets_hash_map = {'GRAL': 'GENERAL', 'SAP': 'SAP', 'PB1':'POWER BI', 'GESC': 'GESTION COMERCIAL', 'GMAIL':'GMAL'}
        p: int = ticket_options['page']
        ixp: int = ticket_options['itemsPerPage']
        index = (p-1)*ixp + 1
        parsed_options = {'gestor': ticket_options['manager'], 'usuario': ticket_options['username'], 'estado': ticket_options['state'], 'categoria': ticket_options['category'], 'validacion': ticket_options['validation']}
        final_options = {k: v for k, v in parsed_options.items() if v or v==0}
        if(ticket_options['userMode'] == True):
            result_query: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).filter(~Q(gestor=ticket_options['currentUser'])).order_by('-prioridad', 'f_alta')[(p-1)*ixp:p*ixp]
            for row in result_query:
                result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map[row.categoria], 'priority': priority_tickets_hash_map[row.prioridad], 'state': row.estado, 'position':  index, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': get_most_recent_message(row.code)})
                index = index + 1
        else:
            result_query: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).order_by('-prioridad', 'f_alta')[(p-1)*ixp:p*ixp]
            for row in result_query:
                result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario.strip(), 'manager': row.gestor.strip(), 'category': category_tickets_hash_map[row.categoria], 'priority': priority_tickets_hash_map[row.prioridad], 'state': row.estado, 'position':  index, 'time': row.tiempo, 'validation': row.validacion, 'viewed': row.viewed, 'last_response_type': get_most_recent_message(row.code)})
                index = index + 1
        
        return result
    except Exception as e:
        raise c_exceptions.dbError(format(e))
    
def get_tickets_count(ticket_options: dict) -> int | None:
    """
    Get tickets - Return all tickets count with given manager, username, category and state
    
    Args:
        ticket_options (dict): Dict with ticket search options

    Returns:
        rows (int): Tickets count with search options
    """
    try:
        parsed_options = {'gestor': ticket_options['manager'], 'usuario': ticket_options['username'], 'estado': ticket_options['state'], 'categoria': ticket_options['category']}
        final_options = {k: v for k, v in parsed_options.items() if v}
        if(ticket_options['userMode'] == True):
            rows: int = db.SsAdmCasosH.objects.filter(**final_options).filter(~Q(gestor=ticket_options['currentUser'])).count()
            return rows
        else:
            rows: int = db.SsAdmCasosH.objects.filter(**final_options).count()
            return rows
    except Exception as e:
        raise c_exceptions.dbError(format(e))
    
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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))
    
def close_ticket(t_code: int) -> int:
    """
    Close Ticket - Update estate of ticket to 'C' (closed) with the given ticket code

    Returns:
        int - 1 if updated, 0 if not
    """
    try:
        row_updated: int = db.SsAdmCasosH.objects.filter(code=t_code).update(estado='C', f_final=datetime.datetime.now())
        return row_updated
    except Exception as e:
        raise c_exceptions.dbError(format(e))

def create_ticket(ticket: dict) -> None:
    """
    Create Ticket - Create ticket_H with given ticket and ticket_L if ticket have description or file

    Args:
        ticket (dict): Ticket to insert in DB
    """
    try:
        #Get code of new ticket header
        ticket_code = get_ticket_code_H()
        #Create new ticket calling class method create_new_ticket()
        new_ticket = db.SsAdmCasosH.create_new_ticket(ticket_code, ticket.get('title'), ticket.get('username'), ticket.get('manager'), ticket.get('priority'), ticket.get('category'))
        #Insert ticket header in DB
        new_ticket.save()
        
        #Get code of new ticket message
        message_code = get_ticket_code_l(ticket_code)
        #Create new ticket message calling class method create_new_ticket_message()
        new_ticket_message = db.SsAdmCasosL.create_new_ticket_message(message_code, ticket_code, ticket.get('description'), ticket.get('file'))
        #Insert ticket message in DB
        new_ticket_message.save()
    except Exception as e:
        raise c_exceptions.dbError(format(e))

def create_ticket_msg(ticket_msg: dict) -> None:
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
    except Exception as e:
        raise c_exceptions.dbError(format(e))
    
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
        raise c_exceptions.dbError(format(e))

def get_most_recent_message(t_code: int) -> int:
    try: 
        max_code: dict = db.SsAdmCasosL.objects.filter(u_docentry = t_code).aggregate(Max('code'))
        if(max_code.get('code__max')):
            recent_message: db.SsAdmCasosL | None = db.SsAdmCasosL.objects.filter(u_docentry = t_code, code = max_code.get('code__max')).first()
            result: str = recent_message.tipo
            return result
    except Exception as e: 
        raise c_exceptions.dbError(format(e))
        

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

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
        raise c_exceptions.dbError(format(e))

    


def get_powerbi_categories() -> list[dict[str, Any]] | list:
    """
    Get PowerBi Categories - Get all powerbi categories from database

    Returns:
        list - list with all power bi categories
    """
    try:
        result_query = db.SsPowerbiH.objects.all().values('id','name', 'code')
        return result_query
    except Exception as e:
        raise c_exceptions.dbError(format(e))