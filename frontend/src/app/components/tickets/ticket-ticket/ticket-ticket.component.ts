import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TicketH } from 'src/app/models/ticket-h.model';
import { TicketL } from 'src/app/models/ticket-l.model';
import { User } from 'src/app/models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tickets-ticket',
  templateUrl: './ticket-ticket.component.html',
  styleUrls: ['./ticket-ticket.component.css']
})
export class TicketsTicketComponent implements OnInit, AfterViewChecked  {

  current_user: User = new User()

  t_code: number | null = null;

  ticket: TicketH = new TicketH()

  ticket_messages: Array<TicketL> = [];

  user_question: string | null = null;
  user_response: string | null = null

  managers: Array<User> | null = [];

  uploadingFile: boolean = false;
  fileUpload: boolean = false;
  
  sendTicketMsgForm: FormGroup = new FormGroup({
    msg: new FormControl('',[
      Validators.maxLength(765),
      Validators.required
    ]),
    validation: new FormControl(false,[
    ]),
    time: new FormControl("00:00",[
    ]),
    file: new FormControl('' ,[
      Validators.required
    ]),
  });

  managerSelect: FormGroup = new FormGroup({
    manager: new FormControl('',[
      Validators.required
    ]),
  });



  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, private fileService: FileService, private cdRef : ChangeDetectorRef, private toastrService: ToastrService) { }

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }
  

  ngOnInit(): void {
    
    //Get current user info
    this.current_user = this.authService.getUserInfo();

    //Get ticket code from cookie if cookie exist
    this.t_code = this.ticketService.getTicketCodeFromCookies()

    //Get ticket info
    this.getTicketInfo()

    //Get current managers
    this.getManagers()

    //Get ticket header info
    
    //Get tickets messages
    this.getTicketMessages()
  }

  sendNewMessage(){
    //If current_user is admin and validation check box is selected set validation to -1
    if(this.current_user.rol == 'admin'){
      if(this.sendTicketMsgForm.get('validation')?.value){
        this.sendTicketMsgForm.controls['validation'].setValue(-1)
      //If validation checkbox was not selected set validation to 0
      } else {
        this.sendTicketMsgForm.controls['validation'].setValue(0)
      } 
      //If current_user is not admin set always validation to 0
    } else{
      this.sendTicketMsgForm.controls['validation'].setValue(0)
    }

    //Set ticket code
    let msgObject = this.sendTicketMsgForm.value
    msgObject['t_code'] = this.t_code

    //Set type of message
    if(this.user_question == this.current_user.username){
      msgObject['type'] = 'P'
    } else {
      msgObject['type'] = 'R'
    }

    //Send new message
    this.createTicketMessage(msgObject)

  }

  getTicketInfo(): void {
    //Get ticket info
    this.ticketService.getTicket(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket = response
        this.user_question = this.ticket.user
        this.user_response = this.ticket.manager
        this.managerSelect.controls['manager'].setValue(this.user_response) 
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
      complete: () => {
      }
    });
  }

  getTicketMessages(): void {
    //Get all ticket messages
    this.ticketService.getTicketMessages(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket_messages = response
        this.cdRef.detectChanges();
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

  createTicketMessage(msg: object): void {
    //Create ticket message
    this.ticketService.createTicketMessage(msg).subscribe({
      next: (response: any) => {
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Mensaje de ticket enviado')
        this.sendTicketMsgForm.reset({time: "00:00", validation: false, file: '', msg: ''})
        this.getTicketMessages()
      },
      error: (err: any) => {
        switch(err.status){
          default: {
            this.toastrService.toastrConfig.timeOut = 2000
            this.toastrService.toastrConfig.positionClass = 'toast-top-center'
            this.toastrService.error('No se ha podido enviar el mensaje')
          }
        }
      },
      complete: () => {}
    });
  }

  closeTicket(): void {
    this.ticketService.closeTicket(this.t_code).subscribe({
      next: (response: any) => {
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Se ha cerrado el ticket')
        this.ticket.state = 'C'
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

  openTicket(): void {
    this.ticketService.openTicket(this.t_code).subscribe({
      next: (response: any) => {
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Se ha reabierto el ticket')
        this.ticket.state = 'A'
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

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
      if(this.sendTicketMsgForm.controls['file'].value !== ''){
        this.deleteFile(this.sendTicketMsgForm.controls['file'].value)
      }
      this.uploadingFile = true
      this.uploadFile(file[0])
    } else {
      if(this.sendTicketMsgForm.controls['file'].value !== ''){
        this.deleteFile(this.sendTicketMsgForm.controls['file'].value)
      }
      this.sendTicketMsgForm.controls['file'].setValue('')
    }
  }

  uploadFile(fileToUpload: File){
    this.fileService.upload(fileToUpload).subscribe({
      next: (response: any) => {
        this.uploadingFile = false
        this.sendTicketMsgForm.controls['file'].setValue(response['file_name'])
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

  getFile(filepath: string){
    this.fileService.download(filepath).subscribe({
      next: (response: any) => {
        console.log(filepath)
        let blob: Blob = response.body as Blob;
        let a = document.createElement('a');
        a.download = filepath
        a.href = window.URL.createObjectURL(blob);
        a.click()
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

  changeTicketManager(){
    this.ticketService.changeTicketManager(this.t_code, this.managerSelect.controls['manager'].value).subscribe({
      next: (response: any) => {
        this.toastrService.toastrConfig.timeOut = 2000
        this.toastrService.toastrConfig.positionClass = 'toast-top-center'
        this.toastrService.success('Gestor cambiado')
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
}

