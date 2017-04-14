import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoxFolderService } from "../../services/box/box-folder-service";
import { BoxFolder } from "../../models/box/box-folder.model";
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BoxCreateFolder } from "../../models/box/box-create-folder.model";
import { BoxItem } from "../../models/box/box-item.model";

@Component({
  selector: 'box-add-new-folder',
  templateUrl: './add-new-folder.component.html',
  styleUrls: ['./add-new-folder.component.css']
})
export class AddNewFolderComponent implements OnInit {

  @Input()
  parentFolder: BoxFolder;
  addNewFolderForm: FormGroup;

  @Output()
  onFolderCreated = new EventEmitter<BoxFolder>();

  constructor(private boxFolderService: BoxFolderService, private fb: FormBuilder) {
    this.addNewFolderForm = this.fb.group({
      folderName: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log("Add folder parent...");
    console.log(this.parentFolder);
  }

  public onCreateFolderSubmit() {
    console.log("Found name...");
    console.log(this.addNewFolderForm.value.folderName);
    let parent = new BoxItem();
    parent.id = this.parentFolder.id;
    let createFolder = new BoxCreateFolder(parent, this.addNewFolderForm.value.folderName);
    this.boxFolderService.create(createFolder)
      .subscribe(createdFolder => {
        this.onFolderCreated.emit(createdFolder);
      })
  }

}
