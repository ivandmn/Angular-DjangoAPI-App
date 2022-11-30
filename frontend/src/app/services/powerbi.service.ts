import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PowerbiService {

  constructor(private http:HttpClient) { }

  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request Options
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  getPowerBiCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/powerbi/get-categories`, this.request_options)
  }
  
}
