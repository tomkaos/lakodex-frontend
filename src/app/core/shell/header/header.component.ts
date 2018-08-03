import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { AuthenticationService } from '@app/core/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menuHidden = true;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {}

  toggleMenu() {
    this.menuHidden = !this.menuHidden;
  }

  logout() {
    this.authenticationService.logout()
      .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  get user_avatar(): string {
    return this.authenticationService.user_image_url;
  }

  get isAuthenticated() {
    return this.authenticationService.isAuthenticated();
  }

  get username(): string | null {
    const credentials = this.authenticationService.credentials;
    return credentials ? `${credentials.user.first_name} ${credentials.user.last_name}` : null;
  }

}
