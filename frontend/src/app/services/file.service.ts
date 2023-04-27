import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request Options
  request_options: Object = {withCredentials: true}

  constructor(private http:HttpClient) { }

  /**
   * **Sends an HTTP request with a ticket file to the backend to upload it there**
   * @param {File} file File to upload
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  uploadFile(file: any): Observable<HttpResponse<any>> {
    const formData = new FormData(); 
    formData.append("file", file, file.name);
    return this.http.post<any>(`${this.ROOT_URL}/tickets/upload-file`, formData, this.request_options)
  }

  /**
   * **Sends an HTTP request with a ticket file to the backend to upload it there and remove existing file with same name in the ticket**
   * @param {File} file File to upload and ticket_code
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  uploadFileExistingTicket(file: any, ticket_code: any): Observable<HttpResponse<any>> {
    const formData = new FormData(); 
    formData.append("file", file, file.name);
    formData.append('t_code', ticket_code)
    return this.http.post<any>(`${this.ROOT_URL}/tickets/upload-file-existing-ticket`, formData, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to download ticket file**
   * @param {string} file_name File Name
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  downloadFile(file_name: string): Observable<HttpResponse<any>>{
    return this.http.post(`${this.ROOT_URL}/tickets/download-file`, {file: file_name}, {withCredentials: true, observe:'response', responseType:'blob'})
  }

  /**
   * **Sends an HTTP request with a profile img to the backend to upload it there**
   * @param {File} file File to upload
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  uploadProfileImage(file: any): Observable<HttpResponse<any>> {
    const formData = new FormData(); 
    formData.append("file", file, file.name);
    return this.http.post<any>(`${this.ROOT_URL}/user/upload-img`, formData, this.request_options)
  }

  /**
   * **Sends an HTTP request with the file name to the backend to download it in client**
   * @param {string | null} file_name Name of file to download
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response (Type - blob)
   */
  downloadProfileImage(file_name: string | null): Observable<HttpResponse<any>>{
    return this.http.post(`${this.ROOT_URL}/user/download-img`, {file: file_name}, {withCredentials: true, observe:'response', responseType:'blob'})
  }

  /**
   * **Sends an HTTP request with the manual file name to the backend to download it in client**
   * @param {string | null} file_name Name of manual file to download
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response (Type - blob)
   */
  downloadManual(manual_name: string): Observable<HttpResponse<any>>{
    return this.http.post(`${this.ROOT_URL}/tickets/download-manual`, {file: manual_name}, {withCredentials: true, observe:'response', responseType:'blob'})
  }

}
