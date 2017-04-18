import { Injectable } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/mergeMap";
import 'rxjs/add/operator/toPromise';
import { BoxHttp } from './box-client.service';
import { BoxFile } from "../../models/box/box-file.model";

@Injectable()
export class BoxFileService {
    baseFolderUrl: string = '/files';

    constructor(private boxClient: BoxHttp) {
    }

    public get(id: string, options?: RequestOptionsArgs): Observable<BoxFile> {
        let url = `${this.baseFolderUrl}/${id}`;
        return this.boxClient.get(url, options)
            .map(result => {
                console.log("Calling get file...");
                return result.json() as BoxFile;
            });
    }
}