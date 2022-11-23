from django.db.models import Max
import textwrap

import datetime
from typing import Any

from .. import models as db

def login(_username: str, _password: str) -> dict[str, Any] | None:
    """
    Login - Check if user is in DB with given username and password
    
    Args:
        _username (str): User Name string
        _password (str): User Password string

    Returns:
        result (dict | None): Returns dict with user if found | None if not found
    """
    result: dict[str, Any] | None = None
    try:
        result_query: db.SsUser | None = db.SsUser.objects.filter(name=_username, pasword=_password).first()
        if(result_query):
            if(result_query.privilegios > 99):
                result_query.privilegios = "admin"
            else: 
                result_query.privilegios = "user"
            result: dict[str, Any] = {'code': result_query.code, 'username': result_query.name, 'name': result_query.usrname, 'email': result_query.email, 'rol': result_query.privilegios}
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return result

def email_validation(_email: str) -> dict[str, Any] | None:
    """
    Email Validation - Check if email exists in DB
    
    Args:
        _email (str): User email string

    Returns:
        result (dict | None): Returns dict with email if found | None if not found 
    """
    result: dict[str, Any] | None = None
    try: 
        result_query: db.SsUser | None = db.SsUser.objects.filter(email=_email).first()
        if(result_query):
            result: dict[str, Any] = {'email': result_query.email}
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return result

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
        print("An exception occurred - " + format(e))
        return 0

def get_users() -> list[dict[str, Any]] | list: 
    """
    Get Users - Get username and name for all users in DB

    Returns:
        result (list[dict[str, Any]]): Return list with all users
    """
    try:
        result_query = db.SsUser.objects.all().order_by('usrname')
        result: list[dict[str, Any]] = [{'username': row.name, 'name': row.usrname} for row in result_query]
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return []

def get_managers() -> list[dict[str, Any]]:
    """
    Get Managers - Get username and name for users that are managers in DB

    Returns:
         result (list[dict[str, Any]]): Returns list with all managers users
    """
    try: 
        result_query = db.SsUser.objects.filter(privilegios__gt=99)
        result: list[dict[str, Any]] = [{'username': row.name, 'name': row.usrname} for row in result_query]
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return []

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
        category_tickets_hash_map = {'GRAL': 'general'}
        parsed_options = {'gestor': ticket_options['manager'], 'usuario': ticket_options['username'], 'estado': ticket_options['state'], 'categoria': ticket_options['category']}
        final_options = {k: v for k, v in parsed_options.items() if v}
        result_query: list[db.SsAdmCasosH] = db.SsAdmCasosH.objects.filter(**final_options).order_by('-prioridad', 'f_alta')
        index = 1
        for row in result_query:
            result.append({'code': row.code, 'date': row.f_alta, 'title': row.titulo, 'user': row.usuario, 'manager': row.gestor, 'category': category_tickets_hash_map[row.categoria], 'priority': priority_tickets_hash_map[row.prioridad], 'state': row.estado, 'position':  index, 'time': row.tiempo, 'validation': row.validacion})
            index = index + 1
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return result
    
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
        result: dict[str, Any] = {'code': result_query.code, 'date': result_query.f_alta, 'title': result_query.titulo, 'user': result_query.usuario, 'manager': result_query.gestor, 'priority': result_query.prioridad, 'state': result_query.estado, 'time': result_query.tiempo, 'validation': result_query.validacion}
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return None

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
        result: list[db.SsAdmCasosL] = [{'code': row.code, 't_code': row.u_docentry, 'date': row.fecha, 'type': row.tipo, 'time': row.tiempo, 'text1': row.texto1 or "", 'text2': row.texto2 or "", 'text3': row.texto3 or "", 'file': row.adjunto} for row in result_query]
        return result
    except Exception as e:
        print("An exception occurred - " + format(e))
        return []

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
        print("An exception occurred - " + format(e))
        return None

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
        print("An exception occurred - " + format(e))
        return None

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
        print("An exception occurred - " + format(e))
        return 0
    
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
        print("An exception occurred - " + format(e))
        return 0

