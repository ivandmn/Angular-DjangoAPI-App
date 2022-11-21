import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{

  //Login Form Group
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('',[
      Validators.required,
      Validators.maxLength(20)
    ]),
    password: new FormControl('',[
      Validators.required,
      Validators.maxLength(100)
    ])
  });

  //Forgot Password Form Group
  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('',[
      Validators.required,
      Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
    ])
  });

  //Resey Key Form Group
  validateResetKeyForm: FormGroup = new FormGroup({
    key: new FormControl('', [
      Validators.required,
    ])
  });

  //Change Password Form Group
  changePasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(30),
    ])
  });

  //Variables to show error messages
  error_login_msg: string = "";
  error_email_msg: string = "";
  error_key_msg: string = "";
  error_newPassword_msg: string = "";

  //Variable for control a the form with reset key
  button_reset_key: boolean = false;

  constructor (public fb: FormBuilder, public authService: AuthService, public router: Router, public location: Location, private toastrService: ToastrService) {}

  ngOnInit(): void {
    
  }

  login() {
    this.authService.signIn(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.authService.currentUser = this.authService.getDecodedAccessToken(response.access_token)['user'];
        this.authService.logged_user = true;
        this.router.navigate(['home'])
      },
      error: (err: any) => {
        switch(err.status){
          case 401: {
            this.error_login_msg = "Username/Password incorrect";
            break;
          } 
          default: {
            this.error_login_msg = "Unknow server error"
          }   
        }
      },
      complete: () => {}
    });
  }

  validateEmail(){
    this.authService.validateEmail(this.forgotPasswordForm.value).subscribe({
      next: (response: any) => {
        this.error_email_msg = ""
        this.button_reset_key = false
        this.show("validateResetPassKey");
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            this.error_email_msg = "Incorrect Email"
            this.button_reset_key = false
            break;
          }
          case 423: {
            this.error_email_msg = "Email has been sent earlier, check email please"
            this.button_reset_key = true
            break;
          }
          default: {
            this.error_email_msg = "Unknow server error"
            this.button_reset_key = false
          }
        }
      },
      complete: () => {}
    });
  }

  validateResetKey(){
    this.authService.validateResetKey(this.validateResetKeyForm.value).subscribe({
      next: () => {
        this.error_key_msg = ""
        this.show('changePasswordForm')
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            this.error_key_msg = "Incorrect key"
            break;
          }
          default: {
            this.error_key_msg = "Unknow server error"
          }
        }
      },
      complete: () => {}
    });
  }

  changePassword(){
    this.authService.changePassword(this.changePasswordForm.value).subscribe({
      next: () => {
        this.location.back()
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Contraseña cambiada')
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            this.error_newPassword_msg = "Not valid key to change password"
            break;
          }
          default: {
            this.error_newPassword_msg = "Unknow server error"
          }
        }
      },
      complete: () => {}
    });
  }

  show(option_id: string){
    if(option_id == 'formLogin'){
      var element = document.getElementById("formLogin")
      element?.classList.remove("animate")
      document.getElementById('formLogin')!.style.display = 'block';
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'forgotPassword'){
      document.getElementById('forgotPassword')!.style.display = 'block';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'validateResetPassKey'){
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'block';
      document.getElementById('changePasswordForm')!.style.display = 'none';
    }
    if(option_id == 'changePasswordForm'){
      document.getElementById('forgotPassword')!.style.display = 'none';
      document.getElementById('formLogin')!.style.display = 'none';
      document.getElementById('validateResetPassKey')!.style.display = 'none';
      document.getElementById('changePasswordForm')!.style.display = 'block';
    }
  }
}
