import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import {
  AuthService as SocialAuthService,
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angular-6-social-login';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService, HelperService } from '@app/core';


const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  version: string = environment.version;
  error: string;
  error_messages: Array<string>;
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private socialAuthService: SocialAuthService,
    private helperService: HelperService
  ) {
    this.createForm();
  }

  ngOnInit() { }




  login() {
    this.isLoading = true;
    this.authenticationService.login(this.loginForm.value)
      .pipe(finalize(() => {
        this.loginForm.markAsPristine();
        this.isLoading = false;
      }))
      .subscribe(credentials => {
        this.error = null;
        this.error_messages = [];
        log.debug(`${credentials.user.first_name} ${credentials.user.last_name} successfully logged in`);
        this.router.navigate(['/'], { replaceUrl: true });
      }, error => {
        log.debug(`Login error: ${error}`);
        this.error = error.error.errors;
        this.error_messages = this.helperService.extractErrorMessages(this.error);
      });
  }




  public socialLogin(socialPlatform: string) {
    let socialPlatformProvider;
    let apiurl: string;
    if (socialPlatform === 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
      apiurl = '/user/facebook/';
    } else if (socialPlatform === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
      apiurl = '/user/google/';
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        this.authenticationService.socialSendToAPI(apiurl, userData.token)
          .subscribe(
            credentials => {
              this.router.navigate(['/'], { replaceUrl: true });
            }, error => {
              log.debug(`Social Connect error: ${error}`);
              this.error = error;
            }
          );
      }
    );
  }



  setLanguage(language: string) {
    this.i18nService.language = language;
  }



  get currentLanguage(): string {
    const curr_lang = this.i18nService.language;
    return this.i18nService.languageKeyPairs[curr_lang];
  }



  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }



  private createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: true
    });
  }

}
