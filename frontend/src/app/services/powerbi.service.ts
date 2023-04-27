import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PowerbiService {

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  //Backend base domain
  ROOT_URL: string = 'http://localhost:8000/api';
  //Request Options
  request_options: Object = {headers: new HttpHeaders({'Content-Type':'application/json'}), withCredentials: true, responseType: "json" as const};

  /**
   * **Sends an HTTP request to the backend to get powerbi categories**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/powerbi/get-categories`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get all powerbi categories**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiAllCategories(){
    return this.http.get<any>(`${this.ROOT_URL}/powerbi/get-all-categories`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get powerbi newness publications**
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiNewnessPublications(){
    return this.http.get<any>(`${this.ROOT_URL}/powerbi/get-all-newness-publications`, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get powerbi category info**
   * @param {number | null} pwbi_category_id Id of powerbi category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiCategory(pwbi_category_id: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/get-category`,{'category_id': pwbi_category_id}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get powerbi news publications of a category**
   * @param {number | null} pwbi_category_id Id of powerbi category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiPublicationsNews(pwbi_category_id: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/get-publications-news`,{'category_id': pwbi_category_id}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get powerbi guides publications of a category**
   * @param {number | null} pwbi_category_id Id of powerbi category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiPublicationsGuides(pwbi_category_id: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/get-publications-guides`,{'category_id': pwbi_category_id}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to get powerbi publication of a category**
   * @param {number | null} pwbi_publication_id Id of powerbi publication
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  getPowerBiPublication(pwbi_publication_id: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/get-publication`,{'publication_id': pwbi_publication_id}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to save user statistic in one powerbi publication**
   * @param {any} id_publication Id of powerbi publication
   * @param {any} title_publication Title of powerbi publication
   * @param {any} id_category Id of powerbi category
   * @param {any} title_category Title of powerbi category
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  startUserStatisticInfo(id_publication: any, title_publication: any, id_category: any, title_category: any){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/start-user-statistic-info`,{'id_publication': id_publication, 'title_publication': title_publication, 'id_category': id_category, 'title_category': title_category}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to save final date and time spend statistic in one powerbi publication**
   * @param {any} ids_statistics Array with powerbi publications id's
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  endUserStatisticInfo(ids_statistics: any){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/end-user-statistic-info`,{'ids_statistics': ids_statistics}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to change powerbi publication newness state**
   * @param {number | null} pwbi_publication_id Id of powerbi publication
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  changePowerBiPublicationNewnessState(pwbi_publication_id: number | null, state: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/change-publication-newness-state`,{'publication_id': pwbi_publication_id, 'state': state}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to delete powerbi publication**
   * @param {number | null} pwbi_publication_id Id of powerbi publication
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  deletePowerBiPublication(pwbi_publication_id: number | null){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/delete-pwbi-publication`,{'publication_id': pwbi_publication_id}, this.request_options)
  }

  /**
   * **Sends an HTTP request to the backend to create powerbi publication of a category**
   * @param {object} pwbi_publication_id Publication object
   * @return {Observable<HttpResponse<any>>} Observable HTTP Response
   */
  createPowerBiPublication(publication: object){
    return this.http.post<any>(`${this.ROOT_URL}/powerbi/create-publication`,publication, this.request_options)
  }

  /**
   * **Save actual powerbi category id in cookies**
   * @param {number | null} category_id powerbi category id
   */
  savePowerBiCategoryIdInCookies(category_id: number | null){
    this.cookieService.set('pwbi_category_code', JSON.stringify(category_id!.toString()), 60, '/')
  }

  /**
   * **Get actual powerbi category id from cookies**
   * @return {number | null} Id of category if cookie exists, none if not exist
   */
  getPowerBiCategoryIdFromCookies(): number | null{
    try {
      let cookieExist = this.cookieService.check('pwbi_category_code');
      if (cookieExist){
        return Number(JSON.parse(this.cookieService.get('pwbi_category_code')))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }

  /**
   * **Save actual powerbi publication id in cookies**
   * @param {number | null} publication_id powerbi publication id
   */
  savePowerBiPublicationIdInCookies(publication_id: number | null){
    this.cookieService.set('pwbi_publication_code', JSON.stringify(publication_id!.toString()), 60, '/')
  }

  /**
   * **Get actual powerbi publication id from cookies**
   * @return {number | null} Id of publication if cookie exists, none if not exist
   */
  getPowerBiPublicationIdFromCookies(): number | null{
    try {
      let cookieExist = this.cookieService.check('pwbi_publication_code');
      if (cookieExist){
        return Number(JSON.parse(this.cookieService.get('pwbi_publication_code')))
      } else {
        return null
      }
    } catch(error){
      return null
    }
  }
}
