import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { take } from 'rxjs/operators';

import { Logger } from '@app/core/logger.service';
import { AuthenticationService } from '@app/core/authentication/authentication.service';


const log = new Logger('RestrictLoggedInGuard');

@Injectable()
export class RestrictLoggedInGuard implements CanActivate {

  constructor(private router: Router,
              private authenticationService: AuthenticationService) { }

  canActivate(): boolean {
    if (!this.authenticationService.isAuthenticated() ) {
      return true;
    }
    log.debug('Already logged in, redirecting...');
    this.router.navigate(['/home'], { replaceUrl: true });
    return false;
  }
}
