import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request options
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};
  //Tickets no viewed count to display in menu
  ticketsPendingNoViewedCount: number = 0;
  //Tickets pending object
  ticketsPending: any = {}
  
  constructor(private http: HttpClient, private CookieService: CookieService, private authService: AuthService, private toastrService: ToastrService) { }

  /**
   * **Sends an HTTP request to the backend to get tickets categories**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-categories`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get tickets actual managers**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getManagers(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-managers`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get tickets actual users**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getUsers(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-users`, this.request_options); 
  }

  /**
   * **Sends an HTTP request to the backend to get tickets with given options**
   * @param {object} options Tickets filter options
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getTickets(options: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-tickets`, options, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to get date range of tickets with given options**
   * @param {object} options Tickets filter options
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getDateRangeTickets(options: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-date-range-tickets`, options, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to update all open tickets position**
   */
  updateTicketsPosition(): void{
    this.http.get<any>(`${this.ROOT_URL}/tickets/update-tickets-position`, this.request_options).subscribe({
      next: (response: any) => {}
    });;
  }

  /**
   * **Sends an HTTP request to the backend to get count of tickets with given options**
   * @param {object} options Tickets filter options
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getTicketsCount(options: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-tickets-count`, options, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to get count of pending tickets**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPendingTicketsCount(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-pending-tickets-count`, this.request_options);
  }

  /**
   * **Save pending tickets count in service variables to display later on client**
   */
  savePendingTicketsCount(){
    this.getPendingTicketsCount().subscribe({
      next: (response: any) => {
        if(this.authService.currentUser.rol == 'admin'){
          this.ticketsPendingNoViewedCount = response.RNVM + response.RNVU
          this.ticketsPending = response
        }
        if(this.authService.currentUser.rol == 'user'){
          this.ticketsPendingNoViewedCount = response.RNVU
          this.ticketsPending = response
        }
      }
    });
  }

  /**
   * **Sends an HTTP request to the backend to get manuals**
   * @param {string} category Manual filter by category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getManuals(category: string) {
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-manuals`, {clave: category}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get all manuals categories**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getManualsCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/tickets/get-manuals-categories`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get ticket info with given ticket code**
   * @param {number | null} ticket_code Code of ticket
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getTicket(ticket_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-ticket`, {t_code: ticket_code}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to get ticket messages with given ticket code**
   * @param {number | null} ticket_code Code of ticket
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getTicketMessages(ticket_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/get-ticket-msgs`, {t_code: ticket_code}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to create ticket message with given ticket code and message object**
   * @param {object} ticket_msg Ticket message object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  createTicketMessage(ticket_msg: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/create-ticket-msg`, ticket_msg, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to create ticket with given ticket object**
   * @param {object} ticket Ticket object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  createTicket(ticket: object){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/create-ticket`, ticket, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket viewed state with given ticket code**
   * @param {number | null} ticket_code ticket code
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketStateViewed(ticket_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-viewed-state`, {t_code: ticket_code}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to close ticket with given ticket code**
   * @param {number | null} ticket_code ticket code
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  closeTicket(t_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/close-ticket`, {'t_code': t_code}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to open ticket with given ticket code**
   * @param {number | null} ticket_code ticket code
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  openTicket(t_code: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/open-ticket`, {'t_code': t_code}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket manager with given ticket code and new manager**
   * @param {number | null} ticket_code ticket code
   * @param {string | null} manager new manager
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketManager(t_code: number | null, manager: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-manager`, {'t_code': t_code, 'manager': manager}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket user with given ticket code and new user**
   * @param {number | null} ticket_code ticket code
   * @param {string | null} user new user
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketUser(t_code: number | null, user: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-user`, {'t_code': t_code, 'user': user}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket priority with given ticket code and new priority**
   * @param {number | null} ticket_code ticket code
   * @param {string | null} priority new priority
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketPriority(t_code: number | null, priority: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-priority`, {'t_code': t_code, 'priority': priority}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket category with given ticket code and new category**
   * @param {number | null} ticket_code ticket code
   * @param {string | null} category new category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketCategory(t_code: number | null, category: string | null){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-category`, {'t_code': t_code, 'category': category}, this.request_options);
  }

  /**
   * **Sends an HTTP request to the backend to change ticket validation with given ticket code and new validation**
   * @param {number | null} ticket_code ticket code
   * @param {any} validation new validation
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changeTicketValidation(t_code: number | null, validation: any){
    return this.http.post<any>(`${this.ROOT_URL}/tickets/change-ticket-validation`, {'t_code': t_code, 'validation': validation}, this.request_options);
  }

  /**
   * **Save actual ticket code in cookies**
   * @param {number | null} t_code ticket code
   */
  saveTicketCodeInCookies(t_code: number | null) {
    this.CookieService.set('ticket_code', JSON.stringify(t_code!.toString()), 60, '/')
  }

  /**
   * **Get actual ticket code from cookies**
   * @return {number | null} Ticket code if exist, null if not exist
   */
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

  /**
   * **Save actual ticket filter options in cookies**
   * @param {any} options Ticket filter options object
   */
  saveTicketsFilterOptionsInCookies(options: any): void{
    this.CookieService.set('tickets_filter_options', JSON.stringify(options), 60, '/')
  }

  /**
   * **Get actual ticket filter options from cookies**
   * @return {number | null} Ticket filter options if exist, null if not exist
   */
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

  /**
   * **Save actual ticket search filter options in cookies**
   * @param {any} options Ticket filter options object
   */
  saveTicketsSearchFilterOptionsInCookies(options: any): void{
    this.CookieService.set('tickets_search_filter_options', JSON.stringify(options), 60, '/')
  }

  /**
   * **Get actual ticket search filter options from cookies**
   * @return {number | null} Ticket filter options if exist, null if not exist
   */
  getTicketsSearchFilterOptionsFromCookies() {
    try {
      let cookieExist = this.CookieService.check('tickets_search_filter_options');
      if(cookieExist){
        return JSON.parse(this.CookieService.get('tickets_search_filter_options'))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }

  /**
   * **Save actual ticket search page in cookies**
   * @param {number} tickets_page Ticket page of ticket list
   */
  saveTicketsSearchPageInCookies(tickets_page: number): void{
    this.CookieService.set('tickets_search_page', JSON.stringify(tickets_page.toString()), 60, '/')
  }

  /**
   * **Get actual ticket search page from cookies**
   * @return {number} Ticket page if exist, 1 if not exist
   */
  getTicketsSearchPageFromCookies(): number{
    try {
      let cookieExist = this.CookieService.check('tickets_search_page');
      if(cookieExist){
        return Number(JSON.parse(this.CookieService.get('tickets_search_page')))
      } else {
        return 1
      }
    } catch(error){
      return 1
    }
  }

  /**
   * **Save actual ticket page in cookies**
   * @param {number} tickets_page Ticket page of ticket list
   */
  saveTicketsPageInCookies(tickets_page: number): void {
    this.CookieService.set('tickets_page', JSON.stringify(tickets_page.toString()), 60, '/')
  }

  /**
   * **Get actual ticket page from cookies**
   * @return {number} Ticket page if exist, 1 if not exist
   */
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
