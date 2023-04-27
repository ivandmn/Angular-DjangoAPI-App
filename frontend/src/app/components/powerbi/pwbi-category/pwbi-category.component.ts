import { Component, OnInit, OnDestroy} from '@angular/core';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { PowerbiH } from 'src/app/models/powerbi-h.model';
import { User } from 'src/app/models/user.model';
import { PowerbiL } from 'src/app/models/powerbi-l.model';


@Component({
  selector: 'app-pwbi-category',
  templateUrl: './pwbi-category.component.html',
  styleUrls: ['./pwbi-category.component.css']
})
export class PwbiCategoryComponent implements OnInit,  OnDestroy{
  //Variable to save current user info
  current_user: User = this.authService.getUserInfo();
  //Variable to save actual powerbi category code
  pwbiCategoryCode: number | null = this.pwbiService.getPowerBiCategoryIdFromCookies();
  //Variable to save current powerbi category
  pwbiCategory: PowerbiH = new PowerbiH();
  //Variable to save current publications news of this powerbi category
  pwbiPublicationsNews: Array<PowerbiL> = []
  //Variable to save current publications guides of this powerbi category
  pwbiPublicationsGuides: Array<PowerbiL> = []

  //Variable to save what publications seen the curren't user to save statistics
  ids_statistics: Array<Number> = []

  statistics_count: any = {}

  

  constructor(private pwbiService: PowerbiService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void { 
    this.pwbiService.getPowerBiCategory(this.pwbiCategoryCode).subscribe({
      next: (response: any) => {
        this.pwbiCategory = response
      }
    });
    this.pwbiService.getPowerBiPublicationsNews(this.pwbiCategoryCode).subscribe({
      next: (response: any) => {
        this.pwbiPublicationsNews = response
      }
    });
    this.pwbiService.getPowerBiPublicationsGuides(this.pwbiCategoryCode).subscribe({
      next: (response: any) => {
        this.pwbiPublicationsGuides = response
      }
    });
  }

  ngOnDestroy(): void {
      this.pwbiService.endUserStatisticInfo(this.ids_statistics).subscribe({
        next: (response: any) => {}
      });
  }

  onVideoStateChange(event: any, id_publication: any, title_publication: any){
    if(this.statistics_count[title_publication] == undefined){
      this.statistics_count[title_publication] = 1
      this.pwbiService.startUserStatisticInfo(id_publication, title_publication, this.pwbiCategory.id, this.pwbiCategory.name).subscribe({
        next: (response: any) => {
          this.ids_statistics.push(response['id_statistic'])
        }
      });
    }

  }

  enterPowerBiPublication(publication_id: number | null): void {
    this.pwbiService.savePowerBiPublicationIdInCookies(publication_id)
    this.router.navigateByUrl('pwbi/publication')
  }


  getVideoUrl(videoId: string){
    return 'https://www.youtube.com/embed/' + videoId + '?feature=player_embedded'
  }

  getPublicationClasses(index: number, array_lenght: number){
    var classes: any = {}
    let residue: number = array_lenght % 3
    if(residue != 0){
      if(residue == 1 && index == array_lenght - 1){
        classes['col-xxl-12'] = true
      } else{
        if(residue == 2 && (index == array_lenght - 1 || index == array_lenght - 2)){
          classes['col-xxl-6'] = true
        } else{
          classes['height-publication-min'] = true
          classes['col-xxl-4'] = true
        }
      }

    } else{
      classes['height-publication-min'] = true
      classes['col-xxl-4'] = true
    }
    return classes
  }
}
