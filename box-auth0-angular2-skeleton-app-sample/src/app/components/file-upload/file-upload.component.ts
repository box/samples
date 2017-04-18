import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from "ng2-file-upload";
import { BoxHttp } from "../../services/box/box-client.service";
import { BoxFolder } from "../../models/box/box-folder.model";
import { BoxFile } from "../../models/box/box-file.model";
import { BoxItemCollection } from "../../models/box/box-item-collection.model";

@Component({
  selector: 'box-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input()
  currentFolder: BoxFolder;

  uploader: FileUploader = new FileUploader({ url: 'https://upload.box.com/api/2.0/files/content' });

  @Output()
  onFileUploaded = new EventEmitter<BoxFile>();

  constructor(private boxClientService: BoxHttp) { }

  ngOnInit() {
  }

  private prepareUploader(formData) {
    this.uploader.onBuildItemForm = (item, form) => {
      for (let key in formData) {
        form.append(key, formData[key]);
      }
    }
  }

  public uploadFiles(): void {
    console.log("Clicked upload files");
    this.boxClientService.getAccessToken()
      .subscribe(token => {
        console.log("running token auth...");
        this.uploader.authToken = `${this.boxClientService.boxConfig.headerPrefix}${token.access_token}`;
        this.prepareUploader({ parent_id: this.currentFolder.id });
        console.log("set new formdata");
        this.uploader.onBeforeUploadItem = (item) => {
          item.withCredentials = false;
        }
        this.uploader.uploadAll();
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          console.log("Response:");
          console.log(response);
          console.log("Item:");
          console.log(item);
          try {
            let fileCollection = JSON.parse(response) as BoxItemCollection;
            this.onFileUploaded.emit(fileCollection.entries[0] as BoxFile);
          } catch (e) {

          }
        }
        this.uploader.onCompleteAll = () => {
          setTimeout(() => {
            this.uploader.clearQueue();
          }, 2000)
        }
      });
  }

}
