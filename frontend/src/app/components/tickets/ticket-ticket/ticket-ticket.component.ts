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
  managers: Array<User> | null = [];
  user_question: string | null = null;
  user_response: string | null = null;
  
  sendTicketMsgForm: FormGroup = new FormGroup({
    description: new FormControl('',[Validators.maxLength(765)]),
    validation: new FormControl(false),
    time: new FormControl("00:00"),
    file: new FormControl(''),
    fileSource: new FormControl('')
  });

  managerSelect: FormGroup = new FormGroup({
    manager: new FormControl('')
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, private fileService: FileService, private cdRef : ChangeDetectorRef, private toastrService: ToastrService) { }

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }
  

  ngOnInit(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    //Get current user info
    this.current_user = this.authService.getUserInfo();
    //Get ticket code from cookie if cookie exist
    this.t_code = this.ticketService.getTicketCodeFromCookies()
    //Get ticket info
    this.getTicketInfo()
    //Get current managers
    this.getManagers()
    //Get tickets messages
    this.getTicketMessages()
  }

  onRequest(): void {
    $('.modal').modal('show');
  }
  
  requestFinished(): void {
    $('.modal').modal('hide');
  }

  getManagers(): void {
    this.ticketService.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response
      }
    });
  }

  getTicketInfo(): void {
    this.ticketService.getTicket(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket = response
        this.user_question = this.ticket.user
        this.user_response = this.ticket.manager
        this.managerSelect.controls['manager'].setValue(this.user_response) 
      }
    });
  }

  getTicketMessages(): void {
    this.ticketService.getTicketMessages(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket_messages = response
        this.cdRef.detectChanges();
      }
    });  
  }

  closeTicket(): void {
    this.ticketService.closeTicket(this.t_code).subscribe({
      next: () => {
        this.toastrService.success('Se ha cerrado el ticket')
        this.ticket.state = 'C'
      }
    });
  }

  openTicket(): void {
    this.ticketService.openTicket(this.t_code).subscribe({
      next: () => {
        this.toastrService.success('Se ha reabierto el ticket')
        this.ticket.state = 'A'
      }
    });
  }

  changeTicketManager(){
    this.ticketService.changeTicketManager(this.t_code, this.managerSelect.controls['manager'].value).subscribe({
      next: () => {
        this.toastrService.success('Gestor cambiado')
      }
    });
  }

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
      this.sendTicketMsgForm.patchValue({
        fileSource: file[0]
      })
    } else {
      this.sendTicketMsgForm.patchValue({
        fileSource: ''
      })
    }
  }

  downloadFile(filepath: string){
    this.fileService.download(filepath).subscribe({
      next: (response: any) => {
        let blob: Blob = response.body as Blob;
        let a = document.createElement('a');
        a.download = filepath
        a.href = window.URL.createObjectURL(blob);
        a.click()
      }
    });
  }

  resetSendTicketMsgForm(): void {
    this.sendTicketMsgForm.reset({description: '', validation: false, time: "00:00", file: '', fileSource: ''})
  }

  sendMsg(): void {
    //Save msg object in variable
    let msg: any = this.sendTicketMsgForm.getRawValue()
    //Disable form
    this.sendTicketMsgForm.disable()
    this.onRequest()
    console.log(msg)
    //If current_user is admin enter if
    if(this.current_user.rol == 'admin'){
      //If validation check box is selected set validation to -1
      if(msg['validation']){msg['validation'] = -1
      } 
      //If validation checkbox was not selected set validation to 0
      else {
        msg['validation'] = 0
      } 
      //If current_user is not admin set always validation to 0
    } else{
      msg['validation'] = 0
    }
    //Set ticket code
    msg['t_code'] = this.t_code
    //Set type of message
    if(this.user_question == this.current_user.username){
      msg['type'] = 'P'
    } else {
      msg['type'] = 'R'
    }

    //Upload file if msg have file and after upload send message
    if(msg['fileSource']){
      this.fileService.upload(msg['fileSource']).subscribe({
        next: (response: any) => {
          //Change filename message to backend filename
          msg['file'] = response['file_name'];
          //Delete file from message object
          delete msg['fileSource'];
          console.log(msg)
          //Create ticket message
          this.ticketService.createTicketMessage(msg).subscribe({
            next: () => {
              this.sendTicketMsgForm.enable()
              this.toastrService.success('Mensaje de ticket enviado')
              this.resetSendTicketMsgForm();
              this.getTicketMessages()
            },
            error: () => {
              this.sendTicketMsgForm.enable()
              this.toastrService.error('No se ha podido enviar el mensaje')
              this.resetSendTicketMsgForm();
            }
          });
        },
        error: () => {
          this.toastrService.error('Error al subir el archivo')
          this.resetSendTicketMsgForm();
        }
      });
    //If msg don't have a file send message
    } else {
      delete msg['fileSource'];
      console.log(msg)
      this.ticketService.createTicketMessage(msg).subscribe({
        next: () => {
          this.sendTicketMsgForm.enable()
          this.toastrService.success('Mensaje de ticket enviado')
          this.resetSendTicketMsgForm();
          this.getTicketMessages()
        },
        error: () => {
          this.sendTicketMsgForm.enable()
          this.toastrService.error('No se ha podido enviar el mensaje')
          this.resetSendTicketMsgForm();
        }
      });
    }
  }
}

