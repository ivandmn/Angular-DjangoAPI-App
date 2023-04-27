import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TicketService } from '../../services/ticket.service';
import { FileService } from 'src/app/services/file.service';
import { type } from 'jquery';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  //Login Form Group
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required,Validators.maxLength(15)]),
    password: new FormControl('', [Validators.required,Validators.maxLength(100)])
  });

  //Forgot Password Form Group
  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])
  });

  //Resey Key Form Group
  validateResetKeyForm: FormGroup = new FormGroup({
    key: new FormControl('', [Validators.required])
  });

  //Change Password Form Group
  changePasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required,Validators.maxLength(100),])
  });

  reset_password_expiration_date: Date | null = null
  //Variables to show error messages
  error_login_msg: string = "";
  error_email_msg: string = "";
  error_key_msg: string = "";
  error_newPassword_msg: string = "";

  //Variable for control button to show the form with reset key
  button_reset_key: boolean = false;

  //Set buttons text and variable for disable buttons
  text_button: string = 'Login'
  disable_button: boolean = false;

  constructor (private authService: AuthService, private toastrService: ToastrService, private router: Router, public location: Location, private ticketService: TicketService, private fileService: FileService) {}

  ngOnInit(): void {}

  login() {
    this.disable_button = true
    this.text_button = 'Procesando...'
    this.authService.signIn(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.authService.currentUser = this.authService.getDecodedAccessToken(response.access_token)['user'];
        this.authService.logged_user = true;
        this.ticketService.savePendingTicketsCount()
        this.router.navigate(['home']).then(()=>{
          if(this.authService.currentUser.image){
            this.fileService.downloadProfileImage(this.authService.currentUser.image).subscribe({
              next: (response: any) => {
                let blob: Blob = response.body as Blob;
                let objectURL = window.URL.createObjectURL(blob);
                $(".navbar_icon").attr("src", objectURL);
              }
            });
          }
        }); 
      },
      error: (err: any) => {
        this.disable_button = false
        this.text_button = 'Login'
        switch(err.status){
          case 400: {
            this.error_login_msg = "Formato de datos incorrectos";
            break;
          }
          case 401: {
            this.error_login_msg = "Usuario/Contraseña incorrectos";
            break;
          }
          case 403: {
            this.error_login_msg = "Este usuario esta dado de baja";
            break;
          }  
          default: {
            this.error_login_msg = "Unknown server error"
          }   
        }
      }
    });
  }

  validateEmail(){
    this.disable_button = true
    this.text_button = 'Procesando...'
    this.authService.validateEmail(this.forgotPasswordForm.value).subscribe({
      next: () => {
        this.button_reset_key = false
        this.show("validateResetPassKey");
      },
      error: (err: any) => {
        this.disable_button = false
        this.text_button = 'Enviar email'
        switch(err.status){
          case 400: {
            this.error_email_msg = "Formato de email incorrectos";
            this.button_reset_key = false
            break;
          }
          case 401: { 
            this.error_email_msg = "Email incorrecto"
            this.button_reset_key = false
            break;
          }
          case 423: {
            this.error_email_msg = "El correo electrónico se envió anteriormente, verifique el correo electrónico por favor, se podrá volver a enviar otro correo a las "
            this.reset_password_expiration_date = new Date(err.error['time'])
            this.button_reset_key = true
            break;
          }
          default: {
            this.error_email_msg = "Unknown server error"
            this.button_reset_key = false
          }
        }
      },
      complete: () => {}
    });
  }

  validateResetKey(){
    this.disable_button = true
    this.text_button = 'Procesando...'
    this.authService.validateResetKey(this.validateResetKeyForm.value).subscribe({
      next: () => {
        this.show('changePasswordForm')
      },
      error: (err: any) => {
        this.disable_button = false
        this.text_button = 'Validar clave'
        switch(err.status){
          case 400: { 
            this.error_key_msg = "Formato de clave incorrecto"
            break;
          }
          case 401: { 
            this.error_key_msg = "Clave incorrecta"
            break;
          }
          default: {
            this.error_key_msg = "Unknown server error"
          }
        }
      }
    });
  }

  changePassword(){
    this.disable_button = true
    this.text_button = 'Procesando...'
    this.authService.changePassword(this.changePasswordForm.value).subscribe({
      next: () => {
        this.location.back()
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Contraseña cambiada')
      },
      error: (err: any) => {
        this.disable_button = false
        this.text_button = 'Cambiar contraseña'
        switch(err.status){
          case 401: { 
            this.error_newPassword_msg = "La clave para cambiar la contraseña no es válida"
            break;
          }
          default: {
            this.error_newPassword_msg = "Unknown server error"
          }
        }
      }
    });
  }

  show(option_id: string){
    if(option_id == 'formLogin'){
      this.error_login_msg = "";
      this.error_email_msg = "";
      this.error_key_msg = "";
      this.error_newPassword_msg = "";
      this.text_button = 'Login';
      this.reset_password_expiration_date = null;
      this.disable_button = false
      var element = document.getElementById("formLogin")
      element?.classList.remove("animate")
      document.getElementById('formLogin')!.style.display = 'block';
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'forgotPassword'){
      this.error_login_msg = "";
      this.error_email_msg = "";
      this.error_key_msg = "";
      this.error_newPassword_msg = "";
      this.button_reset_key = false;
      this.text_button = 'Enviar email';
      this.disable_button = false
      document.getElementById('forgotPassword')!.style.display = 'block';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'validateResetPassKey'){
      this.error_login_msg = "";
      this.error_email_msg = "";
      this.error_key_msg = "";
      this.error_newPassword_msg = "";
      this.text_button = 'Validar Clave';
      this.disable_button = false;
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'block';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'changePasswordForm'){
      this.error_login_msg = "";
      this.error_email_msg = "";
      this.error_key_msg = "";
      this.error_newPassword_msg = "";
      this.text_button = 'Cambiar contraseña';
      this.disable_button = false;
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'block';
    }
  }
}
