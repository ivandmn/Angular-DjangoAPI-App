import { Component, OnInit, OnDestroy } from '@angular/core';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { PowerbiH } from 'src/app/models/powerbi-h.model';
import { PowerbiL } from 'src/app/models/powerbi-l.model';
import { User } from 'src/app/models/user.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Location} from '@angular/common'

@Component({
  selector: 'app-pwbi-publication',
  templateUrl: './pwbi-publication.component.html',
  styleUrls: ['./pwbi-publication.component.css']
})
export class PwbiPublicationComponent implements OnInit, OnDestroy {

  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save current pwbi category code
  pwbiCategoryCode: number | null = null
  //Variable to save current pwbi publication code
  pwbiPublicationCode: number | null = null
  //Variable to save current pwbi category
  pwbiCategory: PowerbiH = new PowerbiH();
  //Variable to save current pwbi publication
  pwbiPublication: PowerbiL = new PowerbiL()

  //Variable to save what publications seen the curren't user to save statistics
  ids_statistics: Array<Number> = []

  statistics_count: number = 0

  //Variable to save Modal confirm message
  modalMsg: string = ''
  
  newnessForm: FormGroup = new FormGroup({
    isNewness: new FormControl(false)
  });

  constructor(private pwbiService: PowerbiService, private authService: AuthService, private router: Router, private toastrService: ToastrService, private _location: Location) { }

  ngOnInit(): void {
    this.configurateToastr();
    this.pwbiCategoryCode = this.pwbiService.getPowerBiCategoryIdFromCookies();
    this.pwbiPublicationCode = this.pwbiService.getPowerBiPublicationIdFromCookies();
    
    this.pwbiService.getPowerBiCategory(this.pwbiCategoryCode).subscribe({
      next: (response: any) => {
        this.pwbiCategory = response
      }
    });

    this.pwbiService.getPowerBiPublication(this.pwbiPublicationCode).subscribe({
      next: (response: any) => {
        this.pwbiPublication = response
        if(this.pwbiPublication.newness == 1){
          this.newnessForm.controls['isNewness'].setValue(true, { emitEvent: false})
        }
      }
    });

    if(this.current_user.rol == 'admin'){
      this.newnessForm.controls['isNewness'].valueChanges.subscribe(() => {
        if(this.newnessForm.controls['isNewness'].value == true){
          this.pwbiService.changePowerBiPublicationNewnessState(this.pwbiPublicationCode, 1).subscribe({
            next: (response: any) => {
              this.toastrService.success('Ahora la publicación es novedad')
            }, error: (error: any) => {
              switch (error.status) {
                case 403:
                  this.toastrService.error("No tienes permisos para realizar esta acción")
                  break;
                case 401:
                  this.router.navigateByUrl('home')
                  this.toastrService.error("Acceso denegado, sesión no iniciada")
                  break;
                default:
                  this.toastrService.error("Server Error")
                  break;
              }
          }});
        } else{
          this.pwbiService.changePowerBiPublicationNewnessState(this.pwbiPublicationCode, 0).subscribe({
            next: (response: any) => {
              this.toastrService.success('Ahora la publicación ya no es novedad')
            }, error: (error: any) => {
              switch (error.status) {
                case 403:
                  this.toastrService.error("No tienes permisos para realizar esta acción")
                  break;
                case 401:
                  this.router.navigateByUrl('home')
                  this.toastrService.error("Acceso denegado, sesión no iniciada")
                  break;
                default:
                  this.toastrService.error("Server Error")
                  break;
              }
          }});
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.pwbiService.endUserStatisticInfo(this.ids_statistics).subscribe({
      next: (response: any) => {}
    });
  }

  deletePublication(publication_id: number | null): void {
    this.pwbiService.deletePowerBiPublication(publication_id).subscribe({
      next: (response: any) => {
        this.toastrService.success('Publicación eliminada')
        this._location.back()
      }, error: (error: any) => {
        switch (error.status) {
          case 403:
            this.toastrService.error("No tienes permisos para realizar esta acción")
            break;
          case 401:
            this.router.navigateByUrl('home')
            this.toastrService.error("Acceso denegado, sesión no iniciada")
            break;
          default:
            this.toastrService.error("Server Error")
            break;
        }
    }});
  }

  onVideoStateChange(event: any, id_publication: any, title_publication: any){
    this.statistics_count = this.statistics_count + 1;
    if(this.statistics_count == 1){
      this.pwbiService.startUserStatisticInfo(id_publication, title_publication, this.pwbiCategory.id, this.pwbiCategory.name).subscribe({
        next: (response: any) => {
          this.ids_statistics.push(response['id_statistic'])
        }
      });
    }

  }


  showConfirmModal(msg: string, function_name: any, btn_discard: string = "No", btn_success: string = "Si"): void {
    $('#confirmModalPowerBiPublication').modal("show");
    
    document.getElementById("confirmModalContentPowerBiPublication")!.innerHTML = `
      <div class="modal-content">
      <div class="modal-body text-center">
          ${msg}
      </div>
      <div class="modal-footer d-inline text-center">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${btn_discard}</button>
          <button type="button" class="btn btn-secondary" id="modal-success-btn-powerbi-publication" data-bs-dismiss="modal">${btn_success}</button>
      </div>
      </div>`

    document.getElementById("modal-success-btn-powerbi-publication")!.addEventListener('click', () =>{
        switch(function_name){
          case "deletePublication":
            this.deletePublication(this.pwbiPublicationCode)
            break;
          default:
            break;
        }
    })
  }

  configurateToastr(): void {
    this.toastrService.toastrConfig.timeOut = 2000
    this.toastrService.toastrConfig.positionClass = 'toast-top-center'
    this.toastrService.toastrConfig.closeButton = true
    this.toastrService.toastrConfig.maxOpened = 6
  }

}
