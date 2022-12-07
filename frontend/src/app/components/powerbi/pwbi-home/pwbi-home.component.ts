import { Component, OnInit} from '@angular/core';
import { PowerbiService } from 'src/app/services/powerbi.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-pwbi-home',
  templateUrl: './pwbi-home.component.html',
  styleUrls: ['./pwbi-home.component.css']
})
export class PwbiHomeComponent implements OnInit {
  
  constructor(private pwbiService: PowerbiService, private authService: AuthService) { }
  
  current_user: User = this.authService.getUserInfo()
  current_user_pwbi_permissions: any = this.current_user.powerbi_permissions?.split(';').map(Number)
  pwbiCategories: Array<any> = []
  ngOnInit(): void {
    this.getPowerBiCategories();
  }

  getPowerBiCategories(): void {
    this.pwbiService.getPowerBiCategories().subscribe({
      next: (response: any) => {
        this.pwbiCategories = response
      }
    })
  }
}
