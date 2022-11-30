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
  //User Logged
  current_user: User = new User()

  //Arrays for search tickets_H, managers and users
  tickets: Array<TicketH> = []
  managers: Array<User> | null = [];
  users: Array<User> = [];
  ticket_categories: Array<any> = [];

  //Pagination options
  page: number = 1;
  itemsPerPage: number = 25;
  itemsCount: number = 0;


  //Ticket List options Form Group
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
    //Get data of current user
    this.current_user = this.authService.getUserInfo();
    //Get current ticket categories
    this.getTicketCategories()
    //Get current managers
    this.getManagers()

    //If current user is admin, enable user select and set manager select value to current user username
    if(this.current_user.rol == 'admin'){
      this.ticketsListForm.controls['manager'].setValue(this.current_user.username);
      this.ticketsListForm.controls['username'].enable()
      //And get all users in DB
      this.getUsers();
    //If current user is not admin, set user select value to current user     
    } else {
      this.ticketsListForm.controls['username'].setValue(this.current_user.username);
    }

    //Set filter options saved on cookies if cookie exist
    if(this.ticketService.getFilterOptionsFromCookies() != null) {
      this.ticketsListForm.patchValue(this.ticketService.getFilterOptionsFromCookies())
    }

    //Get tickets count
    this.getTicketsCount()

    //Get tickets
    this.getTickets()

    //If filter options changes getTickets with new options and save options in cookies
    this.ticketsListForm.valueChanges.subscribe(() => {
      this.getTicketsCount()
      this.getTickets()
      this.ticketService.saveFilterOptionsInCookies(this.ticketsListForm.getRawValue())
      this.page = 1
    })
  }

  getTicketL(code_ticket_h: number | null): void{
    this.ticketService.saveTicketCodeInCookies(code_ticket_h)
    this.ticketService.changeTicketStateViewed(code_ticket_h, this.current_user.username).subscribe({
      next: (response: any) => {
        this.router.navigateByUrl('tickets/ticket')
      },
      error: (err: any) => {},
      complete: () => {}
    });

  }

  getTickets(): void {
    let options_filter: any = this.ticketsListForm.getRawValue()
    options_filter['page'] = this.page
    options_filter['itemsPerPage'] = this.itemsPerPage
    this.ticketService.getTickets(options_filter).subscribe({
      next: (response: any) => {
        this.tickets = response
      },
      error: (err: any) => {},
      complete: () => {}
    });
  }

  getTicketCategories(): void {
    this.ticketService.getCategories().subscribe({
      next: (response: any) => {
        this.ticket_categories = response
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

  getTicketsCount(){
    this.ticketService.getTicketsCount(this.ticketsListForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.itemsCount = response
      },
      error: (err: any) => {},
      complete: () => {}
    });
  }

  paginationChange(event: any){
    this.page = event
    this.getTickets()
  }
}
