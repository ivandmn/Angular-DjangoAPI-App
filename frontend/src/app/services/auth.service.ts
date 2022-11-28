import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import jwt_decode from 'jwt-decode';
import { ThisReceiver } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  ROOT_URL: string = 'http://localhost:8000/api';
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  logged_user: boolean = false;
  currentUser: User = new User()

  constructor(private http: HttpClient, private router: Router, private CookieService: CookieService) {}

  signIn(user: Object){
    return this.http.post<any>(`${this.ROOT_URL}/login`, user, this.request_options);
  }

  validateEmail(email: Object){
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/validate-email`, email, this.request_options);
  }

  validateResetKey(key: Object){
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/validate-reset-key`, key, this.request_options);
  }

  changePassword(password: Object){
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/change-password`, password, this.request_options);
  }
  
  singOut(){
    return this.http.post<any>(`${this.ROOT_URL}/logout`, this.currentUser, this.request_options).subscribe({
      next: () => {
        this.logged_user = false;
        this.currentUser = new User();
        this.CookieService.delete('ticket_filter_options');
        this.CookieService.delete('t_code');
        this.router.navigate(['home']); 
      },
      error: (err: any) => {
        this.logged_user = false;
        this.currentUser = new User(); 
        this.CookieService.delete('ticket_filter_options');
        this.CookieService.delete('t_code');
        this.router.navigate(['home']);

      },
      complete: () => {}
    });
  }

  getUserInfo(){
    if(this.currentUser){
      return this.currentUser
    } else {
      return new User()
    } 
  }

  get isLoggedIn(): boolean {
    let authToken = this.CookieService.check('access_token');
    if (authToken == true){
      this.logged_user = true;
      this.currentUser = this.getDecodedAccessToken(this.CookieService.get('access_token'))['user'];
      return true
    } else {
      this.logged_user = false; 
      this.currentUser = new User()
      return false
    }
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch(Error) {
      return null;
    }
  }

  getAccessToken() {
    return this.CookieService.get('access_token')
  }

  setAccessToken(token: string){
    this.CookieService.set('access_token', token)
  }

}
