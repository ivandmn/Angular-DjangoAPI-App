import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
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
import { Time } from "@angular/common";
import * as moment from 'moment';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-tickets-ticket',
  templateUrl: './ticket-ticket.component.html',
  styleUrls: ['./ticket-ticket.component.css']
})
export class TicketsTicketComponent implements OnInit, AfterViewChecked, OnDestroy  {

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save current ticket code
  t_code: number | null = null;
  //Variable to save current ticket
  ticket: TicketH = new TicketH()
  //Variable to save current ticket messages
  ticket_messages: Array<TicketL> = [];
  //Variable to save current ticket categories
  ticket_categories: Array<any> = [];
  //Variable to save current ticket managers
  managers: Array<User> = [];
  //Variable to save current users
  users: Array<User> = [];

  //Variable to save ticket user username
  user_question: string | null = null;
  //Variable to save ticket manager username
  user_response: string | null = null;

  modalMsg: string| null = "";
  
  msgForm: FormGroup = new FormGroup({
    description: new FormControl('',[Validators.maxLength(765)]),
    validation: new FormControl(false),
    time: new FormControl("00:00"),
    file: new FormControl(''),
    fileSource: new FormControl('')
  });

  managerSelect: FormGroup = new FormGroup({
    manager: new FormControl('')
  });

  userSelect: FormGroup = new FormGroup({
    user: new FormControl('')
  });

  categorySelect: FormGroup = new FormGroup({
    category: new FormControl('')
  });

  prioritySelect: FormGroup = new FormGroup({
    priority: new FormControl('')
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, private fileService: FileService, private cdRef : ChangeDetectorRef, private toastrService: ToastrService, private userService: UsersService) { }

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    $('#awaitBackendModalTicket').modal('hide');
    this.modalMsg = ''
  }

  ngOnInit(): void {
    this.ticketService.savePendingTicketsCount()
    this.ticketService.updateTicketsPosition()
    //Configurate toastr Service
    this.configurateToastr()
    if(this.current_user.rol == 'user'){
      this.managerSelect.disable({emitEvent: false})
      this.userSelect.disable({emitEvent: false})
      this.categorySelect.disable({emitEvent: false})
      this.prioritySelect.disable({emitEvent: false})
    }
    //Get ticket code from cookie if cookie exist
    this.t_code = this.ticketService.getTicketCodeFromCookies()
    //Get ticket info
    this.getTicketInfo()
    //Get current managers
    this.getManagers()
    //Get current users
    this.getUsers()
    //Get current ticket categories
    this.getTicketCategories()
    //Get tickets messages
    this.getTicketMessages()

    if(this.current_user.rol == 'admin'){
      this.msgForm.controls['validation'].valueChanges.subscribe(() => {
        let validation = this.msgForm.controls['validation'].getRawValue()
        //If current_user is admin enter if
        if(this.current_user.rol == 'admin'){
          //If validation check box is selected set validation to -1
          if(validation){
            validation = -1
          } 
          //If validation checkbox was not selected set validation to 0
          else {
            validation = 0
          } 
          //If current_user is not admin set always validation to 0
        } else{
          validation = 0
        }
        this.ticketService.changeTicketValidation(this.t_code ,validation).subscribe({
          next: () => {
            this.toastrService.success('Se cambiado la validación del ticket')
            this.ticket.validation = validation
            this.ticketService.savePendingTicketsCount()
            this.ticketService.updateTicketsPosition()
          },
          error: (error: any) => {
            switch (error.status) {
              case 403:
                this.toastrService.error("No tienes permisos para realizar esta acción")
                break;
              case 401:
                this.router.navigateByUrl('home')
                this.toastrService.error("Acceso denegado, sesión no iniciada")
                break;
              default:
                this.toastrService.error("Error al cambiar la validación del ticket")
                break;
            }
          }
        });
      });   
    }
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

  getTicketInfo(): void {
    this.ticketService.getTicket(this.t_code).subscribe({
      next: (response: any) => {
        this.ticket = response
        this.prioritySelect.controls['priority'].setValue(response['priority'])
        this.categorySelect.controls['category'].setValue(response['category'])
        this.managerSelect.controls['manager'].setValue(response['manager'])
        this.userSelect.controls['user'].setValue(response['user'])
        this.checkUserTicketPrivileges()
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

  getTicketCategories(): void {
    this.ticketService.getCategories().subscribe({
      next: (response: any) => {
        this.ticket_categories = response
      }
    });
  }

  closeTicket(): void {
    this.ticketService.closeTicket(this.t_code).subscribe({
      next: () => {
        this.toastrService.success('Se ha cerrado el ticket')
        this.ticket.state = 'C'
        this.ticketService.savePendingTicketsCount()
        this.ticketService.updateTicketsPosition()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al cerrar el ticket")
            break;
        }
      }
    });
  }

  openTicket(): void {
    this.ticketService.openTicket(this.t_code).subscribe({
      next: () => {
        this.toastrService.success('Se ha reabierto el ticket')
        this.ticket.state = 'A'
        this.ticketService.savePendingTicketsCount()
        this.ticketService.updateTicketsPosition()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al reabrir el ticket")
            break;
        }
      }
    });
  }

  changeTicketManager(){
    this.ticketService.changeTicketManager(this.t_code, this.managerSelect.controls['manager'].value).subscribe({
      next: () => {
        this.ticket.manager = this.managerSelect.controls['manager'].value
        this.toastrService.success('Gestor cambiado')
        this.checkUserTicketPrivileges()
        this.ticketService.savePendingTicketsCount()
        this.ticketService.updateTicketsPosition()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al cambiar el gestor del ticket")
            break;
        }
      }
    });
  }

  changeTicketUser(){
    this.ticketService.changeTicketUser(this.t_code, this.userSelect.controls['user'].value).subscribe({
      next: () => {
        this.ticket.user = this.userSelect.controls['user'].value
        this.toastrService.success('Usuario cambiado')
        this.checkUserTicketPrivileges()
        this.ticketService.savePendingTicketsCount()
        this.ticketService.updateTicketsPosition()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al cambiar el usuario del ticket")
            break;
        }
      }
    });
  }

  changeTicketPriority(){
    this.ticketService.changeTicketPriority(this.t_code, this.prioritySelect.controls['priority'].value).subscribe({
      next: () => {
        this.ticket.priority = this.prioritySelect.controls['priority'].value
        this.toastrService.success('Prioridad cambiada')
        this.checkUserTicketPrivileges()
        this.ticketService.savePendingTicketsCount()
        this.ticketService.updateTicketsPosition()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al cambiar la prioridad del ticket")
            break;
        }
      }
    });
  }

