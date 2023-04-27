import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TicketService } from 'src/app/services/ticket.service';
import { FileService } from 'src/app/services/file.service';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();

  constructor(public authService: AuthService, public ticketService: TicketService, public fileService: FileService, private userService: UsersService) { }

  ngOnInit(): void {
    //If user is logged get pending tickets count
    if(this.current_user.username){
      this.ticketService.savePendingTicketsCount()
    }
    //Get user's image and display on client
    this.userService.getUserImgPath(this.current_user.username).subscribe({
      next: (response: any) => {
        if(response['img_path'] != null){
          this.fileService.downloadProfileImage(response['img_path']).subscribe({
            next: (response: any) => {
              let blob: Blob = response.body as Blob;
              let objectURL = window.URL.createObjectURL(blob);
              $(".navbar_icon").attr("src", objectURL);
            }
          });
        }
      }
    });

    window.matchMedia("(max-width: 991px)").addEventListener('change', function(mm) {
        if (mm.matches) {
            let elements = document.getElementsByClassName('nav-text-option')
            Array.from(elements).forEach(function(element) {
              element.addEventListener('click', clickToggleBtn);
            });
        }
        else {
          let elements = document.getElementsByClassName('nav-text-option')
          Array.from(elements).forEach(function(element) {
            element.removeEventListener('click', clickToggleBtn)
          });
        }
    });
  }

  /**
   * **Logout session**
   */
  logout(){
    this.authService.signOut()
  }
}

/**
 * **Click toggle menu button**
 */
function clickToggleBtn(): void{
  document.getElementById('toggle-btn')?.click()
}
