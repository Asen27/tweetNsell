import { Component, OnInit } from '@angular/core';


import { UserProfile, ServiceIndustry, Brand} from '../../app.data.model';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    currentUser: Brand;
    users = [];


    ngOnInit() {
        this.currentUser = JSON.parse(localStorage.getItem('user:logged'));
    }


}
