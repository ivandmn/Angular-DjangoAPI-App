import { Component, OnInit} from '@angular/core';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { PowerbiH } from 'src/app/models/powerbi-h.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pwbi-home',
  templateUrl: './pwbi-home.component.html',
  styleUrls: ['./pwbi-home.component.css']
})
export class PwbiHomeComponent implements OnInit {
  
  constructor(private pwbiService: PowerbiService, private authService: AuthService, private router: Router) { }
  
  //Variable to save current user info
  current_user: User = this.authService.getUserInfo()
  //Variable to save current user powerbi permissions
  current_user_pwbi_permissions: any = this.current_user.powerbi_permissions?.split(';').map(Number)
  //Variable to save actual powerbi categories
  pwbiCategories: Array<PowerbiH> = []
  //Variable to save actual powerbi newness publications
  pwbiNewnessPublications: Array<any> = []
  
  ngOnInit(): void {
    this.getPowerBiCategories();
    this.getPowerBiNewnessPublications();
  }

  getPowerBiCategories(): void {
    this.pwbiService.getPowerBiCategories().subscribe({
      next: (response: any) => {
        this.pwbiCategories = response
      }
    })
  }

  getPowerBiNewnessPublications(){
    this.pwbiService.getPowerBiNewnessPublications().subscribe({
      next: (response: any) => {
        this.pwbiNewnessPublications = response
      }
    })
  }

  enterPowerBiCategory(category_id: number | null): void {
    this.pwbiService.savePowerBiCategoryIdInCookies(category_id);
    this.router.navigateByUrl('pwbi/category')
  }

  
  enterPowerBiPublication(publication_id: number | null, category_id: number | null): void {
    this.pwbiService.savePowerBiCategoryIdInCookies(category_id);
    this.pwbiService.savePowerBiPublicationIdInCookies(publication_id)
    this.router.navigateByUrl('pwbi/publication')
  }
}
