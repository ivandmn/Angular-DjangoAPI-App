# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
import datetime
import textwrap
from decouple import config
import pytz

class SsAdmCasosH(models.Model):
    code = models.IntegerField(db_column='Code', primary_key=True)  # Field name made lowercase.
    f_alta = models.DateTimeField(db_column='F_alta', blank=True, null=True)  # Field name made lowercase.
    f_final = models.DateTimeField(db_column='F_final', blank=True, null=True)  # Field name made lowercase.
    titulo = models.CharField(db_column='Titulo', max_length=60, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    usuario = models.CharField(max_length=15, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    gestor = models.CharField(max_length=10, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    tiempo = models.TimeField(blank=True, null=True)
    prioridad = models.IntegerField(blank=True, null=True)
    categoria = models.CharField(max_length=15, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    estado = models.CharField(max_length=1, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    proceso = models.IntegerField(blank=True, null=True)
    validacion = models.IntegerField(blank=True, null=True)
    viewed = models.IntegerField(blank=True, null=True)
    position = models.IntegerField(blank=True, null=True)

    @classmethod
    def create_new_ticket(cls, t_code: int, title: str, user: str, manager: str, priority: int, category: str, validation: int):
        ticket = cls(
            code=t_code,
            f_alta=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))),
            titulo=title, usuario=user,
            gestor=manager,
            tiempo=datetime.time(0,0,0), 
            prioridad=priority, 
            categoria=category,
            estado='A',
            validacion=validation,
            viewed=0
        )
        return ticket

    class Meta:
        managed = False
        db_table = 'SS_Adm_Casos_H'

class SsAdmCasosL(models.Model):
    code = models.IntegerField(db_column='Code', blank=True, null=True)  # Field name made lowercase.
    u_docentry = models.IntegerField(db_column='U_DocEntry', blank=True, null=True)  # Field name made lowercase.
    fecha = models.DateTimeField(db_column='Fecha', blank=True, null=True)  # Field name made lowercase.
    tipo = models.CharField(max_length=1, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    tiempo = models.TimeField(blank=True, null=True)
    texto1 = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    texto2 = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    texto3 = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    adjunto = models.TextField(db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    id = models.AutoField(db_column='ID', primary_key=True)  # Field name made lowercase.

    @classmethod
    def create_new_ticket_message(cls, message_code: int, ticket_code: int, description: str, file: str, time: str = '00:00', type: str = 'P'):
        text1 = None; text2 = None; text3 = None
        if(description):
            res: list[str] = textwrap.wrap(description, width=255, break_long_words=True, replace_whitespace=False)
            if(len(res) > 0):
                text1 = res[0]
            if(len(res) > 1):
                text2 = res[1]
            if(len(res) > 2):
                text3 = res[2]
        ticket = cls(
            code=message_code,
            u_docentry=ticket_code,
            fecha=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))),
            tipo=type,
            tiempo=datetime.datetime.strptime(time, '%H:%M').time(),
            texto1=text1,
            texto2=text2,
            texto3=text3,
            adjunto=file
        )
        return ticket

    class Meta:
        managed = False
        db_table = 'SS_Adm_Casos_L'
        
class SsAdmManuales(models.Model):
    code = models.IntegerField(db_column='Code', primary_key=True)  # Field name made lowercase.
    clave = models.CharField(max_length=30, blank=True, null=True)
    titulo = models.CharField(db_column='Titulo', max_length=60, blank=True, null=True)  # Field name made lowercase.
    descripcion = models.CharField(db_column='Descripcion', max_length=100, blank=True, null=True)  # Field name made lowercase.
    fichero = models.CharField(max_length=255, blank=True, null=True)
    privilegio = models.CharField(db_column='Privilegio', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SS_Adm_Manuales'

class SsTablas(models.Model):
    code = models.CharField(db_column='Code', max_length=10, db_collation='Modern_Spanish_CI_AS', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    tipo = models.CharField(db_column='Tipo', max_length=4, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SS_TABLAS'

class SsUser(models.Model):
    code = models.IntegerField(db_column='Code', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=15, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pasword = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    usrname = models.CharField(db_column='UsrName', max_length=40, db_collation='Modern_Spanish_CI_AS')  # Field name made lowercase.
    usrinc = models.CharField(db_column='UsrInc', max_length=3, db_collation='Modern_Spanish_CI_AS')  # Field name made lowercase.
    privilegios = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=60, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    passwd_email = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    extension = models.DecimalField(max_digits=18, decimal_places=0, blank=True, null=True)
    tipo = models.CharField(max_length=4, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    gestcial = models.CharField(db_column='GestCial', max_length=1, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)  # Field name made lowercase.
    movil = models.CharField(max_length=9, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    terminal = models.CharField(max_length=30, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    f_baja = models.DateField(db_column='F_Baja', blank=True, null=True)  # Field name made lowercase.
    r_code = models.IntegerField(db_column='R_Code', blank=True, null=True)  # Field name made lowercase.
    powerbi_permissions = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    imagen = models.CharField(max_length=255, blank=True, null=True)
    reset_password_date = models.DateTimeField(blank=True, null=True)

    @classmethod
    def create_new_user(cls, user_code: int , username: str, user_full_name: str, password: str, rol: int, user_email: str, user_pwbi_permissions):
        user = cls(
            code = user_code,
            name = username,
            usrname = user_full_name,
            pasword = password,
            privilegios = rol,
            email = user_email,
            powerbi_permissions = user_pwbi_permissions
        )
        return user

    class Meta:
        managed = False
        db_table = 'SS_USER'

class WebPowerbiH(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=60)
    link = models.TextField(blank=True, null=True)
    img = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'WEB_POWERBI_H'


class WebPowerbiL(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.IntegerField()
    doc_entry = models.IntegerField()
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    video = models.CharField(max_length=255, blank=True, null=True)
    creation_date = models.DateField(blank=True, null=True)
    newness = models.IntegerField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    
    @classmethod
    def create_new_publication(cls, p_code, p_doc_entry, p_title, p_description, p_video, p_newness, p_summary, p_type):
        publication = cls(
            code=p_code,
            doc_entry = p_doc_entry,
            title=p_title,
            description = p_description,
            video=p_video,
            creation_date=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE"))),
            newness = p_newness,
            summary = p_summary,
            type = p_type
        )
        return publication
    
    class Meta:
        managed = False
        db_table = 'WEB_POWERBI_L'

class WebPowerbiStatistics(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=60)
    id_category = models.IntegerField(blank=True, null=True)
    category_name = models.CharField(max_length=255, blank=True, null=True)
    id_publication = models.IntegerField(blank=True, null=True)
    title_publication = models.CharField(max_length=255, blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)
    date_end = models.DateTimeField(blank=True, null=True)
    time_spend = models.CharField(max_length=25, blank=True, null=True)


    @classmethod
    def create_new_pwbi_user_statistic(cls, us_username: str, us_id_category: int, us_categroy_name: str, us_id_publication: int, us_title_publication: str):
        user_statistic = cls(
            username=us_username,
            id_category=us_id_category,
            category_name=us_categroy_name,
            id_publication=us_id_publication,
            title_publication=us_title_publication,
            date_start=datetime.datetime.now(tz=pytz.timezone(config("TIME_ZONE")))
        )
        return user_statistic
    
    class Meta:
        managed = False
        db_table = 'WEB_POWERBI_STATISTICS'
