import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '@app/core';
import { SettingsLayoutComponent } from './layout/settings-layout.component';
import { SettingsComponent } from '@app/features/settings/settings.component';
import { SettingsProfileComponent } from './profile/settings-profile.component';
import { AuthenticationGuard } from '@app/core/authentication/authentication.guard';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: SettingsLayoutComponent,
      children: [
        {
          path: 'account-settings',
          component: SettingsComponent,
          data: { title: extract('Account Settings') },
        },
        {
          path: 'profile-settings',
          component: SettingsProfileComponent,
          data: { title: extract('Profile - Account Settings') },
        },
      ],
      canActivate: [AuthenticationGuard],
      data: { reuse: true }
    },
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SettingsRoutingModule { }
