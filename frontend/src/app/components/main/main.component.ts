import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router, public ticketService: TicketService) { }

  ngOnInit(): void {
    this.authService.isLoggedIn
    this.ticketService.getTicketCodeFromCookies()
  }

  logout(){
    this.authService.singOut()
  }

}
