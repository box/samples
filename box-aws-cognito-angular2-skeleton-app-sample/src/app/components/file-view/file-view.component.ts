import { Component, OnInit, Input } from '@angular/core';
import { BoxFolder } from "../../models/box/box-folder.model";
import { BoxFile } from "../../models/box/box-file.model";
import { FileUploader } from 'ng2-file-upload';
import { BoxHttp } from "../../services/box/box-client.service";

@Component({
  selector: 'box-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css']
})
export class FileViewComponent implements OnInit {

  @Input()
  parentFolder: BoxFolder;

  @Input()
  files: Array<BoxFile> = [];

  constructor(private boxClientService: BoxHttp) { }

  ngOnInit() {
    // this.boxClientService.getAccessToken()
    // .subscribe(token => {
    //   console.log("Hey! A token!");
    //   console.log(token);

    // })
  }

  onFileUploaded(newFile: BoxFile) {
    console.log("Caught response event...");
    this.files.push(newFile)
  }



}
