import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-industry',
    templateUrl: './industry.component.html',
    styleUrls: ['./industry.component.scss'],
    animations: [routerTransition()]
})

export class IndustryComponent implements OnInit {

    constructor(
        private translateService: TranslateService
    ) {

    }


    ngOnInit() {}
}
