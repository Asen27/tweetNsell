import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../services/alertService';
import { Router, ActivatedRoute } from '@angular/router';
import { DataManagement } from '../../../services/dataManagement';
import { Brand, Opinion } from 'src/app/app.data.model';


@Component({
    selector: 'app-opinion',
    templateUrl: './opinion.component.html',
    styleUrls: ['./opinion.component.scss'],
    animations: [routerTransition()]
})

export class OpinionComponent implements OnInit {
    public brand: Brand;
    public selector = 'all';
    public opinions: Opinion[] = [];


    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private dm: DataManagement,
        private router: Router,
        private route: ActivatedRoute
    ) {

        this.brand = JSON.parse(localStorage.getItem('user:logged'));


    }

    ngOnInit() {
        this.route.queryParams.subscribe(x => this.loadOpinions(this.selector, (x.page || 1)));
    }


    private loadOpinions(selector, page) {
        this.alertService.clear();
        this.dm.listOpinions(selector, page).then((data: any) => {
            this.opinions = data['results'];
        }).catch(error => {
            this.alertService.error(error);
        });
    }



    /*
        this.http.get<any>(`/api/items?page=${page}`).subscribe(x => {
            this.pager = x.pager;
            this.pageOfItems = x.pageOfItems;
        });
        */
    }


