import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private translateService: TranslateService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            let error: string;
            if (request.url.endsWith('register/')) {
               switch (err.status) {
                case 400:
                    error = this.translateService.instant('ERROR.REGISTER_1');
                    break;
                case 452:
                    error = this.translateService.instant('ERROR.REGISTER_2');
                    break;
                case 453:
                    error = this.translateService.instant('ERROR.REGISTER_3');
                    break;
                case 500:
                    error = this.translateService.instant('ERROR.REGISTER_4');
                    break;
                case 409:
                    error = this.translateService.instant('ERROR.REGISTER_5');
                    break;
                default:
                    error = err.statusText;
               }
            } else if (request.url.endsWith('login/')) {
                if (err.status === 400) {
                    error = this.translateService.instant('ERROR.LOGIN');
                } else {
                    error = err.statusText;
                }
             } else {
                error = err.statusText;
            }
            return throwError(error);
        }));
    }
}
