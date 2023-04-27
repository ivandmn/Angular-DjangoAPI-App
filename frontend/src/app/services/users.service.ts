import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request options
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  constructor(private http: HttpClient, private CookieService: CookieService) { }

  /**
   * **Sends an HTTP request to the backend to get all users**
   * @param {any} object filter options object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getUsers(object: any){
    return this.http.post<any>(`${this.ROOT_URL}/users/get-users`, object, this.request_options); 
  }
  
  /**
   * **Sends an HTTP request to the backend to get specific user info**
   * @param {string | null} user_name user's name
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getUserInfo(user_name: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/users/get-user-info`, {username: user_name}, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend to get specific user image path**
   * @param {string | null} user_name user's name
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getUserImgPath(user_name: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/users/get-user-img-path`, {username: user_name}, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend to create user**
   * @param {any} user_object user's object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  createUser(user_object: any){
    return this.http.post<any>(`${this.ROOT_URL}/users/create-user`, user_object, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend to edit specific user**
   * @param {any} usr_object user's object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  editUser(usr_object: any){
    return this.http.post<any>(`${this.ROOT_URL}/users/edit-user`, usr_object, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend disable user and add date to f_baja**
   * @param {string | null} user_name user's name
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  bajaUsuario(user_name: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/users/disable-user`, {username: user_name}, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend enable user and remove date of f_baja**
   * @param {string | null} user_name user's name
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  altaUsuario(user_name: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/users/enable-user`, {username: user_name}, this.request_options); 
  }

  /**
   * **Save actual user name in cookies to get profile later**
   * @param {string} username User name
   */
  saveUsernameProfileInCookies(username: string | null){
    if(username){
      this.CookieService.set('username-profile-search', JSON.stringify(username.toString()), 60, '/')
    }
  }

  /**
   * **Get actual user name from cookies to get profile**
   * @return {string | null} user name if cookie exist, null if cookie not exist
   */
  getUsernameProfileFromCookies(): string | null{
    try {
      let cookieExist = this.CookieService.check('username-profile-search');
      if (cookieExist){
        return JSON.parse(this.CookieService.get('username-profile-search'))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }
}
