import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private toastrService: ToastrService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!this.authService.isLoggedIn) {
        this.router.navigate(['home']).then(() => {
          this.toastrService.toastrConfig.timeOut = 2000
          this.toastrService.toastrConfig.positionClass = 'toast-top-center'
          this.toastrService.toastrConfig.closeButton = true
          this.toastrService.toastrConfig.maxOpened = 6
          this.toastrService.error('Acceso no permitido')
        })
        return false;
      }
      return true;
  }
}
