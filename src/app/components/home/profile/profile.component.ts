import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: [routerTransition()]
})

export class ProfileComponent implements OnInit {

    constructor(
        private translateService: TranslateService
    ) {

    }


    ngOnInit() {}
}
