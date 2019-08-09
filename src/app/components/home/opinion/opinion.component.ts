import { Component, OnInit, ChangeDetectorRef, ViewChild  } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { Router, ActivatedRoute } from '@angular/router';
import { DataManagement } from '../../../services/dataManagement';
import { Brand } from 'src/app/app.data.model';
import { ConfigService } from './configuration.service';
import { API, APIDefinition, Columns } from 'ngx-easy-table';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '../../../services/storageService';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'app-opinion',
    templateUrl: './opinion.component.html',
    styleUrls: ['./opinion.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})


export class OpinionComponent implements OnInit {
    public brand: Brand;
    public selector = 'all';
    @ViewChild('opinions', { static: true }) table: APIDefinition;
    public columns: Columns[] = [
    { key: 'publication_moment', title: '', width: '20%' },
    { key: 'author.name', title: '', width: '15%'},
    { key: 'text', title: '', width: '25%' },
    { key: 'number_favorites', title: '', width: '5%' },
    { key: 'number_retweets', title: '', width: '5%' },
    { key: 'attitude', title: '', width: '15%' },
    { key: '', title: '', width: '15%' } ];

    data = [];
    configuration;
    pagination = {
    limit: 10,
    offset: 0,
    count: 0,
  };
   closeResult: string;
   selected: string;
   language: string;


    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private router: Router,
        private route: ActivatedRoute,
        private readonly cdr: ChangeDetectorRef,
        private modalService: NgbModal,
        private storageService: StorageService,
        private cookieService: CookieService
    ) {

        this.language = this.translateService.currentLang;

    }

    ngOnInit() {
        this.getBrand();
        this.getOpinions(1);

        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.language = event.lang;
        });
    }

    getBrand() {
        this.dm.getUserLogged(this.cookieService.get('token')).then((user) => {
            this.brand = user;
        }).catch(error => {
        this.brand = null;
        });
    }

    eventEmitted($event) {
        this.parseEvent($event);
      }

      private parseEvent(obj: EventObject) {
        if (obj.value.row !== undefined) {
            this.selected = obj.value.row.text;
        } else {
        if (obj.value.page === undefined ) {
            return;
        } else {
        // this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
        this.pagination.offset = obj.value.page;
        this.pagination = { ...this.pagination };
        const params = this.pagination.offset;
        this.getOpinions(params);
        }
    }
      }

    private getOpinions(page: Number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.listOpinions(this.selector, page).then((data: any) => {
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
        this.getOpinions(params);
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
        this.dm.deleteOpinion(id).then((data: any) => {
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
        const message = this.translateService.instant('SUCCESS.DELETE_OPINION');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });


      }

    onPinEvent(id: number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        const currentPage = Number(this.table.apiEvent({
            type: API.getPaginationCurrentPage,
          }));
        this.dm.pinOpinion(id).then((data: any) => {
        this.configuration.isLoading = false;
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage});
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.PIN');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });


      }

      onUnpinEvent(id: number): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        const currentPage = Number(this.table.apiEvent({
            type: API.getPaginationCurrentPage,
          }));
        this.dm.unpinOpinion(id).then((data: any) => {
        const numberItems = Number(this.table.apiEvent({type: API.getPaginationTotalItems}));
        console.log(numberItems);
        this.configuration.isLoading = false;
        if (numberItems % 15 === 1 && currentPage !== 1) {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage - 1});
        } else {
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: currentPage});
        }
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.UNPIN');
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
        this.dm.evaluateOpinion(id).then((data: any) => {
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
        const message = this.translateService.instant('SUCCESS.EVALUATE');
        this.alertService.success(message, false);
        window.scroll(0, 0);

        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });


      }

      onLoadOpinionsEvent(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.loadOpinions().then((data: any) => {
        this.getBrand();
        this.selector = 'new';
        this.getOpinions(1);
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: 1});
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
        if (data.status === 200) {
        const message = this.translateService.instant('SUCCESS.LOAD_NO_RESULTS');
        this.alertService.success(message, false);
        } else if (data.status === 201) {
        const message = this.translateService.instant('SUCCESS.LOAD');
        this.alertService.success(String(data.number_results).concat(message), false);
        }
        window.scroll(0, 0);
        }).catch(error => {
            this.configuration.isLoading = false;
            this.alertService.error(error);
            window.scroll(0, 0);
        });
      }

      onEvaluateOpinionsEvent(): void {
        this.alertService.clear();
        this.configuration = ConfigService.config;
        this.configuration.isLoading = true;
        this.dm.evaluateAllOpinions().then((data: any) => {
        this.getBrand();
        this.selector = 'evaluated';
        this.getOpinions(1);
        this.table.apiEvent({type: API.setPaginationCurrentPage, value: 1});
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
        const message = this.translateService.instant('SUCCESS.EVALUATE_ALL');
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


