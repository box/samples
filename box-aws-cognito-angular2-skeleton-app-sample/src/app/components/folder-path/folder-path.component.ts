import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BoxFolder } from "../../models/box/box-folder.model";

@Component({
  selector: 'box-folder-path',
  templateUrl: './folder-path.component.html',
  styleUrls: ['./folder-path.component.css']
})
export class FolderPathComponent implements OnInit {

  @Input()
  currentFolder: BoxFolder;

  path: Array<{ name: string, id: string }>

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      if (propName === "currentFolder") {
        this.path = this.processPathCollection();
      }
    }
  }

  private processPathCollection() {
    let path = [];
    if (this.currentFolder.path_collection.total_count > 0) {
      this.currentFolder.path_collection.entries.forEach(function (item, index) {
        path[index] = {
          name: item.name,
          id: item.id
        }
      });
    }
    path.push({ name: this.currentFolder.name, id: this.currentFolder.id });
    return path;
  }

}
