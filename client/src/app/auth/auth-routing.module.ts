import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth/signin', pathMatch: 'full' },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'signin',
    component: SigninComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
