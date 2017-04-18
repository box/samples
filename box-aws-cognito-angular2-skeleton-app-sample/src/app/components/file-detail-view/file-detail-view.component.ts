import { Component, OnInit } from '@angular/core';
import { MaterializeAction } from 'angular2-materialize';
import { BoxHttp } from "../../services/box/box-client.service";
import { BoxFile } from "../../models/box/box-file.model";
import { ActivatedRoute, Params } from "@angular/router";
import { BoxFileService } from "../../services/box/box-file-service";


@Component({
    selector: 'box-file-detail-view',
    templateUrl: './file-detail-view.component.html',
    styleUrls: ['./file-detail-view.component.css']
})
export class FileDetailViewComponent implements OnInit {
    isLoading: boolean;
    currentFile: BoxFile
    createdByUserName: String
    modifiedByUserName: String
    ownedByUserName: String
    parentFolderName: String
    parentFolderId: String

    constructor(private route: ActivatedRoute, private boxFileService: BoxFileService) {
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.route.params
            .switchMap((params: Params) => {
                let id = params['id'];
                console.log(id);
                return this.boxFileService.get(id)
            })
            .subscribe(fileInfo => {
                this.currentFile = fileInfo;
                this.createdByUserName = fileInfo.created_by.name || "";
                this.modifiedByUserName = fileInfo.modified_by.name || "";
                this.ownedByUserName = fileInfo.owned_by.name || "";
                this.parentFolderName = fileInfo.parent.name || "";
                this.parentFolderId = fileInfo.parent.id || "0";
                this.isLoading = false;
            });
    }

}