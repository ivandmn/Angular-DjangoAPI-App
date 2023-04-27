import { Component, OnInit, OnDestroy} from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TicketService } from 'src/app/services/ticket.service';
import { User } from 'src/app/models/user.model';
import { TicketH } from 'src/app/models/ticket-h.model';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl} from '@angular/forms';

import { merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ThisReceiver } from '@angular/compiler';
 
@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent implements OnInit, OnDestroy{

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Arrays for save tickets, managers, users and ticket categories
  tickets: Array<TicketH> = []
  managers: Array<User> = [];
  users: Array<User> = [];
  ticket_categories: Array<any> = [];

  //Variable to display or hide left menu
  showMenu: boolean = true;
  //Variable to display or hide legend
  showLegend: boolean = false;
  //Variable to display open tickets table format or close tickets table format
  closedTickets: boolean = false;
  //Variable to save tickets pending count info
  ticketsPendingCount: any = {}

  //Variable to save modal message
  modalMsg: string = '';

  //Variable to save actual page
  page: number = 1;
  //Variable to save items per page in screen
  itemsPerPage: number = 20;
  //Variable to save items count
  itemsCount: number = 0;

  //Ticket List options Form Group
  ticketsListForm: FormGroup = new FormGroup({
    manager: new FormControl('',[Validators.required, Validators.maxLength(10)]),
    validation: new FormControl(false,[Validators.required]),
    username: new FormControl({value: '' , disabled: true},[Validators.required, Validators.maxLength(15)]),
    state: new FormControl('A',[Validators.required, Validators.maxLength(1)]),
    category: new FormControl('',[Validators.required, Validators.maxLength(15)]),
    userMode: new FormControl(false,[Validators.required]),
    viewed: new FormControl(false,[Validators.required]),
  });

  constructor(private authService: AuthService, public ticketService: TicketService, private router: Router, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.configurateToastr()
    //If current user is admin, enable user select and set manager select value to current user username
    if(this.current_user.rol == 'admin'){
      this.ticketsListForm.controls['manager'].setValue(this.current_user.username, { emitEvent: false });
      this.ticketsListForm.controls['username'].enable({emitEvent: false})
      //And get all users in DB
      this.getUsers();
    //If current user is not admin, set user select value to current user     
    } else {
      this.ticketsListForm.controls['username'].setValue(this.current_user.username, { emitEvent: false });
    }

    //Set filter options saved on cookies if cookie exist
    if(this.ticketService.getTicketsFilterOptionsFromCookies() != null) {
      this.ticketsListForm.patchValue(this.ticketService.getTicketsFilterOptionsFromCookies(), { emitEvent: false })
    }
    //Set page saved on cookies if  cookie exist
    if(this.ticketService.getTicketsPageFromCookies() != null){
      this.page = this.ticketService.getTicketsPageFromCookies()
    }
    //Get current ticket categories
    this.getTicketCategories()
    //Get current managers
    this.getManagers()
    //Get tickets count
    this.getTicketsCount(this.ticketsListForm.getRawValue())
    //Get tickets
    this.getTickets(this.ticketsListForm.getRawValue())

    //If filter options changes getTickets with new options and save options in cookies
    merge(this.ticketsListForm.controls['manager'].valueChanges,
    this.ticketsListForm.controls['validation'].valueChanges,
    this.ticketsListForm.controls['username'].valueChanges,
    this.ticketsListForm.controls['state'].valueChanges,
    this.ticketsListForm.controls['category'].valueChanges,
    this.ticketsListForm.controls['viewed'].valueChanges).subscribe(() => {
      this.getTicketsCount(this.ticketsListForm.getRawValue())
      this.getTickets(this.ticketsListForm.getRawValue())
      this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
      this.page = 1
      this.ticketService.saveTicketsPageInCookies(this.page)
    });

    this.ticketsListForm.controls['userMode'].valueChanges.subscribe(() => {
      if(this.ticketsListForm.controls['userMode'].value == true){
        this.ticketsListForm.controls['manager'].setValue('', { emitEvent: false })
        this.ticketsListForm.controls['username'].setValue(this.current_user.username, { emitEvent: false })
        this.ticketsListForm.controls['username'].disable({emitEvent: false})
        // $('#managerSelectTicketList option[value=' + this.current_user.username + ']' ).attr("disabled","disabled")
        this.getTicketsCount(this.ticketsListForm.getRawValue())
        this.getTickets(this.ticketsListForm.getRawValue())
        this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
        this.page = 1
        this.ticketService.saveTicketsPageInCookies(this.page)
      } else {
        this.ticketsListForm.controls['manager'].setValue(this.current_user.username, { emitEvent: false })
        this.ticketsListForm.controls['username'].setValue('', { emitEvent: false })
        this.ticketsListForm.controls['username'].enable({emitEvent: false})
        // $('#managerSelectTicketList option[value=' + this.current_user.username + ']' ).removeAttr('disabled')
        this.getTicketsCount(this.ticketsListForm.getRawValue())
        this.getTickets(this.ticketsListForm.getRawValue())
        this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
        this.page = 1
        this.ticketService.saveTicketsPageInCookies(this.page)
      }
    })

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
    $('#awaitBackendModalTicketList').modal('hide');
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
    this.onRequest('Cargando Mensajes')
    if(options_filter['validation'] == true){
      if(this.current_user.rol == 'admin' && options_filter['userMode'] == false){
        options_filter['validation'] = 0
      } else {
        options_filter['validation'] = -1
      }    
    } else {
      options_filter['validation'] = ''
    }

    if(options_filter['viewed'] == true){
      options_filter['viewed'] = 0
    } else {
      options_filter['viewed'] = ''
    }

    if(options_filter['state'] == 'C'){
      options_filter['validation'] = ''
      options_filter['viewed'] = ''
    }
    options_filter['page'] = this.page
    options_filter['itemsPerPage'] = this.itemsPerPage
    this.ticketService.getTickets(options_filter).subscribe({
      next: (response: any) => {
        if(options_filter['state'] == 'C'){
          this.closedTickets = true
        } else {
          this.closedTickets = false
        }
        this.tickets = response['tickets']
        this.requestFinished()
      },
      error: (err: any) => {
        this.toastrService.error('Error, no se pueden mostrar los tickets')
        this.requestFinished()
      }
    });
  }

  getTicketsCount(options_filter: any){
    if(options_filter['validation'] == true){
      if(this.current_user.rol == 'admin' && options_filter['userMode'] == false){
        options_filter['validation'] = 0
      } else {
        options_filter['validation'] = -1
      }    
    } else {
      options_filter['validation'] = ''
    }

    if(options_filter['viewed'] == true){
      options_filter['viewed'] = 0
    } else {
      options_filter['viewed'] = ''
    }

    if(options_filter['state'] == 'C'){
      options_filter['validation'] = ''
      options_filter['viewed'] = ''
    }
    this.ticketService.getTicketsCount(options_filter).subscribe({
      next: (response: any) => {
        this.itemsCount = response['count']
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

  changeTicketOptions(option: string){
    switch (option) {
      case "userTicketsPending":
        this.ticketsListForm.reset({manager:'', validation:true, username:this.current_user.username, state: 'A', category: '', userMode: false, viewed: false}, { emitEvent: false })
        break;
      case "userTicketsNoViewed":
        this.ticketsListForm.reset({manager:'', validation:false, username:this.current_user.username, state: 'A', category: '', userMode: false, viewed: true}, { emitEvent: false })
        break;
      case "adminTicketsPending":
        this.ticketsListForm.reset({manager:this.current_user.username, validation:true, username:'', state: 'A', category: '', userMode: false, viewed: false}, { emitEvent: false })
        this.ticketsListForm.controls['username'].enable({emitEvent: false})
        break;
      case "adminTicketsNoViewed":
        this.ticketsListForm.reset({manager:this.current_user.username, validation:false, username:'', state: 'A', category: '', userMode: false, viewed: true}, { emitEvent: false })
        this.ticketsListForm.controls['username'].enable({emitEvent: false})
        break;
      case "adminTicketsPendingAsUser":
        this.ticketsListForm.reset({manager:'', validation:true, username:this.current_user.username, state: 'A', category: '', userMode: true, viewed: false}, { emitEvent: false })
        this.ticketsListForm.controls['username'].disable({emitEvent: false})
        break;
      case "adminTicketsNoViewedAsUser":
        this.ticketsListForm.reset({manager:'', validation:false, username:this.current_user.username, state: 'A', category: '', userMode: true, viewed: true}, { emitEvent: false })
        this.ticketsListForm.controls['username'].disable({emitEvent: false})
        break;
      default:
        if(this.current_user.rol == 'admin'){
          this.ticketsListForm.reset({manager:this.current_user.username, validation:false, username:'', state: 'A', category: '', userMode: false, viewed: false}, { emitEvent: false })
          this.ticketsListForm.controls['username'].enable({emitEvent: false})
          this.ticketService.savePendingTicketsCount()
        } else {
          this.ticketsListForm.reset({manager:'', validation:false, username:this.current_user.username, state: 'A', category: '', userMode: false, viewed: false}, { emitEvent: false })
          this.ticketsListForm.controls['username'].disable({emitEvent: false})
          this.ticketService.savePendingTicketsCount()
        }
        break;
    }
    this.getTicketsCount(this.ticketsListForm.getRawValue())
    this.getTickets(this.ticketsListForm.getRawValue())
    this.ticketService.saveTicketsFilterOptionsInCookies(this.ticketsListForm.getRawValue())
    this.page = 1
    this.ticketService.saveTicketsPageInCookies(this.page)
  }

  paginationChange(event: any){
    this.page = event
    this.ticketService.saveTicketsPageInCookies(this.page)
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

  onRequest(modal_msg: string = ''): void {
    $('#awaitBackendModalTicketList').modal({backdrop: 'static', keyboard: false})  
    $('#awaitBackendModalTicketList').modal('show')  
    this.modalMsg = modal_msg
  }
  
  requestFinished(): void {
    setTimeout( () => {
      $('#awaitBackendModalTicketList').modal('hide');
      this.modalMsg = ''
    },100)
  }

  swapUserModeCheckOption(){
    if(this.ticketsListForm.controls['userMode'].getRawValue()){
      this.ticketsListForm.controls['userMode'].patchValue(false)
    } else {
      this.ticketsListForm.controls['userMode'].patchValue(true)
    }
  }

  swapValidationCheckOption(){
    if(this.ticketsListForm.controls['validation'].getRawValue()){
      this.ticketsListForm.controls['validation'].patchValue(false)
    } else{
      this.ticketsListForm.controls['validation'].patchValue(true)
    }
  }

  swapNoViewedCheckOption(){
    if(this.ticketsListForm.controls['viewed'].getRawValue()){
      this.ticketsListForm.controls['viewed'].patchValue(false)
    } else {
      this.ticketsListForm.controls['viewed'].patchValue(true)
    }
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

  toggleLegend(){
    if(this.showLegend == true){
        $('#legend').slideUp("slow", () =>{
          this.showLegend = false
        })
        
    }else {        
        $('#legend').slideDown('slow', () =>{
          this.showLegend = true
        })
    }
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }

}
