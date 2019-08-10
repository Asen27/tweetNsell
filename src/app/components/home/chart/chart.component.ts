import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DataManagement } from 'src/app/services/dataManagement';
import { Brand } from 'src/app/app.data.model';


@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    animations: [routerTransition()]
})

export class ChartComponent implements OnInit {
    public brand: Brand;
    public totalNumberOpinions: Number;
    public pieChartLabels: string[];
    public pieChartData: Number[];
    public pieChartType = 'pie';
    public pieChartColors: Array<any>;
    public doughnutChartLabels: string[];
    public doughnutChartData: Number[];
    public doughnutChartType = 'doughnut';
    public doughnutChartColors: Array<any>;
    public config = {
        animation: 'slide',
        format: '(,ddd)',
        theme: 'digital',
        value: 0,
        auto: true,
    };



    constructor(
        private translateService: TranslateService,
        private cookieService: CookieService,
        private dm: DataManagement
    ) {


    }

    ngOnInit() {
        this.getBrand();


        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.getBrand();
        });
    }

    getBrand() {
        this.dm.getUserLogged(this.cookieService.get('token')).then((user) => {
            this.brand = user;
            this.loadPieChart();
            this.loadDoughnutChart();
        }).catch(error => {
        this.brand = null;
        });
    }

    loadPieChart() {
        const numberEvaluatedOpinions: Number =
        this.brand.social_rating.positive + this.brand.social_rating.negative + this.brand.social_rating.neutral;

        const numberNewOpinions: Number = this.brand.number_new_opinions;

        const label1: string = this.translateService.instant('OPINION.EVALUATED');
        const label2: string = this.translateService.instant('OPINION.NEW');

        this.totalNumberOpinions = numberEvaluatedOpinions.valueOf() + numberNewOpinions.valueOf();
        this.pieChartData = [numberEvaluatedOpinions, numberNewOpinions];
        this.pieChartLabels = [label1, label2];
        this.pieChartColors = [{backgroundColor: ['rgba(134, 143, 151, 0.6)', 'rgba(3, 122, 255, 0.6)']}];
    }

    loadDoughnutChart() {
        const numberPositiveOpinions: Number = this.brand.social_rating.positive;
        const numberNegativeOpinions: Number = this.brand.social_rating.negative;
        const numberNeutralOpinions: Number = this.brand.social_rating.neutral;



        const label1: string = this.translateService.instant('OPINION.POSITIVE');
        const label2: string = this.translateService.instant('OPINION.NEGATIVE');
        const label3: string = this.translateService.instant('OPINION.NEUTRAL');


        this.doughnutChartData = [numberPositiveOpinions, numberNegativeOpinions, numberNeutralOpinions];
        this.doughnutChartLabels = [label1, label2, label3];
        this.doughnutChartColors = [{backgroundColor: ['rgba(42, 167, 65, 0.6)', 'rgba(213, 58, 56, 0.6)', 'rgba(20, 163, 196, 0.6)']}];
    }
}