def create_ticket(ticket: dict) -> bool:
    """
    Create Ticket - Create ticket_H with given ticket and ticket_L if ticket have description or file

    Args:
        ticket (dict): Ticket to insert in DB

    Returns:
        bool: True if ticket has been created, false if not has been created
    """
    try:
        #Get code of new ticket header
        t_code = get_ticket_code_H()
        #Set values to insert as ticket header
        parsed_ticket_H: dict = {
            'code': t_code,
            'f_alta': datetime.datetime.now(),
            'titulo': ticket['title'], 
            'usuario': ticket['username'], 
            'gestor': ticket['manager'], 
            'tiempo': datetime.time(0,0,0), 
            'prioridad': ticket['priority'],
            'categoria': ticket['category'],
            'estado': 'A', 
            'proceso': 1, 
            'validacion': 0
        }
        #Insert ticket header in DB
        tH = db.SsAdmCasosH(**parsed_ticket_H)
        tH.save() 

        #If ticket get 'description' or 'file' create ticket message for ticket header
        if(ticket.get('description') or ticket.get('file')):
            texto1 = ""; texto2 = ""; texto3 = ""
            file = ticket.get('file')
            if(ticket.get('description')):
                description: str | None = ticket.get('description')
                res: list[str] = textwrap.wrap(description, width=255, break_long_words=True)
                len_res: int = len(res)
                if(len_res > 0):
                    texto1 = res[0]
                if(len_res > 1):
                    texto2 = res[1]
                if(len_res > 2):
                    texto3 = res[2]

            ticket_L: dict = {
                'code': get_ticket_code_l(t_code),
                'u_docentry': t_code,
                'fecha': datetime.datetime.now(),
                'tipo': 'P',
                'tiempo': datetime.time(0,0,0),
                'texto1': texto1,
                'texto2': texto2, 
                'texto3': texto3,
                'adjunto': file
            }
            parsed_ticket_L: dict[str, Any] = {k: v for k, v in ticket_L.items() if v}
            #Insert ticket message in DB if exist description or file
            tL = db.SsAdmCasosL(**parsed_ticket_L)
            tL.save()  
        return True
    except Exception as e:
        print("An exception occurred - " + format(e))
        return False

def create_ticket_msg(ticket_msg: dict) -> bool:
    """
    Create Ticket Message - Create ticket_L with message object given and the code of ticket_H

    Args:
        ticket_msg (dict): Ticket message to insert in DB

    Returns:
        bool: True if ticket has been created, false if not has been created
    """
    try:
        texto1: str = ""; texto2: str = ""; texto3: str = ""
        file: str = ticket_msg.get('file')
        type: str = ticket_msg.get('type')       
        ticket_code: int = ticket_msg.get('t_code')
        ticket_msg_code: int = get_ticket_code_l(ticket_code)
        array_time = ticket_msg.get('time').split(':')

        for i in range(len(array_time)):
            array_time[i] = int(array_time[i])

        if(ticket_msg.get('msg')):
            description: str | None = ticket_msg.get('msg')
            res: list[str] = textwrap.wrap(description, width=255, break_long_words=True)
            len_res: int = len(res)
            if(len_res > 0):
                texto1 = res[0]
            if(len_res > 1):
                texto2 = res[1]
            if(len_res > 2):
                texto3 = res[2]
            
        ticket_L: dict = {
                'code': ticket_msg_code,
                'u_docentry': ticket_code,
                'fecha': datetime.datetime.now(),
                'tipo': type,
                'tiempo': datetime.time(array_time[0], array_time[1], 0),
                'texto1': texto1,
                'texto2': texto2, 
                'texto3': texto3,
                'adjunto': file
        }

        parsed_ticket_L = {k: v for k, v in ticket_L.items() if v}
        
        # Insert ticket line in DB
        tL = db.SsAdmCasosL(**parsed_ticket_L)
        tL.save()
        
        #Refresh validation
        validation: int = ticket_msg.get('validation')
        if validation is not None:
            validation = int(validation)
            change_ticket_validation(ticket_code,validation)

        #Refresh time of ticket
        resfresh_ticket_time(ticket_code, datetime.time(array_time[0], array_time[1], 0))
        return True
    except Exception as e:
        print("An exception occurred - " + format(e))
        return False
    

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
        print("An exception occurred - " + format(e))
        return 0

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
        print("An exception occurred - " + format(e))
        return 0

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
        print("An exception occurred - " + format(e))
    return 0