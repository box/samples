import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.auth.isAuthenticated()
            .then(authenticated => {
                if (authenticated) {
                    return true;
                } else {
                    localStorage.setItem('auth_redirect_url', state.url);
                    this.router.navigate(['/login']);
                    return false;
                }
            });
    }
}
