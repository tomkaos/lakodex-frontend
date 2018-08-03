import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { LoginComponent } from './login.component';
import { RestrictLoggedInGuard } from '@app/core/authentication/restrict-loggedin.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: extract('Login') },
    canActivate: [RestrictLoggedInGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class LoginRoutingModule { }
