import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataManagement } from '../../services/dataManagement';
import { StorageService } from '../../services/storageService';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserProfile, ServiceIndustry, Brand } from '../../app.data.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public loggedUser;
    public isUserAdmin: boolean;
    public pushRightClass: string;
    public isActive: boolean;
    public collapsed: boolean;
    public showMenu: string;

    @Output() collapsedEvent = new EventEmitter<boolean>();

    constructor(
        private router: Router,
        private dm: DataManagement,
        private storageService: StorageService,
        private cookieService: CookieService,
        private translateService: TranslateService
    ) {

        this.storageService.watchStorage().subscribe(user => {
            this.loggedUser = JSON.parse(user);
            if (user != null) {
              this.isUserAdmin = JSON.parse(user).user_profile.is_staff;
            }
          });

          this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });


          if (!this.cookieService.check('token')) {
            this.loggedUser = null;
          } else {
            this.loggedUser = JSON.parse(localStorage.getItem('user:logged'));
            this.isUserAdmin = this.loggedUser.user_profile.is_staff;
          }


    }

    ngOnInit() {
        // this.loggedUser = JSON.parse(localStorage.getItem('user:logged'));
        this.pushRightClass = 'push-right';
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
    }

    logout() {
        this.storageService.removeItem('user:logged');
        this.cookieService.delete('token');
        this.router.navigate(['/login']);
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
    }


    changeLanguage(selectedValue: string) {
        this.cookieService.set('lang', selectedValue);
        this.translateService.use(selectedValue);
      }
}

