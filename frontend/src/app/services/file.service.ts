import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http:HttpClient) { }

  ROOT_URL: string = 'http://localhost:8000/api';
  request_options: Object = {withCredentials: true}

  upload(file: any):Observable<any> {
    const formData = new FormData(); 
    formData.append("file", file, file.name);
    return this.http.post(`${this.ROOT_URL}/tickets/upload-file`, formData)
  }

  delete(fileName: string) {
    return this.http.post(`${this.ROOT_URL}/tickets/delete-file`, {file: fileName})
  }

  download(filepath: string){
    return this.http.post(`${this.ROOT_URL}/tickets/download-file`, {file: filepath}, {observe:'response', responseType:'blob'})
  }
}
