import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request Options
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  //Variable that indicates if the user is logged in
  logged_user: boolean = false;
  //Variable for save logged user info
  currentUser: User = new User()

  constructor(private http: HttpClient, private router: Router, private CookieService: CookieService) {}
  
  /**
   * **signIn Function**
   * @param {Object} user {'username': str, 'password': str}
   * @return {Observable<any>} Observable
   */
  signIn(user: Object): Observable<any>{
    return this.http.post<any>(`${this.ROOT_URL}/login`, user, this.request_options);
  }

  /**
   * **validateEmail Function**
   * @param {Object} email {'email': str}
   * @return {Observable<any>} Observable
   */
  validateEmail(email: Object): Observable<any>{
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/validate-email`, email, this.request_options);
  }

  /**
   * **validateResetKey Function**
   * @param {Object} key {'key': str}
   * @return {Observable<any>} Observable
   */
  validateResetKey(key: Object): Observable<any>{
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/validate-reset-key`, key, this.request_options);
  }

  /**
   * **changePassword Function**
   * @param {Object} password {'password': str}
   * @return {Observable<any>} Observable
   */
  changePassword(password: Object): Observable<any>{
    return this.http.post<any>(`${this.ROOT_URL}/reset-password/change-password`, password, this.request_options);
  }
  
  /**
   * **signOut Function** - SignOut User from app
   */
  signOut(): void{
    this.http.post<any>(`${this.ROOT_URL}/logout`, this.currentUser, this.request_options).subscribe({
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

      }
    });
  }

  /**
   * **getUserInfo Function** - Return info of current user if user is logged | new User if user is not logged
   * @return {User} User object
   */
  getUserInfo(): User{
    if(this.currentUser){
      return this.currentUser
    } else {
      return new User()
    } 
  }

  /**
   * **isLoggedIn Function** - Check if the user is logged in or not by pulling the user information out of the 'access_token' cookie
   * @return {boolean} True if is logged | Flase if not
   */
  get isLoggedIn(): boolean {
    let authToken = this.CookieService.check('access_token');
    try {
      if (authToken == true){
        this.logged_user = true;
        this.currentUser = this.getDecodedAccessToken(this.CookieService.get('access_token'))['user'];
        return true
      } else {
        this.logged_user = false; 
        this.currentUser = new User()
        return false
      }
    } catch(error) {
      this.logged_user = false; 
      this.currentUser = new User()
      this.CookieService.delete('ticket_filter_options');
      this.CookieService.delete('t_code');
      return false
    }
  }

  /**
   * **getDecodedAccessToken Function** - Decode 'access_token' from cookies
   * @return {any} Return JWT content decoded
   */
  getDecodedAccessToken(token: string): any | null {
    try {
      return jwt_decode(token);
    } catch(error) {
      return null;
    }
  }

  /**
   * **getAccessToken Function** - Get 'access_token' from cookies
   * @return {string} Return JWT 'access_token'
   */
  getAccessToken(): string {
    return this.CookieService.get('access_token')
  }

  /**
   * **setAccessToken Function** - Set cookie 'access_token'
   */
  setAccessToken(token: string): void{
    this.CookieService.set('access_token', token)
  }

}
