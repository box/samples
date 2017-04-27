import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from '../../config/auth/auth.config';
import { JwtHelper } from 'angular2-jwt';
import { tokenNotExpired } from 'angular2-jwt';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import { BOX_CONFIG } from '../../config/box/box.config';
import { BoxHttp } from "../box/box-client.service";

// Avoid name not found warnings
declare var auth0: any;

const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'auth_access_token';
const AUTH_ID_TOKEN_STORAGE_KEY = 'auth_id_token';
const AUTH_PROFILE_STORAGE_KEY = 'auth_profile';
const AUTH_USER_ID_STORAGE_KEY = 'auth_user_id';
const AUTH_REDIRECT_URL = 'auth_redirect_url';

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientID
  });

  userProfile: any;

  constructor(public router: Router) {
  }

  public login(): void {
    this.auth0.authorize({
      audience: 'urn:box-platform-api',
      scope: 'openid name email get:token',
      responseType: 'token id_token',
      redirectUri: window.location.href
    });
  }

  public getUserId() {
    let userId = localStorage.getItem(AUTH_USER_ID_STORAGE_KEY);
    return userId;
  }

  // Call this method in app.component
  // if using path-based routing
  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (err) {
        alert(`Error: ${err.errorDescription}`)
      }
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);

        this.router.events
          .filter(event => event.url === '/')
          .subscribe(() => {
            let redirectUrl: string = localStorage.getItem(AUTH_REDIRECT_URL);
            if (redirectUrl != undefined) {
              this.router.navigate([redirectUrl]);
              localStorage.removeItem(AUTH_REDIRECT_URL);
            } else {
              this.router.navigate(['explorer']);
            }
          });
      } else if (authResult && authResult.error) {
        alert(`Error: ${authResult.error}`);
      }
    });
  }

  private setSession(authResult): void {
    localStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, authResult.accessToken);
    localStorage.setItem(AUTH_ID_TOKEN_STORAGE_KEY, authResult.idToken);
    localStorage.setItem(AUTH_USER_ID_STORAGE_KEY, authResult.idTokenPayload.sub);
    console.log(authResult);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_ID_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_ID_STORAGE_KEY);
    localStorage.removeItem(AUTH_REDIRECT_URL);
    localStorage.removeItem(`${BOX_CONFIG.boxTokenStorageKey}.${this.getUserId()}`);
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(jwt?: string): boolean {
    // Check whether the current time is past the 
    // access token's expiry time
    const token: string = jwt || this.retrieveIdToken();
    const jwtHelper = new JwtHelper();
    return token !== null && !jwtHelper.isTokenExpired(token);
  }

  public retrieveIdToken() {
    return localStorage.getItem(AUTH_ID_TOKEN_STORAGE_KEY);
  }

  public retrieveAccessToken() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  }

  public isAdmin() {
    return this.userProfile && this.userProfile.app_metadata
      && this.userProfile.app_metadata.roles
      && this.userProfile.app_metadata.roles.indexOf('admin') > -1;
  }

}
