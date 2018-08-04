import { Injectable, Inject, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '@env/environment';
import { Logger} from '../logger.service';
import { AuthenticationService } from '../authentication/authentication.service';

const log = new Logger('ErrorHandlerInterceptor');
// const credentialsKey = environment.credentialsKey;



/**
 * Adds a default error handler to all requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

  private _auth: AuthenticationService;

  constructor(
    private router: Router,
    private inj: Injector
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._auth = this.inj.get(AuthenticationService);

    return next.handle(request).pipe(catchError(error => this.errorHandler(error)));
  }

  // Customize the default error handler here if needed
  private errorHandler(response: HttpEvent<any>): Observable<HttpEvent<any>> {
    if (!environment.production) {
      // Do something with the error
      log.error('Request error', response);
    }

    if (this.router.url !== '/login' && ( (<any>response).status === 401 || (<any>response).status === 403) ) {
      console.log('The authentication session expires or the user is not authorised. Force refresh of the current page.');
      this._auth.setCredentials();
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    throw response;
  }

}
