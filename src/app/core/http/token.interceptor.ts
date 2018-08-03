import { HttpEvent , HttpRequest , HttpHandler , HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {


  getCreds() {
   return localStorage.getItem('credentials');
  }

  constructor() {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const creds = JSON.parse(this.getCreds());

    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (creds) {
      const access_token = creds.token;

      if (access_token) {
        headersConfig['Authorization'] = `LDX ${access_token}`;
      }
    }

    request = request.clone({
        setHeaders: headersConfig
    });

    return next.handle(request);
  }
}
