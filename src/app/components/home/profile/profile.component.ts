import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { DataManagement } from '../../../services/dataManagement';
import { Brand } from 'src/app/app.data.model';
import { ConfigService } from './configuration.service';
import { Columns } from 'ngx-easy-table';
import { CookieService } from 'ngx-cookie-service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})

export class ProfileComponent implements OnInit {
    public brand: Brand;
    public columns: Columns[];
    public loading = false;
    data = [];
    configuration;
    language: string;
    closeResult;


    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private cookieService: CookieService,
        private modalService: NgbModal,

    ) {

        this.language = this.translateService.currentLang;
        this.configuration = ConfigService.config;

    }

    ngOnInit() {

        if (this.cookieService.get('lang') === 'en' || !(this.cookieService.check('lang'))) {
            this.loadColumnsEn();
        } else {
            this.loadColumnsEs();
        }

        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.language = event.lang;
            if (event.lang === 'en') {
                this.loadColumnsEn();
            } else {
                this.loadColumnsEs();
            }
        });

        this.getUser();
    }

    getUser() {
        this.dm.getUserLogged(this.cookieService.get('token')).then((user) => {
            this.brand = user;
            this.getData();
        }).catch(error => {
        this.brand = null;
        });
    }

    loadColumnsEn(): void {
        this.columns = [
            { key: '', title: '#', width: '5%' },
            { key: 'name', title: 'Brand', width: '20%'},
            { key: '', title: 'Social rating', width: '75%'}
        ];
    }

    loadColumnsEs(): void {
        this.columns = [
            { key: '', title: '#', width: '5%' },
            { key: 'name', title: 'Marca', width: '20%'},
            { key: '', title: 'Rating social', width: '75%'}
        ];
    }

    private getData(): void {
        if (this.brand !== null) {
            if (this.brand.competitors.length > 5) {
                this.data = this.brand.competitors.slice(0, 5);
            } else {
            this.data = this.brand.competitors;
            }
        }
    }

    onUpdateEvent(): void {
        this.alertService.clear();
        this.loading = true;
        this.dm.updateFollower().then((data: any) => {
        this.getUser();
        this.loading = false;
        const message = this.translateService.instant('SUCCESS.UPDATE');
        this.alertService.success(message, false);
        }).catch(error => {
            this.alertService.error(error);
        });

      }

    open(content) {
        this.modalService.open(content).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    }


