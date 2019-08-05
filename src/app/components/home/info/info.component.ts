import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
    animations: [routerTransition()]
})

export class InfoComponent implements OnInit {

    constructor(
        private translateService: TranslateService
    ) {

    }


    ngOnInit() {}
}
