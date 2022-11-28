import { Component, OnInit } from '@angular/core';
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
export class TicketsCreateComponent implements OnInit {
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private ticketService: TicketService, private toastrService: ToastrService, private fileService: FileService) { }

  current_user: User = this.authService.getUserInfo()

  managers: Array<User> | null = [];
  users: Array<User> = [];
  ticket_categories: Array<any> = [];

  uploadingFile: boolean = false;
  fileUpload: boolean = false;

  createTicketForm: FormGroup = new FormGroup({
    manager: new FormControl('',[
      Validators.required
    ]),
    priority: new FormControl('1',[
      Validators.required
    ]),
    username: new FormControl({value: this.current_user.username , disabled: true},[
      Validators.required
    ]),
    file: new FormControl('',[
    ]),
    category: new FormControl('GRAL',[
      Validators.required
    ]),
    title: new FormControl('',[
      Validators.required,
      Validators.maxLength(60)
    ]),
    description: new FormControl('',[
      Validators.maxLength(765)
    ]),
  });

  ngOnInit(): void {
    this.getManagers()
    this.getTicketCategories()
    
    if(this.current_user.rol == 'admin'){
      this.createTicketForm.controls['username'].enable()
      this.ticketService.getUsers().subscribe({
        next: (response: any) => {
          this.users = response
        },
        error: (err: any) => {
          switch(err.status){
            case 401: { 
              break;
            }
            default: {
            }
          }
        },
        complete: () => {}
      });
    }
  }

  clearTicket(): void{
    this.createTicketForm.reset({manager: '', priority: '1', username: this.current_user.username, file: '', 'category': 'GRAL', title: '', description: ''})
  }

  createTicket(): void {
    let ticket: any = this.createTicketForm.value
    ticket['username'] = this.createTicketForm.get('username')?.value
    this.ticketService.createTicket(ticket).subscribe({
      next: (response: any) => {
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Ticket Enviado')
        this.clearTicket()
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            break;
          }
          default: {
          }
        }
      },
      complete: () => {}
    });

    
  }

  showConfirmModal(msg: string, function_name: any, btn_discard: string = "No", btn_success: string = "Si"): void {
    if(this.createTicketForm.controls['manager'].value !== "" || this.createTicketForm.controls['file'].value !== "" ||
    this.createTicketForm.controls['title'].value !== "" || this.createTicketForm.controls['description'].value !== "" ||
    this.createTicketForm.controls['username'].value !== this.current_user.username){
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
              this.clearTicket()
              break;
            default:
              break;
          }
      })
    } else{
      switch(function_name){
        case "clear":
          this.clearTicket()
          break;
        default:
          break;
      }
    }
  }

  getManagers(): void {
    this.ticketService.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response
      },
      error: (err: any) => {
        switch(err.status){
          case 401: {
            break;
          }
          default: {}
        }
      },
      complete: () => {}
    });
  }

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
      if(this.createTicketForm.controls['file'].value !== ''){
        this.deleteFile(this.createTicketForm.controls['file'].value)
      }
      this.uploadingFile = true
      this.uploadFile(file[0])
    } else {
      if(this.createTicketForm.controls['file'].value !== ''){
        this.deleteFile(this.createTicketForm.controls['file'].value)
      }
      this.createTicketForm.controls['file'].setValue('')
    }
  }

  uploadFile(fileToUpload: File){
    this.fileService.upload(fileToUpload).subscribe({
      next: (response: any) => {
        this.uploadingFile = false
        this.createTicketForm.controls['file'].setValue(response['file_name'])
        this.fileUpload = true
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            break;
          }
          default: {
          }
        }
      },
      complete: () => {}
    });
  }

  deleteFile(fileName: string){
    this.fileService.delete(fileName).subscribe({
      next: (response: any) => {
        this.fileUpload = false
      },
      error: (err: any) => {
        switch(err.status){
          case 401: { 
            break;
          }
          default: {
          }
        }
      },
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
}


