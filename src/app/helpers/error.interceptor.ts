import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private translateService: TranslateService) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(err => {
                let error: string;
                if (err.status === 401 || err.status === 403) {
                    error = this.translateService.instant('ERROR.GLOBAL');
                } else if (request.url.endsWith('register/')) {
                    switch (err.status) {
                        case 400:
                            error = this.translateService.instant(
                                'ERROR.REGISTER_1'
                            );
                            break;
                        case 452:
                            error = this.translateService.instant(
                                'ERROR.REGISTER_2'
                            );
                            break;
                        case 453:
                            error = this.translateService.instant(
                                'ERROR.REGISTER_3'
                            );
                            break;
                        case 512:
                            error = this.translateService.instant(
                                'ERROR.REGISTER_4'
                            );
                            break;
                        case 409:
                            error = this.translateService.instant(
                                'ERROR.REGISTER_5'
                            );
                            break;
                        default:
                            error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('login/')) {
                    if (err.status === 400) {
                        error = this.translateService.instant('ERROR.LOGIN');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('opinions/pin/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.PIN_1');
                    } else if (err.status === 409) {
                        error = this.translateService.instant('ERROR.PIN_2');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('opinions/unpin/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.UNPIN_1');
                    } else if (err.status === 409) {
                        error = this.translateService.instant('ERROR.UNPIN_2');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('opinions/delete/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.UNPIN_1');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('opinions/evaluate/') && (!request.url.includes('evaluate/all/'))) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.UNPIN_1');
                    } else if (err.status === 409) {
                        error = this.translateService.instant('ERROR.EVALUATE');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('opinions/load/')) {
                    if (err.status === 429) {
                        error = this.translateService.instant('ERROR.LOAD_1');
                    } else if (err.status === 430) {
                        error = this.translateService.instant('ERROR.LOAD_3');
                     } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('opinions/evaluate/all/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.EVALUATE_ALL');
                     } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('service-industries/delete/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.SERVICE_INDUSTRY_1');
                    } else if (err.status === 412) {
                        error = this.translateService.instant('ERROR.SERVICE_INDUSTRY_2');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('service-industries/create/')) {
                    if (err.status === 412) {
                        error = this.translateService.instant('ERROR.SERVICE_INDUSTRY_3');
                     } else if (err.status === 409) {
                        error = this.translateService.instant('ERROR.SERVICE_INDUSTRY_4');
                     } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('brands/delete/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.BRAND');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('followers/load/')) {
                    if (err.status === 512) {
                        error = this.translateService.instant('ERROR.LOAD_2');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('followers/evaluate/') && (!request.url.includes('evaluate/all/'))) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.EVALUATE_FOLLOWER_1');
                    } else if (err.status === 409) {
                        error = this.translateService.instant('ERROR.EVALUATE_FOLLOWER_2');
                    } else if (err.status === 512) {
                        error = this.translateService.instant('ERROR.EVALUATE_FOLLOWER_3');
                    } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.endsWith('followers/evaluate/all/')) {
                    if (err.status === 404) {
                        error = this.translateService.instant('ERROR.EVALUATE_ALL_2');
                     } else if (err.status === 512) {
                        error = this.translateService.instant('ERROR.EVALUATE_ALL_3');
                     } else {
                        error = this.translateService.instant('ERROR.GENERAL');
                    }
                } else if (request.url.includes('followers/delete/')) {
                        if (err.status === 404) {
                            error = this.translateService.instant('ERROR.EVALUATE_FOLLOWER_1');
                        } else {
                            error = this.translateService.instant('ERROR.GENERAL');
                        }
                } else if (request.url.endsWith('brand/update/')) {
                        if (err.status === 404) {
                            error = this.translateService.instant('ERROR.UPDATE_1');
                         } else if (err.status === 512) {
                            error = this.translateService.instant('ERROR.UPDATE_2');
                         } else {
                            error = this.translateService.instant('ERROR.GENERAL');
                        }
                } else {
                    error = this.translateService.instant('ERROR.GENERAL');
                }
                return throwError(error);
            })
        );
    }
}
