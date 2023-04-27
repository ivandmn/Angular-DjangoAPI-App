import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FileService } from './file.service';
import { ToastrService } from 'ngx-toastr';

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
  currentUser: User = new User();

  constructor(private http: HttpClient, private router: Router, private CookieService: CookieService, private fileService: FileService, private toastrService: ToastrService) {}
  
  /**
   * **Sends an HTTP request to the backend to sign in**
   * @param {Object} user {'username': str, 'password': str}
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  signIn(user: Object): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.ROOT_URL}/auth/login`, user, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to validate email**
   * @param {Object} email {'email': str}
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  validateEmail(email: Object): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.ROOT_URL}/auth/reset-password/validate-email`, email, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to validate reset key**
   * @param {Object} key {'key': str}
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  validateResetKey(key: Object): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.ROOT_URL}/auth/reset-password/validate-reset-key`, key, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change password**
   * @param {Object} password {'password': str}
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changePassword(password: Object): Observable<HttpResponse<any>>{
    return this.http.post<any>(`${this.ROOT_URL}/auth/reset-password/change-password`, password, this.request_options);
  }
  
  /**
   * **Sends an HTTP request to the backend to sign out**
   */
  signOut(): void{
    this.http.post<any>(`${this.ROOT_URL}/auth/logout`, this.currentUser, this.request_options).subscribe({
      next: () => {
        this.logged_user = false;
        this.currentUser = new User();
        this.deleteSessionCookies();
        this.router.navigate(['home']).then(()=>{
          this.fileService.downloadProfileImage(this.currentUser.image).subscribe({
            next: (response: any) => {
              let blob: Blob = response.body as Blob;
              let objectURL = window.URL.createObjectURL(blob);
              $(".navbar_icon").attr("src", objectURL);
            }
          });
        });
      },
      error: () => {
        this.logged_user = false;
        this.currentUser = new User(); 
        this.deleteSessionCookies();
        this.router.navigate(['home']).then(()=>{
          this.toastrService.toastrConfig.timeOut = 2000
          this.toastrService.toastrConfig.positionClass = 'toast-top-center'
          this.toastrService.toastrConfig.closeButton = true
          this.toastrService.toastrConfig.maxOpened = 6
          this.toastrService.error('Error al cerrar sessión')
          this.fileService.downloadProfileImage(this.currentUser.image).subscribe({
            next: (response: any) => {
              let blob: Blob = response.body as Blob;
              let objectURL = window.URL.createObjectURL(blob);
              $(".navbar_icon").attr("src", objectURL);
            }
          });
        });
      }
    });
  }

  /**
   * **Return info of current user if user is logged | new User() if user is not logged**
   * @return {User} User object
   */
  getUserInfo(): User{
    let jwt_cookie_exist: boolean = this.CookieService.check('access_token');
    try {
      if (jwt_cookie_exist){
        let access_token: string = this.CookieService.get('access_token');
        this.logged_user = true;
        this.currentUser = this.getDecodedAccessToken(access_token)['user'];
      } else {
        this.logged_user = false; 
        this.currentUser = new User();
        this.deleteSessionCookies();
      }
      return this.currentUser
    } catch(error) {
      this.logged_user = false; 
      this.currentUser = new User();
      this.deleteSessionCookies();
      return this.currentUser
    }
  }

  /**
   * **Check if the user is logged in or not by pulling the user information out of the 'access_token' cookie**
   * @return {boolean} True if is logged | Flase if not
   */
  get isLoggedIn(): boolean {
    let jwt_cookie_exist: boolean = this.CookieService.check('access_token');
    try {
      if (jwt_cookie_exist){
        let access_token: string = this.CookieService.get('access_token');
        this.logged_user = true;
        this.currentUser = this.getDecodedAccessToken(access_token)['user'];
        return true;
      } else {
        this.logged_user = false; 
        this.currentUser = new User();
        this.deleteSessionCookies();
        return false;
      }
    } catch(error) {
      this.logged_user = false; 
      this.currentUser = new User();
      this.deleteSessionCookies();
      return false
    }
  }

  /**
   * **Decodes given JWT Token**
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
   * **Get 'access_token' from cookies**
   * @return {string} Return JWT 'access_token'
   */
  getAccessToken(): string {
    return this.CookieService.get('access_token')
  }

  /**
   * **Delete cookies related with logged user**
   */
  deleteSessionCookies(): void {
    this.CookieService.deleteAll('/')
  }
  
}
