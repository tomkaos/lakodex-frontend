import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { User } from '@app/core';
import { environment } from '@env/environment';



export interface Credentials {
  user: any;
  token: string;
}

export interface LoginContext {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupContext {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface SocialAccount {
  id: number;
  date_joined: string;
  last_login: string;
  provider: string;
  uid: string;
  image: string;
}

export interface ConnectedAccounts  {
  count: number;
  results?: SocialAccount[];
}

const credentialsKey = environment.credentialsKey;

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService implements OnInit {

  public _credentials: Credentials | null;
  private _supported_social_accounts: Array<string> = [
    'facebook',
    'google'
  ];


  constructor(
    private _http: HttpClient,
    private router: Router
  ) {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    } else {
      this.setCredentials();
    }
  }


  ngOnInit() {
/*     if (savedCredentials) {
      const parsedCredentials = JSON.parse(savedCredentials);
      this.verifyToken(parsedCredentials).subscribe(
        (succ: any) => {
          // tokenverify.unsubscribe();
          console.log('Auth:',succ);
          this._credentials = parsedCredentials;
        },
        (error: any) => {
          // tokenverify.unsubscribe();
          console.log('Auth:',error);
          this.destroyCredentials();
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      );

    } */
  }


  /**
   * Verify saved token with API Server
   */
  public verifyToken(credentials: Credentials): Observable<any> {
    return this._http.post('/user/token-verify/', {'token': (<any>credentials).token })
      .pipe(
        map(
          success => console.log(success),
          (error: any) => console.log(error)
        )
      );
  }



  /**
   * Authenticates the user.
   * @param {LoginContext} context The login parameters.
   * @return {Observable<Credentials>} The user credentials.
   */
  public login(context: LoginContext): Observable<Credentials> {
    return this._http.post<any>('/user/login/', context)
      .pipe(
        map( (res: Credentials) => {
          console.log(res);
          const data = {
            user: res.user,
            token: res.token
          };
          this.setCredentials(data, context.remember);
          return data;
        }));
  }




  /**
   * Register the user.
   * @param {LoginContext} context The login parameters.
   * @return {Observable<Credentials>} The user credentials.
   */
  public signup(context: SignupContext): Observable<Credentials> {
    return this._http.post('/user/signup/', context)
      .pipe(
        map( (res: Credentials) => {
          const data = {
            'user': res.user,
            'token': res.token
          };
          this.setCredentials(data, true);
          return data;
        }
      ));
  }



  /**
   * Send access token from facebook to API to get back the JWT token
   * @param apiurl: string (Example: /user/facebook)
   * @param token: string
   */
  public socialSendToAPI(apiurl: string , token: string): Observable<Credentials> {
    return this._http.post(apiurl, { access_token: token })
      .pipe(
        map( (success: Credentials) => {
          const data = {
            'token': success.token,
            'user': success.user
          };
          this.setCredentials(data, true);
          return data;
        },
        (error: any) => console.log(error))
      );
  }




  /**
   * Logs out the user and clear credentials.
   * @return {Observable<boolean>} True if the user was logged out successfully.
   */
  public logout(): Observable<any> {
    return this._http.post('/user/logout/', this._credentials)
      .pipe(
        map(
          success => {
            this.setCredentials();
            return of(true);
          }
        )
      );
  }




  /**
   * Checks is the user is authenticated.
   * @return {boolean} True if the user is authenticated.
   */
  public isAuthenticated(): boolean {
    return !!this.credentials;
  }



  /**
   * Gets the user credentials.
   * @return {Credentials} The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }



  /**
   * Gets the current user object
   */
  get current_user(): Object | null {
    return this._credentials.user;
  }


  /**
   * Gets the curren user's image url
   */
  get user_image_url(): string | null {
    return this._credentials.user.profile.image || '';
  }


  /**
   * Update user basic details
   * @param user: <User>
   */
  public update(user: User): Observable<User> {
    return this._http.put('/user/', JSON.stringify(user) )
      .pipe(
        map( (data: User) => {
          this._credentials.user = data;
          this.setCredentials(this._credentials, true);
          return data;
        }
      ));
  }


  /**
   * Check is current user's have password
   */
  public checkPassword(): Observable<boolean> {
    return this._http.get('/user/password/check/')
      .pipe(
        map( (res: any) => {
          // console.log(res);
          if (res === 'true') {
            return true;
          }
          return false;
        })
      );
  }



  /**
   * Change user password
   * @param new_data: JSON string of new password
   */
  public updatePassword(new_data: any): Observable<any> {
    return this._http.post('/user/password/change/', JSON.stringify(new_data));
  }



  /**
   * Returns the connected SOCIAL accounts to current user
   */
  public getConnectedAccounts(): Observable<ConnectedAccounts> {
    return this._http.get('/user/socialaccounts/')
      .pipe(
        map(
          (res: ConnectedAccounts) => {
            const data = {
              count: res.count,
              accounts: res.results
            };
            return data;
          }
        )
      );
  }

  /**
   * Disconnect a social account from the current user
   * @param id: number - SocialAccount ID
   */
  public disconnectAccount(id: number): Observable<any> {
    const url = '/user/socialaccounts/' + id + '/disconnect/';
    return this._http.post(url, {user: this._credentials.user} )
      .pipe(
        map(
          (res: any) => {
            return res;
          }
        )
      );
  }


  /**
   * Connect a social account to the current user based ongiven provider and access_token
   * @param provider: string (Example: facebook, google)
   * @param access_token: string - Access token from Provider
   */
  public connectAccount(provider: string, access_token: string): Observable<any> {
    const url = '/user/' + provider + '/connect/';
    return this._http.post(url, { access_token: access_token })
      .pipe(
        map(
          (res: any) => {
            return res;
          }
        )
      );
  }



  /**
   * Returns the supported Social Account Providers
   */
  public getSupportedSocialAccounts() {
    return this._supported_social_accounts;
  }


  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param {Credentials=} credentials The user credentials.
   * @param {boolean=} remember True to remember credentials across sessions.
   */
  public setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }

}
