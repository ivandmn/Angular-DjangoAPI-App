import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  ROOT_URL: string = 'http://localhost:8000/api';
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  constructor(private http: HttpClient, private CookieService: CookieService) { }

  getCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-categories`, this.request_options)
  }

  getManagers(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-managers`, this.request_options)
  }

  getUsers(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-users`, this.request_options); 
  }

  getTickets(options: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-tickets`, options, this.request_options);
  }

  getTicketsCount(options: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-tickets-count`, options, this.request_options);
  }

  getTicket(ticket_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-ticket`, {t_code: ticket_code}, this.request_options);
  }

  getTicketMessages(ticket_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-ticket-msgs`, {t_code: ticket_code}, this.request_options);
  }

  createTicketMessage(ticket_msg: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/create-ticket-msg`, ticket_msg, this.request_options);
  }

  createTicket(ticket: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/create-ticket`, ticket, this.request_options);
  }

  changeTicketStateViewed(ticket_code: number | null, username: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-viewed-state`, {t_code: ticket_code, user_name: username}, this.request_options);
  }

  closeTicket(t_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/close-ticket`, {'t_code': t_code}, this.request_options);
  }

  openTicket(t_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/open-ticket`, {'t_code': t_code}, this.request_options);
  }

  changeTicketManager(t_code: number | null, manager: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-manager`, {'t_code': t_code, 'manager': manager}, this.request_options);
  }


  saveTicketCodeInCookies(t_code: number | null) {
    this.CookieService.set('ticket_code', JSON.stringify(t_code!.toString()))
  }

  getTicketCodeFromCookies(): number | null{
    try {
      let cookieExist = this.CookieService.check('ticket_code');
      if (cookieExist){
        return Number(JSON.parse(this.CookieService.get('ticket_code')))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }

  saveTicketsFilterOptionsInCookies(options: any): void{
    this.CookieService.set('tickets_filter_options', JSON.stringify(options))
  }

  getTicketsFilterOptionsFromCookies() {
    try {
      let cookieExist = this.CookieService.check('tickets_filter_options');
      if(cookieExist){
        return JSON.parse(this.CookieService.get('tickets_filter_options'))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }
  saveTicketsPageFromCookies(tickets_page: number): void{
    this.CookieService.set('tickets_page', JSON.stringify(tickets_page.toString()))
  }

  getTicketsPageFromCookies(): number{
    try {
      let cookieExist = this.CookieService.check('tickets_page');
      if(cookieExist){
        return Number(JSON.parse(this.CookieService.get('tickets_page')))
      } else {
        return 1
      }
    } catch(error){
      return 1
    }
  }
}
