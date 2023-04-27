from django.core.mail import send_mail
from . import utils_authentication
from . import utils_templates_email as email_templates
from decouple import config

def send_reset_password_email(email: str) -> str | None:
    """
    Send Reset Password Email - Send email to user with reset key
    
    Args:
        email (str): User email

    Returns:
        reset_key (str | None): Returns reset key
    """
    reset_key = utils_authentication.generate_random_password_reset_key()
    send_mail(
        subject=f'Silver Sanz - Password Reset Code',
        message="",
        html_message= email_templates.reset_password_template.format(reset_key),
        from_email= config('EMAIL_HOST_USER'),
        recipient_list= [email]
    )
    return reset_key


def send_new_ticket_email(ticket_code, manager, title, msg, email, rol: str = 'gestor'):
    send_mail(
        subject=f'(NUEVO TICKET DE ' + manager + ' - ' + str(ticket_code) +') - ' + title,
        message="",
        html_message= email_templates.new_ticket_template.format(rol, manager, str(ticket_code), title, msg),
        from_email= config('EMAIL_HOST_USER'),
        recipient_list= [email]
    )

def send_manager_response_ticket_email(ticket_code,manager, title, msg, email):
    send_mail(
        subject=f'(NUEVO MENSAJE DE ' + manager + ' - ' + str(ticket_code) + ') - '  + title,
        message="",
        html_message= email_templates.manager_response_template.format(manager, str(ticket_code), title, msg),
        from_email= config('EMAIL_HOST_USER'),
        recipient_list= [email]
    )

