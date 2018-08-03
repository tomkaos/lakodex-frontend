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
import { Logger, I18nService, AuthenticationService } from '@app/core';
import { HelperService } from '@app/core/helper.service';

const log = new Logger('SignUp');

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  version: string = environment.version;
  error: string;
  error_messages: Array<string>;
  signupForm: FormGroup;
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



  /**
   * Handle signup form submit
   */
  public signup() {
    this.isLoading = true;
    this.authenticationService.signup(this.signupForm.value)
      .pipe(finalize(() => {
        this.signupForm.markAsPristine();
        this.isLoading = false;
      }))
      .subscribe(credentials => {
        this.error = null;
        this.error_messages = [];
        this.router.navigate(['/'], { replaceUrl: true });
      }, error => {
        log.debug(`Signup error: ${error}`);
        this.error = error.error.errors;
        this.error_messages = this.helperService.extractErrorMessages(this.error);
      });
  }



  /**
   * Handle Social Signup
   * @param socialPlatform: string (Example: facebook, google)
   */
  public socialSignup(socialPlatform: string) {
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



  /**
   * Set the global language
   * @param language: strin
   */
  setLanguage(language: string) {
    this.i18nService.language = language;
  }


  /**
   * Get the current language
   */
  get currentLanguage(): string {
    const curr_lang = this.i18nService.language;
    return this.i18nService.languageKeyPairs[curr_lang];
  }


  /**
   * Get all supported languages
   */
  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }



  /**
   * FormBuilder for signup form
   */
  private createForm() {
    const username_pattern = new RegExp('^[a-z0-9]+([a-z0-9](_|-)[a-z0-9])*[a-z0-9]+$');

    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(username_pattern)]],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
    }, {validator: this.helperService.checkIfMatchingPasswords('password', 'password2')});
  }

}
