import { Component, OnInit, AfterContentInit, AfterViewInit } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TicketH } from 'src/app/models/ticket-h.model';
import { TicketL } from 'src/app/models/ticket-l.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-tickets-ticket',
  templateUrl: './ticket-ticket.component.html',
  styleUrls: ['./ticket-ticket.component.css']
})
export class TicketsTicketComponent implements OnInit {
  user: User = new User()

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



  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, private fileService: FileService) { }

  ngOnInit(): void {
    this.user = this.authService.getUserInfo();
    this.t_code = this.ticketService.t_code

    this.getManagers()

    this.getTicketInfo()

    this.getTicketMessages()
  }

  sendNewMessage(){
    if(this.user.rol == 'admin'){
      if(this.sendTicketMsgForm.get('validation')?.value){
      } else {
        this.sendTicketMsgForm.controls['validation'].setValue(0)
      } 
    } else{
      this.sendTicketMsgForm.controls['validation'].setValue(0)
    }

    let msgObject = this.sendTicketMsgForm.value
    msgObject['t_code'] = this.t_code

    if(this.user_question == this.user.username){
      msgObject['type'] = 'P'
    } else {
      msgObject['type'] = 'R'
    }

    this.createTicketMessage(msgObject)

  }

  getTicketInfo(): void {
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
    this.ticketService.getTicketMessages(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket_messages = response
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
    this.ticketService.createTicketMessage(msg).subscribe({
      next: (response: any) => {
        this.sendTicketMsgForm.reset({time: "00:00", validation: false, file: '', msg: ''})
        this.getTicketMessages()
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

  closeTicket(): void {
    this.ticketService.closeTicket(this.t_code).subscribe({
      next: (response: any) => {
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
        console.log(response)
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

