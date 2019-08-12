import { Component, OnInit, ChangeDetectorRef, ViewChild  } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { DataManagement } from '../../../services/dataManagement';
import { Brand } from 'src/app/app.data.model';
import { ConfigService } from './configuration.service';
import { API, APIDefinition, Columns } from 'ngx-easy-table';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'app-follower',
    templateUrl: './follower.component.html',
    styleUrls: ['./follower.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})


export class FollowerComponent implements OnInit {
    public brand: Brand;
    public selector = 'all';
    @ViewChild('followers', { static: true }) table: APIDefinition;
    public columns: Columns[];

    data = [];
    configuration;
    pagination = {
    limit: 10,
    offset: 0,
    count: 0,
  };
   closeResult: string;
   selected: string;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private readonly cdr: ChangeDetectorRef,
        private modalService: NgbModal,
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

        this.getBrand();
        this.getFollowers(1);

    }

    getBrand() {
        this.dm.getUserLogged(this.cookieService.get('token')).then((user) => {
            this.brand = user;
        }).catch(error => {
        this.brand = null;
        });
    }

    loadColumnsEn(): void {
        this.columns = [
            { key: 'screen_name', title: 'Name', width: '15%' },
            { key: 'location', title: 'Location', width: '15%'},
            { key: 'description', title: 'Description', width: '25%'},
            { key: 'number_tweets', title: 'Tweets', width: '10%'},
            { key: 'number_followers', title: 'Followers', width: '10%' },
            { key: 'influence', title: 'Influence', width: '10%' },
            { key: '', title: 'Actions', width: '15%' }
        ];
    }

    loadColumnsEs(): void {
        this.columns = [
            { key: 'screen_name', title: 'Nombre', width: '15%' },
            { key: 'location', title: 'Ubicación', width: '15%'},
            { key: 'description', title: 'Descripción', width: '25%'},
            { key: 'number_tweets', title: 'Tuits', width: '10%'},
            { key: 'number_followers', title: 'Seguidores', width: '10%' },
            { key: 'influence', title: 'Influencia', width: '10%' },
            { key: '', title: 'Acciones', width: '15%' }
        ];
    }


    eventEmitted($event) {
        this.parseEvent($event);
      }

      private parseEvent(obj: EventObject) {
        if (obj.value.row !== undefined) {
            this.selected = obj.value.row.description;
        } else {
        if (obj.value.page === undefined ) {
            return;
        } else {
        // this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
        this.pagination.offset = obj.value.page;
        this.pagination = { ...this.pagination };
        const params = this.pagination.offset;
        this.getFollowers(params);
        }
    }
      }


    private getFollowers(page: Number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.listFollowers(this.selector, page).then((data: any) => {
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

    private onToolbarClick(): void {
        this.pagination.offset = 1;
        const params = this.pagination.offset;
       // this.pagination = { ...this.pagination };
        this.getFollowers(params);
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: 1});
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

    onDeleteEvent(id: number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        const currentPage = Number(this.table.apiEvent({
            type: API.getPaginationCurrentPage,
          }));
        this.dm.deleteFollower(id).then((data: any) => {
        this.getBrand();
        const numberItems = Number(this.table.apiEvent({type: API.getPaginationTotalItems}));
        console.log(numberItems);
        this.configuration.isLoading = false;
        if (numberItems % 15 === 1 && currentPage !== 1) {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage - 1});
        } else {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage});
        }
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.DELETE_FOLLOWER');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });

      }

      onEvaluateEvent(id: number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        const currentPage = Number(this.table.apiEvent({
            type: API.getPaginationCurrentPage,
          }));
        this.dm.evaluateFollower(id).then((data: any) => {
        this.getBrand();
        const numberItems = Number(this.table.apiEvent({type: API.getPaginationTotalItems}));
        console.log(numberItems);
        this.configuration.isLoading = false;
        if (numberItems % 15 === 1 && currentPage !== 1) {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage - 1});
        } else {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage});
        }
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.EVALUATE_2');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });

      }

    onLoadFollowersEvent(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.loadFollowers().then((data: any) => {
        this.getBrand();
        this.selector = 'new';
        this.getFollowers(1);
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: 1});
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
        if (data.status === 200) {
        const message = this.translateService.instant('SUCCESS.LOAD_2_NO_RESULTS');
        this.alertService.success(message, false);
        } else if (data.status === 201) {
        const message = this.translateService.instant('SUCCESS.LOAD_2');
        this.alertService.success(String(data.number_results).concat(message), false);
        }
        window.scroll(0, 0);
        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });

      }

      onEvaluateFollowersEvent(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.evaluateAllFollowers().then((data: any) => {
        this.getBrand();
        this.selector = 'evaluated';
        this.getFollowers(1);
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: 1});
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.EVALUATE_ALL_2');
        this.alertService.success(String(data.number_results).concat(message), false);
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


