import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/mergeMap";
import 'rxjs/add/operator/toPromise';
import { BoxHttp } from './box-client.service';
import { BoxFolder } from '../../models/box/box-folder.model';
import { BoxCreateFolder } from "../../models/box/box-create-folder.model";

@Injectable()
export class BoxFolderService {
    baseFolderUrl: string = '/folders';

    constructor(private boxClient: BoxHttp) {
    }

    public get(id: string, options?: RequestOptionsArgs): Observable<BoxFolder> {
        let url = `${this.baseFolderUrl}/${id}`;
        return this.boxClient.get(url, options)
            .map(result => {
                console.log("Calling get folder...");
                return result.json() as BoxFolder;
            });
    }

    public create(folder: BoxCreateFolder, options?: RequestOptionsArgs) {
        return this.boxClient.post(this.baseFolderUrl, folder, options)
            .map(result => {
                console.log("Created folder...");
                return result.json() as BoxFolder;
            });
    }
}