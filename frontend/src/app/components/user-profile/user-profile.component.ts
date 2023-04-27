import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { FileService } from 'src/app/services/file.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  
  //Variable to save current user info
  current_user: User = this.authService.getUserInfo()
  //Variable to save user image
  userImg: any = null
  //Variable to save user image error
  userImgError: string = ''
  //Variable to save new password error
  error_newPassword_msg: string = ''
  //Variable to disable html button on new password form
  disable_button: boolean = false;

  //Change Password Form Group
  changePasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required,Validators.maxLength(100),]),
    password_repeat: new FormControl('', [Validators.required,Validators.maxLength(100)])
  });

  constructor(public authService: AuthService, private fileService: FileService, private toastrService: ToastrService, private router: Router, public location: Location, private userService: UsersService) { }

  ngOnInit(): void {
    this.configurateToastr();
    //Get user's image and display on client
    this.userService.getUserImgPath(this.current_user.username).subscribe({
      next: (response: any) => {
        if(response['img_path'] != null){
          this.fileService.downloadProfileImage(response['img_path']).subscribe({
            next: (response: any) => {
              let blob: Blob = response.body as Blob;
              let objectURL = window.URL.createObjectURL(blob);
              $("#user-img").attr("src", objectURL);
              $(".navbar_icon").attr("src", objectURL);
            }
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
      this.hideChangePasswordModal()
  }

  changePassword(){
    if(this.changePasswordForm.invalid){
      this.error_newPassword_msg = 'Contraseña inválida'
    } else {
      if(this.changePasswordForm.controls['password'].getRawValue() != this.changePasswordForm.controls['password_repeat'].getRawValue()){
        this.error_newPassword_msg = 'Las contraseñas no coinciden'
      }
      else{
        this.disable_button = true
        this.authService.changePassword({password: this.changePasswordForm.controls['password'].getRawValue()}).subscribe({
          next: () => {
            this.hideChangePasswordModal()
            this.toastrService.success('Contraseña cambiada')
            this.disable_button = false
          },
          error: (err: any) => {
            this.disable_button = false
            this.hideChangePasswordModal()
            this.toastrService.error('Ha sucedido un error, no se ha podido cambiar la contraseña')
          }
        });
      }
    }

  }

  selectProfileImage(){
    document.getElementById('my-file')?.click()
  }

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
        if(file[0].type == 'image/png' || file[0].type == 'image/jpeg'){
          if(this.current_user.username){
            this.fileService.uploadProfileImage(file[0]).subscribe({
              next: () => {
                this.current_user = this.authService.getUserInfo()
                this.fileService.downloadProfileImage(this.current_user.image).subscribe({
                  next: (response: any) => {
                    let blob: Blob = response.body as Blob;
                    let objectURL = window.URL.createObjectURL(blob);
                    $("#user-img").attr("src", objectURL);
                    $(".navbar_icon").attr("src", objectURL);
                  },
                  error: (err: any) => {
                    this.toastrService.error('Server error')
                  }
                });
              },
              error: (err: any) => {
                this.toastrService.error('Error al subir imagen')
              }
            });
            this.userImgError = ''
          }
        } else{
          this.userImgError = 'Formato de archivo no admitido'
        }
    }
  }

  showChangePasswordModal(){
    $('#showChangePasswordModal').modal({backdrop: 'static', keyboard: true})  
    $('#showChangePasswordModal').modal('show')  
  }

  hideChangePasswordModal(){
    $('#showChangePasswordModal').modal('hide');
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }
}
