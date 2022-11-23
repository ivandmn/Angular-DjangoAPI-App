# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


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

    class Meta:
        managed = False
        db_table = 'SS_Adm_Casos_L'


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

    class Meta:
        managed = False
        db_table = 'SS_USER'