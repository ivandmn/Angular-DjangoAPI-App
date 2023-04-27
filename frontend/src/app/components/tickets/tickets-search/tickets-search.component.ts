import { Component, OnInit, OnDestroy} from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { TicketH } from 'src/app/models/ticket-h.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { merge } from 'rxjs';

@Component({
  selector: 'app-tickets-search',
  templateUrl: './tickets-search.component.html',
  styleUrls: ['./tickets-search.component.css']
})
export class TicketsSearchComponent implements OnInit, OnDestroy{
  //User Logged
  current_user: User = new User()
  //Arrays for search tickets_H, managers and users
  tickets: Array<TicketH> = []
  managers: Array<User> = [];
  users: Array<User> = [];
  ticket_categories: Array<any> = [];


  showMenu = true;
  

  minDateTickets = new Date(2019,0,1);
  maxDateTickets = new Date(2020,0,1);

  totalTimeTickets: string = '';

  modalMsg: string = '';

  //Pagination options
  page: number = 1;
  itemsPerPage: number = 18;
  itemsCount: number = 0;

  //Ticket List options Form Group
  ticketsSearchForm: FormGroup = new FormGroup({
    manager: new FormControl('',[Validators.required, Validators.maxLength(10)]),
    username: new FormControl({value: '' , disabled: true},[Validators.required, Validators.maxLength(15)]),
    state: new FormControl('',[Validators.required, Validators.maxLength(1)]),
    category: new FormControl('',[Validators.required, Validators.maxLength(15)]),
    title: new FormControl('', [Validators.required]),
    searchMode: new FormControl(true, [Validators.required]),
    fechaInicio: new FormControl('',[Validators.required]),
    fechaFin: new FormControl('',[Validators.required]),
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router) { }

  ngOnInit(): void {
    //Get data of current user
    this.current_user = this.authService.getUserInfo();
    //Set filter options saved on cookies if cookie exist
    if(this.ticketService.getTicketsSearchFilterOptionsFromCookies() != null) {
      this.ticketsSearchForm.patchValue(this.ticketService.getTicketsSearchFilterOptionsFromCookies(), { emitEvent: false })
    }
    //Set page saved on cookies if  cookie exist
    if(this.ticketService.getTicketsSearchPageFromCookies() != null){
      this.page = this.ticketService.getTicketsSearchPageFromCookies()
    }
    //If current user is admin, enable user select and set manager select value to current user username
    if(this.current_user.rol == 'admin'){
      this.ticketsSearchForm.controls['username'].enable()
      //And get all users in DB
      this.getUsers();
    //If current user is not admin, set user select value to current user     
    } else {
      this.ticketsSearchForm.controls['username'].setValue(this.current_user.username, { emitEvent: false });
    }
    //Get current ticket categories
    this.getTicketCategories()
    //Get current managers
    this.getManagers()
    //Get tickets count
    this.getTicketsCount(this.ticketsSearchForm.getRawValue())
    //Get tickets
    this.getTickets(this.ticketsSearchForm.getRawValue())

    //If filter options changes getTickets with new options and save options in cookies
    merge(this.ticketsSearchForm.controls['manager'].valueChanges,
    this.ticketsSearchForm.controls['username'].valueChanges,
    this.ticketsSearchForm.controls['state'].valueChanges,
    this.ticketsSearchForm.controls['category'].valueChanges).subscribe(() => {
      this.getTicketsCount(this.ticketsSearchForm.getRawValue())
      this.getTickets(this.ticketsSearchForm.getRawValue())
      this.ticketService.saveTicketsSearchFilterOptionsInCookies(this.ticketsSearchForm.getRawValue())
      this.page = 1
      this.ticketService.saveTicketsSearchPageInCookies(this.page)
    });

    this.ticketsSearchForm.controls['fechaFin'].valueChanges.subscribe(() => {
      if(this.ticketsSearchForm.controls['fechaFin'].getRawValue() && this.ticketsSearchForm.controls['fechaInicio'].getRawValue()){
        this.getTicketsCount(this.ticketsSearchForm.getRawValue())
        this.getTickets(this.ticketsSearchForm.getRawValue())
        this.ticketService.saveTicketsSearchFilterOptionsInCookies(this.ticketsSearchForm.getRawValue())
        this.page = 1
        this.ticketService.saveTicketsSearchPageInCookies(this.page)
      }
    });

    window.matchMedia("(max-width: 991px)").addEventListener('change', (mm) =>{
      let menuwidth = document.getElementById('side-nav')?.offsetWidth
      if(!mm.matches && this.showMenu == true && menuwidth){
          document.getElementById("main")!.style.marginLeft = menuwidth + 10 + "px";
      }
      if(!mm.matches && this.showMenu == false && menuwidth){
        document.getElementById("main")!.style.marginLeft = "10px";
      }
    })
  }

  ngOnDestroy(): void {
    $('#awaitBackendModalTicketSearch').modal('hide');
    this.modalMsg = ''
  }

  getTicketL(code_ticket_h: number | null): void{
    this.ticketService.saveTicketCodeInCookies(code_ticket_h)
    this.ticketService.changeTicketStateViewed(code_ticket_h).subscribe({
      next: () => {
        this.router.navigateByUrl('tickets/ticket')
      }
    });
  }

  getTickets(options_filter: any): void {
    this.ticketService.getDateRangeTickets(options_filter).subscribe({
      next: (response: any) => {
        if(!response.f_min && !response.f_max){
          this.ticketsSearchForm.controls['fechaInicio'].disable({emitEvent: false})
          this.ticketsSearchForm.controls['fechaFin'].disable({emitEvent: false})
        } else {
          this.ticketsSearchForm.controls['fechaInicio'].enable({emitEvent: false})
          this.ticketsSearchForm.controls['fechaFin'].enable({emitEvent: false})
          this.minDateTickets = response.f_min
          this.maxDateTickets = response.f_max
        }
      }
    });
    this.onRequest('Cargando Mensajes')
    options_filter['page'] = this.page
    options_filter['itemsPerPage'] = this.itemsPerPage
    this.ticketService.getTickets(options_filter).subscribe({
      next: (response: any) => {
        this.tickets = response['tickets']
        this.requestFinished()
      }
    });
  }

  getTicketsCount(options_filter: any){
    this.ticketService.getTicketsCount(options_filter).subscribe({
      next: (response: any) => {
        this.itemsCount = response['count']
        this.totalTimeTickets = response['total-time']
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
    this.ticketService.saveTicketsSearchPageInCookies(this.page)
    this.getTickets(this.ticketsSearchForm.getRawValue())
  }

  resetDatePicker(){
    this.ticketsSearchForm.controls['fechaInicio'].setValue('', { emitEvent: false })
    this.ticketsSearchForm.controls['fechaFin'].setValue('', { emitEvent: false })
    this.getTicketsCount(this.ticketsSearchForm.getRawValue())
    this.getTickets(this.ticketsSearchForm.getRawValue())
    this.ticketService.saveTicketsSearchFilterOptionsInCookies(this.ticketsSearchForm.getRawValue())
    this.page = 1
    this.ticketService.saveTicketsSearchPageInCookies(this.page)
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
            if(ticket.viewed == 0  && ticket.last_response_type != 'P'){
              classes["font-weight-bold"] = true
            }
          } 
          else{
            if(ticket.user != this.current_user.username && ticket.manager != this.current_user.username){
              classes["bg-ticket-yellow"] = true
            } else {
              if(ticket.validation == 0){
                classes["bg-ticket-blue"] = true
              }
              if(ticket.viewed == 0 && ticket.last_response_type != 'R'){
                classes["font-weight-bold"] = true
              }
            }
          }
        }
      } 
      else {
        if(ticket.validation == -1){
          classes["bg-ticket-blue"] = true
        }
        if(ticket.viewed == 0 && ticket.last_response_type != 'P'){
          classes["font-weight-bold"] = true
        }
      }
    }
    return classes
  }


