import { Component, OnInit, OnDestroy} from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FormGroup, Validators, FormControl} from '@angular/forms';
import { FileService } from 'src/app/services/file.service';


@Component({
  selector: 'app-tickets-manual',
  templateUrl: './tickets-manual.component.html',
  styleUrls: ['./tickets-manual.component.css']
})
export class TicketsManualComponent implements OnInit, OnDestroy {

  showMenu = true;
  //User Logged
  current_user: User = this.authService.getUserInfo();
  manuals: Array<any> = [];
  manuals_categories: Array<any> = [];

  page: number = 1;
  itemsPerPage: number = 15;
  itemsCount: number = 0;

  modalMsg: string = '';

  //Ticket List options Form Group
  manualsForm: FormGroup = new FormGroup({
    m_category: new FormControl("",[Validators.required, Validators.maxLength(255)]),
  });

  constructor(private authService: AuthService, private ticketService: TicketService, private router: Router, private fileService: FileService) { }

  ngOnInit(): void {
      this.getManualsCategories()
      this.getManuals()

      this.manualsForm.controls['m_category'].valueChanges.subscribe(() => {
        this.getManuals()
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
    $('#awaitBackendModalTicketManual').modal('hide');
    this.modalMsg = ''
  }

  getManuals(){
    this.onRequest('Cargando Manuales')
    this.ticketService.getManuals(this.manualsForm.controls['m_category'].getRawValue()).subscribe({
      next: (response: any) => {
        this.manuals = response
        this.page = 1
        this.requestFinished()
      }
    });;
  }

  getManualsCategories(){
    this.ticketService.getManualsCategories().subscribe({
      next: (response: any) => {
        this.manuals_categories = response
      }
    });
  }

  downloadManual(manual_path:string){
    this.fileService.downloadManual(manual_path).subscribe({
      next: (response: any) => {
        let blob: Blob = response.body as Blob;
        let link = document.createElement('a');
        let objectURL = window.URL.createObjectURL(blob);
        link.href = objectURL;
        link.download = manual_path;
        link.click()
      }
    });
  }

  paginationChange(event: any){
    this.page = event
  }

  onRequest(modal_msg: string = ''): void {
    $('#awaitBackendModalTicketManual').modal({backdrop: 'static', keyboard: false})  
    $('#awaitBackendModalTicketManual').modal('show')  
    this.modalMsg = modal_msg
  }
  
  requestFinished(): void {
    setTimeout( () => {
      $('#awaitBackendModalTicketManual').modal('hide');
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
