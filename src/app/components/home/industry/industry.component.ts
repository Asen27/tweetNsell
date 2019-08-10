import { Component, OnInit, ChangeDetectorRef, ViewChild  } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { DataManagement } from '../../../services/dataManagement';
import { ConfigService } from './configuration.service';
import { API, APIDefinition, Columns } from 'ngx-easy-table';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'app-industry',
    templateUrl: './industry.component.html',
    styleUrls: ['./industry.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})


export class IndustryComponent implements OnInit {
    @ViewChild('service-industries', { static: true }) table: APIDefinition;
    public columns: Columns[];

    data = [];
    configuration;
    name_es = '';
    name_en = '';

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private readonly cdr: ChangeDetectorRef,
        private cookieService: CookieService
    ) {

    }

    ngOnInit() {

        if (this.cookieService.get('lang') === 'en' || !(this.cookieService.check('lang'))) {
            this.loadColumnsEn();
        } else {
            this.loadColumnsEs();
        }

        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            if (event.lang === 'en') {
                this.loadColumnsEn();
            } else {
                this.loadColumnsEs();
            }
        });



        this.getServiceIndustries();

    }

    loadColumnsEn(): void {
        this.columns = [
            { key: 'name_en', title: 'Name (English)', width: '45%' },
            { key: 'name_es', title: 'Name (Spanish)', width: '45%'},
            { key: '', title: 'Delete', width: '10%' }
        ];
    }

    loadColumnsEs(): void {
        this.columns = [
            { key: 'name_en', title: 'Nombre (Inglés)', width: '45%' },
            { key: 'name_es', title: 'Nombre (Español)', width: '45%'},
            { key: '', title: 'Eliminar', width: '10%' }
        ];
    }


    private getServiceIndustries(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.listServiceIndustries().then((data: any) => {
            data['results'].push({'name_en': 'be', 'name_es': ''});
            this.data = data['results'];
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
          window.scroll(0, 0);
        }).catch(error => {
            this.alertService.error(error);
            window.scroll(0, 0);
        });
    }

    onDeleteEvent(name_en: string): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.deleteServiceIndustry(name_en).then((data: any) => {
        this.configuration.isLoading = false;
       // this.cdr.detectChanges();
       this.getServiceIndustries();
        const message = this.translateService.instant('SUCCESS.DELETE_INDUSTRY');
        this.alertService.success(message, false);
        window.scroll(0, 0);
    }).catch(error => {
        this.configuration.isLoading = false;
        this.alertService.error(error);
        window.scroll(0, 0);
    });

    }

    onCreateEvent(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.createServiceIndustry(this.name_en, this.name_es).then((data: any) => {
            this.configuration.isLoading = false;
           // this.cdr.detectChanges();
           this.getServiceIndustries();
            const message = this.translateService.instant('SUCCESS.CREATE_INDUSTRY');
            this.alertService.success(message, false);
            window.scroll(0, 0);
        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });
    }

}

