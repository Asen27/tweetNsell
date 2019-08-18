import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DataManagement } from 'src/app/services/dataManagement';
import { ConfigService } from './configuration.service';
import { Columns } from 'ngx-easy-table';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()],
    providers: [ConfigService, DataManagement]
})
export class DashboardComponent implements OnInit {
    public avgOpinionsPerBrand: Number;
    public numBrands: Number;
    public avgRatingPerBrand: Number;

    public config1 = {
        animation: 'slide',
        format: '(,ddd).dd',
        theme: 'digital',
        value: 0,
        auto: true
    };

    public config2 = {
        animation: 'slide',
        format: '(,ddd)',
        theme: 'digital',
        value: 0,
        auto: true
    };

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };

    public positiveOpinions: number[];
    public negativeOpinions: number[];
    public neutralOpinions: number[];
    public barChartLabels: string[];
    public barChartType = 'bar';
    public barChartLegend = true;

    public barChartData: any[];

    public barChartColors: any[];
    public columns: Columns[];
    data = [];
    configuration;

    constructor(
        private translateService: TranslateService,
        private cookieService: CookieService,
        private dm: DataManagement
    ) {
        this.configuration = ConfigService.config;
    }

    ngOnInit() {
        if (
            this.cookieService.get('lang') === 'en' ||
            !this.cookieService.check('lang')
        ) {
            this.loadColumnsEn();
        } else {
            this.loadColumnsEs();
        }

        this.translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                const label1 = this.translateService.instant(
                    'DASHBOARD.POSITIVE_OPINIONS'
                );
                const label2 = this.translateService.instant(
                    'DASHBOARD.NEGATIVE_OPINIONS'
                );
                const label3 = this.translateService.instant(
                    'DASHBOARD.NEUTRAL_OPINIONS'
                );
                const dataset1 = { data: this.positiveOpinions, label: label1 };
                const dataset2 = { data: this.negativeOpinions, label: label2 };
                const dataset3 = { data: this.neutralOpinions, label: label3 };
                this.barChartData = [dataset1, dataset2, dataset3];
                if (event.lang === 'en') {
                    this.loadColumnsEn();
                } else {
                    this.loadColumnsEs();
                }
            }
        );

        this.getData();
    }

    loadColumnsEn(): void {
        this.columns = [
            { key: '', title: '#', width: '5%' },
            { key: 'name', title: 'Name', width: '25%' },
            { key: 'location', title: 'Location', width: '20%' },
            { key: 'number_tweets', title: 'Tweets', width: '20%' },
            { key: 'number_followers', title: 'Followers', width: '20%' },
            { key: 'influence', title: 'Influence', width: '10%' }
        ];
    }

    loadColumnsEs(): void {
        this.columns = [
            { key: '', title: '#', width: '5%' },
            { key: 'name', title: 'Nombre', width: '25%' },
            { key: 'location', title: 'Ubicación', width: '20%' },
            { key: 'number_tweets', title: 'Tuits', width: '20%' },
            { key: 'number_followers', title: 'Seguidores', width: '20%' },
            { key: 'influence', title: 'Influencia', width: '10%' }
        ];
    }

    getData() {
        this.dm
            .getDashboardData()
            .then(stats => {
                this.numBrands = stats['number_brands'];
                this.avgOpinionsPerBrand = stats['opinions_per_brand'];
                this.avgRatingPerBrand = stats['total_rating_per_brand'];
                this.barChartLabels = stats['labels'];
                this.positiveOpinions = stats['positive_opinions'];
                this.negativeOpinions = stats['negative_opinions'];
                this.neutralOpinions = stats['neutral_opinions'];
                const label1 = this.translateService.instant(
                    'DASHBOARD.POSITIVE_OPINIONS'
                );
                const label2 = this.translateService.instant(
                    'DASHBOARD.NEGATIVE_OPINIONS'
                );
                const label3 = this.translateService.instant(
                    'DASHBOARD.NEUTRAL_OPINIONS'
                );
                const dataset1 = { data: this.positiveOpinions, label: label1 };
                const dataset2 = { data: this.negativeOpinions, label: label2 };
                const dataset3 = { data: this.neutralOpinions, label: label3 };
                this.barChartData = [dataset1, dataset2, dataset3];
                this.barChartColors = [
                    {
                        backgroundColor: [
                            'rgba(42, 167, 65, 0.6)',
                            'rgba(42, 167, 65, 0.6)',
                            'rgba(42, 167, 65, 0.6)',
                            'rgba(42, 167, 65, 0.6)',
                            'rgba(42, 167, 65, 0.6)'
                        ]
                    },
                    {
                        backgroundColor: [
                            'rgba(213, 58, 56, 0.6)',
                            'rgba(213, 58, 56, 0.6)',
                            'rgba(213, 58, 56, 0.6)',
                            'rgba(213, 58, 56, 0.6)',
                            'rgba(213, 58, 56, 0.6)'
                        ]
                    },
                    {
                        backgroundColor: [
                            'rgba(20, 163, 196, 0.6)',
                            'rgba(20, 163, 196, 0.6)',
                            'rgba(20, 163, 196, 0.6)',
                            'rgba(20, 163, 196, 0.6)',
                            'rgba(20, 163, 196, 0.6)'
                        ]
                    }
                ];
                this.data = stats['top_influencers'];
            })
            .catch(error => {
                this.numBrands = null;
                this.avgOpinionsPerBrand = null;
                this.avgRatingPerBrand = null;
                this.positiveOpinions = null;
                this.negativeOpinions = null;
                this.neutralOpinions = null;
                this.barChartData = null;
                this.barChartLabels = null;
                this.barChartColors = null;
                this.data = [];
            });
    }
}
