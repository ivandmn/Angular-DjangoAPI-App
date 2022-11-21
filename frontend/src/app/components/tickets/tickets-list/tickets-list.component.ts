import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TicketService } from 'src/app/services/ticket.service';
import { User } from 'src/app/models/user.model';
import { TicketH } from 'src/app/models/ticket-h.model';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import { FormGroup, Validators, FormControl } from '@angular/forms';
 
@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent implements OnInit {

  user: User = new User()

  tickets: Array<TicketH> = []
  managers: Array<User> | null = [];
  users: Array<User> = [];

  ticketsListForm: FormGroup = new FormGroup({
    manager: new FormControl('',[
      Validators.required
    ]),
    username: new FormControl({value: '' , disabled: true},[
      Validators.required
    ]),
    state: new FormControl('A',[
      Validators.required
    ]),
    category: new FormControl('',[
      Validators.required
    ]),
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, public location: Location) { }

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.getManagers()

    if(this.user.rol == 'admin'){
      this.ticketsListForm.controls['manager'].setValue(this.user.username);
      this.ticketsListForm.controls['username'].enable()
      this.getUsers();      
    } else {
      this.ticketsListForm.controls['username'].setValue(this.user.username);
    }

    console.log(this.ticketService.getFilterOptionsFromCookies())
    
    this.getTickets()

    this.ticketsListForm.valueChanges.subscribe((value) => {
      this.getTickets()
      this.ticketService.saveFilterOptionsInCookies(value)
    })
  }

  getTicketL(code_ticket_h: number | null): void{
    this.ticketService.t_code = code_ticket_h
    this.router.navigateByUrl('tickets/ticket')
  }

  getTickets(): void {
    this.ticketService.getTickets(this.ticketsListForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.tickets = response
      },
      error: (err: any) => {},
      complete: () => {}
    });
  }

  getManagers(): void {
    if(!this.ticketService.managers){
      this.ticketService.getManagers().subscribe({
        next: (response: any) => {
          this.managers = response
          this.ticketService.managers = response
        },
        error: (err: any) => {},
        complete: () => {}
      });
    } else {
      this.managers = this.ticketService.managers
    }
  }

  getUsers(): void {
    if(!this.ticketService.users){
      this.ticketService.getUsers().subscribe({
        next: (response: any) => {
          this.users = response
          this.ticketService.users = response
        },
        error: (err: any) => {},
        complete: () => {}
      });
    } else {
      this.users = this.ticketService.users
    }
  }
}