  resetTicketSearchOptions(){
    this.ticketsSearchForm.reset({manager: '', username: '', state: '', category: '', title: '', searchMode: true, fechaInicio: '', fechaFin: ''}, {emitEvent: false})
    this.page = 1
    this.getTicketsCount(this.ticketsSearchForm.getRawValue())
    this.getTickets(this.ticketsSearchForm.getRawValue())
    this.ticketService.saveTicketsSearchFilterOptionsInCookies(this.ticketsSearchForm.getRawValue())
    this.ticketService.saveTicketsSearchPageInCookies(this.page)
  }

  submitForm(){
    this.page = 1
    this.getTicketsCount(this.ticketsSearchForm.getRawValue())
    this.getTickets(this.ticketsSearchForm.getRawValue())
    this.ticketService.saveTicketsSearchFilterOptionsInCookies(this.ticketsSearchForm.getRawValue())
    this.ticketService.saveTicketsSearchPageInCookies(this.page)
  }

  onRequest(modal_msg: string = ''): void {
    $('#awaitBackendModalTicketSearch').modal({backdrop: 'static', keyboard: false})  
    $('#awaitBackendModalTicketSearch').modal('show')  
    this.modalMsg = modal_msg
  }
  
  requestFinished(): void {
    setTimeout( () => {
      $('#awaitBackendModalTicketSearch').modal('hide');
      this.modalMsg = ''
    },100)
  }

  toggleMenu(){
    let menuwidth = document.getElementById('side-nav')?.offsetWidth
    if(this.showMenu == true && menuwidth){
      $("#side-nav").animate({left:-menuwidth?.toString()}, {
        duration: 300,
        complete: () => {
          $("#side-nav").css('visibility', 'hidden')
          this.showMenu = false
        }, 
        easing: "linear"
      }, );
      document.getElementById("main")!.style.marginLeft = "10px";
    } else {
      $("#side-nav").css('visibility', 'visible')
      this.showMenu = true
      $("#side-nav").animate({left:"0px"}, {
        duration: 300,
        complete: () => {
        },
        easing: "linear"
      });
      if(menuwidth){
        let documentWidth = $(document).width()
        if(documentWidth){
          if(documentWidth > 991){
            document.getElementById("main")!.style.marginLeft = menuwidth + 10 + "px";
          }
        }     
      }
    }
  }

}
