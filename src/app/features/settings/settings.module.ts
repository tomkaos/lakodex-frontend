import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsProfileComponent } from './profile/settings-profile.component';
import { SettingsLayoutComponent } from './layout/settings-layout.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsRoutingModule
  ],
  declarations: [
    SettingsLayoutComponent,
    SettingsComponent,
    SettingsProfileComponent
  ],
  providers: []
})
export class SettingsModule { }
