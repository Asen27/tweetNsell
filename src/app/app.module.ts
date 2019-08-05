import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import {
    HttpClientModule,
    HttpClient,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ConfigService } from '../config/configService';
import { DataManagement } from './services/dataManagement';
import { RestWS } from './services/restService';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app.routing';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AlertComponent } from './components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, '../assets/i18n/', '.json');
}

@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        HttpClientModule,
        BrowserModule,
        ReactiveFormsModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        AlertComponent
    ],
    providers: [CookieService,
        DataManagement,
        RestWS,
        ConfigService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
],
    bootstrap: [AppComponent]
})
export class AppModule {}

