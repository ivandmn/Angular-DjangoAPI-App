"""main URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name="index"),
    path('log-in', TemplateView.as_view(template_name="index.html"), name="index"),
    path('home', TemplateView.as_view(template_name="index.html"), name="index"),
    path('user-profile', TemplateView.as_view(template_name="index.html"), name="index"),
    path('tickets/list', TemplateView.as_view(template_name="index.html"), name="index"),
    path('tickets/create', TemplateView.as_view(template_name="index.html"), name="index"),
    path('tickets/ticket', TemplateView.as_view(template_name="index.html"), name="index"),
    path('pwbi/home', TemplateView.as_view(template_name="index.html"), name="index"),
    path('api/', include('api.urls')),
]
