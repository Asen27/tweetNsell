import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
// import { DataManagement } from './services/dataManagement';
// import { StorageService } from './services/storageService';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.scss']
  })
export class AppComponent {
  // public loggedUser;
  // public isUserAdmin: boolean;

  constructor(
    private router: Router,
    // public storageService: StorageService,
    private cookieService: CookieService,
    private translateService: TranslateService,
    // public dm: DataManagement
  ) {

/*
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.cookieService.set('lang', event.lang);
        this.translateService.use(event.lang);
    });
    */

    this.translateService.setDefaultLang('en');
    if (this.cookieService.check('lang')) {
      const language = this.cookieService.get('lang');
      this.translateService.use(language);
    } else {
      this.translateService.use('en');
    }
  }

}


