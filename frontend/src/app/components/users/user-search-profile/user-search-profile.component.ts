import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';
import { TicketService } from 'src/app/services/ticket.service';
import { UsersService } from 'src/app/services/users.service';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { PowerbiH } from 'src/app/models/powerbi-h.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-search-profile',
  templateUrl: './user-search-profile.component.html',
  styleUrls: ['./user-search-profile.component.css']
})
export class UserSearchProfileComponent implements OnInit{
  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save user profile info
  user: User = new User()
  //Variable to save user name
  user_name: string | null = this.userService.getUsernameProfileFromCookies()

  //Pwbi categories dropdown variables
  pwbidropdownList = []
  pwbiselectedItems: Array<any> = []
  pwbidropdownSettings  = {
    singleSelection: false,
    idField: 'pwbicat_id',
    textField: 'pwbicat_name',
    selectAllText: 'Selecionar todos',
    unSelectAllText: 'Quitar todos',
    enableCheckAll: false,
    allowSearchFilter: false
  };

  //Variable to enable or disable save user button
  saveButtonUser: boolean = false
  //Variable to enable or disable edit user button
  enableEditUserButton: boolean = true


  //Ticket List options Form Group
  userInfoForm: FormGroup = new FormGroup({
    username: new FormControl({value: '' , disabled: true},[Validators.required]),
    full_name: new FormControl({value: '' , disabled: true},[Validators.required]),
    email: new FormControl({value: '' , disabled: true},[Validators.required, Validators.email]),
    rol: new FormControl({value: '' , disabled: true},[Validators.required]),
    pwbi_permissions: new FormControl(''),
  });
  constructor(private userService: UsersService, private fileService: FileService, private authService: AuthService, private ticketService: TicketService, private router: Router, private powerbiService: PowerbiService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.configurateToastr()
    if(this.current_user.rol == 'admin'){
      this.userInfoForm.valueChanges.subscribe(() => {
        this.saveButtonUser = true
      })
      this.powerbiService.getPowerBiAllCategories().subscribe({
        next: (response: any) => {
          this.pwbidropdownList = response
          //Get user info and user image to display on client
          this.userService.getUserInfo(this.user_name).subscribe({
            next: (response: any) => {
              this.user = response
              this.userInfoForm.controls['username'].setValue(this.user.username, {emitEvent: false})
              this.userInfoForm.controls['full_name'].setValue(this.user.name, {emitEvent: false})
              this.userInfoForm.controls['email'].setValue(this.user.email, {emitEvent: false})
              this.userInfoForm.controls['rol'].setValue(this.user.rol, {emitEvent: false})
              this.userInfoForm.controls['pwbi_permissions'].setValue(this.user.powerbi_permissions, {emitEvent: false})
              if(this.user.powerbi_permissions){
                let pwbi_p = this.user.powerbi_permissions.split(';')
                let final_array: Array<any> = []
                pwbi_p.forEach(element => {
                  this.pwbidropdownList.filter((value) => {
                    if(value['pwbicat_id'] == Number(element)){
                      final_array.push(value)
                      return value
                    }
                    else {
                      return null
                    }
                  })
                });
                this.pwbiselectedItems = final_array
              }
              if(this.user.image){
                this.fileService.downloadProfileImage(this.user.image).subscribe({
                  next: (response: any) => {
                    let blob: Blob = response.body as Blob;
                    let objectURL = window.URL.createObjectURL(blob);
                    $("#user-search-img").attr("src", objectURL);
                  }
                });
              }
            }
          });
        }
      });
    } else {
      this.userService.getUserInfo(this.user_name).subscribe({
        next: (response: any) => {
          this.user = response
          this.userInfoForm.controls['username'].setValue(this.user.username, {emitEvent: false})
          this.userInfoForm.controls['full_name'].setValue(this.user.name, {emitEvent: false})
          this.userInfoForm.controls['email'].setValue(this.user.email, {emitEvent: false})
          this.userInfoForm.controls['rol'].setValue(this.user.rol, {emitEvent: false})
          this.userInfoForm.controls['pwbi_permissions'].setValue(this.user.powerbi_permissions, {emitEvent: false})
          if(this.user.image){
            this.fileService.downloadProfileImage(this.user.image).subscribe({
              next: (response: any) => {
                let blob: Blob = response.body as Blob;
                let objectURL = window.URL.createObjectURL(blob);
                $("#user-search-img").attr("src", objectURL);
              }
            });
          }
        }
      });
    }

  }

  enableEditUser(){
    this.enableEditUserButton = false
    this.userInfoForm.controls['full_name'].enable({emitEvent: false})
    this.userInfoForm.controls['email'].enable({emitEvent: false})
  }

  onPowerbiItemSelectChange(){
    let final_pwbi_permissions = ''
    this.pwbiselectedItems.forEach((element, index) => {
      if(index + 1 == this.pwbiselectedItems.length){
        final_pwbi_permissions = final_pwbi_permissions + String(element['pwbicat_id'])
      } else {
        final_pwbi_permissions = final_pwbi_permissions + String(element['pwbicat_id']) + ';'
      }
    });
    this.userInfoForm.controls['pwbi_permissions'].setValue(final_pwbi_permissions)
  }

  saveUser(){
    this.userService.editUser(this.userInfoForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.toastrService.success('Usuario actualizado')
      }
    });
  }

  getTicketsAsManager(){
    let searchOptions = {
      "manager": this.current_user.username,
      "username": this.user_name,
      "state": "",
      "category": "",
      "title": "",
      "searchMode": true,
      "fechaInicio": "",
      "fechaFin": ""
    }
    this.ticketService.saveTicketsSearchFilterOptionsInCookies(searchOptions)
    this.ticketService.saveTicketsSearchPageInCookies(1)
    this.router.navigateByUrl('tickets/search')
  }

  getUserTicketsAsUser(){
    let searchOptions = {
      "manager": this.user_name,
      "username": this.current_user.username,
      "state": "",
      "category": "",
      "title": "",
      "searchMode": true,
      "fechaInicio": "",
      "fechaFin": ""
    }
    this.ticketService.saveTicketsSearchFilterOptionsInCookies(searchOptions)
    this.ticketService.saveTicketsSearchPageInCookies(1)
    this.router.navigateByUrl('tickets/search')
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }
}
