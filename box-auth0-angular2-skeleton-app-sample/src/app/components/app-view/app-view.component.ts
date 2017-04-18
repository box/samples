import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'box-root',
  templateUrl: './app-view.component.html',
  styleUrls: ['./app-view.component.css']
})

export class AppViewComponent {
  title = 'box works!';
  constructor(private auth: AuthService) { 
    auth.handleAuthentication();
  }
};



// import { Component } from '@angular/core';
// import { BoxHttp } from '../../services/box/box-client.service';

// @Component({
//   selector: 'box-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'box works!';
//   box: BoxHttp;
//   constructor(private _box: BoxHttp) {
//     this.box = _box;
//   }
//   ngOnInit() {
//     this.box
//       .request()
//       .subscribe(result => console.log(result));
//   }
// }
