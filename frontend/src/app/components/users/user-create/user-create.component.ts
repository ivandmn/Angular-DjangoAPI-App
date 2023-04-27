import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PowerbiService } from 'src/app/services/powerbi.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit{

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();


  //Pwbi Categories Drop Down Varaibles
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

  createUserForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(15)]),
    pasword: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    usrname: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    privilegios: new FormControl('user', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.maxLength(60), Validators.email]),
    powerbi_permissions: new FormControl('')
  });
  constructor(private authService: AuthService, private router: Router, private userService: UsersService, private toastrService: ToastrService, private powerbiService: PowerbiService) { }

  ngOnInit(): void {
    this.configurateToastr();
    this.powerbiService.getPowerBiAllCategories().subscribe({
      next: (response: any) => {
        this.pwbidropdownList = response  
        }
    });
  }

  createUser(): void {
    let newUser = this.createUserForm.getRawValue()
    this.userService.createUser(newUser).subscribe({
      next: (response: any) => {
        this.router.navigateByUrl('users/search').then(() => {
          this.toastrService.success('Usuario creado')
        })
      },
      error: () => {
        this.router.navigateByUrl('users/search').then(() => {
          this.toastrService.error('Error al crear el usuario')
        })
      }
    }); 
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
    this.createUserForm.controls['powerbi_permissions'].setValue(final_pwbi_permissions)
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }
}
