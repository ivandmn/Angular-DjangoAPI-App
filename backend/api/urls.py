from django.urls import path
from . import views

urlpatterns = [
    path('', views.main),
    path('login', views.login),
    path('logout', views.logout),
    path('reset-password/validate-email', views.validate_email),
    path('reset-password/validate-reset-key', views.validate_reset_key),
    path('reset-password/change-password', views.change_user_password),
    path('tickets/get-tickets', views.get_tickets),
    path('tickets/get-tickets-count', views.get_tickets_count),
    path('tickets/create-ticket', views.create_ticket),
    path('tickets/get-categories', views.get_categories),
    path('tickets/get-managers', views.get_managers),
    path('tickets/get-users', views.get_users),
    path('tickets/get-ticket', views.get_ticket),
    path('tickets/get-ticket-msgs', views.get_tickets_msgs),
    path('tickets/create-ticket-msg', views.create_ticket_msg),
    path('tickets/change-ticket-viewed-state', views.change_ticket_viewed_state),
    path('tickets/close-ticket', views.close_ticket),
    path('tickets/open-ticket', views.open_ticket),
    path('tickets/upload-file', views.upload_file),
    path('tickets/delete-file', views.delete_file),
    path('tickets/download-file', views.download_file),
    path('tickets/change-ticket-manager', views.change_ticket_manager)
]