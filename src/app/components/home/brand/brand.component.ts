import { Component, OnInit, ChangeDetectorRef, ViewChild  } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { DataManagement } from '../../../services/dataManagement';
import { Brand } from 'src/app/app.data.model';
import { ConfigService } from './configuration.service';
import { API, APIDefinition, Columns } from 'ngx-easy-table';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrls: ['./brand.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})


export class BrandComponent implements OnInit {
    @ViewChild('brands', { static: true }) table: APIDefinition;
    public columns: Columns[];

    data = [];
    configuration;
    pagination = {
    limit: 10,
    offset: 0,
    count: 0,
  };
    language: string;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private readonly cdr: ChangeDetectorRef,
        private cookieService: CookieService
    ) {
        this.language = this.translateService.currentLang;
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

        this.getBrands(1);

    }

    loadColumnsEn(): void {
        this.columns = [
            { key: 'name', title: 'Name', width: '15%' },
            { key: 'language', title: 'Language', width: '5%'},
            { key: 'location', title: 'Location', width: '15%'},
            { key: 'description', title: 'Description', width: '40%'},
            { key: 'service_industry.name_en', title: 'Industry', width: '15%'},
            { key: '', title: 'Actions', width: '10%' }
        ];
    }

    loadColumnsEs(): void {
        this.columns = [
            { key: 'name', title: 'Nombre', width: '15%' },
            { key: 'language', title: 'Idioma', width: '5%'},
            { key: 'location', title: 'Ubicación', width: '15%'},
            { key: 'description', title: 'Descripción', width: '40%'},
            { key: 'service_industry.name_es', title: 'Industria', width: '15%'},
            { key: '', title: 'Acciones', width: '10%' }
        ];
    }

    eventEmitted($event) {
        this.parseEvent($event);
      }


      private parseEvent(obj: EventObject) {
        if (obj.value.page === undefined ) {
            return;
        } else {
        // this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
        this.pagination.offset = obj.value.page;
        this.pagination = { ...this.pagination };
        const params = this.pagination.offset;
        this.getBrands(params);
        }
    }


    private getBrands(page: Number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.listBrands(page).then((data: any) => {
            this.data = data['results'];
            this.pagination.count =  data.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
          window.scroll(0, 0);
        }).catch(error => {
            this.alertService.error(error);
            window.scroll(0, 0);
        });
    }



    onDeleteEvent(username: string): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        const currentPage = Number(this.table.apiEvent({
            type: API.getPaginationCurrentPage,
          }));
        this.dm.deleteBrand(username).then((data: any) => {
        const numberItems = Number(this.table.apiEvent({type: API.getPaginationTotalItems}));
        this.configuration.isLoading = false;
        if (numberItems % 15 === 1 && currentPage !== 1) {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage - 1});
        } else {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage});
        }
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.BRAND');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });


      }


    }

    interface EventObject {
        event: string;
        value: any;
      }


