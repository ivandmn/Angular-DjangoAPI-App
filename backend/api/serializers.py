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
    image = serializers.SerializerMethodField('get_image')
    
    def get_role(self,obj):
        if(obj.privilegios):
            if obj.privilegios > 99:
                return 'admin'
            return 'user'
        else:
            return None
    
    def get_username(self, obj):
        if(obj.name):
            return obj.name.strip()
        else:
            return None
    
    def get_name(self, obj):
        if(obj.usrname):
            return obj.usrname.strip()
        else:
            return None
    
    def get_email(self, obj):
        if(obj.email):
            return obj.email.strip()
        else:
            return None
    
    def get_image(self, obj):
        if(obj.imagen):
            return obj.imagen.strip()
        else:
            return None
    
    class Meta:
        model = models.SsUser
        fields = ('code', 'username', 'name', 'email', 'rol', 'powerbi_permissions', 'image', 'f_baja')
        
class shortUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField('get_username')
    name = serializers.SerializerMethodField('get_name')

    def get_username(self, obj):
        if(obj.name):
            return obj.name.strip()
        else:
            return None
    
    def get_name(self, obj):
        if(obj.usrname):
            return obj.usrname.strip()
        else:
            return None

    class Meta:
        model = models.SsUser
        fields = ('username', 'name')
        
class FullUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField('get_username')
    name = serializers.SerializerMethodField('get_name')
    email = serializers.SerializerMethodField('get_email')
    rol = serializers.SerializerMethodField('get_role')
    image = serializers.SerializerMethodField('get_image')
    
    def get_username(self, obj):
        if(obj.name):
            return obj.name.strip()
        else:
            return None
    
    def get_name(self, obj):
        if(obj.usrname):
            return obj.usrname.strip()
        else:
            return None
    
    def get_email(self, obj):
        if(obj.email):
            return obj.email.strip()
        else:
            return None
    
    def get_image(self, obj):
        if(obj.imagen):
            return obj.imagen
        else:
            return None
    
    def get_role(self,obj):
        if(obj.privilegios):
            if obj.privilegios > 99:
                return 'admin'
            return 'user'
        else:
            return None

    class Meta:
        model = models.SsUser
        fields = ('username', 'name', 'email', 'rol', 'image', 'f_baja', 'powerbi_permissions')
        
class categorySerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField('get_category')
    category_name = serializers.SerializerMethodField('get_category_name')

    def get_category(self, obj):
        if(obj.code):
            return obj.code.strip()
        else:
            return None
    
    def get_category_name(self, obj):
        if(obj.name):
            return obj.name.strip()
        else:
            return None

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
        if(obj.usuario):
            return obj.usuario.strip()
        else:
            return None
    
    def get_manager(self, obj):
        if(obj.gestor):
            return obj.gestor.strip()
        else:
            return None
    
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
    
class pwbiCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.WebPowerbiH
        fields = '__all__'
        
class pwbiCategoryMinSerializer(serializers.ModelSerializer):
    pwbicat_id = serializers.IntegerField(source='id')
    pwbicat_name = serializers.CharField(source='name')
    class Meta:
        model = models.WebPowerbiL
        fields = ('pwbicat_id', 'pwbicat_name')
    
class pwbiPublicationsNewnessSerializer(serializers.ModelSerializer):
    category_pwbi_name = serializers.SerializerMethodField('get_category_pwbi_name')
    
    def get_category_pwbi_name(self, obj):
        if(obj.doc_entry):
            obj_match = models.WebPowerbiH.objects.filter(id=obj.doc_entry).values('name').first()
            return obj_match.get('name')
        else:
            return None
    
    class Meta:
        model = models.WebPowerbiL
        fields = ('id','code','doc_entry','title','creation_date','newness','type', 'category_pwbi_name')
        
class pwbiPublicationsMinSerializer(serializers.ModelSerializer):
    video_link = serializers.SerializerMethodField('get_video_link')
    
    def get_video_link(self, obj):
        try:
            if(obj.video):
                link_v: str = obj.video
                v_obj = link_v.split('v=')
                # return 'https://www.youtube.com/embed/' + v_obj[1] + '?feature=player_embedded'
                return v_obj[1]
            else:
                return None
        except Exception as e:
            return None
    
    class Meta:
        model = models.WebPowerbiL
        fields = ('id','code','doc_entry','title','creation_date','newness','summary','type','video_link')

class pwbiPublicationSerializer(serializers.ModelSerializer):
    video_link = serializers.SerializerMethodField('get_video_link')
    
    def get_video_link(self, obj):
        try:
            if(obj.video):
                link_v: str = obj.video
                v_obj = link_v.split('v=')
                # return 'https://www.youtube.com/embed/' + v_obj[1] + '?feature=player_embedded'
                return v_obj[1]
            else:
                return None
        except Exception as e:
            return None
    
    class Meta:
        model = models.WebPowerbiL
        fields = ('id','code','doc_entry','title','description','creation_date','newness','summary','type','video_link')
    
class manualsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SsAdmManuales
        fields = '__all__'

    

 

        

    