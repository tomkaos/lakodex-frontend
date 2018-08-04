import './rxjs-imports';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Ng2Webstorage } from 'ngx-webstorage';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@env/environment';

import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'angular-6-social-login';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeModule } from '@app/features/home/home.module';
import { LoginModule } from '@app/features/login/login.module';
import { SignupModule } from '@app/features/signup/signup.module';
import { SettingsModule } from '@app/features/settings/settings.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

export function getAuthServiceConfigs() {
  const config = new AuthServiceConfig(
      [
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider(environment.facebook_id)
        },
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(environment.google_id)
        },
      ]
  );
  return config;
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    Ng2Webstorage.forRoot({ prefix: 'ldx', separator: '-' }),
    TranslateModule.forRoot(),
    NgbModule.forRoot(),
    CoreModule,
    SharedModule,
    HomeModule,
    LoginModule,
    SignupModule,
    SettingsModule,
    SocialLoginModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
