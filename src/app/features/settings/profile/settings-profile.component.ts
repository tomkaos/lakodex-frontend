import { Component, OnInit } from '@angular/core';

import {
  AuthService as SocialAuthService,
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angular-6-social-login';

import { AuthenticationService, User, HelperService } from '@app/core';

export interface SocialAccount {
  id: number;
  date_joined: string;
  last_login: string;
  provider: string;
  uid: string;
  image: string;
}

export interface ConnectedAccounts {
  count: number;
  accounts?: Array<SocialAccount>;
}

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.scss']
})
export class SettingsProfileComponent implements OnInit {

  user: User = {} as User;

  connectedAccounts: ConnectedAccounts | null;
  supportedAccounts: Array<string> = [];
  isLoadingAccounts = false;

  disconnectError: '';
  disconnectErrorMessages: Array<string>;

  constructor(
    private _auth: AuthenticationService,
    private socialAuthService: SocialAuthService,
    private helperService: HelperService
  ) {
    this.supportedAccounts = this._auth.getSupportedSocialAccounts();
    this.loadConnectedAccounts();
  }


  /**
   * Set supported social account providers
   * Get and load connected social accounts
   */
  ngOnInit() {
    const credentials = this._auth.credentials;
    if (credentials) {
      Object.assign(this.user, credentials.user);
    }
  }


  /**
   * Get the Acces token from front-end social JS and pass to authservice to get the user back
   * Connect a social account to the current user
   * @param provider: string (Example: facebook, google)
   */
  public connectAccount(provider: string) {
    this.isLoadingAccounts = true;
    let socialPlatformProvider;

    if (provider === 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (provider === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        this._auth.connectAccount(provider, userData.token).subscribe(
          (data: any) => {
            this.isLoadingAccounts = false;
            this.loadConnectedAccounts();
          },
          error => this.isLoadingAccounts = false
        );
      }
    );
  }


  /**
   * Disconnect social account from the current user
   * @param provider: string (Example: facebook, google)
   */
  public disconnectAccount(provider: string) {
    this.isLoadingAccounts = true;
    this.disconnectError = null;
    this.disconnectErrorMessages = [];
    const accounts = this.connectedAccounts.accounts;
    const account = accounts.filter(obj => obj.provider === provider);
    if (account) {
      const id = account[0].id;
      this._auth.disconnectAccount(id).subscribe(
        (data: any) => {
          this.isLoadingAccounts = false;
          this.loadConnectedAccounts();
          // this.router.navigate(['/'], { replaceUrl: true });
        },
        error => {
          this.disconnectError = error.error.errors;
          this.disconnectErrorMessages = this.helperService.extractErrorMessages(this.disconnectError);
          this.isLoadingAccounts = false;
        }
      );
    }
  }


  /*
   * Get and load the current social-connected providers
   */
  private loadConnectedAccounts() {
    this._auth.getConnectedAccounts().subscribe(
      (data: ConnectedAccounts) => {
        this.connectedAccounts = data;
      }
    );
  }



  /**
   * Conditional tag helper for checking that the current user is connected to a Provider
   * @param provider: string (Example: facebook, google)
   */
  public isConnected(provider: string) {
    for (let a = 0; a < this.connectedAccounts.count; a++) {
      const account = this.connectedAccounts.accounts[a];

      if (account.provider === provider) {
        return true;
      }
    }
    return false;
  }


  /**
   * Get profile image url from social account
   * @param provider: string (Example: facebook, google)
   */
  public avatar_url(provider: string) {
    const obj = this.connectedAccounts.accounts.find(x => x.provider === provider);
    if (obj) {
      return obj.image;
    }
    return '';
  }



  /**
   * Set user avatar image
   * @param provider: string (Example: facebook, google)
   */
  public setImage(provider: string) {
    const image = this.avatar_url(provider);
    if (image !== '') {
      const image_url = this.avatar_url(provider);
      this.user.profile.image = image_url;
      // console.log(this.user);
      this._auth.update(this.user).subscribe(
        (updatedUser: User) => {
          // this._auth._credentials.user = updatedUser;
          // console.log(updatedUser);
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

}
