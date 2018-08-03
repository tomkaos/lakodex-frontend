import { Component, OnInit, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { I18nService, Logger, User, AuthenticationService, HelperService } from '@app/core';

const log = new Logger('Login');

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChildren('.account-form .form-control') updateInputs: any;

  user: User = {} as User;

  // update form variables
  updateForm: FormGroup;
  error: string;
  error_messages: Array<string>;
  update_success: boolean;
  isLoading = false;

  // password form variables
  passwordForm: FormGroup;
  error_pass: string;
  error_pass_messages: Array<string>;
  pass_success: boolean;
  isLoading2 = false;

  isLoadingPassword = false;
  has_password: boolean;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private i18nService: I18nService,
    private helperService: HelperService,
    private formBuilder: FormBuilder
  ) {
    this.createUpdateForm();
    this.createPasswordForm();
  }




  ngOnInit() {
    this.isLoadingPassword = true;
    const credentials = this.authService.credentials;
    if (credentials) {
      Object.assign(this.user, credentials.user);
      this.updateForm.patchValue(this.user);
    }

    this.authService.checkPassword().subscribe(
      result => {
        this.has_password = result;
        this.isLoadingPassword = false;
      }
    );

  }



  /**
   * Handle user update form
   */
  public updateUserDetails() {
    this.isLoading = true;
    this.update_success = false;
    this.updateUser(this.updateForm.value);

    this.authService.update(this.user).subscribe(
      updatedUser => {
        this.updateForm.markAsDirty();
        this.error = null;
        this.error_messages = [];
        this.update_success = true;
        this.isLoading = false;
        this.updateUser(updatedUser);
        this.router.navigate(['/account-settings'], { replaceUrl: true });
      },
      error => {
        this.isLoading = false;
        log.debug(`Update User error: ${error.error.detail}`);
        this.error = error.error.errors;
        this.error_messages = this.helperService.extractErrorMessages(this.error);
      }
    );
  }



  /**
   * Update current user variable
   * @param values: Form values
   */
  private updateUser(values: User) {
    Object.assign(this.user, values);
  }



  /**
   * Handle password change form
   */
  public newPassword() {
    this.error_pass_messages = [];
    this.error_pass = null;
    this.pass_success = false;
    this.isLoading2 = true;
    this.authService.updatePassword(this.passwordForm.value).subscribe(
      (message: any) => {
        this.has_password = true;
        this.pass_success = true;
        this.passwordForm.reset();
        this.isLoading2 = false;
      },
      (error: any) => {
        this.isLoading2 = false;
        this.error_pass = error.error.errors;
        this.error_pass_messages = this.helperService.extractErrorMessages(this.error_pass);
      }
    );
  }



  /**
   * Formbuilder for the Update User Form
   */
  private createUpdateForm() {
    const username_pattern = new RegExp('^[a-z0-9]+([a-z0-9](_|-)[a-z0-9])*[a-z0-9]+$');

    this.updateForm = this.formBuilder.group({
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(username_pattern)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]]
    });
  }




  /**
   * Formbuilder for the New Password form
   */
  private createPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      new_password1: ['', [Validators.required, Validators.minLength(8)]],
      new_password2: ['', [Validators.required, Validators.minLength(8)]],
    }, {validator: this.helperService.checkIfMatchingPasswords('new_password1', 'new_password2')});
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
}
