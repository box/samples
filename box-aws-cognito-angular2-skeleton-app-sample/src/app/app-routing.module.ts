import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

import { WelcomeViewComponent } from './components/welcome-view/welcome-view.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { BoxExplorerComponent } from "./components/box-explorer/box-explorer.component";
import { LoginComponent } from "./components/auth/login/login.component";
import { RegisterComponent } from "./components/auth/register/registration.component";
import { RegistrationConfirmationComponent } from "./components/auth/confirm/confirmRegistration.component";
import { ResendCodeComponent } from "./components/auth/resend/resendCode.component";
import { ForgotPassword2Component, ForgotPasswordStep1Component } from "./components/auth/forgot/forgotPassword.component";
import { FileDetailViewComponent } from "./components/file-detail-view/file-detail-view.component";

const routes: Routes = [
  {
    path: '',
    children: [],
    component: WelcomeViewComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'confirmRegistration/:username',
    component: RegistrationConfirmationComponent
  },
  {
    path: 'resendCode',
    component: ResendCodeComponent
  },
  {
    path: 'forgotPassword/:email',
    component: ForgotPassword2Component
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordStep1Component
  },
  {
    path: 'explorer',
    component: BoxExplorerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorer/folder/',
    component: BoxExplorerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorer/folder/:id',
    component: BoxExplorerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorer/file/:id',
    component: FileDetailViewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
