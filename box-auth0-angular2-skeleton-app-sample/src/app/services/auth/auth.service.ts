import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from '../../config/auth/auth.config';
import { JwtHelper } from 'angular2-jwt';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import { BOX_CONFIG } from '../../config/box/box.config';

// Avoid name not found warnings
declare var Auth0Lock: any;

const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'auth_access_token';
const AUTH_ID_TOKEN_STORAGE_KEY = 'auth_id_token';
const AUTH_PROFILE_STORAGE_KEY = 'auth_profile';
const AUTH_REDIRECT_URL = 'auth_redirect_url';

@Injectable()
export class AuthService {

  lock = new Auth0Lock(AUTH_CONFIG.clientID, AUTH_CONFIG.domain, {
    autoclose: true,
    auth: {
      allowedConnections: ['Username-Password-Authentication'],
      redirectUrl: AUTH_CONFIG.callbackUrl,
      responseType: 'token id_token',
      audience: `https://${AUTH_CONFIG.domain}/userinfo`,
      params: {

      }
    }
  });

  userProfile: any;

  constructor(public router: Router) {
    let profile = this.getProfile();
    if (profile) {
      try {
        profile = JSON.parse(profile);
      } catch (e) {
        profile = null;
      }
    }
    this.userProfile = profile;
  }

  public login(): void {
    this.lock.show();
  }

  public getProfile() {
    return localStorage.getItem(AUTH_PROFILE_STORAGE_KEY);
  }

  // Call this method in app.component
  // if using path-based routing
  public handleAuthentication(): void {
    this.lock.on('authenticated', (authResult) => {
      console.log(authResult)
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);

        this.router.events
          .filter(event => event.url === '/callback')
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
    localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, authResult.profile);
    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        // Handle error
        alert(error);
        return;
      }

      localStorage.setItem(AUTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      this.userProfile = profile;
    });
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_ID_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_PROFILE_STORAGE_KEY);
    localStorage.removeItem(AUTH_REDIRECT_URL);
    localStorage.removeItem(BOX_CONFIG.boxTokenStorageKey);

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

  public isAdmin() {
    return this.userProfile && this.userProfile.app_metadata
      && this.userProfile.app_metadata.roles
      && this.userProfile.app_metadata.roles.indexOf('admin') > -1;
  }

}
