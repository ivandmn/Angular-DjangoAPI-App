import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private cookieService: CookieService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const token = this.cookieService.get('access_token')
        const csrfToken = this.cookieService.get('csrftoken')
        let newHeaders = req.headers
        if (token) {
            newHeaders = newHeaders.append('Authorization', `Bearer ${token}`)
        }
        
        if(csrfToken) {
            newHeaders = newHeaders.append('X-CSRFToken', csrfToken)
        }
        
        const authReq = req.clone({headers:newHeaders})
        
        return next.handle(authReq)

    }
}