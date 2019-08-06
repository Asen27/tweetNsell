import { Injectable } from '@angular/core';
import {
    Router,
    CanActivate
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandGuard implements CanActivate {
    constructor(private router: Router, private cookieService: CookieService) {}

    canActivate(
    ): Observable<boolean> | Promise<boolean> | boolean {
        const isUserLogged = this.cookieService.check('token');
        if (isUserLogged) {
        const isUserBrand = JSON.parse(localStorage.getItem('user:logged'))
            .user_profile.is_staff === false;
        if (isUserBrand) {
            // authorised so return true
            return true;
        }
    }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}

