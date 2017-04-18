import { Component, OnInit } from '@angular/core';
import { BoxFolderService } from '../../services/box/box-folder-service';
import { BoxFolder } from '../../models/box/box-folder.model';

@Component({
  selector: 'box-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css']
})
export class UserViewComponent implements OnInit {
  boxFolderClient: BoxFolderService;
  currentFolder: BoxFolder;

  constructor(private _boxFolderClient: BoxFolderService) {
    this.boxFolderClient = _boxFolderClient;
  }

  ngOnInit() {
    this.boxFolderClient.get('0')
      .subscribe(folder => { 
        console.log(folder);
        this.currentFolder = folder 
      });
  }
}

// import { Component } from '@angular/core';
// import { BoxHttp } from '../../services/box/box-client.service';

// @Component({
//   selector: 'box-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'box works!';


//   ngOnInit() {
//     
//   }
// }