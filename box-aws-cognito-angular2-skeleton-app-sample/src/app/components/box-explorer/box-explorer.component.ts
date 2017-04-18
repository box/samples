import { Component, OnInit } from '@angular/core';
import { BoxFolderService } from "../../services/box/box-folder-service";
import { ActivatedRoute, Params } from "@angular/router";
import { BoxFolder } from "../../models/box/box-folder.model";
import { BoxFile } from "../../models/box/box-file.model";

@Component({
  selector: 'box-box-explorer',
  templateUrl: './box-explorer.component.html',
  styleUrls: ['./box-explorer.component.css']
})
export class BoxExplorerComponent implements OnInit {
  files: Array<BoxFile>;
  folders: Array<BoxFolder>;
  currentFolder: BoxFolder;
  isLoading: boolean

  constructor(private route: ActivatedRoute, private boxFolderService: BoxFolderService) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params
      .switchMap((params: Params) => {
        let id = params['id'] || '0';
        console.log(id);
        return this.boxFolderService.get(id)
      })
      .subscribe(folder => {
        this.files = [];
        this.folders = [];
        this.currentFolder = folder;
        console.log("Set folder...");
        console.log(folder);
        folder.item_collection.entries.forEach((item) => {
          if (item.type === "folder") {
            this.folders.push(item as BoxFolder);
          } else if (item.type === "file") {
            this.files.push(item as BoxFile);
          }
        });
        this.isLoading = false;
      });
  }

}
