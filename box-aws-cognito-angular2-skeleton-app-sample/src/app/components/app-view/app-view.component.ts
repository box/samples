import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'box-root',
  templateUrl: './app-view.component.html',
  styleUrls: ['./app-view.component.css']
})

export class AppViewComponent {

  constructor(private auth: AuthService) {
  }

  private checkAuthentication() {
    Observable.fromPromise(this.auth.isAuthenticated())
      .map(isAuthed => {
        return isAuthed;
      });
  }


};
