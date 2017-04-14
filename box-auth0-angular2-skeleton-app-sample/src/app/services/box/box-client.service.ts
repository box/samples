import { Injectable, Provider } from '@angular/core';
import { Http, Headers, Request, Response, RequestOptions, RequestOptionsArgs, RequestMethod } from '@angular/http';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/mergeMap";
import { AuthService } from "../auth/auth.service";
import { BOX_CONFIG } from "../../config/box/box.config";

export class BoxConfig {
    headerName: string;
    headerPrefix: string;
    baseApiUrl: string;
    refreshTokenFunction: () => Observable<Response>;
    globalHeaders?: Array<Object>;
    boxTokenCache?: IBoxTokenCache;
    constructor(
        refreshTokenFunction,
        boxTokenCache: IBoxTokenCache = null,
        globalHeaders: Array<Object> = null,
        headerName: string = 'Authorization',
        headerPrefix: string = 'Bearer ',
        baseApiUrl: string = 'https://api.box.com/2.0') {

        this.headerName = headerName;
        this.headerPrefix = headerPrefix;
        this.baseApiUrl = baseApiUrl;
        this.refreshTokenFunction = refreshTokenFunction;
        this.globalHeaders = globalHeaders;
        this.boxTokenCache = boxTokenCache;
    }
}

export interface IBoxToken {
    access_token: string;
    expires_at?: Number
    expires_in?: Number
}


export interface IBoxTokenCache {
    boxTokenKey: string;
    getToken: () => Observable<IBoxToken>;
    setToken: (IBoxToken) => boolean;
}

@Injectable()
export class BoxHttp {
    boxConfig: BoxConfig;

    constructor(_boxConfig: BoxConfig, private _http: Http, private defOpts?: RequestOptions) {
        this.boxConfig = _boxConfig;
    }

    private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
        let newOptions = defaultOpts || new RequestOptions();
        newOptions = newOptions.merge(new RequestOptions(providedOpts));
        return newOptions;
    }

    private requestWithToken(req: Request, token: IBoxToken): Observable<Response> {
        if (token.access_token === '') {
            return new Observable<Response>((obs: any) => {
                obs.error(new Error('Cannot retrieve access token.'));
            });
        } else {
            req.headers.set(this.boxConfig.headerName, this.boxConfig.headerPrefix + token.access_token);
        }

        return this._http.request(req);
    }


    private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
        console.log("Handling options...");
        let options = new RequestOptions(requestArgs);
        if (additionalOptions) {
            options = options.merge(additionalOptions);
        }
        if (this.boxConfig.boxTokenCache) {
            return this.boxConfig.boxTokenCache.getToken()
                .mergeMap((token) => {
                    return this.requestWithToken(new Request(this.mergeOptions(options, this.defOpts)), token);
                })
        } else {
            return this.boxConfig.refreshTokenFunction()
                .mergeMap((token) => {
                    console.log("Refreshing token...");
                    console.log(token.json());
                    return this.requestWithToken(new Request(this.mergeOptions(options, this.defOpts)), token.json());
                });
        }
    }

    private constructUrl(url: string) {
        return `${this.boxConfig.baseApiUrl}${url}`;
    }

    public getAccessToken(): Observable<IBoxToken> {
        if (this.boxConfig.boxTokenCache) {
            return this.boxConfig.boxTokenCache.getToken()
                .map((token) => {
                    return token;
                })
        } else {
            return this.boxConfig.refreshTokenFunction()
                .map((token) => {
                    console.log("Refreshing token...");
                    console.log(token.json());
                    return token.json() as IBoxToken;
                });
        }
    }

    public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Get, url: this.constructUrl(url) }, options);
    }

    public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Post, url: this.constructUrl(url) }, options);
    }

    public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Put, url: this.constructUrl(url) }, options);
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Delete, url: this.constructUrl(url) }, options);
    }

    public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Patch, url: this.constructUrl(url) }, options);
    }

    public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Head, url: this.constructUrl(url) }, options);
    }

    public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Options, url: this.constructUrl(url) }, options);
    }
}

export function defaultFactory(http: Http, auth: AuthService, options: RequestOptions) {

    const EXPIRES_IN = BOX_CONFIG.tokenExpirationPeriod;

    const DEFAULT_REFRESH_TOKEN_FUNCTION = () => {
        let token = auth.retrieveIdToken();
        return http.post(BOX_CONFIG.refreshTokenUrl, { token });
    };

    const DEFAULT_BOX_TOKEN_CACHE: IBoxTokenCache = {
        boxTokenKey: BOX_CONFIG.boxTokenStorageKey,
        getToken(): Observable<IBoxToken> {
            try {
                let boxToken = JSON.parse(localStorage.getItem(this.boxTokenKey)) as IBoxToken;
                if (!boxToken || !boxToken.access_token || boxToken.expires_at.valueOf() < Date.now().valueOf()) {
                    return DEFAULT_REFRESH_TOKEN_FUNCTION()
                        .mergeMap((token) => {
                            let newToken = token.json();
                            newToken.expires_in = EXPIRES_IN;
                            newToken.expires_at = new Date(Date.now() + EXPIRES_IN).getTime();
                            this.setToken(newToken);
                            return new Observable<IBoxToken>((obs: any) => {
                                obs.next(newToken);
                            });
                        });
                }
                return new Observable<IBoxToken>((obs: any) => {
                    obs.next(boxToken);
                });
            } catch (e) {
                console.log(e);
            }
        },

        setToken(boxToken: IBoxToken): boolean {
            try {
                localStorage.setItem(this.boxTokenKey, JSON.stringify(boxToken));
                return true
            } catch (e) {
                console.log(e);
                return false;
            }
        }
    }

    const DEFAULT_BOX_CONFIG = new BoxConfig(DEFAULT_REFRESH_TOKEN_FUNCTION, DEFAULT_BOX_TOKEN_CACHE);

    return new BoxHttp(DEFAULT_BOX_CONFIG, http, options);
}

export const BOX_CLIENT_PROVIDER: Provider[] = [
    {
        provide: BoxHttp,
        deps: [Http, AuthService, RequestOptions],
        useFactory: defaultFactory
    }
];