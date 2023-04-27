import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private toastrService: ToastrService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let current_user: User = this.authService.getUserInfo()
    //If user is not admin, redirect to home and show error message  
    if (current_user.rol != 'admin') {
        this.router.navigate(['home']).then(() => {
          this.toastrService.toastrConfig.timeOut = 2000
          this.toastrService.toastrConfig.positionClass = 'toast-top-center'
          this.toastrService.toastrConfig.closeButton = true
          this.toastrService.toastrConfig.maxOpened = 6
          this.toastrService.error('Acceso denegado, no tienes permisos para acceder a esta ruta')
        })
        return false;
    }
    return true;
  }
  
}