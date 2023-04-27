import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {
  //Variable to show left menu
  showMenu = true;
  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save all users and display on client table
  users: Array<any> = [];
  usersFilterArray: Array<any> = [];

  //Variable to save actual page
  page: number = 1;
  //Variable to save items per page in screen
  itemsPerPage: number = 15;
  //Variable to save items count
  itemsCount: number = 0;

  //Variable to save modal message
  modalMsg: string = '';

  //Search user form
  searchUserForm: FormGroup = new FormGroup({
    username: new FormControl('',[Validators.required, Validators.maxLength(255)]),
  });

  usersEnabledForm: FormGroup = new FormGroup({
    mode: new FormControl('enabled',[Validators.required, Validators.maxLength(255)]),
  });

  constructor(private authService: AuthService, private router: Router, private userService: UsersService) { }

  ngOnInit(): void {
    this.getUsers();

    this.usersEnabledForm.controls['mode'].valueChanges.subscribe(() => {
      let count = 0
      this.page = 1
      if(this.usersEnabledForm.controls['mode'].value == 'enabled'){
        this.usersFilterArray = []
        this.users.forEach((user) => {
          if(user.f_baja == null){
            this.usersFilterArray.push(user)
            count++
          }
        })
      } else {
        this.usersFilterArray = []
        this.users.forEach((user) => {
          if(user.f_baja != null){
            this.usersFilterArray.push(user)
            count++
          }
        })  
      }
      this.itemsCount = count
    })
  }

  paginationChange(event: any){
    this.page = event
  }

  getUsers(mode: string = 'default'){
    this.userService.getUsers(this.searchUserForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.users = response
        if(mode == 'default'){
          this.page = 1
        }
        let count = 0
        if(this.usersEnabledForm.controls['mode'].value == 'enabled'){
          this.usersFilterArray = []
          this.users.forEach((user) => {
            if(user.f_baja == null){
              this.usersFilterArray.push(user)
              count++
            }
          })
        } else {
          this.usersFilterArray = []
          this.users.forEach((user) => {
            if(user.f_baja != null){
              this.usersFilterArray.push(user)
              count++
            }
          })  
        }
        this.itemsCount = count
      }
    });
  }

  enterUserProfle(username: string): void{
    this.userService.saveUsernameProfileInCookies(username)
    this.router.navigateByUrl('users/search/profile')
  }

  altaUsuario(username: string | null){
    this.userService.altaUsuario(username).subscribe({
      next: (response: any) => {
        this.getUsers('altaUsuario')
      }
    });
    
  }

  bajaUsuario(username: string | null){
    this.userService.bajaUsuario(username).subscribe({
      next: (response: any) => {
          this.getUsers('bajaUsuario')
      }
    });
  }

  showConfirmModal(msg: string, function_name: any, username: string, btn_discard: string = "No", btn_success: string = "Si"): void {
      $('#confirmModalSearchUser').modal("show");
      
      document.getElementById("confirmModalContentSearchUser")!.innerHTML = `
        <div class="modal-content">
        <div class="modal-body text-center">
            ${msg}
        </div>
        <div class="modal-footer d-inline text-center">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${btn_discard}</button>
            <button type="button" class="btn btn-secondary" id="modal-success-btn-search-user" data-bs-dismiss="modal">${btn_success}</button>
        </div>
        </div>`

      document.getElementById("modal-success-btn-search-user")!.addEventListener('click', () =>{
          switch(function_name){
            case "bajaUsuario":
              this.bajaUsuario(username)
              break;
            case "altaUsuario":
              this.altaUsuario(username)
              break;
            default:
              break;
          }
      })
  }

}
