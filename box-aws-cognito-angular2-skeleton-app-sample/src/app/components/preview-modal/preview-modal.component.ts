import { Component, Input, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeAction } from 'angular2-materialize';
import { BoxHttp } from "../../services/box/box-client.service";
import { BoxFile } from "../../models/box/box-file.model";

declare var Box: any;

@Component({
    selector: 'box-preview-modal',
    templateUrl: './preview-modal.component.html',
    styleUrls: ['./preview-modal.component.css']
})
export class PreviewModalComponent {

    @Input()
    file: BoxFile

    modalActions = new EventEmitter<string | MaterializeAction>();

    constructor(private boxClientService: BoxHttp) {
    }

    openModal() {
        this.modalActions.emit({ action: "modal", params: ['open'] });
        let boxPreview = new Box.Preview();
        let fileId = this.file.id;
        this.boxClientService.getAccessToken()
            .subscribe(token => {
                console.log(`Showing preview for ${fileId}`);
                boxPreview.show(fileId, token.accessToken, {
                    container: `#boxPreview${fileId}`,
                    logoUrl: 'https://s-media-cache-ak0.pinimg.com/736x/a3/5d/a1/a35da1fb04988aa038974035501df5a0.jpg',
                    showDownload: true,
                    showAnnotations: true
                });
            });
    }

    closeModal() {
        this.modalActions.emit({ action: "modal", params: ['close'] });
    }

}