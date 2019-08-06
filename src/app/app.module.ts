import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { HomeRoutingModule } from './components/home/home.routing';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AlertComponent } from './components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoComponent } from './components/home/info/info.component';
import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { IndustryComponent } from './components/home/industry/industry.component';
import { ProfileComponent } from './components/home/profile/profile.component';
import { OpinionComponent } from './components/home/opinion/opinion.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
        HomeRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbDropdownModule,
        NgbModule,
        FormsModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        AlertComponent,
        InfoComponent,
        DashboardComponent,
        IndustryComponent,
        ProfileComponent,
        OpinionComponent
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

