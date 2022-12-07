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

    @classmethod
    def create_new_ticket(cls, t_code: int, title: str, user: str, manager: str, priority: int, category: str):
        ticket = cls(
            code=t_code,
            f_alta=datetime.datetime.now(),
            titulo=title, usuario=user,
            gestor=manager,
            tiempo=datetime.time(0,0,0), 
            prioridad=priority, 
            categoria=category,
            estado='A',
            validacion=0,
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
            res: list[str] = textwrap.wrap(description, width=255, break_long_words=True)
            if(len(res) > 0):
                text1 = res[0]
            if(len(res) > 1):
                text2 = res[1]
            if(len(res) > 2):
                text3 = res[2]
        ticket = cls(
            code=message_code,
            u_docentry=ticket_code,
            fecha=datetime.datetime.now(),
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

    class Meta:
        managed = False
        db_table = 'SS_USER'

class SsPowerbiH(models.Model):
    name = models.CharField(unique=True, max_length=60, db_collation='Modern_Spanish_CI_AS')
    code = models.CharField(unique=True, max_length=20, db_collation='Modern_Spanish_CI_AS')
    img = models.CharField(max_length=80, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SS_POWERBI_H'


class SsPowerbiL(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.IntegerField()
    doc_entry = models.IntegerField()
    powerbi_link = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    description = models.TextField(db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    video = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    newness = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SS_POWERBI_L'