  changeTicketCategory(){
    this.ticketService.changeTicketCategory(this.t_code, this.categorySelect.controls['category'].value).subscribe({
      next: () => {
        this.ticket.category = this.categorySelect.controls['category'].value
        this.toastrService.success('Categoria cambiada')
        this.checkUserTicketPrivileges()
      },
      error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Error al cambiar la categoria del ticket")
            break;
        }
      }
    });
  }

  checkUserTicketPrivileges(): void {
    if(this.current_user.rol == 'admin'){
      if(this.ticket.validation == -1){
        this.msgForm.controls['validation'].setValue(true, { emitEvent: false })
      }
      //If current_user is not the user or manager of ticket disable select and forms
      if(this.ticket.user != this.current_user.username && this.ticket.manager != this.current_user.username){
        this.msgForm.disable({ emitEvent: false })
        this.userSelect.disable({emitEvent: false})
        this.categorySelect.disable({ emitEvent: false })
        this.prioritySelect.disable({ emitEvent: false })
        this.toastrService.warning('No puedes escribir mensajes en este ticket')
        return
      }
      //If current_user is user of ticket disable selects and change rol to user
      if(this.ticket.user == this.current_user.username && this.ticket.manager != this.current_user.username){
        this.categorySelect.disable({ emitEvent: false })
        this.userSelect.disable({emitEvent: false})
        this.prioritySelect.disable({ emitEvent: false })
        this.current_user.rol = 'user'
        return
      }
      //If auto ticket enable forms
      if(this.ticket.user == this.current_user.username && this.ticket.manager == this.current_user.username){
        this.msgForm.enable({ emitEvent: false })
        this.userSelect.enable({emitEvent: false})
        this.categorySelect.enable({ emitEvent: false })
        this.prioritySelect.enable({ emitEvent: false })
        this.current_user.rol = 'admin'
        return
      }
      this.msgForm.enable({ emitEvent: false })
      this.categorySelect.enable({ emitEvent: false })
      this.userSelect.enable({emitEvent: false})
      this.prioritySelect.enable({ emitEvent: false })
    }
    if(this.current_user.rol == 'user'){
      if(this.ticket.user != this.current_user.username){
        this.msgForm.disable({ emitEvent: false })
        this.toastrService.warning('No puedes modificar este ticket')
        return
      }
      if(this.ticket.manager == this.current_user.username){
        this.msgForm.enable({ emitEvent: false })
        this.userSelect.enable({emitEvent: false})
        this.categorySelect.enable({ emitEvent: false })
        this.prioritySelect.enable({ emitEvent: false })
        this.current_user.rol = 'admin'
        return
      }
    }   
  }

  onChangeFile(event: Event){
    let file: FileList | null = (event.target as HTMLInputElement).files;
    if(file && file.length > 0){
      this.msgForm.patchValue({
        fileSource: file[0]
      })
    } else {
      this.msgForm.patchValue({
        fileSource: ''
      })
    }
  }

  downloadFile(filepath: string){
    this.fileService.downloadFile(filepath).subscribe({
      next: (response: any) => {
        let blob: Blob = response.body as Blob;
        let link = document.createElement('a');
        let objectURL = window.URL.createObjectURL(blob);
        link.href = objectURL;
        link.download = filepath;
        link.click()
      }
    });
  }

  resetMsgForm(): void {
    let validation;
    if(this.ticket.validation == 0){
      validation = false
    } else {
      validation = true
    }
    this.msgForm.reset({description: '', validation: this.ticket.validation, time: "00:00", file: '', fileSource: ''}, { emitEvent: false })
  }

  sendMsg(): void {
    //Save msg object in variable
    let msg: any = this.msgForm.getRawValue()
    
    //Disable form and add request modal
    this.msgForm.disable({ emitEvent: false })
    this.onRequest('Enviando mensaje')
    //If current_user is admin enter if
    if(this.current_user.rol == 'admin'){
      //If validation check box is selected set validation to -1
      if(msg['validation']){
        msg['validation'] = -1
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
    if(this.ticket.user == this.current_user.username){
      msg['type'] = 'P'
    } else {
      msg['type'] = 'R'
    }

    //Upload file if msg have file and after upload send message
    if(msg['fileSource']){
      this.fileService.uploadFileExistingTicket(msg['fileSource'], msg['t_code']).subscribe({
        next: (response: any) => {
          //Change filename message to backend filename
          msg['file'] = response['file_name'];
          //Delete file from message object
          delete msg['fileSource'];
          //Create ticket message
          this.ticketService.createTicketMessage(msg).subscribe({
            next: () => {
              if(msg['time'] != '00:00'){
                this.addTimetoTicket(msg['time'])
              }
              this.requestFinished()
              this.msgForm.enable({ emitEvent: false })
              this.toastrService.success('Mensaje de ticket enviado')
              this.resetMsgForm();
              this.getTicketMessages()
              this.ticketService.savePendingTicketsCount()
              this.ticketService.updateTicketsPosition()
            },
            error: () => {
              this.requestFinished()
              this.msgForm.enable({ emitEvent: false })
              this.toastrService.error('Ha sucedido un error, no se ha podido enviar el mensaje')
              this.resetMsgForm();
            }
          });
        },
        error: () => {
          this.requestFinished()
          this.msgForm.enable({ emitEvent: false })
          this.toastrService.error('Ha sucedido un error al subir el archivo, no se ha podido enviar el mensaje')
          this.resetMsgForm();
        }
      });
    //If msg don't have a file send message
    } else {
      delete msg['fileSource'];
      this.ticketService.createTicketMessage(msg).subscribe({
        next: () => {
          if(msg['time'] != '00:00'){
            this.addTimetoTicket(msg['time'])
          }
          this.requestFinished()
          this.msgForm.enable({ emitEvent: false })
          this.toastrService.success('Mensaje de ticket enviado')
          this.ticket.validation = msg['validation']
          this.resetMsgForm();
          this.getTicketMessages()
          this.ticketService.savePendingTicketsCount()
          this.ticketService.updateTicketsPosition()
        },
        error: () => {
          this.requestFinished()
          this.msgForm.enable({ emitEvent: false })
          this.toastrService.error('Ha sucedido un error, no se ha podido enviar el mensaje')
          this.resetMsgForm();
        }
      });
    }
  }

  addTimetoTicket(time: string): void {
    let time_added_array = time.split(':', 2)
    let old_time = String(this.ticket.time).split(':', 2)
    let new_time = moment().hour(Number(time_added_array[0]) + Number(old_time[0])).minutes(Number(time_added_array[1]) + Number(old_time[1])).seconds(0).format("HH:mm:ss")
    this.ticket.time = new_time
  }

  enterUserProfle(username: string | null): void{
    this.userService.saveUsernameProfileInCookies(username)
    this.router.navigateByUrl('users/search/profile')
  }

  onRequest(modal_msg: string = ''): void {
    $('#awaitBackendModalTicket').modal({backdrop: 'static', keyboard: false})  
    $('#awaitBackendModalTicket').modal('show')  
    this.modalMsg = modal_msg
  }
  
  requestFinished(): void {
    setTimeout( () => {
      $('#awaitBackendModalTicket').modal('hide');
      this.modalMsg = ''
    },100)
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }
}

