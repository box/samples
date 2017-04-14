import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { MaterializeModule } from 'angular2-materialize';
import { FileUploadModule } from 'ng2-file-upload';

import { Observable } from "rxjs/Observable";
import 'hammerjs';
import "rxjs/add/operator/map";

import { provideAuth, AuthHttp, AuthConfig } from 'angular2-jwt';
import { BoxHttp, BoxConfig, IBoxToken, BOX_CLIENT_PROVIDER } from './services/box/box-client.service';
import { BoxFolderService } from './services/box/box-folder-service';
import { BOX_CONFIG } from './config/box/box.config';
import { AppRoutingModule } from './app-routing.module';
import { AppViewComponent } from './components/app-view/app-view.component';
import { UserViewComponent } from './components/user-view/user-view.component';

import { AuthService } from './services/auth/auth.service';
import { CallbackComponent } from './components/callback/callback.component';
import { WelcomeViewComponent } from './components/welcome-view/welcome-view.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { AddNewFolderComponent } from './components/add-new-folder/add-new-folder.component';
import { FolderPathComponent } from './components/folder-path/folder-path.component';
import { BoxExplorerComponent } from './components/box-explorer/box-explorer.component';
import { FileViewComponent } from './components/file-view/file-view.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { PreviewModalComponent } from './components/preview-modal/preview-modal.component';
import { BoxFileService } from "./services/box/box-file-service";
import { FileDetailViewComponent } from "./components/file-detail-view/file-detail-view.component";

// export function boxClientServiceFactory(http: Http, auth: AuthService) {
//   let refreshTokenFunction = () => {
//     let token = auth.retrieveIdToken();
//     return http.post(BOX_CONFIG.refreshTokenUrl, { token });
//   }
//   let boxConfig = new BoxConfig(refreshTokenFunction);
//   return new BoxHttp(boxConfig, http);
// }

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({}), http, options);
}

@NgModule({
  declarations: [
    AppViewComponent,
    UserViewComponent,
    CallbackComponent,
    WelcomeViewComponent,
    FolderViewComponent,
    AddNewFolderComponent,
    FolderPathComponent,
    BoxExplorerComponent,
    FileViewComponent,
    FileUploadComponent,
    PreviewModalComponent,
    FileDetailViewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    MaterializeModule,
    FileUploadModule
  ],
  providers: [
    BoxFolderService,
    BoxFileService,
    AuthService,
    BOX_CLIENT_PROVIDER,
    // {
    //   provide: BoxHttp,
    //   useFactory: boxClientServiceFactory,
    //   deps: [Http, AuthService]
    // },
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }],
  bootstrap: [AppViewComponent]
})
export class AppModule { }
