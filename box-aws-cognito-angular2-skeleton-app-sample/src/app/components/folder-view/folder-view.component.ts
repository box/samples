import { Component, OnInit, Input } from '@angular/core';
import { BoxFolder } from "../../models/box/box-folder.model";
import { BoxFolderService } from "../../services/box/box-folder-service";
import { Subscription } from "rxjs/Subscription";
import { ActivatedRoute, Params } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { BoxCreateFolder } from "../../models/box/box-create-folder.model";

@Component({
  selector: 'box-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.css']
})
export class FolderViewComponent implements OnInit {
  @Input()
  currentFolder: BoxFolder;
  @Input()
  folders: Array<BoxFolder>;
  isLoading: boolean;

  constructor(private route: ActivatedRoute, private boxFolderService: BoxFolderService) {
  }

  ngOnInit(): void {
    // this.isLoading = true;
    // this.route.params
    //   .switchMap((params: Params) => {
    //     let id = params['id'] || '0';
    //     return this.boxFolderService.get(id)
    //   })
    //   .subscribe(folder => {
    //     this.currentFolder = folder;
    //     this.folders = folder.item_collection.entries.map((item) => {
    //       if (item.type === "folder") {
    //         return item as BoxFolder;
    //       }
    //     });
    //     console.log(this.folders);
    //     this.isLoading = false;
    //   });
  }

  public changeCurrentFolder(id) {
    this.boxFolderService.get(id)
      .subscribe(folder => {
        this.currentFolder = folder;
        this.folders = folder.item_collection.entries.map((item) => {
          if (item.type === "folder") {
            return item as BoxFolder;
          }
        });
        this.isLoading = false;
      });
  }

  onFolderCreated(newFolder: BoxFolder) {
    this.folders.push(newFolder)
  }

}
