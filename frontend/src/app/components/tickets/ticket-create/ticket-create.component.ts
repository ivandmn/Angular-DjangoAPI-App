import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-tickets-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.css']
})
export class TicketsCreateComponent implements OnInit, OnDestroy {

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo()

  //Variable to save current managers
  managers: Array<User> = [];
  //Variable to save current users
  users: Array<User> = [];
  //Variable to save current ticket categories
  ticket_categories: Array<any> = [];

  //Variable to save message of confirm modal
  modalMsg: string = '';

  showMenu = true;

  ticketForm: FormGroup = new FormGroup({
    manager: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    priority: new FormControl('1', [Validators.required, Validators.pattern("^([0-9])*$")]),
    username: new FormControl({value: this.current_user.username , disabled: true}, [Validators.required, Validators.maxLength(15)]),
    file: new FormControl(''),
    fileSource: new FormControl(''), 
    category: new FormControl('GRAL', [Validators.required, Validators.maxLength(15)]),
    title: new FormControl('', [Validators.required,Validators.maxLength(60)]),
    description: new FormControl('', [Validators.maxLength(765)]),
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private ticketService: TicketService, private toastrService: ToastrService, private fileService: FileService) { }

  ngOnInit(): void {
    this.configurateToastr()
    this.getManagers()
    this.getTicketCategories()
    
    if(this.current_user.rol == 'admin'){
      this.ticketForm.controls['username'].enable()
      this.getUsers()
    }

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
    $('#awaitBackendModal').modal('hide');
    this.modalMsg = ''
  }

  getManagers(): void {
    this.ticketService.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response
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

  getUsers(): void {
    this.ticketService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response
      }
    });
  }

  resetTicketForm(): void{
    this.ticketForm.reset({manager: '', priority: '1', username: this.current_user.username, file: '', fileSource: '', category: 'GRAL', title: '', description: ''})
  }

  sendTicket(): void {
    //Save ticket object in variable
    let ticket: any = this.ticketForm.getRawValue()
    //Disable form and add request modal
    this.ticketForm.disable()
    this.onRequest('Creando Ticket')

    //Upload file if ticket msg have file and after upload send ticket
    if(ticket['fileSource']){
      this.fileService.uploadFile(ticket['fileSource']).subscribe({
        next: (response: any) => {
          //Change filename message to backend filename
          ticket['file'] = response['file_name'];
          //Delete file from message object
          delete ticket['fileSource'];
          //Create ticket
          this.ticketService.createTicket(ticket).subscribe({
            next: () => {
              this.requestFinished()
              this.ticketForm.enable()
              this.toastrService.success('Ticket Enviado')
              this.resetTicketForm()
              this.ticketService.savePendingTicketsCount()
              this.ticketService.updateTicketsPosition()
            }, 
            error: () => {
              this.requestFinished()
              this.ticketForm.enable()
              this.toastrService.error('Ha sucedido un error, no se ha podido crear el ticket')
              this.resetTicketForm()
            }
          });
        },
        error: () => {
          this.requestFinished()
          this.ticketForm.enable()
          this.toastrService.error('Ha sucedido un error al subir el archivo, no se ha podido crear el ticket')
          this.resetTicketForm()
        }
      });
    //If ticket msg don't have a file create ticket
    } else {
      delete ticket['fileSource'];
      //Create ticket
      this.ticketService.createTicket(ticket).subscribe({
        next: () => {
          this.requestFinished()
          this.ticketForm.enable()
          this.toastrService.success('Ticket Enviado')
          this.resetTicketForm()
          this.ticketService.savePendingTicketsCount()
          this.ticketService.updateTicketsPosition()
        }, 
        error: () => {
          this.requestFinished()
          this.ticketForm.enable()
          this.toastrService.error('Ha sucedido un error, no se ha podido crear el ticket')
          this.resetTicketForm()
        }
      });
    }
  
  }

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
      this.ticketForm.patchValue({
        fileSource: file[0]
      })
    } else {
      this.ticketForm.patchValue({
        fileSource: ''
      })
    }
  }
  
  showConfirmModal(msg: string, function_name: any, btn_discard: string = "No", btn_success: string = "Si"): void {
    if(this.ticketForm.controls['manager'].value !== "" || this.ticketForm.controls['file'].value !== "" ||
    this.ticketForm.controls['title'].value !== "" || this.ticketForm.controls['description'].value !== "" ||
    this.ticketForm.controls['username'].value !== this.current_user.username){
      $('#confirmModal').modal("show");
      
      document.getElementById("confirmModalContent")!.innerHTML = `
        <div class="modal-content">
        <div class="modal-body text-center">
            ${msg}
        </div>
        <div class="modal-footer d-inline text-center">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${btn_discard}</button>
            <button type="button" class="btn btn-secondary" id="modal-success-btn" data-bs-dismiss="modal">${btn_success}</button>
        </div>
        </div>`

      document.getElementById("modal-success-btn")!.addEventListener('click', () =>{
          switch(function_name){
            case "clear":
              this.resetTicketForm()
              break;
            default:
              break;
          }
      })
    } else{
      switch(function_name){
        case "clear":
          this.resetTicketForm()
          break;
        default:
          break;
      }
    }
  }

  onRequest(modal_msg: string = ''): void {
    $('#awaitBackendModal').modal({backdrop: 'static', keyboard: false})  
    $('#awaitBackendModal').modal('show')  
    this.modalMsg = modal_msg
  }
  
  requestFinished(): void {
    setTimeout( () => {
      $('#awaitBackendModal').modal('hide');
      this.modalMsg = ''
    },100)
  }
  
  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
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


