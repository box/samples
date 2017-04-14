import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

import { WelcomeViewComponent } from './components/welcome-view/welcome-view.component';
import { UserViewComponent } from './components/user-view/user-view.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { CallbackComponent } from './components/callback/callback.component';
import { BoxExplorerComponent } from "./components/box-explorer/box-explorer.component";
import { FileDetailViewComponent } from "./components/file-detail-view/file-detail-view.component";
const routes: Routes = [
  {
    path: '',
    children: [],
    component: WelcomeViewComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
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
