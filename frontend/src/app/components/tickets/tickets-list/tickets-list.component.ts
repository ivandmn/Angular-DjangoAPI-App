import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TicketService } from 'src/app/services/ticket.service';
import { User } from 'src/app/models/user.model';
import { TicketH } from 'src/app/models/ticket-h.model';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { merge } from 'rxjs';
 
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
  managers: Array<User> = [];
  users: Array<User> = [];
  ticket_categories: Array<any> = [];

  ticketsCountAdmin: number = 0;

  //Pagination options
  page: number = 1;
  itemsPerPage: number = 25;
  itemsCount: number = 0;

  //Ticket List options Form Group
  ticketsListForm: FormGroup = new FormGroup({
    manager: new FormControl('',[Validators.required, Validators.maxLength(10)]),
    validation: new FormControl(false,[Validators.required]),
    username: new FormControl({value: '' , disabled: true},[Validators.required, Validators.maxLength(15)]),
    state: new FormControl('A',[Validators.required, Validators.maxLength(1)]),
    category: new FormControl('',[Validators.required, Validators.maxLength(15)]),
    userMode: new FormControl(false,[Validators.required])
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, public location: Location, private cookieService: CookieService) { }

  ngOnInit(): void {
    //Get data of current user
    this.current_user = this.authService.getUserInfo();

    //If current user is admin, enable user select and set manager select value to current user username
    if(this.current_user.rol == 'admin'){
      this.ticketsListForm.controls['manager'].setValue(this.current_user.username, { emitEvent: false });
      this.ticketsListForm.controls['username'].enable()
      //And get all users in DB
      this.getUsers();
    //If current user is not admin, set user select value to current user     
    } else {
      this.ticketsListForm.controls['username'].setValue(this.current_user.username, { emitEvent: false });
    }

    //Set filter options saved on cookies if cookie exist
    if(this.ticketService.getTicketsFilterOptionsFromCookies() != null) {
      this.ticketsListForm.patchValue(this.ticketService.getTicketsFilterOptionsFromCookies(), { emitEvent: false })
      if(this.ticketsListForm.controls['userMode'].value == true){
        this.ticketsListForm.controls['username'].disable()
        $('#managerSelectTicketList option[value=' + this.current_user.username + ']' ).attr("disabled","disabled")
      }
    }
    //Set page saved on cookies if  cookie exist
    if(this.ticketService.getTicketsPageFromCookies() != null){
      this.page = this.ticketService.getTicketsPageFromCookies()
    }

    //Get tickets count
    this.getTicketsCount()
    //Get current ticket categories
    this.getTicketCategories()
    //Get current managers
    this.getManagers()
    //Get tickets
    this.getTickets(this.ticketsListForm.getRawValue())

    //If filter options changes getTickets with new options and save options in cookies
    merge(this.ticketsListForm.controls['manager'].valueChanges,
    this.ticketsListForm.controls['validation'].valueChanges,
    this.ticketsListForm.controls['username'].valueChanges,
    this.ticketsListForm.controls['state'].valueChanges,
    this.ticketsListForm.controls['category'].valueChanges).subscribe(() => {
      this.getTicketsCount()
      this.getTickets(this.ticketsListForm.getRawValue())
      this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
      this.page = 1
      this.ticketService.saveTicketsPageFromCookies(this.page)
    });



    this.ticketsListForm.controls['userMode'].valueChanges.subscribe(() => {
      if(this.ticketsListForm.controls['userMode'].value == true){
        this.ticketsListForm.controls['manager'].setValue('', { emitEvent: false })
        this.ticketsListForm.controls['username'].setValue(this.current_user.username, { emitEvent: false })
        this.ticketsListForm.controls['username'].disable()
        $('#managerSelectTicketList option[value=' + this.current_user.username + ']' ).attr("disabled","disabled")
        this.getTicketsCount()
        this.getTickets(this.ticketsListForm.getRawValue())
        this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
        this.page = 1
        this.ticketService.saveTicketsPageFromCookies(this.page)
      } else {
        this.ticketsListForm.controls['manager'].setValue(this.current_user.username, { emitEvent: false })
        this.ticketsListForm.controls['username'].setValue('', { emitEvent: false })
        this.ticketsListForm.controls['username'].enable()
        $('#managerSelectTicketList option[value=' + this.current_user.username + ']' ).removeAttr('disabled')
        this.getTicketsCount()
        this.getTickets(this.ticketsListForm.getRawValue())
        this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
        this.page = 1
        this.ticketService.saveTicketsPageFromCookies(this.page)
      }
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

  getTickets(options_filter: any): void {
    if(options_filter['validation'] == true){
      if(this.current_user.rol == 'admin'){
        options_filter['validation'] = 0
      } else {
        options_filter['validation'] = -1
      }    
    } else {
      options_filter['validation'] = ''
    }

    if(options_filter['state'] == 'C'){
      options_filter['validation'] = ''
    }
    options_filter['currentUser'] = this.current_user.username
    options_filter['page'] = this.page
    options_filter['itemsPerPage'] = this.itemsPerPage
    this.ticketService.getTickets(options_filter).subscribe({
      next: (response: any) => {
        this.tickets = response
      }
    });
  }

  getTicketsCount(){
    let options_filter = this.ticketsListForm.getRawValue()
    options_filter['currentUser'] = this.current_user.username
    this.ticketService.getTicketsCount(options_filter).subscribe({
      next: (response: any) => {
        this.itemsCount = response
      }
    });
  }

  getTicketCategories(): void {
    this.ticketService.getCategories().subscribe({
      next: (response: any) => {
        this.ticket_categories = response
      }
    });
  }

  getManagers(): void {
    this.ticketService.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response
      }
    });
  }

  getUsers(): void {
    this.ticketService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response
      }
    });
  }

  paginationChange(event: any){
    this.page = event
    this.ticketService.saveTicketsPageFromCookies(this.page)
    this.getTickets(this.ticketsListForm.getRawValue())
  }

  getTicketClasses(ticket: any){
    var classes: any = {}
    if(ticket.state == 'C'){
      classes["bg-ticket-closed"] = true
    }
    else {
      if(this.current_user.rol == 'admin'){
        if(ticket.user == this.current_user.username && ticket.manager == this.current_user.username){
          classes["bg-ticket-self"] = true
        } 
        else {
          if(ticket.user == this.current_user.username && ticket.manager != this.current_user.username){
            if(ticket.validation == 0){
              classes["bg-ticket-usermode"] = true
            } 
            if(ticket.validation == -1){
              classes["bg-ticket-usermode-response"] = true
            }
            if(ticket.viewed == 0 && ticket.validation == -1 && ticket.last_response_type != 'P'){
              classes["font-weight-bold"] = true
            }
          } 
          else{
            if(ticket.validation == 0){
              classes["bg-ticket-blue"] = true
            }
            if(ticket.viewed == 0 && ticket.validation == 0 && ticket.last_response_type != 'R'){
              classes["font-weight-bold"] = true
            }
          }
        }
      } 
      else {
        if(ticket.validation == -1){
          classes["bg-ticket-blue"] = true
        }
        if(ticket.viewed == 0 && ticket.validation == -1 && ticket.last_response_type != 'P'){
          classes["font-weight-bold"] = true
        }
      }
    }

    return classes
  }
}
