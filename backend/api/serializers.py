from rest_framework import serializers
from api import models

#Serialize objects to specific JSON format

class loginSerializer(serializers.ModelSerializer):
    code = serializers.IntegerField()
    username = serializers.SerializerMethodField('get_username')
    name = serializers.SerializerMethodField('get_name')
    email = serializers.SerializerMethodField('get_email')
    rol = serializers.SerializerMethodField('get_role')
    powerbi_permissions = serializers.CharField()
    
    def get_role(self,obj):
        if obj.privilegios > 99:
            return 'admin'
        return 'user'
    
    def get_username(self, obj):
        return obj.name.strip()
    
    def get_name(self, obj):
        return obj.usrname.strip()
    
    def get_email(self, obj):
        return obj.email.strip()
    
    class Meta:
        model = models.SsUser
        fields = ('code', 'username', 'name', 'email', 'rol', 'powerbi_permissions')
        
class shortUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField('get_username')
    name = serializers.SerializerMethodField('get_name')

    def get_username(self, obj):
        return obj.name.strip()
    
    def get_name(self, obj):
        return obj.usrname.strip()

    class Meta:
        model = models.SsUser
        fields = ('username', 'name')
        
class categorySerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField('get_category')
    category_name = serializers.SerializerMethodField('get_category_name')

    def get_category(self, obj):
        return obj.code.strip()
    
    def get_category_name(self, obj):
        return obj.name.strip()

    class Meta:
        model = models.SsTablas
        fields = ('category', 'category_name')
        
class getTicketSerializer(serializers.ModelSerializer):
    code = serializers.IntegerField()
    date = serializers.DateTimeField(source='f_alta')
    title = serializers.CharField(source='titulo')
    user = serializers.SerializerMethodField('get_user')
    manager = serializers.SerializerMethodField('get_manager')
    priority = serializers.CharField(source='prioridad')
    category = serializers.CharField(source='categoria')
    state = serializers.CharField(source='estado')
    time = serializers.TimeField(source='tiempo')
    validation = serializers.IntegerField(source='validacion')
    viewed =serializers.IntegerField()
    
    def get_user(self, obj):
        return obj.usuario.strip()
    
    def get_manager(self, obj):
        return obj.gestor.strip()
    
    class Meta:
        model = models.SsAdmCasosH
        fields = ('code', 'date', 'title', 'user', 'manager', 'priority', 'category', 'state', 'time', 'validation', 'viewed')

class getTicketMsgsSerializer(serializers.ModelSerializer):
    code = serializers.IntegerField()
    t_code = serializers.IntegerField(source='u_docentry')
    date = serializers.DateTimeField(source='fecha')
    type = serializers.CharField(source='tipo')
    time = serializers.TimeField(source='tiempo')
    text1 = serializers.SerializerMethodField('get_text1')
    text2 = serializers.SerializerMethodField('get_text2')
    text3 = serializers.SerializerMethodField('get_text3')
    file = serializers.CharField(source='adjunto')
    
    def get_text1(self, obj):
        if(obj.texto1):
            return obj.texto1
        return ""
    def get_text2(self, obj):
        if(obj.texto2):
            return obj.texto2
        return ""
    def get_text3(self, obj):
        if(obj.texto3):
            return obj.texto3
        return ""
    
    class Meta:
        model = models.SsAdmCasosL
        fields = ('code', 't_code', 'date', 'type', 'time', 'text1', 'text2', 'text3', 'file')
    

 

        

    